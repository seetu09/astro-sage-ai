"use strict";exports.id=7021,exports.ids=[7021],exports.modules={70474:(e,t,a)=>{a.d(t,{i:()=>o});var i=a(68570);let r=(0,i.createProxy)(String.raw`/Users/seetu/astro-sage-ai-2/lib/i18n/translations.ts`),{__esModule:s,$$typeof:n}=r;r.default,(0,i.createProxy)(String.raw`/Users/seetu/astro-sage-ai-2/lib/i18n/translations.ts#translations`);let o=(0,i.createProxy)(String.raw`/Users/seetu/astro-sage-ai-2/lib/i18n/translations.ts#getTranslation`)},7021:(e,t,a)=>{a.d(t,{M:()=>X});var i=a(43493);function r(e){return((e-1)%12+12)%12+1}function s(e){return((e-1)%12+12)%12+1}function n(e){return e.replace(/\&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(e){return i.B4[((e-1)%12+12)%12]??"♈"}function l(e,t){let a=(0,i.zb)(e.planet,t)||e.planet.slice(0,2);return e.retrograde?"hi"===t?`${a}(व)`:`${a}\xae`:a}let d=[{house:1,poly:"100,100 200,0 300,100 200,200",cx:200,cy:100,px:200},{house:2,poly:"0,0 200,0 100,100",cx:100,cy:33.33,px:100},{house:3,poly:"0,0 100,100 0,200",cx:33.33,cy:100,px:49.33},{house:4,poly:"100,300 0,200 100,100 200,200",cx:100,cy:200,px:100},{house:5,poly:"0,200 100,300 0,400",cx:33.33,cy:300,px:49.33},{house:6,poly:"0,400 100,300 200,400",cx:100,cy:366.67,px:100},{house:7,poly:"300,300 200,400 100,300 200,200",cx:200,cy:300,px:200},{house:8,poly:"200,400 300,300 400,400",cx:300,cy:366.67,px:300},{house:9,poly:"400,400 400,200 300,300",cx:366.67,cy:300,px:350.67},{house:10,poly:"300,100 400,200 300,300 200,200",cx:300,cy:200,px:300},{house:11,poly:"400,200 300,100 400,0",cx:366.67,cy:100,px:350.67},{house:12,poly:"400,0 200,0 300,100",cx:300,cy:33.33,px:300}],c={1:[200,90],2:[100,50],3:[50,100],4:[90,200],5:[100,350],6:[50,300],7:[200,310],8:[300,350],9:[350,300],10:[310,200],11:[300,50],12:[350,100]},h={1:{row:0,col:0},2:{row:0,col:1},3:{row:0,col:2},4:{row:0,col:3},5:{row:1,col:3},6:{row:2,col:3},7:{row:3,col:3},8:{row:3,col:2},9:{row:3,col:1},10:{row:3,col:0},11:{row:2,col:0},12:{row:1,col:0}};function p(e){return"south"===e.style?function(e){let{language:t,ascendantSign:a=1,planets:r=[],showTitle:d=!1,title:c,stroke:p="#333333",background:m="#ffffff",textColor:g="#1a1a2e"}=e,u=s(a),$={};for(let e of r||[]){let t=s(e.sign);($[t]||=[]).push(e)}let f=Object.keys(h).map(Number).sort((e,t)=>e-t).map(e=>{let{row:a,col:r}=h[e],s=100*r+50,d=100*a+50,c=(e-u+12)%12+1,f=Math.min(($[e]||[]).length,4),b=($[e]||[]).slice(0,f).map((e,a)=>{let i=s+(a-(f-1)/2)*15;return`<text x="${i}" y="${d+15}" font-size="9" font-weight="600" fill="${g}" text-anchor="middle">${n(l(e,t))}</text>`}).join(""),y=`<text x="${s}" y="${d-6}" font-size="8" fill="${p}" text-anchor="middle">${n((0,i.yL)(e,t))}</text>`,v=`<text x="${s}" y="${d-16}" font-size="10" fill="${g}" text-anchor="middle">${o(e)}</text>`,x=`<text x="${s}" y="${0===a?100*a+12:3===a?100*a+100-8:d}" font-size="8" fill="${p}" text-anchor="middle">${c}</text>`;return`<g>
  <rect x="${100*r+1}" y="${100*a+1}" width="98" height="98" fill="${m}" stroke="${p}" stroke-width="1"/>
  ${v}${y}${b}${x}
</g>`}).join(""),b="hi"===t?"लग्न":"Lagna",y=`<g>
  <text x="200" y="192" font-size="9" fill="${p}" text-anchor="middle">${n(b)}</text>
  <text x="200" y="210" font-size="14" font-weight="700" fill="${g}" text-anchor="middle">${o(u)} ${n((0,i.yL)(u,t))}</text>
</g>`,v=d?`<text x="200" y="14" font-size="12" font-weight="600" fill="${g}" text-anchor="middle">${n(c||("hi"===t?"दक्षिण भारतीय चार्ट":"South Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${n(c||"Kundli chart")}">
<rect width="400" height="400" fill="${m}"/>
${v}
<g stroke="${p}" stroke-width="1" fill="none">
  <path d="M0,100 H400 M0,200 H400 M0,300 H400"/>
  <path d="M100,0 V400 M200,0 V400 M300,0 V400"/>
</g>
${f}
${y}
</svg>`}(e):function(e){let{language:t,ascendantSign:a=1,planets:h=[],houses:p,showTitle:m=!1,title:g,stroke:u="#8c1d1d",background:$="#ffffff",textColor:f="#2d3748"}=e,b=s(a),y=function(e,t){let a=s(e||1),i={};for(let e=1;e<=12;e++)i[e]=s(a+e-1);if(t&&t.length)for(let e of t)e&&e.house>=1&&e.house<=12&&e.sign>=1&&e.sign<=12&&(i[r(e.house)]=s(e.sign));return i}(b,p),v=function(e){let t={};for(let a of e||[]){let e=r(a.house||1);(t[e]||=[]).push(a)}return t}(h),x=d.map(e=>{let a=y[e.house],r=v[e.house]||[],[s,d]=c[e.house]??[e.cx,e.cy],h=`<text x="${e.cx}" y="${d-14}" font-size="10" fill="${u}" text-anchor="middle">${o(a)}</text>`,p=`<text x="${s}" y="${d}" font-size="11" fill="#2d3748" text-anchor="middle">${e.house}</text>`,m=r.slice(0,5),g=m.length,$=m.map((a,i)=>{let r=e.cy+(i-(g-1)/2)*12;return`<text x="${e.px}" y="${r}" font-size="9" font-weight="600" fill="${f}" text-anchor="middle">${n(l(a,t))}</text>`}).join(""),x=r.length>5?`<text x="${e.px}" y="${e.cy+12*g}" font-size="7" fill="${u}" text-anchor="middle">+${r.length-5}</text>`:"",w=1===e.house?`<text x="${e.cx}" y="${e.cy+34}" font-size="10" font-weight="700" fill="${f}" text-anchor="middle">${n((0,i.yL)(b,t))}</text>`:"";return`<g>${h}${p}${$}${x}${w}</g>`}).join(""),w=`<rect x="0" y="0" width="400" height="400" fill="none" stroke="${u}" stroke-width="2"/>
<line x1="0" y1="0" x2="400" y2="400" stroke="${u}" stroke-width="1.5"/>
<line x1="400" y1="0" x2="0" y2="400" stroke="${u}" stroke-width="1.5"/>
<polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="${u}" stroke-width="1.5"/>`,k=m?`<text x="200" y="14" font-size="12" font-weight="600" fill="${f}" text-anchor="middle">${n(g||("hi"===t?"उत्तर भारतीय चार्ट":"North Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${n(g||"Kundli chart")}">
<rect width="400" height="400" fill="${$}"/>
${k}
${w}
${x}
</svg>`}(e)}var m=a(70474);let g=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),u=(e,t)=>(0,m.i)(t,`pdf.template.${e}`),$=(e,t)=>(0,i.Kk)((0,i.H9)(e),t),f=(e,t)=>{let a=(0,i.nV)(e);return a?(0,i.yL)(a,t):(0,i.lO)(String(e),t)},b={career:"domainCareer",marriage:"domainMarriage",wealth:"domainWealth",health:"domainHealth",finance:"domainFinance",education:"domainEducation",family:"domainFamily"},y=`
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
.prescript-line { font-size: 8.5pt; margin-top: 1pt; }
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
`,v=(e,t,a,i)=>`<div class="page-container">
<div class="header">
  <h1 class="${"en"===t?"en":""}">${g(e)}</h1>
  <div class="meta">
    <span><span class="section-title">${u("clientName",t)}:</span> ${g(i.clientName)}</span>
    <span class="tag ${i.isPaidTier?"paid":"basic"}">${i.isPaidTier?u("paid",t):u("basic",t)}</span>
  </div>
</div>
<div class="page-content">
`,x=(e,t)=>`
</div>
<div class="footer">
  <span class="page-number">${u("page",t)} ${e}</span>
</div>
</div>`,w=e=>{let t=(e.houseCusps&&e.houseCusps.length?(0,i.nV)(e.houseCusps[0].sign):0)||1;return{planets:(e.planetaryPositions||[]).map(e=>({planet:e.body,sign:(0,i.nV)(e.sign)||1,house:parseInt(String(e.house),10)||1,retrograde:!!e.retro})),houses:(e.houseCusps||[]).map(e=>({house:e.house,sign:(0,i.nV)(e.sign)||1})),ascendantSign:t}},k=(e,t,a)=>{if("north"===a&&/^<svg/.test(e.northIndianChartSvg||""))return e.northIndianChartSvg;let{planets:i,houses:r,ascendantSign:s}=w(e);return p({style:a,language:t,ascendantSign:s,planets:i,houses:r,showTitle:!0})},S=(e,t,a)=>a?`<div class="tile"><div class="tile-k">${g(u(e,t))}</div><div class="tile-v">${g(a)}</div></div>`:"",C=(e,t,a)=>{let i=e.birthDetails,r=e.panchang,s=i?`<table class="table-0">
<tr><th>${u("clientName",t)}</th><td>${g(e.clientName)}</td><th>${u("chartType",t)}</th><td>${g(e.chartType)}</td></tr>
<tr><th>${u("birthDetails",t)}</th><td>${g(i.date)} \xb7 ${g(i.time)}</td><th>${u("tz",t)}</th><td>${g(i.timezone)}</td></tr>
<tr><th>${u("latLong",t)}</th><td colspan="3">${g(i.latitude)}${i.longitude?`, ${g(i.longitude)}`:""}</td></tr>
</table>`:"",n=r?`<div class="tile-grid">${[S("varaWeekday",t,r.varaWeekday),S("nakshatra",t,r.nakshatra),S("nakshatraLord",t,r.nakshatraLord?$(r.nakshatraLord,t):void 0),S("moonSign",t,r.moonSign?f(r.moonSign,t):void 0),S("sunSign",t,r.sunSign?f(r.sunSign,t):void 0),S("lagna",t,r.lagna?f(r.lagna,t):void 0)].join("")}</div>`:"",o=(e.planetaryPositions||[]).map(e=>`<tr><td>${g($(e.body,t))}</td><td>${g(f(e.sign,t))}</td><td>${g(e.degree)}</td><td>${g(e.house)}</td><td>${e.retro?"✓":"-"}</td></tr>`).join("");return`
${v(u("title",t),t,a,e)}
<div class="cover-band"><span class="client-name">${g(e.clientName)}</span><span class="tag ${e.isPaidTier?"paid":"basic"}">${e.isPaidTier?u("paid",t):u("basic",t)}</span></div>
${s}
${n?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("panchang",t)}</h2>
${n}
</div>`:""}
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("lagnaD1Chart",t)}</h2>
<div class="chart-container chart-sm">${k(e,t,"north")}</div>
</div>
${o?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("planetaryPositions",t)}</h2>
<table class="table-0">
<tr><th>${u("bodyCol",t)}</th><th>${u("signCol",t)}</th><th>${u("degreeCol",t)}</th><th>${u("houseCol",t)}</th><th>${u("retroCol",t)}</th></tr>
${o}
</table>
</div>`:""}
${x(a,t)}
`},N=(e,t,a)=>{let i=e.sarvashtakavarga?.bindus?.length?e.sarvashtakavarga:null,r=e.d9Chart?p({style:"north",language:t,ascendantSign:e.d9Chart.ascendantSign||1,planets:e.d9Chart.planets,showTitle:!1}):"",s=i?i.bindus.map((e,a)=>`<div class="av-cell${i.beneficialHouses?.includes(a+1)?" av-strong":""}"><span class="av-h">${g(u("houseShort",t))}${a+1}</span><span class="av-b">${Number(e)||0}</span></div>`).join(""):"",n=(e.houseCusps||[]).map(e=>`<tr><td>${g(String(e.house))}</td><td>${g(f(e.sign,t))}</td><td>${g(e.degree||"-")}</td></tr>`).join(""),o=Math.ceil((e.houseCusps||[]).length/2)||6,l=e.houseCusps?.length?`<div class="grid-2">
<table class="table-0"><tr><th>${u("houseCol",t)}</th><th>${u("signCol",t)}</th><th>${u("degreeCol",t)}</th></tr>${n.slice(0,o)}</table>
<table class="table-0"><tr><th>${u("houseCol",t)}</th><th>${u("signCol",t)}</th><th>${u("degreeCol",t)}</th></tr>${n.slice(o)}</table>
</div>`:`<p class="note">${u("houseDataUnavailable",t)}</p>`;return`
${v(u("housesNavamsaAshtakavarga",t),t,a,e)}
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("houseCusps",t)}</h2>
${l}
</div>
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("navamsaD9Chart",t)}</h2>
${r?`<div class="chart-container chart-sm">${r}</div>`:`<p class="note">${u("notAvailable",t)}</p>`}
</div>
${i?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("sarvashtakavarga",t)}</h2>
<div class="av-grid">${s}</div>
${i.beneficialHouses?.length?`<p class="note">${u("strongHouses",t)}: ${i.beneficialHouses.join(", ")}</p>`:""}
</div>`:""}
${x(a,t)}
`},z=(e,t,a)=>{let i=(e.dashaPeriods||[]).map(e=>`<tr><td>${g($(e.mahaDasha,t))}</td><td>${g(e.startYear)}</td><td>${g(e.endYear)}</td><td>${g(e.subPeriod||"-")}</td></tr>`).join(""),r=(e.yogas||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.name)}</span> — <span class="p ${"en"===t?"en":""}">${g(e.description)}</span></div>`).join(""),s=(e.remedies||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.category)}</span><p class="p ${"en"===t?"en":""}">${g(e.description)}</p></div>`).join("");return i||r||s?`
${v(u("dashasYogasRemedies",t),t,a,e)}
${i?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("dashaPeriods",t)}</h2>
<table class="table-0">
<tr><th>${u("mahaDashaCol",t)}</th><th>${u("startCol",t)}</th><th>${u("endCol",t)}</th><th>${u("subPeriodCol",t)}</th></tr>
${i}
</table>
</div>`:""}
${r?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("yogas",t)}</h2>
${r}
</div>`:""}
${s?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("remedies",t)}</h2>
<div class="two-col">${s}</div>
</div>`:""}
${x(a,t)}
`:""},P={career:10,marriage:7,wealth:2,health:6,finance:11,education:4},j=(e,t)=>{let a=e.split(/\s+/).filter(Boolean);return a.length<=t?e:`${a.slice(0,t).join(" ")}…`},K=(e,t,a,r)=>{let s=new Date().getFullYear(),n=e.map(e=>{let r=u(b[e.domain]??"domainCareer",a),n=P[e.domain]??1,o=(0,i.nV)(t.houseCusps?.[n-1]?.sign||""),l=o&&i.sr[o]||"—",d=t.dashaPeriods?.[0]?`${t.dashaPeriods[0].startYear}–${t.dashaPeriods[0].endYear}`:e.timeframe||"—",c=[`${u("houseWord",a)} ${n}`,`${u("lordWord",a)}: ${$(l,a)}`,d],h=[e.prediction,e.analysis].filter(Boolean),p=h.length?g(j(h.join(" "),180)):g((0,m.i)(a,"pdf.template.detailedPremiumAnalysis",{domain:r.toLowerCase()})),f=(t.dashaPeriods||[]).filter(e=>{let t=parseInt(String(e.endYear),10);return Number.isNaN(t)||t>=s}).slice(0,2),y=f.length?f.map(e=>`<tr><td>${g(e.startYear)}–${g(e.endYear)}</td><td>${g([$(e.mahaDasha,a),e.subPeriod].filter(Boolean).join(" \xb7 ")||"-")}</td></tr>`).join(""):`<tr><td>—</td><td>${g(u("notAvailable",a))}</td></tr>`;return`<div class="domain-half">
<h2 class="domain-title ${"en"===a?"en":""}">${g(r)}</h2>
<div class="domain-badges">${c.map(e=>`<span class="tag paid">${g(e)}</span>`).join("")}</div>
<p class="domain-narrative ${"en"===a?"en":""}">${p}</p>
<table class="mini-table">
<tr><th>${u("period",a)}</th><th>${u("influence",a)}</th></tr>
${y}
</table>
</div>`}).join('<div class="domain-divider"></div>');return`
${v(u("lifeDomains",a),a,r,t)}
<div class="dual-domain-grid">
${n}
</div>
${x(r,a)}
`},M=[["Ketu",7],["Venus",20],["Sun",6],["Moon",10],["Mars",7],["Rahu",18],["Jupiter",16],["Saturn",19],["Mercury",17]],D={sun:"Sun",moon:"Moon",mars:"Mars",mercury:"Mercury",rahu:"Rahu",jupiter:"Jupiter",saturn:"Saturn",venus:"Venus",ketu:"Ketu",lagna:"Lagna",ascendant:"Lagna"},Y=e=>D[e.trim().toLowerCase()]||e.trim(),I=(e,t)=>(e.planetaryPositions||[]).find(e=>Y(e.body)===Y(t)),T=e=>{let t=parseInt(String(e?.house??"0"),10);return Number.isNaN(t)?0:t},L=(e,t)=>(e.dashaPeriods||[]).find(e=>{let a=parseInt(String(e.startYear),10),i=parseInt(String(e.endYear),10);return!Number.isNaN(a)&&!Number.isNaN(i)&&t>=a&&t<=i}),O=(e,t)=>Y(L(e,t)?.mahaDasha||""),R=(e,t)=>{let a=(e.dashaPeriods||[]).map(e=>({name:Y(e.mahaDasha),years:M.find(([t])=>t===Y(e.mahaDasha))?.[1]??0,from:parseInt(String(e.startYear),10),to:parseInt(String(e.endYear),10)}));if(a.length>=9&&a.every(e=>!Number.isNaN(e.from)&&!Number.isNaN(e.to)))return a;let i=parseInt(String(e.dashaPeriods?.[0]?.startYear),10)||t,r=0;return M.map(([e,t])=>{let a=i+r;return r+=t,{name:e,years:t,from:a,to:a+t-1}})},E=e=>e>=3?"severityHigh":2===e?"severityMedium":1===e?"severityMild":"severityNone",H=(e,t,a)=>{let i=(e.yogas||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.name)}</span><p class="p ${"en"===t?"en":""}">${g(e.description||"-")}</p></div>`).join("");if(!i)return"";let r=I(e,"Mars"),s=I(e,"Moon"),n=I(e,"Saturn"),o=r?[1,2,4,7,8,12].filter(e=>T(r)===e):[],l=o.length>0,d=r?`<div class="verdict-card"><span class="status-badge ${l?"status-warn":"status-ok"}">${u("manglik",t)}</span><span>${l?u("manglikYes",t):u("manglikNo",t)}</span><span>\xb7 ${u("doshaSeverity",t)}: ${u(E(o.length),t)}</span></div>`:"",c=(()=>{if(!s||!n)return -1;let e=T(s),t=T(n);return e===t?2:e===t%12+1?3:e===(t+10)%12+1?1:-1})(),h=s&&n?`<div class="verdict-card"><span class="status-badge ${c>=0?"status-warn":"status-ok"}">${u("sadeSati",t)}</span><span>${c>=0?u(`satiPhase${c}`,t):u("noSadeSati",t)}</span></div>`:"",p=d||h?`<div class="section-block"><h2 class="h2 ${"en"===t?"en":""}">${u("doshaSection",t)}</h2>${d}${h}</div>`:"";return`
${v(u("yogDoshTitle",t),t,a,e)}
<div class="section-block"><h2 class="h2 ${"en"===t?"en":""}">${u("yogas",t)}</h2><div class="two-col">${i}</div></div>
${p}
${x(a,t)}
`},V={Sun:{gemKey:"gemRuby",mukhi:1,dayKey:"daySunday",mantra:"Om Suryaya Namaha",goalKey:"goalConfidence"},Moon:{gemKey:"gemPearl",mukhi:2,dayKey:"dayMonday",mantra:"Om Somaya Namaha",goalKey:"goalEmotional"},Mars:{gemKey:"gemRedCoral",mukhi:3,dayKey:"dayTuesday",mantra:"Om Mangalaya Namaha",goalKey:"goalStrength"},Mercury:{gemKey:"gemEmerald",mukhi:4,dayKey:"dayWednesday",mantra:"Om Budhaya Namaha",goalKey:"goalIntellect"},Jupiter:{gemKey:"gemYellowSapphire",mukhi:5,dayKey:"dayThursday",mantra:"Om Guru Devaya Namaha",goalKey:"goalFortune"},Venus:{gemKey:"gemDiamond",mukhi:6,dayKey:"dayFriday",mantra:"Om Shukraya Namaha",goalKey:"goalRelationships"},Saturn:{gemKey:"gemBlueSapphire",mukhi:7,dayKey:"daySaturday",mantra:"Om Shanaischaraya Namaha",goalKey:"goalDiscipline"},Rahu:{gemKey:"gemHessonite",mukhi:10,dayKey:"daySaturday",mantra:"Om Rahave Namaha",goalKey:"goalAmbition"},Ketu:{gemKey:"gemCatsEye",mukhi:9,dayKey:"dayTuesday",mantra:"Om Ketave Namaha",goalKey:"goalSpiritual"}},A={Sun:["sun","surya","sury"],Moon:["moon","chandra","chand"],Mars:["mars","mangal","manglik"],Mercury:["mercury","budha","budh"],Jupiter:["jupiter","guru","brihaspati"],Venus:["venus","shukra"],Saturn:["saturn","shani"],Rahu:["rahu"],Ketu:["ketu"]},B=e=>{let t=e.toLowerCase();for(let[e,a]of Object.entries(A))if(a.some(e=>t.includes(e)))return{planet:e,prescript:V[e]};return null},W=(e,t)=>`<div class="prescript-line"><strong>${g(u(e.gemKey,t))}</strong> \xb7 ${g((0,m.i)(t,"pdf.template.mukhi",{count:e.mukhi}))} \xb7 ${g(u(e.dayKey,t))}</div><div class="prescript-line">${g(e.mantra)}</div><div class="prescript-line">${g(u(e.goalKey,t))}</div>`,F=(e,t,a)=>{let i=(e.remedies||[]).filter(e=>/gem|rudraksh|ratna|रत्न|रुद्राक्ष|ruby|pearl|sapphire|gemstone/i.test(`${e.category} ${e.description}`)).slice(0,6).map(e=>{let a=B(`${e.category} ${e.description}`);return`<div class="prescript-card"><div class="prescript-k">${g(e.category||u("gemRudhSection",t))}</div>${e.description?`<div class="prescript-v">${g(e.description)}</div>`:""}${a?W(a.prescript,t):""}</div>`}).join("");return i?`
${v(u("gemRudhSection",t),t,a,e)}
<div class="prescript-grid">${i}</div>
${x(a,t)}
`:""},U=(e,t,a)=>{if(!(e.dashaPeriods||[]).length)return"";let i=new Date().getFullYear(),r=L(e,i),s=R(e,i),n=O(e,i),o=s.map(e=>{let a=e.name.toLowerCase()===n.toLowerCase();return`<div class="dasha-focus${a?" active":""}"><div class="k">${g($(e.name,t))}</div><div class="v">${e.from}–${e.to}</div>${a?` <span class="status-badge status-warn">${u("onDashaNow",t)}</span>`:""}</div>`}).join(""),l=r?.subPeriod?`<p class="p"><span class="section-title">${u("currAntardasha",t)}:</span> ${g(r.subPeriod)} \xb7 ${u("activeWindow",t)}: ${r.startYear}–${r.endYear}</p>`:"";return`
${v(u("currDashaTitle",t),t,a,e)}
<div class="dasha-focus-row">${o}</div>
${l}
<p class="note">${g(u("currentRemark",t))}</p>
<div class="divider"></div>
<h2 class="h2 ${"en"===t?"en":""}">${u("dashaCycle",t)}</h2>
<ul class="dasha-cycle">${s.map(e=>`<li${e.name.toLowerCase()===n.toLowerCase()?' class="active"':""}><span>${g($(e.name,t))}</span><span>${e.from}–${e.to}</span></li>`).join("")}</ul>
${x(a,t)}
`},J=(e,t,a)=>{let i=I(e,"Mars"),r=I(e,"Moon"),s=I(e,"Saturn");if(!i&&!r)return"";let n=[1,2,4,7,8,12],o=i&&n.includes(T(i))?T(i):0,l=n.map(a=>{let i=(e.planetaryPositions||[]).filter(e=>T(e)===a),r=i.some(e=>Y(e.body)===Y("Mars"));return`<tr${r?' style="background:#fef3c7"':""}><td>${a}</td><td>${i.map(e=>g($(e.body,t))).join(", ")||"—"}</td><td>${r?"●":"—"}</td></tr>`}).join(""),d=(()=>{if(!r||!s)return -1;let e=T(r),t=T(s);return e===t?1:e===t%12+1?2:e===(t+10)%12+1?0:-1})(),c=d>=0?["satiPhase1","satiPhase2","satiPhase3"][d]:void 0,h=d>=0&&c?`<tr style="background:#eff6ff"><td>${g(u(c,t))}</td><td>${u("activePhase",t)}</td></tr>`:"";return`
${v(u("manglikSadeTitle",t),t,a,e)}
<p class="p">${g(u("manglik",t))}: <strong>${o>0?`${u("manglikYes",t)} (${u("houseWord",t)} ${o})`:u("manglikNo",t)}</strong> \xb7 ${u("sadeSati",t)}: ${c?u(c,t):u("noSadeSati",t)}</p>
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
${x(a,t)}
`},q=(e,t,a)=>{if(!(e.dashaPeriods||[]).length)return"";let i=new Date().getFullYear(),r=R(e,i),s=O(e,i),n=r.map((e,a)=>{let i=e.name.toLowerCase()===s.toLowerCase();return`<tr${i?' style="background:#eff6ff"':""}><td>${a+1}</td><td>${g($(e.name,t))}</td><td>${e.years}</td><td>${e.from}</td><td>${e.to}</td>${i?`<td>${u("onDashaNow",t)}</td>`:""}</tr>`}).join("");return`
${v(u("dashaMasterTitle",t),t,a,e)}
<p class="note">${g(u("vimshottari",t))} \xb7 ${g(u("dashaMasterTitle",t))}</p>
<table class="table-0">
<tr><th>${u("seqNo",t)}</th><th>${u("mahaDashaCol",t)}</th><th>${u("mahaYears",t)}</th><th>${u("fromYear",t)}</th><th>${u("toYear",t)}</th><th></th></tr>
${n}
</table>
${x(a,t)}
`},G=(e,t,a)=>{let i=e.kalpurushaPhalDeepikaRefs||[],r=e.scorecard||[];if(!i.length&&!r.length)return"";let s=i.map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${g(e.verse)}</span><p class="p ${"en"===t?"en":""}">${g(e.interpretation)}</p></div>`).join(""),n=r.map(e=>`<tr><td>${g(e.parameter)}</td><td><span class="score-text">${e.score}/${e.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${Math.min(100,Math.max(0,e.score/e.maxScore*100))}%"></div></div></td></tr>`).join("");return`
${v(u("references",t),t,a,e)}
${s?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("references",t)}</h2>
${s}
</div>`:""}
${n?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${u("scorecard",t)}</h2>
<table class="table-0">
<tr><th>${u("parameter",t)}</th><th>${u("score",t)}</th><th></th></tr>
${n}
</table>
</div>`:""}
<p class="note">${g((0,m.i)(t,"pdf.template.generatedOn",{date:new Date().toLocaleDateString("hi"===t?"hi-IN":"en-US")}))}</p>
${x(a,t)}
`},_={positive:"#059669",neutral:"#6b7280",caution:"#d97706"},Q=(e,t,a,i)=>{let r="hi"===a?e.titleHi||e.titleEn:e.titleEn||e.titleHi,s="hi"===a?e.narrativeHi||e.narrativeEn:e.narrativeEn||e.narrativeHi,n=e.badges||{},o=[n.score,n.timeframe,n.lord].filter(Boolean),l=o.length?`<p class="p"><span class="tag paid">${o.map(e=>g(e)).join('</span> <span class="tag paid">')}</span></p>`:"",d=(e.milestones||[]).map(e=>{let t=e.outcome?` <span style="color:${_[e.outcome]||"#6b7280"};font-weight:700;">●</span>`:"";return`<tr><td>${g(e.period)}</td><td>${g(e.event)}${t}</td><td>${g(e.note||"-")}</td></tr>`}).join(""),c=e.milestones?.length?`
<div class="divider"></div>
<h2 class="${"en"===a?"en":""}">${g(u("milestones",a))}</h2>
<table class="table-0">
<tr><th>${u("period",a)}</th><th>${u("event",a)}</th><th>${u("note",a)}</th></tr>
${d}
</table>`:"";return`
${v(r,a,i,t)}
<p class="note">${g(u("appendix",a))}</p>
<h1 class="${"en"===a?"en":""}">${g(r)}</h1>
${l}
<h2 class="${"en"===a?"en":""}">${u("domainInsights",a)}</h2>
<p class="p${"en"===a?" en":""}" style="font-size:10pt;">${g(s)}</p>
${c}
<p class="note">${g(u("aiNote",a))}</p>
${x(i,a)}
`};function X(e,t){let a=0,i=[],r=e=>{e&&e.trim()&&i.push(e)};r(C(e,t,++a)),r(N(e,t,++a));let s=z(e,t,a+1);s&&(a+=1,i.push(s)),[["career","wealth"],["marriage","health"],["education","family"]].forEach(([i,s])=>{let n=e.domainInsights.find(e=>e.domain===i),o=e.domainInsights.find(e=>e.domain===s);((n?.prediction?.length??0)>20||(o?.prediction?.length??0)>20)&&r(K([n,o].filter(e=>!!e),e,t,++a))}),r(H(e,t,++a)),r(F(e,t,++a)),r(U(e,t,++a)),r(J(e,t,++a)),r(q(e,t,++a));let n=G(e,t,a+1);return n&&(a+=1,i.push(n)),(e.narratives||[]).forEach(r=>i.push(Q(r,e,t,++a))),`
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
${y}
</style>
</head>
<body>
${i.join("")}
</body>
</html>
`.trim()}},68570:(e,t,a)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"createProxy",{enumerable:!0,get:function(){return i}});let i=a(51749).createClientModuleProxy},51749:(e,t,a)=>{e.exports=a(23191).vendored["react-rsc"].ReactServerDOMWebpackServerEdge}};