import React, { useState } from 'react';
import { X, Save, FileText, SearchCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/helpers';
import { useKB } from '../../context/KBContext';
import SimilarTicketsModal from './SimilarTicketsModal';

export default function EditTicketModal({ ticket, onClose, onSuccess }) {
  const { addDraft } = useKB();
  const [formData, setFormData] = useState({
    customer: ticket?.customer || ticket?.customer_name || '',
    department: ticket?.department || ticket?.category || 'IT',
    priority: ticket?.priority || 'Low',
    status: ticket?.status || 'Open',
    summary: ticket?.summary || ticket?.subject || ''
  });
  const [loading, setLoading] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarTickets, setSimilarTickets] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [generatingKB, setGeneratingKB] = useState(false);

  const fetchSimilar = async () => {
    setLoadingSimilar(true);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticket.id}/similar`);
      if (res.ok) {
        const data = await res.json();
        setSimilarTickets(data);
        setShowSimilar(true);
      } else {
        toast.error('Failed to find similar tickets');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleGenerateKB = async () => {
    setGeneratingKB(true);
    const toastId = toast.loading('Generating Knowledge Base Article...');
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticket.id}/generate-kb`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        addDraft(data);
        toast.success('KB Article drafted! Check the Navbar to verify.', { id: toastId });
      } else {
        toast.error('Failed to generate KB article', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error', { id: toastId });
    } finally {
      setGeneratingKB(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.summary) {
      toast.error('Customer name and summary are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/update-ticket/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Ticket updated successfully!');
        onSuccess();
      } else {
        toast.error('Failed to update ticket');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-md border-b border-subtle pb-sm">
          <h3 className="font-bold text-lg">Edit Ticket {ticket.ticket_code}</h3>
          <button className="btn-icon" onClick={onClose} disabled={loading}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label className="text-sm font-medium text-secondary mb-xs block">Customer Name</label>
            <input 
              type="text" 
              className="input bg-elevated" 
              value={formData.customer}
              onChange={e => setFormData({...formData, customer: e.target.value})}
            />
          </div>
          
          <div className="mb-md">
            <label className="text-sm font-medium text-secondary mb-xs block">Issue Summary</label>
            <textarea 
              className="input bg-elevated" 
              rows={3}
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
            />
          </div>
          
          <div className="flex gap-md mb-lg">
            <div className="flex-1">
              <label className="text-sm font-medium text-secondary mb-xs block">Department</label>
              <select 
                className="select bg-elevated w-full"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              >
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Billing">Billing</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-secondary mb-xs block">Priority</label>
              <select 
                className="select bg-elevated w-full"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mb-lg">
            <label className="text-sm font-medium text-secondary mb-xs block">Status</label>
            <select 
              className="select bg-elevated w-full"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          <div className="flex gap-sm mb-lg">
            <button 
              type="button" 
              className="btn btn-secondary flex-1" 
              onClick={fetchSimilar}
              disabled={loadingSimilar}
            >
              <SearchCode size={16} /> 
              {loadingSimilar ? 'Searching...' : 'Similar Past Tickets'}
            </button>
            {formData.status === 'Resolved' && (
              <button 
                type="button" 
                className="btn btn-secondary flex-1 border-info text-info"
                onClick={handleGenerateKB}
                disabled={generatingKB}
              >
                <FileText size={16} /> 
                {generatingKB ? 'Drafting...' : 'Generate KB Article'}
              </button>
            )}
          </div>
          
          <div className="flex justify-end gap-sm pt-sm border-t border-subtle">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
      
      {showSimilar && <SimilarTicketsModal similarTickets={similarTickets} onClose={() => setShowSimilar(false)} />}
    </div>
  );
}
