import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './styles/index.css';
import './lib/i18n'; // Initializar translations

// Ativar o modo Offline PWA automaticamente
registerSW({
  onOfflineReady() {
    console.log('App pronta para uso offline');
  },
  immediate: true
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
