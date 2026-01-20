import { db } from '../db';

export const updateUserName = async (userId: string, name: string): Promise<void> => {
  await db.users.update(userId, { name });
};

export const resetUserData = async (userId: string): Promise<void> => {
  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.savingGoals,
    db.savingEntries,
    async () => {
      await db.transactions.where('userId').equals(userId).delete();
      await db.categories.where('userId').equals(userId).delete();
      await db.savingGoals.where('userId').equals(userId).delete();
      await db.savingEntries.where('userId').equals(userId).delete();
    },
  );
  await db.settings.where('userId').equals(userId).delete();
  await db.sessions.clear();
};
