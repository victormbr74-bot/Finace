import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Transaction, TransactionType } from '../types/models';

export type TransactionFilters = {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  search?: string;
};

export const getTransactions = async (userId: string, filters?: TransactionFilters): Promise<Transaction[]> => {
  let collection = db.transactions.where('userId').equals(userId);
  if (filters?.startDate) {
    collection = collection.and((tx) => tx.date >= filters.startDate!);
  }
  if (filters?.endDate) {
    collection = collection.and((tx) => tx.date <= filters.endDate!);
  }
  const transactions = await collection.toArray();
  return transactions
    .filter((tx) => {
      const matchesSearch = filters?.search ? tx.description.toLowerCase().includes(filters.search.toLowerCase()) : true;
      const matchesType = filters?.type ? tx.type === filters.type : true;
      const matchesCategory = filters?.categoryId ? tx.categoryId === filters.categoryId : true;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addTransaction = async (payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const now = new Date().toISOString();
  await db.transactions.add({
    id: uuidv4(),
    ...payload,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateTransaction = async (id: string, payload: Partial<Transaction>): Promise<void> => {
  await db.transactions.update(id, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await db.transactions.delete(id);
};
