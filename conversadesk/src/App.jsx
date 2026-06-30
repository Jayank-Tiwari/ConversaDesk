import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Zap } from 'lucide-react';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import CommandPalette from './components/layout/CommandPalette';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MailsPage from './pages/MailsPage';
import SettingsPage from './pages/SettingsPage';

import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">
          <Zap size={24} />
        </div>
        <div className="app-loading-text">ConversaDesk</div>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-layout">
      <div className="app-sidebar">
        <Sidebar />
      </div>
      <div className="app-main">
        <div className="app-navbar">
          <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
        </div>
        <div className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ height: '100%' }}
            >
              <Routes location={location}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/mails" element={<MailsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">
          <Zap size={24} />
        </div>
        <div className="app-loading-text">ConversaDesk</div>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#F9FAFB' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#F9FAFB' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
