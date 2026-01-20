import React from 'react';
import { Box, Button, Typography } from '@mui/material';

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary captured', error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return (
          <>
            {this.props.fallback}
            <Button variant="contained" onClick={this.reset} sx={{ mt: 2 }}>
              Recarregar
            </Button>
          </>
        );
      }
      return (
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
            px: 2,
          }}
        >
          <Typography variant="h5" color="error">
            Ops! Algo deu errado.
          </Typography>
          <Typography variant="body1">Recarregue a página ou tente novamente mais tarde.</Typography>
          <Button variant="contained" onClick={this.reset}>
            Tentar novamente
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
