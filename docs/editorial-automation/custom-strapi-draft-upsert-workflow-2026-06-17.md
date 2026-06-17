# BAAD Custom Strapi Draft Upsert Workflow — 2026-06-17

## Purpose

This document records the safe BAAD n8n to Strapi article push workflow.

The old generic REST create/update branch has been replaced by a custom Strapi draft-upsert route.

## New Strapi route

POST https://baad-v2-project.onrender.com/api/baad/news-articles/upsert-draft

The route was added to the BAAD Strapi backend in commit:

4021a70b Add draft-safe news article upsert route

## Why this was needed

The previous n8n workflow used generic Strapi REST create/update nodes.

During testing, the generic REST update path returned a published article even when status=draft was supplied. That made the old update branch unsafe.

## Current active n8n path

Get Ready for Strapi Articles
→ Prepare Article for Strapi
→ Build Strapi Payload
→ Upsert Strapi Draft Article
→ Update Airtable After Strapi Upsert

## Deprecated old REST branch

The old REST branch is kept on the n8n canvas for reference only and should remain disconnected.

Deprecated nodes include:

- Check Existing Strapi Article by Document ID
- Search Existing Strapi Article by Slug
- Prepare Create or Update Decision
- IF Strapi Article Exists?
- Update Strapi News Article
- Create Strapi News Article
- Update Airtable After Strapi Update
- Update Airtable After Strapi Create

Recommended sticky note in n8n:

OLD REST CREATE/UPDATE PATH — DO NOT USE

Replaced by:
Upsert Strapi Draft Article

Kept temporarily for reference only.
Do not reconnect unless deliberately rolling back.

## Tested results

Temporary test article:

Title: BAAD Draft Upsert Test Updated
Slug: baad-draft-upsert-test-20260617193311
Document ID: u9he660g5t8ro5eibmcw18sn

Results:

- Create draft: ok true, action created-draft, publishedAt null
- Update draft by documentId: ok true, action updated-draft, foundBy documentId, publishedAt null

Kim Dacres test article:

Airtable ID: reciLPjxWQXSBAEyq
Strapi Article ID: 341
Strapi Document ID: duna3444nujhtoe2fo57a73l
Slug: kim-dacres-reworks-worn-rubber-into-portraits-of-presence-sbaeyq

Successful result:

- ok true
- action updated-draft
- foundBy documentId
- publishedAt null

Airtable was updated to:

- Review Status: Pushed to Strapi
- Strapi Sync Status: Synced
- Strapi Article ID: 341
- Strapi Document ID: duna3444nujhtoe2fo57a73l
- Publish to Strapi: unchecked / false

## Archived workflow export

workflows/push-article-draft-to-strapi-custom-upsert-working-2026-06-17.json

Committed in baad-n8n as:

8f60cfb Archive custom Strapi upsert draft workflow

## Follow-up tasks

- Add proper Strapi error handling branch in n8n.
- Improve newsTopicCode mapping so exhibition/project spotlights do not default to other.
- Add artist/category/topic relation syncing after matching is reliable.
- Build a separate published-status sync workflow.
- Set up Node 22 properly with a version manager and .nvmrc.
- Set up local PostgreSQL/Strapi database later for safer backend testing.
