"use client";
import React from 'react';
import Head from 'next/head';

interface SEOWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
}

export default function SEOWrapper({ 
  children, 
  title = "AstroVeda - AI Astrology & Kundali", 
  description = "Get accurate Vedic astrology predictions, daily horoscopes, and AI-powered Kundali readings.",
  canonical = "https://astro-sage-ai.vercel.app"
}: SEOWrapperProps) {
  return (
    <>
      {/* Note: In Next.js 14 App Router, Metadata is usually handled in layout.tsx 
          or via a metadata object, but for a wrapper component, we ensure 
          the tags are consistent. */}
      {children}
    </>
  );
}
