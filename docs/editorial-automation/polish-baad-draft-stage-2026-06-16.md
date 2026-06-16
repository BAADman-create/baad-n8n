Workflow Update — Polish BAAD Draft Stage

Date: 2026-06-16
Workflow: Generate BAAD Draft – Blueprint Test
System Area: BAAD Editorial Automation
Status: Complete, tested, and Airtable update confirmed
Primary test article: Kim Dacres — Lost on a Two Way Street
Airtable Article ID: reciLPjxWQXSBAEyq
Source Article Analysis ID: recNRiAE4EB53BA5d
Closing Paragraph Info ID: recivea3pMXRAGBMw
Style Blueprint: BAAD Short Visual Art Spotlight

⸻

1. Summary

The Polish BAAD Draft stage has been added to the BAAD editorial automation workflow.

This stage runs after the repaired draft passes factual/safety validation. It does not generate a new article from scratch. It performs a final editorial polish using only the facts already available in the workflow.

The key principle is:

Passing validation means the draft is safe. Polishing makes it closer to publication-ready.

Before this update, the workflow could generate a draft that was technically valid but still sounded repetitive, stiff, generic, or validation-driven. The polish stage improves rhythm, flow, phrasing, repetition, title/dek quality, and closing language while preserving the factual validation result.

The polish stage improves:

* sentence rhythm
* paragraph flow
* repeated nouns and repeated sentence openings
* clunky phrasing
* stiff endings
* mechanical attribution
* validation-sounding language
* overly flat editorial movement
* openings that feel too impersonal or object-led
* generic BAAD closing lines

It must not:

* add new facts
* add new source material
* invent interpretation
* introduce new links
* change verified dates
* change verified venues
* change artist names
* change exhibition/project titles
* change materials
* replace the need for future BAAD Source Packets

⸻

2. Clear Upgrade Distinction

The polish-stage work and the future Source Packet system must stay separate.

Polish BAAD Draft

Immediate workflow stage.

It:

* improves the final repaired draft after validation
* works only with facts already available in the current workflow
* fixes rhythm, repetition, clunky phrasing, stiff endings, and editorial flow
* must not add new facts or source material
* must not pull in external press releases, artist bios, interviews, or gallery pages
* should preserve all required facts and validation metadata

BAAD Source Packets

Next major system upgrade after polish.

It will:

* process additional sources beyond the origin article
* link those additional sources to an Article
* provide verified evidence/context to Build Draft Prompt
* sit alongside the origin article and Source Article Analysis
* not replace the origin article
* not replace Source Article Analysis
* help the system write richer articles when the origin source is thin

For Kim Dacres specifically, the Charles Moffett press release should eventually become a Gallery Press Release Source Packet linked to the Kim Dacres article. It should deepen the article with verified process/exhibition context while avoiding copied phrasing or unsupported claims.

⸻

3. Final Tested Workflow Route

Previous route

Before polish, the success route was:

Validate Repaired Draft Against BAAD Standards
→ IF Repaired Draft Passes?
→ Final Clean Draft Fields
→ Update Article with BAAD Draft

New tested route

The tested success route is now:

IF Repaired Draft Passes?
→ TRUE
→ Build Polish Prompt
→ Polish BAAD Draft
→ Parse Polished Draft JSON
→ Validate Polished Draft Against BAAD Standards
→ IF Polished Draft Passes?
   → TRUE
   → Final Clean Draft Fields
   → Update Article with BAAD Draft

Polished draft failure route

IF Polished Draft Passes?
→ FALSE
→ Mark Polished Article Needs Human Review

Earlier repair-stage failure route

This remains separate:

IF Repaired Draft Passes?
→ FALSE
→ Mark Article Needs Human Review

This separation matters because a failure before polish and a failure after polish mean different things.

⸻

4. Node-by-Node Status

Build Polish Prompt

Status: Working.

Purpose:

* Builds the full polishPrompt before the OpenAI node.
* Pulls repaired draft fields.
* Pulls promptContext from Build Draft Prompt.
* Pulls validation facts and validation result.
* Builds one stable prompt string for the OpenAI node.

This is better than putting the full prompt directly inside the OpenAI node because it is easier to debug, easier to expand, and avoids fragile n8n expression formatting.

Important result:

Build Polish Prompt successfully generated a full prompt containing:

* current repaired draft JSON
* source/context packet
* validation required facts
* validation result
* polish rules

Polish BAAD Draft

Status: Working.

The OpenAI node receives the prebuilt prompt from:

$json.polishPrompt

This node follows the same general model/settings pattern as Repair Draft with OpenAI.

Current decision:

