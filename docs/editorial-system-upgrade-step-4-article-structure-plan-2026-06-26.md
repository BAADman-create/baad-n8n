# BAAD Editorial System Upgrade — Step 4
## Article Structure Plan Layer

Date: 2026-06-26
Status: Planning / Build Next
Repo: /Users/blackartdesign/Downloads/baad-n8n

---

## Macro Purpose

Step 3 made the Generate BAAD Draft workflow fetch a selected Reference Article Structure from Airtable.

Step 4 turns that fetched structure into a customized Article Structure Plan for the current article.

Reference Article Structure = reusable article architecture.

Article Structure Plan = article-specific paragraph plan.

---

## Why This Layer Exists

A BAAD Style Blueprint defines article type and editorial voice.

A Reference Article Structure defines reusable article shape.

An Article Structure Plan translates that reusable shape into a paragraph-by-paragraph plan for the current source material.

Without this layer, the workflow can fetch the structure but still leaves the draft model to infer how to apply it.

---

## System Position

Current system after Step 3:

Source Body / Summary
+ Source Analysis
+ BAAD Style Blueprint
+ Source Packets
+ Reference Article Structure
→ Build Draft Prompt
→ Generate Draft

Target system after Step 4:

Source Body / Summary
+ Source Analysis
+ BAAD Style Blueprint
+ Source Packets
+ Reference Article Structure
→ Article Structure Plan
→ Build Draft Prompt
→ Generate Draft

---

## Airtable Objects

Base:

app8xeAssDR2qaNAC

Articles table:

tblF0ghefGC2Bzh9K

Manual Reference Structure field:

fldzIkYMsImaW4AvQ

Reference Article Structures table:

tbl3hZMatlwTUpjps

David test article:

recN9pgEmgDmQoEPf

David linked Reference Structure:

recEdVr0Qdn58Uiq8

Reference Structure name:

Colossal — Tamara Dean Body/Nature Photography Structure

---

## Workflow Input Contract

Step 3 already provides:

- referenceStructureApplied
- referenceStructureId
- referenceStructureName
- referenceStructureFields
- referenceStructureJson
- referenceStructureForPrompt

Step 4 should add:

- articleStructurePlanApplied
- articleStructurePlanJson
- articleStructurePlanForPrompt
- articleStructurePlanWarnings

---

## Proposed n8n Nodes

Add after:

Attach Reference Structure to Draft Context

and before:

Build Draft Prompt

New nodes:

1. Build Article Structure Plan Prompt
2. OpenAI – Generate Article Structure Plan
3. Parse Article Structure Plan JSON
4. Validate Article Structure Plan
5. Attach Article Structure Plan to Draft Context

False/no-structure path:

Add Empty Reference Structure
→ Add Empty Article Structure Plan
→ Build Draft Prompt

---

## Article Structure Plan JSON Contract

Expected JSON:

{
  "articleStructurePlanApplied": true,
  "referenceStructureUsed": {
    "id": "string",
    "name": "string"
  },
  "openingPlan": {
    "openingEngine": "string",
    "openingInstruction": "string",
    "avoidOpeningWith": ["string"]
  },
  "paragraphPlan": [
    {
      "paragraph": 1,
      "job": "string",
      "mustInclude": ["string"],
      "avoid": ["string"],
      "sourceBasis": ["string"]
    }
  ],
  "titleDekOpeningSeparation": {
    "titleJob": "string",
    "dekJob": "string",
    "openingJob": "string"
  },
  "sourceUsePlan": {
    "primarySourceRole": "string",
    "sourcePacketUse": ["string"],
    "backgroundSourceLimits": ["string"]
  },
  "rhythmNotes": ["string"],
  "warnings": ["string"]
}

---

## David Test Expectation

For David Uzochukwu, the Article Structure Plan should adapt the Tamara Dean body/nature photography structure to Bodies of Water.

Expected movement:

1. Open through the visual body/water relationship in Uzochukwu’s photographs.
2. Explain the hybrid figures as bodies shaped by water, environment, adaptation, migration, and belonging.
3. Introduce current exhibition facts: Bodies of Water, first museum exhibition, Memphis Brooks Museum of Art, 22 photographs, June 10–September 27, 2026.
4. Bring in digital collage, mythology, Drexciya, migrant crises, climate change, and water as setting/symbol without over-writing the symbolism.
5. Use artist statement and Vogue context lightly as background only.
6. Close with concise Memphis Brooks exhibition details.

---

## Guardrails

The Article Structure Plan must not invent facts.

The Reference Article Structure is not a factual source.

The plan must not copy reference article wording.

The plan must preserve Source Analysis guardrails.

The plan must keep background sources in their proper role.

The plan must not let IN THE WAKE or Mare Monstrum replace Bodies of Water.

The plan must not use unresolved Weisman opening dates.

