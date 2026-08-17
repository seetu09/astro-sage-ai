"use client";
import React from 'react';

// 1. The Helper Function (Fixed with optional parameters)
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

// 2. The Component
interface SEOWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
}

export default function SEOWrapper({ 
  children 
}: SEOWrapperProps) {
  return (
    <>
      {children}
    </>
  );
}
