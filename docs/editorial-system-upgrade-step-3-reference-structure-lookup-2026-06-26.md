# BAAD Editorial System Upgrade — Step 3
## Reference Structure Lookup in Generate BAAD Draft

Date: 2026-06-26
Status: Planning / Build Next
Repo: /Users/blackartdesign/Downloads/baad-n8n

---

## Macro Purpose

Step 2 created the Airtable structure layer.

Step 3 connects that structure layer to the Generate BAAD Draft workflow.

The goal is not yet to change article writing. The goal is to make n8n reliably detect and fetch a selected Reference Article Structure when an article has one.

---

## System Position

Current system:

Source Body / Summary
+ Source Article Analysis
+ Source Packets
+ BAAD Style Blueprint
→ Build Draft Prompt
→ Generate Draft

Target system after Step 3:

Source Body / Summary
+ Source Article Analysis
+ Source Packets
+ BAAD Style Blueprint
+ Manual Reference Structure lookup
→ normalized draft context

Target system after Step 4:

Source Body / Summary
+ Source Article Analysis
+ Source Packets
+ BAAD Style Blueprint
+ Manual Reference Structure
→ Article Structure Plan
→ Build Draft Prompt
→ Generate Draft

---

## Airtable Objects

Base:

app8xeAssDR2qaNAC

Articles table:

tblF0ghefGC2Bzh9K

Articles field:

Manual Reference Structure

Manual Reference Structure field ID:

fldzIkYMsImaW4AvQ

Reference Article Structures table:

tbl3hZMatlwTUpjps

First Reference Structure record:

recEdVr0Qdn58Uiq8

First test article:

David Uzochukwu: Bodies of Water

David article ID:

recN9pgEmgDmQoEPf

---

## Workflow Goal

The Generate BAAD Draft workflow should read:

Manual Reference Structure

If the field is filled, the workflow should fetch the linked Reference Article Structure record.

The fetched structure should be normalized into the draft context as:

referenceStructureApplied
referenceStructureId
referenceStructureName
referenceStructureFields
referenceStructureJson

---

## Proposed n8n Nodes

Add nodes after the article is retrieved and before full draft context is normalized:

1. Prepare Reference Structure Lookup
2. IF Has Manual Reference Structure?
3. Get Manual Reference Structure
4. Merge Reference Structure
5. Normalize Full Draft Context should include reference structure fields

---

## Data Contract

Expected normalized values:

referenceStructureApplied:

true or false

referenceStructureId:

Airtable record ID, for example recEdVr0Qdn58Uiq8

referenceStructureName:

For example Colossal — Tamara Dean Body/Nature Photography Structure

referenceStructureFields:

The selected Airtable record fields

referenceStructureJson:

Parsed value from Reusable Structure JSON if available

---

## Step 3 Test Criteria

Step 3 is complete when:

- David article still has Manual Reference Structure linked.
- Workflow fetches recEdVr0Qdn58Uiq8.
- Normalize Full Draft Context output includes referenceStructureApplied true.
- Output includes referenceStructureName.
- Output includes paragraph jobs or Reusable Structure JSON.
- No draft prompt behavior is changed yet.
- Workflow still reaches Build Draft Prompt without breaking.

---

## Important Boundary

Step 3 is lookup only.

Do not yet force the draft to follow the structure.

That belongs to Step 4:

Article Structure Plan.

---

## Current Status

Step 2 is complete and pushed.

Next action:

Inspect the current workflow JSON and identify the safest insertion point for the Reference Structure lookup nodes.
