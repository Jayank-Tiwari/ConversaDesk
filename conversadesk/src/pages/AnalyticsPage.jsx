import React, { useState, useEffect } from 'react';
import { API_BASE, exportToCSV } from '../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Download, Calendar, Sparkles, X, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [reportModal, setReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const handleGenerateReport = async () => {
    setReportModal(true);
    setReportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate-report`);
      if (res.ok) {
        const json = await res.json();
        setReportText(json.report || json.error);
      } else {
        setReportText("Failed to generate report.");
      }
    } catch (e) {
      setReportText("Network error occurred.");
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  const chartData = data?.weekly_trend || [];
  const pieData = data?.department_breakdown || [];
  const COLORS = ['var(--color-accent)', 'var(--color-info)', 'var(--color-warning)'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
          <p style={{ color: 'var(--color-accent)', fontSize: '14px' }}>Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <style>{`
        .chart-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }
        .chart-title {
          font-size: var(--text-md);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        .metric-box {
          padding: var(--space-md);
          border-radius: var(--radius-md);
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-subtle);
        }
        .metric-label {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
        }
      `}</style>
      <div className="page">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="text-xl font-bold">Analytics & Reports</h2>
            <p className="text-secondary text-sm">Comprehensive insights into your support desk performance</p>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-secondary" onClick={handleGenerateReport}>
              <Sparkles size={16} className="text-accent" /> Generate AI Report
            </button>
            <button className="btn btn-primary" onClick={() => {
              exportToCSV('analytics_report.csv', chartData);
              toast.success('Report exported successfully');
            }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-box">
            <div className="metric-label">Resolution Rate</div>
            <div className="metric-value">{data?.sla_health || 0}%</div>
            <div className="text-secondary text-sm flex items-center gap-xs mt-xs">
              Based on closed tickets
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Customer Satisfaction</div>
            <div className="metric-value">{data?.csat || 0}%</div>
            <div className="text-secondary text-sm flex items-center gap-xs mt-xs">
              Positive sentiment ratio
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Escalation Risk</div>
            <div className="metric-value text-danger">{data?.escalation_risk || 0}%</div>
            <div className="text-secondary text-sm flex items-center gap-xs mt-xs">
              Critical open tickets
            </div>
          </div>
        </div>

        <div className="grid grid-2 gap-lg" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="chart-card" style={{ height: '400px' }}>
            <div className="chart-header">
              <div className="chart-title">Ticket Volume Trends</div>
            </div>
            <div style={{ flex: 1 }}>
              {loading ? <div className="skeleton h-full w-full"></div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCountAnalytic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCountAnalytic)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="chart-card" style={{ height: '400px' }}>
            <div className="chart-header">
              <div className="chart-title">Tickets by Department</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-md mt-md">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-xs text-sm">
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[index] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reportModal && (
        <div className="modal-overlay report-print-overlay" onClick={() => !reportLoading && setReportModal(false)}>
          <div className="modal-content report-print-content" style={{ maxWidth: '800px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-md border-b border-subtle pb-sm no-print">
              <h3 className="font-bold text-lg flex items-center gap-sm">
                <Sparkles size={20} className="text-accent" /> Executive AI Report
              </h3>
              <button className="btn-icon" onClick={() => setReportModal(false)}><X size={20} /></button>
            </div>
            
            <div className="bg-elevated rounded p-xl mb-md print-area" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {reportLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-tertiary gap-sm py-2xl">
                  <div className="spinner"></div>
                  <p>Analyzing database metrics and writing executive summary...</p>
                </div>
              ) : (
                <div className="markdown-body" style={{ lineHeight: '1.6' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportText}</ReactMarkdown>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-sm pt-sm border-t border-subtle no-print">
              <button className="btn btn-secondary" onClick={() => setReportModal(false)}>Close</button>
              <button className="btn btn-primary" disabled={reportLoading || !reportText} onClick={handlePrint}>
                <Printer size={16} /> Print PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .modal-content {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          box-shadow: var(--shadow-xl);
          display: flex; flex-direction: column;
        }
        .spinner {
          width: 24px; height: 24px;
          border: 3px solid var(--color-border-subtle);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          color: var(--color-text-primary);
          margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600;
        }
        .markdown-body p { margin-bottom: 1em; color: var(--color-text-secondary); }
        .markdown-body ul { padding-left: 20px; list-style-type: disc; margin-bottom: 1em; color: var(--color-text-secondary); }
        
        @media print {
          body * { visibility: hidden; }
          .report-print-content, .report-print-content * { visibility: visible; }
          .report-print-overlay { position: absolute; left: 0; top: 0; background: white; padding: 0; align-items: flex-start; }
          .report-print-content { width: 100%; max-width: 100%; border: none; box-shadow: none; background: white; color: black; padding: 0; }
          .no-print { display: none !important; }
          .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body p, .markdown-body li { color: black; }
          .print-area { max-height: none !important; overflow: visible !important; padding: 0; }
        }
      `}</style>
    </>
  );
}