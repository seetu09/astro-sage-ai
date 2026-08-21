import type { ChatHistoryEntry, KundaliHistoryEntry } from "@/types/user";

const KUNDALI_HISTORY_KEY = "astroveda-kundali-history";
const CHAT_HISTORY_KEY = "astroveda-chat-history";
const HISTORY_LIMIT = 25;

function readEntries<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function writeEntries<T>(key: string, entries: T[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    // Storage may be unavailable in privacy mode; history remains optional.
  }
}

export function getKundaliHistory(userId: string): KundaliHistoryEntry[] {
  return readEntries<KundaliHistoryEntry>(KUNDALI_HISTORY_KEY).filter(
    (entry) => entry.userId === userId,
  );
}

export function saveKundaliHistory(entry: KundaliHistoryEntry) {
  const entries = readEntries<KundaliHistoryEntry>(KUNDALI_HISTORY_KEY);
  writeEntries(KUNDALI_HISTORY_KEY, [entry, ...entries.filter((item) => item.id !== entry.id)]);
}

export function getChatHistory(userId: string): ChatHistoryEntry[] {
  return readEntries<ChatHistoryEntry>(CHAT_HISTORY_KEY).filter(
    (entry) => entry.userId === userId,
  );
}

export function saveChatHistory(entry: ChatHistoryEntry) {
  const entries = readEntries<ChatHistoryEntry>(CHAT_HISTORY_KEY);
  writeEntries(CHAT_HISTORY_KEY, [entry, ...entries.filter((item) => item.id !== entry.id)]);
}