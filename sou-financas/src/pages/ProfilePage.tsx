import React, { useEffect, useState } from 'react';
import {
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack as MuiStack,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../theme/AppThemeProvider';
import { useNotification } from '../components/NotificationProvider';
import { updateUserName, resetUserData } from '../services/userService';
import { seedDemoData } from '../services/seedService';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { Category } from '../types/models';
import { LoadingFallback } from '../components/LoadingFallback';

export const ProfilePage: React.FC = () => {
  const { user, logout, refresh } = useAuth();
  const { currency, mode, setMode, setCurrency } = useAppTheme();
  const { showSuccess, showError } = useNotification();
  const [name, setName] = useState(user?.name ?? '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryForm, setCategoryForm] = useState({ name: '', kind: 'expense' });

  const loadCategories = async () => {
    if (!user) return;
    const list = await db.categories.where('userId').equals(user.id).toArray();
    setCategories(list);
    setLoading(false);
  };

  useEffect(() => {
    void loadCategories();
  }, [user]);

  if (!user || loading) {
    return <LoadingFallback />;
  }

  const handleNameSave = async () => {
    try {
      await updateUserName(user.id, name);
      showSuccess('Nome atualizado');
      await refresh();
    } catch {
      showError('Não foi possível salvar');
    }
  };

  const handleReset = async () => {
    if (!user) return;
    const confirmed = window.confirm('Deseja apagar todas as informações locais?');
    if (!confirmed) return;
    await resetUserData(user.id);
    showSuccess('Dados locais removidos. Faça login novamente.');
    await logout();
  };

  const handleDemo = async () => {
    if (!user) return;
    await seedDemoData(user.id);
    showSuccess('Dados demo adicionados');
    await loadCategories();
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name) {
      showError('Informe o nome da categoria');
      return;
    }
    await db.categories.add({
      id: uuidv4(),
      userId: user.id,
      name: categoryForm.name,
      kind: categoryForm.kind as Category['kind'],
      createdAt: new Date().toISOString(),
    });
    setCategoryForm({ name: '', kind: 'expense' });
    showSuccess('Categoria adicionada');
    await loadCategories();
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Perfil
        </Typography>
        <Stack spacing={2}>
          <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} />
          <Button variant="contained" onClick={handleNameSave}>
            Salvar nome
          </Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preferências
        </Typography>
        <MuiStack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FormControl>
            <InputLabel id="currency-select">Moeda</InputLabel>
            <Select
              labelId="currency-select"
              value={currency}
              label="Moeda"
              onChange={(event) => {
                void setCurrency(event.target.value);
              }}
            >
              <MenuItem value="BRL">BRL</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="mode-select">Tema</InputLabel>
            <Select
              labelId="mode-select"
              value={mode}
              label="Tema"
              onChange={(event) => {
                void setMode(event.target.value as 'light' | 'dark');
              }}
            >
              <MenuItem value="light">Claro</MenuItem>
              <MenuItem value="dark">Escuro</MenuItem>
            </Select>
          </FormControl>
        </MuiStack>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Categorias personalizadas
        </Typography>
        <MuiStack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Nome"
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <FormControl>
            <InputLabel id="kind-select">Tipo</InputLabel>
            <Select
              labelId="kind-select"
              value={categoryForm.kind}
              label="Tipo"
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, kind: event.target.value }))}
            >
              <MenuItem value="expense">Despesa</MenuItem>
              <MenuItem value="income">Receita</MenuItem>
              <MenuItem value="both">Ambos</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAddCategory}>
            Criar categoria
          </Button>
        </MuiStack>
        <MuiStack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
          {categories.map((category) => (
            <Chip key={category.id} label={category.name} />
          ))}
        </MuiStack>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ações
        </Typography>
        <MuiStack spacing={2}>
          <Button variant="outlined" color="secondary" onClick={handleReset}>
            Resetar dados locais
          </Button>
          <Button variant="contained" onClick={handleDemo}>
            Gerar dados demo
          </Button>
        </MuiStack>
      </Paper>
    </Stack>
  );
};
