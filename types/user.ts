export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export type ProfileMenuAction =
  | "personal-details"
  | "kundali-history"
  | "chat-history"
  | "wallet-details"
  | "payment-history";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "wallet_topup" | "wallet_debit";
  amount: number;
  currency: "INR";
  status: "completed";
  createdAt: string;
  orderId?: string;
  paymentId?: string;
  description: string;
}

export interface KundaliHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  messages: ChatHistoryMessage[];
}