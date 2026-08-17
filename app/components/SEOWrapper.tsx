import React from 'react';

interface SEOWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
}

export default function SEOWrapper({ children }: SEOWrapperProps) {
  return <>{children}</>;
}

// Keep the export for the function here but remove "use client" 
// so layouts can use it during build time.
export function generatePageMetadata({ 
  title = "AstroVeda", 
  description = "AI-powered Vedic Astrology", 
  path 
}: { 
  title?: string; 
  description?: string; 
  path: string; 
}) {
  return {
    title: `${title} | AstroVeda`,
    description,
    alternates: {
      canonical: `https://astro-sage-ai.vercel.app${path}`,
    },
    openGraph: {
      title,
      description,
      url: `https://astro-sage-ai.vercel.app${path}`,
      siteName: 'AstroVeda',
      locale: 'en_IN',
      type: 'website',
    },
  };
}
