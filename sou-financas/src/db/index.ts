import Dexie, { type Table } from 'dexie';
import type {
  User,
  Transaction,
  Category,
  SavingGoal,
  SavingEntry,
  Settings,
  Session,
} from '../types/models';

export class FinanceDB extends Dexie {
  users!: Table<User, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  savingGoals!: Table<SavingGoal, string>;
  savingEntries!: Table<SavingEntry, string>;
  settings!: Table<Settings, string>;
  sessions!: Table<Session, string>;

  constructor() {
    super('finance-db');
    this.version(1).stores({
      users: '&id, email, createdAt',
      categories: '&id, userId, name, kind',
      transactions: '&id, userId, date, categoryId',
      savingGoals: '&id, userId, startDate',
      savingEntries: '&id, goalId, userId, monthKey, createdAt',
      settings: '&userId, updatedAt',
      sessions: '&id, userId, token, createdAt',
    });
  }
}

export const db = new FinanceDB();
