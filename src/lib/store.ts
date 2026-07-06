import { useSyncExternalStore } from "react";

export type RiskLevel = "safe" | "low" | "medium" | "high";
export type Prediction = "Normal" | "Offensive" | "Hate Speech";
export type DetectionMethod = "safe_phrase" | "keyword" | "ml_model";
export type ActionTaken = "none" | "logged" | "warned" | "deleted" | "timeout" | "banned";
export type UserStatus = "active" | "warned" | "timeout" | "banned";

export interface FlaggedMessage {
  id: string;
  content: string;
  author: string;
  channel: string;
  platform: "Discord" | "Reddit" | "Twitter" | "HackerNews" | "Manual";
  createdAt: number;
  prediction: Prediction;
  label: string;
  warning: RiskLevel;
  method: DetectionMethod;
  matchedKeyword?: string;
  confidence: { Normal: number; Offensive: number; "Hate Speech": number };
  action: ActionTaken;
  reviewed: boolean;
  moderatorNote?: string;
  overridden?: boolean;
}

export interface TrackedUser {
  id: string;
  username: string;
  avatarSeed: string;
  strikes: number;
  status: UserStatus;
  firstSeen: number;
  lastOffense?: number;
  totalMessages: number;
  flaggedMessages: number;
}

export interface Settings {
  apiUrl: string;
  useMockApi: boolean;
  autoModerate: boolean;
  strikeLimit: number;
}

interface State {
  messages: FlaggedMessage[];
  users: TrackedUser[];
  settings: Settings;
}

const KEY = "discourseguard:v1";

const defaultSettings: Settings = {
  apiUrl: "https://discourseguard-api.up.railway.app",
  useMockApi: true,
  autoModerate: true,
  strikeLimit: 3,
};

function seed(): State {
  const now = Date.now();
  const users: TrackedUser[] = [
    { id: "u1", username: "alex_dev", avatarSeed: "alex", strikes: 0, status: "active", firstSeen: now - 86400000 * 30, totalMessages: 421, flaggedMessages: 0 },
    { id: "u2", username: "troll_master99", avatarSeed: "troll", strikes: 2, status: "timeout", firstSeen: now - 86400000 * 12, lastOffense: now - 3600000 * 2, totalMessages: 78, flaggedMessages: 6 },
    { id: "u3", username: "jenny_writes", avatarSeed: "jenny", strikes: 0, status: "active", firstSeen: now - 86400000 * 45, totalMessages: 892, flaggedMessages: 0 },
    { id: "u4", username: "angry_user42", avatarSeed: "angry", strikes: 1, status: "warned", firstSeen: now - 86400000 * 3, lastOffense: now - 3600000 * 5, totalMessages: 34, flaggedMessages: 2 },
    { id: "u5", username: "spam_account", avatarSeed: "spam", strikes: 3, status: "banned", firstSeen: now - 86400000 * 5, lastOffense: now - 86400000, totalMessages: 12, flaggedMessages: 8 },
    { id: "u6", username: "curious_mind", avatarSeed: "curious", strikes: 0, status: "active", firstSeen: now - 86400000 * 60, totalMessages: 1204, flaggedMessages: 0 },
  ];
  const messages: FlaggedMessage[] = [
    {
      id: "m1", content: "I really hate people from that group, they should be banned everywhere", author: "troll_master99", channel: "#general", platform: "Discord",
      createdAt: now - 3600000 * 2, prediction: "Hate Speech", label: "Hate Speech Detected", warning: "high", method: "ml_model",
      confidence: { Normal: 0.05, Offensive: 0.18, "Hate Speech": 0.77 }, action: "deleted", reviewed: false,
    },
    {
      id: "m2", content: "This is such a stupid idea, worst thing I've read today", author: "angry_user42", channel: "#feedback", platform: "Discord",
      createdAt: now - 3600000 * 5, prediction: "Offensive", label: "Offensive Language", warning: "medium", method: "ml_model",
      confidence: { Normal: 0.22, Offensive: 0.68, "Hate Speech": 0.10 }, action: "warned", reviewed: true, moderatorNote: "Confirmed offensive tone",
    },
    {
      id: "m3", content: "kill it with fire lol this project is awesome", author: "alex_dev", channel: "#dev-chat", platform: "Discord",
      createdAt: now - 3600000 * 8, prediction: "Normal", label: "Safe Phrase Override", warning: "safe", method: "safe_phrase",
      confidence: { Normal: 0.95, Offensive: 0.04, "Hate Speech": 0.01 }, action: "none", reviewed: true, matchedKeyword: "kill it with fire",
    },
    {
      id: "m4", content: "get lost you idiot", author: "spam_account", channel: "#general", platform: "Discord",
      createdAt: now - 86400000, prediction: "Offensive", label: "Keyword Match", warning: "medium", method: "keyword",
      matchedKeyword: "idiot", confidence: { Normal: 0.15, Offensive: 0.72, "Hate Speech": 0.13 }, action: "deleted", reviewed: true,
    },
    {
      id: "m5", content: "the ML pipeline for this model is really well documented", author: "jenny_writes", channel: "#ml-discuss", platform: "Reddit",
      createdAt: now - 3600000 * 12, prediction: "Normal", label: "Normal Speech", warning: "safe", method: "ml_model",
      confidence: { Normal: 0.94, Offensive: 0.05, "Hate Speech": 0.01 }, action: "none", reviewed: true,
    },
    {
      id: "m6", content: "your kind doesn't belong on this platform, leave", author: "spam_account", channel: "#introductions", platform: "Discord",
      createdAt: now - 3600000 * 26, prediction: "Hate Speech", label: "Hate Speech Detected", warning: "high", method: "ml_model",
      confidence: { Normal: 0.08, Offensive: 0.24, "Hate Speech": 0.68 }, action: "banned", reviewed: true,
    },
    {
      id: "m7", content: "this thread is trash, delete it", author: "angry_user42", channel: "#feedback", platform: "HackerNews",
      createdAt: now - 3600000 * 30, prediction: "Offensive", label: "Low-Risk Offensive", warning: "low", method: "ml_model",
      confidence: { Normal: 0.42, Offensive: 0.52, "Hate Speech": 0.06 }, action: "logged", reviewed: false,
    },
  ];
  return { messages, users, settings: defaultSettings };
}

