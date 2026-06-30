import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/helpers';
import { Ticket, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

export default function StatsCards() {
  const [stats, setStats] = useState({ total_tickets: 0, open_tickets: 0, critical_tickets: 0, resolved_tickets: 0 });
  const [loading, setLoading] = useState(true);

  const { lastMessage } = useWebSocket();

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'NEW_TICKET') {
      fetchStats();
    }
  }, [lastMessage]);

  const cards = [
    { label: 'Total Tickets', value: stats.totalTickets || stats.total_tickets || 0, icon: Ticket, color: 'var(--color-accent)', bgColor: 'var(--color-accent-subtle)', trend: '', isUp: true },
    { label: 'Open Tickets', value: stats.openTickets || stats.open_tickets || 0, icon: Clock, color: 'var(--color-info)', bgColor: 'var(--color-info-subtle)', trend: '', isUp: false },
    { label: 'Critical Issues', value: stats.criticalTickets || stats.critical_tickets || 0, icon: AlertCircle, color: 'var(--color-danger)', bgColor: 'var(--color-danger-subtle)', trend: '', isUp: false },
    { label: 'Resolved', value: stats.resolvedTickets || stats.resolved_tickets || 0, icon: CheckCircle, color: 'var(--color-success)', bgColor: 'var(--color-success-subtle)', trend: '', isUp: true }
  ];

  if (loading) {
    return (
      <div className="grid grid-4 gap-lg">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card skeleton" style={{ height: '140px' }}></div>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .stat-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 4px 8px;
          border-radius: var(--radius-full);
        }
        .trend-up {
          color: var(--color-success);
          background: var(--color-success-subtle);
        }
        .trend-down {
          color: var(--color-danger);
          background: var(--color-danger-subtle);
        }
        .stat-body {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.2;
        }
        .stat-label {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
      `}</style>
      <div className="grid grid-4 gap-lg">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card stat-card card-interactive animate-slideUp" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: card.bgColor, color: card.color }}>
                  <Icon size={20} />
                </div>
                {card.trend && (
                  <div className={`stat-trend ${card.isUp ? 'trend-up' : 'trend-down'}`}>
                    {card.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {card.trend}
                  </div>
                )}
              </div>
              <div className="stat-body">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
