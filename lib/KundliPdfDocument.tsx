// lib/KundliPdfDocument.tsx — Standalone Kundli report as @react-pdf/renderer
// components, used by /app/kundli-tool (no payment, no authentication).
//
// Pure JavaScript, no native dependencies — works reliably on Vercel.
// Uses the Mukta font family (bundled in public/fonts) which covers both
// Latin and Devanagari glyphs.
//
// Exports:
//   - KundliPdfDocument           (the <Document/> component)
//   - renderKundliPdfToBuffer     (renders to a Node Buffer)

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ── Font registration (Mukta covers Latin + Devanagari) ──
Font.register({
  family: "Mukta",
  fonts: [
    { src: "/fonts/Mukta-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Mukta-Bold.ttf", fontWeight: 700 },
  ],
});

// ── Data contract ─────────────────────────────────────────

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: string; // "DD°MM'"
  house: number;
  retrograde: boolean;
  nakshatra?: string;
}

export interface HouseCusp {
  house: number;
  sign: string;
}

export interface ChartSlice {
  lagna: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: PlanetPosition[];
  houses: HouseCusp[];
}

export interface DoshaItem {
  name: string;
  isPresent: boolean;
  severity?: "low" | "moderate" | "high";
  description: string;
  remedies: string[];
}

export interface YogaItem {
  name: string;
  isPresent: boolean;
  strength?: "weak" | "moderate" | "strong";
  description: string;
  impact?: string;
  planets?: string[];
}

export interface Antardasha {
  planet: string;
  startDate: string;
  endDate: string;
}

export interface Mahadasha {
  lord: string;
  startDate: string;
  endDate: string;
  years: number;
  antardashas: Antardasha[];
}

export interface VimshottariReport {
  mahadashas: Mahadasha[];
  currentDasha: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  birthMahadasha: string;
}

export interface PillarMilestone {
  period: string;
  event: string;
  note?: string;
  outcome?: "positive" | "neutral" | "caution";
}

export interface LifePillar {
  key: string;
  titleEn: string;
  titleHi?: string;
  badges?: { score?: string; timeframe?: string; lord?: string };
  narrativeEn: string;
  narrativeHi?: string;
  milestones: PillarMilestone[];
}

