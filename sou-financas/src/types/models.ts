export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  description: string;
  paymentMethod?: string;
  recurring?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryKind = 'expense' | 'income' | 'both';

export type Category = {
  id: string;
  userId: string;
  name: string;
  kind: CategoryKind;
  createdAt: string;
};

export type SavingGoalMode = 'targetValue' | 'durationMonths';

export type InterestMode = 'none' | 'percent' | 'fixed';

export type SavingGoal = {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  initialAmount: number;
  monthlyIncrease: number;
  mode: SavingGoalMode;
  targetValue?: number;
  durationMonths?: number;
  interestMode: InterestMode;
  interestValue?: number;
  createdAt: string;
};

export type SavingEntry = {
  id: string;
  goalId: string;
  userId: string;
  monthKey: string;
  plannedAmount: number;
  depositedAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  userId: string;
  themeMode: 'light' | 'dark';
  primaryColor: string;
  currency: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
};
