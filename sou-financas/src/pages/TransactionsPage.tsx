import React, { useEffect, useMemo, useState } from 'react';
import {
  Stack,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { db } from '../db';
import type { Transaction, Category } from '../types/models';
import { TransactionForm, type TransactionFormValues } from '../components/TransactionForm';
import { addTransaction, deleteTransaction } from '../services/transactionService';
import { useNotification } from '../components/NotificationProvider';
import { LoadingFallback } from '../components/LoadingFallback';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    categoryId: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    const [txs, cats] = await Promise.all([
      db.transactions.where('userId').equals(user.id).toArray(),
      db.categories.where('userId').equals(user.id).toArray(),
    ]);
    setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [user]);

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        if (filters.type !== 'all' && tx.type !== filters.type) {
          return false;
        }
        if (filters.categoryId && tx.categoryId !== filters.categoryId) {
          return false;
        }
        if (filters.search && !tx.description.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.startDate && tx.date < filters.startDate) {
          return false;
        }
        if (filters.endDate && tx.date > filters.endDate) {
          return false;
        }
        return true;
      }),
    [transactions, filters],
  );

  const handleAdd = async (values: TransactionFormValues) => {
    if (!user) {
      return;
    }
    try {
      await addTransaction({
        userId: user.id,
        type: values.type,
        amount: Number(values.amount),
        date: values.date,
        categoryId: values.categoryId,
        description: values.description ?? '',
        paymentMethod: values.paymentMethod,
        recurring: values.recurring,
      });
      showSuccess('Transacao adicionada');
      await loadData();
    } catch {
      showError('Nao foi possivel adicionar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      showSuccess('Transacao removida');
      await loadData();
    } catch {
      showError('Nao foi possivel excluir');
    }
  };

  const exportCsv = () => {
    const header = ['date', 'description', 'amount', 'type', 'category'].join(',');
    const rows = filtered.map((tx) => {
      const category = categories.find((cat) => cat.id === tx.categoryId);
      return [tx.date, tx.description, tx.amount.toFixed(2), tx.type, category?.name ?? ''].join(',');
    });
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transacoes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const rows = content.split('\\n').map((row) => row.split(','));
      const categoryMap = categories.reduce<Record<string, string>>((acc, category) => {
        acc[category.name.toLowerCase()] = category.id;
        return acc;
      }, {});
      for (const row of rows.slice(1)) {
        const [date, description, amountRaw, type, categoryName] = row;
        if (!date || !amountRaw || !type) {
          continue;
        }
        await addTransaction({
          userId: user.id,
          type: type === 'income' ? 'income' : 'expense',
          amount: Number(amountRaw),
          date,
          categoryId: categoryMap[categoryName?.toLowerCase()] ?? categories[0]?.id ?? '',
          description,
        });
      }
      showSuccess('Importacao concluida');
      await loadData();
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Nova transacao rapida
        </Typography>
        <TransactionForm categories={categories} onSubmit={handleAdd} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="type-filter">Tipo</InputLabel>
            <Select
              labelId="type-filter"
              value={filters.type}
              label="Tipo"
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="income">Receita</MenuItem>
              <MenuItem value="expense">Despesa</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="category-filter">Categoria</InputLabel>
            <Select
              labelId="category-filter"
              value={filters.categoryId}
              label="Categoria"
              onChange={(event) => setFilters((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Busca"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <TextField
            label="De"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
          />
          <TextField
            label="Ate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
          />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={exportCsv}>
            Exportar CSV
          </Button>
          <Button variant="outlined" component="label">
            Importar CSV
            <input type="file" hidden accept=".csv" onChange={importCsv} />
          </Button>
        </Stack>
      </Paper>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descricao</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell align="right">Acoes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(parseISO(tx.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{categories.find((cat) => cat.id === tx.categoryId)?.name ?? 'Outros'}</TableCell>
                  <TableCell>{tx.type === 'income' ? 'Receita' : 'Despesa'}</TableCell>
                  <TableCell>{currencyFormatter.format(tx.amount)}</TableCell>
                  <TableCell align="right">
                    <IconButton edge="end" onClick={() => handleDelete(tx.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
};
