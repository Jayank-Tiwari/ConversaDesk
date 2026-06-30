import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, formatTimeAgo, getInitials, truncateText } from '../../utils/helpers';
import { ArrowUpRight, Mail, MailOpen } from 'lucide-react';

export default function RecentEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch(`${API_BASE}/all-emails`);
        if (res.ok) {
          const data = await res.json();
          setEmails(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (error) {
        console.error('Failed to fetch recent emails:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'new') return 'badge-info';
    if (s === 'processed') return 'badge-warning';
    if (s === 'replied') return 'badge-success';
    return 'badge-neutral';
  };

  return (
    <>
      <style>{`
        .email-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        .email-item {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .email-item:hover {
          background: var(--color-bg-hover);
        }
        .email-content {
          flex: 1;
          min-width: 0;
        }
        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }
        .email-sender {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .email-date {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          white-space: nowrap;
        }
        .email-subject {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .email-snippet {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: var(--space-xs);
        }
      `}</style>
      <div className="card h-full flex-col">
        <div className="flex justify-between items-center mb-md">
          <div className="flex items-center gap-sm">
            <Mail size={20} className="text-info" />
            <h3 className="section-title" style={{ margin: 0 }}>Recent Emails</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/mails')}>
            View All <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="email-list flex-1">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="email-item">
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }}></div>
                <div className="flex-1">
                  <div className="skeleton mb-xs" style={{ height: 14, width: '40%' }}></div>
                  <div className="skeleton" style={{ height: 12, width: '80%' }}></div>
                </div>
              </div>
            ))
          ) : emails.length === 0 ? (
            <div className="empty-state h-full">
              <MailOpen size={32} />
              <p>Inbox is clear</p>
            </div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="email-item" onClick={() => navigate('/mails')}>
                <div className="avatar">{getInitials(email.sender || email.customer_email)}</div>
                <div className="email-content">
                  <div className="email-header">
                    <div className="email-sender">{email.sender || email.customer_email}</div>
                    <div className="email-date">{formatTimeAgo(email.created_at)}</div>
                  </div>
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-snippet">{truncateText(email.body, 60)}</div>
                  <div className="flex items-center gap-sm mt-xs">
                    <span className={`badge ${getStatusBadge(email.status)}`}>{email.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}