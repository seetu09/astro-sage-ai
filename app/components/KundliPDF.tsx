"use client";

import React, { useState, useRef } from "react";
import { Download, FileText, Loader2, Sparkles, CheckCircle } from "lucide-react";
import PaymentButton from "./PaymentButton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface KundliPDFProps {
  userEmail: string;
  userName?: string;
  kundliData: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    ascendant: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    planets: Array<{
      name: string;
      sign: string;
      house: number;
      degree: number;
      status: string;
    }>;
  };
}

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function getZodiacSign(day: number, month: number): string {
  const signs = [
    { sign: "Capricorn", lastDay: 19 },
    { sign: "Aquarius", lastDay: 18 },
    { sign: "Pisces", lastDay: 20 },
    { sign: "Aries", lastDay: 19 },
    { sign: "Taurus", lastDay: 20 },
    { sign: "Gemini", lastDay: 20 },
    { sign: "Cancer", lastDay: 22 },
    { sign: "Leo", lastDay: 22 },
    { sign: "Virgo", lastDay: 22 },
    { sign: "Libra", lastDay: 22 },
    { sign: "Scorpio", lastDay: 21 },
    { sign: "Sagittarius", lastDay: 21 },
    { sign: "Capricorn", lastDay: 31 },
  ];
  return signs[month].sign;
}

function getMoonSign(day: number, month: number): string {
  return zodiacSigns[(day + month * 2) % 12];
}

function getNakshatra(day: number): string {
  return nakshatras[day % nakshatras.length];
}

function getAscendant(day: number, month: number): string {
  return zodiacSigns[(day + month) % 12];
}

function getPlanetaryPositions(day: number, month: number) {
  return [
    { name: "Sun", sign: getZodiacSign(day, month), house: (day % 12) + 1, degree: (day * 10) % 30, status: "Exalted" },
    { name: "Moon", sign: getMoonSign(day, month), house: ((day + 3) % 12) + 1, degree: ((day + 5) * 8) % 30, status: "Neutral" },
    { name: "Mars", sign: zodiacSigns[(day + 2) % 12], house: ((day + 5) % 12) + 1, degree: ((day + 10) * 12) % 30, status: "Debilitated" },
    { name: "Mercury", sign: zodiacSigns[(day + 1) % 12], house: ((day + 2) % 12) + 1, degree: ((day + 2) * 15) % 30, status: "Neutral" },
    { name: "Jupiter", sign: zodiacSigns[(day + 4) % 12], house: ((day + 8) % 12) + 1, degree: ((day + 8) * 7) % 30, status: "Exalted" },
    { name: "Venus", sign: zodiacSigns[(day + 6) % 12], house: ((day + 3) % 12) + 1, degree: ((day + 3) * 11) % 30, status: "Neutral" },
    { name: "Saturn", sign: zodiacSigns[(day + 8) % 12], house: ((day + 12) % 12) + 1, degree: ((day + 12) * 9) % 30, status: "Neutral" },
    { name: "Rahu", sign: zodiacSigns[(day + 10) % 12], house: ((day + 6) % 12) + 1, degree: ((day + 15) * 6) % 30, status: "Malefic" },
    { name: "Ketu", sign: zodiacSigns[(day + 16) % 12], house: ((day + 11) % 12) + 1, degree: ((day + 21) * 14) % 30, status: "Malefic" },
  ];
}

