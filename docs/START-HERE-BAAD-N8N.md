# START HERE — BAAD n8n Editorial Automation

_Last updated: 2026-06-19_

## Purpose of this repo

This repo stores BAAD n8n workflow exports, workflow documentation, Notion helper scripts, and editorial automation notes for Black Art & Design.

BAAD — Black Art & Design — is an editorial and discovery platform focused on Black artists, designers, exhibitions, galleries, cultural news, interviews, design stories, and editorial features.

This repo should be treated as the source of truth for archived n8n workflow states and technical documentation.

## Working style

Before making new changes:

1. Inspect the current repo state.
2. Check the latest workflow archive and docs.
3. Avoid duplicating workflow branches that already exist.
4. Make small controlled changes.
5. Test one path at a time.
6. Export the working n8n workflow.
7. Archive it in `/workflows` with a clear dated filename.
8. Commit and push to GitHub.
9. Document important decisions in repo docs and/or Notion.

Do not casually rebuild workflows from scratch. Do not assume a node is missing until the current exported workflow has been inspected.

## Main local path

```bash
/Users/blackartdesign/Downloads/baad-n8n
```

## GitHub repo

```text
https://github.com/BAADman-create/baad-n8n.git
```

## First repo-state check

Every new chat or major session should begin with:

```bash
cd /Users/blackartdesign/Downloads/baad-n8n

git status
ls -la docs
ls -la workflows | tail -20
ls -la scripts/notion
git log -5 --oneline
```

## Current main workflow

Current workflow name:

```text
Generate BAAD Draft – Blueprint Test
```

This workflow generates BAAD editorial drafts from Airtable Article records using:

- Article source data
- Source Packets
- optional Source Article Analysis
- optional BAAD Style Blueprint
- optional Closing Paragraph Info
- OpenAI draft generation
- first validation
- conditional repair branch
- polish branch
- final validation
- compact Airtable-safe payload
- Airtable update

## Current confirmed working checkpoint

See:

```text
docs/generate-baad-draft-checkpoint-2026-06-19.md
```

Confirmed working:

- Source Packet lookup works.
- Source Packet prompt context works.
- Empty Source Analysis fallback works.
- Design fallback blueprint works.
- First validation passes with Source Packets.
- IF Draft Needs Repair? correctly skips repair when validation passes.
- Polish prompt uses neutral "current validated draft" wording.
- Artist-specific polish examples were removed/generalised.
- Polish BAAD Draft returns valid JSON.
- Parse Polished Draft JSON works.
- Validate Polished Draft Against BAAD Standards passes.
- IF Polished Draft Passes? routes correctly.
- Final Clean Draft Fields outputs compact Airtable-safe payload.
- Update Article with BAAD Draft writes back to Airtable correctly.
- Generate Draft? is unchecked after successful update.

## Latest stable workflow archives

Most important current archives:

```text
workflows/generate-baad-draft-blueprint-test-source-packets-polish-validation-working-2026-06-18.json
workflows/generate-baad-draft-blueprint-test-polish-prompt-cleanup-working-2026-06-19.json
```

Latest stable version after polish prompt cleanup:

```text
workflows/generate-baad-draft-blueprint-test-polish-prompt-cleanup-working-2026-06-19.json
```

Important commits:

```text
304222c Archive generate draft source packet polish validation workflow
4dc1033 Archive generate draft polish prompt cleanup workflow
7dab12d Document generate draft workflow checkpoint
ca43cd3 Add Notion BAAD editorial desk documentation script
```

## Tested article

The successful tested article was:

```text
Yinka Ilori — Joy Through Resistance
Airtable Article ID: recox39UXZK7pdkJc
```

This test confirmed the pass route:

```text
validation pass
→ skip repair
→ polish
→ parse
→ validate polished draft
→ final clean payload
→ Airtable update
```

## Important workflow routing

The repair gate is important.

Expected pass route:

```text
Validate Draft Against BAAD Standards
→ IF Draft Needs Repair? = false
→ Build Polish Prompt
→ Polish BAAD Draft
→ Parse Polished Draft JSON
→ Validate Polished Draft Against BAAD Standards
→ IF Polished Draft Passes?
→ Final Clean Draft Fields
→ Update Article with BAAD Draft
```

Expected repair route:

```text
Validate Draft Against BAAD Standards
→ IF Draft Needs Repair? = true
→ Repair Draft with OpenAI
→ Parse Repaired LLM JSON
→ Validate Repaired Draft Against BAAD Standards
→ IF Repaired Draft Passes?
→ Build Polish Prompt
→ Polish BAAD Draft
→ Parse Polished Draft JSON
→ Validate Polished Draft Against BAAD Standards
→ IF Polished Draft Passes?
→ Final Clean Draft Fields
→ Update Article with BAAD Draft
```

The pass route has been tested. The repair route still needs intentional controlled testing.

## Immediate follow-up tasks

