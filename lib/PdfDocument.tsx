// lib/PdfDocument.tsx — full Kundali report as @react-pdf/renderer components.
//
// Pure JavaScript, no native dependencies — works reliably on Vercel.
// Uses the Mukta font family (bundled in public/fonts) which covers both
// Latin and Devanagari glyphs.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PdfData } from "./pdfHtmlTemplate";

Font.register({
  family: "Mukta",
  fonts: [
    { src: "/fonts/Mukta-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Mukta-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Mukta",
    fontSize: 10,
    color: "#1a1a2e",
    backgroundColor: "#ffffff",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    lineHeight: 1.4,
  },
  coverPage: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 90,
  },
  coverPill: {
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 10,
    marginBottom: 10,
  },
  coverTitle: { fontSize: 23, fontWeight: 700, marginBottom: 4 },
  coverSubtitle: { fontSize: 17, fontWeight: 700, marginVertical: 6 },
  detailsBox: {
    backgroundColor: "#f5f5fa",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    width: "75%",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e8",
  },
  detailLabel: { fontWeight: 700, width: 100 },
  detailValue: { flex: 1 },
  chartLine: { fontSize: 10, color: "#4a4a6a", marginTop: 10 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a2e",
    borderBottomWidth: 1.5,
    borderBottomColor: "#6c63ff",
    paddingBottom: 3,
    marginBottom: 8,
  },
  subTitle: { fontSize: 11.5, fontWeight: 700, marginTop: 10, marginBottom: 4 },
  table: { width: "100%", marginVertical: 5 },
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
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 11,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 2,
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
  remedyList: { marginLeft: 14, marginTop: 3, marginBottom: 3 },
  remedyItem: { fontSize: 9.5, marginVertical: 1.5 },
  narrPara: { marginBottom: 6, textAlign: "justify" },
  narrAlt: {
    backgroundColor: "#f8f8fc",
    borderLeftWidth: 2.5,
    borderLeftColor: "#6c63ff",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    marginVertical: 8,
  },
  dashaBlock: { marginBottom: 8 },
  dashaTitle: {
    fontWeight: 700,
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 10,
  },
  dashaDesc: { fontSize: 9.5, marginVertical: 3 },
  dashaTable: { marginVertical: 6 },
  currentDasha: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  outcomePositive: { color: "#1e7d34" },
  outcomeNeutral: { color: "#b26a00" },
  outcomeCaution: { color: "#b3261e" },
  footer: {
    marginTop: 12,
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#eeeeee",
    paddingTop: 6,
  },
  summaryBox: {
    backgroundColor: "#f0f4ff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  kv: { fontSize: 9.5, marginVertical: 2 },
  kvLabel: { fontWeight: 700, color: "#3f3d8f" },
  bulletItem: { fontSize: 9.5, marginVertical: 1, paddingLeft: 4 },
  descBlock: { marginVertical: 4, fontSize: 9.5, lineHeight: 1.4 },
});

interface Translations {
  premiumReport: string;
  client: string;
  birth: string;
  timezone: string;
  location: string;
  asc: string;
  moon: string;
  sun: string;
  nakshatra: string;
  planetsTitle: string;
  cuspsTitle: string;
  planet: string;
  sign: string;
  degree: string;
  house: string;
  retro: string;
  dashaTitle: string;
  subPeriod: string;
  start: string;
  end: string;
  currentDasha: string;
  doshaTitle: string;
  severity: string;
  remedies: string;
  yogasTitle: string;
  strength: string;
  planetsInvolved: string;
  milestones: string;
  period: string;
  event: string;
  note: string;
  remediesTitle: string;
  generalRemedies: string;
  gemstones: string;
  mantras: string;
  summaryTitle: string;
  generatedOn: string;
  lord: string;
  years: string;
  phase: string;
  neutralized: string;
  cancellations: string;
  doshaPresent: string;
  doshaAbsent: string;
  houses: string;
  impact: string;
  benefit: string;
  lahiriNote: string;
  aiNote: string;
  summaryText: string;
  closingEn: string;
  notAvailableEn: string;
}

function getTranslations(isHi: boolean): Translations {
  return isHi ? {
    premiumReport: "प्रीमियम रिपोर्ट",
    client: "क्लाइंट नाम",
    birth: "जन्म",
    timezone: "समय क्षेत्र",
    location: "स्थान",
    asc: "लग्न",
    moon: "चंद्र",
    sun: "सूर्य",
    nakshatra: "नक्षत्र",
    planetsTitle: "ग्रह स्थिति",
    cuspsTitle: "घर कस्प",
    planet: "ग्रह",
    sign: "राशि",
    degree: "डिग्री",
    house: "घर",
    retro: "वक्री",
    dashaTitle: "दशा अवधि",
    subPeriod: "उप-अवधि",
    start: "प्रारंभ",
    end: "समाप्ति",
    currentDasha: "वर्तमान दशा",
    doshaTitle: "दोष विश्लेषण",
    severity: "गंभीरता",
    remedies: "उपाय",
    yogasTitle: "योग विश्लेषण",
    strength: "शक्ति",
    planetsInvolved: "संबंधित ग्रह",
    milestones: "प्रमुख मील के पत्थर",
    period: "अवधि",
    event: "घटना",
    note: "टिप्पणी",
    remediesTitle: "रत्न एवं उपाय",
    generalRemedies: "सामान्य उपाय",
    gemstones: "रत्न सुझाव",
    mantras: "दैनिक मंत्र",
    summaryTitle: "रिपोर्ट सारांश",
    generatedOn: "जनरेट किया गया",
    lord: "स्वामी",
    years: "वर्ष",
    phase: "चरण",
    neutralized: "निरस्त",
    cancellations: "निरस्तीकरण",
    doshaPresent: "उपस्थित",
    doshaAbsent: "अनुपस्थित",
    houses: "भाव",
    impact: "प्रभाव",
    benefit: "लाभ",
    lahiriNote: "लाहिरी अयनांश वैदिक गणना पर आधारित",
    aiNote: "AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन",
    summaryText: "यह रिपोर्ट लाहिरी अयनांश वैदिक गणना और AI-सहायता प्राप्त विश्लेषण पर आधारित है। इसमें ग्रह स्थिति, दशा चक्र, दोष, योग और छह जीवन क्षेत्रों का विस्तृत विवरण शामिल है। व्यक्तिगत मार्गदर्शन के लिए प्रमाणित ज्योतिषी से परामर्श करें।",
    closingEn: "धन्यवाद। शुभ भविष्य की कामना।",
    notAvailableEn: "ग्रह विवरण उपलब्ध नहीं है।",
  } : {
    premiumReport: "Premium Report",
    client: "Client",
    birth: "Birth",
    timezone: "Timezone",
    location: "Location",
    asc: "Asc",
    moon: "Moon",
    sun: "Sun",
    nakshatra: "Nakshatra",
    planetsTitle: "Planet Positions",
    cuspsTitle: "House Cusps",
    planet: "Planet",
    sign: "Sign",
    degree: "Degree",
    house: "House",
    retro: "Retro",
    dashaTitle: "Dasha Periods",
    subPeriod: "Sub-Period",
    start: "Start",
    end: "End",
    currentDasha: "Current Dasha",
    doshaTitle: "Dosha Analysis",
    severity: "Severity",
    remedies: "Remedies",
    yogasTitle: "Yoga Analysis",
    strength: "Strength",
    planetsInvolved: "Planets involved",
    milestones: "Key Milestones",
    period: "Period",
    event: "Event",
    note: "Note",
    remediesTitle: "Gemstones & Remedies",
    generalRemedies: "General Remedies",
    gemstones: "Gemstone Suggestions",
    mantras: "Daily Mantras",
    summaryTitle: "Report Summary",
    generatedOn: "Generated on",
    lord: "Lord",
    years: "years",
    phase: "Phase",
    neutralized: "Neutralized",
    cancellations: "Cancellations",
    doshaPresent: "Present",
    doshaAbsent: "Absent",
    houses: "Houses",
    impact: "Impact",
    benefit: "Benefit",
    lahiriNote: "Based on Lahiri Ayanamsa Vedic calculations",
    aiNote: "AI-assisted Vedic astrology guidance",
    summaryText: "This report is based on Lahiri Ayanamsa Vedic calculations and AI-assisted analysis. It covers planetary positions, the full dasha cycle, doshas, yogas, and six detailed life-domain narratives. For personalized guidance, consult a certified Jyotish practitioner.",
    closingEn: "Thank you. Wishing you a bright future.",
    notAvailableEn: "Planet details are not available.",
  };
}

const SIGN_NAMES: Record<string, string> = {
  Aries: "मेष", Taurus: "वृष", Gemini: "मिथुन", Cancer: "कर्क",
  Leo: "सिंह", Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक",
  Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन",
};
const SIGN_LIST = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function getSign(sign: string, isHi: boolean): string {
  return isHi ? SIGN_NAMES[sign] || sign : sign;
}

function signFromNumber(n: unknown, isHi: boolean): string {
  const idx = Number(n);
  if (idx >= 1 && idx <= 12) return getSign(SIGN_LIST[idx - 1], isHi);
  return String(n ?? "-");
}

function txt(value: unknown): string {
  const s = String(value ?? "").trim();
  return s || "-";
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <View style={styles.tableRow} wrap={false}>
      {cols.map((col, i) => (
        <Text key={i} style={[styles.tableHeaderCell, { flex: 1 }]}>{col}</Text>
      ))}
    </View>
  );
}

