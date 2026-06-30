import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, LayoutDashboard, Ticket, MessageSquare, Mail, 
  BarChart3, Settings, Plus, Zap, X, CornerDownLeft 
} from 'lucide-react';
import { API_BASE } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const actions = useMemo(() => [
    { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, onSelect: () => navigate('/dashboard') },
    { id: 'nav-tickets', label: 'Go to Tickets', category: 'Navigation', icon: Ticket, onSelect: () => navigate('/tickets') },
    { id: 'nav-chat', label: 'Go to AI Chat', category: 'Navigation', icon: MessageSquare, onSelect: () => navigate('/chat') },
    { id: 'nav-mails', label: 'Go to Emails', category: 'Navigation', icon: Mail, onSelect: () => navigate('/mails') },
    { id: 'nav-analytics', label: 'Go to Analytics', category: 'Navigation', icon: BarChart3, onSelect: () => navigate('/analytics') },
    { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: Settings, onSelect: () => navigate('/settings') },
    
    { id: 'act-ticket', label: 'Create New Ticket', category: 'Actions', icon: Plus, onSelect: () => { navigate('/tickets'); toast('Open create ticket modal', {icon: '🎫'}); } },
    { id: 'act-emails', label: 'Refresh Emails', category: 'Actions', icon: Mail, onSelect: async () => { 
        const toastId = toast.loading('Fetching emails...');
        try {
          await fetch(`${API_BASE}/save-emails`);
          toast.success('Emails refreshed', { id: toastId });
        } catch (e) {
          toast.error('Failed to refresh emails', { id: toastId });
        }
      } 
    },
    { id: 'act-ai', label: 'Process AI Emails', category: 'Actions', icon: Zap, onSelect: async () => {
        const toastId = toast.loading('Processing emails with AI...');
        try {
          await fetch(`${API_BASE}/process-ai-emails`);
          toast.success('AI processing complete', { id: toastId });
        } catch (e) {
          toast.error('Failed to process emails', { id: toastId });
        }
      } 
    },
    { id: 'act-rag', label: 'Build Knowledge Base', category: 'Actions', icon: Settings, onSelect: async () => {
        const toastId = toast.loading('Building RAG DB...');
        try {
          await fetch(`${API_BASE}/build-rag`);
          toast.success('Knowledge base built', { id: toastId });
        } catch (e) {
          toast.error('Failed to build KB', { id: toastId });
        }
      }
    }
  ], [navigate]);

  const filteredActions = useMemo(() => {
    if (!search) return actions;
    return actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, actions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].onSelect();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .cmd-palette-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10vh;
          z-index: var(--z-modal-backdrop);
        }
        .cmd-palette {
          width: 100%;
          max-width: 560px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }
        .cmd-header {
          display: flex;
          align-items: center;
          padding: 0 var(--space-md);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .cmd-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: var(--space-lg) var(--space-sm);
          font-size: var(--text-md);
          color: var(--color-text-primary);
          outline: none;
        }
        .cmd-list {
          max-height: 360px;
          overflow-y: auto;
          padding: var(--space-sm);
        }
        .cmd-category {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          padding: var(--space-xs) var(--space-sm);
          margin-top: var(--space-sm);
        }
        .cmd-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 10px var(--space-sm);
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--color-text-secondary);
        }
        .cmd-item.selected {
          background: var(--color-accent-subtle);
          color: var(--color-accent);
        }
        .cmd-item-label {
          flex: 1;
          font-size: var(--text-sm);
          font-weight: 500;
        }
        .cmd-footer {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          border-top: 1px solid var(--color-border-subtle);
          background: var(--color-bg-tertiary);
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .cmd-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 4px;
          background: var(--color-bg-elevated);
          border-radius: 4px;
          border: 1px solid var(--color-border);
          font-family: var(--font-mono);
          margin-right: 4px;
        }
      `}</style>
      <div className="cmd-palette-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <AnimatePresence>
          <motion.div 
            className="cmd-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            <div className="cmd-header">
              <Search size={20} className="text-secondary" />
              <input 
                ref={inputRef}
                className="cmd-input"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-icon text-secondary" onClick={onClose}><X size={16} /></button>
            </div>
            <div className="cmd-list">
              {filteredActions.length === 0 ? (
                <div className="text-center text-tertiary py-8 text-sm">No results found.</div>
              ) : (
                filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  const showCat = idx === 0 || filteredActions[idx - 1].category !== action.category;
                  return (
                    <React.Fragment key={action.id}>
                      {showCat && <div className="cmd-category">{action.category}</div>}
                      <div 
                        className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                        onClick={() => { action.onSelect(); onClose(); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <Icon size={18} />
                        <span className="cmd-item-label">{action.label}</span>
                        {idx === selectedIndex && <CornerDownLeft size={14} />}
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
            <div className="cmd-footer">
              <div><span className="cmd-key">↑</span><span className="cmd-key">↓</span> to navigate</div>
              <div><span className="cmd-key">↵</span> to select</div>
              <div><span className="cmd-key">esc</span> to close</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
