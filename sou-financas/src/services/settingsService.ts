import { db } from '../db';
import type { Settings } from '../types/models';

const DEFAULT_SETTINGS: Omit<Settings, 'userId' | 'updatedAt'> = {
  themeMode: 'light',
  primaryColor: '#1976d2',
  currency: 'BRL',
};

export const getSettingsFor = async (userId: string): Promise<Settings> => {
  const saved = await db.settings.get(userId);
  if (saved) {
    return saved;
  }

  const initial: Settings = {
    userId,
    ...DEFAULT_SETTINGS,
    updatedAt: new Date().toISOString(),
  };
  await db.settings.put(initial);
  return initial;
};

export const saveSettings = async (settings: Omit<Settings, 'updatedAt'>): Promise<void> => {
  await db.settings.put({
    ...settings,
    updatedAt: new Date().toISOString(),
  });
};
