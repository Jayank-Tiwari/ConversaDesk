import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { X, Upload, Trash2 } from 'lucide-react';
import { useKB } from '../../context/KBContext';
import { API_BASE } from '../../utils/helpers';

export default function KBDraftsModal({ onClose }) {
  const { kbDrafts, removeDraft } = useKB();
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleUpload = async (draft, index) => {
    setUploadingIndex(index);
    const toastId = toast.loading('Uploading KB Article...');
    
    try {
      const res = await fetch(`${API_BASE}/upload-kb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: draft.suggested_filename,
          content: draft.content
        })
      });

      if (res.ok) {
        toast.success('KB Article uploaded and RAG indexed!', { id: toastId });
        removeDraft(index);
        if (kbDrafts.length <= 1) onClose();
      } else {
        toast.error('Failed to upload KB article', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error', { id: toastId });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header flex justify-between items-center">
          <h2 className="text-xl font-bold">Knowledge Base Drafts</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {kbDrafts.length === 0 ? (
            <div className="empty-state py-xl text-tertiary">
              <p>No Knowledge Base drafts pending.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {kbDrafts.map((draft, index) => (
                <div key={index} className="card bg-secondary border border-border">
                  <div className="flex justify-between items-center mb-md pb-sm border-b border-subtle">
                    <div className="font-mono text-sm text-info">{draft.suggested_filename}</div>
                    <div className="flex gap-sm">
                      <button 
                        className="btn btn-ghost text-danger btn-sm"
                        onClick={() => {
                          removeDraft(index);
                          if (kbDrafts.length <= 1) onClose();
                        }}
                      >
                        <Trash2 size={16} /> Discard
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpload(draft, index)}
                        disabled={uploadingIndex === index}
                      >
                        <Upload size={16} /> 
                        {uploadingIndex === index ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                  <div className="markdown-preview p-md bg-tertiary rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {draft.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
