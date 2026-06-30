import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { KBProvider } from './context/KBContext';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <KBProvider>
          <WebSocketProvider>
            <App />
            <Toaster position="top-right" />
          </WebSocketProvider>
        </KBProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
