import React, { useState, useEffect } from 'react';
import { API_BASE, formatTimeAgo, getInitials } from '../utils/helpers';
import { Mail, RefreshCw, Zap, Search, Star, Archive, Trash2, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/all-emails`);
      if (res.ok) {
        const data = await res.json();
        setEmails(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleRefresh = async () => {
    const tid = toast.loading('Fetching latest emails...');
    try {
      await fetch(`${API_BASE}/save-emails`);
      await fetchEmails();
      toast.success('Emails synchronized', { id: tid });
    } catch (e) {
      toast.error('Sync failed', { id: tid });
    }
  };

  const handleProcessAI = async () => {
    const tid = toast.loading('AI processing emails...');
    try {
      await fetch(`${API_BASE}/process-ai-emails`);
      await fetchEmails();
      toast.success('AI processing complete', { id: tid });
    } catch (e) {
      toast.error('Processing failed', { id: tid });
    }
  };

  return (
    <>
      <style>{`
        .mail-layout {
          display: flex;
          height: calc(100vh - 120px);
          gap: var(--space-md);
        }
        .mail-list-panel {
          width: 380px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mail-content-panel {
          flex: 1;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mail-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
          background: rgba(11, 15, 26, 0.4);
        }
        .mail-search {
          padding: var(--space-sm) var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .mail-list {
          flex: 1;
          overflow-y: auto;
        }
        .mail-item {
          padding: var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .mail-item:hover {
          background: var(--color-bg-hover);
        }
        .mail-item.active {
          background: var(--color-accent-subtle);
          border-left: 3px solid var(--color-accent);
        }
        .mail-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .mail-item-sender {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mail-item-date {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .mail-item-subject {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .mail-item-snippet {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mail-reader {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-2xl);
        }
        .mail-reader-header {
          margin-bottom: var(--space-xl);
        }
        .mail-reader-subject {
          font-size: var(--text-2xl);
          font-weight: 700;
          margin-bottom: var(--space-lg);
          color: var(--color-text-primary);
        }
        .mail-reader-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mail-reader-body {
          font-size: var(--text-md);
          line-height: 1.6;
          color: var(--color-text-secondary);
          white-space: pre-wrap;
        }
        .ai-draft-panel {
          margin-top: var(--space-2xl);
          padding: var(--space-lg);
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid var(--color-border-accent);
          border-radius: var(--radius-md);
        }
      `}</style>
      <div className="page" style={{ paddingBottom: 0 }}>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-xl font-bold">Email Inbox</h2>
          <div className="flex gap-sm">
            <button className="btn btn-secondary" onClick={handleRefresh}>
              <RefreshCw size={16} /> Sync Gmail
            </button>
            <button className="btn btn-primary" onClick={handleProcessAI} style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))' }}>
              <Zap size={16} /> Process with AI
            </button>
          </div>
        </div>

        <div className="mail-layout">
          <div className="mail-list-panel">
            <div className="mail-search">
              <div className="input-with-icon">
                <Search size={16} className="text-tertiary" />
                <input type="text" className="input bg-elevated" placeholder="Search emails..." />
              </div>
            </div>
            <div className="mail-list">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="p-md border-b border-subtle">
                    <div className="skeleton mb-xs" style={{ height: '16px', width: '50%' }}></div>
                    <div className="skeleton mb-xs" style={{ height: '14px', width: '80%' }}></div>
                    <div className="skeleton" style={{ height: '12px', width: '100%' }}></div>
                  </div>
                ))
              ) : emails.length === 0 ? (
                <div className="empty-state py-2xl">
                  <Mail size={32} />
                  <p>Inbox empty</p>
                </div>
              ) : (
                emails.map(email => (
                  <div 
                    key={email.id} 
                    className={`mail-item ${selectedEmail?.id === email.id ? 'active' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="mail-item-header">
                      <div className="mail-item-sender">{email.sender || email.customer_email}</div>
                      <div className="mail-item-date">{formatTimeAgo(email.created_at)}</div>
                    </div>
                    <div className="mail-item-subject">{email.subject}</div>
                    <div className="mail-item-snippet">{email.body}</div>
                    {(email.sentiment || email.status === 'Processed') && (
                      <div className="mt-xs">
                        <span className="badge badge-accent badge-sm"><Zap size={10} style={{marginRight:2}}/> AI Processed</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mail-content-panel">
            {selectedEmail ? (
              <>
                <div className="mail-toolbar">
                  <div className="flex gap-sm">
                    <button className="btn-icon"><Archive size={18} /></button>
                    <button className="btn-icon"><Trash2 size={18} /></button>
                  </div>
                  <div className="flex gap-sm">
                    <button className="btn btn-secondary btn-sm"><Send size={14} /> Reply</button>
                  </div>
                </div>
                <div className="mail-reader">
                  <div className="mail-reader-header">
                    <h1 className="mail-reader-subject">{selectedEmail.subject}</h1>
                    <div className="mail-reader-meta">
                      <div className="flex items-center gap-md">
                        <div className="avatar">{getInitials(selectedEmail.sender || selectedEmail.customer_email)}</div>
                        <div>
                          <div className="font-semibold text-primary">{selectedEmail.sender || selectedEmail.customer_email}</div>
                          <div className="text-xs text-tertiary">to me</div>
                        </div>
                      </div>
                      <div className="text-sm text-tertiary">{new Date(selectedEmail.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mail-reader-body">
                    {selectedEmail.body}
                  </div>

                  {selectedEmail.ai_reply && (
                    <div className="ai-draft-panel">
                      <div className="flex items-center gap-sm mb-md text-accent font-semibold">
                        <Sparkles size={18} /> AI Drafted Reply
                        <span className="badge badge-neutral ml-auto">Sentiment: {selectedEmail.sentiment}</span>
                      </div>
                      <div className="bg-elevated p-md rounded border border-subtle text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedEmail.ai_reply}
                      </div>
                      <div className="flex justify-end gap-sm mt-md">
                        <button className="btn btn-secondary btn-sm">Edit</button>
                        <button className="btn btn-primary btn-sm"><Send size={14} /> Send Draft</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state h-full">
                <Mail size={48} className="text-tertiary mb-md" />
                <h3>Select an email</h3>
                <p>Choose an email from the list to read it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}