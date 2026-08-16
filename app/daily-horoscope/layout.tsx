import { Metadata } from "next";
import { generatePageMetadata } from "@/app/components/SEOWrapper";

export const metadata: Metadata = generatePageMetadata({
  path: "/daily-horoscope",
});

export default function DailyHoroscopeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
