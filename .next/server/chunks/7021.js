"use strict";exports.id=7021,exports.ids=[7021],exports.modules={7021:(e,t,a)=>{a.d(t,{M:()=>F});var i=a(43493);function s(e){return((e-1)%12+12)%12+1}function r(e){return((e-1)%12+12)%12+1}function n(e){return e.replace(/\&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(e){return i.B4[((e-1)%12+12)%12]??"♈"}function l(e,t){let a=(0,i.zb)(e.planet,t)||e.planet.slice(0,2);return e.retrograde?"hi"===t?`${a}(व)`:`${a}\xae`:a}let d=[{house:1,poly:"100,100 200,0 300,100 200,200",cx:200,cy:100,px:200},{house:2,poly:"0,0 200,0 100,100",cx:100,cy:33.33,px:100},{house:3,poly:"0,0 100,100 0,200",cx:33.33,cy:100,px:49.33},{house:4,poly:"100,300 0,200 100,100 200,200",cx:100,cy:200,px:100},{house:5,poly:"0,200 100,300 0,400",cx:33.33,cy:300,px:49.33},{house:6,poly:"0,400 100,300 200,400",cx:100,cy:366.67,px:100},{house:7,poly:"300,300 200,400 100,300 200,200",cx:200,cy:300,px:200},{house:8,poly:"200,400 300,300 400,400",cx:300,cy:366.67,px:300},{house:9,poly:"400,400 400,200 300,300",cx:366.67,cy:300,px:350.67},{house:10,poly:"300,100 400,200 300,300 200,200",cx:300,cy:200,px:300},{house:11,poly:"400,200 300,100 400,0",cx:366.67,cy:100,px:350.67},{house:12,poly:"400,0 200,0 300,100",cx:300,cy:33.33,px:300}],c={1:[200,90],2:[100,50],3:[50,100],4:[90,200],5:[100,350],6:[50,300],7:[200,310],8:[300,350],9:[350,300],10:[310,200],11:[300,50],12:[350,100]},h={1:{row:0,col:0},2:{row:0,col:1},3:{row:0,col:2},4:{row:0,col:3},5:{row:1,col:3},6:{row:2,col:3},7:{row:3,col:3},8:{row:3,col:2},9:{row:3,col:1},10:{row:3,col:0},11:{row:2,col:0},12:{row:1,col:0}};function p(e){return"south"===e.style?function(e){let{language:t,ascendantSign:a=1,planets:s=[],showTitle:d=!1,title:c,stroke:p="#333333",background:m="#ffffff",textColor:g="#1a1a2e"}=e,u=r(a),$={};for(let e of s||[]){let t=r(e.sign);($[t]||=[]).push(e)}let f=Object.keys(h).map(Number).sort((e,t)=>e-t).map(e=>{let{row:a,col:s}=h[e],r=100*s+50,d=100*a+50,c=(e-u+12)%12+1,f=Math.min(($[e]||[]).length,4),b=($[e]||[]).slice(0,f).map((e,a)=>{let i=r+(a-(f-1)/2)*15;return`<text x="${i}" y="${d+15}" font-size="9" font-weight="600" fill="${g}" text-anchor="middle">${n(l(e,t))}</text>`}).join(""),v=`<text x="${r}" y="${d-6}" font-size="8" fill="${p}" text-anchor="middle">${n((0,i.yL)(e,t))}</text>`,y=`<text x="${r}" y="${d-16}" font-size="10" fill="${g}" text-anchor="middle">${o(e)}</text>`,x=`<text x="${r}" y="${0===a?100*a+12:3===a?100*a+100-8:d}" font-size="8" fill="${p}" text-anchor="middle">${c}</text>`;return`<g>
  <rect x="${100*s+1}" y="${100*a+1}" width="98" height="98" fill="${m}" stroke="${p}" stroke-width="1"/>
  ${y}${v}${b}${x}
</g>`}).join(""),b="hi"===t?"लग्न":"Lagna",v=`<g>
  <text x="200" y="192" font-size="9" fill="${p}" text-anchor="middle">${n(b)}</text>
  <text x="200" y="210" font-size="14" font-weight="700" fill="${g}" text-anchor="middle">${o(u)} ${n((0,i.yL)(u,t))}</text>
</g>`,y=d?`<text x="200" y="14" font-size="12" font-weight="600" fill="${g}" text-anchor="middle">${n(c||("hi"===t?"दक्षिण भारतीय चार्ट":"South Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${n(c||"Kundli chart")}">
<rect width="400" height="400" fill="${m}"/>
${y}
<g stroke="${p}" stroke-width="1" fill="none">
  <path d="M0,100 H400 M0,200 H400 M0,300 H400"/>
  <path d="M100,0 V400 M200,0 V400 M300,0 V400"/>
</g>
${f}
${v}
</svg>`}(e):function(e){let{language:t,ascendantSign:a=1,planets:h=[],houses:p,showTitle:m=!1,title:g,stroke:u="#8c1d1d",background:$="#ffffff",textColor:f="#2d3748"}=e,b=r(a),v=function(e,t){let a=r(e||1),i={};for(let e=1;e<=12;e++)i[e]=r(a+e-1);if(t&&t.length)for(let e of t)e&&e.house>=1&&e.house<=12&&e.sign>=1&&e.sign<=12&&(i[s(e.house)]=r(e.sign));return i}(b,p),y=function(e){let t={};for(let a of e||[]){let e=s(a.house||1);(t[e]||=[]).push(a)}return t}(h),x=d.map(e=>{let a=v[e.house],s=y[e.house]||[],[r,d]=c[e.house]??[e.cx,e.cy],h=`<text x="${e.cx}" y="${d-14}" font-size="10" fill="${u}" text-anchor="middle">${o(a)}</text>`,p=`<text x="${r}" y="${d}" font-size="11" fill="#2d3748" text-anchor="middle">${e.house}</text>`,m=s.slice(0,5),g=m.length,$=m.map((a,i)=>{let s=e.cy+(i-(g-1)/2)*12;return`<text x="${e.px}" y="${s}" font-size="9" font-weight="600" fill="${f}" text-anchor="middle">${n(l(a,t))}</text>`}).join(""),x=s.length>5?`<text x="${e.px}" y="${e.cy+12*g}" font-size="7" fill="${u}" text-anchor="middle">+${s.length-5}</text>`:"",k=1===e.house?`<text x="${e.cx}" y="${e.cy+34}" font-size="10" font-weight="700" fill="${f}" text-anchor="middle">${n((0,i.yL)(b,t))}</text>`:"";return`<g>${h}${p}${$}${x}${k}</g>`}).join(""),k=`<rect x="0" y="0" width="400" height="400" fill="none" stroke="${u}" stroke-width="2"/>
<line x1="0" y1="0" x2="400" y2="400" stroke="${u}" stroke-width="1.5"/>
<line x1="400" y1="0" x2="0" y2="400" stroke="${u}" stroke-width="1.5"/>
<polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="${u}" stroke-width="1.5"/>`,w=m?`<text x="200" y="14" font-size="12" font-weight="600" fill="${f}" text-anchor="middle">${n(g||("hi"===t?"उत्तर भारतीय चार्ट":"North Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${n(g||"Kundli chart")}">
<rect width="400" height="400" fill="${$}"/>
${w}
${k}
${x}
</svg>`}(e)}let m={hi:{title:"जन्म कुंडली विशद़ विश्लेषण",clientName:"क्लाइंट नाम",chartType:"चार्ट प्रकार",birthDetails:"जन्म विवरण",birthDetailsShort:"जन्म विवरण",planetaryPositions:"ग्रह स्थिति",houseCusps:"घर कस्स",dashaPeriods:"दशा अवधि",yogas:"योग",remedies:"उपाय",domainInsights:"डोमेन अंतर्दृष्टि",scorecard:"स्कोरकार्ड",page:"पृष्ठ",northIndian:"उत्तर भारतीय",southIndian:"दक्षिण भारतीय",paid:"प्रीमियम रिपोर्ट",basic:"मूलभूत रिपोर्ट",latLong:"अक्षांश / द्राघिमांश",bodyCol:"ग्रह",signCol:"राशि",degreeCol:"डिग्री",houseCol:"घर",retroCol:"रीत्रो",mahaDashaCol:"महादशा",startCol:"प्रारंभ",endCol:"समाप्ति",subPeriodCol:"उप-अवधि",panchang:"जन्म पंचांग",lagnaD1Chart:"लग्न कुंडली (D1)",navamsaD9Chart:"नवांश (D9) चार्ट",sarvashtakavarga:"सर्वाष्टकवर्ग बिंदु",strongHouses:"प्रबल भाव",dashasYogasRemedies:"दशा, योग एवं उपाय",housesNavamsaAshtakavarga:"भाव, नवांश एवं अष्टकवर्ग",lifeDomains:"जीवन क्षेत्र विश्लेषण",references:"कल्पुरुश पुस्तक / स्रोत",parameter:"पैरामीटर",score:"स्कोर",period:"अवधि",influence:"प्रभाव",event:"घटना",note:"टिप्पणी",notAvailable:"उपलब्ध नहीं",generatedOn:"onDate को जनरेट किया गया",appendix:"परिशिष्ट — जीवन स्तंभ",milestones:"प्रमुख मील के पत्थर",aiNote:"यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।",yogDoshTitle:"योग एवं दोष विश्लेषण",doshaSection:"दोष विवरण",manglik:"मांगलिक",manglikDosha:"मांगलिक दोष",manglikYes:"हाँ — दोष उपस्थित है",manglikNo:"नहीं — दोष उपस्थित नहीं है",doshaSeverity:"दोष तीव्रता",severityHigh:"उच्च",severityMedium:"मध्यम",severityMild:"हल्का",severityNone:"कोई नहीं",sadeSati:"साढ़े साती",satiPhase1:"साढ़े साती — प्रथम चरण (मंगल अ/शनि के 12वें)",satiPhase2:"साढ़े साती — द्वितीय चरण (शनि राशि में)",satiPhase3:"साढ़े साती — तृतीय चरण (द्वितीय)",noSadeSati:"वर्तमान में साढ़े साती सक्रिय नहीं है",gemRudhSection:"रत्न एवं रुद्राक्ष विधान",primaryFortifyingPlanet:"प्राथमिक सुधार ग्रह",recommendedGemstone:"अनुशंसित रत्न",recommendedRudraksha:"अनुशंसित रुद्राक्ष",wearingDay:"धारण का दिन",gemMantra:"जप मंत्र",gemmtGoal:"उद्देश्य",planet:"ग्रह",gemReason:"सुधार हेतु",noRemedyData:"उपाय विवरण उपलब्ध नहीं",currDashaTitle:"वर्तमान दशा — गहन अध्ययन",currMahaDasha:"वर्तमान महादशा",currAntardasha:"वर्तमान अंतर्दशा",activeWindow:"सक्रिय अवधि",currentRemark:"वर्तमान में चल रही दशा उपरोक्त कालखंड में सक्रिय है।",onDashaNow:"अभी सक्रिय",upcomingNext:"आगामी",dashaCycle:"दशा क्रम",manglikSadeTitle:"मंगल एवं साढ़े साती ट्रैकर",manglikTracker:"मांगलिक ट्रैकर",satiTracker:"साढ़े साती ट्रैकर",maleficKarm:"कोष",activePhase:"सक्रिय चरण",phaseStart:"प्रारंभ",phaseEnd:"समाप्ति",dashaMasterTitle:"120 वर्ष महादशा तालिका",vimshottari:"विमशोत्तरी",seqNo:"अनु",mahaYears:"वर्ष",fromYear:"प्रारंभ",toYear:"समाप्ति"},en:{title:"Birth Chart Detailed Analysis",clientName:"Client Name",chartType:"Chart Type",birthDetails:"Birth Details",birthDetailsShort:"Birth Details",planetaryPositions:"Planetary Positions",houseCusps:"House Cusps",dashaPeriods:"Dasha Periods",yogas:"Yogas",remedies:"Remedies",domainInsights:"Domain Insights",scorecard:"Scorecard",page:"Page",northIndian:"North Indian",southIndian:"South Indian",paid:"Premium Report",basic:"Basic Report",latLong:"Lat / Long",bodyCol:"Body",signCol:"Sign",degreeCol:"Degree",houseCol:"House",retroCol:"Retro",mahaDashaCol:"Maha Dasha",startCol:"Start",endCol:"End",subPeriodCol:"Sub Period",panchang:"Panchang at Birth",lagnaD1Chart:"Lagna (D1) Chart",navamsaD9Chart:"Navamsa (D9) Chart",sarvashtakavarga:"Sarvashtakavarga Bindus",strongHouses:"Strong houses",dashasYogasRemedies:"Dashas, Yogas & Remedies",housesNavamsaAshtakavarga:"Houses, Navamsa & Ashtakavarga",lifeDomains:"Life Domains Analysis",references:"References / Sources",parameter:"Parameter",score:"Score",period:"Period",influence:"Influence",event:"Event",note:"Note",notAvailable:"Not available",generatedOn:"Generated for onDate",appendix:"Appendix — Life Pillars",milestones:"Key Milestones",aiNote:"This chapter is based on AI-assisted Vedic astrology guidance.",yogDoshTitle:"Yogas & Doshas Analysis",doshaSection:"Doshas",manglik:"Manglik",manglikDosha:"Manglik Dosha",manglikYes:"Yes — dosha present",manglikNo:"No — dosha not present",doshaSeverity:"Dosha Severity",severityHigh:"High",severityMedium:"Medium",severityMild:"Mild",severityNone:"None",sadeSati:"Sade Sati",satiPhase1:"Sade Sati — Phase 1 (Moon in 12th from Saturn)",satiPhase2:"Sade Sati — Phase 2 (Moon in Saturn's sign)",satiPhase3:"Sade Sati — Phase 3 (2nd from Saturn)",noSadeSati:"Sade Sati is not active at present",gemRudhSection:"Gemstone & Rudraksha Prescription",primaryFortifyingPlanet:"Primary fortifying planet",recommendedGemstone:"Recommended Gemstone",recommendedRudraksha:"Recommended Rudraksha",wearingDay:"Wearing Day",gemMantra:"Japa Mantra",gemmtGoal:"Objective",planet:"Planet",gemReason:"Purpose",noRemedyData:"Remedy details not available",currDashaTitle:"Current Dasha — Deep Dive",currMahaDasha:"Current Maha Dasha",currAntardasha:"Current Antardasha",activeWindow:"Active Window",currentRemark:"The currently running dasha is active within the above window.",onDashaNow:"Active now",upcomingNext:"Upcoming",dashaCycle:"Dasha Sequence",manglikSadeTitle:"Mars & Sade Sati Tracker",manglikTracker:"Manglik Tracker",satiTracker:"Sade Sati Tracker",maleficKarm:"Cause",activePhase:"Active Phase",phaseStart:"Start",phaseEnd:"End",dashaMasterTitle:"120-Year Maha Dasha Master Table",vimshottari:"Vimshottari",seqNo:"No.",mahaYears:"Years",fromYear:"From",toYear:"To"}},g=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),u=(e,t)=>m[t][e],$=`
@page { margin: 0; padding: 0; size: A4; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  /* Client fallback (window.print): hard breaks so every dense .page-container
     lands on its own physical sheet, chrome included. */
  html, body { width: 210mm; overflow: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page-container {
    page-break-after: always;
    break-after: page;
    width: 210mm;
    min-height: 297mm;
    height: auto;
    /* REMOVED: max-height and overflow: hidden — these clip content and create artificial blank space */
  }
  .page-container:last-child { page-break-after: auto; break-after: auto; }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; font-size: 12pt; line-height: 1.4; color: #1a1a1a; background: #fff; }
html, body { overflow: hidden; }
@page :first { margin: 0; }

/* Dense A4 sheet — standard 210mm \xd7 297mm portrait with uniform 12mm padding.
   Sheets GROUP multiple sections; only the container carries the page break,
   so small standalone components never force a near-empty page anymore. */
.page-container {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm;
  margin: 0 auto;
  page-break-after: always;
  position: relative;
  background: #fff;
}
.page-container:last-child { page-break-after: auto; }
.page-content { width: 100%; }
/* Inner cards/tables intentionally carry NO page-break rules — each .page-container
   is the strict A4 boundary (1 page = 1 A4 unit). Related sections are simply
   grouped inside that single wrapper so the renderer never forces a mid-card
   split or emits a near-empty overflow sheet. */
.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.25cm; border-bottom: 3pt solid #999; margin-bottom: 0.35cm; }
.header h1 { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 16pt; font-weight: 700; }
.header h1.en { font-family: 'Inter', sans-serif; }
.header .meta { text-align: right; font-size: 9pt; color: #555; }
.header .meta span { display: block; }
.cover-band { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1pt solid #ddd; padding-bottom: 0.2cm; margin-bottom: 0.3cm; }
.cover-band .client-name { font-size: 15pt; font-weight: 700; font-family: 'Noto Sans Devanagari', sans-serif; }
.footer { position: absolute; bottom: 10mm; width: calc(100% - 24mm); text-align: center; font-size: 8pt; color: #777; border-top: 1pt solid #ddd; padding-top: 0.25cm; }
.footer .page-number { display: inline-block; }
.h2 { font-size: 11pt; font-weight: 700; margin-bottom: 0.25cm; color: #333; }
.h2.en { font-family: 'Inter', sans-serif; }
.p { font-size: 9.5pt; margin-bottom: 0.25cm; text-align: justify; }
.p.en { font-family: 'Inter', sans-serif; }
.two-col { column-count: 2; column-gap: 0.5cm; }
.table-0 { width: 100%; border-collapse: collapse; margin-bottom: 0.3cm; }
.table-0 th, .table-0 td { border: 0.5pt solid #bbb; padding: 3px 5px; text-align: left; font-size: 8.5pt; }
.table-0 th { background: #f0f0f0; }
.chart-container { text-align: center; margin: 0.25cm auto; }
.chart-container svg { max-width: 100%; height: auto; }
.chart-sm { max-width: 82mm; margin-left: auto; margin-right: auto; }
.section-title { font-size: 10pt; font-weight: 700; margin: 0.2cm 0 0.1cm; display: inline-block; }
.score-bar { height: 6pt; background: #eee; border-radius: 2px; overflow: hidden; display: inline-block; width: 60%; vertical-align: middle; margin-left: 5px; }
.score-fill { height: 100%; background: #3b82f6; }
.score-text { font-size: 8.5pt; font-weight: 700; }
.tag { display: inline-block; padding: 1pt 6px; border-radius: 3px; font-size: 8pt; font-weight: 700; }
.tag.paid { background: #fbbf24; color: #78350f; }
.tag.basic { background: #9ca3af; color: #374151; }
.badge-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 0.25cm; }
.divider { border-top: 1pt dashed #bbb; margin: 0.2cm 0; }
.note { font-size: 8pt; font-style: italic; color: #666; }

/* Panchang strip — compact key/value tiles (Page 1). */
.tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 0.25cm; }
.tile { border: 0.5pt solid #bbb; border-radius: 3px; padding: 4px 6px; }
.tile-k { font-size: 7.5pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
.tile-v { font-size: 9.5pt; font-weight: 700; color: #1a1a1a; }

/* Two-up layout for house-cusps table + D9 chart (Page 2). */
.grid-2 { display: flex; gap: 6mm; align-items: flex-start; }
.grid-2 > div { flex: 1; min-width: 0; }
.grid-2 > table { flex: 1; min-width: 0; align-self: flex-start; }

/* Sarvashtakavarga bindu grid (Page 2). */
.av-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; max-width: 150mm; margin: 0 auto 0.2cm; }
.av-cell { border: 0.5pt solid #bbb; border-radius: 3px; text-align: center; padding: 3px 0; }
.av-cell.av-strong { background: #ecfdf5; border-color: #059669; }
.av-h { display: block; font-size: 7pt; color: #666; }
.av-b { display: block; font-size: 11pt; font-weight: 700; }

/* Dual-domain layout — two life domains packed onto ONE A4 sheet. */
.dual-domain-grid { display: flex; flex-direction: column; gap: 4mm; }
.domain-half { flex: 1; min-height: 0; }
.domain-title { font-size: 11.5pt; font-weight: 700; margin-bottom: 0.15cm; color: #333; }
.domain-title.en { font-family: 'Inter', sans-serif; }
.domain-badges { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; margin-bottom: 0.2cm; }
.domain-badges .tag { text-align: center; padding: 2pt 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.domain-narrative { font-size: 9pt; text-align: justify; line-height: 1.5; max-height: 65mm; overflow: hidden; margin-bottom: 0.2cm; }
.mini-table { width: 100%; border-collapse: collapse; }
.mini-table th, .mini-table td { border: 0.5pt solid #bbb; padding: 2mm 4px; text-align: left; font-size: 8.5pt; }
.mini-table th { background: #f0f0f0; }
.domain-divider { border-top: 0.6pt solid rgba(0, 0, 0, 0.1); margin: 4mm 0; }

/* ── New premium sections: dosha verdict card, remedy grid, dasha deep-dive,
   Sade Sati tracker and the 120-year master table ── */
.verdict-card { border: 1pt solid #cbd5e1; border-left: 3pt solid #3b82f6; border-radius: 3px; padding: 2mm 3mm; margin-bottom: 0.25cm; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.verdict-card .status-badge { font-size: 8pt; font-weight: 700; padding: 1pt 5px; border-radius: 3px; }
.status-ok { background: #dcfce7; color: #166534; }
.status-warn { background: #fef3c7; color: #92400e; }
.prescript-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 0.25cm; }
.prescript-card { border: 0.5pt solid #bbb; border-radius: 3px; padding: 3mm; }
.prescript-k { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
.prescript-v { font-size: 10.5pt; font-weight: 700; margin-top: 1pt; }
.dasha-focus-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 0.25cm; }
.dasha-focus { border: 1pt solid #d1d5db; border-radius: 3px; padding: 2mm 3mm; flex: 1 1 30%; min-width: 55mm; }
.dasha-focus.active { background: #eff6ff; border-color: #2563eb; }
.dasha-focus .k { font-size: 7.5pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
.dasha-focus .v { font-size: 11pt; font-weight: 700; margin-top: 0.05cm; }
.dasha-cycle { list-style: none; margin: 0; padding: 0; }
.dasha-cycle li { display: flex; justify-content: space-between; border-bottom: 0.4pt dashed #ddd; padding: 1.5mm 0; font-size: 8.5pt; }
.dasha-cycle li.active { font-weight: 700; color: #1d4ed8; }
.tracker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; align-items: stretch; }
.tracker-box { border: 0.5pt solid #bbb; border-radius: 3px; padding: 3mm; }
.tracker-box .tracker-title { font-size: 10.5pt; font-weight: 700; margin-bottom: 0.12cm; color: #333; }
.tracker-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
.tracker-table th, .tracker-table td { border: 0.4pt solid #ccc; padding: 1.5mm 2mm; text-align: left; }
.tracker-table th { background: #f0f0f0; }
`,f=(e,t,a,i)=>`<div class="page-container">
<div class="header">
  <h1 class="${"en"===t?"en":""}">${g(e)}</h1>
  <div class="meta">
    <span><span class="section-title">${u("clientName",t)}:</span> ${g(i.clientName)}</span>
    <span class="tag ${i.isPaidTier?"paid":"basic"}">${i.isPaidTier?u("paid",t):u("basic",t)}</span>
  </div>
</div>
<div class="page-content">
`,b=(e,t)=>`
</div>
<div class="footer">
  <span class="page-number">${u("page",t)} ${e}</span>
</div>
</div>`,v=e=>{let t=(e.houseCusps&&e.houseCusps.length?(0,i.nV)(e.houseCusps[0].sign):0)||1;return{planets:(e.planetaryPositions||[]).map(e=>({planet:e.body,sign:(0,i.nV)(e.sign)||1,house:parseInt(String(e.house),10)||1,retrograde:!!e.retro})),houses:(e.houseCusps||[]).map(e=>({house:e.house,sign:(0,i.nV)(e.sign)||1})),ascendantSign:t}},y=(e,t,a)=>{if("north"===a&&/^<svg/.test(e.northIndianChartSvg||""))return e.northIndianChartSvg;let{planets:i,houses:s,ascendantSign:r}=v(e);return p({style:a,language:t,ascendantSign:r,planets:i,houses:s,showTitle:!0})},x=(e,t,a,i)=>i?`<div class="tile"><div class="tile-k">${g("hi"===a?t:e)}</div><div class="tile-v">${g(i)}</div></div>`:"",k=(e,t,a)=>{let i=e.birthDetails,s=e.panchang,r=i?`<table class="table-0">
<tr><th>${u("clientName",t)}</th><td>${g(e.clientName)}</td><th>${u("chartType",t)}</th><td>${g(e.chartType)}</td></tr>
<tr><th>${u("birthDetails",t)}</th><td>${g(i.date)} \xb7 ${g(i.time)}</td><th>TZ</th><td>${g(i.timezone)}</td></tr>
<tr><th>${u("latLong",t)}</th><td colspan="3">${g(i.latitude)}${i.longitude?`, ${g(i.longitude)}`:""}</td></tr>
</table>`:"",n=s?`<div class="tile-grid">${[x("Vara (Weekday)","वार",t,s.varaWeekday),x("Nakshatra","नक्षत्र",t,s.nakshatra),x("Nakshatra Lord","नक्षत्र स्वामी",t,s.nakshatraLord),x("Moon Sign","चंद्र राशि",t,s.moonSign),x("Sun Sign","सूर्य राशि",t,s.sunSign),x("Lagna","लग्न",t,s.lagna)].join("")}</div>`:"";return`
${f(u("title",t),t,a,e)}
<div class="cover-band"><span class="client-name">${g(e.clientName)}</span><span class="tag ${e.isPaidTier?"paid":"basic"}">${e.isPaidTier?u("paid",t):u("basic",t)}</span></div>
${r}
${n?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("panchang",t)}</h2>
${n}
</div>`:""}
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("lagnaD1Chart",t)}</h2>
<div class="chart-container chart-sm">${y(e,t,"north")}</div>
</div>
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("planetaryPositions",t)}</h2>
<table class="table-0">
<tr><th>${u("bodyCol",t)}</th><th>${u("signCol",t)}</th><th>${u("degreeCol",t)}</th><th>${u("houseCol",t)}</th><th>${u("retroCol",t)}</th></tr>
${e.planetaryPositions.map(e=>`<tr><td>${g(e.body)}</td><td>${g(e.sign)}</td><td>${g(e.degree)}</td><td>${g(e.house)}</td><td>${e.retro?"✓":"-"}</td></tr>`).join("")}
</table>
</div>
${b(a,t)}
`},w=(e,t,a)=>{let i=e.sarvashtakavarga?.bindus?.length?e.sarvashtakavarga:null,s=e.d9Chart?p({style:"north",language:t,ascendantSign:e.d9Chart.ascendantSign||1,planets:e.d9Chart.planets,showTitle:!1}):"",r=i?i.bindus.map((e,t)=>`<div class="av-cell${i.beneficialHouses?.includes(t+1)?" av-strong":""}"><span class="av-h">H${t+1}</span><span class="av-b">${Number(e)||0}</span></div>`).join(""):"",n=e.houseCusps.map(e=>`<tr><td>${g(String(e.house))}</td><td>${g(e.sign)}</td><td>${g(e.degree||"-")}</td></tr>`).join(""),o=Math.ceil(e.houseCusps.length/2)||6,l=e.houseCusps.length?`<div class="grid-2">
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${n.slice(0,o)}</table>
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${n.slice(o)}</table>
</div>`:`<p class="note">${"hi"===t?"भाव डेटा उपलब्ध नहीं।":"House data unavailable."}</p>`;return`
${f(u("housesNavamsaAshtakavarga",t),t,a,e)}
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("houseCusps",t)}</h2>
${l}
</div>
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("navamsaD9Chart",t)}</h2>
${s?`<div class="chart-container chart-sm">${s}</div>`:`<p class="note">${u("notAvailable",t)}</p>`}
</div>
${i?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("sarvashtakavarga",t)}</h2>
<div class="av-grid">${r}</div>
${i.beneficialHouses?.length?`<p class="note">${u("strongHouses",t)}: ${i.beneficialHouses.join(", ")}</p>`:""}
</div>`:""}
${b(a,t)}
`},S=(e,t,a)=>{let i=(e.dashaPeriods||[]).map(e=>`<tr><td>${g(e.mahaDasha)}</td><td>${g(e.startYear)}</td><td>${g(e.endYear)}</td><td>${g(e.subPeriod||"-")}</td></tr>`).join(""),s=(e.yogas||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.name)}</span> — <span class="p en">${g(e.description)}</span></div>`).join(""),r=(e.remedies||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.category)}</span><p class="p en">${g(e.description)}</p></div>`).join("");return i||s||r?`
${f(u("dashasYogasRemedies",t),t,a,e)}
${i?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("dashaPeriods",t)}</h2>
<table class="table-0">
<tr><th>${u("mahaDashaCol",t)}</th><th>${u("startCol",t)}</th><th>${u("endCol",t)}</th><th>${u("subPeriodCol",t)}</th></tr>
${i}
</table>
</div>`:""}
${s?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("yogas",t)}</h2>
${s}
</div>`:""}
${r?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("remedies",t)}</h2>
<div class="two-col">${r}</div>
</div>`:""}
${b(a,t)}
`:""},D={career:10,marriage:7,wealth:2,health:6,finance:11,education:4},C=(e,t)=>{let a=e.split(/\s+/).filter(Boolean);return a.length<=t?e:`${a.slice(0,t).join(" ")}…`},P=(e,t,a,s)=>{let r=new Date().getFullYear(),n=e.map(e=>{let s=e.domain.charAt(0).toUpperCase()+e.domain.slice(1),n=D[e.domain]??1,o=(0,i.nV)(t.houseCusps?.[n-1]?.sign||""),l=o&&i.sr[o]||"—",d=[`${"hi"===a?"भाव":"House"} ${n}`,`${"hi"===a?"स्वामी":"Lord"}: ${l}`,t.dashaPeriods?.[0]?`${t.dashaPeriods[0].startYear}–${t.dashaPeriods[0].endYear}`:e.timeframe||"—"],c=[e.prediction,e.analysis].filter(Boolean),h=c.length?g(C(c.join(" "),180)):"hi"===a?"विस्तृत विश्लेषण प्रीमियम रिपोर्ट में शामिल है।":`Detailed ${g(e.domain)} analysis is included in the premium report.`,p=(t.dashaPeriods||[]).filter(e=>{let t=parseInt(String(e.endYear),10);return Number.isNaN(t)||t>=r}).slice(0,2),m=p.length?p.map(e=>`<tr><td>${g(e.startYear)}–${g(e.endYear)}</td><td>${g([e.mahaDasha,e.subPeriod].filter(Boolean).join(" \xb7 ")||"-")}</td></tr>`).join(""):`<tr><td>—</td><td>${g(u("notAvailable",a))}</td></tr>`;return`<div class="domain-half">
<h2 class="domain-title ${"en"===a?"en":""}">${g(s)}</h2>
<div class="domain-badges">${d.map(e=>`<span class="tag paid">${g(e)}</span>`).join("")}</div>
<p class="domain-narrative ${"en"===a?"en":""}">${h}</p>
<table class="mini-table">
<tr><th>${u("period",a)}</th><th>${u("influence",a)}</th></tr>
${m}
</table>
</div>`}).join('<div class="domain-divider"></div>');return`
${f(u("lifeDomains",a),a,s,t)}
<div class="dual-domain-grid">
${n}
</div>
${b(s,a)}
`},N=[["Ketu",7],["Venus",20],["Sun",6],["Moon",10],["Mars",7],["Rahu",18],["Jupiter",16],["Saturn",19],["Mercury",17]],M={sun:"Sun",moon:"Moon",mars:"Mars",mercury:"Mercury",rahu:"Rahu",jupiter:"Jupiter",saturn:"Saturn",venus:"Venus",ketu:"Ketu",lagna:"Lagna",ascendant:"Lagna"},z=e=>M[e.trim().toLowerCase()]||e.trim(),T=(e,t)=>(e.planetaryPositions||[]).find(e=>z(e.body)===z(t)),j=e=>{let t=parseInt(String(e?.house??"0"),10);return Number.isNaN(t)?0:t},Y=(e,t)=>(e.dashaPeriods||[]).find(e=>{let a=parseInt(String(e.startYear),10),i=parseInt(String(e.endYear),10);return!Number.isNaN(a)&&!Number.isNaN(i)&&t>=a&&t<=i}),I=(e,t)=>z(Y(e,t)?.mahaDasha||""),R=(e,t)=>{let a=(e.dashaPeriods||[]).map(e=>({name:z(e.mahaDasha),years:N.find(([t])=>t===z(e.mahaDasha))?.[1]??0,from:parseInt(String(e.startYear),10),to:parseInt(String(e.endYear),10)}));if(a.length>=9&&a.every(e=>!Number.isNaN(e.from)&&!Number.isNaN(e.to)))return a;let i=parseInt(String(e.dashaPeriods?.[0]?.startYear),10)||t,s=0;return N.map(([e,t])=>{let a=i+s;return s+=t,{name:e,years:t,from:a,to:a+t-1}})},A=e=>e>=3?"severityHigh":2===e?"severityMedium":1===e?"severityMild":"severityNone",L=(e,t,a)=>{let i=(e.yogas||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.name)}</span><p class="p ${"en"===t?"en":""}">${g(e.description||"-")}</p></div>`).join("");if(!i)return"";let s=T(e,"Mars"),r=T(e,"Moon"),n=T(e,"Saturn"),o=s?[1,2,4,7,8,12].filter(e=>j(s)===e):[],l=o.length>0,d=s?`<div class="verdict-card"><span class="status-badge ${l?"status-warn":"status-ok"}">${u("manglik",t)}</span><span>${l?u("manglikYes",t):u("manglikNo",t)}</span><span>\xb7 ${u("doshaSeverity",t)}: ${u(A(o.length),t)}</span></div>`:"",c=(()=>{if(!r||!n)return -1;let e=j(r),t=j(n);return e===t?2:e===t%12+1?3:e===(t+10)%12+1?1:-1})(),h=r&&n?`<div class="verdict-card"><span class="status-badge ${c>=0?"status-warn":"status-ok"}">${u("sadeSati",t)}</span><span>${c>=0?u(`satiPhase${c}`,t):u("noSadeSati",t)}</span></div>`:"",p=d||h?`<div class="section-block"><h2 class="h2 ${"en"===t?"en":""}">${u("doshaSection",t)}</h2>${d}${h}</div>`:"";return`
${f(u("yogDoshTitle",t),t,a,e)}
<div class="section-block"><h2 class="h2 ${"en"===t?"en":""}">${u("yogas",t)}</h2><div class="two-col">${i}</div></div>
${p}
${b(a,t)}
`},H=(e,t,a)=>{let i=(e.remedies||[]).filter(e=>/gem|rudraksh|ratna|रत्न|रुद्राक्ष|ruby|pearl|sapphire|gemstone/i.test(`${e.category} ${e.description}`)).slice(0,6).map(e=>`<div class="prescript-card"><div class="prescript-k">${g(e.category||u("gemRudhSection",t))}</div>${e.description?`<div class="prescript-v">${g(e.description)}</div>`:""}</div>`).join("");return i?`
${f(u("gemRudhSection",t),t,a,e)}
<div class="prescript-grid">${i}</div>
${b(a,t)}
`:""},E=(e,t,a)=>{if(!(e.dashaPeriods||[]).length)return"";let i=new Date().getFullYear(),s=Y(e,i),r=R(e,i),n=I(e,i),o=r.map(e=>{let a=e.name.toLowerCase()===n.toLowerCase();return`<div class="dasha-focus${a?" active":""}"><div class="k">${g(e.name)}</div><div class="v">${e.from}–${e.to}</div>${a?` <span class="status-badge status-warn">${u("onDashaNow",t)}</span>`:""}</div>`}).join(""),l=s?.subPeriod?`<p class="p"><span class="section-title">${u("currAntardasha",t)}:</span> ${g(s.subPeriod)} \xb7 ${u("activeWindow",t)}: ${s.startYear}–${s.endYear}</p>`:"";return`
${f(u("currDashaTitle",t),t,a,e)}
<div class="dasha-focus-row">${o}</div>
${l}
<p class="note">${g(u("currentRemark",t))}</p>
<div class="divider"></div>
<h2 class="h2 ${"en"===t?"en":""}">${u("dashaCycle",t)}</h2>
<ul class="dasha-cycle">${r.map(e=>`<li${e.name.toLowerCase()===n.toLowerCase()?' class="active"':""}><span>${g(e.name)}</span><span>${e.from}–${e.to}</span></li>`).join("")}</ul>
${b(a,t)}
`},B=(e,t,a)=>{let i=T(e,"Mars"),s=T(e,"Moon"),r=T(e,"Saturn");if(!i&&!s)return"";let n=[1,2,4,7,8,12],o=i&&n.includes(j(i))?j(i):0,l=n.map(t=>{let a=(e.planetaryPositions||[]).filter(e=>j(e)===t),i=a.some(e=>z(e.body)===z("Mars"));return`<tr${i?' style="background:#fef3c7"':""}><td>${t}</td><td>${a.map(e=>g(e.body)).join(", ")||"—"}</td><td>${i?"●":"—"}</td></tr>`}).join(""),d=(()=>{if(!s||!r)return -1;let e=j(s),t=j(r);return e===t?1:e===t%12+1?2:e===(t+10)%12+1?0:-1})(),c=d>=0?["satiPhase1","satiPhase2","satiPhase3"][d]:void 0,h=d>=0&&c?`<tr style="background:#eff6ff"><td>${g(u(c,t))}</td><td>${u("activePhase",t)}</td></tr>`:"";return`
${f(u("manglikSadeTitle",t),t,a,e)}
<p class="p">${g(u("manglik",t))}: <strong>${o>0?`${u("manglikYes",t)} (भाव ${o})`:u("manglikNo",t)}</strong> \xb7 ${u("sadeSati",t)}: ${c?u(c,t):u("noSadeSati",t)}</p>
<div class="tracker-grid">
  <div class="tracker-box">
    <div class="tracker-title">${u("manglikTracker",t)}</div>
    <table class="tracker-table"><tr><th>${u("maleficKarm",t)}</th><th>${u("planet",t)}</th><th>●</th></tr>${l}</table>
  </div>
  <div class="tracker-box">
    <div class="tracker-title">${u("satiTracker",t)}</div>
    <table class="tracker-table"><tr><th>${u("sadeSati",t)}</th><th>${u("phaseStart",t)}</th></tr>${h}</table>
  </div>
</div>
${b(a,t)}
`},V=(e,t,a)=>{if(!(e.dashaPeriods||[]).length)return"";let i=new Date().getFullYear(),s=R(e,i),r=I(e,i),n=s.map((e,a)=>{let i=e.name.toLowerCase()===r.toLowerCase();return`<tr${i?' style="background:#eff6ff"':""}><td>${a+1}</td><td>${g(e.name)}</td><td>${e.years}</td><td>${e.from}</td><td>${e.to}</td>${i?`<td>${u("onDashaNow",t)}</td>`:""}</tr>`}).join("");return`
${f(u("dashaMasterTitle",t),t,a,e)}
<p class="note">${g(u("vimshottari",t))} \xb7 ${g(u("dashaMasterTitle",t))}</p>
<table class="table-0">
<tr><th>${u("seqNo",t)}</th><th>${u("mahaDashaCol",t)}</th><th>${u("mahaYears",t)}</th><th>${u("fromYear",t)}</th><th>${u("toYear",t)}</th><th></th></tr>
${n}
</table>
${b(a,t)}
`},O=(e,t,a)=>{let i=e.kalpurushaPhalDeepikaRefs||[],s=e.scorecard||[];return i.length||s.length?`
${f(u("references",t),t,a,e)}
${i.length?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("references",t)}</h2>
${i.map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.verse)}</span><p class="p en">${g(e.interpretation)}</p></div>`).join("")}
</div>`:""}
${s.length?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("scorecard",t)}</h2>
<table class="table-0">
<tr><th>${u("parameter",t)}</th><th>${u("score",t)}</th><th></th></tr>
${s.map(e=>`<tr><td>${g(e.parameter)}</td><td><span class="score-text">${e.score}/${e.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${Math.min(100,Math.max(0,e.score/e.maxScore*100))}%"></div></div></td></tr>`).join("")}
</table>
</div>`:""}
<p class="note">${g(u("generatedOn",t).replace("onDate",new Date().toLocaleDateString("hi"===t?"hi-IN":"en-US")))}</p>
${b(a,t)}
`:""},G={positive:"#059669",neutral:"#6b7280",caution:"#d97706"},K=(e,t,a,i)=>{let s="hi"===a?e.titleHi||e.titleEn:e.titleEn||e.titleHi,r="hi"===a?e.narrativeHi||e.narrativeEn:e.narrativeEn||e.narrativeHi,n=e.badges||{},o=[n.score,n.timeframe,n.lord].filter(Boolean);return`
${f(s,a,i,t)}
<p class="note">${g(u("appendix",a))}</p>
<h1 class="${"en"===a?"en":""}">${g(s)}</h1>
${o.length?`<p class="p"><span class="tag paid">${o.map(e=>g(e)).join('</span> <span class="tag paid">')}</span></p>`:""}
<h2 class="${"en"===a?"en":""}">${u("domainInsights",a)}</h2>
<p class="p${"en"===a?" en":""}" style="font-size:10pt;">${g(r)}</p>
${e.milestones&&e.milestones.length?`
<div class="divider"></div>
<h2 class="${"en"===a?"en":""}">${g(u("milestones",a))}</h2>
<table class="table-0">
<tr><th>${u("period",a)}</th><th>${u("event",a)}</th><th>${u("note",a)}</th></tr>
${e.milestones.map(e=>`<tr><td>${g(e.period)}</td><td>${g(e.event)}${e.outcome?` <span style="color:${G[e.outcome]||"#6b7280"};font-weight:700;">●</span>`:""}</td><td>${g(e.note||"-")}</td></tr>`).join("")}
</table>`:""}
<p class="note">${g(u("aiNote",a))}</p>
${b(i,a)}
`};function F(e,t){let a=0,i=[],s=e=>{e&&e.trim()&&i.push(e)};s(k(e,t,++a)),s(w(e,t,++a));let r=S(e,t,a+1);r&&(a+=1,i.push(r)),[["career","wealth"],["marriage","health"],["education","family"]].forEach(([i,r])=>{let n=e.domainInsights.find(e=>e.domain===i),o=e.domainInsights.find(e=>e.domain===r);((n?.prediction?.length??0)>20||(o?.prediction?.length??0)>20)&&s(P([n,o].filter(e=>!!e),e,t,++a))}),s(L(e,t,++a)),s(H(e,t,++a)),s(E(e,t,++a)),s(B(e,t,++a)),s(V(e,t,++a));let n=O(e,t,a+1);return n&&(a+=1,i.push(n)),(e.narratives||[]).forEach(s=>i.push(K(s,e,t,++a))),`
<!DOCTYPE html>
<html lang="${t}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${u("title",t)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
${$}
</style>
</head>
<body>
${i.join("")}
</body>
</html>
`.trim()}}};