import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";

export const metadata: Metadata = generatePageMetadata({
  path: "/matchmaking",
});

export default function MatchmakingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
