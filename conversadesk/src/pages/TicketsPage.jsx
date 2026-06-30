import React, { useState, useEffect } from 'react';
import { API_BASE, formatTimeAgo, getStatusColor, getPriorityColor, getDepartmentColor, getInitials, exportToCSV } from '../utils/helpers';
import { Search, Filter, Plus, MoreVertical, Ticket, Wand2, Download, X, Edit, Trash2 } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import NewTicketModal from '../components/tickets/NewTicketModal';
import EditTicketModal from '../components/tickets/EditTicketModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicTicket, setMagicTicket] = useState(null);
  const [magicResolution, setMagicResolution] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  
  // Dropdown & Edit State
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [ticketToEdit, setTicketToEdit] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMagicWand = async (ticket) => {
    setMagicTicket(ticket);
    setMagicResolution('');
    setShowMagicModal(true);
    setMagicLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/ticket-resolve/${ticket.id}`);
      if (res.ok) {
        const data = await res.json();
        setMagicResolution(data.resolution || data.error);
      } else {
        setMagicResolution("Failed to generate resolution.");
      }
    } catch (e) {
      setMagicResolution("Network error occurred.");
    } finally {
      setMagicLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV('tickets_export.csv', filteredTickets);
    toast.success('Exported to CSV');
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    const tid = toast.loading('Deleting ticket...');
    try {
      const res = await fetch(`${API_BASE}/delete-ticket/${ticketId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Ticket deleted', { id: tid });
        fetchTickets();
      } else {
        toast.error('Failed to delete', { id: tid });
      }
    } catch (e) {
      toast.error('Network error', { id: tid });
    }
  };

  const { lastMessage } = useWebSocket();

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/recent-tickets`);
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to load tickets');
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

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.subject || t.summary || t.ticket_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (t.status || '').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <p className="text-secondary text-sm">Manage and respond to customer inquiries</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewTicketModal(true)}>
            <Plus size={18} /> New Ticket
          </button>
        </div>
      </div>

      <div className="card h-full flex-col p-0">
        <div className="flex items-center justify-between p-md border-b border-subtle bg-tertiary">
          <div className="flex items-center gap-sm flex-1">
            <div className="input-with-icon" style={{ maxWidth: '300px' }}>
              <Search size={16} className="text-tertiary" />
              <input 
                type="text" 
                className="input" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="select" 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <button className="btn btn-secondary btn-icon"><Filter size={16} /></button>
          </div>
          <div className="text-sm text-tertiary">
            Showing {filteredTickets.length} tickets
          </div>
        </div>

        <div className="table-container flex-1">
          <table>
            <thead>
              <tr>
                <th>Ticket Info</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Status & Priority</th>
                <th>Created</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6"><div className="skeleton" style={{ height: '40px' }}></div></td>
                  </tr>
                ))
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state py-2xl">
                      <Ticket size={48} className="text-tertiary mb-md" />
                      <h3>No tickets found</h3>
                      <p>Adjust your filters or create a new ticket.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="cursor-pointer card-interactive">
                    <td>
                      <div className="font-medium text-primary mb-xs">{ticket.subject || ticket.summary || 'No Subject'}</div>
                      <div className="text-xs font-mono text-tertiary">{ticket.ticket_code || `#${ticket.id}`}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="avatar avatar-sm">{getInitials(ticket.customer || ticket.customer_name)}</div>
                        <span className="text-sm">{ticket.customer || ticket.customer_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-xs text-xs">
                        <span className="status-dot" style={{ background: getDepartmentColor(ticket.department || ticket.category) }}></span>
                        {ticket.department || ticket.category}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <span className={`badge badge-dot badge-${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                        <span className={`badge badge-${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      </div>
                    </td>
                    <td className="text-sm text-tertiary">{formatTimeAgo(ticket.created_date || ticket.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-xs">
                        <button 
                          className="btn-icon" 
                          style={{ color: 'var(--color-accent)' }} 
                          onClick={(e) => { e.stopPropagation(); handleMagicWand(ticket); }}
                          title="Auto-Resolve with AI"
                        >
                          <Wand2 size={16} />
                        </button>
                        <div className="relative">
                          <button 
                            className="btn-icon text-tertiary hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === ticket.id ? null : ticket.id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openDropdownId === ticket.id && (
                            <div className="ticket-dropdown-menu">
                              <button 
                                className="ticket-dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTicketToEdit(ticket);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <Edit size={14} /> Edit Ticket
                              </button>
                              <button 
                                className="ticket-dropdown-item danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTicket(ticket.id);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showMagicModal && (
        <div className="modal-overlay" onClick={() => !magicLoading && setShowMagicModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-md border-b border-subtle pb-sm">
              <h3 className="font-bold text-lg flex items-center gap-sm">
                <Wand2 size={20} className="text-accent" /> AI Auto-Resolution
              </h3>
              <button className="btn-icon" onClick={() => setShowMagicModal(false)}><X size={20} /></button>
            </div>
            
            <div className="mb-md">
              <p className="text-sm text-secondary">Suggested resolution for ticket <strong className="text-primary">{magicTicket?.ticket_code}</strong>:</p>
            </div>
            
            <div className="bg-elevated border border-subtle rounded p-md mb-md" style={{ minHeight: '150px', maxHeight: '400px', overflowY: 'auto' }}>
              {magicLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-tertiary gap-sm py-xl">
                  <div className="spinner"></div>
                  <p>Analyzing knowledge base and drafting resolution...</p>
                </div>
              ) : (
                <div className="markdown-body text-sm" style={{ lineHeight: '1.6' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{magicResolution}</ReactMarkdown>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-sm pt-sm border-t border-subtle">
              <button className="btn btn-secondary" onClick={() => setShowMagicModal(false)}>Close</button>
              <button className="btn btn-primary" disabled={magicLoading || !magicResolution} onClick={() => {
                navigator.clipboard.writeText(magicResolution);
                toast.success('Resolution copied to clipboard!');
                setShowMagicModal(false);
              }}>Copy Resolution</button>
            </div>
          </div>
        </div>
      )}

      {showNewTicketModal && (
        <NewTicketModal 
          onClose={() => setShowNewTicketModal(false)} 
          onSuccess={() => {
            setShowNewTicketModal(false);
            fetchTickets();
          }} 
        />
      )}

      {ticketToEdit && (
        <EditTicketModal 
          ticket={ticketToEdit}
          onClose={() => setTicketToEdit(null)} 
          onSuccess={() => {
            setTicketToEdit(null);
            fetchTickets();
          }} 
        />
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
          max-height: 90vh;
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
        .markdown-body p { margin-bottom: 8px; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body ul { padding-left: 20px; list-style-type: disc; margin-bottom: 8px; }
        .markdown-body ol { padding-left: 20px; list-style-type: decimal; margin-bottom: 8px; }
        
        /* Dropdown Styling */
        .ticket-dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          width: 150px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-dropdown);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .ticket-dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          text-align: left;
          padding: var(--space-sm) var(--space-md);
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .ticket-dropdown-item:hover {
          background: var(--color-bg-tertiary);
        }
        
        .ticket-dropdown-item.danger {
          color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}