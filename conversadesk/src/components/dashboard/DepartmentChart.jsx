import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/helpers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

export default function DepartmentChart() {
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

  if (loading) {
    return <div className="card skeleton" style={{ height: '360px' }}></div>;
  }

  const chartData = data?.department_breakdown || [];
  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '4px', fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ color: payload[0].color, fontSize: '14px' }}>Tickets: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-lg">
        <div className="flex items-center gap-sm">
          <PieChartIcon size={20} className="text-info" />
          <h3 className="section-title" style={{ margin: 0 }}>Department Distribution</h3>
        </div>
      </div>

      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-tertiary">No department data available</div>
        )}
      </div>
    </div>
  );
}
