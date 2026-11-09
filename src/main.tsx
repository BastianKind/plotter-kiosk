import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/frames.css';
import './styles/screens.css';
import './styles/phone.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
