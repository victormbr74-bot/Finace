import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Paper, Typography, TextField, Button } from '@mui/material';
import { format, subMonths } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { db } from '../db';
import type { Category, SavingEntry, Transaction } from '../types/models';
import { StatCard } from '../components/StatCard';
import { LoadingFallback } from '../components/LoadingFallback';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const buildMonthlyWindow = () =>
  Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(new Date(), index);
    return {
      key: format(date, 'yyyy-MM'),
      label: format(date, 'MMM/yyyy'),
    };
  }).reverse();

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<SavingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

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

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(selectedMonth)),
    [transactions, selectedMonth],
  );

  const incomesThisMonth = monthTransactions.filter((tx) => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
  const expensesThisMonth = monthTransactions.filter((tx) => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
  const balanceThisMonth = incomesThisMonth - expensesThisMonth;
  const savingsEntry = entries.find((entry) => entry.monthKey === selectedMonth);
  const monthWindow = useMemo(buildMonthlyWindow, []);

  const monthlyBalanceData = useMemo(() => {
    return {
      labels: monthWindow.map((month) => month.label),
      data: monthWindow.map((month) => {
        const monthIncome = transactions
          .filter((tx) => tx.date.startsWith(month.key) && tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const monthExpense = transactions
          .filter((tx) => tx.date.startsWith(month.key) && tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);
        return monthIncome - monthExpense;
      }),
    };
  }, [transactions, monthWindow]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    monthTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const category = categories.find((cat) => cat.id === tx.categoryId);
        const label = category ? category.name : 'Outros';
        totals[label] = (totals[label] ?? 0) + tx.amount;
      });
    return totals;
  }, [categories, monthTransactions]);

  const doughnutData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ['#1976d2', '#d32f2f', '#2e7d32', '#f57c00', '#9c27b0', '#0288d1'],
      },
    ],
  };

  const monthlyComparison = {
    labels: monthWindow.map((month) => month.label),
    datasets: [
      {
        label: 'Receitas',
        data: monthWindow.map((month) =>
          transactions
            .filter((tx) => tx.date.startsWith(month.key) && tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0),
        ),
        backgroundColor: '#388e3c',
      },
      {
        label: 'Despesas',
        data: monthWindow.map((month) =>
          transactions
            .filter((tx) => tx.date.startsWith(month.key) && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0),
        ),
        backgroundColor: '#d32f2f',
      },
    ],
  };

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Typography variant="subtitle2">Filtrar mes</Typography>
          <TextField size="small" type="month" value={selectedMonth} onChange={handleMonthChange} />
          <Button variant="outlined" onClick={() => setSelectedMonth(format(new Date(), 'yyyy-MM'))}>
            Mes atual
          </Button>
        </Stack>
      </Paper>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <StatCard label="Despesas do mes" value={currencyFormatter.format(expensesThisMonth)} />
        <StatCard label="Receitas do mes" value={currencyFormatter.format(incomesThisMonth)} />
        <StatCard label="Saldo" value={currencyFormatter.format(balanceThisMonth)} />
        <StatCard
          label="Poupanca do mes"
          value={currencyFormatter.format(savingsEntry ? savingsEntry.depositedAmount : 0)}
          caption={`Planejado ${currencyFormatter.format(savingsEntry?.plannedAmount ?? 0)}`}
        />
      </Box>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Saldo nos ultimos 6 meses
          </Typography>
          <Line
            data={{
              labels: monthlyBalanceData.labels,
              datasets: [
                {
                  label: 'Saldo',
                  data: monthlyBalanceData.data,
                  borderColor: '#1976d2',
                  fill: true,
                },
              ],
            }}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Despesas por categoria
          </Typography>
          <Doughnut data={doughnutData} />
        </Paper>
      </Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Receitas vs Despesas
        </Typography>
        <Bar data={monthlyComparison} />
      </Paper>
    </Stack>
  );
};
