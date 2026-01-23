import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { initializeMsalClient } from './auth/msalConfig.ts';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Unable to find root container for Warp Reporting frontend.');
}

const root = createRoot(container);

const renderApp = () => {
  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
};

initializeMsalClient()
  .then(renderApp)
  .catch((error) => {
    console.error('MSAL initialization failed. Authentication is unavailable.', error);
  });
