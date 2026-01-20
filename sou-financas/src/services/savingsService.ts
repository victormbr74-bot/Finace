import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { SavingGoal, SavingEntry } from '../types/models';

export const getGoals = async (userId: string): Promise<SavingGoal[]> => {
  return db.savingGoals.where('userId').equals(userId).toArray();
};

export const addGoal = async (payload: Omit<SavingGoal, 'id' | 'createdAt'>): Promise<void> => {
  await db.savingGoals.add({
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...payload,
  });
};

export const updateGoal = async (id: string, payload: Partial<SavingGoal>): Promise<void> => {
  await db.savingGoals.update(id, payload);
};

export const deleteGoal = async (id: string): Promise<void> => {
  await db.savingGoals.delete(id);
};

export const addSavingEntry = async (payload: Omit<SavingEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const now = new Date().toISOString();
  await db.savingEntries.add({
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...payload,
  });
};

export const updateSavingEntry = async (id: string, payload: Partial<SavingEntry>): Promise<void> => {
  await db.savingEntries.update(id, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
};

export const getEntriesForGoal = async (goalId: string): Promise<SavingEntry[]> => {
  return db.savingEntries.where('goalId').equals(goalId).toArray();
};
