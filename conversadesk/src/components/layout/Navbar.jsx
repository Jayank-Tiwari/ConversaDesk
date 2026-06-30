import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useKB } from '../../context/KBContext';
import { API_BASE, getInitials, formatTimeAgo, getPriorityColor } from '../../utils/helpers';
import { Search, Bell, ChevronDown, LogOut, User, Clock, Command, Settings, FileText } from 'lucide-react';
import KBDraftsModal from '../tickets/KBDraftsModal';

export default function Navbar({ onOpenCommandPalette }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { kbDrafts } = useKB();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showKBDrafts, setShowKBDrafts] = useState(false);
  const [time, setTime] = useState(new Date());
  
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/tickets')) return 'Tickets';
    if (path.startsWith('/chat')) return 'AI Chat';
    if (path.startsWith('/mails')) return 'Emails';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/settings')) return 'Settings';
    return 'ConversaDesk';
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`${API_BASE}/recent-tickets`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .navbar {
          background: rgba(11, 15, 26, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border-subtle);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-lg);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
        }
        .nav-left {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }
        .page-title {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .search-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 240px;
        }
        .search-trigger:hover {
          border-color: var(--color-border-accent);
          color: var(--color-text-primary);
        }
        .shortcut {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--color-bg-elevated);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: var(--text-xs);
          font-family: var(--font-mono);
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .time-display {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
        }
        .action-btn {
          position: relative;
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .action-btn:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-hover);
        }
        .notif-dropdown {
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          padding: 0;
        }
        .notif-header {
          padding: var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
          font-weight: 600;
        }
        .notif-item {
          padding: var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          transition: background var(--transition-fast);
          cursor: pointer;
        }
        .notif-item:hover {
          background: var(--color-bg-hover);
        }
        .notif-title {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text-primary);
        }
        .notif-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
        .empty-notifs {
          padding: var(--space-lg);
          text-align: center;
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
        }
        .user-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-text-primary);
        }
      `}</style>
      <div className="navbar">
        <div className="nav-left">
          <h1 className="page-title">{getPageTitle()}</h1>
          <button className="search-trigger" onClick={onOpenCommandPalette}>
            <Search size={16} />
            <span>Search...</span>
            <span className="shortcut"><Command size={12} />K</span>
          </button>
        </div>
        
        <div className="nav-right">
          <div className="time-display">
            <Clock size={14} />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <button className="action-btn" onClick={() => setShowKBDrafts(true)}>
            <FileText size={20} />
            {kbDrafts.length > 0 && (
              <span className="notification-dot bg-success text-white">{kbDrafts.length}</span>
            )}
          </button>
          
          <div className="relative" ref={notifRef}>
            <button className="action-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="notification-dot">{notifications.length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="dropdown notif-dropdown">
                <div className="notif-header">Notifications</div>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-title">{n.summary || n.title || 'New Ticket'}</div>
                      <div className="notif-meta">
                        <span className={`badge badge-${getPriorityColor(n.priority)}`}>{n.priority}</span>
                        <span>{formatTimeAgo(n.created_date || n.created_at)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-notifs">No new notifications</div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
              <ChevronDown size={16} className="text-secondary" />
            </button>
            {showUserMenu && (
              <div className="dropdown" style={{ minWidth: '180px' }}>
                <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px' }}>{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/settings', { state: { tab: 'profile' } });
                    setShowUserMenu(false);
                  }}
                >
                  <User size={16} /> Profile
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }} 
                  style={{ color: 'var(--color-danger)' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showKBDrafts && <KBDraftsModal onClose={() => setShowKBDrafts(false)} />}
    </>
  );
}