/**
 * scripts/check-i18n.mjs
 * ----------------------
 * i18n regression guard. Run via `npm run check:i18n`.
 *
 * Verifies three invariants that previously regressed:
 *   1. PARITY   — every string leaf in the EN dictionary has a non-empty HI
 *                value that differs from EN (fails when Hindi was copy-pasted
 *                English, e.g. the old tarot / horoscope / horoscopeSign blocks).
 *   2. USAGE    — every global `t('dotted.key')` / `translate('...')` /
 *                `getTranslation(...)` call site resolves to a real leaf in BOTH
 *                languages (fails on typo'd keys like `careerTimings`).
 *                Per-section `const t = (en, hi) => ...` tuple helpers are
 *                auto-detected and excluded from this check.
 *   3. FORBIDDEN — no component reads/writes the language from localStorage;
 *                the toggle must always flow through LanguageContext.
 *
 * Exit code 0 = all green, 1 = violations found.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const TRANSLATIONS_FILE = "lib/i18n/translations.ts";
const SCAN_DIRS = ["app", "lib"];

// ---------------------------------------------------------------------------
// 1. Load the translations object by compiling translations.ts in isolation.
// ---------------------------------------------------------------------------
const outDir = join(tmpdir(), `i18n-check-${process.pid}`);
execFileSync(
  "npx",
  [
    "tsc",
    TRANSLATIONS_FILE,
    "--outDir", outDir,
    "--module", "es2020",
    "--moduleResolution", "node",
    "--target", "es2020",
    "--skipLibCheck",
    "--esModuleInterop",
    "--isolatedModules",
  ],
  { stdio: "pipe", cwd: ROOT }
);
const { translations } = await import(`file://${outDir}/translations.js`);

// Flatten a nested dict into dotted-path → leaf-value (skips arrays/objects).
function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}
const en = flatten(translations.en);
const hi = flatten(translations.hi);

// ---------------------------------------------------------------------------
// Helpers for scanning source files.
// ---------------------------------------------------------------------------
function filesIn(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesIn(p));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}
const allFiles = SCAN_DIRS.flatMap((d) => filesIn(join(ROOT, d)));

// A file-local bilingual tuple helper: `const t = (en, hi) => ...`.
// Files that define this MUST NOT be treated as dictionary call-sites for `t()`.
const LOCAL_TUPLE_RE = /const\s+t\s*=\s*\([^)]*\)\s*=>/;

let violations = 0;
const fail = (m) => { console.error("  \u2717 " + m); violations++; };

// Keys whose hi value is intentionally identical to en (locale-invariant data).
const INVARIANT_KEYS = new Set([
  "hero.trending",
  "language.en", "language.hi",
  "auth.placeholderPhone", "auth.placeholderOtp",
  "kundali.emailPlaceholder", "kundali.istTimezone",
  "contact.info.email", "contact.info.phone",
]);

// ---------------------------------------------------------------------------
// 2. PARITY — en leaves must have a non-empty, non-identical hi value.
// ---------------------------------------------------------------------------
console.log("Checking en\u2192hi parity (%d leaves)...", Object.keys(en).length);
for (const key of Object.keys(en)) {
  if (INVARIANT_KEYS.has(key)) continue;
  const ev = en[key];
  if (typeof ev !== "string") continue; // arrays / objects handled elsewhere
  const hv = hi[key];
  if (!(key in hi)) { fail(`hi missing key: ${key}`); continue; }
  if (typeof hv !== "string" || hv.trim() === "") { fail(`hi empty value: ${key}`); }
  else if (hv === ev) { fail(`hi is copy of en (not translated): ${key} = "${ev}"`); }
}

// ---------------------------------------------------------------------------
// 3. USAGE — global call-site keys must resolve in both languages.
//   - `t('key')` and `translate('key')` are global dictionary lookups.
//   - `getTranslation(lang, 'key')` is a global lookup (key is 2nd arg).
//   - A per-section `const t = (en, hi) => ...` tuple helper is auto-detected
//     and its two-argument `t('en','hi')` calls are NOT dictionary lookups.
// ---------------------------------------------------------------------------
const T_CALL_RE = /(?:[^.$\w]|^)t\s*\(\s*(?:'([^']+)'|"([^"]+)")/g; // t('key') / t("key")
const TRANSLATE_RE = /\btranslate\s*\(\s*(?:'([^']+)'|"([^"]+)")/g;
const GETTRANSL_RE = /\bgetTranslation\s*\(\s*[^,;)]*,\s*(?:'([^']+)'|"([^"]+)")/g;

const usageByFile = {};
for (const f of allFiles) {
  const rel = relative(ROOT, f).split(sep).join("/");
  const src = readFileSync(f, "utf8");
  const isLocalTuple = LOCAL_TUPLE_RE.test(src);
  const local = new Set();
  let m;
  if (!isLocalTuple) {
    // Global `t('key')` / `translate('key')` lookups.
    while ((m = T_CALL_RE.exec(src)) !== null) {
      const key = m[1] || m[2];
      if (key && /^\w[\w.]*$/.test(key)) local.add(key);
    }
    while ((m = TRANSLATE_RE.exec(src)) !== null) {
      const key = m[1] || m[2];
      if (key && /^\w[\w.]*$/.test(key)) local.add(key);
    }
  }
  // getTranslation is always a global lookup regardless of local t().
  while ((m = GETTRANSL_RE.exec(src)) !== null) {
    const key = m[1] || m[2];
    if (key && /^\w[\w.]*$/.test(key)) local.add(key);
  }
  if (local.size) usageByFile[rel] = [...local];
}
for (const [rel, keys] of Object.entries(usageByFile)) {
  for (const k of keys) {
    if (!en[k]) fail(`call-site key not in EN dictionary: ${k}  (${rel})`);
    if (!hi[k]) fail(`call-site key not in HI dictionary: ${k}  (${rel})`);
  }
}

// ---------------------------------------------------------------------------
// 4. FORBIDDEN — direct language localStorage (toggle must use the context).
// ---------------------------------------------------------------------------
const ALLOWED_LOCALSTORAGE_FILES = new Set([
  "lib/i18n/index.ts",
  "app/context/LanguageContext.tsx",
  "app/lib/i18n/useTranslation.ts",
]);
const LANG_LS_RE = /localStorage\.(getItem|setItem)\s*\(\s*['"]astroveda-language['"]/g;
for (const f of allFiles) {
  const rel = relative(ROOT, f).split(sep).join("/");
  if (ALLOWED_LOCALSTORAGE_FILES.has(rel)) continue;
  const src = readFileSync(f, "utf8");
  if (src.match(LANG_LS_RE)) fail(`direct language localStorage access outside provider: ${rel}`);
}

// ---------------------------------------------------------------------------
console.log("\nSummary: %d violation(s)", violations);
if (violations > 0) {
  console.error("\n\u274c i18n check FAILED. Fix the issues above.");
  process.exit(1);
} else {
  console.log("\n\u2705 i18n check passed: parity green, all call-site keys resolve, no forbidden reads.");
  process.exit(0);
}
