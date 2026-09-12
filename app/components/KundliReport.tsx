'use client';

import React from 'react';
import type { LifePillarConfig } from '@/lib/pillarNarratives';
import type { KundliCalculations, RichPredictionReport } from '@/types/kundali';
import { PLANET_NAMES, ZODIAC_SIGNS, SIGN_LORDS } from '@/lib/astrologyDictionary';
import { getLocalizedYogaName } from '@/lib/localizedData';

export interface ReportPlanet {
  name: string; sign: string; house: number; degree: string; nakshatra: string; retrograde: boolean; longitude: number;
}
export interface ReportHouse {
  house: number; sign: string; planets: string[];
}
export interface KundliReportProps {
  name: string;
  birthDetails: { birthDate: string; birthTime: string; latitude: number | null; longitude: number | null; timezone: string; };
  chartData: { lagna: string; ascendant: string; moonSign: string; sunSign: string; nakshatra: string; timezone: string; planets: ReportPlanet[]; houses: ReportHouse[]; };
  calculations?: KundliCalculations;
  pillars?: LifePillarConfig[];
  richPredictions?: RichPredictionReport | null;
  lang: 'en' | 'hi';
}

function locPlanet(lang: 'en' | 'hi', name: string): string { return PLANET_NAMES[lang]?.[name] ?? name; }
function locSign(lang: 'en' | 'hi', sign: string): string { return ZODIAC_SIGNS[lang]?.[sign] ?? sign; }
function signLord(sign: string): string {
  const names = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const idx = names.indexOf(sign);
  return idx >= 0 ? SIGN_LORDS[idx + 1] : '';
}
function tr(lang: 'en' | 'hi', en: string, hi: string): string { return lang === 'hi' ? hi : en; }
function yearOf(iso?: string): string { return iso ? new Date(iso).getFullYear().toString() : '—'; }

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 pb-3 border-b-2 border-amber-400 dark:border-amber-500">
      <h2 className="text-xl font-bold font-serif text-amber-600 dark:text-amber-300">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value || '—'}</span>
    </>
  );
}

