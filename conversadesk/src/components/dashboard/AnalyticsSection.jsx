import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export default function AnalyticsSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard-analytics`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
          <p style={{ color: 'var(--color-accent)', fontSize: '14px' }}>Tickets: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="card skeleton" style={{ height: '360px' }}></div>;
  }

  const chartData = data?.weekly_trend || [];

  return (
    <>
      <style>{`
        .analytics-container {
          display: flex;
          gap: var(--space-lg);
          height: 100%;
        }
        .chart-area {
          flex: 1;
        }
        .insights-panel {
          width: 240px;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1));
          border: 1px solid var(--color-border-accent);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
        }
        @media (max-width: 768px) {
          .analytics-container {
            flex-direction: column;
          }
          .insights-panel {
            width: 100%;
          }
        }
        .insight-card {
          background: rgba(17, 24, 39, 0.4);
          padding: var(--space-md);
          border-radius: var(--radius-sm);
        }
        .insight-label {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .insight-value {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-text-primary);
        }
      `}</style>
      <div className="card">
        <div className="flex justify-between items-center mb-lg">
          <div className="flex items-center gap-sm">
            <Activity size={20} className="text-accent" />
            <h3 className="section-title" style={{ margin: 0 }}>Ticket Trends</h3>
          </div>
          <select className="select input-sm" style={{ width: 'auto' }}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>

        <div className="analytics-container">
          <div className="chart-area" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="insights-panel">
            <div className="flex items-center gap-sm mb-sm text-accent font-semibold">
              <TrendingUp size={16} /> AI Insights
            </div>
            
            <div className="insight-card">
              <div className="insight-label">Escalation Risk</div>
              <div className="insight-value text-danger">{data?.escalation_risk || 0}%</div>
            </div>
            
            <div className="insight-card">
              <div className="insight-label">SLA Health Score</div>
              <div className="insight-value text-success">{data?.sla_health || 0}%</div>
            </div>
            
            <div className="insight-card">
              <div className="insight-label">Most Active</div>
              <div className="insight-value" style={{ fontSize: 'var(--text-md)' }}>{data?.most_active_department || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
