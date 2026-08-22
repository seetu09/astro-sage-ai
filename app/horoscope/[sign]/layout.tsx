import type { Metadata } from "next";
import { zodiacSigns } from "@/data/horoscope-data";

const SITE_URL = "https://astro-sage-ai.vercel.app";

export function generateMetadata({
  params,
}: {
  params: { sign: string };
}): Metadata {
  const signId = params.sign?.toLowerCase() || "aries";
  const signData = zodiacSigns.find((s) => s.id === signId);
  const signName = signData ? signData.name.en : "Aries";
  const symbol = signData?.symbol ?? "♈";
  const dates = signData?.dates.en ?? "";

  const title = `${signName} Horoscope Today – Daily Astrology Predictions ${symbol}`;
  const description = `Read today's ${signName} horoscope (${dates}). Get daily predictions for love, career, money & health, plus lucky color, number and time for ${signName}.`;
  const url = `${SITE_URL}/horoscope/${signId}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      locale: "en_IN",
      url,
      siteName: "AstroVeda",
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${signName} Daily Horoscope | AstroVeda`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
      creator: "@astroveda",
    },
  };
}

export default function HoroscopeSignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}