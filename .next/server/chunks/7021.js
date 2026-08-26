"use strict";exports.id=7021,exports.ids=[7021],exports.modules={7021:(t,e,a)=>{a.d(e,{M:()=>H});var i=a(43493);function n(t){return((t-1)%12+12)%12+1}function s(t){return((t-1)%12+12)%12+1}function o(t){return t.replace(/\&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function r(t){return i.B4[((t-1)%12+12)%12]??"♈"}function l(t,e){let a=(0,i.zb)(t.planet,e)||t.planet.slice(0,2);return t.retrograde?"hi"===e?`${a}(व)`:`${a}\xae`:a}let d=[{house:1,poly:"100,100 200,0 300,100 200,200",cx:200,cy:100,px:200},{house:2,poly:"0,0 200,0 100,100",cx:100,cy:33.33,px:100},{house:3,poly:"0,0 100,100 0,200",cx:33.33,cy:100,px:49.33},{house:4,poly:"100,300 0,200 100,100 200,200",cx:100,cy:200,px:100},{house:5,poly:"0,200 100,300 0,400",cx:33.33,cy:300,px:49.33},{house:6,poly:"0,400 100,300 200,400",cx:100,cy:366.67,px:100},{house:7,poly:"300,300 200,400 100,300 200,200",cx:200,cy:300,px:200},{house:8,poly:"200,400 300,300 400,400",cx:300,cy:366.67,px:300},{house:9,poly:"400,400 400,200 300,300",cx:366.67,cy:300,px:350.67},{house:10,poly:"300,100 400,200 300,300 200,200",cx:300,cy:200,px:300},{house:11,poly:"400,200 300,100 400,0",cx:366.67,cy:100,px:350.67},{house:12,poly:"400,0 200,0 300,100",cx:300,cy:33.33,px:300}],h={1:[200,90],2:[100,50],3:[50,100],4:[90,200],5:[100,350],6:[50,300],7:[200,310],8:[300,350],9:[350,300],10:[310,200],11:[300,50],12:[350,100]},c={1:{row:0,col:0},2:{row:0,col:1},3:{row:0,col:2},4:{row:0,col:3},5:{row:1,col:3},6:{row:2,col:3},7:{row:3,col:3},8:{row:3,col:2},9:{row:3,col:1},10:{row:3,col:0},11:{row:2,col:0},12:{row:1,col:0}};function p(t){return"south"===t.style?function(t){let{language:e,ascendantSign:a=1,planets:n=[],showTitle:d=!1,title:h,stroke:p="#333333",background:g="#ffffff",textColor:m="#1a1a2e"}=t,$=s(a),f={};for(let t of n||[]){let e=s(t.sign);(f[e]||=[]).push(t)}let u=Object.keys(c).map(Number).sort((t,e)=>t-e).map(t=>{let{row:a,col:n}=c[t],s=100*n+50,d=100*a+50,h=(t-$+12)%12+1,u=Math.min((f[t]||[]).length,4),b=(f[t]||[]).slice(0,u).map((t,a)=>{let i=s+(a-(u-1)/2)*15;return`<text x="${i}" y="${d+15}" font-size="9" font-weight="600" fill="${m}" text-anchor="middle">${o(l(t,e))}</text>`}).join(""),v=`<text x="${s}" y="${d-6}" font-size="8" fill="${p}" text-anchor="middle">${o((0,i.yL)(t,e))}</text>`,x=`<text x="${s}" y="${d-16}" font-size="10" fill="${m}" text-anchor="middle">${r(t)}</text>`,y=`<text x="${s}" y="${0===a?100*a+12:3===a?100*a+100-8:d}" font-size="8" fill="${p}" text-anchor="middle">${h}</text>`;return`<g>
  <rect x="${100*n+1}" y="${100*a+1}" width="98" height="98" fill="${g}" stroke="${p}" stroke-width="1"/>
  ${x}${v}${b}${y}
</g>`}).join(""),b="hi"===e?"लग्न":"Lagna",v=`<g>
  <text x="200" y="192" font-size="9" fill="${p}" text-anchor="middle">${o(b)}</text>
  <text x="200" y="210" font-size="14" font-weight="700" fill="${m}" text-anchor="middle">${r($)} ${o((0,i.yL)($,e))}</text>
</g>`,x=d?`<text x="200" y="14" font-size="12" font-weight="600" fill="${m}" text-anchor="middle">${o(h||("hi"===e?"दक्षिण भारतीय चार्ट":"South Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${o(h||"Kundli chart")}">
<rect width="400" height="400" fill="${g}"/>
${x}
<g stroke="${p}" stroke-width="1" fill="none">
  <path d="M0,100 H400 M0,200 H400 M0,300 H400"/>
  <path d="M100,0 V400 M200,0 V400 M300,0 V400"/>
</g>
${u}
${v}
</svg>`}(t):function(t){let{language:e,ascendantSign:a=1,planets:c=[],houses:p,showTitle:g=!1,title:m,stroke:$="#8c1d1d",background:f="#ffffff",textColor:u="#2d3748"}=t,b=s(a),v=function(t,e){let a=s(t||1),i={};for(let t=1;t<=12;t++)i[t]=s(a+t-1);if(e&&e.length)for(let t of e)t&&t.house>=1&&t.house<=12&&t.sign>=1&&t.sign<=12&&(i[n(t.house)]=s(t.sign));return i}(b,p),x=function(t){let e={};for(let a of t||[]){let t=n(a.house||1);(e[t]||=[]).push(a)}return e}(c),y=d.map(t=>{let a=v[t.house],n=x[t.house]||[],[s,d]=h[t.house]??[t.cx,t.cy],c=`<text x="${t.cx}" y="${d-14}" font-size="10" fill="${$}" text-anchor="middle">${r(a)}</text>`,p=`<text x="${s}" y="${d}" font-size="11" fill="#2d3748" text-anchor="middle">${t.house}</text>`,g=n.slice(0,5),m=g.length,f=g.map((a,i)=>{let n=t.cy+(i-(m-1)/2)*12;return`<text x="${t.px}" y="${n}" font-size="9" font-weight="600" fill="${u}" text-anchor="middle">${o(l(a,e))}</text>`}).join(""),y=n.length>5?`<text x="${t.px}" y="${t.cy+12*m}" font-size="7" fill="${$}" text-anchor="middle">+${n.length-5}</text>`:"",w=1===t.house?`<text x="${t.cx}" y="${t.cy+34}" font-size="10" font-weight="700" fill="${u}" text-anchor="middle">${o((0,i.yL)(b,e))}</text>`:"";return`<g>${c}${p}${f}${y}${w}</g>`}).join(""),w=`<rect x="0" y="0" width="400" height="400" fill="none" stroke="${$}" stroke-width="2"/>
<line x1="0" y1="0" x2="400" y2="400" stroke="${$}" stroke-width="1.5"/>
<line x1="400" y1="0" x2="0" y2="400" stroke="${$}" stroke-width="1.5"/>
<polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="${$}" stroke-width="1.5"/>`,k=g?`<text x="200" y="14" font-size="12" font-weight="600" fill="${u}" text-anchor="middle">${o(m||("hi"===e?"उत्तर भारतीय चार्ट":"North Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${o(m||"Kundli chart")}">
<rect width="400" height="400" fill="${f}"/>
${k}
${w}
${y}
</svg>`}(t)}let g={hi:{title:"जन्म कुंडली विशद़ विश्लेषण",clientName:"क्लाइंट नाम",chartType:"चार्ट प्रकार",birthDetails:"जन्म विवरण",planetaryPositions:"ग्रह स्थिति",houseCusps:"घर कस्स",dashaPeriods:"दशा अवधि",yogas:"योग",remedies:"उपाय",domainInsights:"डोमेन अंतर्दृष्टि",scorecard:"स्कोरकार्ड",page:"पृष्ठ",northIndian:"उत्तर भारतीय",southIndian:"दक्षिण भारतीय",paid:"प्रीमियम रिपोर्ट",basic:"मूलभूत रिपोर्ट"},en:{title:"Birth Chart Detailed Analysis",clientName:"Client Name",chartType:"Chart Type",birthDetails:"Birth Details",planetaryPositions:"Planetary Positions",houseCusps:"House Cusps",dashaPeriods:"Dasha Periods",yogas:"Yogas",remedies:"Remedies",domainInsights:"Domain Insights",scorecard:"Scorecard",page:"Page",northIndian:"North Indian",southIndian:"South Indian",paid:"Premium Report",basic:"Basic Report"}},m=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),$=(t,e)=>g[e][t],f=`
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
`,u=(t,e,a,i)=>`<div class="page-container">
<div class="header">
  <h1 class="${"en"===e?"en":""}">${m(t)}</h1>
  <div class="meta">
    <span><span class="section-title">${$("clientName",e)}:</span> ${m(i.clientName)}</span>
    <span class="tag ${i.isPaidTier?"paid":"basic"}">${i.isPaidTier?$("paid",e):$("basic",e)}</span>
  </div>
</div>
<div class="page-content">
`,b=(t,e)=>`
</div>
<div class="footer">
  <span class="page-number">${$("page",e)} ${t}</span>
</div>
</div>`,v=t=>{let e=(t.houseCusps&&t.houseCusps.length?(0,i.nV)(t.houseCusps[0].sign):0)||1;return{planets:(t.planetaryPositions||[]).map(t=>({planet:t.body,sign:(0,i.nV)(t.sign)||1,house:parseInt(String(t.house),10)||1,retrograde:!!t.retro})),houses:(t.houseCusps||[]).map(t=>({house:t.house,sign:(0,i.nV)(t.sign)||1})),ascendantSign:e}},x=(t,e,a)=>{if("north"===a&&/^<svg/.test(t.northIndianChartSvg||""))return t.northIndianChartSvg;let{planets:i,houses:n,ascendantSign:s}=v(t);return p({style:a,language:e,ascendantSign:s,planets:i,houses:n,showTitle:!0})},y=(t,e,a,i)=>i?`<div class="tile"><div class="tile-k">${m("hi"===a?e:t)}</div><div class="tile-v">${m(i)}</div></div>`:"",w=(t,e,a)=>{let i=t.birthDetails,n=t.panchang,s=i?`<table class="table-0">
<tr><th>${$("clientName",e)}</th><td>${m(t.clientName)}</td><th>${$("chartType",e)}</th><td>${m(t.chartType)}</td></tr>
<tr><th>${$("birthDetails",e)}</th><td>${m(i.date)} \xb7 ${m(i.time)}</td><th>TZ</th><td>${m(i.timezone)}</td></tr>
<tr><th>Lat / Long</th><td colspan="3">${m(i.latitude)}${i.longitude?`, ${m(i.longitude)}`:""}</td></tr>
</table>`:"",o=n?`<div class="tile-grid">${[y("Vara (Weekday)","वार",e,n.varaWeekday),y("Nakshatra","नक्षत्र",e,n.nakshatra),y("Nakshatra Lord","नक्षत्र स्वामी",e,n.nakshatraLord),y("Moon Sign","चंद्र राशि",e,n.moonSign),y("Sun Sign","सूर्य राशि",e,n.sunSign),y("Lagna","लग्न",e,n.lagna)].join("")}</div>`:"";return`
${u($("title",e),e,a,t)}
<div class="cover-band"><span class="client-name">${m(t.clientName)}</span><span class="tag ${t.isPaidTier?"paid":"basic"}">${t.isPaidTier?$("paid",e):$("basic",e)}</span></div>
${s}
${o?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${"hi"===e?"जन्म पंचांग":"Panchang at Birth"}</h2>
${o}
</div>`:""}
<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${"hi"===e?"लग्न कुंडली (D1)":"Lagna (D1) Chart"}</h2>
<div class="chart-container chart-sm">${x(t,e,"north")}</div>
</div>
<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${$("planetaryPositions",e)}</h2>
<table class="table-0">
<tr><th>ग्रह/Body</th><th>राशि/Sign</th><th>डिग्री/Degree</th><th>घर/House</th><th>रीत्रो/Retro</th></tr>
${t.planetaryPositions.map(t=>`<tr><td>${m(t.body)}</td><td>${m(t.sign)}</td><td>${m(t.degree)}</td><td>${m(t.house)}</td><td>${t.retro?"✓":"-"}</td></tr>`).join("")}
</table>
</div>
${b(a,e)}
`},k=(t,e,a)=>{let i=t.sarvashtakavarga?.bindus?.length?t.sarvashtakavarga:null,n=t.d9Chart?p({style:"north",language:e,ascendantSign:t.d9Chart.ascendantSign||1,planets:t.d9Chart.planets,showTitle:!1}):"",s=i?i.bindus.map((t,e)=>`<div class="av-cell${i.beneficialHouses?.includes(e+1)?" av-strong":""}"><span class="av-h">H${e+1}</span><span class="av-b">${Number(t)||0}</span></div>`).join(""):"",o=t.houseCusps.map(t=>`<tr><td>${m(String(t.house))}</td><td>${m(t.sign)}</td><td>${m(t.degree||"-")}</td></tr>`).join(""),r=Math.ceil(t.houseCusps.length/2)||6,l=t.houseCusps.length?`<div class="grid-2">
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${o.slice(0,r)}</table>
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${o.slice(r)}</table>
</div>`:`<p class="note">${"hi"===e?"भाव डेटा उपलब्ध नहीं।":"House data unavailable."}</p>`;return`
${u("hi"===e?"भाव, नवांश एवं अष्टकवर्ग":"Houses, Navamsa & Ashtakavarga",e,a,t)}
<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${$("houseCusps",e)}</h2>
${l}
</div>
<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${"hi"===e?"नवांश (D9) चार्ट":"Navamsa (D9) Chart"}</h2>
${n?`<div class="chart-container chart-sm">${n}</div>`:`<p class="note">${"hi"===e?"नवांश डेटा उपलब्ध नहीं।":"Navamsa data unavailable."}</p>`}
</div>
${i?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${"hi"===e?"सर्वाष्टकवर्ग बिंदु":"Sarvashtakavarga Bindus"}</h2>
<div class="av-grid">${s}</div>
${i.beneficialHouses?.length?`<p class="note">${"hi"===e?"प्रबल भाव: ":"Strong houses: "}${i.beneficialHouses.join(", ")}</p>`:""}
</div>`:""}
${b(a,e)}
`},z=(t,e,a)=>{let i=(t.dashaPeriods||[]).map(t=>`<tr><td>${m(t.mahaDasha)}</td><td>${m(t.startYear)}</td><td>${m(t.endYear)}</td><td>${m(t.subPeriod||"-")}</td></tr>`).join(""),n=(t.yogas||[]).map(t=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${m(t.name)}</span> — <span class="p en">${m(t.description)}</span></div>`).join(""),s=(t.remedies||[]).map(t=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${m(t.category)}</span><p class="p en">${m(t.description)}</p></div>`).join("");return i||n||s?`
${u("hi"===e?"दशा, योग एवं उपाय":"Dashas, Yogas & Remedies",e,a,t)}
${i?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${$("dashaPeriods",e)}</h2>
<table class="table-0">
<tr><th>महादशा/Maha Dasha</th><th>Start</th><th>End</th><th>Sub Period</th></tr>
${i}
</table>
</div>`:""}
${n?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${$("yogas",e)}</h2>
${n}
</div>`:""}
${s?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${$("remedies",e)}</h2>
<div class="two-col">${s}</div>
</div>`:""}
${b(a,e)}
`:""},P={career:10,marriage:7,wealth:2,health:6,finance:11,education:4},D=(t,e)=>{let a=t.split(/\s+/).filter(Boolean);return a.length<=e?t:`${a.slice(0,e).join(" ")}…`},S=(t,e,a,n)=>{let s=new Date().getFullYear(),o=t.map(t=>{let n=t.domain.charAt(0).toUpperCase()+t.domain.slice(1),o=P[t.domain]??1,r=(0,i.nV)(e.houseCusps?.[o-1]?.sign||""),l=r&&i.sr[r]||"—",d=[`${"hi"===a?"भाव":"House"} ${o}`,`${"hi"===a?"स्वामी":"Lord"}: ${l}`,e.dashaPeriods?.[0]?`${e.dashaPeriods[0].startYear}–${e.dashaPeriods[0].endYear}`:t.timeframe||"—"],h=[t.prediction,t.analysis].filter(Boolean),c=h.length?m(D(h.join(" "),180)):"hi"===a?"विस्तृत विश्लेषण प्रीमियम रिपोर्ट में शामिल है।":`Detailed ${m(t.domain)} analysis is included in the premium report.`,p=(e.dashaPeriods||[]).filter(t=>{let e=parseInt(String(t.endYear),10);return Number.isNaN(e)||e>=s}).slice(0,2),g=p.length?p.map(t=>`<tr><td>${m(t.startYear)}–${m(t.endYear)}</td><td>${m([t.mahaDasha,t.subPeriod].filter(Boolean).join(" \xb7 ")||"-")}</td></tr>`).join(""):`<tr><td>—</td><td>${"hi"===a?"उपलब्ध नहीं":"Not available"}</td></tr>`;return`<div class="domain-half">
<h2 class="domain-title ${"en"===a?"en":""}">${m(n)}</h2>
<div class="domain-badges">${d.map(t=>`<span class="tag paid">${m(t)}</span>`).join("")}</div>
<p class="domain-narrative ${"en"===a?"en":""}">${c}</p>
<table class="mini-table">
<tr><th>${"hi"===a?"अवधि":"Period"}</th><th>${"hi"===a?"प्रभाव":"Influence"}</th></tr>
${g}
</table>
</div>`}).join('<div class="domain-divider"></div>');return`
${u("hi"===a?"जीवन क्षेत्र विश्लेषण":"Life Domains Analysis",a,n,e)}
<div class="dual-domain-grid">
${o}
</div>
${b(n,a)}
`},N=(t,e,a)=>{let i=t.kalpurushaPhalDeepikaRefs||[],n=t.scorecard||[];return i.length||n.length?`
${u("hi"===e?"संदर्भ एवं सारांश":"References & Summary",e,a,t)}
${i.length?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">कल्पुरुश पुस्तक / Sources</h2>
${i.map(t=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${m(t.verse)}</span><p class="p en">${m(t.interpretation)}</p></div>`).join("")}
</div>`:""}
${n.length?`<div class="section-block">
<h2 class="h2 ${"en"===e?"en":""}">${$("scorecard",e)}</h2>
<table class="table-0">
<tr><th>Parameter</th><th>Score</th><th></th></tr>
${n.map(t=>`<tr><td>${m(t.parameter)}</td><td><span class="score-text">${t.score}/${t.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${Math.min(100,Math.max(0,t.score/t.maxScore*100))}%"></div></div></td></tr>`).join("")}
</table>
</div>`:""}
<p class="note">${"hi"===e?`${m(t.clientName)} के लिए ${new Date().toLocaleDateString("hi-IN")} को जनरेट किया गया।`:`Generated for ${m(t.clientName)} on ${new Date().toLocaleDateString("en-US")}.`}</p>
${b(a,e)}
`:""},j={hi:{appendix:"परिशिष्ट — जीवन स्तंभ",milestones:"प्रमुख मील के पत्थर",aiNote:"यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।"},en:{appendix:"Appendix — Life Pillars",milestones:"Key Milestones",aiNote:"This chapter is based on AI-assisted Vedic astrology guidance."}},I={positive:"#059669",neutral:"#6b7280",caution:"#d97706"},C=(t,e,a,i)=>{let n="hi"===a?t.titleHi||t.titleEn:t.titleEn||t.titleHi,s="hi"===a?t.narrativeHi||t.narrativeEn:t.narrativeEn||t.narrativeHi,o=j[a],r=t.badges||{},l=[r.score,r.timeframe,r.lord].filter(Boolean);return`
${u(n,a,i,e)}
<p class="note">${m(o.appendix)}</p>
<h1 class="${"en"===a?"en":""}">${m(n)}</h1>
${l.length?`<p class="p"><span class="tag paid">${l.map(t=>m(t)).join('</span> <span class="tag paid">')}</span></p>`:""}
<h2 class="${"en"===a?"en":""}">${$("domainInsights",a)}</h2>
<p class="p${"en"===a?" en":""}" style="font-size:10pt;">${m(s)}</p>
${t.milestones&&t.milestones.length?`
<div class="divider"></div>
<h2 class="${"en"===a?"en":""}">${m(o.milestones)}</h2>
<table class="table-0">
<tr><th>${"hi"===a?"अवधि":"Period"}</th><th>${"hi"===a?"घटना":"Event"}</th><th>${"hi"===a?"टिप्पणी":"Note"}</th></tr>
${t.milestones.map(t=>`<tr><td>${m(t.period)}</td><td>${m(t.event)}${t.outcome?` <span style="color:${I[t.outcome]||"#6b7280"};font-weight:700;">●</span>`:""}</td><td>${m(t.note||"-")}</td></tr>`).join("")}
</table>`:""}
<p class="note">${m(o.aiNote)}</p>
${b(i,a)}
`};function H(t,e){let a=0,i=[],n=t=>{t&&t.trim()&&i.push(t)};n(w(t,e,++a)),n(k(t,e,++a));let s=z(t,e,a+1);s&&(a+=1,i.push(s)),[["career","wealth"],["marriage","health"],["education","family"]].forEach(([i,s])=>{let o=t.domainInsights.find(t=>t.domain===i),r=t.domainInsights.find(t=>t.domain===s);((o?.prediction?.length??0)>50||(r?.prediction?.length??0)>50)&&n(S([o,r].filter(t=>!!t),t,e,++a))});let o=N(t,e,a+1);return o&&(a+=1,i.push(o)),(t.narratives||[]).forEach(n=>i.push(C(n,t,e,++a))),`
<!DOCTYPE html>
<html lang="${e}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${$("title",e)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
${f}
</style>
</head>
<body>
${i.join("")}
</body>
</html>
`.trim()}}};