import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";

export const metadata: Metadata = generatePageMetadata({
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
