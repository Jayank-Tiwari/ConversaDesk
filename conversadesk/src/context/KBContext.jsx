import React, { createContext, useContext, useState } from 'react';

const KBContext = createContext(null);

export function KBProvider({ children }) {
  const [kbDrafts, setKbDrafts] = useState([]);

  const addDraft = (draft) => {
    setKbDrafts(prev => [...prev, draft]);
  };

  const removeDraft = (index) => {
    setKbDrafts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <KBContext.Provider value={{ kbDrafts, addDraft, removeDraft }}>
      {children}
    </KBContext.Provider>
  );
}

export function useKB() {
  const context = useContext(KBContext);
  if (!context) {
    throw new Error('useKB must be used within a KBProvider');
  }
  return context;
}
