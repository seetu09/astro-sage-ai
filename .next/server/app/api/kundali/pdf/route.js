"use strict";(()=>{var e={};e.id=1950,e.ids=[1950],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},35695:e=>{e.exports=import("@sparticuz/chromium-min")},77250:e=>{e.exports=import("puppeteer-core")},57147:e=>{e.exports=require("fs")},79892:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>Z,patchFetch:()=>ee,requestAsyncStorage:()=>J,routeModule:()=>K,serverHooks:()=>W,staticGenerationAsyncStorage:()=>Q});var i={};a.r(i),a.d(i,{POST:()=>_,dynamic:()=>q,maxDuration:()=>U,runtime:()=>F});var n=a(49303),s=a(88716),o=a(60670),r=a(87070),l=a(43493);function h(e){return((e-1)%12+12)%12+1}function c(e){return((e-1)%12+12)%12+1}function d(e){return e.replace(/\&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function p(e){return l.B4[((e-1)%12+12)%12]??"♈"}function g(e,t){let a=(0,l.zb)(e.planet,t)||e.planet.slice(0,2);return e.retrograde?"hi"===t?`${a}(व)`:`${a}\xae`:a}let m=[{house:1,poly:"180,20 220,20 260,60 140,60",cx:200,cy:46,glyphX:148,glyphY:27},{house:2,poly:"220,20 380,20 380,60 260,60",cx:320,cy:46,glyphX:228,glyphY:27},{house:3,poly:"340,60 380,60 380,340 340,340",cx:360,cy:200,glyphX:348,glyphY:67},{house:4,poly:"340,340 380,340 380,380 260,340",cx:320,cy:356,glyphX:348,glyphY:307},{house:5,poly:"100,380 140,340 260,340 300,380",cx:200,cy:356,glyphX:228,glyphY:307},{house:6,poly:"20,340 60,340 100,380 20,380",cx:60,cy:356,glyphX:28,glyphY:347},{house:7,poly:"60,60 100,60 100,340 60,340",cx:80,cy:200,glyphX:68,glyphY:67},{house:8,poly:"20,20 60,20 100,60 20,60",cx:40,cy:46,glyphX:28,glyphY:27},{house:9,poly:"180,60 220,60 260,140 140,140",cx:200,cy:106,glyphX:148,glyphY:67},{house:10,poly:"220,60 260,60 300,140 260,140",cx:280,cy:106,glyphX:248,glyphY:67},{house:11,poly:"260,140 300,140 300,260 260,260",cx:280,cy:200,glyphX:268,glyphY:147},{house:12,poly:"140,140 100,140 100,260 140,260",cx:120,cy:200,glyphX:108,glyphY:147}],u={1:{row:0,col:0},2:{row:0,col:1},3:{row:0,col:2},4:{row:0,col:3},5:{row:1,col:3},6:{row:2,col:3},7:{row:3,col:3},8:{row:3,col:2},9:{row:3,col:1},10:{row:3,col:0},11:{row:2,col:0},12:{row:1,col:0}},f={hi:{title:"जन्म कुंडली विशद़ विश्लेषण",clientName:"क्लाइंट नाम",chartType:"चार्ट प्रकार",birthDetails:"जन्म विवरण",planetaryPositions:"ग्रह स्थिति",houseCusps:"घर कस्स",dashaPeriods:"दशा अवधि",yogas:"योग",remedies:"उपाय",domainInsights:"डोमेन अंतर्दृष्टि",scorecard:"स्कोरकार्ड",page:"पृष्ठ",northIndian:"उत्तर भारतीय",southIndian:"दक्षिण भारतीय",paid:"प्रीमियम रिपोर्ट",basic:"मूलभूत रिपोर्ट"},en:{title:"Birth Chart Detailed Analysis",clientName:"Client Name",chartType:"Chart Type",birthDetails:"Birth Details",planetaryPositions:"Planetary Positions",houseCusps:"House Cusps",dashaPeriods:"Dasha Periods",yogas:"Yogas",remedies:"Remedies",domainInsights:"Domain Insights",scorecard:"Scorecard",page:"Page",northIndian:"North Indian",southIndian:"South Indian",paid:"Premium Report",basic:"Basic Report"}},$=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),y=(e,t)=>f[t][e],b=`
@page { margin: 0; padding: 0; size: A4; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  /* Client fallback (window.print): force exact A4 sheets with hard breaks so
     every .page-container lands on its own physical sheet, chrome included. */
  html, body { width: 210mm; overflow: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page-container {
    page-break-after: always;
    break-after: page;
    width: 210mm;
    height: 296mm; /* 297mm minus a hair avoids blank overflow sheets in Chrome */
    min-height: auto;
    overflow: hidden;
  }
  .page-container:last-child { page-break-after: auto; break-after: auto; }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; font-size: 12pt; line-height: 1.4; color: #1a1a1a; background: #fff; }
html, body { overflow: hidden; }
@page :first { margin: 0; }
.page-container { width: 21cm; min-height: 29.7cm; height: 29.7cm; padding: 1.5cm 1.2cm; margin: 0 auto; page-break-after: always; position: relative; }
.page-container:last-child { page-break-after: auto; }
.page-content { width: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.3cm; border-bottom: 3pt solid #999; margin-bottom: 0.4cm; }
.header h1 { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 16pt; font-weight: 700; }
.header h1.en { font-family: 'Inter', sans-serif; }
.header .meta { text-align: right; font-size: 9pt; color: #555; }
.header .meta span { display: block; }
.footer { position: absolute; bottom: 1.2cm; width: calc(100% - 2.4cm); text-align: center; font-size: 8pt; color: #777; border-top: 1pt solid #ddd; padding-top: 0.3cm; }
.footer .page-number { display: inline-block; }
.h1 { font-size: 14pt; font-weight: 700; margin-bottom: 0.4cm; padding-bottom: 0.2cm; border-bottom: 1pt solid #ccc; }
.h1.en { font-family: 'Inter', sans-serif; }
.h2 { font-size: 11pt; font-weight: 700; margin-bottom: 0.3cm; color: #333; }
.h2.en { font-family: 'Inter', sans-serif; }
.p { font-size: 9.5pt; margin-bottom: 0.25cm; text-align: justify; }
.p.en { font-family: 'Inter', sans-serif; }
.two-col { column-count: 2; column-gap: 0.5cm; }
.table-0 { width: 100%; border-collapse: collapse; margin-bottom: 0.3cm; }
.table-0 th, .table-0 td { border: 0.5pt solid #bbb; padding: 3px 5px; text-align: left; font-size: 8.5pt; }
.table-0 th { background: #f0f0f0; }
.chart-container { text-align: center; margin: 0.3cm 0; }
.chart-container svg { max-width: 100%; height: auto; }
.logo-placeholder { text-align: center; font-size: 8pt; color: #999; margin-bottom: 0.3cm; }
.section-title { font-size: 10pt; font-weight: 700; margin: 0.2cm 0 0.1cm; display: inline-block; }
.score-bar { height: 6pt; background: #eee; border-radius: 2px; overflow: hidden; display: inline-block; width: 60%; vertical-align: middle; margin-left: 5px; }
.score-fill { height: 100%; background: #3b82f6; }
.score-text { font-size: 8.5pt; font-weight: 700; }
.tag { display: inline-block; padding: 1pt 6px; border-radius: 3px; font-size: 8pt; font-weight: 700; }
.tag.paid { background: #fbbf24; color: #78350f; }
.tag.basic { background: #9ca3af; color: #374151; }
.divider { border-top: 1pt dashed #bbb; margin: 0.2cm 0; }
.note { font-size: 8pt; font-style: italic; color: #666; }
`,x=(e,t,a,i)=>`<div class="page-container">
<div class="header">
  <h1 class="${"en"===t?"en":""}">${$(e)}</h1>
  <div class="meta">
    <span><span class="section-title">${y("clientName",t)}:</span> ${$(i.clientName)}</span>
    <span class="tag ${i.isPaidTier?"paid":"basic"}">${i.isPaidTier?y("paid",t):y("basic",t)}</span>
  </div>
</div>
<div class="page-content">
`,w=(e,t)=>`
</div>
<div class="footer">
  <span class="page-number">${y("page",t)} ${e}</span>
</div>
</div>`,v=e=>{let t=(e.houseCusps&&e.houseCusps.length?(0,l.nV)(e.houseCusps[0].sign):0)||1;return{planets:(e.planetaryPositions||[]).map(e=>({planet:e.body,sign:(0,l.nV)(e.sign)||1,house:parseInt(String(e.house),10)||1,retrograde:!!e.retro})),houses:(e.houseCusps||[]).map(e=>({house:e.house,sign:(0,l.nV)(e.sign)||1})),ascendantSign:t}},P=(e,t,a)=>{if("north"===a&&/^<svg/.test(e.northIndianChartSvg||""))return e.northIndianChartSvg;let{planets:i,houses:n,ascendantSign:s}=v(e);return function(e){return"south"===e.style?function(e){let{language:t,ascendantSign:a=1,planets:i=[],showTitle:n=!1,title:s,stroke:o="#333333",background:r="#ffffff",textColor:h="#1a1a2e"}=e,m=c(a),f={};for(let e of i||[]){let t=c(e.sign);(f[t]||=[]).push(e)}let $=Object.keys(u).map(Number).sort((e,t)=>e-t).map(e=>{let{row:a,col:i}=u[e],n=100*i+50,s=100*a+50,c=(e-m+12)%12+1,$=Math.min((f[e]||[]).length,4),y=(f[e]||[]).slice(0,$).map((e,a)=>{let i=n+(a-($-1)/2)*15;return`<text x="${i}" y="${s+15}" font-size="9" font-weight="600" fill="${h}" text-anchor="middle">${d(g(e,t))}</text>`}).join(""),b=`<text x="${n}" y="${s-6}" font-size="8" fill="${o}" text-anchor="middle">${d((0,l.yL)(e,t))}</text>`,x=`<text x="${n}" y="${s-16}" font-size="10" fill="${h}" text-anchor="middle">${p(e)}</text>`,w=`<text x="${n}" y="${0===a?100*a+12:3===a?100*a+100-8:s}" font-size="8" fill="${o}" text-anchor="middle">${c}</text>`;return`<g>
  <rect x="${100*i+1}" y="${100*a+1}" width="98" height="98" fill="${r}" stroke="${o}" stroke-width="1"/>
  ${x}${b}${y}${w}
</g>`}).join(""),y="hi"===t?"लग्न":"Lagna",b=`<g>
  <text x="200" y="192" font-size="9" fill="${o}" text-anchor="middle">${d(y)}</text>
  <text x="200" y="210" font-size="14" font-weight="700" fill="${h}" text-anchor="middle">${p(m)} ${d((0,l.yL)(m,t))}</text>
</g>`,x=n?`<text x="200" y="14" font-size="12" font-weight="600" fill="${h}" text-anchor="middle">${d(s||("hi"===t?"दक्षिण भारतीय चार्ट":"South Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${d(s||"Kundli chart")}">
<rect width="400" height="400" fill="${r}"/>
${x}
<g stroke="${o}" stroke-width="1" fill="none">
  <path d="M0,100 H400 M0,200 H400 M0,300 H400"/>
  <path d="M100,0 V400 M200,0 V400 M300,0 V400"/>
</g>
${$}
${b}
</svg>`}(e):function(e){let{language:t,ascendantSign:a=1,planets:i=[],houses:n,showTitle:s=!1,title:o,stroke:r="#3b3b4d",background:u="#ffffff",textColor:f="#1a1a2e"}=e,$=c(a),y=function(e,t){let a=c(e||1),i={};for(let e=1;e<=12;e++)i[e]=c(a+e-1);if(t&&t.length)for(let e of t)e&&e.house>=1&&e.house<=12&&e.sign>=1&&e.sign<=12&&(i[h(e.house)]=c(e.sign));return i}($,n),b=function(e){let t={};for(let a of e||[]){let e=h(a.house||1);(t[e]||=[]).push(a)}return t}(i),x=m.slice().sort((e,t)=>e.house-t.house).map(e=>{let a=y[e.house],i=b[e.house]||[],n=`<text x="${e.glyphX}" y="${e.glyphY}" font-size="9" fill="${r}" text-anchor="start">${p(a)}</text>`,s=`<text x="${e.glyphX+14}" y="${e.glyphY-1}" font-size="8" fill="${r}" text-anchor="start">${e.house}</text>`,o=Math.min(i.length,6),h=i.slice(0,o).map((a,i)=>{let n=e.cx-(o-1)*9+18*i,s=e.cy+12;return`<text x="${n}" y="${s}" font-size="9" font-weight="600" fill="${f}" text-anchor="middle">${d(g(a,t))}</text>`}).join(""),c=1===e.house?`<text x="${e.cx}" y="${e.cy-2}" font-size="10" font-weight="700" fill="${f}" text-anchor="middle">${d((0,l.yL)($,t))}</text>`:"";return`<g>${n}${s}${h}${c}</g>`}).join(""),w=m.map(e=>`<polygon points="${e.poly}" fill="${u}" stroke="${r}" stroke-width="1" stroke-linejoin="round"/>`).join(""),v=s?`<text x="200" y="14" font-size="12" font-weight="600" fill="${f}" text-anchor="middle">${d(o||("hi"===t?"उत्तर भारतीय चार्ट":"North Indian Chart"))}</text>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${d(o||"Kundli chart")}">
<rect width="400" height="400" fill="${u}"/>
${v}
${w}
${x}
</svg>`}(e)}({style:a,language:t,ascendantSign:s,planets:i,houses:n,showTitle:!0})},k=(e,t)=>`
${x(y("title",t),t,1,e)}
<div class="logo-placeholder">ASTROLOGICAL REPORT PORTAL</div>
<div class="chart-container">
${P(e,t,"north")}
</div>
<h2 class="${"en"===t?"en":""}" style="text-align:center; font-size:18pt; margin:0.5cm 0;">${$(e.clientName)}</h2>
<p class="p en" style="text-align:center; font-size:10pt; margin-top:0.3cm;">${y("northIndian",t)} ${"north-indian"===e.chartType?y("northIndian",t):y("southIndian",t)} — ${e.isPaidTier?y("paid",t):y("basic",t)}</p>
<p class="p en" style="text-align:center; font-size:8pt; margin-top:0.6cm; color:#777;">${new Date().getFullYear()}</p>
${w(1,t)}
`,S=(e,t)=>`
${x(y("birthDetails",t),t,2,e)}
<h1 class="${"en"===t?"en":""}">${y("birthDetails",t)}</h1>
<table class="table-0">
<tr><th>${y("clientName",t)}</th><td>${$(e.clientName)}</td></tr>
<tr><th>${y("birthDetails",t)} - Date</th><td>${$(e.birthDetails.date)}</td></tr>
<tr><th>${y("birthDetails",t)} - Time</th><td>${$(e.birthDetails.time)}</td></tr>
<tr><th>Latitude</th><td>${$(e.birthDetails.latitude)}</td></tr>
<tr><th>Longitude</th><td>${$(e.birthDetails.longitude)}</td></tr>
<tr><th>Timezone</th><td>${$(e.birthDetails.timezone)}</td></tr>
</table>
${w(2,t)}
`,C=(e,t)=>`
${x(y("planetaryPositions",t),t,3,e)}
<h1 class="${"en"===t?"en":""}">${y("planetaryPositions",t)}</h1>
<table class="table-0">
<tr><th>ग्रह/Body</th><th>राशि/Sign</th><th>डिग्री/Degree</th><th>घर/House</th><th>रीत्रो/Retro</th></tr>
${e.planetaryPositions.map(e=>`<tr><td>${$(e.body)}</td><td>${$(e.sign)}</td><td>${$(e.degree)}</td><td>${$(e.house)}</td><td>${e.retro?"✓":"-"}</td></tr>`).join("")}
</table>
${w(3,t)}
`,z=(e,t)=>`
${x(y("houseCusps",t),t,4,e)}
<h1 class="${"en"===t?"en":""}">${y("houseCusps",t)}</h1>
<table class="table-0">
<tr><th>घर/House</th><th>राशि/Sign</th><th>डिग्री/Degree</th></tr>
${e.houseCusps.map(e=>`<tr><td>${$(String(e.house))}</td><td>${$(e.sign)}</td><td>${$(e.degree)}</td></tr>`).join("")}
</table>
${w(4,t)}
`,D=(e,t)=>`
${x(y("dashaPeriods",t),t,5,e)}
<h1 class="${"en"===t?"en":""}">${y("dashaPeriods",t)}</h1>
<table class="table-0">
<tr><th>महादशा/Maha Dasha</th><th>Start Year</th><th>End Year</th><th>Sub Period</th></tr>
${e.dashaPeriods.map(e=>`<tr><td>${$(e.mahaDasha)}</td><td>${$(e.startYear)}</td><td>${$(e.endYear)}</td><td>${$(e.subPeriod||"-")} </td></tr>`).join("")}
</table>
${w(5,t)}
`,I=(e,t)=>`
${x(y("yogas",t),t,6,e)}
<h1 class="${"en"===t?"en":""}">${y("yogas",t)}</h1>
${e.yogas.length?e.yogas.map(e=>`<div style="margin-bottom:0.2cm;"><span class="section-title">${$(e.name)}</span> — <span class="p en">${$(e.description)}</span></div>`).join(""):'<p class="p en">No significant yogas found.</p>'}
${w(6,t)}
`,j=(e,t)=>`
${x(y("remedies",t),t,7,e)}
<h1 class="${"en"===t?"en":""}">${y("remedies",t)}</h1>
<div class="two-col">
${e.remedies.map(e=>`<div style="margin-bottom:0.2cm;"><span class="section-title">${$(e.category)}</span><p class="p en">${$(e.description)}</p></div>`).join("")}
</div>
${w(7,t)}
`,A=(e,t,a,i)=>`
${x(e.domain.charAt(0).toUpperCase()+e.domain.slice(1),i,8+t,a)}
<h1 class="${"en"===i?"en":""}">${e.domain.charAt(0).toUpperCase()+e.domain.slice(1)}</h1>
<h2 class="${"en"===i?"en":""}">${y("domainInsights",i)}:</h2>
<p class="p en">${$(e.prediction)}</p>
<h2 class="${"en"===i?"en":""}">${y("planetaryPositions",i)}:</h2>
<p class="p en">${$(e.analysis)}</p>
${e.timeframe?`<p class="p en" style="font-weight:700;">${$(e.timeframe)}</p>`:""}
${w(8+t,i)}
`,N=(e,t)=>`
${x("कल्पुरुश पुस्तक/Sources",t,13,e)}
<h1 class="${"en"===t?"en":""}">कल्पुरुश पुस्तक / Sources</h1>
${e.kalpurushaPhalDeepikaRefs.map(e=>`<div style="margin-bottom:0.2cm;"><span class="section-title">${$(e.verse)}</span><p class="p en">${$(e.interpretation)}</p></div>`).join("")}
${w(13,t)}
`,T=(e,t)=>`
${x(y("northIndian",t),t,14,e)}
<h1 class="${"en"===t?"en":""}">${y("northIndian",t)} ${y("planetaryPositions",t)}</h1>
<div class="chart-container">${P(e,t,"north")}</div>
${w(14,t)}
`,E=(e,t)=>`
${x(y("southIndian",t),t,15,e)}
<h1 class="${"en"===t?"en":""}">${y("southIndian",t)} ${y("planetaryPositions",t)}</h1>
<div class="chart-container">${P(e,t,"south")}</div>
${w(15,t)}
`,H=(e,t)=>`
${x("गोचर/F Gochar",t,16,e)}
<h1 class="${"en"===t?"en":""}">गोचर / Gochar</h1>
<p class="p en">Transit analysis will be populated from current planetary positions. This section examines gochar effects on the natal chart and timing of results.</p>
${w(16,t)}
`,R=(e,t)=>`
${x("वर्ग/D9",t,17,e)}
<h1 class="${"en"===t?"en":""}">वर्ग / Varga Charts (D-9)</h1>
<p class="p en">Harmonic subdivision charts used for event timing precision. Navamsa chart details will be rendered here for comprehensive prediction.</p>
${w(17,t)}
`,Y=(e,t)=>`
${x("मuhurta/Election",t,18,e)}
<h1 class="${"en"===t?"en":""}">मुहूर्त / Muhurta</h1>
<p class="p en">Electional astrology recommendations for optimal timing of events, based on tithi, nakshatra, yoga, and karana strength.</p>
${w(18,t)}
`,M=(e,t)=>`
${x(y("scorecard",t),t,19,e)}
<h1 class="${"en"===t?"en":""}">${y("scorecard",t)}</h1>
<table class="table-0">
<tr><th>Parameter</th><th>Score</th><th>Details</th></tr>
${e.scorecard.map(e=>`<tr><td>${$(e.parameter)}</td><td><span class="score-text">${e.score}/${e.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${e.score/e.maxScore*100}%"></div></div></td></tr>`).join("")}
</table>
${w(19,t)}
`,X=(e,t)=>`
${x("सारांश/Summary",t,20,e)}
<h1 class="${"en"===t?"en":""}">सारांश / Summary</h1>
<p class="p en">This comprehensive report analyzed the birth chart for ${$(e.clientName)} using ${e.chartType} methodology. Key insights across planetary positions, house cusps, dasha periods, yogas, and domain-specific predictions have been documented.</p>
<p class="p en">Domain insights covered: ${e.domainInsights.map(e=>e.domain).join(", ")}.</p>
<p class="note">Report generated for ${new Date().toLocaleDateString("hi"===t?"hi-IN":"en-US")}.</p>
${w(20,t)}
`,L={hi:{appendix:"परिशिष्ट — जीवन स्तंभ",milestones:"प्रमुख मील के पत्थर",aiNote:"यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।"},en:{appendix:"Appendix — Life Pillars",milestones:"Key Milestones",aiNote:"This chapter is based on AI-assisted Vedic astrology guidance."}},O={positive:"#059669",neutral:"#6b7280",caution:"#d97706"},B=(e,t,a,i)=>{let n="hi"===i?e.titleHi||e.titleEn:e.titleEn||e.titleHi,s="hi"===i?e.narrativeHi||e.narrativeEn:e.narrativeEn||e.narrativeHi,o=L[i],r=21+t,l=e.badges||{},h=[l.score,l.timeframe,l.lord].filter(Boolean);return`
${x(n,i,r,a)}
<p class="note">${$(o.appendix)}</p>
<h1 class="${"en"===i?"en":""}">${$(n)}</h1>
${h.length?`<p class="p"><span class="tag paid">${h.map(e=>$(e)).join('</span> <span class="tag paid">')}</span></p>`:""}
<h2 class="${"en"===i?"en":""}">${y("domainInsights",i)}</h2>
<p class="p${"en"===i?" en":""}" style="font-size:10pt;">${$(s)}</p>
${e.milestones&&e.milestones.length?`
<div class="divider"></div>
<h2 class="${"en"===i?"en":""}">${$(o.milestones)}</h2>
<table class="table-0">
<tr><th>${"hi"===i?"अवधि":"Period"}</th><th>${"hi"===i?"घटना":"Event"}</th><th>${"hi"===i?"टिप्पणी":"Note"}</th></tr>
${e.milestones.map(e=>`<tr><td>${$(e.period)}</td><td>${$(e.event)}${e.outcome?` <span style="color:${O[e.outcome]||"#6b7280"};font-weight:700;">●</span>`:""}</td><td>${$(e.note||"-")}</td></tr>`).join("")}
</table>`:""}
<p class="note">${$(o.aiNote)}</p>
${w(r,i)}
`},F="nodejs",U=60,q="force-dynamic",V=[process.env.CHROME_PATH,process.env.CHROME_EXECUTABLE_PATH,"/usr/bin/google-chrome-stable","/usr/bin/google-chrome","/usr/bin/chromium-browser","/usr/bin/chromium","/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","/Applications/Chromium.app/Contents/MacOS/Chromium"].filter(Boolean);async function G(){try{let{default:e}=await Promise.resolve().then(a.bind(a,35695));return e.setGraphicsMode=!1,{executablePath:await e.executablePath(),args:[...e.args]}}catch(e){console.warn("[kundali/pdf] chromium-min unavailable, falling back to system Chrome:",e)}let{existsSync:e}=await Promise.resolve().then(a.t.bind(a,57147,23));for(let t of V)try{if(e(t))return{executablePath:t,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]}}catch{}throw Error("No Chromium executable available. Set CHROME_PATH or deploy with @sparticuz/chromium-min.")}async function _(e){let t=null;try{let i=await e.json().catch(()=>null);if(!i||"object"!=typeof i)return r.NextResponse.json({error:"A JSON body is required"},{status:400});let n="string"==typeof i.language?i.language.trim().toLowerCase():"en",s="hi"===n?"hi":"en",o=i.reportData;if(!o||"object"!=typeof o||!Array.isArray(o.planetaryPositions))return r.NextResponse.json({error:"A valid reportData payload is required to render the kundli PDF"},{status:400});let l=function(e){let t=e??{},a=e=>Array.isArray(e)?e:[],i=t.birthDetails??{};return{clientName:String(t.clientName??"User"),chartType:String(t.chartType??"North Indian"),birthDetails:{date:String(i.date??""),time:String(i.time??""),latitude:String(i.latitude??""),longitude:String(i.longitude??""),timezone:String(i.timezone??"")},planetaryPositions:a(t.planetaryPositions),houseCusps:a(t.houseCusps),dashaPeriods:a(t.dashaPeriods),yogas:a(t.yogas),remedies:a(t.remedies),domainInsights:a(t.domainInsights),northIndianChartSvg:String(t.northIndianChartSvg??""),kalpurushaPhalDeepikaRefs:a(t.kalpurushaPhalDeepikaRefs),scorecard:a(t.scorecard),isPaidTier:!1!==t.isPaidTier}}(o),h=function(e){if(Array.isArray(e)&&0!==e.length)return e.filter(e=>!!e&&"object"==typeof e).slice(0,8).map((e,t)=>({key:String(e.key??`pillar-${t+1}`),titleEn:String(e.titleEn??""),titleHi:String(e.titleHi??""),badges:e.badges&&"object"==typeof e.badges?{score:String(e.badges.score??""),timeframe:String(e.badges.timeframe??""),lord:String(e.badges.lord??"")}:void 0,narrativeEn:String(e.narrativeEn??""),narrativeHi:String(e.narrativeHi??""),milestones:Array.isArray(e.milestones)?e.milestones.slice(0,4).map(e=>({period:String(e?.period??""),event:String(e?.event??""),note:e?.note?String(e.note):void 0,outcome:e?.outcome==="positive"||e?.outcome==="caution"?e.outcome:"neutral"})):[]}))}(i.pillars),c=function(e,t){let a=[k(e,t),S(e,t),C(e,t),z(e,t),D(e,t),I(e,t),j(e,t)];return e.domainInsights.forEach((i,n)=>a.push(A(i,n,e,t))),a.push(N(e,t)),a.push(T(e,t)),a.push(E(e,t)),a.push(H(e,t)),a.push(R(e,t)),a.push(Y(e,t)),a.push(M(e,t)),a.push(X(e,t)),(e.narratives||[]).forEach((i,n)=>a.push(B(i,n,e,t))),`
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
${b}
</style>
</head>
<body>
${a.join("")}
</body>
</html>
`.trim()}({...l,...h?{narratives:h}:{}},s),d=await Promise.resolve().then(a.bind(a,77250)),{executablePath:p,args:g}=await G();t=await d.launch({args:[...g,"--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu","--font-render-hinting=none"],executablePath:p,headless:!0,defaultViewport:{width:794,height:1123}});let m=await t.newPage();await m.setContent(c,{waitUntil:"load",timeout:3e4}),await m.waitForNetworkIdle({idleTime:400,timeout:12e3}).catch(()=>{});try{await m.evaluateHandle("document.fonts.ready")}catch{}let u=await m.pdf({format:"A4",printBackground:!0,preferCSSPageSize:!0,margin:{top:0,bottom:0,left:0,right:0},timeout:25e3}),f="string"==typeof i.fileName&&i.fileName.trim()||l.clientName||"kundli",$=`${String(f??"").replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48).toLowerCase()||"kundli"}-kundli-${s}.pdf`,x=(c.match(/class="page-container"/g)||[]).length;return new r.NextResponse(new Uint8Array(u),{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${$}"`,"Content-Length":String(u.byteLength),"Cache-Control":"no-store","X-Kundli-Pages":String(x)}})}catch(e){return console.error("[kundali/pdf] PDF generation failed:",e),r.NextResponse.json({error:"Failed to render kundli PDF"},{status:500})}finally{if(t)try{await t.close()}catch(e){console.error("[kundali/pdf] Browser close failed:",e)}}}let K=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/kundali/pdf/route",pathname:"/api/kundali/pdf",filename:"route",bundlePath:"app/api/kundali/pdf/route"},resolvedPagePath:"/Users/seetu/astro-sage-ai-2/app/api/kundali/pdf/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:J,staticGenerationAsyncStorage:Q,serverHooks:W}=K,Z="/api/kundali/pdf/route";function ee(){return(0,o.patchFetch)({serverHooks:W,staticGenerationAsyncStorage:Q})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[8948,5972,4749],()=>a(79892));module.exports=i})();