function TableRow({ cells }: { cells: string[] }) {
  return (
    <View style={styles.tableRow} wrap={false}>
      {cells.map((cell, i) => (
        <Text key={i} style={[styles.tableCell, { flex: 1 }]}>{cell}</Text>
      ))}
    </View>
  );
}

function renderYogaCard(
  y: any, key: string, idx: number, isHi: boolean, t: Translations,
): React.ReactElement | null {
  if (!y || typeof y !== "object") return null;
  const present = y.isPresent === true || y.presence === true || y.isActive === true;
  if (!present) return null;
  const planetsList = Array.isArray(y.planets) ? y.planets.join(", ") : "";
  const housesList = Array.isArray(y.houses) ? y.houses.join(", ") : "";
  const strength = y.strength || "";

  return (
    <View key={`${key}-${idx}`} style={styles.card} wrap={false}>
      <View style={styles.cardTitle}>
        <Text>{txt(y.name || key)}</Text>
        {strength && (
          <Text style={[styles.pill, styles.pillStrong]}>{t.strength}: {txt(strength)}</Text>
        )}
        {planetsList && (
          <Text style={styles.pill}>{t.planetsInvolved}: {planetsList}</Text>
        )}
        {housesList && (
          <Text style={styles.pill}>{t.houses}: {housesList}</Text>
        )}
      </View>
      {y.description && (
        <Text style={styles.descBlock}>{txt(y.description)}</Text>
      )}
      {y.impact && (
        <View style={styles.kv}>
          <Text><Text style={styles.kvLabel}>{t.impact}:</Text> {txt(y.impact)}</Text>
        </View>
      )}
      {y.benefit && (
        <View style={styles.kv}>
          <Text><Text style={styles.kvLabel}>{t.benefit}:</Text> {txt(y.benefit)}</Text>
        </View>
      )}
    </View>
  );
}

