# BAAD Article Structure / Meaning Map Checkpoint — 2026-06-24

## Purpose

The Article Structure / Meaning Map is a new editorial intelligence layer for BAAD. It stores how a source or reference article works structurally before BAAD generates a draft.

It helps BAAD decide:

- what kind of article the source should become
- how the article should open
- what movement pattern it should follow
- what BAAD writing lesson should guide the draft
- which BAAD Style Blueprint should be recommended

This layer sits between Source Article Analysis and Blueprint Selection.

## Airtable base

Base ID: `app8xeAssDR2qaNAC`

## New Airtable table

Table name: `Article Structure / Meaning Map`  
Table ID: `tblduBAnzQTEQuPfw`

## Fields created

- Structure Map Name
- Style Reference
- Article
- Source / Publication
- Source URL
- Story Family
- Recommended Opening Type
- Recommended Blueprint Label
- Recommended BAAD Blueprint
- Primary Focus
- Secondary Focus
- Movement Pattern
- Paragraph Map
- Sentence Purpose Map
- Opening Instruction
- BAAD Writing Lesson
- Review Note
- Language Guidance
- Language to Avoid / Use Carefully
- Confidence
- Analysis Status
- Human Reviewed?
- Ready for Prompt Use?
- Structure Map JSON

## BAAD Style Blueprints table

Table name: `BAAD Style Blueprints`  
Table ID: `tbl91hXyzUz61ZLvg`

## Existing blueprint records

- `rec7AatEnRtWcPSje` — BAAD Short Visual Art Spotlight — complete
- `recuScFkhf9NDOm4Y` — BAAD Short Visual Design Spotlight — complete
- `recQNbTBwMaQjcCeT` — BAAD Public Art / Installation Spotlight — Active

## New draft placeholder blueprint records

These were created as Draft placeholders for future Meaning Map integration. They should not be used in live generation until reviewed.

- `recUDjo8YRnHlUpnN` — Exhibition / Project Spotlight — Draft
- `recPwhJEuAe7YjGQg` — Artist Practice Spotlight — Draft
- `reci6I7yGzlsrT5O0` — Architecture / Space Article — Draft
- `recf8B54P2oS3PcHY` — Photography / Visual Culture Article — Draft
- `rech2RR9EvXS31NdK` — Group Exhibition with BAAD-Anchor Artist — Draft
- `recr9V01OxXgwQyiN` — Legacy / Historical Artist Exhibition — Draft
- `recAWNj3rAr0j96vk` — Book / Archive Article — Draft
- `recDwtlSpNP65uj1b` — Film / Moving Image Article — Draft
- `reccV4wyYt2XPA6Vj` — Compact News Brief — Draft

## Imported Colossal Meaning Map records

15 final human-reviewed Colossal records were imported.

All imported records currently have:

- Analysis Status: `Human Reviewed`
- Human Reviewed?: checked
- Ready for Prompt Use?: unchecked

This is intentional. They are reviewed but not yet enabled for workflow prompt use.

## Imported records

- `recd7tJOELdv2gbXk` — Mirei Monticelli — Design / object article
- `recN9ZsrAOocARFwa` — Kristof Santy — Artist-practice / painting article
- `recr7mBhK6hBUjWas` — Willie Cole — Material/object-led visual art article
- `rec06DhHrr2isE45H` — Xie Lei — Artist-practice / painting article
- `reclreTFFu82TGZSw` — Astek wallpapers — Design / object article
- `recmrRRxK6V6IsDV0` — Jean Shin — Public art / installation article
- `recmdY6teFf8xlVHt` — Marc Fornes — Architecture / space article
- `recMjpsiCGvjAh2ZI` — Annalise Neil — Nature / ecology visual article
- `recZOdHURIHDg32wP` — David Altrath / Grundtvigs Kirke — Photography / place article
- `recFdmb7jGlmnyYJV` — Nasher Museum — Group exhibition article
- `rec9qnR1CKcgGMFe7` — Leonora Carrington — Legacy / historical artist article
- `recjPv50M1AgKsuJ3` — Jongjin Park — Material/object-led visual art article
- `recvH3HuTE1bNLvct` — Marisa Aragón Ware — Nature / ecology visual article
- `recxO1EEda8llJrO5` — Trung Tran Studio — Architecture / space article
- `recLDC8iGsG7SOLaW` — Meggan Joy — Nature / ecology visual article

## Source files

Final review files:

- `outputs/colossal-controlled-vocabulary-final-editorial-review-2026-06-24.md`
- `outputs/colossal-controlled-vocabulary-final-editorial-review-2026-06-24.json`

Earlier supporting files:

- `outputs/colossal-structure-meaning-map-2026-06-24.json`
- `outputs/colossal-structure-meaning-map-2026-06-24.csv`
- `outputs/colossal-structure-meaning-map-editorial-review-2026-06-24.md`
- `outputs/colossal-controlled-vocabulary-review-2026-06-24.md`
- `outputs/colossal-controlled-vocabulary-review-corrected-2026-06-24.md`

## Current safety rule

Do not wire Article Structure / Meaning Map into the live Generate BAAD Draft workflow yet.

Next safe steps:

1. Commit this checkpoint.
2. Decide whether to create a small test-only workflow branch that reads Article Structure / Meaning Map.
3. Only mark selected Meaning Map records as Ready for Prompt Use after blueprint behaviour has been tested.
4. Draft placeholder blueprints must be reviewed before live production use.
