import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";

export const metadata: Metadata = generatePageMetadata({
  path: "/kundali",
});

export default function KundaliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
