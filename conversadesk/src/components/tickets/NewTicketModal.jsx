import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../utils/helpers';

export default function NewTicketModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer: '',
    department: 'IT',
    priority: 'Low',
    status: 'Open',
    summary: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.summary) {
      toast.error('Customer name and summary are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/create-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Ticket created successfully!');
        onSuccess();
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="flex justify-between items-center mb-md border-b border-subtle pb-sm">
          <h3 className="font-bold text-lg">Create New Ticket</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label className="text-sm font-medium text-secondary mb-xs block">Customer Name</label>
            <input 
              type="text" 
              className="input bg-elevated" 
              placeholder="e.g. John Doe"
              value={formData.customer}
              onChange={e => setFormData({...formData, customer: e.target.value})}
            />
          </div>
          
          <div className="mb-md">
            <label className="text-sm font-medium text-secondary mb-xs block">Issue Summary</label>
            <textarea 
              className="input bg-elevated" 
              placeholder="Brief description of the issue..."
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
          
          <div className="flex justify-end gap-sm pt-sm border-t border-subtle">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} /> Create Ticket</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
