import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{ 
        style: { background: '#1e2535', color: '#e2e8f0', border: '1px solid #1e3a5f', fontSize: 13 },
        duration: 4000
      }} 
    />
  </>
);
