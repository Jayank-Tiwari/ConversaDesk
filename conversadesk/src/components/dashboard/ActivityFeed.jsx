import React, { useState, useEffect } from 'react';
import { API_BASE, formatTimeAgo } from '../../utils/helpers';
import { Activity, Ticket, Mail, Bot, CheckCircle } from 'lucide-react';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const [ticketsRes, emailsRes] = await Promise.all([
          fetch(`${API_BASE}/recent-tickets`),
          fetch(`${API_BASE}/all-emails`)
        ]);

        let timeline = [];

        if (ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          if (Array.isArray(tickets)) {
            tickets.forEach(t => {
              timeline.push({
                id: `t_${t.id}`,
                type: t.status === 'resolved' ? 'ticket_resolved' : 'ticket_created',
                title: t.status === 'resolved' ? `Ticket Resolved: ${t.ticket_code}` : `New Ticket: ${t.ticket_code}`,
                desc: t.summary || t.subject || 'Ticket needs attention',
                date: new Date(t.resolved_at || t.created_date || t.created_at),
                icon: t.status === 'resolved' ? CheckCircle : Ticket,
                color: t.status === 'resolved' ? 'var(--color-success)' : 'var(--color-info)'
              });
            });
          }
        }

        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          if (Array.isArray(emails)) {
            emails.forEach(e => {
              timeline.push({
                id: `e_${e.id}`,
                type: 'email_received',
                title: `Email from ${e.sender.split('@')[0]}`,
                desc: e.subject,
                date: new Date(e.created_at),
                icon: Mail,
                color: 'var(--color-warning)'
              });
              if (e.status === 'Processed' || e.ai_reply) {
                timeline.push({
                  id: `e_ai_${e.id}`,
                  type: 'ai_processed',
                  title: 'AI processed email',
                  desc: `Analyzed sentiment and drafted reply for ${e.subject}`,
                  date: new Date(new Date(e.created_at).getTime() + 1000), // Slightly after
                  icon: Bot,
                  color: 'var(--color-accent)'
                });
              }
            });
          }
        }

        timeline.sort((a, b) => b.date - a.date);
        setActivities(timeline.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch activity feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  return (
    <>
      <style>{`
        .timeline {
          position: relative;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          margin-top: var(--space-md);
          max-height: 300px;
          overflow-y: auto;
          padding-right: 10px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-border);
          border-radius: var(--radius-full);
        }
        .timeline-item {
          position: relative;
        }
        .timeline-icon {
          position: absolute;
          left: -20px;
          top: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          border: 2px solid var(--color-bg-primary);
          transform: translateX(-50%);
          z-index: 2;
        }
        .timeline-content {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          margin-left: var(--space-sm);
        }
        .timeline-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .timeline-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .timeline-time {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .timeline-desc {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
      `}</style>
      <div className="card h-full flex-col">
        <div className="flex items-center gap-sm mb-md">
          <Activity size={20} className="text-success" />
          <h3 className="section-title" style={{ margin: 0 }}>Activity Feed</h3>
        </div>

        <div className="flex-1 overflow-auto pr-sm">
          {loading ? (
            <div className="timeline">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-icon skeleton"></div>
                  <div className="timeline-content">
                    <div className="skeleton mb-xs" style={{ height: 16, width: '60%' }}></div>
                    <div className="skeleton" style={{ height: 12, width: '90%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="empty-state">
              <Activity size={32} />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="timeline">
              {activities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="timeline-item animate-slideUp" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="timeline-icon" style={{ color: act.color, borderColor: act.color }}>
                      <Icon size={14} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="timeline-title">{act.title}</div>
                        <div className="timeline-time">{formatTimeAgo(act.date)}</div>
                      </div>
                      <div className="timeline-desc">{act.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
