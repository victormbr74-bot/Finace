import React, { useEffect, useState } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';

const isNavigatorOffline = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return !navigator.onLine;
};

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(isNavigatorOffline());

  useEffect(() => {
    const updateStatus = () => setIsOffline(isNavigatorOffline());
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1400,
        minWidth: 280,
        px: 2,
        py: 1,
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Typography variant="h6">Você está offline</Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Alguns recursos podem não estar disponíveis até voltar a conexão.
        </Typography>
        <Button variant="contained" size="small" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </Stack>
    </Paper>
  );
};
