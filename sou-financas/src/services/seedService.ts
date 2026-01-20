import { db } from '../db';
import type { Category, Transaction, SavingGoal } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import { subMonths, format } from 'date-fns';

const DEFAULT_CATEGORIES: Array<Pick<Category, 'name' | 'kind'>> = [
  { name: 'Alimentacao', kind: 'expense' },
  { name: 'Transporte', kind: 'expense' },
  { name: 'Moradia', kind: 'expense' },
  { name: 'Saude', kind: 'expense' },
  { name: 'Lazer', kind: 'expense' },
  { name: 'Educacao', kind: 'expense' },
  { name: 'Outros', kind: 'expense' },
  { name: 'Salario', kind: 'income' },
  { name: 'Freelance', kind: 'income' },
];

export const ensureDefaultCategories = async (userId: string): Promise<void> => {
  const existing = await db.categories.where('userId').equals(userId).count();
  if (existing > 0) {
    return;
  }

  const now = new Date().toISOString();
  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      db.categories.add({
        id: uuidv4(),
        userId,
        name: category.name,
        kind: category.kind,
        createdAt: now,
      }),
    ),
  );
};

export const seedDemoData = async (userId: string): Promise<void> => {
  await ensureDefaultCategories(userId);
  const categories = await db.categories.where('userId').equals(userId).toArray();
  const expenseCategory = categories.find((category) => category.kind === 'expense');
  const incomeCategory = categories.find((category) => category.kind === 'income') || categories[0];
  if (!incomeCategory || !expenseCategory) {
    return;
  }

  const transactions: Transaction[] = [];
  for (let i = 0; i < 6; i += 1) {
    const baseDate = subMonths(new Date(), i);
    const date = format(baseDate, 'yyyy-MM-15');
    const now = new Date().toISOString();
    transactions.push(
      {
        id: uuidv4(),
        userId,
        type: 'income',
        amount: 5000 + i * 100,
        date,
        categoryId: incomeCategory.id,
        description: 'Salario mensal',
        paymentMethod: 'PIX',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        userId,
        type: 'expense',
        amount: 2500 + i * 120,
        date,
        categoryId: expenseCategory.id,
        description: 'Despesas mensais',
        paymentMethod: 'Cartao',
        createdAt: now,
        updatedAt: now,
      },
    );
  }
  await db.transactions.bulkPut(transactions);

  const goalId = uuidv4();
  const goal: SavingGoal = {
    id: goalId,
    userId,
    name: 'Reserva de Emergencia',
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-01'),
    initialAmount: 200,
    monthlyIncrease: 100,
    mode: 'durationMonths',
    durationMonths: 12,
    interestMode: 'percent',
    interestValue: 0.5,
    createdAt: new Date().toISOString(),
  };
  await db.savingGoals.put(goal);

  const entries = [];
  for (let i = 0; i < 6; i += 1) {
    const monthDate = subMonths(new Date(), i);
    const monthKey = format(monthDate, 'yyyy-MM');
    const plannedAmount = goal.initialAmount + i * goal.monthlyIncrease;
    entries.push({
      id: uuidv4(),
      goalId,
      userId,
      monthKey,
      plannedAmount,
      depositedAmount: plannedAmount - 50 + i * 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await db.savingEntries.bulkPut(entries);
};