function renderDoshaCard(
  key: string, d: any, idx: number, isHi: boolean, t: Translations,
): React.ReactElement | null {
  if (!d || typeof d !== "object") return null;
  
  const doshaName = d.name || (isHi
    ? { mangal: "मांगलिक दोष", sadeSati: "साढ़े साती", kaalSarp: "काल सर्प दोष" }[key] || key
    : { mangal: "Manglik Dosha", sadeSati: "Sade Sati", kaalSarp: "Kaal Sarp Dosha" }[key] || key);
  
  const present = d.isPresent === true || d.isActive === true || d.phase !== undefined;
  const severity = d.severity || d.phase || (present ? "moderate" : "none");
  const activePeriod = d.activePeriod;
  const cancellations = Array.isArray(d.cancellations) ? d.cancellations : [];
  const remedies = Array.isArray(d.remedies) ? d.remedies : [];
  const isNeutralized = d.isNeutralized === true || d.neutralized === true;

  return (
    <View key={idx} style={styles.card} wrap={false}>
      <View style={styles.cardTitle}>
        <Text>{txt(doshaName)}</Text>
        <Text style={[styles.pill, present ? styles.pillDanger : styles.pillOk]}>
          {present ? t.doshaPresent : t.doshaAbsent}
        </Text>
        {isNeutralized && <Text style={[styles.pill, styles.pillOk]}>{t.neutralized}</Text>}
      </View>
      {d.description && (
        <Text style={styles.descBlock}>{txt(d.description)}</Text>
      )}
      <View style={styles.kv}>
        <Text><Text style={styles.kvLabel}>{t.severity}:</Text> {txt(severity)}</Text>
      </View>
      {activePeriod?.startDate && (
        <View style={styles.kv}>
          <Text><Text style={styles.kvLabel}>{t.period}:</Text> {txt(activePeriod.startDate)} - {txt(activePeriod.endDate)}</Text>
        </View>
      )}
      {d.phase && !activePeriod && (
        <View style={styles.kv}>
          <Text><Text style={styles.kvLabel}>{t.phase}:</Text> {txt(d.phase)}</Text>
        </View>
      )}
      {cancellations.length > 0 && (
        <View style={styles.kv}>
          <Text><Text style={styles.kvLabel}>{t.cancellations}:</Text> {cancellations.join("; ")}</Text>
        </View>
      )}
      {remedies.length > 0 && (
        <>
          <Text style={{ marginTop: 3, fontWeight: 700 }}>{t.remedies}:</Text>
          <View style={styles.remedyList}>
            {remedies.map((r: any, ri: number) => (
              <Text key={ri} style={styles.remedyItem}>
                {"• "}
                {txt(typeof r === "string" ? r : r?.description || r?.text || "")}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function renderParagraphs(text: string | undefined | null): React.ReactElement[] {
  if (!text) return [];
  return String(text)
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((para, pi) => {
      const trimmed = para.trim();
      if (!trimmed) return null;
      return <Text key={pi} style={styles.narrPara}>{trimmed}</Text>;
    })
    .filter(Boolean) as React.ReactElement[];
}

export function PdfDocument({ data }: { data: PdfData }): React.ReactElement {
  const { name, birthDate, birthTime, latitude, longitude, timezone, chartData, calculations, pillars, paidTier, language } = data;
  const isHi = language === "hi";
  const t = getTranslations(isHi);

  const dashas = Array.isArray(calculations?.vimshottari?.mahadashas)
    ? calculations.vimshottari.mahadashas : [];
  const currentDasha = calculations?.vimshottari?.currentDasha || null;
  
  const doshasRaw = calculations?.doshas || {};
  const doshasEntries = Object.entries(doshasRaw) as [string, any][];
  
  const yogasRaw = calculations?.yogas || {};
  
  const planets = Array.isArray(chartData?.planets) ? chartData.planets : [];
  const houseCusps = calculations?.divisionalCharts?.D1?.houseCusps
    || (Array.isArray(chartData?.houses) ? chartData.houses : []);

  const remedyItems = Array.isArray(paidTier?.remedies) ? paidTier.remedies : [];
  const gemstones = paidTier?.remedyKit?.gemstones || [];
  const mantras = paidTier?.remedyKit?.dailyMantras || [];

  const hasRemedies = doshasEntries.some(([, d]) => Array.isArray(d?.remedies) && d.remedies.length > 0);
  const hasOtherRemedies = remedyItems.length > 0 || gemstones.length > 0 || mantras.length > 0;

  return (
    <Document>
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <View style={styles.coverPill}><Text>{t.premiumReport}</Text></View>
        <Text style={styles.coverTitle}>
          {isHi ? "जन्म कुंडली विशद् विश्लेषण" : "Detailed Birth Chart Analysis"}
        </Text>
        <Text style={styles.coverSubtitle}>{name}</Text>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.client}</Text>
            <Text style={styles.detailValue}>{name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.birth}</Text>
            <Text style={styles.detailValue}>{txt(birthDate)} - {txt(birthTime)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.timezone}</Text>
            <Text style={styles.detailValue}>{txt(timezone)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.location}</Text>
            <Text style={styles.detailValue}>{txt(latitude)}, {txt(longitude)}</Text>
          </View>
        </View>

        <View style={styles.chartLine}>
          <Text>
            {t.asc}: <Text style={{ fontWeight: 700 }}>{getSign(chartData?.lagna || chartData?.ascendant || "", isHi)}</Text>
            {"  |  "}{t.moon}: <Text style={{ fontWeight: 700 }}>{getSign(chartData?.moonSign || chartData?.rashi || "", isHi)}</Text>
            {"  |  "}{t.sun}: <Text style={{ fontWeight: 700 }}>{getSign(chartData?.sunSign || "", isHi)}</Text>
            {"  |  "}{t.nakshatra}: <Text style={{ fontWeight: 700 }}>{txt(chartData?.nakshatra)}</Text>
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.planetsTitle}</Text>

        {planets.length > 0 ? (
          <View style={styles.table}>
            <TableHeader cols={[t.planet, t.sign, t.degree, t.house, t.retro]} />
            {planets.map((p: any, i: number) => (
              <TableRow key={i} cells={[txt(p.name), getSign(p.sign, isHi), txt(p.degree), txt(p.house), p.retrograde ? "R" : "-"]} />
            ))}
          </View>
        ) : (
          <View style={styles.card}><Text>{t.notAvailableEn}</Text></View>
        )}

        {Array.isArray(houseCusps) && houseCusps.length > 0 && (
          <>
            <Text style={styles.subTitle}>{t.cuspsTitle}</Text>
            <View style={styles.table}>
              <TableHeader cols={[t.house, t.sign]} />
              {houseCusps.map((c: any, i: number) => (
                <TableRow key={i} cells={[txt(c.house), typeof c.sign === "number" ? signFromNumber(c.sign, isHi) : getSign(String(c.sign || ""), isHi)]} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.footer}>{t.lahiriNote}</Text>
      </Page>

      {dashas.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{t.dashaTitle}</Text>

          {dashas.map((d: any, i: number) => (
            <View key={i} style={styles.dashaBlock} wrap={false}>
              <View style={styles.dashaTitle}>
                <Text>
                  {txt(d.lord)} {isHi ? "महादशा" : "Mahadasha"} 
                  ({txt(d.startDate)} - {txt(d.endDate)})
                  {d.years ? ` - ${txt(d.years)} ${t.years}` : ""}
                </Text>
              </View>
              {d.description && (
                <Text style={styles.dashaDesc}>{txt(d.description)}</Text>
              )}
              {Array.isArray(d.antardashas) && d.antardashas.length > 0 && (
                <View style={styles.dashaTable}>
                  <TableHeader cols={[t.subPeriod, t.start, t.end]} />
                  {d.antardashas.map((a: any, j: number) => (
                    <TableRow key={j} cells={[txt(a.planet), txt(a.startDate), txt(a.endDate)]} />
                  ))}
                </View>
              )}
            </View>
          ))}

          {currentDasha && (
            <View style={styles.currentDasha} wrap={false}>
              <Text>
                <Text style={{ fontWeight: 700 }}>{t.currentDasha}:</Text>{" "}
                {txt(currentDasha.mahadasha)} - {txt(currentDasha.antardasha)}
                {currentDasha.startDate ? ` (${txt(currentDasha.startDate)} - ${txt(currentDasha.endDate)})` : ""}
              </Text>
            </View>
          )}
        </Page>
      )}

      {doshasEntries.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{t.doshaTitle}</Text>

          {doshasEntries.map(([key, d], idx) => (
            renderDoshaCard(key, d, idx, isHi, t)
          ))}
        </Page>
      )}

      {(() => {
        const yogaElements: React.ReactElement[] = [];
        Object.entries(yogasRaw).forEach(([key, y]) => {
          if (!y || typeof y !== "object") return;
          if (Array.isArray(y)) {
            y.forEach((item: any, idx: number) => {
              const card = renderYogaCard(item, key, idx, isHi, t);
              if (card) yogaElements.push(card);
            });
          } else {
            const card = renderYogaCard(y, key, 0, isHi, t);
            if (card) yogaElements.push(card);
          }
        });
        return yogaElements.length > 0 ? (
          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>{t.yogasTitle}</Text>
            {yogaElements}
          </Page>
        ) : null;
      })()}

      {(Array.isArray(pillars) ? pillars : []).map((pillar: any, i: number) => {
        if (!pillar || typeof pillar !== "object") return null;
        const narrative = pillar.narrativeEn || pillar.narrativeHi || "";
        const title = pillar.titleEn || pillar.titleHi || "";
        const badges = pillar.badges || {};
        const milestones = Array.isArray(pillar.milestones) ? pillar.milestones : [];

        return (
          <Page key={i} size="A4" style={styles.page}>
            <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 4 }]}>
              {i + 1}. {txt(title)}
            </Text>
            {(badges.score || badges.timeframe || badges.lord) && (
              <View style={{ flexDirection: "row", marginBottom: 6 }}>
                {badges.score && <Text style={[styles.pill, styles.pillStrong]}>{txt(badges.score)}</Text>}
                {badges.timeframe && <Text style={styles.pill}>{txt(badges.timeframe)}</Text>}
                {badges.lord && <Text style={styles.pill}>{isHi ? "स्वामी" : "Lord"}: {txt(badges.lord)}</Text>}
              </View>
            )}
            <View style={styles.narrAlt}>
              {renderParagraphs(narrative)}
            </View>
            {milestones.length > 0 && (
              <>
                <Text style={styles.subTitle}>{t.milestones}</Text>
                <View style={styles.table}>
                  <TableHeader cols={[t.period, t.event, t.note]} />
                  {milestones.map((m: any, mi: number) => {
                    const outcome = m.outcome || "neutral";
                    const outcomeStyle = outcome === "positive" ? styles.outcomePositive
                      : outcome === "caution" ? styles.outcomeCaution : styles.outcomeNeutral;
                    return (
                      <View key={mi} style={styles.tableRow} wrap={false}>
                        <Text style={[styles.tableCell, { flex: 1 }]}>{txt(m.period)}</Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}>{txt(m.event)}</Text>
                        <Text style={[styles.tableCell, { flex: 1 }, outcomeStyle]}>{txt(m.note || m.outcome || "")}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
            <Text style={styles.footer}>{t.aiNote}</Text>
          </Page>
        );
      })}

      {(hasRemedies || hasOtherRemedies) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{t.remediesTitle}</Text>

          {doshasEntries.map(([key, d], idx) => {
            if (!d || typeof d !== "object" || !Array.isArray(d.remedies) || d.remedies.length === 0) return null;
            return (
              <View key={idx} wrap={false}>
                <Text style={styles.subTitle}>{txt(d.name || key)}</Text>
                <View style={styles.remedyList}>
                  {d.remedies.map((r: any, ri: number) => (
                    <Text key={ri} style={styles.remedyItem}>
                      {"• "}
                      {txt(typeof r === "string" ? r : r?.description || r?.text || "")}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}

          {remedyItems.length > 0 && (
            <View wrap={false}>
              <Text style={styles.subTitle}>{t.generalRemedies}</Text>
              <View style={styles.remedyList}>
                {remedyItems.map((r: any, i: number) => (
                  <Text key={i} style={styles.bulletItem}>
                    {"• "}
                    {txt(typeof r === "string" ? r : r?.description || r?.text || "")}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {gemstones.length > 0 && (
            <View wrap={false}>
              <Text style={styles.subTitle}>{t.gemstones}</Text>
              <View style={styles.remedyList}>
                {gemstones.map((g: any, i: number) => (
                  <Text key={i} style={styles.bulletItem}>
                    {"• "}
                    {txt(typeof g === "string" ? g : g?.name || g?.description || "")}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {mantras.length > 0 && (
            <View wrap={false}>
              <Text style={styles.subTitle}>{t.mantras}</Text>
              <View style={styles.remedyList}>
                {mantras.map((m: any, i: number) => (
                  <Text key={i} style={styles.bulletItem}>
                    {"• "}
                    {txt(typeof m === "string" ? m : m?.name || m?.description || "")}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.summaryTitle}</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.narrPara}>{t.summaryText}</Text>
        </View>
        <Text style={{ color: "#888888", fontSize: 9, marginTop: 10 }}>
          {t.generatedOn}: {new Date().toLocaleDateString()}
        </Text>
        <Text style={{ fontSize: 9, color: "#aaaaaa", marginTop: 20 }}>
          {t.closingEn}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderPdfToBuffer(data: PdfData): Promise<Buffer> {
  const { pdf } = await import("@react-pdf/renderer");
  const doc = <PdfDocument data={data} />;
  const result = await pdf(doc).toBuffer();
  if (result instanceof Buffer) return result;
  const reader = (result as any).getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}