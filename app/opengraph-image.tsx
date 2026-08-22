import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AstroVeda - AI-Powered Vedic Astrology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #080811 0%, #14092B 45%, #2B1157 75%, #45108A 100%)",
          position: "relative",
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -160,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(123,44,191,0.4) 0%, rgba(123,44,191,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(255,209,102,0.22) 0%, rgba(255,209,102,0) 70%)",
          }}
        />

        {/* Starfield */}
        {[
          [80, 90], [220, 40], [420, 130], [610, 60], [790, 150], [980, 70],
          [1120, 120], [150, 480], [330, 560], [560, 500], [820, 545],
          [1040, 470], [1160, 520], [600, 250], [300, 300], [900, 320],
        ].map(([left, top], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              width: i % 3 === 0 ? 5 : 3,
              height: i % 3 === 0 ? 5 : 3,
              borderRadius: 9999,
              background: "#FFFFFF",
              opacity: 0.25 + ((i * 37) % 55) / 100,
            }}
          />
        ))}

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 64, color: "#FFD166" }}>✦</span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#F3F4F6",
              letterSpacing: "-0.02em",
            }}
          >
            AstroVeda
          </span>
          <span style={{ fontSize: 64, color: "#FFD166" }}>✦</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 28,
            fontSize: 38,
            color: "rgba(243,244,246,0.85)",
            display: "flex",
          }}
        >
          AI-Powered Vedic Astrology
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 20, marginTop: 56 }}>
          {["Free Kundli", "Daily Horoscope", "Kundali Matching"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "14px 32px",
                borderRadius: 9999,
                border: "1px solid rgba(255,209,102,0.35)",
                background: "rgba(255,209,102,0.08)",
                color: "#FFD166",
                fontSize: 26,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Footer domain */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            fontSize: 26,
            color: "rgba(156,163,175,0.9)",
            letterSpacing: "0.25em",
            display: "flex",
          }}
        >
          ASTRO-SAGE-AI.VERCEL.APP
        </div>
      </div>
    ),
    size
  );
}