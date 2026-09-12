"use client";

import React, { useState, FormEvent, useCallback } from "react";
import KundliReport from "@/app/components/KundliReport";
import type { LifePillarConfig } from "@/lib/pillarNarratives";
import type { KundliCalculations } from "@/types/kundali";

interface ReportPlanet {
  name: string;
  sign: string;
  house: number;
  degree: string;
  nakshatra: string;
  retrograde: boolean;
  longitude: number;
}

interface ReportHouse {
  house: number;
  sign: string;
  planets: string[];
}

interface KundaliGenerateResponse {
  success: boolean;
  language: string;
  chartData: {
    lagna: string;
    ascendant: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    timezone: string;
    planets: ReportPlanet[];
    houses: ReportHouse[];
  };
  interpretation: string;
  freeTier: any;
  paidTier: any;
  richPredictions: any;
  calculations: KundliCalculations;
  pillars: LifePillarConfig[];
  aiSource: boolean;
}

interface FormState {
  name: string;
  birthDate: string;
  birthTime: string;
  latitude: string;
  longitude: string;
  timezone: string;
  language: "en" | "hi";
}

const initialState: FormState = {
  name: "",
  birthDate: "",
  birthTime: "",
  latitude: "",
  longitude: "",
  timezone: "+05:30",
  language: "en",
};

export default function KundliToolPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<KundaliGenerateResponse | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setReport(null);

    try {
      const lat = parseFloat(form.latitude);
      const lon = parseFloat(form.longitude);
      if (isNaN(lat) || isNaN(lon)) {
        setError("Please enter valid latitude and longitude.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/kundali/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate,
          birthTime: form.birthTime,
          latitude: lat,
          longitude: lon,
          timezoneOffset: form.timezone,
          language: form.language,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.message || data?.error || `Server error (${res.status})`;
        throw new Error(message);
      }

      const data: KundaliGenerateResponse = await res.json();
      if (!data.success || !data.chartData) {
        throw new Error("Failed to generate kundli. Please try again.");
      }

      setReport(data);
    } catch (err: any) {
      console.error("[kundli-tool] frontend error:", err);
      setError(err?.message || "Failed to generate kundli. Please try again.");
    } finally {
      setLoading(false);
    }
  }

    const handlePrint = useCallback(() => {
    const reportEl = document.getElementById('kundli-report');
    if (!reportEl) {
      alert('Please generate a report first.');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups for this site to print the report.');
      return;
    }
    printWindow.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kundli Report</title><style>@page{size:A4;margin:15mm}body{font-family:"Noto Sans Devanagari","Mukta","Hind","Noto Sans",system-ui,sans-serif;background:#fff;color:#1e293b;margin:0;padding:0}#kundli-report{max-width:100%;padding:0}.report-page{page-break-after:always;break-after:page;margin-bottom:1rem}.report-page:last-child{page-break-after:auto;break-after:auto}h1,h2,h3,h4{color:#d97706}.astro-card{background:#fff;border:1px solid #e2e8f0;box-shadow:none;break-inside:avoid;padding:1rem;border-radius:.5rem}table{break-inside:avoid;width:100%;border-collapse:collapse;font-size:.75rem}thead{display:table-header-group}tr{break-inside:avoid}th,td{padding:.5rem;text-align:left;border-bottom:1px solid #e2e8f0}th{font-weight:700;background:#f1f5f9}</style></head><body>' + reportEl.innerHTML + '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  }, []);

  const handleReset = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  if (report) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="no-print sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border)] py-4 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl font-bold font-serif text-indigo-950 dark:text-amber-300">
              {form.name}&apos;s Kundli Report
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors"
              >
                ← New Report
              </button>
              <div className="flex flex-col items-end gap-0.5">
                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 print-pdf-btn"
                >
                  🖨️ Print / Save as PDF
                </button>
                <p className="no-print text-xs text-gray-500 mt-2">
                  Tip: Enable &quot;Background graphics&quot; in the print dialog for full color output.
                </p>
              </div>
            </div>
          </div>
        </div>
        <KundliReport
          name={form.name}
          birthDetails={{
            birthDate: form.birthDate,
            birthTime: form.birthTime,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            timezone: form.timezone,
          }}
          chartData={report.chartData}
          calculations={report.calculations}
          pillars={report.pillars}
          richPredictions={report.richPredictions}
          lang={form.language}
        />
      </main>
    );
  }

  return (
    <main className="no-print" style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem", textAlign: "center" }}>
          Free Kundli Report Generator
        </h1>
        <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "2rem" }}>
          Enter your birth details to receive a complete Vedic birth-chart report.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <Field label="Name" required>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" required style={inputStyle} />
          </Field>
          <Field label="Birth Date" required>
            <input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} required style={inputStyle} />
          </Field>
          <Field label="Birth Time" required>
            <input type="time" value={form.birthTime} onChange={(e) => update("birthTime", e.target.value)} required style={inputStyle} />
          </Field>
          <Field label="Latitude" required>
            <input type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} placeholder="e.g. 28.6139" required style={inputStyle} />
          </Field>
          <Field label="Longitude" required>
            <input type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} placeholder="e.g. 77.2090" required style={inputStyle} />
          </Field>
          <Field label="Timezone">
            <input type="text" value={form.timezone} onChange={(e) => update("timezone", e.target.value)} placeholder="+05:30" style={inputStyle} />
          </Field>
          <Field label="Language">
            <select value={form.language} onChange={(e) => update("language", e.target.value as "en" | "hi")} style={inputStyle}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </Field>

          {error && (
            <div style={{ background: "#7f1d1d", color: "#fecaca", padding: "0.75rem 1rem", borderRadius: 8, fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? "#475569" : "#6366f1",
            color: "#fff",
            border: "none",
            padding: "0.875rem 1.5rem",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Generating…" : "Generate Kundli"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: "0.375rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#cbd5e1" }}>
        {label}{required && <span style={{ color: "#f87171" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "0.625rem 0.875rem",
  color: "#e2e8f0",
  fontSize: "0.9375rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
