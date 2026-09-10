"use client";

import React, { useState, FormEvent } from "react";

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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const lat = parseFloat(form.latitude);
      const lon = parseFloat(form.longitude);
      if (isNaN(lat) || isNaN(lon)) {
        setError("Please enter valid latitude and longitude.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/kundli-tool/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate,
          birthTime: form.birthTime,
          latitude: lat,
          longitude: lon,
          timezone: form.timezone,
          language: form.language,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kundli-${form.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || "Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem", textAlign: "center" }}>
          Free Kundli PDF Generator
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
            {loading ? "Generating…" : "Generate PDF"}
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
