import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";

export const metadata: Metadata = generatePageMetadata({
  path: "/love-meter",
});

export default function LoveMeterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}