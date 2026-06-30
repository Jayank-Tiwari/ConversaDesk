import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Smile } from 'lucide-react';

export default function SentimentChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/generate-report`);
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

  if (loading) {
    return <div className="card skeleton" style={{ height: '360px' }}></div>;
  }

  // Parse the report data string into JSON if necessary, or assuming generate-report returns JSON
  let reportData = {};
  try {
    reportData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch(e) {
    // ignore
  }
  
  const sentimentData = [
    { name: 'Positive', value: reportData?.customer_insights?.["Positive Sentiment"] || 0, color: 'var(--color-success)' },
    { name: 'Neutral', value: reportData?.customer_insights?.["Neutral Sentiment"] || 0, color: 'var(--color-warning)' },
    { name: 'Negative', value: reportData?.customer_insights?.["Negative Sentiment"] || 0, color: 'var(--color-danger)' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '4px', fontWeight: 600 }}>{payload[0].payload.name}</p>
          <p style={{ color: payload[0].payload.color, fontSize: '14px' }}>Tickets: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-lg">
        <div className="flex items-center gap-sm">
          <Smile size={20} className="text-success" />
          <h3 className="section-title" style={{ margin: 0 }}>Customer Sentiment</h3>
        </div>
      </div>

      <div style={{ height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border-subtle)" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} width={80} />
            <Tooltip cursor={{ fill: 'var(--color-bg-hover)' }} content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
