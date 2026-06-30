import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { getPriorityColor } from '../../utils/helpers';

export default function SimilarTicketsModal({ similarTickets, onClose }) {
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content" style={{ maxWidth: '700px', width: '90%' }}>
        <div className="modal-header flex justify-between items-center">
          <h2 className="text-xl font-bold">Similar Past Tickets</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {similarTickets.length === 0 ? (
            <div className="empty-state py-xl text-tertiary">
              <p>No similar tickets found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {similarTickets.map((ticket, i) => (
                <div key={ticket.id} className="card bg-secondary border border-border flex flex-col gap-sm p-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-xs text-tertiary mb-xs">{ticket.ticket_code}</div>
                      <div className="font-medium">{ticket.summary}</div>
                    </div>
                    <div className="badge badge-success flex items-center gap-xs">
                      <CheckCircle size={12} /> {ticket.similarity}% Match
                    </div>
                  </div>
                  <div className="text-sm text-tertiary mt-sm">
                    <strong>Department:</strong> {ticket.department}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