Do not change the model yet. The route is stable, and model changes should be tested later only after the workflow logic is fully settled.

Parse Polished Draft JSON

Status: Working.

This node takes the OpenAI polish output and turns it back into BAAD draft fields.

It preserves:

* Airtable Article ID
* promptContext
* previous validation
* source-analysis metadata
* style-blueprint metadata
* closing-info metadata
* polish metadata

It outputs:

* polishApplied: true
* polish_notes
* facts_preserved_checklist
* unsupported_additions_check

This preservation is important because the validator and Airtable update path still need article ID, validation context, source-analysis metadata, style blueprint metadata, and closing information.

Validate Polished Draft Against BAAD Standards

Status: Working.

This remains generic validator v4.

It validates the polished draft after Parse Polished Draft JSON.

It still pulls source context from Build Draft Prompt.

Confirmed successful validation result for the Kim Dacres test:

{
  "draftPassesValidation": true,
  "validationDecision": "pass",
  "missingRequiredFacts": [],
  "closingIssues": []
}

The validator flagged transforms as risky but source-supported, so it was not a blocker.

Relevant result:

unsupportedRiskyHits: []
riskyButSourceSupportedHits: transforms
missingRequiredFacts: []
closingIssues: []

IF Polished Draft Passes?

Status: Working.

Condition:

$json.draftPassesValidation

TRUE route:

Final Clean Draft Fields

FALSE route:

Mark Polished Article Needs Human Review

This routing is correct.

Mark Polished Article Needs Human Review

Status: Working.

This node is separate from the older Mark Article Needs Human Review node.

It should set:

Review Status = In Review
Last Error Step = Validate Polished Draft Against BAAD Standards

This makes it clear that the failure happened at the polished-validation stage, not at the first validation or repair stage.

Final Clean Draft Fields

Status: Working.

Purpose:

* Performs small final cleanup before Airtable update.
* Does not rewrite the article.
* Keeps validated fields intact.
* Adds empty cleanup fields for stale Airtable errors.

Important output fields:

lastErrorClear: ''
lastErrorStepClear: ''

This node was updated because stale Airtable error fields remained after a successful update.

Update Article with BAAD Draft

Status: Working.

Confirmed successful Airtable update for the Kim Dacres article.

Confirmed Airtable fields updated:

* Review Status = Draft Generated
* Generate Draft? = false
* BAAD Title populated
* BAAD Dek populated
* BAAD Editor Summary populated
* BAAD Meta Description populated
* BAAD SEO Title populated
* Body (BAAD Draft) populated

⸻

5. Airtable Error-Field Clearing Issue

During testing, the draft updated successfully, but Airtable still showed stale error fields from an earlier failed validation.

The record temporarily showed a contradictory state:

Review Status = Draft Generated
Last Error = old failure message
Last Error Step = Validate Polished Draft Against BAAD Standards

This was misleading because the current polished draft had passed validation and saved successfully.

Failed clearing attempts

These values did not clear the Airtable fields correctly:

={{ "" }}

and:

={{ null }}

They either did not overwrite the fields or produced/preserved a literal equals sign:

Last Error = =
Last Error Step = =

Working fix

The working fix was:

1. Add these fields in Final Clean Draft Fields:

lastErrorClear: ''
lastErrorStepClear: ''

2. Map the Airtable fields without the leading equals sign:

{{ $json.lastErrorClear }}
{{ $json.lastErrorStepClear }}

Important n8n note:

For these empty-field mappings, using the expression without the leading = produced [empty] in the n8n preview and successfully cleared the Airtable fields.

Final confirmed Airtable result:

Last Error = cleared
Last Error Step = cleared

In the returned Airtable record, those fields no longer appeared, which confirms they were cleared.

⸻

6. Kim Dacres Test Result

Test article:

Kim Dacres — Lost on a Two Way Street

Airtable Article ID:

reciLPjxWQXSBAEyq

Source Article Analysis ID:

recNRiAE4EB53BA5d

Closing Paragraph Info ID:

recivea3pMXRAGBMw

Style Blueprint:

BAAD Short Visual Art Spotlight

Final polished title:

Kim Dacres Reworks Worn Rubber into Sculptural Portraits

Final Airtable state:

Review Status = Draft Generated
Source Quality Status = Pass
Body (BAAD Draft) = populated
Last Error = cleared
Last Error Step = cleared

⸻

7. Final Polished Article Saved to Airtable

Final BAAD title:

Kim Dacres Reworks Worn Rubber into Sculptural Portraits

Final BAAD dek:

At Charles Moffett in New York, Lost on a Two Way Street presents Kim Dacres’s tire-tread portraits, wall works, and a U.S. flag interpretation featuring Black and brown figures.

