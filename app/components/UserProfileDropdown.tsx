"use client";

import type { User } from "../context/AuthContext";
import type { ProfileMenuAction } from "@/types/user";
import {
  CircleUserRound,
  FileClock,
  LogOut,
  MessageCircleMore,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export type { ProfileMenuAction } from "@/types/user";

interface UserProfileDropdownProps {
  user: User;
  onPlaceholderAction: (action: ProfileMenuAction) => void;
  onLogout: () => void;
  className?: string;
}

const accountItems = [
  { action: "personal-details", label: "Personal Details", icon: CircleUserRound },
  { action: "kundali-history", label: "Kundali History", icon: FileClock },
  { action: "chat-history", label: "Chat History", icon: MessageCircleMore },
] as const;

const billingItems = [
  { action: "wallet-details", label: "Wallet Balance / Details", icon: WalletCards },
  { action: "payment-history", label: "Payment History & Receipts", icon: ReceiptText },
] as const;

function UserAvatar({ user }: { user: User }) {
  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.name}'s profile`}
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-amber-200/80 dark:ring-[#FFD166]/30"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-600 text-base font-bold text-white ring-2 ring-amber-200/80 dark:from-[#FFD166] dark:to-[#E0A96D] dark:text-[#080811] dark:ring-[#FFD166]/30">
      {initial}
    </div>
  );
}

export default function UserProfileDropdown({
  user,
  onPlaceholderAction,
  onLogout,
  className = "",
}: UserProfileDropdownProps) {
  const { t } = useLanguage();
  const renderItems = (
    items: readonly {
      action: ProfileMenuAction;
      label: string;
      icon: typeof CircleUserRound;
    }[],
  ) =>
    items.map(({ action, label, icon: Icon }) => (
      <button
        key={action}
        type="button"
        role="menuitem"
        onClick={() => onPlaceholderAction(action)}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-amber-900/80 transition-colors hover:bg-amber-100/70 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-[#D1D5DB] dark:hover:bg-white/5 dark:hover:text-[#F3F4F6] dark:focus-visible:ring-[#FFD166]"
      >
        <Icon className="h-4 w-4 shrink-0 text-amber-600 transition-colors group-hover:text-amber-700 dark:text-[#E0A96D] dark:group-hover:text-[#FFD166]" />
        <span>{label}</span>
      </button>
    ));

  return (
    <div
      role="menu"
       aria-label={t.common.userProfileMenu}
      className={`overflow-hidden rounded-2xl border border-amber-200/70 bg-[#FFFDF6]/95 shadow-xl shadow-amber-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#121026]/95 dark:shadow-black/30 ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-amber-200/60 px-4 py-4 dark:border-white/10">
        <UserAvatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-amber-950 dark:text-[#F3F4F6]">
            {user.name || "User"}
          </p>
          <p className="mt-0.5 truncate text-xs text-amber-800/60 dark:text-[#9CA3AF]">
            {user.email}
          </p>
        </div>
      </div>

      <div className="px-2 py-2">
        <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/50 dark:text-[#9CA3AF]">
          Account &amp; Astrological Records
        </p>
        {renderItems(accountItems)}
      </div>

      <div className="border-t border-amber-200/60 px-2 py-2 dark:border-white/10">
        <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700/50 dark:text-[#9CA3AF]">
          Wallet &amp; Billing
        </p>
        {renderItems(billingItems)}
      </div>

      <div className="border-t border-amber-200/60 p-2 dark:border-white/10">
        <button
          type="button"
          role="menuitem"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
           <span>{t.common.logout}</span>
        </button>
      </div>
    </div>
  );
}