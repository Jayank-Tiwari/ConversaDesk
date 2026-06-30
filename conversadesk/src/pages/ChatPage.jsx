import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../utils/helpers';
import { Send, Bot, User, Sparkles, RefreshCcw, Paperclip, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'ai', 
      content: "Hello! I'm your ConversaDesk AI assistant. I have context on all your tickets, emails, and database schemas. How can I help you today?",
      suggestions: ["What are my open tickets?", "Show critical SLA risks", "Summarize latest emails"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftTo, setDraftTo] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);

  const handleOpenDraft = (content) => {
    let subjectMatch = content.match(/Subject:\s*(.*)/i);
    let bodyMatch = content.match(/Body:\s*([\s\S]*)/i);
    
    setDraftSubject(subjectMatch ? subjectMatch[1].trim() : '');
    setDraftBody(bodyMatch ? bodyMatch[1].trim() : content);
    setDraftTo('');
    setShowDraftModal(true);
  };

  const handleSendDraft = async () => {
    if (!draftTo.trim() || !draftSubject.trim() || !draftBody.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setDraftLoading(true);
    try {
      const res = await fetch(`${API_BASE}/send-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: draftTo, subject: draftSubject, body: draftBody })
      });
      if (res.ok) {
        toast.success('Email sent successfully!');
        setShowDraftModal(false);
      } else {
        toast.error('Failed to send email.');
      }
    } catch (e) {
      toast.error('Network error.');
    } finally {
      setDraftLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e, forcedInput = null) => {
    e?.preventDefault();
    const userMsg = forcedInput || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.content }));
      
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, role: 'employee', history })
      });
      
      let aiContent = "Sorry, I couldn't process that request.";
      let suggestions = [];
      
      if (res.ok) {
        const data = await res.json();
        let rawContent = data.answer || data.response || JSON.stringify(data);
        
        if (rawContent.includes('---SUGGESTIONS---')) {
          const parts = rawContent.split('---SUGGESTIONS---');
          aiContent = parts[0].trim();
          const suggestionsPart = parts[1].trim();
          suggestions = suggestionsPart.split('|').map(s => s.trim()).filter(Boolean);
        } else {
          aiContent = rawContent;
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: aiContent, suggestions }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: "Network error occurred connecting to AI agent." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: rgba(11, 15, 26, 0.5);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .message {
          display: flex;
          gap: var(--space-md);
          max-width: 85%;
        }
        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .msg-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai .msg-avatar {
          background: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
          color: white;
        }
        .user .msg-avatar {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
        }
        .msg-content {
          padding: 14px 18px;
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          line-height: 1.6;
        }
        .ai .msg-content {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-primary);
          border-top-left-radius: 4px;
        }
        .user .msg-content {
          background: var(--color-accent);
          color: white;
          border-top-right-radius: 4px;
        }
        .chat-input-area {
          padding: var(--space-md) var(--space-lg);
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border-subtle);
        }
        .chat-form {
          display: flex;
          align-items: flex-end;
          gap: var(--space-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-sm);
          transition: border-color var(--transition-fast);
        }
        .chat-form:focus-within {
          border-color: var(--color-accent);
        }
        .chat-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          resize: none;
          padding: 8px;
          min-height: 24px;
          max-height: 120px;
          font-family: inherit;
        }
        .chat-textarea:focus {
          outline: none;
        }
        .markdown-body p { margin-bottom: 8px; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; font-size: 13px; }
        .markdown-body code { font-family: monospace; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 4px; font-size: 13px; }
        .markdown-body pre code { background: transparent; padding: 0; }
        .markdown-body ul { padding-left: 20px; list-style-type: disc; margin-bottom: 8px; }
        .markdown-body ol { padding-left: 20px; list-style-type: decimal; margin-bottom: 8px; }
        .markdown-body table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 13px; }
        .markdown-body th, .markdown-body td { border: 1px solid var(--color-border-subtle); padding: 6px 10px; text-align: left; }
        .markdown-body th { background: rgba(255,255,255,0.05); }
        .markdown-body strong { font-weight: 600; color: var(--color-text-primary); }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--color-text-tertiary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
      <div className="page" style={{ paddingBottom: 0 }}>
        <div className="chat-container">
          <div className="chat-header">
            <div className="flex items-center gap-sm">
              <Sparkles size={20} className="text-accent" />
              <div>
                <h3 className="font-bold text-md m-0">ConversaDesk Agent</h3>
                <p className="text-xs text-secondary m-0">Powered by Azure OpenAI & LangChain</p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setMessages([messages[0]])}>
              <RefreshCcw size={14} /> Clear Chat
            </button>
          </div>

          <div className="chat-messages">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id} 
                  className={`message ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="msg-avatar">
                    {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '100%' }}>
                    <div className="msg-content markdown-body" style={{ overflowX: 'auto' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.role === 'ai' && msg.content.toLowerCase().includes('subject:') && (
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ width: 'fit-content', borderRadius: '16px', padding: '6px 14px', fontSize: '13px' }}
                        onClick={() => handleOpenDraft(msg.content)}
                      >
                        <Mail size={14} /> Review & Send Draft
                      </button>
                    )}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-xs" style={{ marginTop: '4px' }}>
                        {msg.suggestions.map((suggestion, idx) => (
                          <button 
                            key={idx} 
                            className="btn btn-secondary btn-sm"
                            style={{ 
                              borderRadius: '16px', 
                              fontSize: '12px', 
                              padding: '4px 12px', 
                              background: 'rgba(139, 92, 246, 0.1)', 
                              border: '1px solid rgba(139, 92, 246, 0.3)', 
                              color: 'var(--color-accent)' 
                            }}
                            onClick={() => handleSend(null, suggestion)}
                            disabled={loading}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="message ai">
                <div className="msg-avatar"><Bot size={20} /></div>
                <div className="msg-content" style={{ padding: '8px 14px' }}>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <form className="chat-form" onSubmit={handleSend}>
              <button type="button" className="btn-icon text-tertiary" style={{ padding: '8px' }}>
                <Paperclip size={20} />
              </button>
              <textarea
                className="chat-textarea"
                placeholder="Ask about tickets, metrics, or database insights..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={1}
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-icon" 
                disabled={!input.trim() || loading}
                style={{ borderRadius: '8px' }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {showDraftModal && (
        <div className="modal-overlay" onClick={() => !draftLoading && setShowDraftModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-md border-b border-subtle pb-sm">
              <h3 className="font-bold text-lg flex items-center gap-sm">
                <Mail size={20} className="text-accent" /> Review Email Draft
              </h3>
              <button className="btn-icon" onClick={() => setShowDraftModal(false)}><X size={20} /></button>
            </div>
            
            <div className="flex flex-col gap-sm mb-md">
              <div>
                <label className="text-sm text-secondary mb-xs block">To:</label>
                <input type="email" className="input w-full" value={draftTo} onChange={e => setDraftTo(e.target.value)} placeholder="customer@example.com" />
              </div>
              <div>
                <label className="text-sm text-secondary mb-xs block">Subject:</label>
                <input type="text" className="input w-full" value={draftSubject} onChange={e => setDraftSubject(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-secondary mb-xs block">Message:</label>
                <textarea className="input w-full" rows={8} value={draftBody} onChange={e => setDraftBody(e.target.value)} style={{ resize: 'vertical' }}></textarea>
              </div>
            </div>
            
            <div className="flex justify-end gap-sm pt-sm border-t border-subtle">
              <button className="btn btn-secondary" onClick={() => setShowDraftModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={draftLoading} onClick={handleSendDraft}>
                {draftLoading ? 'Sending...' : 'Send Email'}
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
          max-height: 90vh;
          display: flex; flex-direction: column;
        }
      `}</style>
    </>
  );
}