export default function KundliPDF({
  userEmail,
  userName,
  kundliData,
}: KundliPDFProps) {
  const [isPaid, setIsPaid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateDetailedReport = () => {
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, ascendant, moonSign, sunSign, nakshatra, planets } = kundliData;

    const dob = new Date(dateOfBirth);
    const day = dob.getDate();
    const month = dob.getMonth() + 1;
    const year = dob.getFullYear();

    const dashas = [
      { planet: "Jupiter", startYear: year, endYear: year + 16, years: 16 },
      { planet: "Saturn", startYear: year + 16, endYear: year + 35, years: 19 },
      { planet: "Mercury", startYear: year + 35, endYear: year + 52, years: 17 },
      { planet: "Ketu", startYear: year + 52, endYear: year + 59, years: 7 },
      { planet: "Venus", startYear: year + 59, endYear: year + 79, years: 20 },
    ];

    const predictions = [
      `Career: ${name} will experience significant growth in their professional life during Jupiter's transit. Opportunities for leadership roles will emerge after age 30.`,
      `Finance: Financial stability is indicated after age 28. Real estate investments will be favorable. Avoid speculative investments during Saturn's Sade Sati period.`,
      `Health: General health will be good. Pay attention to digestive health and maintain a balanced diet. Regular exercise is recommended after age 35.`,
      `Relationships: Marriage prospects are strong. The ideal partner will be supportive and understanding. Family life will bring joy and fulfillment.`,
      `Education: Strong academic inclination is shown. Success in higher education is indicated. Technical or scientific fields will be particularly favorable.`,
      `Spirituality: A natural inclination towards spiritual practices will develop with age. Meditation and yoga will bring mental peace and clarity.`,
      `Travel: Foreign travel is indicated in the mid-30s. Short journeys for work will be frequent and beneficial.`,
      `Challenges: The period between ages 28-32 may bring some challenges. Patience and perseverance will help overcome obstacles.`,
    ];

    const yogas = [
      { name: "Gaja Kesari Yoga", description: "Moon and Jupiter in mutual kendras. Brings wisdom, wealth, and fame.", present: true },
      { name: "Dhana Yoga", description: "Connection between 2nd and 11th house lords. Indicates wealth accumulation.", present: true },
      { name: "Raja Yoga", description: "Connection between trine and quadrant lords. Brings power and authority.", present: true },
    ];

    const doshas = [
      { name: "Mangal Dosha", present: planets.find((p: any) => p.name === "Mars")?.house === 1 || planets.find((p: any) => p.name === "Mars")?.house === 2 || planets.find((p: any) => p.name === "Mars")?.house === 4 || planets.find((p: any) => p.name === "Mars")?.house === 7 || planets.find((p: any) => p.name === "Mars")?.house === 8 || planets.find((p: any) => p.name === "Mars")?.house === 12, severity: "Medium" },
      { name: "Kaal Sarp Dosha", present: false, severity: "None" },
      { name: "Pitru Dosha", present: false, severity: "None" },
    ];

    const gemstones = [
      { name: "Yellow Sapphire (Pukhraj)", planet: "Jupiter", benefit: "Wisdom, prosperity, spiritual growth", finger: "Index", metal: "Gold", day: "Thursday" },
      { name: "Red Coral (Moonga)", planet: "Mars", benefit: "Courage, energy, vitality", finger: "Ring", metal: "Gold/Copper", day: "Tuesday" },
      { name: "Emerald (Panna)", planet: "Mercury", benefit: "Intelligence, communication, business success", finger: "Little", metal: "Gold", day: "Wednesday" },
    ];

    const remedies = [
      "Chant the Gayatri Mantra 108 times daily during sunrise.",
      "Feed Brahmins or poor people on Thursdays for Jupiter's blessings.",
      "Wear yellow clothes on Thursdays for Jupiter's favor.",
      "Donate red items on Tuesdays to pacify Mars.",
      "Light a mustard oil lamp under a peepal tree on Saturdays.",
      "Recite Hanuman Chalisa on Tuesdays and Saturdays for strength.",
    ];

    return {
      personalInfo: { name, dateOfBirth: `${day}-${month}-${year}`, timeOfBirth, placeOfBirth, ascendant, moonSign, sunSign, nakshatra, rashi: moonSign },
      planetaryPositions: planets,
      dashas,
      predictions,
      yogas: yogas.filter((y: any) => y.present),
      doshas,
      gemstones,
      remedies,
      favorableColors: ["Yellow", "Orange", "Red", "White"],
      favorableNumbers: [3, 12, 21, 30, 9, 18, 27],
      favorableDirections: ["East", "North"],
    };
  };

  const report = generateDetailedReport();

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      let imgY = 10;

      const scaledHeight = imgHeight * ratio;
      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", imgX, position, imgWidth * ratio, scaledHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`AstroVeda_Kundli_Report_${kundliData.name}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isPaid) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center mt-8">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Get Your Detailed Kundli Report
        </h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
          Unlock your complete Vedic birth chart analysis with planetary positions, 
          dasha periods, yogas, doshas, gemstones, and personalized predictions.
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-6 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>15+ Pages</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>PDF Download</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Lifetime Access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Expert Analysis</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-amber-600">Rs. 49</span>
            <span className="text-sm text-gray-400 line-through">Rs. 199</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">75% OFF</span>
          </div>

          {/* ✅ FIXED: amount changed from 4900 to 49, added userName */}
          <PaymentButton
            amount={49}
            userEmail={userEmail}
            userName={userName}
            paymentType="kundli_report"
            buttonText="Get Detailed Report - Rs. 49"
            onSuccess={() => setIsPaid(true)}
            onFailure={() => alert("Payment failed. Please try again.")}
          />

          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Secure payment via Razorpay | UPI, Cards, Net Banking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-green-700 font-semibold">Payment Successful!</p>
        <p className="text-green-600 text-sm">Your detailed Kundli report is ready</p>
      </div>

      <div className="text-center">
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-purple-500 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF Report
            </>
          )}
        </button>
      </div>

      <div 
        ref={reportRef} 
        className="bg-white p-8 rounded-xl border border-gray-200"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div className="text-center pb-6 border-b-2 border-violet-600 mb-6">
          <h1 className="text-3xl font-bold text-violet-700 mb-1">AstroVeda</h1>
          <p className="text-gray-500 text-sm">Detailed Vedic Kundli Report</p>
          <p className="text-xs text-gray-400 mt-1">Generated on {new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Personal Information</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-violet-50 p-2 rounded"><strong>Name:</strong> {report.personalInfo.name}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Date of Birth:</strong> {report.personalInfo.dateOfBirth}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Time of Birth:</strong> {report.personalInfo.timeOfBirth}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Place of Birth:</strong> {report.personalInfo.placeOfBirth}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Ascendant:</strong> {report.personalInfo.ascendant}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Moon Sign:</strong> {report.personalInfo.moonSign}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Sun Sign:</strong> {report.personalInfo.sunSign}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Nakshatra:</strong> {report.personalInfo.nakshatra}</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Planetary Positions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-violet-600 text-white">
                <th className="p-2 text-left">Planet</th>
                <th className="p-2 text-left">Sign</th>
                <th className="p-2 text-left">House</th>
                <th className="p-2 text-left">Degree</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.planetaryPositions.map((p: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2 font-semibold">{p.name}</td>
                  <td className="p-2">{p.sign}</td>
                  <td className="p-2">{p.house}</td>
                  <td className="p-2">{p.degree.toFixed(1)}°</td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === "Exalted" ? "bg-green-100 text-green-700" :
                      p.status === "Debilitated" ? "bg-red-100 text-red-700" :
                      p.status === "Malefic" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Dasha Periods (Vimshottari)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-violet-600 text-white">
                <th className="p-2 text-left">Planet</th>
                <th className="p-2 text-left">Start Year</th>
                <th className="p-2 text-left">End Year</th>
                <th className="p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {report.dashas.map((d: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2 font-semibold">{d.planet}</td>
                  <td className="p-2">{d.startYear}</td>
                  <td className="p-2">{d.endYear}</td>
                  <td className="p-2">{d.years} Years</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Life Predictions</h2>
          {report.predictions.map((p: string, i: number) => (
            <div key={i} className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-2 rounded-r-lg text-sm">
              {p}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Yogas (Auspicious Combinations)</h2>
          {report.yogas.map((y: any, i: number) => (
            <div key={i} className="bg-green-50 border border-green-200 p-3 mb-2 rounded-lg text-sm">
              <h4 className="font-bold text-green-700 mb-1">{y.name}</h4>
              <p className="text-gray-700">{y.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Doshas (Afflictions)</h2>
          <div className="flex flex-wrap gap-2">
            {report.doshas.map((d: any, i: number) => (
              <span key={i} className={`text-sm px-3 py-1 rounded-full font-semibold ${
                d.present ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                {d.name}: {d.present ? d.severity : "None"}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Recommended Gemstones</h2>
          {report.gemstones.map((g: any, i: number) => (
            <div key={i} className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 mb-2 rounded-lg text-sm border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-1">{g.name}</h4>
              <p><strong>Planet:</strong> {g.planet} | <strong>Benefit:</strong> {g.benefit}</p>
              <p><strong>Wear on:</strong> {g.finger} finger | <strong>Metal:</strong> {g.metal} | <strong>Day:</strong> {g.day}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Remedies & Recommendations</h2>
          {report.remedies.map((r: string, i: number) => (
            <div key={i} className="bg-blue-50 border-l-3 border-blue-400 p-3 mb-2 rounded-r-lg text-sm">
              {r}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-violet-700 border-l-4 border-amber-500 pl-3 mb-3">Favorable Aspects</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-violet-50 p-2 rounded"><strong>Colors:</strong> {report.favorableColors.join(", ")}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Numbers:</strong> {report.favorableNumbers.join(", ")}</div>
            <div className="bg-violet-50 p-2 rounded"><strong>Directions:</strong> {report.favorableDirections.join(", ")}</div>
          </div>
        </div>

        <div className="text-center pt-6 border-t-2 border-gray-200 text-gray-400 text-xs">
          <p>AstroVeda AI Generated Report</p>
          <p>For personal consultation, visit astro-sage-ai.vercel.app</p>
          <p className="mt-2">2026 AstroVeda. All rights reserved.</p>
          <p className="text-gray-300 mt-1">Disclaimer: This report is for informational purposes only.</p>
        </div>
      </div>
    </div>
  );
}
