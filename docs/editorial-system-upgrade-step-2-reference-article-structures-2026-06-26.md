# BAAD Editorial System Upgrade — Step 2
## Reference Article Structures System

Date: 2026-06-26
Status: Planning / Build Next
Repo: /Users/blackartdesign/Downloads/baad-n8n

---

## Macro Purpose

The Reference Article Structures system gives BAAD a way to reuse the editorial architecture of strong reference articles without copying their wording, facts, or source language.

This layer is different from a BAAD Style Blueprint.

A BAAD Style Blueprint answers:

What kind of BAAD article is this?

A Reference Article Structure answers:

What article shape should this draft follow?

Example:

BAAD Blueprint: Photography / Visual Culture Article
Reference Structure: Colossal — Tamara Dean Body/Nature Photography Structure
Article Subject: David Uzochukwu: Bodies of Water

The workflow should eventually combine source facts, BAAD article type, and reference article architecture before drafting.

---

## Why This Step Is Needed

The David Uzochukwu workflow test proved that the current Generate BAAD Draft workflow can generate and save a valid article, but it cannot yet follow a manually discussed Colossal-informed article structure.

The manually discussed opening began:

Based in Berlin, David Uzochukwu creates surreal photographs that explore the relationship between Black bodies, mythology and transformation...

The workflow-generated opening was different because the current workflow does not yet include:

- a Reference Article Structures table
- a selected reference structure field on the Article record
- an Article Structure Plan node before draft generation

This Step 2 creates the missing structure library.

---

## Macro System Position

Current system:

Source Body / Summary
+ Source Article Analysis
+ Source Packets
+ BAAD Style Blueprint
→ Build Draft Prompt
→ Generate Draft
→ Validate
→ Polish
→ Final Airtable Update

Target system:

Source Body / Summary
+ Source Article Analysis
+ Source Packets
+ BAAD Style Blueprint
+ Reference Article Structure
→ Article Structure Plan
→ Build Draft Prompt
→ Generate Draft
→ Source-Language Overlap Check
→ Editorial Rhythm Check
→ Validate
→ Polish
→ Final Airtable Update

---

## Micro System Object

Create a new Airtable table:

Reference Article Structures

Purpose:

Stores reusable article architecture maps from examined reference articles.

This table should not store copied article text for publication. It should store:

- structure notes
- paragraph movement
- quote placement
- visual-description logic
- context placement
- closing pattern
- workflow-use rules

---

## Proposed Airtable Fields

Core identity:

- Reference Structure Name
- Source Publication
- Reference URL
- Reference Article Title
- Reference Artist / Subject
- Reference Medium / Form

Editorial matching:

- Best For
- Not Good For
- Story Family
- Opening Type
- Movement Pattern

Paragraph architecture:

- Paragraph 1 Job
- Paragraph 2 Job
- Paragraph 3 Job
- Paragraph 4 Job
- Paragraph 5 Job
- Optional Paragraph 6 Job

Quote and description logic:

- Quote Placement
- Visual Description Pattern
- Context Placement
- Closing Pattern

Style and workflow control:

- Sentence Rhythm Notes
- Words / Habits to Avoid
- Reusable Structure JSON
- Ready for Use?
- Review Status
- Notes

---

## First Reference Structure To Add

Name:

Colossal — Tamara Dean Body/Nature Photography Structure

Reference URL:

https://www.thisiscolossal.com/2026/06/tamara-dean-human-body-nature/

Best for:

Photography articles about the body, landscape, environment, nature, transformation, performance, and human/nonhuman relationships.

Paragraph movement:

1. Artist location, practice, central relationship, and guiding quote.
2. Explain how bodies function in the images; figures are not conventional portrait subjects.
3. Describe specific visual examples from the work.
4. Explain process, direction, gesture, and larger meaning.
5. Close with exhibition or practical details.

Why this matters for David Uzochukwu:

This structure better matches the manually discussed David opening because it begins with artist/practice/concept before moving into the body/environment relationship.

---

## Relationship To Existing Tables

Existing table:

Article Structure / Meaning Map

Purpose:

Analytical classification layer.

New table:

Reference Article Structures

Purpose:

Operational workflow layer.

Difference:

- Article Structure / Meaning Map = analyzes patterns.
- Reference Article Structures = stores selectable structures for drafting.

The new table may be informed by the Structure / Meaning Map table, but it should be easier for n8n to use directly.

---

## Future Airtable Article Fields

Later, the Articles table should get:

