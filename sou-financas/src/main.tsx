import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './hooks/useAuth';
import { AppThemeProvider } from './theme/AppThemeProvider';
import './utils/chartSetup';

const routerBase = import.meta.env.BASE_URL;
const hashBasename = routerBase === '/' ? undefined : routerBase;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AppThemeProvider>
        <HashRouter basename={hashBasename}>
          <CssBaseline />
          <App />
        </HashRouter>
      </AppThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
