import React, { useCallback } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const ServiceWorkerUpdateToast: React.FC = () => {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration failed:', error);
    },
  });

  const handleUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  return (
    <Snackbar open={needRefresh} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert
        severity="info"
        variant="filled"
        action={
          <Button color="inherit" size="small" onClick={handleUpdate}>
            Atualizar
          </Button>
        }
      >
        Atualização disponível — Atualizar
      </Alert>
    </Snackbar>
  );
};