Manual Reference Structure

Type:

Linked record to Reference Article Structures

Purpose:

Allows a human editor to choose the article architecture before generation.

Potential later field:

Reference Structure Selection Source

Options:

- Manual Override
- Source Analysis Match
- Blueprint Default
- Fallback

---

## Future n8n Workflow Integration

Future nodes:

1. Prepare Reference Structure Lookup
2. IF Has Manual Reference Structure?
3. Get Manual Reference Structure
4. Select Reference Structure
5. Build Article Structure Plan Prompt
6. OpenAI – Generate Article Structure Plan
7. Parse Article Structure Plan
8. Validate Article Structure Plan
9. Feed structure plan into Build Draft Prompt

---

## Step 2 Test Criteria

Step 2 is complete when:

- The Reference Article Structures table exists in Airtable.
- The first reference structure record exists.
- The first record is documented in the repo.
- The system distinction is clear:
  - BAAD Blueprint = article type
  - Reference Structure = article shape
  - Source Packets = facts/evidence
- The next workflow step is clear:
  - add article field
  - add lookup nodes
  - add Article Structure Plan

---

## Open Decisions

1. Should Reference Article Structures stay separate from Article Structure / Meaning Map?
   - Current recommendation: yes, keep separate for workflow clarity.

2. Should the table store full reference article text?
   - Current recommendation: no.

3. Should one BAAD Blueprint have default reference structures?
   - Current recommendation: yes, later.

4. Should the editor be able to override structure per article?
   - Current recommendation: yes.

---

## Current Status

Step 1 final update reliability is complete and pushed.

Step 2 begins with this planning document.

Next action:

Create the Airtable Reference Article Structures table and first record.

---

## Airtable Table Created

Created: 2026-06-26

Base:

app8xeAssDR2qaNAC

Table name:

Reference Article Structures

Table ID:

tbl3hZMatlwTUpjps

Purpose:

Operational workflow table for reusable article architecture maps. This table stores selected reference structures that n8n can eventually read directly when building a pre-draft Article Structure Plan.

Relationship to existing table:

- Article Structure / Meaning Map = analytical pattern/classification layer
- Reference Article Structures = operational selectable workflow layer

Next micro-step:

Create the first reference structure record:

Colossal — Tamara Dean Body/Nature Photography Structure

---

## First Reference Structure Record Created

Created: 2026-06-26

Table:

Reference Article Structures

Table ID:

tbl3hZMatlwTUpjps

Record name:

Colossal — Tamara Dean Body/Nature Photography Structure

Record ID:

recEdVr0Qdn58Uiq8

Review Status:

Draft

Ready for Use?:

false

Purpose:

This is the first operational Reference Article Structure record. It stores the paragraph architecture of a Colossal body/nature photography article so BAAD can eventually use it as a selectable article-shape model.

Editorial use case:

Useful for photography articles where the subject involves bodies, landscape, environment, transformation, performance, human/nonhuman relationships, or bodies becoming inseparable from surrounding conditions.

David Uzochukwu relevance:

This structure matches the manual editorial direction for the David Uzochukwu article better than the current workflow draft because it begins with artist/practice/concept before moving into body/environment meaning.

Status note:

Keep this record in Draft until it is reviewed and tested through the future Article Structure Plan layer.

Next micro-step:

Create a linked-record field on the Articles table named Manual Reference Structure, linked to Reference Article Structures.

---

## Articles Field Created

Created: 2026-06-26

Table:

Articles

Table ID:

tblF0ghefGC2Bzh9K

Field name:

Manual Reference Structure

Field ID:

fldzIkYMsImaW4AvQ

Field type:

multipleRecordLinks

Linked table:

Reference Article Structures

Linked table ID:

tbl3hZMatlwTUpjps

Airtable options confirmed:

- isReversed: false
- prefersSingleRecordLink: true
- inverseLinkFieldId: fldHdBUaiiFQ504fN

Purpose:

This field allows a human editor to manually select one Reference Article Structure for an article before draft generation.

Macro role:

This gives the Articles table a direct bridge between the current article and the new operational article-shape library.

Micro workflow role:

Future n8n workflow nodes should check this field before drafting. If present, the selected Reference Article Structure should override automatic structure selection and feed into the Article Structure Plan step.

Next micro-step:

Link the David Uzochukwu article to the first Reference Article Structure record for testing.

David article:

recN9pgEmgDmQoEPf

Reference Structure record:

recEdVr0Qdn58Uiq8
