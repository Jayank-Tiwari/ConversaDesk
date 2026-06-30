import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getInitials } from '../utils/helpers';
import { Settings, User, Bell, Shield, Database, Sparkles, Check, Server } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'ai');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const handleBuildKB = async () => {
    setLoading(true);
    const tid = toast.loading('Building Knowledge Base from support emails...');
    try {
      const res = await fetch(`${API_BASE}/build-rag`);
      if (res.ok) {
        toast.success('Knowledge Base built successfully!', { id: tid });
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      toast.error('Failed to build Knowledge Base', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Configuration', icon: Sparkles },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <>
      <style>{`
        .settings-layout {
          display: flex;
          gap: var(--space-xl);
          align-items: flex-start;
        }
        .settings-nav {
          width: 240px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }
        .settings-tab {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          background: transparent;
          text-align: left;
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .settings-tab:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }
        .settings-tab.active {
          background: var(--color-accent-subtle);
          color: var(--color-accent);
        }
        .settings-content {
          flex: 1;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
        }
        .settings-section-title {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .form-group {
          margin-bottom: var(--space-lg);
        }
        .form-label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-xs);
        }
        .ai-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05));
          border: 1px solid var(--color-border-accent);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }
      `}</style>
      <div className="page">
        <div className="mb-lg">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="text-secondary text-sm">Manage your account and workspace preferences</p>
        </div>

        <div className="settings-layout">
          <div className="settings-nav">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="settings-content">
            {activeTab === 'ai' && (
              <div className="animate-slideUp">
                <h3 className="settings-section-title flex items-center gap-sm">
                  <Sparkles size={20} className="text-accent" /> AI Configuration
                </h3>
                
                <div className="ai-card">
                  <h4 className="font-semibold text-md mb-xs">RAG Knowledge Base</h4>
                  <p className="text-sm text-secondary mb-md">
                    The knowledge base empowers the AI agent to answer support queries accurately based on historical emails and resolutions.
                  </p>
                  <div className="flex items-center justify-between bg-elevated p-md rounded border border-subtle">
                    <div className="flex items-center gap-md">
                      <div className="bg-success-subtle text-success p-sm rounded-full"><Check size={20} /></div>
                      <div>
                        <div className="font-semibold">Vector Database Status</div>
                        <div className="text-xs text-secondary">ChromaDB running locally</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleBuildKB}
                      disabled={loading}
                    >
                      {loading ? 'Building...' : 'Rebuild Knowledge Base'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">AI Model Preference</label>
                  <select className="select">
                    <option>Azure OpenAI - GPT-4o (Default)</option>
                    <option>Azure OpenAI - GPT-3.5 Turbo</option>
                  </select>
                  <p className="text-xs text-tertiary mt-xs">Used for email summarization, sentiment analysis, and the chat agent.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Auto-Reply Confidence Threshold</label>
                  <input type="range" min="0" max="100" defaultValue="85" style={{ width: '100%' }} />
                  <div className="flex justify-between text-xs text-tertiary mt-xs">
                    <span>Conservative (95%)</span>
                    <span>Aggressive (70%)</span>
                  </div>
                </div>
                
                <div className="mt-xl flex justify-end">
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="animate-slideUp">
                <h3 className="settings-section-title">General Settings</h3>
                <div className="form-group">
                  <label className="form-label">Workspace Name</label>
                  <input type="text" className="input" defaultValue="ConversaDesk Demo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="select">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>America/New_York (EST)</option>
                    <option>America/Los_Angeles (PST)</option>
                  </select>
                </div>
                <div className="mt-xl flex justify-end">
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            )}
            
            {activeTab === 'database' && (
              <div className="animate-slideUp">
                <h3 className="settings-section-title flex items-center gap-sm">
                  <Database size={20} className="text-info" /> SQL Agent Configuration
                </h3>
                <p className="text-sm text-secondary mb-lg">
                  The LangChain SQL Agent allows the AI to execute read-only queries against your PostgreSQL database to answer analytical questions.
                </p>
                <div className="bg-elevated p-md rounded border border-subtle mb-md flex items-center gap-md">
                   <Server size={24} className="text-tertiary" />
                   <div>
                     <div className="font-semibold text-sm">PostgreSQL Connection</div>
                     <div className="text-xs text-secondary font-mono">postgresql://user:***@localhost:5432/db</div>
                   </div>
                   <div className="ml-auto badge badge-success badge-dot">Connected</div>
                </div>
              </div>
            )}
            
            
            {activeTab === 'profile' && (
              <div className="animate-slideUp">
                <h3 className="settings-section-title flex items-center gap-sm">
                  <User size={20} className="text-info" /> Profile Details
                </h3>
                
                <div className="flex items-center gap-lg mb-xl mt-md">
                  <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl">{user?.name}</h4>
                    <p className="text-secondary">{user?.email}</p>
                    <span className="badge badge-primary mt-sm" style={{ textTransform: 'capitalize' }}>
                      {user?.role || 'Employee'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="input bg-elevated" defaultValue={user?.name} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="input bg-elevated" defaultValue={user?.email} disabled />
                  <p className="text-xs text-tertiary mt-xs">Contact your administrator to change your email address.</p>
                </div>
                
                <div className="mt-xl flex justify-end">
                  <button className="btn btn-primary">Update Profile</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-slideUp empty-state py-2xl">
                <Settings size={48} className="text-tertiary mb-md" />
                <h3>Under Construction</h3>
                <p>This settings pane is currently being built.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}