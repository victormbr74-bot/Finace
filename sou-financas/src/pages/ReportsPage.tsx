import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { db } from '../db';
import { Doughnut, Bar } from 'react-chartjs-2';
import { LoadingFallback } from '../components/LoadingFallback';
import type { Transaction, Category, SavingEntry } from '../types/models';

const essentialTags = ['Moradia', 'Alimentacao', 'Saude', 'Transporte'];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<SavingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [txs, cats, savingEntries] = await Promise.all([
        db.transactions.where('userId').equals(user.id).toArray(),
        db.categories.where('userId').equals(user.id).toArray(),
        db.savingEntries.where('userId').equals(user.id).toArray(),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setEntries(savingEntries);
      setLoading(false);
    })();
  }, [user]);

  const years = useMemo(() => {
    const unique = Array.from(new Set(transactions.map((tx) => tx.date.slice(0, 4))));
    return unique.sort((a, b) => Number(b) - Number(a));
  }, [transactions]);

  useEffect(() => {
    if (years.length && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const yearTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(year)),
    [transactions, year],
  );

  const expensesByCategory = useMemo(() => {
    const buckets: Record<string, number> = {};
    yearTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const category = categories.find((cat) => cat.id === tx.categoryId);
        const name = category?.name ?? 'Outros';
        buckets[name] = (buckets[name] ?? 0) + tx.amount;
      });
    return buckets;
  }, [categories, yearTransactions]);

  const monthlyTotals = useMemo(() => {
    const buckets: Record<string, number> = {};
    yearTransactions.forEach((tx) => {
      const month = tx.date.slice(0, 7);
      buckets[month] = (buckets[month] ?? 0) + tx.amount;
    });
    const sorted = Object.entries(buckets).sort();
    return {
      labels: sorted.map(([month]) => month.replace('-', '/')),
      data: sorted.map(([, value]) => value),
    };
  }, [yearTransactions]);

  const totalIncome = useMemo(
    () => yearTransactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
    [yearTransactions],
  );
  const totalSaved = useMemo(
    () => entries.filter((entry) => entry.monthKey.startsWith(year)).reduce((sum, entry) => sum + entry.depositedAmount, 0),
    [entries, year],
  );

  const essentialExpenses = useMemo(
    () =>
      yearTransactions
        .filter((tx) => tx.type === 'expense')
        .filter((tx) => {
          const category = categories.find((cat) => cat.id === tx.categoryId);
          return category ? essentialTags.includes(category.name) : false;
        })
        .reduce((sum, tx) => sum + tx.amount, 0),
    [categories, yearTransactions],
  );

  const discretionaryExpenses = useMemo(
    () => yearTransactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0) - essentialExpenses,
    [yearTransactions, essentialExpenses],
  );

  const topExpenses = useMemo(
    () =>
      Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
    [expensesByCategory],
  );

  const suggestionCategory = topExpenses.length
    ? `Categoria que mais pesa: ${topExpenses[0].name}`
    : 'Sem dados suficientes';

  const suggestionMonth = monthlyTotals.data.length
    ? `Mes mais caro: ${monthlyTotals.labels[monthlyTotals.data.indexOf(Math.max(...monthlyTotals.data))]}`
    : 'Sem registros';

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Typography variant="h6">Visao anual</Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select">Ano</InputLabel>
            <Select labelId="year-select" value={year} label="Ano" onChange={(event) => setYear(event.target.value)}>
              {years.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Despesas por categoria
          </Typography>
          <Doughnut
            data={{
              labels: Object.keys(expensesByCategory),
              datasets: [
                {
                  data: Object.values(expensesByCategory),
                  backgroundColor: ['#1976d2', '#d32f2f', '#2e7d32', '#ff8f00', '#9c27b0'],
                },
              ],
            }}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Gastos mensais
          </Typography>
          <Bar
            data={{
              labels: monthlyTotals.labels,
              datasets: [
                {
                  label: 'Despesas',
                  data: monthlyTotals.data,
                  backgroundColor: '#d32f2f',
                },
              ],
            }}
          />
        </Paper>
      </Box>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Top 10 maiores despesas
          </Typography>
          <List dense>
            {topExpenses.map((item) => (
              <React.Fragment key={item.name}>
                <ListItem>
                  <ListItemText primary={item.name} secondary={currencyFormatter.format(item.value)} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Saude financeira
          </Typography>
          <Typography>Taxa de poupanca: {totalIncome ? ((totalSaved / totalIncome) * 100).toFixed(1) : '0'}%</Typography>
          <Typography>Essenciais: {currencyFormatter.format(essentialExpenses)}</Typography>
          <Typography>Superfluos: {currencyFormatter.format(discretionaryExpenses)}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>{suggestionCategory}</Typography>
          <Typography>{suggestionMonth}</Typography>
        </Paper>
      </Box>
    </Stack>
  );
};
