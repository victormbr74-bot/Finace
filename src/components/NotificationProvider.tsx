import React, { createContext, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

type NotificationContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<NotificationSeverity>('info');

  const show = (next: string, nextSeverity: NotificationSeverity) => {
    setMessage(next);
    setSeverity(nextSeverity);
    setOpen(true);
  };

  const contextValue = useMemo(
    () => ({
      showSuccess: (msg: string) => show(msg, 'success'),
      showError: (msg: string) => show(msg, 'error'),
      showInfo: (msg: string) => show(msg, 'info'),
    }),
    [],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert severity={severity} variant="filled" onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
