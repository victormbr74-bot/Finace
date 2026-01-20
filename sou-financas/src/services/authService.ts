import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { User, Session } from '../types/models';
import { ensureDefaultCategories } from './seedService';

type AuthPayload = {
  user: User;
  session: Session;
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthPayload> => {
  const existing = await db.users.where('email').equals(email).count();
  if (existing > 0) {
    throw new Error('Este e-mail já está em uso.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: uuidv4(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await db.users.add(user);
  await ensureDefaultCategories(user.id);
  const session = await createSession(user.id);
  return { user, session };
};

export const login = async (email: string, password: string): Promise<AuthPayload> => {
  const user = await db.users.where('email').equals(email).first();
  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Credenciais inválidas.');
  }

  const session = await createSession(user.id);
  return { user, session };
};

export const logout = async (): Promise<void> => {
  await db.sessions.clear();
};

export const getSession = async (): Promise<Session | undefined> => {
  return db.sessions.get('current');
};

export const getCurrentUser = async (): Promise<User | undefined> => {
  const session = await getSession();
  if (!session) {
    return undefined;
  }
  return db.users.get(session.userId);
};

const createSession = async (userId: string): Promise<Session> => {
  const token = uuidv4();
  const session: Session = {
    id: 'current',
    userId,
    token,
    createdAt: new Date().toISOString(),
  };
  await db.sessions.put(session);
  return session;
};
