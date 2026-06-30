import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, formatTimeAgo, getStatusColor, getPriorityColor, getDepartmentColor } from '../../utils/helpers';
import { ArrowUpRight, Ticket } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

export default function RecentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { lastMessage } = useWebSocket();

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/recent-tickets`);
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch recent tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'NEW_TICKET') {
      fetchTickets();
    }
  }, [lastMessage]);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-md">
        <div className="flex items-center gap-sm">
          <Ticket size={20} className="text-secondary" />
          <h3 className="section-title" style={{ margin: 0 }}>Recent Tickets</h3>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tickets')}>
          View All <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state py-xl">
                    <Ticket size={32} />
                    <p>No recent tickets</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} className="cursor-pointer" onClick={() => navigate('/tickets')}>
                  <td className="font-mono text-xs">{ticket.ticket_code || `#${ticket.id}`}</td>
                  <td className="font-medium">{ticket.customer || ticket.customer_name}</td>
                  <td>
                    <span className="flex items-center gap-xs text-xs">
                      <span className="status-dot" style={{ background: getDepartmentColor(ticket.department || ticket.category) }}></span>
                      {ticket.department || ticket.category}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-dot badge-${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="text-tertiary text-xs">
                    {formatTimeAgo(ticket.created_date || ticket.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}