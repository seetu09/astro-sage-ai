# Changelog

## [Unreleased]

### Added
- **Artifact recommendation engine** — lib/artifactRecommender.ts (pure, tested, never throws).
- **Artifact catalog** — data/artifacts.json with doshaAliases and priority ranking.
- **Recommendation card** — app/components/ArtifactRecommendations.tsx (quiet, bilingual, dark-mode aware).
- **Report integration** — Suggestions render inside the Remedial Measures section of KundliReport.tsx, gated on active doshas.
- **Store pages** — /store catalog and /store/[id] product detail.
- **Admin editor** — /admin/artifacts with ADMIN_PASSWORD-gated GET/PUT API.
- **Analytics events** — artifact_impression, artifact_click, store_view.

### Fixed
- **Dark-mode contrast** — .report-root ink made theme-aware; global text fallback added in globals.css.
- **Hero heading layout** — Devanagari line-height and vertical padding corrected in HeroSection.tsx.

### Notes
- Recommender caps at 2 suggestions per report by design (subtle guidance, not a catalog).
- Recommendations are silent for dosha-free charts — the section renders nothing.
- See README.md → Roadmap for re-entry criteria before continuing to checkout wiring.