export interface KundliPdfData {
  name: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData: ChartSlice;
  calculations: {
    vimshottari?: VimshottariReport;
    doshas?: DoshaItem[];
    yogas?: YogaItem[];
  };
  pillars: LifePillar[];
     language?: "en" | "hi";
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Mukta",
    fontSize: 10,
    color: "#1a1a2e",
    backgroundColor: "#ffffff",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    lineHeight: 1.45,
  },
  coverPage: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 90,
  },
  coverBadge: {
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 10,
    marginBottom: 10,
  },
  coverTitle: { fontSize: 24, fontWeight: 700, marginBottom: 4, textAlign: "center" },
  coverSubtitle: { fontSize: 16, fontWeight: 700, marginVertical: 8, textAlign: "center", color: "#4a4a6a" },
  coverLine: { fontSize: 10, color: "#6a6a8a", marginTop: 6 },
  detailsBox: {
    backgroundColor: "#f5f5fa",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    width: "78%",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e8",
  },
  detailLabel: { fontWeight: 700, width: 110, color: "#3f3d8f" },
  detailValue: { flex: 1 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a2e",
    borderBottomWidth: 1.5,
    borderBottomColor: "#6c63ff",
    paddingBottom: 3,
    marginBottom: 10,
    marginTop: 4,
  },
  subTitle: { fontSize: 11.5, fontWeight: 700, marginTop: 12, marginBottom: 4, color: "#2c3a50" },
  chartLine: { fontSize: 10, color: "#4a4a6a", marginTop: 4 },
  highlight: { fontSize: 11, fontWeight: 700, color: "#6c63ff", marginVertical: 2 },
  table: { width: "100%", marginVertical: 6 },
  tableRow: { flexDirection: "row" },
  tableHeaderCell: {
    backgroundColor: "#f0f0f5",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 0.5,
    borderColor: "#d0d0d8",
    fontWeight: 700,
    fontSize: 9,
  },
  tableCell: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 0.5,
    borderColor: "#d0d0d8",
    fontSize: 9,
  },
  card: {
    backgroundColor: "#f8f8fc",
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginVertical: 6,
    borderWidth: 0.5,
    borderColor: "#e9e9f2",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 11,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 3,
    color: "#2c3a50",
  },
  pill: {
    backgroundColor: "#e8e6ff",
    color: "#3f3d8f",
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 7,
    fontSize: 8.5,
    marginLeft: 4,
  },
  pillStrong: { backgroundColor: "#6c63ff", color: "#ffffff" },
  pillDanger: { backgroundColor: "#fdecea", color: "#b3261e" },
  pillOk: { backgroundColor: "#e6f4ea", color: "#1e7d34" },
  narrBlock: { marginVertical: 6 },
  narrPara: { marginBottom: 6, textAlign: "justify", fontSize: 9.5 },
  bulletItem: { fontSize: 9.5, marginVertical: 1.5, paddingLeft: 6 },
  remedyList: { marginLeft: 14, marginTop: 3, marginBottom: 3 },
  remedyItem: { fontSize: 9.5, marginVertical: 1.5 },
  dashaBlock: { marginBottom: 6 },
  dashaTitle: {
    fontWeight: 700,
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9.5,
    marginTop: 6,
    marginBottom: 2,
  },
  dashaDesc: { fontSize: 9.5, marginVertical: 3 },
  dashaCellLord: { flex: 2.2, fontSize: 9, fontWeight: 600, paddingHorizontal: 3 },
  dashaCellDur: { flex: 1.6, fontSize: 8.8, paddingHorizontal: 3, textAlign: "center" },
  dashaCellDates: { flex: 3.2, fontSize: 8.8, paddingHorizontal: 3 },
  currentDasha: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: "#c8e6c9",
  },
  outcomePositive: { color: "#1e7d34" },
  outcomeNeutral: { color: "#b26a00" },
  outcomeCaution: { color: "#b3261e" },
  footer: {
    marginTop: 14,
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#eeeeee",
    paddingTop: 6,
  },
});

// ── Helpers ─────────────────────────────────────────────

function txt(value: unknown): string {
  const s = String(value ?? "").trim();
  return s ? s : "—";
}

function renderParagraphs(text: unknown): React.ReactElement[] {
  const safe = String(text ?? "").trim();
  if (!safe) return [<Text key={0} style={styles.narrPara}>{txt("Not available")}</Text>];
  return safe
    .split(/\r?\n\r?\n|\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t, i) => (
      <Text key={i} style={styles.narrPara}>
        {t}
      </Text>
    ));
}

// ── Component ─────────────────────────────────────────────

