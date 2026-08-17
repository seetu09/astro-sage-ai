import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";
import ChatScrollLock from "./ChatScrollLock";

export const metadata: Metadata = generatePageMetadata({
  path: "/chat",
});

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ChatScrollLock />
      {children}
    </>
  );
}
