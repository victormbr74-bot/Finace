import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 10 }}>
    <Typography variant="h4" gutterBottom>
      Página não encontrada
    </Typography>
    <Typography variant="body1" gutterBottom>
      Volte para o dashboard e continue organizando suas finanças.
    </Typography>
    <Button component={RouterLink} to="/app/dashboard" variant="contained">
      Ir para o dashboard
    </Button>
  </Box>
);
