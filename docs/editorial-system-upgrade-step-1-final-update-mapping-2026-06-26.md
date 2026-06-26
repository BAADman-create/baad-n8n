# BAAD Editorial System Upgrade — Step 1: Final Update Mapping Fix

Date: 2026-06-26

## Purpose

This document records Step 1 of the BAAD editorial system upgrade roadmap.

The goal of Step 1 is to fix final workflow reliability issues before adding new editorial intelligence layers such as Reference Article Structures, Article Structure Planning, Source-Language Overlap Check, and Editorial Rhythm Check.

## Workflow Patched

Input workflow archive:

`workflows/generate-baad-draft-blueprint-test-manual-blueprint-override-candidate-2026-06-23-colossal-closing-rules.json`

New patched workflow archive:

`workflows/generate-baad-draft-blueprint-test-manual-blueprint-override-candidate-2026-06-26-final-update-mapping-fix.json`

## Problems Found

The David Uzochukwu Photography / Visual Culture blueprint test passed validation and wrote the draft to Airtable, but three reliability issues were found:

1. `Generate Draft?` stayed checked after successful draft generation.
2. `BAAD Tags` stayed blank even though the workflow output tags were `Photography` and `Black Diaspora`.
3. `sourcePacketsApplied` / `sourcePacketsCount` reporting weakened in downstream validation/polish stages because `Build Draft Prompt` used a lightweight `promptContext` containing `sourcePacketsSummary`, while later nodes expected `promptContext.sourcePackets`.

## Fixes Applied

### 1. Clear Generate Draft?

The final Airtable update node `Update Article with BAAD Draft` now maps:

`Generate Draft?` → `={{ false }}`

This prevents successfully generated articles from being picked up again by the queue.

### 2. Save BAAD Tags

The final Airtable update node now maps:

`BAAD Tags` → `={{ Array.isArray($json.baad_tags) ? $json.baad_tags : [] }}`

The field was present in the node schema but marked as removed. The patch reactivated it in the schema.

### 3. Preserve Source Packet Reporting Metadata

`Build Draft Prompt` now returns `promptContext` with a compatibility layer:

`sourcePackets: contextForPromptJson.sourcePacketsSummary`

This keeps the OpenAI prompt lightweight while allowing downstream validators and polish/reporting nodes to read:

- `promptContext.sourcePackets.sourcePacketsApplied`
- `promptContext.sourcePackets.sourcePacketsCount`

## Why This Matters

This step improves trust in the workflow.

After a successful run, the Airtable record should clearly show:

- `Review Status` = `Draft Generated`
- `Generate Draft?` = unchecked / false
- `BAAD Tags` saved where supported
- `Final BAAD Blueprint Used` mapped
- `Last Error` and `Last Error Step` cleared
- Source Packet reporting metadata preserved downstream

## Next Test

Import the patched workflow archive into n8n as a candidate workflow and run a controlled test article.

Recommended test:
- Use a duplicate or safe test article.
- Confirm final Airtable fields after success:
  - `Review Status`
  - `Generate Draft?`
  - `BAAD Tags`
  - `Final BAAD Blueprint Used`
  - `Last Error`
  - `Last Error Step`
  - source packet metadata in node output

## Broader Editorial System Roadmap

Step 1 — Fix final workflow reliability  
Step 2 — Create Reference Article Structures table/system  
Step 3 — Add first examined reference structures  
Step 4 — Add Article Structure Plan before draft generation  
Step 5 — Add Source-Language Overlap Check  
Step 6 — Add Editorial Rhythm Check  
Step 7 — Add automatic Notion Working Notes for complex articles  

