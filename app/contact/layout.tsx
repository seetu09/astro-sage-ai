import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";

export const metadata: Metadata = generatePageMetadata({
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
