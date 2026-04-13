import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: {
        background: '#ffffff',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)'
      },
      success: {
        style: {
          background: '#ffffff',
          color: 'var(--primary)',
          border: '1px solid var(--primary-border)'
        }
      },
      error: {
        style: {
          background: '#ffffff',
          color: 'var(--danger)',
          border: '1px solid var(--danger-border)'
        }
      }
    }} />
  </StrictMode>,
);
