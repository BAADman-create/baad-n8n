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