---

## Step 4 Test Criteria

Step 4 is successful when:

- David article runs through the workflow.
- Reference Structure is fetched.
- Article Structure Plan is generated as valid JSON.
- Article Structure Plan includes a paragraph plan.
- Article Structure Plan adapts the Tamara Dean structure to David.
- Build Draft Prompt receives articleStructurePlanForPrompt.
- Generated draft follows the plan more closely than the previous David draft.
- Workflow still completes final Airtable update.
- Generate Draft? is cleared after success.
- BAAD Tags still save correctly.

---

## Boundary

Step 4 introduces planning before drafting.

It does not add the source-language overlap checker. That is Step 5.

It does not add the editorial rhythm checker. That is Step 6.

---

## Current Status

Step 3 is complete and pushed.

Next action:

Patch the current Reference Structure Lookup workflow archive to add Article Structure Plan nodes.

---

## Step 4 Test Result — David Uzochukwu Article

Test article:

- Article: `David Uzochukwu: Bodies of Water`
- Article ID: `recN9pgEmgDmQoEPf`
- Manual BAAD Blueprint: `recf8B54P2oS3PcHY`
- Manual Reference Structure: `recEdVr0Qdn58Uiq8`
- Source Analysis: `rec5KBJOz4A3d9Jef`
- Source Packets Applied: `4`

Workflow archive tested:

- `generate-baad-draft-blueprint-test-manual-blueprint-override-candidate-2026-06-26-article-structure-plan.json`

Result:

- The Step 4 Article Structure Plan layer worked technically.
- The workflow generated an article-specific structure plan from the selected Reference Article Structure.
- The structure plan was attached to the draft context.
- The Build Draft Prompt included the Article Structure Plan.
- The generated draft passed validation.
- Polish ran successfully.
- Final Airtable update succeeded.
- `Review Status` became `Draft Generated`.
- `Generate Draft?` was cleared to `false`.
- `BAAD Tags` were saved correctly.
- `Final BAAD Blueprint Used` remained `recf8B54P2oS3PcHY`.
- `Blueprint Selection Source` remained `Manual Override`.
- `Manual Reference Structure` remained `recEdVr0Qdn58Uiq8`.
- `Last Error` and `Last Error Step` were empty.

This confirms Step 4 works as a workflow layer.

## Editorial Tone Finding — Over-Compressed Poetic Opening

The generated article included this opening sentence:

> David Uzochukwu builds bodies for unstable water.

This is a useful test failure.

The sentence is not factually wrong, but it does not fit BAAD tone. It is too forceful, too compressed, and too writerly. It makes the draft sound as if the system is trying to create a poetic hook rather than writing clear, grounded BAAD editorial prose.

The issue is the construction:

- artist + builds/makes/creates + bodies/worlds/forms + for/against/under + abstract condition

This kind of sentence can sound artificial in BAAD copy, especially when the source material is already visually and conceptually rich.

Preferred BAAD direction:

- Open through concrete visual description.
- Keep the sentence natural and editorial.
- Let the image lead without forcing metaphor.
- Avoid dramatic compressed constructions that make the prose sound generated.
- Prefer calmer phrasing such as:
  - “In David Uzochukwu’s photographs, hybrid figures move through watery, mythic environments.”
  - “David Uzochukwu imagines hybrid figures shaped by water, myth and migration.”
  - “Across Bodies of Water, altered figures appear in surreal environments where water becomes both setting and pressure.”

Follow-up prompt patch needed:

Add a BAAD tone guard to the draft prompt and/or Article Structure Plan prompt that says:

- Image-led does not mean over-poetic.
- Avoid compressed metaphorical openings.
- Do not use constructions like “builds bodies for unstable water.”
- Keep openings visually grounded, clear, and natural.
- Prefer direct image/action/environment phrasing over dramatic abstraction.

## Additional Reporting Cleanup Reminder

Later, patch the Article Structure Plan parser so it overrides the model-returned `referenceStructureUsed.id` with the real Airtable Reference Article Structure record ID.

In the David test, the model returned a slug-like ID instead of the real Airtable ID:

- Returned model ID: `Colossal-Tamara-Dean-Body-Nature-Photography-Structure`
- Real Airtable ID: `recEdVr0Qdn58Uiq8`

The workflow already knows the real ID upstream as `referenceStructureId`. The parser should force `referenceStructureUsed.id` to the real Airtable record ID.

This is not blocking Step 4, but it will make downstream reporting cleaner.

## Current Status After Step 4 Test

Step 4 is technically working and ready for prompt refinement.

Next action after this documentation commit:

- Patch the Article Structure Plan and/or Build Draft Prompt tone rules.
- Add a BAAD tone guard against compressed poetic openings.
- Re-test David or another photography article to confirm the opening becomes image-led but natural.

