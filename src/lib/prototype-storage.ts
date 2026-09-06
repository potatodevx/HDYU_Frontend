import { generateHdyuUserId } from "@/lib/utils";

const USERS_KEY = "hdyu.prototype.users.v1";
const SESSION_KEY = "hdyu.prototype.session.v1";
const ACTIVITIES_KEY = "hdyu.prototype.activities.v1";

export const PROTOTYPE_DATA_EVENT = "hdyu:prototype-data-changed";

export type PrototypeRole = "USER" | "ADMIN";

export interface PrototypeUser {
  id: string;
  hdyuId: string;
  name: string;
  email: string;
  role: PrototypeRole;
  walletAddress: string | null;
  createdAt: string;
}

interface StoredPrototypeUser extends PrototypeUser {
  password: string;
}

export interface PrototypeActivity {
  id: string;
  ownerId: string;
  category: string;
  title: string;
  description: string;
  proofUrl: string | null;
  status: "PENDING" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED";
  rewardAmount: number | null;
  adminNote: string | null;
  payoutTx: string | null;
  createdAt: string;
}

export interface ActivityDraft {
  category: string;
  title: string;
  description: string;
  proofUrl?: string;
}

type AuthResult =
  | { ok: true; user: PrototypeUser }
  | { ok: false; error: string };

const REWARD_BY_CATEGORY: Record<string, number> = {
  GREEN_ACTIVITY: 25,
  GARDENING: 20,
  FARMING: 50,
  GREEN_PURCHASE: 10,
  TRAVEL: 15,
  REFERRAL: 10,
  CAMPAIGN: 30,
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readArray<T>(key: string): T[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(PROTOTYPE_DATA_EVENT));
}

function publicUser(user: StoredPrototypeUser): PrototypeUser {
  return {
    id: user.id,
    hdyuId: user.hdyuId,
    name: user.name,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt,
  };
}

function storedUsers() {
  return readArray<StoredPrototypeUser>(USERS_KEY);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getPrototypeSessionUser(): PrototypeUser | null {
  if (!canUseStorage()) return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const user = storedUsers().find((item) => item.email === email);
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return publicUser(user);
}

export function registerPrototypeUser(input: {
  name: string;
  email: string;
  password: string;
}): AuthResult {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) return { ok: false, error: "Name must be at least 2 characters" };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" };
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, error: "Password must contain at least one letter and one number" };
  }

  const users = storedUsers();
  if (users.some((item) => item.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  let hdyuId = generateHdyuUserId();
  for (let attempt = 0; attempt < 10 && users.some((item) => item.hdyuId === hdyuId); attempt++) {
    hdyuId = generateHdyuUserId();
  }

  const user: StoredPrototypeUser = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${hdyuId}`,
    hdyuId,
    name,
    email,
    password,
    role: "USER",
    walletAddress: null,
    createdAt: new Date().toISOString(),
  };

  writeArray(USERS_KEY, [...users, user]);
  window.localStorage.setItem(SESSION_KEY, email);
  return { ok: true, user: publicUser(user) };
}

export function loginPrototypeUser(emailInput: string, password: string): AuthResult {
  const email = normalizeEmail(emailInput);
  const user = storedUsers().find((item) => item.email === email && item.password === password);
  if (!user) return { ok: false, error: "Invalid email or password" };
  window.localStorage.setItem(SESSION_KEY, user.email);
  return { ok: true, user: publicUser(user) };
}

export function logoutPrototypeUser() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function updatePrototypeUser(
  emailInput: string,
  updates: Pick<PrototypeUser, "walletAddress">
): PrototypeUser | null {
  const email = normalizeEmail(emailInput);
  const users = storedUsers();
  const index = users.findIndex((item) => item.email === email);
  if (index < 0) return null;
  users[index] = { ...users[index], ...updates };
  writeArray(USERS_KEY, users);
  return publicUser(users[index]);
}

export function findPrototypeUserByHdyuId(hdyuId: string): PrototypeUser | null {
  const user = storedUsers().find((item) => item.hdyuId === hdyuId.trim().toUpperCase());
  return user ? publicUser(user) : null;
}

export function findPrototypeUserByWallet(address: string): PrototypeUser | null {
  const user = storedUsers().find((item) => item.walletAddress === address);
  return user ? publicUser(user) : null;
}

export function getPrototypeActivities(ownerId: string): PrototypeActivity[] {
  return readArray<PrototypeActivity>(ACTIVITIES_KEY)
    .filter((activity) => activity.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPrototypeActivity(ownerId: string, draft: ActivityDraft): PrototypeActivity {
  const activities = readArray<PrototypeActivity>(ACTIVITIES_KEY);
  const activity: PrototypeActivity = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    ownerId,
    category: draft.category,
    title: draft.title.trim(),
    description: draft.description.trim(),
    proofUrl: draft.proofUrl?.trim() || null,
    status: "PENDING",
    rewardAmount: REWARD_BY_CATEGORY[draft.category] ?? 10,
    adminNote: null,
    payoutTx: null,
    createdAt: new Date().toISOString(),
  };
  writeArray(ACTIVITIES_KEY, [activity, ...activities]);
  return activity;
}
