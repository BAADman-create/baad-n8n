const NOTION_TOKEN =
  process.env.NOTION_TOKEN ||
  process.env.NOTION_API_KEY ||
  process.env.NOTION_SECRET;

if (!NOTION_TOKEN) {
  console.error('Missing Notion token. Set NOTION_TOKEN, NOTION_API_KEY, or NOTION_SECRET in your shell environment.');
  process.exit(1);
}

const NOTION_VERSION = '2022-06-28';

// BAAD Editorial Intelligence HQ parent page
const HQ_PAGE_ID = '37e16598b06e80339ab3e44d6f1dd0bd';

const SECTION_TITLE = '04 Source Article Analysis System';
const GUIDE_TITLE = 'BAAD Source Article Analysis System Guide';

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    console.error(`Notion API error ${res.status} ${res.statusText}`);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  return data;
}

function rich(text) {
  return [{ type: 'text', text: { content: String(text || '').slice(0, 2000) } }];
}

function paragraph(text) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: rich(text) } };
}

function heading1(text) {
  return { object: 'block', type: 'heading_1', heading_1: { rich_text: rich(text) } };
}

function heading2(text) {
  return { object: 'block', type: 'heading_2', heading_2: { rich_text: rich(text) } };
}

function heading3(text) {
  return { object: 'block', type: 'heading_3', heading_3: { rich_text: rich(text) } };
}

function bullet(text) {
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rich(text) } };
}

function numbered(text) {
  return { object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: rich(text) } };
}

function codeBlock(text, language = 'plain text') {
  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: rich(text),
      language,
    },
  };
}

function pageTitle(title) {
  return [{ type: 'text', text: { content: title } }];
}

async function getChildren(blockId) {
  const all = [];
  let start_cursor;

  do {
    const qs = start_cursor ? `?start_cursor=${start_cursor}` : '';
    const data = await notion('GET', `/blocks/${blockId}/children${qs}`);
    all.push(...(data.results || []));
    start_cursor = data.has_more ? data.next_cursor : null;
  } while (start_cursor);

  return all;
}

function childPageTitle(block) {
  return block?.child_page?.title || '';
}

async function findChildPage(parentId, title) {
  const children = await getChildren(parentId);
  return children.find(
    (block) =>
      block.type === 'child_page' &&
      childPageTitle(block).trim().toLowerCase() === title.trim().toLowerCase()
  );
}

async function createChildPage(parentPageId, title) {
  return notion('POST', '/pages', {
    parent: { type: 'page_id', page_id: parentPageId },
    properties: {
      title: {
        title: pageTitle(title),
      },
    },
  });
}

async function appendBlocks(blockId, blocks) {
  const chunkSize = 80;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    await notion('PATCH', `/blocks/${blockId}/children`, {
      children: blocks.slice(i, i + chunkSize),
    });
  }
}

