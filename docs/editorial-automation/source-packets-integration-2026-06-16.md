# BAAD Source Packets Integration — Generate BAAD Draft Workflow

Date: 2026-06-16  
Workflow: `Generate BAAD Draft – Blueprint Test`  
Status: Working end-to-end test completed

## Summary

This update adds `BAAD Source Packets` into the BAAD draft-generation workflow as an approved evidence layer.

Source Packets sit between raw source material and the OpenAI draft prompt. They allow BAAD to use stronger verified context without pushing uncontrolled raw source text directly into the prompt.

The first successful end-to-end test used the Kim Dacres article record and a Source Packet created from the Charles Moffett press release for *Lost on a Two Way Street*.

## Why Source Packets Matter

The previous workflow could generate usable BAAD drafts from a short origin article, but thin origin articles often limited editorial depth.

Source Packets improve drafts by adding approved verified facts, prompt-ready extracts, editorial-use notes, avoid-copying notes, quote-use notes, source reliability, rights/copying risk, and source meaning to recast.

This lets BAAD drafts become more specific while reducing the risk of copying press releases or overusing the origin article’s language.

## Airtable Tables

### Articles

Table ID: `tblF0ghefGC2Bzh9K`

The Article record remains the main editorial queue item. It stores source text, source analysis, linked closing info, linked Article Sources, linked Source Packets, generated BAAD fields, review status, and error/status fields.

### BAAD Source Packets

Table ID: `tblSqHcS5tsj6oBha`

The Source Packet table stores approved, prompt-ready evidence.

Important fields used by the workflow include:

- `Source Packet Name`
- `Article`
- `Source Record`
- `Source Type`
- `Source Publisher`
- `Source Title`
- `Source URL`
- `Prompt-Ready Extract`
- `Verified Facts`
- `Quote Use Notes`
- `Source Meaning to Recast`
- `Avoid Copying Notes`
- `Editorial Use Notes`
- `Draft Use Priority`
- `Use in Draft?`
- `Avoid Copying?`
- `Source Reliability`
- `Rights / Copying Risk`
- `Processing Status`
- `Article Record ID`
- `Source Record ID`

The helper field `Article Record ID` is used for reliable Airtable filtering.

## Workflow Nodes Added

### 1. Prepare Source Packet Lookup

Purpose: preserve the correct Airtable Article record ID before searching Source Packets.

Important fix: `$json.id` can sometimes refer to another Airtable record, such as the Style Blueprint record. The workflow therefore uses Article-specific fields first.

Output field: `sourcePacketArticleId`

For the Kim Dacres test, this value was `reciLPjxWQXSBAEyq`.

### 2. Get BAAD Source Packets

Airtable action: `Search records`  
Table: `BAAD Source Packets`

Working filter formula:

`AND({Article Record ID} = '{{ $json.sourcePacketArticleId }}', {Use in Draft?} = 1, {Processing Status} = 'Approved')`

Settings:

- Return All: true
- Always Output Data: true

Successful test returned `rectD0lIIHxpV36aL`, the Kim Dacres — Charles Moffett Press Release Source Packet.

### 3. Attach Source Packets to Draft Context

Purpose: combine the original draft context with approved Source Packet records.

Output fields added:

- `sourcePacketsApplied`
- `sourcePacketsCount`
- `sourcePackets`
- `sourcePacketsForPrompt`

Successful test output:

- `sourcePacketsApplied: true`
- `sourcePacketsCount: 1`

### 4. Build Draft Prompt

`Build Draft Prompt` now includes Source Packet context.

The prompt now contains an `APPROVED BAAD SOURCE PACKETS` section and `SOURCE PACKET RULES`.

The prompt instructs OpenAI to use Source Packets as verified supporting context while avoiding direct copying, press-release cadence, and unsupported additions.

## Confirmed End-to-End Route

The successful route was:

Article → Source Analysis → Style Blueprint → Closing Info → Prepare Source Packet Lookup → Get BAAD Source Packets → Attach Source Packets to Draft Context → Build Draft Prompt → OpenAI Generate BAAD Draft → Parse LLM JSON → Validate Draft Against BAAD Standards → Repair Draft with OpenAI → Parse Repaired LLM JSON → Validate Repaired Draft Against BAAD Standards → IF Repaired Draft Passes? → Build Polish Prompt → Polish BAAD Draft → Parse Polished Draft JSON → Validate Polished Draft Again → Final Clean Draft Fields → Update Article with BAAD Draft

## Successful Test Record

Article ID: `reciLPjxWQXSBAEyq`  
Article title: `Kim Dacres — Lost on a Two Way Street`  
Source Packet ID: `rectD0lIIHxpV36aL`  
Article Source ID: `rec4me5KDT9kKpUR5`  
Final BAAD title: `Kim Dacres Reworks Worn Rubber into Portraits of Presence`

Final Airtable result:

- `Review Status = Draft Generated`
- `Source Quality Status = Pass`
- `Body (BAAD Draft) = populated with polished version`
- `Last Error = blank`
- `Last Error Step = blank`

## Editorial Improvement Confirmed

The Source Packet added richer verified context, including Dacres as a first-generation American sculptor of Jamaican descent, Harlem and Bronx context, second solo show with Charles Moffett, *Crossroads Like This*, named works, *Forget Me Nots*, custom stained oak plinths, Stevie Wonder’s *As*, *Flaggish*, Jelani Cobb’s lecture, and conditional citizenship / national symbolism.

The final draft avoided the most risky press-release phrases, including “relentless assault on universal rights to life and liberty,” “flash in distress and cry out,” and “diversity, elegance, and vibrancy of uptown urban life.”

## Known Follow-Up Issues

### 1. Main Article Source URL can be blank

In the prompt context, the main source object still showed `source.sourceUrl: ""`.

This happened because the original Article record’s `Source URL` field was empty.

The Source Packet contained the Charles Moffett URL, so this did not block the test.

Later fix:

- update the Airtable form / Article creation workflow so `Source URL` is saved into Articles
- backfill existing blank Article `Source URL` fields from linked Article Sources or Source Packets

### 2. Tighten reputation / duration / status phrase validation

The draft and repair stages initially allowed “has long used rubber and metal from recycled tires as her primary medium.”

The polish stage removed “has long used,” but the final article still included “uses rubber and metal from recycled tires as her primary medium.”

This is safer, but later the validator and/or polish prompt should restrict status phrases unless explicitly supported.

Future rule category:

- has long used
- long known for
- best known for
- widely recognised for
- celebrated for
- renowned for
- signature practice
- signature material
- primary medium
- has spent years
- has built a practice around

Preferred safer phrasing:

- “Dacres uses rubber and metal from recycled tires to create sculptures.”
- “Dacres works with rubber and metal from recycled tires across the exhibition.”

## Current Status

The Source Packet integration is working and has completed a successful end-to-end test.

Next actions:

1. Commit workflow export and documentation.
2. Push to GitHub.
3. Let Render redeploy n8n.
4. Test one more article after deployment.
