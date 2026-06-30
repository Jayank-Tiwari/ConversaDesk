import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../components/dashboard/StatsCards';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import SentimentChart from '../components/dashboard/SentimentChart';
import RecentTickets from '../components/dashboard/RecentTickets';
import RecentEmails from '../components/dashboard/RecentEmails';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { Plus, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .dashboard-row-2 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-lg);
        }
        @media (max-width: 1024px) {
          .dashboard-row-2 {
            grid-template-columns: 1fr;
          }
        }
        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05));
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }
        .welcome-text h2 {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-xs);
        }
        .welcome-text p {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
        }
        .welcome-actions {
          display: flex;
          gap: var(--space-md);
        }
      `}</style>
      <div className="page">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
            <p>{formatDate(new Date())} — Here's what's happening with your support desk today.</p>
          </div>
          <div className="welcome-actions">
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
              <Plus size={16} /> New Ticket
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <StatsCards />
          
          <div className="dashboard-row-2">
            <AnalyticsSection />
            <ActivityFeed />
          </div>

          <div className="dashboard-row-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <DepartmentChart />
            <SentimentChart />
          </div>

          <div className="dashboard-row-2">
            <RecentTickets />
            <RecentEmails />
          </div>
        </div>
      </div>
    </>
  );
}