function guideBlocks() {
  return [
    heading1('BAAD Source Article Analysis System Guide'),
    paragraph('Version 1. This guide documents the Source Article Analysis layer in the BAAD Editorial Intelligence system. It explains what Source Article Analysis does, how it sits between Source Packets and draft generation, and how the new n8n workflow should be tested before production use.'),

    heading1('Layer Position'),
    paragraph('Source Article Analysis is the editorial decision layer. It should not replace raw sources, Source Packets, style blueprints, closing information, or human review. Its job is to decide how a source should become a BAAD article.'),
    bullet('Article Sources = raw/origin source layer.'),
    bullet('Source Packets = verified evidence layer.'),
    bullet('Source Article Analysis = editorial decision layer.'),
    bullet('Generate BAAD Draft = writing layer.'),
    bullet('Push Article Draft to Strapi = publishing layer.'),

    heading1('Purpose'),
    paragraph('The Source Article Analysis workflow reads an Article, its linked Article Sources, and approved BAAD Source Packets. It then creates a structured Source Article Analysis record that tells the draft workflow how to treat the article candidate.'),
    bullet('It identifies the primary scenario, such as exhibition spotlight, artist practice, artwork-led article, design story, public art/installation, film/media, or opportunity brief.'),
    bullet('It recommends the BAAD article shape and the BAAD Style Blueprint.'),
    bullet('It identifies the best BAAD angle and what the article should lead with.'),
    bullet('It records what must be preserved and what should not be overemphasised.'),
    bullet('It flags human review where the source is thin, ambiguous, promotional, sensitive, high-copying-risk, or unsupported.'),

    heading1('Current Workflow Candidate'),
    paragraph('The first standalone Source Article Analysis workflow candidate has been created, committed, pushed, and imported into n8n. It is inactive/manual and has not yet been executed.'),
    bullet('Workflow name: Create Source Article Analysis – Production Candidate'),
    bullet('Repo file: workflows/create-source-article-analysis-production-candidate-2026-06-20.json'),
    bullet('Commit: 27e1039 — Add source article analysis production candidate'),
    bullet('Status: imported into n8n, inactive/manual, not yet tested.'),
    bullet('Important: do not activate until one manual test article has passed.'),

    heading2('Workflow Chain'),
    numbered('Manual Trigger'),
    numbered('Get Articles Ready for Source Analysis'),
    numbered('Prepare Article Analysis Context'),
    numbered('Get Approved Source Packets'),
    numbered('Build Source Article Analysis Prompt'),
    numbered('OpenAI – Create Source Article Analysis'),
    numbered('Parse Source Article Analysis JSON'),
    numbered('Create Source Article Analysis'),

    heading1('Input Gates'),
    paragraph('The current workflow is intentionally conservative. It only finds one article per manual run and only targets records that are ready for source analysis.'),
    codeBlock(`Article gate:
AND(
  LEN({Article Sources} & "") > 0,
  LEN({Source Article Analysis} & "") = 0,
  {Generate Draft?} = 1
)

Source Packet gate:
AND(
  {Article Record ID} = current Article record ID,
  {Use in Draft?} = 1,
  {Ready to Generate Draft?} = 1,
  {Processing Status} = 'Approved'
)`, 'plain text'),

    heading1('Airtable Tables'),
    bullet('Articles: tblF0ghefGC2Bzh9K'),
    bullet('Article Sources: tblDnpg82CcOvwXue'),
    bullet('BAAD Source Packets: tblSqHcS5tsj6oBha'),
    bullet('Source Article Analysis: tblYUDKQuOTnOhHSk'),

    heading1('Key Source Article Analysis Fields'),
    paragraph('The Source Article Analysis table stores structured editorial guidance for draft generation. The most important fields are:'),
    bullet('Analysis Name'),
    bullet('Article'),
    bullet('Source URL'),
    bullet('Source Outlet'),
    bullet('Source Title'),
    bullet('Source Article Summary'),
    bullet('Primary Scenario'),
    bullet('Secondary Scenario'),
    bullet('Main Article Shape'),
    bullet('Article Focus Type'),
    bullet('Article Purpose'),
    bullet('Current Exhibition or Project?'),
    bullet('Exhibition / Project Names'),
    bullet('Venue / Institution Names'),
    bullet('Dates Mentioned'),
    bullet('Timeliness Hook Type'),
    bullet('Specific Artwork Focus?'),
    bullet('Specific Artwork Titles'),
    bullet('Artist / Subject Names'),
    bullet('Lead With'),
    bullet('Best BAAD Angle'),
    bullet('Why This Matters for BAAD'),
    bullet('Must Preserve'),
    bullet('Avoid Overemphasising'),
    bullet('Recommended BAAD Blueprint'),
    bullet('Recommended BAAD Article Shape'),
    bullet('Needs Human Review?'),
    bullet('Human Review Reason'),
    bullet('Analysis Status'),
    bullet('Analysis JSON'),
    bullet('BAAD Categories'),
    bullet('Media / Film Hook?'),
    bullet('Multi-Artist Article?'),
    bullet('BAAD Anchor Artist(s)'),
    bullet('Non-Anchor Artist(s)'),
    bullet('Framing Balance'),
    bullet('BAAD-Anchor Opening Rule'),

    heading1('How Generate BAAD Draft Should Use Source Article Analysis'),
    paragraph('Generate BAAD Draft should treat Source Article Analysis as editorial guidance, not as factual source material. The facts still come from Article Sources and approved Source Packets.'),
    bullet('Use Primary Scenario to understand the article type.'),
    bullet('Use Recommended BAAD Blueprint to choose the Style Blueprint where possible.'),
    bullet('Use Lead With to guide the opening emphasis.'),
    bullet('Use Best BAAD Angle to shape the article’s editorial direction.'),
    bullet('Use Must Preserve as source-backed constraints.'),
    bullet('Use Avoid Overemphasising as negative instructions.'),
    bullet('Use BAAD-Anchor Opening Rule for multi-artist or BAAD-anchor-sensitive stories.'),
    bullet('Do not run production draft generation when Source Article Analysis is missing, unless an intentional fallback/test route is being used.'),

    heading1('Relationship to Source Packets'),
    paragraph('Source Packets are the evidence layer. Source Article Analysis is the decision layer. The analysis workflow should use approved Source Packets as its highest-priority evidence when deciding the article shape and BAAD angle.'),
    bullet('Approved Source Packets should be used only when Processing Status is Approved, Use in Draft? is checked, and Ready to Generate Draft? is checked.'),
    bullet('Source Packets provide verified facts, prompt-ready extracts, quote candidates, source meaning to recast, editorial use notes, and copying-risk guidance.'),
    bullet('Source Article Analysis should not copy Source Packet wording. It should convert packet evidence into structured editorial decisions.'),
    bullet('If no approved Source Packets are found, the workflow can still create analysis from Article Sources, but it should mark Needs Human Review? true unless source evidence is clearly strong enough.'),

    heading1('Testing Procedure'),
    numbered('Keep Create Source Article Analysis – Production Candidate inactive/manual.'),
    numbered('Check credentials on all Airtable nodes and the OpenAI node.'),
    numbered('Choose exactly one Airtable Article where Article Sources exists, Source Article Analysis is empty, and Generate Draft? is checked.'),
    numbered('Temporarily uncheck Generate Draft? on other matching Articles to avoid analysing the wrong record.'),
    numbered('Run the workflow manually.'),
    numbered('Verify a Source Article Analysis record is created.'),
    numbered('Verify the new Source Article Analysis record is linked back to the Article.'),
    numbered('Inspect Primary Scenario, Recommended BAAD Blueprint, Lead With, Best BAAD Angle, Must Preserve, Avoid Overemphasising, and Human Review Reason.'),
    numbered('If the analysis is structurally correct, then test Generate BAAD Draft using that linked Source Article Analysis.'),
    numbered('Only after successful manual tests should the workflow be considered for production activation.'),

    heading1('Known Current State'),
    bullet('The workflow candidate has been created and imported into n8n.'),
    bullet('It has not yet been executed.'),
    bullet('It is limited to one Article per manual execution.'),
    bullet('It continues even when no approved Source Packets are found, using a fallback prompt rule.'),
    bullet('It filters empty Airtable placeholder output from the Source Packet search.'),
    bullet('It should remain inactive until manual testing passes.'),

    heading1('Follow-up Improvements'),
    bullet('Add or confirm a dedicated Article field such as Generate Source Analysis? or Source Analysis Status, so source-analysis triggering is separate from Generate Draft?.'),
    bullet('Create safer status flow: Needs Source Analysis → Source Analysis Complete → Ready for Draft.'),
    bullet('Backfill Source Article Analysis for existing queued Articles.'),
    bullet('Confirm Source Article Analysis select values stay aligned with Airtable.'),
    bullet('Add error/status handling for failed OpenAI parsing or Airtable create errors.'),
    bullet('Later, support update existing Source Article Analysis records instead of create-only.'),
    bullet('Add Notion/Airtable documentation whenever Source Article Analysis fields or prompt rules change.'),

    heading1('Production Rule'),
    paragraph('Do not treat Source Article Analysis as optional in the mature BAAD editorial system. It should become the normal editorial decision layer between approved Source Packets and Generate BAAD Draft.'),
  ];
}

async function main() {
  let section = await findChildPage(HQ_PAGE_ID, SECTION_TITLE);

  if (!section) {
    section = await createChildPage(HQ_PAGE_ID, SECTION_TITLE);
    console.log(`Created section: ${SECTION_TITLE}`);
  } else {
    console.log(`Found section: ${SECTION_TITLE}`);
  }

  const sectionId = section.id;
  const existingGuide = await findChildPage(sectionId, GUIDE_TITLE);

  if (existingGuide) {
    console.log(`Guide already exists: ${GUIDE_TITLE}`);
    console.log(`Page ID: ${existingGuide.id}`);
    console.log(`URL: https://www.notion.so/${existingGuide.id.replace(/-/g, '')}`);
    return;
  }

  const guide = await createChildPage(sectionId, GUIDE_TITLE);
  await appendBlocks(guide.id, guideBlocks());

  console.log(`Created guide: ${GUIDE_TITLE}`);
  console.log(`Page ID: ${guide.id}`);
  console.log(`URL: ${guide.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
