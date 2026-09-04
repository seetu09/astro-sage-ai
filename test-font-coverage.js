const path = require('path');
const { renderPdfFromHtml } = require('html-pdf-lite');
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

// Simulates the real report structure: mixed English + Hindi text.
const html = `
<html><head><style>
body { font-family: 'Mukta', sans-serif; font-size: 11pt; color: #1a1a2e; }
h2 { color: #6c63ff; font-size: 18px; page-break-before: always; }
table { width: 100%; border-collapse: collapse; font-size: 10px; }
th { background: #f0f0f5; padding: 4px 6px; border: 1px solid #d0d0d8; text-align: left; }
td { padding: 4px 6px; border: 1px solid #d0d0d8; }
.pill { display: inline-block; background: #6c63ff; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-size: 10px; }
.hi { color: #2e7d32; }
</style></head><body>
<p class="pill">PREMIUM REPORT</p>
<h2>Planet Positions | ग्रह स्थिति</h2>
<table>
<tr><th>Planet</th><th>Sign</th><th>Degree</th></tr>
<tr><td>Sun</td><td>Taurus</td><td>15° 44'</td></tr>
<tr><td>मंगल (Mars)</td><td>सिंह (Leo)</td><td>22° 03'</td></tr>
</table>
<p>English narrative: Career growth indicated by Jupiter in the 10th house.</p>
<p class="hi">हिन्दी विवरण: दशम भाव में गुरु से करियर में उन्नति होगी। साढ़े साती 2023-2025 में।</p>
<p>Bullets: • Point one • Point two — with ₹ symbol and 25° degree.</p>
<h2>Page 2</h2>
<p>Content on page two.</p>
</body></html>`;

(async () => {
  const t0 = Date.now();
  const buf = await renderPdfFromHtml(html, {
    margins: { top: 24, right: 24, bottom: 24, left: 24 },
    fonts: {
      Mukta: {
        regular: path.join(FONTS_DIR, 'Mukta-Regular.ttf'),
        bold: path.join(FONTS_DIR, 'Mukta-Bold.ttf'),
      },
    },
    autoResolveEmojiFont: false,
  });
  console.log('PDF bytes:', buf.length, 'in', Date.now() - t0, 'ms');
  console.log('is PDF:', buf.slice(0, 5).toString() === '%PDF-');
  require('fs').writeFileSync('test-out.pdf', buf);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
