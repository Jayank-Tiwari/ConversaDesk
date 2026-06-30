import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { 
  LayoutDashboard, Ticket, MessageSquare, Mail, BarChart3, Settings, 
  ChevronLeft, ChevronRight, LogOut, Zap 
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'MAIN',
      items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
    },
    {
      label: 'SUPPORT',
      items: [
        { path: '/tickets', label: 'Tickets', icon: Ticket },
        { path: '/chat', label: 'AI Chat', icon: MessageSquare },
        { path: '/mails', label: 'Emails', icon: Mail }
      ]
    },
    {
      label: 'INSIGHTS',
      items: [{ path: '/analytics', label: 'Analytics', icon: BarChart3 }]
    },
    {
      label: 'SYSTEM',
      items: [{ path: '/settings', label: 'Settings', icon: Settings }]
    }
  ];

  return (
    <>
      <style>{`
        .sidebar-container {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid var(--color-border-subtle);
          height: 100vh;
          display: flex;
          flex-direction: column;
          transition: width var(--transition-base);
          overflow: hidden;
        }
        .sidebar-container.expanded { width: 260px; }
        .sidebar-container.collapsed { width: 72px; }
        .sidebar-header {
          padding: var(--space-lg) var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          min-height: 80px;
        }
        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .brand-text {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-text-primary);
          white-space: nowrap;
          opacity: 1;
          transition: opacity var(--transition-fast);
        }
        .collapsed .brand-text {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 var(--space-md);
        }
        .nav-group { margin-bottom: var(--space-lg); }
        .nav-group-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-tertiary);
          margin-bottom: var(--space-sm);
          padding-left: var(--space-sm);
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .collapsed .nav-group-label { display: none; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          width: 100%;
          padding: 10px var(--space-sm);
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          margin-bottom: var(--space-xs);
          position: relative;
        }
        .nav-item:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-hover);
        }
        .nav-item.active {
          color: var(--color-text-primary);
          background: var(--color-accent-subtle);
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: var(--color-accent);
          border-radius: 0 4px 4px 0;
        }
        .nav-icon { flex-shrink: 0; }
        .nav-label {
          font-size: var(--text-sm);
          font-weight: 500;
          white-space: nowrap;
        }
        .collapsed .nav-label { display: none; }
        .sidebar-footer {
          padding: var(--space-md);
          border-top: 1px solid var(--color-border-subtle);
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          background: var(--color-bg-tertiary);
          margin-bottom: var(--space-sm);
        }
        .user-info {
          flex: 1;
          min-width: 0;
        }
        .collapsed .user-info { display: none; }
        .user-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-role {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          text-transform: capitalize;
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: 10px;
          border: none;
          background: transparent;
          color: var(--color-danger);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .logout-btn:hover { background: var(--color-danger-subtle); }
        .toggle-btn {
          position: absolute;
          top: 24px;
          right: -12px;
          width: 24px;
          height: 24px;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          z-index: 10;
        }
        .toggle-btn:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-tertiary);
        }
      `}</style>
      <div className={`sidebar-container ${collapsed ? 'collapsed' : 'expanded'}`} style={{ position: 'relative' }}>
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="sidebar-header">
          <div className="brand-icon">
            <Zap size={20} />
          </div>
          <div className="brand-text">ConversaDesk</div>
        </div>

        <div className="sidebar-nav">
          {navGroups.map((group, idx) => (
            <div key={idx} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={itemIdx}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile" title={collapsed ? user.name : undefined}>
              <div className="avatar avatar-sm">{getInitials(user.name)}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={20} className="nav-icon" />
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}