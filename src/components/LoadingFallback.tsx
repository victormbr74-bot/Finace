import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <Box
    sx={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    }}
  >
    <CircularProgress />
    <Typography variant="subtitle1">{message}</Typography>
  </Box>
);