// Sade Sati phase localization — maps English phase names to Hindi
function localizePhase(phase: string | undefined | null, lang: 'en' | 'hi'): string {
  if (!phase) return '';
  const map: Record<string, string> = lang === 'hi' ? {
    rising: 'उदय',
    peak: 'चरम',
    descending: 'अवरोही',
    setting: 'स्थापना',
    'setting phase': 'स्थापना चरण',
    inactive: 'निष्क्रिय',
    active: 'सक्रिय',
  } : {
    rising: 'Rising',
    peak: 'Peak',
    descending: 'Descending',
    setting: 'Setting',
    'setting phase': 'Setting Phase',
    inactive: 'Inactive',
    active: 'Active',
  };
  return map[phase] ?? phase;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

export default function KundliReport({ name, birthDetails, chartData, calculations, pillars, richPredictions, lang }: KundliReportProps) {
  const _t = (en: string, hi: string) => tr(lang, en, hi);
  const planets = chartData?.planets ?? [];
  const houses = chartData?.houses ?? [];
  const vimshottari = calculations?.vimshottari;
  const doshas = calculations?.doshas;
  const yogas = calculations?.yogas;
  const currentDasha = vimshottari?.currentDasha;
  const mahadashas = vimshottari?.mahadashas ?? [];
  const hasPillars = pillars && pillars.length > 0;
  // Rich deep-dive narratives (same data the on-screen report uses).
  const rpNarr = (key: 'health' | 'wealth' | 'marriage' | 'career'): string =>
    key === 'health' ? (richPredictions?.health?.narrative ?? '')
      : key === 'wealth' ? (richPredictions?.wealth?.narrative ?? '')
      : key === 'marriage' ? (richPredictions?.marriage?.narrative ?? '')
      : (richPredictions?.career?.narrative ?? '');
  const rpMilestones = (key: 'wealth' | 'marriage' | 'career'): { period?: string; year?: string; event: string; note?: string }[] =>
    richPredictions?.[key]?.milestones ?? [];
  const rpGemstones = richPredictions?.remedies?.gemstones ?? [];
  const rpMantras = richPredictions?.remedies?.dailyMantras ?? [];

  return (
    <div className="report-root max-w-5xl mx-auto px-4 py-8 space-y-10">

      {/* COVER / BIRTH DETAILS */}
      <section className="print-page">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-300 mb-2">
            {_t('Vedic Kundli Report', 'वैदिक कुंडली रिपोर्ट')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {_t('Generated by AstroSage AI', 'AstroSage AI द्वारा निर्मित')}
          </p>
        </div>
        <div className="astro-card max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold font-serif text-amber-600 dark:text-amber-300 mb-4 text-center">
            {_t('Birth Details', 'जन्म विवरण')}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <DetailRow label={_t('Birth Date', 'जन्म तिथि')} value={birthDetails.birthDate} />
            <DetailRow label={_t('Birth Time', 'जन्म समय')} value={birthDetails.birthTime} />
            <DetailRow label={_t('Latitude', 'अक्षांश')} value={String(birthDetails.latitude ?? '—')} />
            <DetailRow label={_t('Longitude', 'देशांतर')} value={String(birthDetails.longitude ?? '—')} />
            <DetailRow label={_t('Timezone', 'समय क्षेत्र')} value={birthDetails.timezone} />
            <DetailRow label={_t('Ascendant (Lagna)', 'लग्न')} value={locSign(lang, chartData.lagna)} />
            <DetailRow label={_t('Moon Sign (Rashi)', 'चंद्र राशि')} value={locSign(lang, chartData.moonSign)} />
            <DetailRow label={_t('Sun Sign', 'सूर्य राशि')} value={locSign(lang, chartData.sunSign)} />
            <DetailRow label={_t('Nakshatra', 'नक्षत्र')} value={chartData.nakshatra} />
          </div>
        </div>
      </section>

      {/* PLANET POSITIONS TABLE */}
      <section className="print-page">
        <SectionHeading title={_t('Planetary Positions', 'ग्रह स्थिति')} />
        <div className="astro-card overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-amber-50 dark:bg-amber-900/20">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Planet', 'ग्रह')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Sign', 'राशि')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Sign Lord', 'राशि स्वामी')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Degree', 'अंश')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('House', 'भाव')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Nakshatra', 'नक्षत्र')}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('State', 'अवस्था')}</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((p, i) => (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Td className="font-semibold">{locPlanet(lang, p.name)}</Td>
                  <Td>{locSign(lang, p.sign)}</Td>
                  <Td>{locPlanet(lang, signLord(p.sign))}</Td>
                  <Td>{p.degree}</Td>
                  <Td>{p.house}</Td>
                  <Td>{p.nakshatra}</Td>
                  <Td>
                    {p.retrograde ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {_t('Retro', 'वक्री')}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {_t('Direct', 'सीधा')}
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* 12 HOUSES GRID */}
      <section className="print-page">
        <SectionHeading title={_t('Twelve Houses (Bhavas)', 'द्वादश भाव')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const houseData = houses.find((hh) => hh.house === h);
            const signName = houseData?.sign ?? '';
            const occupants = houseData?.planets ?? [];
            const lord = signLord(signName);
            return (
              <div key={h} className="astro-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                    {_t(`House ${h}`, `भाव ${h}`)}
                  </span>
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {locSign(lang, signName)}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>{_t('Lord', 'स्वामी')}:</span>
                    <span className="font-medium">{locPlanet(lang, lord) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{_t('Occupants', 'निवासी')}:</span>
                    <span className="font-medium">
                      {occupants.length > 0 ? occupants.map((p) => locPlanet(lang, p)).join(', ') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* PILLAR 1 */}
      {pillars && pillars.length >= 1 && (
        <section className="print-page">
          <SectionHeading title={pillars[0].titleHi || pillars[0].titleEn} subtitle={_t('Life Pillar 1 of 6', 'जीवन स्तंभ 1 / 6')} />
          <div className="astro-card p-6">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="whitespace-pre-line">{lang === 'hi' ? (pillars[0].narrativeHi || pillars[0].narrativeEn) : (pillars[0].narrativeEn || pillars[0].narrativeHi)}</p>
            </div>
            {pillars[0].milestones && pillars[0].milestones.length > 0 && (
              <table className="w-full text-xs border-collapse">
                <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Period', 'अवधि')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Event', 'घटना')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Note', 'टिप्पणी')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Outcome', 'परिणाम')}</th></tr></thead>
                <tbody>{pillars[0].milestones.map((m, mi) => (
                  <tr key={mi} className="border-b border-slate-200 dark:border-slate-700">
                    <Td className="font-medium whitespace-nowrap">{m.period}</Td><Td>{m.event}</Td><Td className="text-slate-600 dark:text-slate-400">{m.note || '—'}</Td>
                    <Td>{m.outcome === 'positive' ? (<span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{_t('Positive', 'शुभ')}</span>) : m.outcome === 'caution' ? (<span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{_t('Caution', 'सावधानी')}</span>) : m.outcome === 'neutral' ? (<span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{_t('Neutral', 'तटस्थ')}</span>) : '—'}</Td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* PILLAR 2 */}
      {pillars && pillars.length >= 2 && (
        <section className="print-page">
          <SectionHeading title={pillars[1].titleHi || pillars[1].titleEn} subtitle={_t('Life Pillar 2 of 6', 'जीवन स्तंभ 2 / 6')} />
          <div className="astro-card p-6">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="whitespace-pre-line">{lang === 'hi' ? (pillars[1].narrativeHi || pillars[1].narrativeEn) : (pillars[1].narrativeEn || pillars[1].narrativeHi)}</p>
            </div>
            {pillars[1].milestones && pillars[1].milestones.length > 0 && (
              <table className="w-full text-xs border-collapse">
                <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Period', 'अवधि')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Event', 'घटना')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Note', 'टिप्पणी')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Outcome', 'परिणाम')}</th></tr></thead>
                <tbody>{pillars[1].milestones.map((m, mi) => (
                  <tr key={mi} className="border-b border-slate-200 dark:border-slate-700">
                    <Td className="font-medium whitespace-nowrap">{m.period}</Td><Td>{m.event}</Td><Td className="text-slate-600 dark:text-slate-400">{m.note || '—'}</Td>
                    <Td>{m.outcome === 'positive' ? (<span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{_t('Positive', 'शुभ')}</span>) : m.outcome === 'caution' ? (<span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{_t('Caution', 'सावधानी')}</span>) : m.outcome === 'neutral' ? (<span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{_t('Neutral', 'तटस्थ')}</span>) : '—'}</Td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </section>
      )}
      {/* PILLAR 3 */}
      {pillars && pillars.length >= 3 && (
        <section className="print-page">
          <SectionHeading title={pillars[2].titleHi || pillars[2].titleEn} subtitle={_t('Life Pillar 3 of 6', 'जीवन स्तंभ 3 / 6')} />
          <div className="astro-card p-6">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="whitespace-pre-line">{lang === 'hi' ? (pillars[2].narrativeHi || pillars[2].narrativeEn) : (pillars[2].narrativeEn || pillars[2].narrativeHi)}</p>
            </div>
          </div>
        </section>
      )}

      {/* PILLAR 4 */}
      {pillars && pillars.length >= 4 && (
        <section className="print-page">
          <SectionHeading title={pillars[3].titleHi || pillars[3].titleEn} subtitle={_t('Life Pillar 4 of 6', 'जीवन स्तंभ 4 / 6')} />
          <div className="astro-card p-6">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="whitespace-pre-line">{lang === 'hi' ? (pillars[3].narrativeHi || pillars[3].narrativeEn) : (pillars[3].narrativeEn || pillars[3].narrativeHi)}</p>
            </div>
          </div>
        </section>
      )}

      {/* PILLAR 5 */}
      {pillars && pillars.length >= 5 && (
        <section className="print-page">
          <SectionHeading title={pillars[4].titleHi || pillars[4].titleEn} subtitle={_t('Life Pillar 5 of 6', 'जीवन स्तंभ 5 / 6')} />
          <div className="astro-card p-6">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="whitespace-pre-line">{lang === 'hi' ? (pillars[4].narrativeHi || pillars[4].narrativeEn) : (pillars[4].narrativeEn || pillars[4].narrativeHi)}</p>
            </div>
          </div>
        </section>
      )}

      {/* PILLAR 6 */}
      {pillars && pillars.length >= 6 && (
        <section className="print-page">
          <SectionHeading title={pillars[5].titleHi || pillars[5].titleEn} subtitle={_t('Life Pillar 6 of 6', 'जीवन स्तंभ 6 / 6')} />
          <div className="astro-card p-6">
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="whitespace-pre-line">{lang === 'hi' ? (pillars[5].narrativeHi || pillars[5].narrativeEn) : (pillars[5].narrativeEn || pillars[5].narrativeHi)}</p>
            </div>
          </div>
        </section>
      )}
{/* DOSHAS ANALYSIS */}
      {doshas && (
        <section className="print-page">
          <SectionHeading title={_t('Dosha Analysis', 'दोष विश्लेषण')} />
          <div className="space-y-6">
            <DoshaCard lang={lang} title={_t('Mangal Dosha (Mars)', 'मंगल दोष')} present={doshas.mangal?.isPresent ?? false} severity={doshas.mangal?.severity ?? undefined} isNeutralized={doshas.mangal?.isNeutralized ?? undefined} description={doshas.mangal?.description ?? ''} remedies={doshas.mangal?.remedies ?? []} />
            {(() => {
              const sade = doshas.sadeSati;
              const phase = sade?.phase ?? 'inactive';
              const phaseLabel = localizePhase(phase, lang);
              // Clean localized description — never render raw English/garbled text.
              const desc = lang === 'hi'
                ? (sade?.isActive
                    ? `शनि साढ़े साती वर्तमान में ${phaseLabel} में है। यह चुनौतियों के माध्यम से अनुशासन और दीर्घकालिक संरचनाओं की परिपक्वता पर ज़ोर देता है।`
                    : 'कोई सक्रिय साढ़े साती अवधि नहीं है।')
                : (sade?.isActive
                    ? `Saturn is currently transiting the ${phaseLabel} phase of the Sade Sati arc. This period emphasises discipline through challenge and the maturation of long-term structures.`
                    : 'No active Sade Sati period.');
              return (
                <DoshaCard
                  lang={lang}
                  title={_t('Sade Sati (Saturn)', 'साढ़े साती')}
                  present={sade?.isActive ?? false}
                  severity={sade?.isActive ? 'moderate' : undefined}
                  description={desc}
                  remedies={sade?.remedies ?? []}
                />
              );
            })()}
            <DoshaCard lang={lang} title={_t('Kaal Sarp Dosha', 'काल सर्प दोष')} present={doshas.kaalSarp?.isPresent ?? false} severity={doshas.kaalSarp?.isPresent ? 'moderate' : undefined} description={doshas.kaalSarp?.description ?? ''} remedies={doshas.kaalSarp?.remedies ?? []} />
          </div>
        </section>
      )}

      {yogas && (
        <section className="print-page">
          <SectionHeading title={_t('Yoga Analysis', 'योग विश्लेषण')} />
          <div className="astro-card overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Yoga', 'योग')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Hindi Name', 'हिंदी नाम')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Strength', 'शक्ति')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Description', 'विवरण')}</th></tr></thead>
              <tbody>
                {(() => {
                  const rows: React.ReactNode[] = [];
                  const seen = new Set<string>();
                  const addYoga = (name: string, desc: string, strength?: string) => {
                    if (!name || seen.has(name)) return;
                    seen.add(name);
                    const nameHi = getLocalizedYogaName(name, lang === 'hi' ? 'hi' : 'en');
                    const sLabel = !strength ? '—' : strength === 'strong' ? _t('Strong', 'शक्तिशाली') : strength === 'moderate' ? _t('Moderate', 'मध्यम') : _t('Weak', 'कमज़ोर');
                    rows.push (
                      <tr key={name} className="border-b border-slate-200 dark:border-slate-700">
                        <Td className="font-semibold">{name}</Td>
                        <Td className="font-semibold text-amber-700 dark:text-amber-300">{nameHi || name}</Td>
                        <Td><span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${strength === 'strong' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : strength === 'moderate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{sLabel}</span></Td>
                        <Td className="text-slate-600 dark:text-slate-400">{desc || '—'}</Td>
                      </tr>
                    );
                  };
                  if (yogas?.gajakesari?.isPresent) addYoga(yogas.gajakesari.name, yogas.gajakesari.description, yogas.gajakesari.strength);
                  if (yogas?.budhaditya?.isPresent) addYoga(yogas.budhaditya.name, yogas.budhaditya.description, yogas.budhaditya.strength);
                  for (const dy of yogas?.dhanaYogas ?? []) {
                    if (dy.isPresent) addYoga(dy.name, dy.description);
                  }
                  return rows;
                })()}
                {!yogas?.gajakesari?.isPresent && !yogas?.budhaditya?.isPresent && (yogas?.dhanaYogas ?? []).filter((dy) => dy.isPresent).length === 0 && (
                  <tr><td colSpan={4} className="text-center text-slate-500 dark:text-slate-400 py-6 italic">{_t('No major yoga combinations were detected.', 'कोई प्रमुख योग संयुक्त नहीं पाया गया।')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {/* VIMSHOTTARI DASHA with antardasha tables */}
      {mahadashas.length > 0 && (
        <section className="print-page">
          <SectionHeading title={_t('Vimshottari Dasha (120-Year Cycle)', 'विम्शोत्तरी दशा (120 वर्ष चक्र)')} />
          {currentDasha && (
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">{_t('Running Mahadasha', 'चल रही महादशा')}: {locPlanet(lang, currentDasha.mahadasha)}</span>
              <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{_t('Antardasha', 'अंतर्दशा')}: {locPlanet(lang, currentDasha.antardasha)}</span>
              <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{yearOf(currentDasha.startDate)} – {yearOf(currentDasha.endDate)}</span>
            </div>
          )}
          <div className="astro-card overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-amber-50 dark:bg-amber-900/20"><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Mahadasha', 'महादशा')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Start', 'प्रारंभ')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('End', 'समाप्ति')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Years', 'वर्ष')}</th></tr></thead>
              <tbody>{mahadashas.map((md, i) => { const isC = currentDasha && md.lord === currentDasha.mahadasha; return (<tr key={i} className={`border-b border-slate-200 dark:border-slate-700 ${isC ? 'bg-amber-50 dark:bg-amber-900/10 font-semibold' : ''}`}><Td>{locPlanet(lang, md.lord)}</Td><Td>{yearOf(md.startDate)}</Td><Td>{yearOf(md.endDate)}</Td><Td>{md.years}</Td></tr>); })}</tbody>
            </table>
          </div>
          <h3 className="text-lg font-semibold font-serif text-amber-600 dark:text-amber-300 mb-4">{_t('Antardasha Breakdown', 'अंतर्दशा विवरण')}</h3>
          <div className="space-y-6">
            {mahadashas.map((md, mi) => {
              const ads = md.antardashas ?? [];
              if (ads.length === 0) return null;
              return (
                <div key={mi} className="astro-card overflow-x-auto">
                  <h4 className="text-sm font-bold text-amber-700 dark:text-amber-200 mb-3">{locPlanet(lang, md.lord)} {_t('Mahadasha', 'महादशा')} ({yearOf(md.startDate)}–{yearOf(md.endDate)})</h4>
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">#</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Antardasha', 'अंतर्दशा')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Start', 'प्रारंभ')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('End', 'समाप्ति')}</th></tr></thead>
                    <tbody>{ads.map((ad, ai) => { const isCur = ad.planet === currentDasha?.antardasha && md.lord === currentDasha?.mahadasha; return (<tr key={ai} className={`border-b border-slate-200 dark:border-slate-700 ${isCur ? 'bg-amber-50 dark:bg-amber-900/10 font-semibold' : ''}`}><Td>{ai + 1}</Td><Td>{locPlanet(lang, ad.planet)}</Td><Td>{yearOf(ad.startDate)}</Td><Td>{yearOf(ad.endDate)}</Td></tr>); })}</tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </section>
      )}

{/* DETAILED HEALTH ANALYSIS (page-level deep dive) */}
      {rpNarr('health') && (
        <section className="print-page">
          <SectionHeading title={_t('Detailed Health Analysis', 'विस्तृत स्वास्थ्य विश्लेषण')} subtitle={_t('Page-level deep dive into physical & mental wellbeing', 'शारीरिक एवं मानसिक स्वास्थ्य पर गहन अध्ययन')} />
          <div className="astro-card p-6">
            <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Current Health Status', 'वर्तमान स्वास्थ्य स्थिति')}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{rpNarr('health')}</p>
          </div>
        </section>
      )}

      {/* DETAILED WEALTH ANALYSIS (2nd & 11th house deep dive) */}
      {((rpNarr('wealth') !== '') || rpMilestones('wealth').length > 0) && (
        <section className="print-page">
          <SectionHeading title={_t('Detailed Wealth Analysis', 'विस्तृत धन विश्लेषण')} subtitle={_t('Deep dive into 2nd & 11th houses', 'द्वितीय एवं एकादश भाव पर गहन अध्ययन')} />
          {rpNarr('wealth') && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Wealth Status', 'धन स्थिति')}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{rpNarr('wealth')}</p>
            </div>
          )}
          {rpMilestones('wealth').length > 0 && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Favorable Wealth Periods', 'अनुकूल धन काल')}</h3>
              {(() => { const rows = rpMilestones('wealth'); return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Period', 'अवधि')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Event / Guidance', 'घटना / मार्गदर्शन')}</th></tr></thead>
                  <tbody>{rows.map((m, i) => (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-700"><Td className="font-medium whitespace-nowrap">{m.period || m.year || '—'}</Td><Td className="text-slate-600 dark:text-slate-400">{m.event}{m.note ? ` — ${m.note}` : ''}</Td></tr>
                  ))}</tbody>
                </table>
              </div>)})()}
            </div>
          )}
        </section>
      )}
{/* DETAILED MARRIAGE ANALYSIS (7th house deep dive) */}
      {((rpNarr('marriage') !== '') || rpMilestones('marriage').length > 0) && (
        <section className="print-page">
          <SectionHeading title={_t('Detailed Marriage & Love Analysis', 'विस्तृत विवाह एवं प्रेम विश्लेषण')} subtitle={_t('7th house deep dive', 'सप्तम भाव पर गहन अध्ययन')} />
          {rpNarr('marriage') && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Marriage Prospects', 'विवाह संभावनाएँ')}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{rpNarr('marriage')}</p>
            </div>
          )}
          {rpMilestones('marriage').length > 0 && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Favorable Marriage Periods', 'अनुकूल विवाह काल')}</h3>
              {(() => { const rows = rpMilestones('marriage'); return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Period', 'अवधि')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Event / Advice', 'घटना / सलाह')}</th></tr></thead>
                  <tbody>{rows.map((m, i) => (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-700"><Td className="font-medium whitespace-nowrap">{m.period || m.year || '—'}</Td><Td className="text-slate-600 dark:text-slate-400">{m.event}{m.note ? ` — ${m.note}` : ''}</Td></tr>
                  ))}</tbody>
                </table>
              </div>)})()}
            </div>
          )}
        </section>
      )}

      {/* CAREER GUIDANCE with 3-year outlook */}
      {((rpNarr('career') !== '') || rpMilestones('career').length > 0) && (
        <section className="print-page">
          <SectionHeading title={_t('Career Guidance', 'करियर मार्गदर्शन')} subtitle={_t('3-Year Professional Outlook', '3 वर्षीय पेशेवर दृष्टिकोण')} />
          {rpNarr('career') && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Career Overview', 'करियर अवलोकन')}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{rpNarr('career')}</p>
            </div>
          )}
          {rpMilestones('career').length > 0 && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('3-Year Outlook', '3 वर्षीय दृष्टिकोण')}</h3>
              {(() => { const rows = rpMilestones('career'); return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Period', 'अवधि')}</th><th className="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-600">{_t('Key Event / Guidance', 'मुख्य घटना / मार्गदर्शन')}</th></tr></thead>
                  <tbody>{rows.map((m, i) => (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-700"><Td className="font-medium whitespace-nowrap">{m.year || m.period || '—'}</Td><Td className="text-slate-600 dark:text-slate-400">{m.event}{m.note ? ` — ${m.note}` : ''}</Td></tr>
                  ))}</tbody>
                </table>
              </div>)})()}
            </div>
          )}
        </section>
      )}
{/* REMEDIAL MEASURES (mantras, gems, donations) */}
      {(rpGemstones.length > 0 || rpMantras.length > 0) && (
        <section className="print-page">
          <SectionHeading title={_t('Remedial Measures', 'उपाय मार्गदर्शन')} subtitle={_t('Mantras, Gems, and Donations', 'मंत्र, मणि, और दान')} />
          {rpGemstones.length > 0 && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Recommended Gemstones', 'अनुशंसित रत्न')}</h3>
              <ul className="space-y-2">{rpGemstones.map((g, i) => (<li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span>{g}</span></li>))}</ul>
            </div>
          )}
          {rpMantras.length > 0 && (
            <div className="astro-card p-6">
              <h3 className="text-lg font-bold font-serif text-amber-600 dark:text-amber-300 mb-3">{_t('Daily Mantras', 'दैनिक मंत्र')}</h3>
              <ul className="space-y-2">{rpMantras.map((m, i) => (<li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span>{m}</span></li>))}</ul>
            </div>
          )}
        </section>
      )}

      {/* TRANSITS (Gochar) */}
      {(() => {
        const planetsPos = chartData?.planets ?? [];
        return planetsPos.length > 0 ? (
          <section className="print-page">
            <SectionHeading title={_t('Transits (Gochar)', 'गोचर')} subtitle={_t('Current Planetary Transits', 'वर्तमान ग्रह स्थितियाँ')} />
            <div className="astro-card overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="bg-amber-50 dark:bg-amber-900/20"><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Planet', 'ग्रह')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Sign', 'राशि')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('House', 'भाव')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Nakshatra', 'नक्षत्र')}</th><th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-600">{_t('Retro / Direct', 'वक्री / सीधा')}</th></tr></thead>
                <tbody>{planetsPos.map((p, i) => (
                  <tr key={i} className="border-b border-slate-200 dark:border-slate-700"><Td className="font-semibold">{locPlanet(lang, p.name)}</Td><Td>{locSign(lang, p.sign)}</Td><Td>{p.house}</Td><Td>{p.nakshatra}</Td><Td>{p.retrograde ? _t('Retro', 'वक्री') : _t('Direct', 'सीधा')}</Td></tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        ) : null;
      })()}

      {/* FOOTER DISCLAIMER — own print-page */}
      <section className="print-page border-t border-slate-200 dark:border-slate-700 pt-6 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {_t('This report is generated for guidance and educational purposes only. It is not a substitute for professional medical, legal, or financial advice.', 'यह रिपोर्ट केवल मार्गदर्शन और शैक्षिक उद्देश्य के लिए तैयार की गई है। यह पेशेवर चिकित्सा, कानूनी, या वित्तीय सलाह का स्थान नहीं लेती।')}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">AstroSage AI © {new Date().getFullYear()}</p>
      </section>
    </div>
  );
}
// ─── Sub-components ───────────────────────────────────────────────────────────

function DoshaCard({ lang, title, present, severity, isNeutralized, description, remedies }: {
  lang: 'en' | 'hi'; title: string; present: boolean; severity?: string; isNeutralized?: boolean; description?: string; remedies: string[];
}) {
  const sevLabel = !severity || severity === 'none' ? tr(lang, 'None', 'कोई नहीं') : severity === 'mild' ? tr(lang, 'Mild', 'हल्का') : severity === 'moderate' ? tr(lang, 'Moderate', 'मध्यम') : tr(lang, 'Severe', 'गंभीर');
  return (
    <div className="astro-card p-6">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h3 className="text-lg font-bold text-amber-600 dark:text-amber-300">{title}</h3>
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${present ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
          {present ? tr(lang, 'Present', 'उपस्थित') : tr(lang, 'Absent', 'अनुपस्थित')}
        </span>
        {present && (<span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{tr(lang, 'Severity', 'गंभीरता')}: {sevLabel}</span>)}
        {present && isNeutralized !== undefined && (
          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${isNeutralized ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
            {isNeutralized ? tr(lang, 'Neutralized', 'निर्प्रभावी') : tr(lang, 'Active', 'सक्रिय')}
          </span>
        )}
      </div>
      {description && (<p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 pl-4 border-l-4 border-rose-300 dark:border-rose-500">{description}</p>)}
      {remedies.length > 0 && (
        <>
          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-200 mb-2">{tr(lang, 'Remedies', 'उपाय')}</h4>
          <ul className="space-y-1.5">{remedies.map((r, i) => (<li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span>{r}</span></li>))}</ul>
        </>
      )}
    </div>
  );
}
