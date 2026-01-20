import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  LinearProgress,
  TextField,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
  Divider,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getGoals, addGoal, addSavingEntry } from '../services/savingsService';
import type { SavingGoal, SavingEntry } from '../types/models';
import { GoalForm, type GoalFormValues } from '../components/GoalForm';
import { useNotification } from '../components/NotificationProvider';
import { db } from '../db';
import { format, parseISO } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { LoadingFallback } from '../components/LoadingFallback';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const planningMonths = 12;

const computePlan = (goal: SavingGoal) => {
  const months: { monthKey: string; planned: number }[] = [];
  const start = parseISO(goal.startDate);
  for (let index = 0; index < planningMonths; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    let planned = goal.initialAmount + goal.monthlyIncrease * index;
    if (goal.interestMode === 'percent' && goal.interestValue) {
      planned += (planned * goal.interestValue) / 100;
    }
    if (goal.interestMode === 'fixed' && goal.interestValue) {
      planned += goal.interestValue;
    }
    months.push({ monthKey: format(date, 'yyyy-MM'), planned });
  }
  return months;
};

export const SavingsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [entries, setEntries] = useState<SavingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositForm, setDepositForm] = useState({
    goalId: '',
    monthKey: format(new Date(), 'yyyy-MM'),
    amount: '',
  });
  const { showSuccess, showError } = useNotification();

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const goalList = await getGoals(user.id);
    const entryList = await db.savingEntries.where('userId').equals(user.id).toArray();
    setGoals(goalList);
    setEntries(entryList);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [user]);

  const handleGoalSubmit = async (values: GoalFormValues) => {
    if (!user) return;
    try {
      await addGoal({
        userId: user.id,
        name: values.name,
        initialAmount: values.initialAmount,
        monthlyIncrease: values.monthlyIncrease,
        startDate: values.startDate,
        mode: values.mode,
        targetValue: values.targetValue,
        durationMonths: values.durationMonths,
        interestMode: values.interestMode,
        interestValue: values.interestValue,
      });
      showSuccess('Objetivo adicionado');
      await loadData();
    } catch {
      showError('Não foi possível salvar o objetivo');
    }
  };

  const handleDeposit = async () => {
    if (!depositForm.goalId || !user || !depositForm.amount) {
      showError('Preencha o objetivo e valor');
      return;
    }
    const plan = computePlan(goals.find((goal) => goal.id === depositForm.goalId) ?? goals[0]);
    const planned = plan.find((entry) => entry.monthKey === depositForm.monthKey)?.planned;
    try {
      await addSavingEntry({
        goalId: depositForm.goalId,
        userId: user.id,
        monthKey: depositForm.monthKey,
        plannedAmount: planned ?? 0,
        depositedAmount: Number(depositForm.amount),
      });
      showSuccess('Depósito registrado');
      setDepositForm((prev) => ({ ...prev, amount: '' }));
      await loadData();
    } catch {
      showError('Falha ao salvar depósito');
    }
  };

  const entriesByGoal = useMemo(() => {
    const map: Record<string, SavingEntry[]> = {};
    entries.forEach((entry) => {
      if (!map[entry.goalId]) {
        map[entry.goalId] = [];
      }
      map[entry.goalId].push(entry);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.monthKey.localeCompare(b.monthKey)));
    return map;
  }, [entries]);

  const progressByGoal = useMemo(() => {
    return goals.map((goal) => {
      const plan = computePlan(goal);
      const goalEntries = entriesByGoal[goal.id] ?? [];
      const plannedTotal = goalEntries.reduce((sum, entry) => sum + entry.plannedAmount, 0);
      const savedTotal = goalEntries.reduce((sum, entry) => sum + entry.depositedAmount, 0);
      return {
        goal,
        plannedTotal,
        savedTotal,
        difference: plannedTotal - savedTotal,
        plan,
        entries: goalEntries,
      };
    });
  }, [goals, entriesByGoal]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Novo objetivo de poupança
        </Typography>
        <GoalForm onSubmit={handleGoalSubmit} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registrar depósito
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl fullWidth>
            <InputLabel id="goal-select">Objetivo</InputLabel>
            <Select
              labelId="goal-select"
              label="Objetivo"
              value={depositForm.goalId}
              onChange={(event) => setDepositForm((prev) => ({ ...prev, goalId: event.target.value }))}
            >
              {goals.map((goal) => (
                <MenuItem key={goal.id} value={goal.id}>
                  {goal.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Mês"
            type="month"
            InputLabelProps={{ shrink: true }}
            value={depositForm.monthKey}
            onChange={(event) => setDepositForm((prev) => ({ ...prev, monthKey: event.target.value }))}
          />
          <TextField
            label="Valor poupado"
            type="number"
            value={depositForm.amount}
            onChange={(event) => setDepositForm((prev) => ({ ...prev, amount: event.target.value }))}
          />
          <Button variant="contained" onClick={handleDeposit}>
            Registrar
          </Button>
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
        {progressByGoal.map(({ goal, plannedTotal, savedTotal, difference, plan, entries: goalEntries }) => (
          <Paper key={goal.id} sx={{ p: 2, minHeight: 320 }}>
            <Typography variant="h6">{goal.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Planejamento com juros aplicados conforme escolha.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="body1">Planejado: {currencyFormatter.format(plannedTotal)}</Typography>
              <Typography variant="body1">Guardado: {currencyFormatter.format(savedTotal)}</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (savedTotal / (plannedTotal || 1)) * 100)}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Diferenca: {currencyFormatter.format(difference)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Line
              data={{
                labels: plan.map((entry) => entry.monthKey),
                datasets: [
                  {
                    label: 'Planejado',
                    data: plan.map((entry) => entry.planned),
                    borderColor: '#1976d2',
                  },
                  {
                    label: 'Realizado',
                    data: plan.map((entry) =>
                      goalEntries.find((record) => record.monthKey === entry.monthKey)?.depositedAmount ?? 0,
                    ),
                    borderColor: '#2e7d32',
                  },
                ],
              }}
            />
          </Paper>
        ))}
      </Box>
    </Stack>
  );
};