function load(): State {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as State;
    return { ...seed(), ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
  } catch {
    return seed();
  }
}

let state: State = typeof window === "undefined" ? seed() : load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

export const store = {
  getState: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  addMessage(msg: FlaggedMessage) {
    set((s) => ({ ...s, messages: [msg, ...s.messages] }));
  },
  updateMessage(id: string, patch: Partial<FlaggedMessage>) {
    set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  },
  deleteMessage(id: string) {
    set((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) }));
  },
  clearMessages() {
    set((s) => ({ ...s, messages: [] }));
  },
  addOrUpdateUser(username: string, patch: Partial<TrackedUser> = {}) {
    set((s) => {
      const existing = s.users.find((u) => u.username === username);
      if (existing) {
        return {
          ...s,
          users: s.users.map((u) =>
            u.username === username ? { ...u, ...patch, totalMessages: (u.totalMessages ?? 0) + 1 } : u,
          ),
        };
      }
      const nu: TrackedUser = {
        id: `u${Date.now()}`, username, avatarSeed: username, strikes: 0, status: "active",
        firstSeen: Date.now(), totalMessages: 1, flaggedMessages: 0, ...patch,
      };
      return { ...s, users: [...s.users, nu] };
    });
  },
  updateUser(id: string, patch: Partial<TrackedUser>) {
    set((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  },
  incrementStrike(username: string): TrackedUser | null {
    let updated: TrackedUser | null = null;
    set((s) => {
      const users = s.users.map((u) => {
        if (u.username !== username) return u;
        const newStrikes = u.strikes + 1;
        const status: UserStatus = newStrikes >= 3 ? "banned" : newStrikes === 2 ? "timeout" : "warned";
        updated = { ...u, strikes: newStrikes, status, lastOffense: Date.now(), flaggedMessages: u.flaggedMessages + 1 };
        return updated;
      });
      if (!updated) {
        const nu: TrackedUser = {
          id: `u${Date.now()}`, username, avatarSeed: username, strikes: 1, status: "warned",
          firstSeen: Date.now(), lastOffense: Date.now(), totalMessages: 1, flaggedMessages: 1,
        };
        updated = nu;
        return { ...s, users: [...s.users, nu] };
      }
      return { ...s, users };
    });
    return updated;
  },
  resetUserStrikes(id: string) {
    set((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, strikes: 0, status: "active" } : u)) }));
  },
  setSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  resetAll() {
    state = seed();
    persist();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(seed()),
  );
}
