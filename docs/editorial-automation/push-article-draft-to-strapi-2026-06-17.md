# Push Article Draft to Strapi — Draft-Safe Workflow

Date: 2026-06-17  
Workflow: Push Article Draft to Strapi  
System: BAAD Editorial Automation  
Status: Tested successfully with Kim Dacres article

## Purpose

This workflow pushes approved BAAD article drafts from Airtable into Strapi as draft news articles, not published articles.

The workflow supports this editorial process:

1. BAAD article text is generated and reviewed in Airtable.
2. The article is approved for Strapi.
3. n8n creates or updates the article in Strapi as a draft.
4. Airtable stores the Strapi ID, document ID, slug, and sync timestamp.
5. The article remains unpublished in Strapi.
6. Images, media, categories, topics, and relations are added manually in Strapi.
7. Final publishing happens manually in Strapi.

This preserves editorial control and prevents articles from going live before image/media work is complete.

## Source Airtable Table

Base: app8xeAssDR2qaNAC  
Table: Articles / tblF0ghefGC2Bzh9K  
View: Ready for Strapi

The workflow begins by searching the Airtable Ready for Strapi view.

## Required Airtable Conditions

An article should enter the Strapi push workflow only when:

- Review Status = Approved for Strapi
- Publish to Strapi = true

After successful sync, the workflow should update the record to:

- Review Status = Pushed to Strapi
- Publish to Strapi = false
- Strapi Sync Status = Synced
- Published in Strapi (CHK) = false

## Tested Record

The successful test used the Kim Dacres article.

Airtable Record ID: reciLPjxWQXSBAEyq  
Article Title: Kim Dacres — Lost on a Two Way Street  
BAAD Title: Kim Dacres Reworks Worn Rubber into Portraits of Presence

Successful Strapi result:

- Strapi Article ID: 341
- Strapi Document ID: duna3444nujhtoe2fo57a73l
- Strapi Slug: kim-dacres-reworks-worn-rubber-into-portraits-of-presence-sbaeyq
- publishedAt: null

The key confirmation was publishedAt = null. This confirms the article was created as a Strapi draft.

## Workflow Path

Manual Trigger  
→ Get Ready for Strapi Articles  
→ Prepare Article for Strapi  
→ Build Strapi Payload  
→ Search Existing Strapi Article  
→ Prepare Create or Update Decision  
→ IF Existing Strapi Article?  
   → Update Strapi News Article  
   → Update Airtable After Strapi Update  
   OR  
   → Create Strapi News Article  
   → Update Airtable After Strapi Create

## Strapi Draft-Safe API Change

The Strapi News Article content type has Draft & Publish enabled:

- draftAndPublish = true

However, the workflow originally created a published article. The fix was to add this query parameter to both Strapi HTTP Request nodes:

- status = draft

This applies to:

- Create Strapi News Article
- Update Strapi News Article

Expected requests:

- POST /api/news-articles?status=draft
- PUT /api/news-articles/{documentId}?status=draft

The payload must not include publishedAt.

## Strapi Payload

The workflow currently sends:

- title
- slug
- dek
- body
- newsTopicCode
- tags

Do not include publishedAt or any other field that would publish the article automatically.

## Airtable Writeback Fields

After successful Strapi create/update, Airtable should store:

- Review Status = Pushed to Strapi
- Publish to Strapi = false
- Published in Strapi (CHK) = false
- Strapi Sync Status = Synced
- Strapi Article ID = Strapi numeric id
- Strapi Document ID = Strapi documentId
- Strapi Slug = Strapi slug
- Last Strapi Sync At = current ISO timestamp

For the Kim Dacres test, Airtable correctly stored:

- Review Status = Pushed to Strapi
- Strapi Sync Status = Synced
- Strapi Article ID = 341
- Strapi Document ID = duna3444nujhtoe2fo57a73l
- Strapi Slug = kim-dacres-reworks-worn-rubber-into-portraits-of-presence-sbaeyq
- Last Strapi Sync At = 2026-06-17T10:52:36.169Z

## Editorial Meaning of Statuses

### Approved for Strapi

The article has passed editorial review in Airtable and is ready to be pushed to Strapi.

### Pushed to Strapi

The article exists in Strapi as a draft. It still needs manual CMS work such as:

- hero image
- grid/listing image
- inline images or media
- categories
- topics
- artist relations
- SEO/image checks

### Published

The article has been manually published in Strapi after final CMS review.

The workflow should not automatically set Review Status to Published.

## Manual Strapi Step

After the workflow pushes the article, open the draft in Strapi and add:

- hero image
- grid/listing media if needed
- inline media
- categories
- topics
- artist relations
- final formatting adjustments

Only publish manually once the article is visually and editorially ready.

## Known Follow-Ups

### 1. Improve existing article detection

Current logic searches by slug. Later improvement:

- Search by Strapi Document ID first.
- Fallback to slug second.

This will make update behavior safer if a slug changes.

### 2. Improve error handling

Add a failed branch for Strapi create/update errors and write back to Airtable:

- Strapi Sync Status = Error
- Last Error = error message
- Last Error Step = failed node name

### 3. Improve topic/category mapping

The Kim Dacres article currently synced with newsTopicCode = other.

Later improvement should map Airtable article type/topic/category more accurately to Strapi newsTopicCode, topics, and categories.

### 4. Add artist/category/topic relations

For now, the workflow pushes text fields only. Later it should connect related:

- artists
- categories
- topics

after reliable matching is confirmed.

### 5. Add published-status sync

Later create a separate workflow to check whether a Strapi draft has been manually published and then update Airtable:

- Published in Strapi (CHK) = true
- Review Status = Published

This should happen after manual publishing, not during the draft push.

## Current Safe Workflow Summary

Airtable: Approved for Strapi + Publish to Strapi checked  
→ n8n creates/updates Strapi article with status=draft  
→ Strapi article has publishedAt: null  
→ Airtable updates to Pushed to Strapi  
→ Publish to Strapi is cleared  
→ User manually adds images/media/categories/artists in Strapi  
→ User manually publishes later
