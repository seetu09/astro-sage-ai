"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  CircleUserRound,
  Download,
  FileClock,
  Loader2,
  MessageCircleMore,
  Plus,
  ReceiptText,
  Save,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import KundliPdfButton from "./KundliPdfButton";
import { getChatHistory, getKundaliHistory } from "@/lib/user-history";
import type {
  ChatHistoryEntry,
  KundaliHistoryEntry,
  ProfileMenuAction,
  WalletTransaction,
} from "@/types/user";

interface UserProfileModalProps {
  isOpen: boolean;
  initialView: ProfileMenuAction;
  onClose: () => void;
}

const sections = [
  { action: "personal-details", label: "Personal Details", icon: CircleUserRound },
  { action: "wallet-details", label: "Wallet & Payments", icon: WalletCards },
  { action: "kundali-history", label: "Kundali History", icon: FileClock },
  { action: "chat-history", label: "Chat History", icon: MessageCircleMore },
] as const;

const inputClass =
  "w-full rounded-lg border border-amber-200/70 bg-white px-3 py-2.5 text-sm text-amber-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-white/5 dark:text-[#F3F4F6] dark:focus:border-[#FFD166]";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadReceipt(transaction: WalletTransaction, customerName: string, email: string) {
  const receipt = [
    "ASTROVEDA PAYMENT RECEIPT",
    "",
    `Receipt: ${transaction.id}`,
    `Date: ${formatDate(transaction.createdAt)}`,
    `Customer: ${customerName}`,
    `Email: ${email}`,
    `Description: ${transaction.description}`,
    `Amount: INR ${transaction.amount.toFixed(2)}`,
    `Status: ${transaction.status.toUpperCase()}`,
    `Order ID: ${transaction.orderId || "Not available"}`,
    `Payment ID: ${transaction.paymentId || "Not available"}`,
    "",
    "Thank you for using AstroVeda.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([receipt], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `astroveda-receipt-${transaction.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function UserProfileModal({ isOpen, initialView, onClose }: UserProfileModalProps) {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { walletBalance, freeMessagesLeft, transactions, openTopUp } = useWallet();
  const [activeView, setActiveView] = useState<ProfileMenuAction>(initialView);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", birthPlace: "", avatar: "" });
  const [kundaliHistory, setKundaliHistory] = useState<KundaliHistoryEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);

  useEffect(() => {
    if (!isOpen || !user) return;
    setActiveView(initialView === "payment-history" ? "wallet-details" : initialView);
    setForm({
      name: user.name || "",
      birthDate: user.birthDate || "",
      birthTime: user.birthTime || "",
      birthPlace: user.birthPlace || "",
      avatar: user.avatar || "",
    });
    setKundaliHistory(getKundaliHistory(user.id));
    setChatHistory(getChatHistory(user.id));
    setSaveMessage("");
    setUploadMessage("");
  }, [initialView, isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const completedTopUps = useMemo(
    () => transactions.filter((transaction) => transaction.type === "wallet_topup"),
    [transactions],
  );

  if (!isOpen || !user) return null;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateProfile({
        name: form.name.trim(),
        birthDate: form.birthDate || undefined,
        birthTime: form.birthTime || undefined,
        birthPlace: form.birthPlace.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
      });
      setSaveMessage("Profile updated successfully.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("");
    try {
      await uploadAvatar(file);
      setUploadMessage("Avatar updated successfully.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Unable to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderPersonalDetails = () => (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center gap-4 border-b border-amber-200/60 pb-5 dark:border-white/10">
        <div className="relative shrink-0">
          {form.avatar ? (
            <img src={form.avatar} alt="Profile preview" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-xl font-bold text-white dark:bg-[#FFD166] dark:text-[#080811]">
              {form.name.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload profile picture"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#FFFDF6] bg-amber-600 text-white shadow-md transition hover:bg-amber-700 disabled:opacity-60 dark:border-[#121026] dark:bg-[#FFD166] dark:text-[#080811] dark:hover:bg-[#E0A96D]"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-amber-950 dark:text-[#F3F4F6]">{user.email}</p>
          <p className="mt-1 text-xs text-amber-800/60 dark:text-[#9CA3AF]">Account email cannot be changed here.</p>
          {uploadMessage && (
            <p className={`mt-1 text-xs font-medium ${uploadMessage.includes("successfully") ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} aria-live="polite">
              {uploadMessage}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-medium text-amber-900/70 dark:text-[#D1D5DB]">
          Full name
          <input className={`${inputClass} mt-1.5`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label className="text-sm font-medium text-amber-900/70 dark:text-[#D1D5DB]">
          Birth date
          <input type="date" className={`${inputClass} mt-1.5 [color-scheme:light] dark:[color-scheme:dark]`} value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-amber-900/70 dark:text-[#D1D5DB]">
          Birth time
          <input type="time" className={`${inputClass} mt-1.5 [color-scheme:light] dark:[color-scheme:dark]`} value={form.birthTime} onChange={(event) => setForm({ ...form, birthTime: event.target.value })} />
        </label>
        <label className="sm:col-span-2 text-sm font-medium text-amber-900/70 dark:text-[#D1D5DB]">
          Place of birth
          <input className={`${inputClass} mt-1.5`} value={form.birthPlace} onChange={(event) => setForm({ ...form, birthPlace: event.target.value })} placeholder="City, State, Country" />
        </label>
      </div>
      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-amber-200/60 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <p className="text-sm text-emerald-700 dark:text-emerald-400" aria-live="polite">{saveMessage}</p>
        <button disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 dark:bg-[#FFD166] dark:text-[#080811]">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </div>
    </form>
  );

  const renderWallet = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase text-amber-700/60 dark:text-[#9CA3AF]">Wallet balance</p>
          <p className="mt-2 text-2xl font-bold text-amber-950 dark:text-[#F3F4F6]">INR {walletBalance.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <p className="text-xs font-semibold uppercase text-emerald-700/70 dark:text-emerald-400">Available tokens</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900 dark:text-emerald-300">{freeMessagesLeft}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-amber-950 dark:text-[#F3F4F6]">Transactions</h3>
          <p className="text-xs text-amber-800/60 dark:text-[#9CA3AF]">Completed wallet payments and receipts</p>
        </div>
        <button onClick={() => { onClose(); openTopUp(); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white dark:bg-[#FFD166] dark:text-[#080811]">
          <Plus className="h-4 w-4" /> Add funds
        </button>
      </div>
      {completedTopUps.length ? (
        <div className="divide-y divide-amber-200/60 overflow-hidden rounded-lg border border-amber-200/70 dark:divide-white/10 dark:border-white/10">
          {completedTopUps.map((transaction) => (
            <div key={transaction.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-amber-600 dark:text-[#FFD166]" />
                  <p className="font-semibold text-amber-950 dark:text-[#F3F4F6]">INR {transaction.amount.toFixed(2)}</p>
                </div>
                <p className="mt-1 text-xs text-amber-800/60 dark:text-[#9CA3AF]">{formatDate(transaction.createdAt)} · {transaction.paymentId || transaction.id}</p>
              </div>
              <button onClick={() => downloadReceipt(transaction, user.name, user.email)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 dark:border-white/15 dark:text-[#D1D5DB] dark:hover:bg-white/5">
                <Download className="h-4 w-4" /> Download Receipt
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyList icon={ReceiptText} title="No transactions yet" description="Completed wallet top-ups will appear here with downloadable receipts." />
      )}
    </div>
  );

  const renderKundaliHistory = () => kundaliHistory.length ? (
    <div className="grid gap-3 sm:grid-cols-2">
      {kundaliHistory.map((entry) => (
        <div key={entry.id} className="rounded-lg border border-amber-200/70 p-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-amber-950 dark:text-[#F3F4F6]">{entry.name}&apos;s chart</h3>
              <p className="mt-1 text-xs text-amber-800/60 dark:text-[#9CA3AF]">{formatDate(entry.createdAt)}</p>
            </div>
            <CalendarDays className="h-4 w-4 shrink-0 text-amber-600 dark:text-[#FFD166]" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <HistoryStat label="Ascendant" value={entry.ascendant} />
            <HistoryStat label="Moon sign" value={entry.moonSign} />
            <HistoryStat label="Nakshatra" value={entry.nakshatra} />
            <HistoryStat label="Birth place" value={entry.placeOfBirth} />
          </dl>
          {/* Download Full 25-Page Kundli — opens the English / हिंदी selector,
              then streams the serverless PDF (client print fallback built in). */}
          <div className="mt-4 border-t border-amber-200/60 pt-3 dark:border-white/10">
            {entry.latitude != null && entry.longitude != null ? (
              <KundliPdfButton compact historyEntry={entry} />
            ) : (
              <a
                href="/kundali"
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-50 dark:border-white/15 dark:text-[#9CA3AF] dark:hover:bg-white/5"
              >
                Regenerate on Kundali page to enable PDF download
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : <EmptyList icon={FileClock} title="No Kundali history" description="Charts generated while signed in will be saved here." actionHref="/kundali" actionLabel="Generate Kundali" />;

  const renderChatHistory = () => chatHistory.length ? (
    <div className="space-y-3">
      {chatHistory.map((entry) => (
        <div key={entry.id} className="rounded-lg border border-amber-200/70 p-4 dark:border-white/10">
          <div className="flex items-start gap-3">
            <MessageCircleMore className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-[#FFD166]" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-amber-950 dark:text-[#F3F4F6]">{entry.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-amber-900/70 dark:text-[#D1D5DB]">{entry.messages.at(-1)?.content}</p>
              <p className="mt-2 text-xs text-amber-800/60 dark:text-[#9CA3AF]">{entry.messages.length} messages · {formatDate(entry.updatedAt)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : <EmptyList icon={MessageCircleMore} title="No chat history" description="Astrology conversations started while signed in will be saved here." actionHref="/chat" actionLabel="Start a chat" />;

  const titles: Record<string, string> = {
    "personal-details": "Personal Details",
    "wallet-details": "Wallet & Payments",
    "payment-history": "Wallet & Payments",
    "kundali-history": "Kundali History",
    "chat-history": "Chat History",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg border border-amber-200/70 bg-[#FFFDF6] shadow-2xl sm:h-auto sm:max-h-[86vh] sm:max-w-5xl sm:rounded-lg dark:border-white/10 dark:bg-[#121026]">
        <header className="flex items-center justify-between border-b border-amber-200/60 px-4 py-3 sm:px-5 dark:border-white/10">
          <div className="min-w-0">
            <h2 id="profile-modal-title" className="truncate text-lg font-bold text-amber-950 dark:text-[#F3F4F6]">{titles[activeView]}</h2>
            <p className="truncate text-xs text-amber-800/60 dark:text-[#9CA3AF]">{user.email}</p>
          </div>
          <button onClick={onClose} aria-label="Close profile" className="rounded-lg p-2 text-amber-800/60 hover:bg-amber-100 dark:text-[#9CA3AF] dark:hover:bg-white/5"><X className="h-5 w-5" /></button>
        </header>
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-amber-200/60 p-2 sm:hidden dark:border-white/10" aria-label="Profile sections">
          {sections.map(({ action, label, icon: Icon }) => (
            <button key={action} onClick={() => setActiveView(action)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeView === action ? "bg-amber-600 text-white dark:bg-[#FFD166] dark:text-[#080811]" : "text-amber-900/70 dark:text-[#D1D5DB]"}`}><Icon className="h-4 w-4" />{label}</button>
          ))}
        </nav>
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-56 shrink-0 border-r border-amber-200/60 p-3 sm:block dark:border-white/10">
            {sections.map(({ action, label, icon: Icon }) => (
              <button key={action} onClick={() => setActiveView(action)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${activeView === action ? "bg-amber-100 text-amber-950 dark:bg-[#FFD166]/10 dark:text-[#FFD166]" : "text-amber-900/60 hover:bg-amber-50 dark:text-[#9CA3AF] dark:hover:bg-white/5"}`}><Icon className="h-4 w-4" />{label}</button>
            ))}
          </aside>
          <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {activeView === "personal-details" && renderPersonalDetails()}
            {(activeView === "wallet-details" || activeView === "payment-history") && renderWallet()}
            {activeView === "kundali-history" && renderKundaliHistory()}
            {activeView === "chat-history" && renderChatHistory()}
          </div>
        </div>
      </section>
    </div>
  );
}

function HistoryStat({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs text-amber-800/50 dark:text-[#9CA3AF]">{label}</dt><dd className="truncate font-medium text-amber-950 dark:text-[#F3F4F6]">{value}</dd></div>;
}

function EmptyList({ icon: Icon, title, description, actionHref, actionLabel }: { icon: typeof FileClock; title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-amber-300 p-6 text-center dark:border-white/15">
      <Icon className="h-8 w-8 text-amber-500 dark:text-[#FFD166]" />
      <h3 className="mt-3 font-semibold text-amber-950 dark:text-[#F3F4F6]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-amber-800/60 dark:text-[#9CA3AF]">{description}</p>
      {actionHref && actionLabel && <Link href={actionHref} className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white dark:bg-[#FFD166] dark:text-[#080811]">{actionLabel}</Link>}
    </div>
  );
}