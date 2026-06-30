import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-bg-primary);
          position: relative;
          overflow: hidden;
        }
        .bg-blobs {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        .blob {
          position: absolute;
          filter: blur(80px);
          border-radius: 50%;
          opacity: 0.4;
          animation: float 10s infinite ease-in-out alternate;
        }
        .blob-1 {
          top: -10%; left: -10%; width: 500px; height: 500px;
          background: rgba(139, 92, 246, 0.3); /* violet */
        }
        .blob-2 {
          bottom: -10%; right: -10%; width: 600px; height: 600px;
          background: rgba(6, 182, 212, 0.2); /* cyan */
          animation-delay: -5s;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: var(--space-2xl);
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl), 0 0 40px rgba(139, 92, 246, 0.1);
          z-index: 1;
        }
        .login-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        .brand-logo {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-md);
          color: white;
          box-shadow: var(--shadow-glow);
        }
        .brand-title {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: white;
          margin-bottom: var(--space-xs);
        }
        .brand-subtitle {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
        }
        .input-group {
          position: relative;
          margin-bottom: var(--space-lg);
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 14px 14px 14px 44px;
          color: white;
          font-size: var(--text-base);
          transition: all var(--transition-fast);
        }
        .login-input:focus {
          outline: none;
          border-color: var(--color-accent);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 0 3px var(--color-accent-subtle);
        }
        .pwd-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
        }
        .pwd-toggle:hover {
          color: var(--color-text-secondary);
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-top: var(--space-md);
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: var(--shadow-glow);
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.5s;
        }
      `}</style>
      <div className="login-page">
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        
        <motion.div 
          className={`login-card ${errorShake ? 'shake' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-header">
            <div className="brand-logo">
              <Zap size={28} />
            </div>
            <h1 className="brand-title">ConversaDesk</h1>
            <p className="brand-subtitle">AI-Powered Customer Intelligence</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="login-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}