export const KundliPdfDocument: React.FC<{ data: KundliPdfData }> = ({ data }) => {
  const d = data;
  const isHi = d.language === "hi";
  const planets = d.chartData?.planets ?? [];
  const houses = d.chartData?.houses ?? [];
  const calc = d.calculations ?? {};
  const doshas: DoshaItem[] = Array.isArray(calc.doshas) ? calc.doshas : [];
  const yogas: YogaItem[] = Array.isArray(calc.yogas) ? calc.yogas : [];
  const vimshottari = calc.vimshottari;
  const pillars = d.pillars ?? [];

  // Page reference for layout planning: 1 title, 1 summary, 1 planets = 3,
  // 6 pillars (pages 4-9), 1 doshas (10), 1 yogas (11), 1 current dasha (12),
  // 9 antardasha tables (13-21), 1 closing (22) = 22 pages.

  return (
    <Document>
      {/* 1 ── Title page */}
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <Text style={styles.coverBadge}>Kundli · Birth Chart Report</Text>
        <Text style={styles.coverTitle}>{txt(d.name)}</Text>
        <Text style={styles.coverSubtitle}>Your Vedic Birth Chart &amp; Life Report</Text>
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birth Date</Text>
            <Text style={styles.detailValue}>{txt(d.birthDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birth Time</Text>
            <Text style={styles.detailValue}>{txt(d.birthTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Latitude</Text>
            <Text style={styles.detailValue}>{d.latitude}°</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Longitude</Text>
            <Text style={styles.detailValue}>{d.longitude}°</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timezone</Text>
            <Text style={styles.detailValue}>{txt(d.timezone)}</Text>
          </View>
        </View>
        <Text style={styles.chartLine}>Lagna (Ascendant): {txt(d.chartData?.lagna)}</Text>
        <Text style={styles.chartLine}>Moon Sign (Rashi): {txt(d.chartData?.moonSign)}</Text>
        <Text style={styles.chartLine}>Sun Sign: {txt(d.chartData?.sunSign)}</Text>
        <Text style={styles.chartLine}>Birth Nakshatra: {txt(d.chartData?.nakshatra)}</Text>
        <Text style={styles.coverLine}>Report generated with Lahiri Ayanamsa (sidereal) calculations.</Text>
      </Page>

      {/* 2 ── Chart summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Chart Summary</Text>
        <Text style={styles.subTitle}>Key Positions</Text>
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ascendant</Text>
            <Text style={styles.detailValue}>{txt(d.chartData?.ascendant)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Moon Sign</Text>
            <Text style={styles.detailValue}>{txt(d.chartData?.moonSign)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sun Sign</Text>
            <Text style={styles.detailValue}>{txt(d.chartData?.sunSign)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nakshatra</Text>
            <Text style={styles.detailValue}>{txt(d.chartData?.nakshatra)}</Text>
          </View>
        </View>
        <Text style={styles.highlight}>Chart Facts</Text>
        <View style={styles.card}>
          <Text style={styles.bulletItem}>• 9 planets (Navagraha) plotted sidereally</Text>
          <Text style={styles.bulletItem}>• 12 whole-sign houses from the Ascendant</Text>
          <Text style={styles.bulletItem}>• Lahiri Ayanamsa applied for all positions</Text>
        </View>
        <Text style={styles.sectionTitle}>Astrological Overview</Text>
        <Text style={styles.narrPara}>
          This report is generated from your birth details using the Lahiri Ayanamsa, the
          standard for Vedic (sidereal) astrology. Your chart captures the exact positions of
          the nine planets (Navagraha), the twelve houses (Bhavas), and the Ascendant (Lagna)
          at the moment of birth. Combined with the Vimshottari Dasha timeline, these
          elements form the foundation of the life guidance presented in the following pages.
        </Text>
        <Text style={styles.subTitle}>How to Read This Report</Text>
        <View style={styles.card}>
          <Text style={styles.bulletItem}>• Planet Positions: the cosmic actors and their signs/houses</Text>
          <Text style={styles.bulletItem}>• Life Pillars: six life-domain narratives with milestone forecasts</Text>
          <Text style={styles.bulletItem}>• Doshas: imbalances flagged with practical remedies</Text>
          <Text style={styles.bulletItem}>• Yogas: beneficial planetary combinations and their influence</Text>
          <Text style={styles.bulletItem}>• Dashas: the Vimshottari timeline of planetary periods</Text>
        </View>
      </Page>

            {/* 3 ── Planet positions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Planet Positions</Text>
        <Text style={styles.subTitle}>The Nine Planets (Navagraha)</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeaderCell, { flex: 2.6 }]}><Text>Planet</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 1.8 }]}><Text>Sign</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 1.5 }]}><Text>House</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 2.2 }]}><Text>Degree</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 1.4 }]}><Text>Retro</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 2 }]}><Text>Nakshatra</Text></View>
          </View>
          {planets.map((p: PlanetPosition, i: number) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 2.6 }]}><Text>{txt(p.name)}</Text></View>
              <View style={[styles.tableCell, { flex: 1.8 }]}><Text>{txt(p.sign)}</Text></View>
              <View style={[styles.tableCell, { flex: 1.5 }]}><Text>{txt(p.house)}</Text></View>
              <View style={[styles.tableCell, { flex: 2.2 }]}><Text>{txt(p.degree)}</Text></View>
              <View style={[styles.tableCell, { flex: 1.4 }]}><Text>{p.retrograde ? "Yes" : "No"}</Text></View>
              <View style={[styles.tableCell, { flex: 2 }]}><Text>{txt(p.nakshatra || "—")}</Text></View>
            </View>
          ))}
        </View>
        <Text style={styles.subTitle}>House Cusps (Whole-Sign)</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeaderCell, { flex: 1 }]}><Text>House</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 3 }]}><Text>Sign</Text></View>
            <View style={[styles.tableHeaderCell, { flex: 4 }]}><Text>Occupants</Text></View>
          </View>
          {houses.map((h: HouseCusp, i: number) => {
            const occupants =
              planets.filter((p: PlanetPosition) => p.house === h.house).map((p) => p.name).join(", ") || "—";
            return (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 1 }]}><Text>{txt(h.house)}</Text></View>
                <View style={[styles.tableCell, { flex: 3 }]}><Text>{txt(h.sign)}</Text></View>
                <View style={[styles.tableCell, { flex: 4 }]}><Text>{txt(occupants)}</Text></View>
              </View>
            );
                    })}
        </View>
      </Page>

      {/* 4-9 ── Six Life Pillars (one page each) */}
      {pillars.map((pillar: LifePillar, i: number) => {
        const narrative = isHi && pillar.narrativeHi ? pillar.narrativeHi : pillar.narrativeEn;
        const badges = pillar.badges || {};
        const title = isHi && pillar.titleHi ? pillar.titleHi : pillar.titleEn;
        const milestones = Array.isArray(pillar.milestones) ? pillar.milestones : [];
        return (
          <Page key={pillar.key || i} size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>
              {i + 4}. {txt(title)}
            </Text>
            {(badges.score || badges.timeframe || badges.lord) && (
              <View style={{ flexDirection: "row", marginBottom: 8, flexWrap: "wrap" }}>
                {badges.score && <Text style={[styles.pill, styles.pillStrong]}>{txt(badges.score)}</Text>}
                {badges.timeframe && <Text style={styles.pill}>{txt(badges.timeframe)}</Text>}
                {badges.lord && (
                  <Text style={styles.pill}>
                    {isHi ? "स्वामी" : "Lord"}: {txt(badges.lord)}
                  </Text>
                )}
              </View>
            )}
            <View style={[styles.card, { backgroundColor: "#f8f8fc", borderWidth: 0 }]}>
              {renderParagraphs(narrative)}
            </View>
            {milestones.length > 0 && (
              <>
                <Text style={styles.subTitle}>{isHi ? "मील के पत्थर" : "Milestones"}</Text>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableHeaderCell, { flex: 2 }]}><Text>{isHi ? "अवधि" : "Period"}</Text></View>
                    <View style={[styles.tableHeaderCell, { flex: 3 }]}><Text>{isHi ? "घटना" : "Event"}</Text></View>
                    <View style={[styles.tableHeaderCell, { flex: 3 }]}><Text>{isHi ? "टिप्पणी" : "Note"}</Text></View>
                  </View>
                  {milestones.map((m: PillarMilestone, mi: number) => {
                    const outcome = m.outcome || "neutral";
                    const outcomeStyle =
                      outcome === "positive"
                        ? styles.outcomePositive
                        : outcome === "caution"
                        ? styles.outcomeCaution
                        : styles.outcomeNeutral;
                    return (
                      <View key={mi} style={styles.tableRow}>
                        <View style={[styles.tableCell, { flex: 2 }]}><Text>{txt(m.period)}</Text></View>
                        <View style={[styles.tableCell, { flex: 3 }]}><Text>{txt(m.event)}</Text></View>
                        <View style={[styles.tableCell, { flex: 3 }, outcomeStyle]}><Text>{txt(m.note || "")}</Text></View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
            <Text style={styles.footer}>{isHi ? "AI-से प्राप्त जीवन-स्तंभ के सारांश" : "Life-Pillar summary generated with AI support"}</Text>
          </Page>
        );
      })}

      {/* 10 ── Doshas */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Dosha Analysis</Text>
        {doshas.length === 0 ? (
          <Text style={styles.narrPara}>No significant doshas detected in your chart.</Text>
        ) : (
          doshas.map((d: DoshaItem, i: number) => (
            <View key={i} style={styles.dashaBlock} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                <Text style={styles.dashaTitle}>{txt(d.name)}</Text>
                {d.isPresent && (
                  <Text
                    style={[
                      d.severity === "high" ? styles.pillDanger : styles.pillOk,
                      { marginLeft: 6 },
                    ]}
                  >
                    {txt(d.severity)}
                  </Text>
                )}
                {!d.isPresent && (
                  <Text style={[styles.pillOk, { marginLeft: 6 }]}>Not Present</Text>
                )}
              </View>
              <Text style={styles.dashaDesc}>{txt(d.description)}</Text>
              {Array.isArray(d.remedies) && d.remedies.length > 0 && (
                <>
                  <Text style={styles.subTitle}>Recommended Remedies</Text>
                  <View style={styles.remedyList}>
                    {d.remedies.map((r: string, ri: number) => (
                      <Text key={ri} style={styles.remedyItem}>• {txt(r)}</Text>
                    ))}
                  </View>
                </>
              )}
            </View>
                    ))
        )}
      </Page>

      {/* 11 ── Yogas */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Yoga Analysis</Text>
        {yogas.length === 0 ? (
          <Text style={styles.narrPara}>No major yogas were identified in your chart.</Text>
        ) : (
          yogas.map((y: YogaItem, i: number) => (
            <View key={i} style={styles.dashaBlock} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                <Text style={styles.dashaTitle}>{txt(y.name)}</Text>
                {y.isPresent && (
                  <Text style={[styles.pillOk, { marginLeft: 6 }]}>{txt(y.strength)}</Text>
                )}
                {!y.isPresent && (
                  <Text style={[styles.pill, { marginLeft: 6, backgroundColor: "#f1f1f5", color: "#52526a" }]}>
                    Not Present
                  </Text>
                )}
              </View>
              <Text style={styles.dashaDesc}>{txt(y.description)}</Text>
              {y.impact && <Text style={styles.dashaDesc}>Impact: {txt(y.impact)}</Text>}
              {Array.isArray(y.planets) && y.planets.length > 0 && (
                <Text style={styles.bulletItem}>Planets: {txt(y.planets.join(", "))}</Text>
              )}
            </View>
          ))
        )}
      </Page>






      {/* 12 ── Vimshottari Dasha — current + mahadasha table */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Vimshottari Dasha Timeline</Text>
        {vimshottari ? (
          <>
            {vimshottari.currentDasha && (
              <View style={styles.currentDasha}>
                <Text style={styles.subTitle}>Currently Running Period</Text>
                <Text style={styles.bulletItem}>• Mahadasha: {txt(vimshottari.currentDasha.mahadasha)}</Text>
                <Text style={styles.bulletItem}>• Antardasha: {txt(vimshottari.currentDasha.antardasha)}</Text>
                <Text style={styles.bulletItem}>• Period: {txt(vimshottari.currentDasha.startDate)} to {txt(vimshottari.currentDasha.endDate)}</Text>
              </View>
            )}
            {vimshottari.birthMahadasha && (
              <Text style={styles.chartLine}>Birth Mahadasha: {txt(vimshottari.birthMahadasha)}</Text>
            )}
            <Text style={styles.subTitle}>All Mahadashas (120-Year Cycle)</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableHeaderCell, { flex: 2 }]}><Text>Lord</Text></View>
                <View style={[styles.tableHeaderCell, { flex: 1.4 }]}><Text>Years</Text></View>
                <View style={[styles.tableHeaderCell, { flex: 3 }]}><Text>Start</Text></View>
                <View style={[styles.tableHeaderCell, { flex: 3 }]}><Text>End</Text></View>
              </View>
              {(vimshottari.mahadashas || []).map((m: Mahadasha, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2 }]}><Text>{txt(m.lord)}</Text></View>
                  <View style={[styles.tableCell, { flex: 1.4 }]}><Text>{txt(m.years)}</Text></View>
                  <View style={[styles.tableCell, { flex: 3 }]}><Text>{txt(m.startDate)}</Text></View>
                  <View style={[styles.tableCell, { flex: 3 }]}><Text>{txt(m.endDate)}</Text></View>
                </View>
              ))}
            </View>
          </>
                ) : (
          <Text style={styles.narrPara}>Dasha timeline not available for this chart.</Text>
        )}
      </Page>

      {/* 13-21 ── Antardasha tables (one page per Mahadasha) */}
      {vimshottari &&
        (vimshottari.mahadashas || []).map((m: Mahadasha, i: number) => (
          <Page key={"antar-" + i} size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>
              Antardashas: {txt(m.lord)} Mahadasha ({txt(m.startDate)} – {txt(m.endDate)})
            </Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableHeaderCell, { flex: 2.5 }]}><Text>Antardasha (Planet)</Text></View>
                <View style={[styles.tableHeaderCell, { flex: 2.5 }]}><Text>Start</Text></View>
                <View style={[styles.tableHeaderCell, { flex: 2.5 }]}><Text>End</Text></View>
              </View>
              {(m.antardashas || []).map((a: Antardasha, ai: number) => (
                <View key={ai} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2.5 }]}><Text>{txt(a.planet)}</Text></View>
                  <View style={[styles.tableCell, { flex: 2.5 }]}><Text>{txt(a.startDate)}</Text></View>
                  <View style={[styles.tableCell, { flex: 2.5 }]}><Text>{txt(a.endDate)}</Text></View>
                </View>
              ))}
            </View>
            {i === 0 && (
              <Text style={styles.narrPara}>
                Each Mahadasha (major period) is subdivided into nine Antardashas
                (sub-periods), also following the Vimshottari sequence. The running
                Antardasha refines the flavour of its parent Mahadasha, highlighting
                the specific planetary influence most active in your life right now.
              </Text>
            )}
          </Page>
        ))}

      {/* 22 ── Closing summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Report Summary &amp; Guidance</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Takeaways</Text>
          <Text style={styles.bulletItem}>• Your Ascendant (Lagna) is {txt(d.chartData?.lagna)}, shaping your outward persona.</Text>
          <Text style={styles.bulletItem}>• Your Moon sign (Rashi) is {txt(d.chartData?.moonSign)}, the core of your emotional nature.</Text>
          <Text style={styles.bulletItem}>• Your birth Nakshatra is {txt(d.chartData?.nakshatra)}, the lunar mansion of your birth.</Text>
          <Text style={styles.bulletItem}>• The nine planets and twelve houses form the foundation of this report.</Text>
          <Text style={styles.bulletItem}>• Six life-domain pillars offer focused guidance across major life areas.</Text>
          <Text style={styles.bulletItem}>• The Vimshottari Dasha timeline maps the 120-year major-period cycle.</Text>
        </View>
        <Text style={styles.subTitle}>Recommended Approach</Text>
        <Text style={styles.narrPara}>
          Vedic astrology is a mirror for self-reflection, not a deterministic fate.
          Use the dosha remedies, yoga insights, and dasha timing as practical tools
          for mindful planning. When a period or influence feels challenging, the
          paired remedies offer concrete, actionable steps. Reassess your chart
          periodically — as transits shift, so do the practical opportunities they
          reveal. This report is intended for guidance and personal insight only and
          does not constitute medical, legal, or financial advice.
        </Text>
        <Text style={styles.subTitle}>Report Scope</Text>
        <View style={styles.card}>
          <Text style={styles.bulletItem}>• Birth details &amp; chart summary</Text>
          <Text style={styles.bulletItem}>• Full Navagraha (9-planet) positions</Text>
          <Text style={styles.bulletItem}>• 12 whole-sign house cusps</Text>
          <Text style={styles.bulletItem}>• 6 life-domain pillars with narratives + milestones</Text>
          <Text style={styles.bulletItem}>• Dosha analysis with remedies</Text>
          <Text style={styles.bulletItem}>• Major yoga combinations</Text>
          <Text style={styles.bulletItem}>• Full Vimshottari Dasha (mahadashas + antardashas)</Text>
        </View>
        <Text style={styles.footer}>Generated by AstroSage AI · Lahiri Ayanamsa (Sidereal) · For guidance only</Text>
      </Page>
    </Document>
  );
};

// ── Buffer renderer (pure JS, no native deps) ──

export async function renderKundliPdfToBuffer(data: KundliPdfData): Promise<Buffer> {
  const { pdf } = await import("@react-pdf/renderer");
  const doc = <KundliPdfDocument data={data} />;
  const result = await pdf(doc).toBuffer();
  if (result instanceof Buffer) return result;
  // Node stream → Buffer (defensive; toBuffer usually returns Buffer)
  const reader = (result as any).getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}


