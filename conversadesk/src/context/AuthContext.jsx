import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../utils/helpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore auth state from localStorage
    try {
      const stored = localStorage.getItem('conversadesk_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      localStorage.removeItem('conversadesk_user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid credentials');
    }

    const data = await res.json();
    const userData = {
      name: data.name || data.full_name || 'User',
      email: email,
      role: data.role || 'employee',
    };
    setUser(userData);
    localStorage.setItem('conversadesk_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('conversadesk_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
