import React, { useState } from 'react';
import { Container, Paper, Stack, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';

type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível autenticar.');
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Entrar</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="E-mail" type="email" fullWidth required {...register('email')} />
          <TextField label="Senha" type="password" fullWidth required {...register('password')} />
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Entrar
          </Button>
          <Typography variant="body2">
            Ainda não tem conta?{' '}
            <Link component={RouterLink} to="/register">
              Cadastre-se
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};
