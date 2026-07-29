import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Chybí #root element.');

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

// V produkci je obsah předvykreslený při buildu, ve vývoji je kořen prázdný.
if (root.hasChildNodes()) {
  hydrateRoot(root, tree);
} else {
  createRoot(root).render(tree);
}
