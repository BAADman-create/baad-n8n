# Generate BAAD Draft Workflow Checkpoint — 2026-06-19

## Workflow
Generate BAAD Draft – Blueprint Test

## Confirmed working
- Source Packet lookup works.
- Source Packet prompt context works.
- Empty Source Analysis fallback works.
- Design fallback blueprint works.
- First validation passes with Source Packets.
- IF Draft Needs Repair? correctly skips repair when validation passes.
- Polish prompt uses neutral "current validated draft" wording.
- Kim Dacres-specific polish examples were removed/generalised.
- Polish BAAD Draft returns valid JSON.
- Parse Polished Draft JSON works.
- Validate Polished Draft Against BAAD Standards passes.
- IF Polished Draft Passes? routes correctly.
- Final Clean Draft Fields outputs compact Airtable-safe payload.
- Update Article with BAAD Draft writes back to Airtable correctly.
- Generate Draft? is unchecked after successful update.

## Tested article
Yinka Ilori — Joy Through Resistance
Airtable Article ID: recox39UXZK7pdkJc

## Archived workflow versions
1. workflows/generate-baad-draft-blueprint-test-source-packets-polish-validation-working-2026-06-18.json
   Commit: 304222c
   Purpose: Stable version after Source Packets, validation, repair gate, polish, final clean payload, and Airtable update worked.

2. workflows/generate-baad-draft-blueprint-test-polish-prompt-cleanup-working-2026-06-19.json
   Commit: 4dc1033
   Purpose: Stable version after cleaning the Polish prompt wording and removing artist-specific polish examples.

## Follow-up tasks
1. Intentionally test the repair branch with a failing draft.
   Reason: The pass route is confirmed, but the fail → repair → validate → polish route still needs deliberate testing.

2. Reduce duplicated source/context text counted by validation.
   Reason: sourceWordCount can still be inflated because Source Packets, prompt context, Article Sources, and copied context can overlap.

3. Review OpenAI node settings.
   Reason: Model choice, temperature, JSON/output format, and system/user message structure may improve consistency.

4. Tighten Source Packet lookup formula.
   Reason: Production lookup should include Ready to Generate Draft? and Human Review Needed? guardrails.

5. Decide whether to push successful BAAD drafts to Strapi automatically or keep Airtable manual approval first.
   Reason: Airtable draft generation is stable enough to support the next publishing workflow decision.
