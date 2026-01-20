import React, { useState } from 'react';
import { Container, Paper, Stack, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<RegisterFormValues>();

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values.name, values.email, values.password);
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível criar a conta.');
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Criar conta</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Nome" fullWidth required {...register('name')} />
          <TextField label="E-mail" type="email" fullWidth required {...register('email')} />
          <TextField label="Senha" type="password" fullWidth required {...register('password')} />
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Criar
          </Button>
          <Typography variant="body2">
            Já tem conta?{' '}
            <Link component={RouterLink} to="/login">
              Entrar
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};
