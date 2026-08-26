"use strict";(()=>{var e={};e.id=1950,e.ids=[1950],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},35695:e=>{e.exports=import("@sparticuz/chromium-min")},77250:e=>{e.exports=import("puppeteer-core")},6113:e=>{e.exports=require("crypto")},57147:e=>{e.exports=require("fs")},79892:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>V,patchFetch:()=>F,requestAsyncStorage:()=>q,routeModule:()=>_,serverHooks:()=>K,staticGenerationAsyncStorage:()=>U});var i={};a.r(i),a.d(i,{POST:()=>Y,dynamic:()=>L,maxDuration:()=>M,runtime:()=>R});var n=a(49303),s=a(88716),r=a(60670),o=a(87070),l=a(43493);function d(e){return((e-1)%12+12)%12+1}function c(e){return((e-1)%12+12)%12+1}function h(e){return e.replace(/\&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function p(e){return l.B4[((e-1)%12+12)%12]??"♈"}function g(e,t){let a=(0,l.zb)(e.planet,t)||e.planet.slice(0,2);return e.retrograde?"hi"===t?`${a}(व)`:`${a}\xae`:a}let m=[{house:1,poly:"100,100 200,0 300,100 200,200",cx:200,cy:100,px:200},{house:2,poly:"0,0 200,0 100,100",cx:100,cy:33.33,px:100},{house:3,poly:"0,0 100,100 0,200",cx:33.33,cy:100,px:49.33},{house:4,poly:"100,300 0,200 100,100 200,200",cx:100,cy:200,px:100},{house:5,poly:"0,200 100,300 0,400",cx:33.33,cy:300,px:49.33},{house:6,poly:"0,400 100,300 200,400",cx:100,cy:366.67,px:100},{house:7,poly:"300,300 200,400 100,300 200,200",cx:200,cy:300,px:200},{house:8,poly:"200,400 300,300 400,400",cx:300,cy:366.67,px:300},{house:9,poly:"400,400 400,200 300,300",cx:366.67,cy:300,px:350.67},{house:10,poly:"300,100 400,200 300,300 200,200",cx:300,cy:200,px:300},{house:11,poly:"400,200 300,100 400,0",cx:366.67,cy:100,px:350.67},{house:12,poly:"400,0 200,0 300,100",cx:300,cy:33.33,px:300}],u={1:{row:0,col:0},2:{row:0,col:1},3:{row:0,col:2},4:{row:0,col:3},5:{row:1,col:3},6:{row:2,col:3},7:{row:3,col:3},8:{row:3,col:2},9:{row:3,col:1},10:{row:3,col:0},11:{row:2,col:0},12:{row:1,col:0}};function f(e){return"south"===e.style?function(e){let{language:t,ascendantSign:a=1,planets:i=[],showTitle:n=!1,title:s,stroke:r="#333333",background:o="#ffffff",textColor:d="#1a1a2e"}=e,m=c(a),f={};for(let e of i||[]){let t=c(e.sign);(f[t]||=[]).push(e)}let $=Object.keys(u).map(Number).sort((e,t)=>e-t).map(e=>{let{row:a,col:i}=u[e],n=100*i+50,s=100*a+50,c=(e-m+12)%12+1,$=Math.min((f[e]||[]).length,4),b=(f[e]||[]).slice(0,$).map((e,a)=>{let i=n+(a-($-1)/2)*15;return`<text x="${i}" y="${s+15}" font-size="9" font-weight="600" fill="${d}" text-anchor="middle">${h(g(e,t))}</text>`}).join(""),y=`<text x="${n}" y="${s-6}" font-size="8" fill="${r}" text-anchor="middle">${h((0,l.yL)(e,t))}</text>`,v=`<text x="${n}" y="${s-16}" font-size="10" fill="${d}" text-anchor="middle">${p(e)}</text>`,x=`<text x="${n}" y="${0===a?100*a+12:3===a?100*a+100-8:s}" font-size="8" fill="${r}" text-anchor="middle">${c}</text>`;return`<g>
  <rect x="${100*i+1}" y="${100*a+1}" width="98" height="98" fill="${o}" stroke="${r}" stroke-width="1"/>
  ${v}${y}${b}${x}
</g>`}).join(""),b="hi"===t?"लग्न":"Lagna",y=`<g>
  <text x="200" y="192" font-size="9" fill="${r}" text-anchor="middle">${h(b)}</text>
  <text x="200" y="210" font-size="14" font-weight="700" fill="${d}" text-anchor="middle">${p(m)} ${h((0,l.yL)(m,t))}</text>
</g>`,v=n?`<text x="200" y="14" font-size="12" font-weight="600" fill="${d}" text-anchor="middle">${h(s||("hi"===t?"दक्षिण भारतीय चार्ट":"South Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${h(s||"Kundli chart")}">
<rect width="400" height="400" fill="${o}"/>
${v}
<g stroke="${r}" stroke-width="1" fill="none">
  <path d="M0,100 H400 M0,200 H400 M0,300 H400"/>
  <path d="M100,0 V400 M200,0 V400 M300,0 V400"/>
</g>
${$}
${y}
</svg>`}(e):function(e){let{language:t,ascendantSign:a=1,planets:i=[],houses:n,showTitle:s=!1,title:r,stroke:o="#3b3b4d",background:u="#ffffff",textColor:f="#1a1a2e"}=e,$=c(a),b=function(e,t){let a=c(e||1),i={};for(let e=1;e<=12;e++)i[e]=c(a+e-1);if(t&&t.length)for(let e of t)e&&e.house>=1&&e.house<=12&&e.sign>=1&&e.sign<=12&&(i[d(e.house)]=c(e.sign));return i}($,n),y=function(e){let t={};for(let a of e||[]){let e=d(a.house||1);(t[e]||=[]).push(a)}return t}(i),v=m.map(e=>{let a=b[e.house],i=y[e.house]||[],n=`<text x="${e.cx}" y="${e.cy-20}" font-size="10" fill="${o}" text-anchor="middle">${p(a)}</text>`,s=`<text x="${e.cx}" y="${e.cy-8}" font-size="8" fill="${o}" text-anchor="middle">${e.house}</text>`,r=i.slice(0,5),d=r.length,c=r.map((a,i)=>{let n=e.px-7*(d-1)+14*i;return`<text x="${n}" y="${e.cy+14}" font-size="9" font-weight="600" fill="${f}" text-anchor="middle">${h(g(a,t))}</text>`}).join(""),m=i.length>5?`<text x="${e.px}" y="${e.cy+26}" font-size="7" fill="${o}" text-anchor="middle">+${i.length-5}</text>`:"",u=1===e.house?`<text x="${e.cx}" y="${e.cy+34}" font-size="10" font-weight="700" fill="${f}" text-anchor="middle">${h((0,l.yL)($,t))}</text>`:"";return`<g>${n}${s}${c}${m}${u}</g>`}).join(""),x=`<rect x="0" y="0" width="400" height="400" fill="none" stroke="${o}" stroke-width="2"/>
<line x1="0" y1="0" x2="400" y2="400" stroke="${o}" stroke-width="1.5"/>
<line x1="400" y1="0" x2="0" y2="400" stroke="${o}" stroke-width="1.5"/>
<polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="${o}" stroke-width="1.5"/>`,w=s?`<text x="200" y="14" font-size="12" font-weight="600" fill="${f}" text-anchor="middle">${h(r||("hi"===t?"उत्तर भारतीय चार्ट":"North Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${h(r||"Kundli chart")}">
<rect width="400" height="400" fill="${u}"/>
${w}
${x}
${v}
</svg>`}(e)}let $={hi:{title:"जन्म कुंडली विशद़ विश्लेषण",clientName:"क्लाइंट नाम",chartType:"चार्ट प्रकार",birthDetails:"जन्म विवरण",planetaryPositions:"ग्रह स्थिति",houseCusps:"घर कस्स",dashaPeriods:"दशा अवधि",yogas:"योग",remedies:"उपाय",domainInsights:"डोमेन अंतर्दृष्टि",scorecard:"स्कोरकार्ड",page:"पृष्ठ",northIndian:"उत्तर भारतीय",southIndian:"दक्षिण भारतीय",paid:"प्रीमियम रिपोर्ट",basic:"मूलभूत रिपोर्ट"},en:{title:"Birth Chart Detailed Analysis",clientName:"Client Name",chartType:"Chart Type",birthDetails:"Birth Details",planetaryPositions:"Planetary Positions",houseCusps:"House Cusps",dashaPeriods:"Dasha Periods",yogas:"Yogas",remedies:"Remedies",domainInsights:"Domain Insights",scorecard:"Scorecard",page:"Page",northIndian:"North Indian",southIndian:"South Indian",paid:"Premium Report",basic:"Basic Report"}},b=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),y=(e,t)=>$[t][e],v=`
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
    height: auto;
    min-height: 296mm; /* 297mm minus a hair avoids blank overflow sheets in Chrome */
    max-height: 297mm;
    overflow: hidden;
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
/* Keep each logical section intact on one physical sheet where possible. */
.section-block { break-inside: avoid; page-break-inside: avoid; }
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
`,x=(e,t,a,i)=>`<div class="page-container">
<div class="header">
  <h1 class="${"en"===t?"en":""}">${b(e)}</h1>
  <div class="meta">
    <span><span class="section-title">${y("clientName",t)}:</span> ${b(i.clientName)}</span>
    <span class="tag ${i.isPaidTier?"paid":"basic"}">${i.isPaidTier?y("paid",t):y("basic",t)}</span>
  </div>
</div>
<div class="page-content">
`,w=(e,t)=>`
</div>
<div class="footer">
  <span class="page-number">${y("page",t)} ${e}</span>
</div>
</div>`,k=e=>{let t=(e.houseCusps&&e.houseCusps.length?(0,l.nV)(e.houseCusps[0].sign):0)||1;return{planets:(e.planetaryPositions||[]).map(e=>({planet:e.body,sign:(0,l.nV)(e.sign)||1,house:parseInt(String(e.house),10)||1,retrograde:!!e.retro})),houses:(e.houseCusps||[]).map(e=>({house:e.house,sign:(0,l.nV)(e.sign)||1})),ascendantSign:t}},S=(e,t,a)=>{if("north"===a&&/^<svg/.test(e.northIndianChartSvg||""))return e.northIndianChartSvg;let{planets:i,houses:n,ascendantSign:s}=k(e);return f({style:a,language:t,ascendantSign:s,planets:i,houses:n,showTitle:!0})},P=(e,t,a,i)=>i?`<div class="tile"><div class="tile-k">${b("hi"===a?t:e)}</div><div class="tile-v">${b(i)}</div></div>`:"",C=(e,t,a)=>{let i=e.birthDetails,n=e.panchang,s=i?`<table class="table-0">
<tr><th>${y("clientName",t)}</th><td>${b(e.clientName)}</td><th>${y("chartType",t)}</th><td>${b(e.chartType)}</td></tr>
<tr><th>${y("birthDetails",t)}</th><td>${b(i.date)} \xb7 ${b(i.time)}</td><th>TZ</th><td>${b(i.timezone)}</td></tr>
<tr><th>Lat / Long</th><td colspan="3">${b(i.latitude)}${i.longitude?`, ${b(i.longitude)}`:""}</td></tr>
</table>`:"",r=n?`<div class="tile-grid">${[P("Vara (Weekday)","वार",t,n.varaWeekday),P("Nakshatra","नक्षत्र",t,n.nakshatra),P("Nakshatra Lord","नक्षत्र स्वामी",t,n.nakshatraLord),P("Moon Sign","चंद्र राशि",t,n.moonSign),P("Sun Sign","सूर्य राशि",t,n.sunSign),P("Lagna","लग्न",t,n.lagna)].join("")}</div>`:"";return`
${x(y("title",t),t,a,e)}
<div class="cover-band"><span class="client-name">${b(e.clientName)}</span><span class="tag ${e.isPaidTier?"paid":"basic"}">${e.isPaidTier?y("paid",t):y("basic",t)}</span></div>
${s}
${r?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${"hi"===t?"जन्म पंचांग":"Panchang at Birth"}</h2>
${r}
</div>`:""}
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${"hi"===t?"लग्न कुंडली (D1)":"Lagna (D1) Chart"}</h2>
<div class="chart-container chart-sm">${S(e,t,"north")}</div>
</div>
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${y("planetaryPositions",t)}</h2>
<table class="table-0">
<tr><th>ग्रह/Body</th><th>राशि/Sign</th><th>डिग्री/Degree</th><th>घर/House</th><th>रीत्रो/Retro</th></tr>
${e.planetaryPositions.map(e=>`<tr><td>${b(e.body)}</td><td>${b(e.sign)}</td><td>${b(e.degree)}</td><td>${b(e.house)}</td><td>${e.retro?"✓":"-"}</td></tr>`).join("")}
</table>
</div>
${w(a,t)}
`},N=(e,t,a)=>{let i=e.sarvashtakavarga?.bindus?.length?e.sarvashtakavarga:null,n=e.d9Chart?f({style:"north",language:t,ascendantSign:e.d9Chart.ascendantSign||1,planets:e.d9Chart.planets,showTitle:!1}):"",s=i?i.bindus.map((e,t)=>`<div class="av-cell${i.beneficialHouses?.includes(t+1)?" av-strong":""}"><span class="av-h">H${t+1}</span><span class="av-b">${Number(e)||0}</span></div>`).join(""):"",r=e.houseCusps.map(e=>`<tr><td>${b(String(e.house))}</td><td>${b(e.sign)}</td><td>${b(e.degree||"-")}</td></tr>`).join(""),o=Math.ceil(e.houseCusps.length/2)||6,l=e.houseCusps.length?`<div class="grid-2">
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${r.slice(0,o)}</table>
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${r.slice(o)}</table>
</div>`:`<p class="note">${"hi"===t?"भाव डेटा उपलब्ध नहीं।":"House data unavailable."}</p>`;return`
${x("hi"===t?"भाव, नवांश एवं अष्टकवर्ग":"Houses, Navamsa & Ashtakavarga",t,a,e)}
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${y("houseCusps",t)}</h2>
${l}
</div>
<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${"hi"===t?"नवांश (D9) चार्ट":"Navamsa (D9) Chart"}</h2>
${n?`<div class="chart-container chart-sm">${n}</div>`:`<p class="note">${"hi"===t?"नवांश डेटा उपलब्ध नहीं।":"Navamsa data unavailable."}</p>`}
</div>
${i?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${"hi"===t?"सर्वाष्टकवर्ग बिंदु":"Sarvashtakavarga Bindus"}</h2>
<div class="av-grid">${s}</div>
${i.beneficialHouses?.length?`<p class="note">${"hi"===t?"प्रबल भाव: ":"Strong houses: "}${i.beneficialHouses.join(", ")}</p>`:""}
</div>`:""}
${w(a,t)}
`},D=(e,t,a)=>{let i=(e.dashaPeriods||[]).map(e=>`<tr><td>${b(e.mahaDasha)}</td><td>${b(e.startYear)}</td><td>${b(e.endYear)}</td><td>${b(e.subPeriod||"-")}</td></tr>`).join(""),n=(e.yogas||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${b(e.name)}</span> — <span class="p en">${b(e.description)}</span></div>`).join(""),s=(e.remedies||[]).map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${b(e.category)}</span><p class="p en">${b(e.description)}</p></div>`).join("");return i||n||s?`
${x("hi"===t?"दशा, योग एवं उपाय":"Dashas, Yogas & Remedies",t,a,e)}
${i?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${y("dashaPeriods",t)}</h2>
<table class="table-0">
<tr><th>महादशा/Maha Dasha</th><th>Start</th><th>End</th><th>Sub Period</th></tr>
${i}
</table>
</div>`:""}
${n?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${y("yogas",t)}</h2>
${n}
</div>`:""}
${s?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${y("remedies",t)}</h2>
<div class="two-col">${s}</div>
</div>`:""}
${w(a,t)}
`:""},z={career:10,marriage:7,wealth:2,health:6,finance:11,education:4},j=(e,t,a,i)=>{let n=e.domain.charAt(0).toUpperCase()+e.domain.slice(1),s=z[e.domain]??1,r=(0,l.nV)(t.houseCusps?.[s-1]?.sign||""),o=r&&l.sr[r]||"—",d=[`${"hi"===a?"भाव":"House"} ${s}`,`${"hi"===a?"स्वामी":"Lord"}: ${o}`,t.dashaPeriods?.[0]?`${t.dashaPeriods[0].startYear}–${t.dashaPeriods[0].endYear}`:e.timeframe||"—"],c=[e.prediction,e.analysis].filter(Boolean);return`
${x(n,a,i,t)}
<h1 style="font-size:14pt;font-weight:700;margin-bottom:0.25cm;" class="${"en"===a?"en":""}">${b(n)}</h1>
<div class="badge-row">${d.map(e=>`<span class="tag paid">${b(e)}</span>`).join("")}</div>
${c.length?`<p class="p ${"en"===a?"en":""}" style="font-size:9.5pt;">${c.map(e=>b(e)).join(" ")}</p>`:`<p class="p en">${"hi"===a?"विस्तृत विश्लेषण प्रीमियम रिपोर्ट में शामिल है।":`Detailed ${b(e.domain)} analysis is included in the premium report.`}</p>`}
<div class="divider"></div>
<h2 class="h2 ${"en"===a?"en":""}">${"hi"===a?"मुख्य समय-अवधियाँ":"Key Milestone Windows"}</h2>
<table class="table-0">
<tr><th>${"hi"===a?"अवधि":"Period"}</th><th>${"hi"===a?"प्रभाव":"Influence"}</th></tr>
${t.dashaPeriods.slice(0,4).map(e=>`<tr><td>${b(e.startYear)}–${b(e.endYear)}</td><td>${b([e.mahaDasha,e.subPeriod].filter(Boolean).join(" \xb7 ")||"-")}</td></tr>`).join("")||`<tr><td>—</td><td>${"hi"===a?"उपलब्ध नहीं":"Not available"}</td></tr>`}
</table>
${w(i,a)}
`},I=(e,t,a)=>{let i=e.kalpurushaPhalDeepikaRefs||[],n=e.scorecard||[];return i.length||n.length?`
${x("hi"===t?"संदर्भ एवं सारांश":"References & Summary",t,a,e)}
${i.length?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">कल्पुरुश पुस्तक / Sources</h2>
${i.map(e=>`<div style="margin-bottom:0.18cm;"><span class="section-title">${b(e.verse)}</span><p class="p en">${b(e.interpretation)}</p></div>`).join("")}
</div>`:""}
${n.length?`<div class="section-block">
<h2 class="h2 ${"en"===t?"en":""}">${y("scorecard",t)}</h2>
<table class="table-0">
<tr><th>Parameter</th><th>Score</th><th></th></tr>
${n.map(e=>`<tr><td>${b(e.parameter)}</td><td><span class="score-text">${e.score}/${e.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${Math.min(100,Math.max(0,e.score/e.maxScore*100))}%"></div></div></td></tr>`).join("")}
</table>
</div>`:""}
<p class="note">${"hi"===t?`${b(e.clientName)} के लिए ${new Date().toLocaleDateString("hi-IN")} को जनरेट किया गया।`:`Generated for ${b(e.clientName)} on ${new Date().toLocaleDateString("en-US")}.`}</p>
${w(a,t)}
`:""},A={hi:{appendix:"परिशिष्ट — जीवन स्तंभ",milestones:"प्रमुख मील के पत्थर",aiNote:"यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।"},en:{appendix:"Appendix — Life Pillars",milestones:"Key Milestones",aiNote:"This chapter is based on AI-assisted Vedic astrology guidance."}},T={positive:"#059669",neutral:"#6b7280",caution:"#d97706"},E=(e,t,a,i)=>{let n="hi"===a?e.titleHi||e.titleEn:e.titleEn||e.titleHi,s="hi"===a?e.narrativeHi||e.narrativeEn:e.narrativeEn||e.narrativeHi,r=A[a],o=e.badges||{},l=[o.score,o.timeframe,o.lord].filter(Boolean);return`
${x(n,a,i,t)}
<p class="note">${b(r.appendix)}</p>
<h1 class="${"en"===a?"en":""}">${b(n)}</h1>
${l.length?`<p class="p"><span class="tag paid">${l.map(e=>b(e)).join('</span> <span class="tag paid">')}</span></p>`:""}
<h2 class="${"en"===a?"en":""}">${y("domainInsights",a)}</h2>
<p class="p${"en"===a?" en":""}" style="font-size:10pt;">${b(s)}</p>
${e.milestones&&e.milestones.length?`
<div class="divider"></div>
<h2 class="${"en"===a?"en":""}">${b(r.milestones)}</h2>
<table class="table-0">
<tr><th>${"hi"===a?"अवधि":"Period"}</th><th>${"hi"===a?"घटना":"Event"}</th><th>${"hi"===a?"टिप्पणी":"Note"}</th></tr>
${e.milestones.map(e=>`<tr><td>${b(e.period)}</td><td>${b(e.event)}${e.outcome?` <span style="color:${T[e.outcome]||"#6b7280"};font-weight:700;">●</span>`:""}</td><td>${b(e.note||"-")}</td></tr>`).join("")}
</table>`:""}
<p class="note">${b(r.aiNote)}</p>
${w(i,a)}
`};var H=a(3907);let R="nodejs",M=60,L="force-dynamic",B=[process.env.CHROME_PATH,process.env.CHROME_EXECUTABLE_PATH,"/usr/bin/google-chrome-stable","/usr/bin/google-chrome","/usr/bin/chromium-browser","/usr/bin/chromium","/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","/Applications/Chromium.app/Contents/MacOS/Chromium"].filter(Boolean);async function O(){try{let{default:e}=await Promise.resolve().then(a.bind(a,35695));return e.setGraphicsMode=!1,{executablePath:await e.executablePath(),args:[...e.args]}}catch(e){console.warn("[kundali/pdf] chromium-min unavailable, falling back to system Chrome:",e)}let{existsSync:e}=await Promise.resolve().then(a.t.bind(a,57147,23));for(let t of B)try{if(e(t))return{executablePath:t,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]}}catch{}throw Error("No Chromium executable available. Set CHROME_PATH or deploy with @sparticuz/chromium-min.")}async function Y(e){let t=null;try{let i=await e.json().catch(()=>null);if(!i||"object"!=typeof i)return o.NextResponse.json({error:"A JSON body is required"},{status:400});let n="string"==typeof i.language?i.language.trim().toLowerCase():"en",s="hi"===n?"hi":"en",r=i.reportData;if(!r||"object"!=typeof r||!Array.isArray(r.planetaryPositions))return o.NextResponse.json({error:"A valid reportData payload is required to render the kundli PDF"},{status:400});if(!0!==r.isPaidTier)return o.NextResponse.json({error:"This report is locked. Complete payment to unlock the full PDF."},{status:402});if(!(0,H.I)(i.paymentToken))return o.NextResponse.json({error:"Payment verification required to download the full report."},{status:402});let l=function(e){let t=e??{},a=e=>Array.isArray(e)?e:[],i=t.birthDetails??{};return{clientName:String(t.clientName??"User"),chartType:String(t.chartType??"North Indian"),birthDetails:{date:String(i.date??""),time:String(i.time??""),latitude:String(i.latitude??""),longitude:String(i.longitude??""),timezone:String(i.timezone??"")},planetaryPositions:a(t.planetaryPositions),houseCusps:a(t.houseCusps),dashaPeriods:a(t.dashaPeriods),yogas:a(t.yogas),remedies:a(t.remedies),domainInsights:a(t.domainInsights),northIndianChartSvg:String(t.northIndianChartSvg??""),kalpurushaPhalDeepikaRefs:a(t.kalpurushaPhalDeepikaRefs),scorecard:a(t.scorecard),isPaidTier:!0===t.isPaidTier}}(r),d=function(e){if(Array.isArray(e)&&0!==e.length)return e.filter(e=>!!e&&"object"==typeof e).slice(0,8).map((e,t)=>({key:String(e.key??`pillar-${t+1}`),titleEn:String(e.titleEn??""),titleHi:String(e.titleHi??""),badges:e.badges&&"object"==typeof e.badges?{score:String(e.badges.score??""),timeframe:String(e.badges.timeframe??""),lord:String(e.badges.lord??"")}:void 0,narrativeEn:String(e.narrativeEn??""),narrativeHi:String(e.narrativeHi??""),milestones:Array.isArray(e.milestones)?e.milestones.slice(0,4).map(e=>({period:String(e?.period??""),event:String(e?.event??""),note:e?.note?String(e.note):void 0,outcome:e?.outcome==="positive"||e?.outcome==="caution"?e.outcome:"neutral"})):[]}))}(i.pillars),c=function(e,t){let a=0,i=[],n=e=>{e&&e.trim()&&i.push(e)};n(C(e,t,++a)),n(N(e,t,++a));let s=D(e,t,a+1);s&&(a+=1,i.push(s)),e.domainInsights.filter(e=>e.prediction||e.analysis).forEach(i=>n(j(i,e,t,++a)));let r=I(e,t,a+1);return r&&(a+=1,i.push(r)),(e.narratives||[]).forEach(n=>i.push(E(n,e,t,++a))),`
<!DOCTYPE html>
<html lang="${t}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${y("title",t)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
${v}
</style>
</head>
<body>
${i.join("")}
</body>
</html>
`.trim()}({...l,...d?{narratives:d}:{}},s),h=await Promise.resolve().then(a.bind(a,77250)),{executablePath:p,args:g}=await O();t=await h.launch({args:[...g,"--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu","--font-render-hinting=none"],executablePath:p,headless:!0,defaultViewport:{width:794,height:1123}});let m=await t.newPage();await m.setContent(c,{waitUntil:"load",timeout:3e4}),await m.waitForNetworkIdle({idleTime:400,timeout:12e3}).catch(()=>{});try{await m.evaluateHandle("document.fonts.ready")}catch{}let u=await m.pdf({format:"A4",printBackground:!0,preferCSSPageSize:!0,margin:{top:0,bottom:0,left:0,right:0},timeout:25e3}),f="string"==typeof i.fileName&&i.fileName.trim()||l.clientName||"kundli",$=`${String(f??"").replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48).toLowerCase()||"kundli"}-kundli-${s}.pdf`,b=(c.match(/class="page-container"/g)||[]).length;return new o.NextResponse(new Uint8Array(u),{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${$}"`,"Content-Length":String(u.byteLength),"Cache-Control":"no-store","X-Kundli-Pages":String(b)}})}catch(e){return console.error("[kundali/pdf] PDF generation failed:",e),o.NextResponse.json({error:"Failed to render kundli PDF"},{status:500})}finally{if(t)try{await t.close()}catch(e){console.error("[kundali/pdf] Browser close failed:",e)}}}let _=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/kundali/pdf/route",pathname:"/api/kundali/pdf",filename:"route",bundlePath:"app/api/kundali/pdf/route"},resolvedPagePath:"/Users/seetu/astro-sage-ai-2/app/api/kundali/pdf/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:q,staticGenerationAsyncStorage:U,serverHooks:K}=_,V="/api/kundali/pdf/route";function F(){return(0,r.patchFetch)({serverHooks:K,staticGenerationAsyncStorage:U})}},3907:(e,t,a)=>{a.d(t,{I:()=>o,z:()=>r});var i=a(6113),n=a.n(i);function s(e){return n().createHmac("sha256",function(){let e=process.env.RAZORPAY_KEY_SECRET||process.env.PAYMENT_UNLOCK_SECRET;if(!e)throw Error("PAYMENT_UNLOCK_SECRET (or RAZORPAY_KEY_SECRET) is not configured.");return e}()).update(e).digest("hex")}function r(e,t){let a=Buffer.from(JSON.stringify({orderId:e,paymentId:t,iat:Date.now()})).toString("base64url");return`${a}.${s(a)}`}function o(e){let t;if(!e||"string"!=typeof e)return null;let a=e.lastIndexOf(".");if(a<=0||a===e.length-1)return null;let i=e.slice(0,a),r=e.slice(a+1);try{t=Buffer.from(s(i))}catch{return null}let o=Buffer.from(r);if(o.length!==t.length||!n().timingSafeEqual(o,t))return null;try{let e=JSON.parse(Buffer.from(i,"base64url").toString("utf8"));if("string"!=typeof e.orderId||"string"!=typeof e.paymentId||"number"!=typeof e.iat||Date.now()-e.iat>2592e6)return null;return{orderId:e.orderId,paymentId:e.paymentId}}catch{return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[8948,5972,4749],()=>a(79892));module.exports=i})();