### 1. Intentionally test the repair branch

Reason: the pass route is confirmed, but the fail → repair → validate → polish route still needs deliberate validation.

Important safety note: do not casually let a controlled failing test update a production Airtable article. Stop before the final Airtable update unless the test article and payload are confirmed safe.

### 2. Reduce duplicated source/context counted by validation

Reason: `sourceWordCount` can still be inflated because Source Packets, prompt context, Article Sources, and copied context can overlap.

This is not currently blocking draft generation, but it affects diagnostic clarity.

### 3. Review OpenAI node settings

Reason: model choice, temperature, JSON/output format, and system/user message structure may improve consistency.

Review OpenAI settings before scaling the workflow.

### 4. Tighten Source Packet lookup formula

Reason: production lookup should include stronger guardrails such as `Ready to Generate Draft?` and `Human Review Needed?` checks.

### 5. Decide Airtable-to-Strapi publishing flow

Reason: Airtable draft generation is now stable enough to plan the next publishing workflow decision.

Key question: should successful BAAD drafts push automatically to Strapi, or should Airtable manual approval remain the gate?

## Related Strapi publishing workflow docs

See:

```text
docs/editorial-automation/custom-strapi-draft-upsert-workflow-2026-06-17.md
docs/editorial-automation/push-article-draft-to-strapi-2026-06-17.md
```

Related workflow archives include:

```text
workflows/push-article-draft-to-strapi-draft-safe-working-2026-06-17.json
workflows/push-article-draft-to-strapi-documentid-first-2026-06-17.json
workflows/push-article-draft-to-strapi-custom-upsert-working-2026-06-17.json
workflows/push-article-draft-to-strapi-custom-upsert-error-handling-working-2026-06-17.json
```

## Airtable IDs

Base:

```text
app8xeAssDR2qaNAC
```

Tables:

```text
Articles: tblF0ghefGC2Bzh9K
Article Sources: tblDnpg82CcOvwXue
Source Article Analysis: tblYUDKQuOTnOhHSk
BAAD Source Packets: tblSqHcS5tsj6oBha
BAAD Closing Paragraph Info: tblVHzgOLEz6WD9x6
BAAD Style Blueprints: tbl91hXyzUz61ZLvg
```

## Notion Editorial Intelligence HQ

Notion is used as the editorial strategy and intelligence layer.

Important script:

```text
scripts/notion/create-baad-editorial-desk-hq.mjs
```

This script created the BAAD Editorial Desk documentation structure under Notion.

Main Notion page:

```text
BAAD Article Generation as an Editorial Desk
```

Child strategy pages:

```text
Source Packet Desk
Source Article Analysis Desk
BAAD Style Blueprints
BAAD Style References
BAAD Voice and Standards
Editorial Quality Scoring
```

Earlier Notion databases:

```text
01 Source-Analysis Scenario Guide
Database ID: 37e16598-b06e-8150-aac8-de827657a23b

02 Editorial Rules Library
Database ID: 37e16598-b06e-8168-9c85-d346ba2a7128
```

## Editorial Intelligence direction

The next major quality-development track is the BAAD Editorial Intelligence Layer.

The goal is to make BAAD article generation work like an editorial desk, not a simple source-in/article-out machine.

Core layers:

1. Source Packet Desk  
   Turns raw sources into verified facts, quote candidates, avoid-copying notes, source meaning to recast, source reliability, copying risk, and editorial use notes.

2. Source Article Analysis Desk  
   Reads the source like an editor and decides article type, source strength, primary BAAD angle, opening strategy, must-preserve facts, risks, and recommended blueprint.

3. BAAD Style Blueprints  
   Defines repeatable article shapes such as:
   - BAAD Short Visual Design Spotlight
   - BAAD Exhibition Announcement
   - BAAD Artist Practice Spotlight
   - BAAD Interview-Derived Feature
   - BAAD Community-Based Public Art Environment
   - BAAD Group Exhibition with BAAD-Anchor Artist
   - BAAD Compact News Brief
   - BAAD Restitution/Repatriation Story

4. BAAD Style References  
   Extracts reusable editorial lessons from strong articles without copying them.

5. BAAD Voice and Standards  
   Central tone and quality guide:
   - clear
   - precise
   - visually attentive
   - culturally literate
   - serious but accessible
   - grounded in source evidence
   - editorial rather than promotional
   - avoids generic artspeak
   - avoids inflated praise
   - avoids unsupported reputation claims
   - avoids copied source rhythm

6. Editorial Quality Scoring  
   Evaluates drafts for:
   - opening strength
   - BAAD tone
   - paragraph flow
   - quote handling
   - title/dek clarity
   - copying risk
   - press-release feel
   - cultural/editorial depth
   - human review need

## Rule for future chats

Do not repeat completed work.

Start by inspecting repo state and current archived workflow files. Then choose the smallest safe next step.
