import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './src/App.web';

console.log('[index.web.js] Script loaded');
console.log('[index.web.js] React:', React);
console.log('[index.web.js] createRoot:', createRoot);
console.log('[index.web.js] App:', App);

// Mount the app
const rootElement = document.getElementById('root');
console.log('[index.web.js] Root element:', rootElement);

if (rootElement) {
  console.log('[index.web.js] Creating root...');
  const root = createRoot(rootElement);
  console.log('[index.web.js] Root created:', root);
  console.log('[index.web.js] Rendering App...');
  root.render(<App />);
  console.log('[index.web.js] App rendered');
} else {
  console.error('[index.web.js] Root element not found!');
}