Final body:

<p>Kim Dacres reworks worn rubber into sculptural portraits shaped by twisting and braiding, turning discarded tires and tire treads into faces, rows, and buns associated with Black hairstyles. In <em>Lost on a Two Way Street</em>, now on view at Charles Moffett in New York, metal bike chains and gear-like crowns join those reclaimed materials, keeping the process of construction visible throughout.</p>
<p>Dacres continues a portrait practice built around discarded tires, using them here for a group of busts dedicated to people who have inspired and influenced her. Across the exhibition, rubber is arranged into intricate hairstyles and finished with spray-painted surfaces that still reveal traces of wear.</p>
<p>That attention to profile and adornment carries into a series of flatter wall works evocative of Victorian-era cameos. Focused on hair, silhouette, and structure, these pieces use treads and strips of rubber to define their contours. Elsewhere, a U.S. flag work with Black and brown figures replaces the traditional stars with small human forms. Its frayed edges bring the material condition of the piece into conversation with the symbol itself.</p>
<p>Together, the works consider appearance and the pressures that shape everyday life. Buns and braids remain a recurring visual thread, while the flag piece introduces the exhibition’s most direct political image.</p>
<p><em>Lost on a Two Way Street</em> runs from May 7 to June 20 at Charles Moffett in New York, with more on Kim Dacres and the exhibition available on BAAD.</p>

⸻

8. Editorial Notes From Testing

The polish stage made the draft safer and smoother, but it did not fully solve the deeper writing-quality issue.

The Kim Dacres draft is still limited because the current workflow mainly uses the short Colossal source article. The article would likely improve with additional verified context from a gallery press release, artist bio, interview, artist statement, or museum/gallery page.

Important lesson:

Polish can improve wording, flow, and rhythm, but it should not add new evidence. Better article depth should come from the future BAAD Source Packets system.

What polish improved

Polish improved:

* rhythm
* paragraph transitions
* mechanical closing language
* repeated wording
* title/dek coherence
* factual preservation
* validation-safe phrasing

What polish did not fully solve

Polish did not fully solve:

* thin-source limitation
* lack of deeper source context
* limited material value-shift detail
* limited practice impulse
* limited paragraph compression
* limited human/social/political depth

These limitations should be addressed by Source Packets, not by asking the polish node to invent or add new facts.

⸻

9. Colossal Comparison Lessons

The Colossal source article worked because it had a clear editorial engine:

artist/practice impulse
→ material transformation
→ visual detail
→ exhibition development
→ supported meaning
→ practical close

For the Kim Dacres article, the deeper source pattern was:

discarded material
→ artist process
→ Black hairstyles/adornment
→ tribute/community
→ flag/political tension
→ exhibition close

Important editorial lesson:

Do not copy distinctive phrases such as:

renewal and care

Instead, recast the function of that phrase through BAAD’s own grounded language.

The source-packet system should eventually help turn phrases like this into structured guidance:

Source Meaning to Recast:
The source frames Dacres’s use of worn rubber through ideas of transformation, care, community support, appearance, and political strain. Do not copy the phrase “renewal and care.” Recast the meaning through concrete BAAD language about discarded rubber becoming portraiture, Black hairstyles, tribute, support systems, and constrained national symbolism.

⸻

10. Source Packets Are Next, But Not Started Yet

Do not mix the two upgrades.

Polish BAAD Draft

Immediate workflow stage.

It:

* improves the final repaired draft after validation
* works only with facts already available in the workflow
* must not add new facts or source material
* should now be treated as stable after this test

BAAD Source Packets

Next major upgrade after polish.

It will:

* process additional sources beyond the origin article
* link those sources to an Article
* provide verified evidence/context to Build Draft Prompt
* sit alongside the origin article and Source Article Analysis
* not replace the origin article
* not replace Source Article Analysis
* help BAAD drafts become richer, more grounded, and less repetitive

Future Source Packet fields should include:

* Source Type
* Source Publisher
* Source Title
* Full Text / Extract
* Verified Facts
* Quote Candidates
* Editorial Use Notes
* Source Reliability
* Use in Draft?
* Use for Quotes?
* Avoid Copying?
* Human Review Needed?

For Kim Dacres, the Charles Moffett press release should eventually become a Gallery Press Release Source Packet linked to the Kim Dacres article. It should deepen the article with verified process/exhibition context while avoiding copied phrasing or unsupported claims.

⸻

11. Final Status

The Polish BAAD Draft stage is complete, tested, validated, and confirmed to update Airtable successfully.

Next recommended work:

Build BAAD Source Packets table/workflow.