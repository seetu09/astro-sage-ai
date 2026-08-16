import { Metadata } from "next";
import { pageSEO, siteConfig } from "@/app/seo-config";

interface SEOWrapperProps {
  path: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string[];
}

export function generatePageMetadata({ path, customTitle, customDescription, customKeywords }: SEOWrapperProps): Metadata {
  const seo = pageSEO[path] || pageSEO["/"];
  
  const title = customTitle || seo.title;
  const description = customDescription || seo.description;
  const keywords = customKeywords || seo.keywords;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteConfig.url}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${path}`,
      siteName: siteConfig.name,
      images: [
        {
          url: seo.ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.ogImage || siteConfig.ogImage],
    },
  };
}
