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
const PAGE_TITLE = 'Yinka Ilori — Regenerated Draft Test Output — 2026-06-20';

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

function bullet(text) {
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rich(text) } };
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
      title: { title: pageTitle(title) },
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

const regeneratedDraft = {
  articleId: 'recox39UXZK7pdkJc',
  sourceAnalysisId: 'recgD7yIjOlKi7Oah',
  workflow: 'Generate BAAD Draft – Yinka Source Analysis Regeneration Test',
  testType: 'Controlled regeneration test',
  baadTitle: 'Yinka Ilori Layers Flowers, Lace and Sound at Cristea Roberts Gallery',
  baadDek: 'At Cristea Roberts Gallery in London, Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best gathers over 20 new and recent works by the British Nigerian artist and designer.',
  baadEditorSummary: 'A concise exhibition preview of Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best at Cristea Roberts Gallery, focusing on floral imagery, lace patterns, percussion and immersive sound.',
  baadMetaDescription: 'Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best runs at Cristea Roberts Gallery, London, from 5 June to 11 July 2026.',
  baadSeoTitle: 'Yinka Ilori: Joy Through Resistance at Cristea Roberts Gallery',
  baadBody: `<p>Yinka Ilori layers Nigerian yellow trumpet flowers and daffodils over ornamental lace patterns in <em>Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best</em>. The pairing draws Nigeria and the UK into the same visual field, while flowers, lace, percussion and sound carry the British Nigerian artist and designer’s interest in joy, memory and resistance.</p>

<p>Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, will present the show from 5 June to 11 July 2026. Cristea Roberts presents it as Ilori’s first solo gallery exhibition in his home city, and his first solo exhibition with the gallery since joining in 2023. More than 20 new and recent works are included, spanning painting, print, sculpture and immersive sound.</p>

<p>The floral pieces include <em>Paradise for All</em>, 2024, a group of six screenprints, and <em>An Abundance of Flowers blessed by us, for us</em>, 2026. Across them, Ilori places the yellow trumpet, Nigeria’s national flower, alongside the daffodil, common in the UK. Lace patterns run through the compositions, drawing on lace and Swiss voile as materials associated with ceremonial and church attire in the West African diaspora and beyond.</p>

<p>That material language continues in the sculptural and audio elements. Handmade congas, a custom-made shekere and a drumkit enveloped in lace connect the exhibition to percussion, worship and communal gathering; Ilori learned drums as a child in church. For the sound installation, Peter Adjaye and James William Blades have developed new music in response to Ilori’s recent work. Blades’ piece incorporates field recordings, Yoruba lullabies, church songs, linguistic training records and Nigerian blow horn samples.</p>

<p>Ilori has described the exhibition as &ldquo;my most personal to date&rdquo; and &ldquo;a reflection of my own story and the resilience of the diaspora.&rdquo; Admission to Cristea Roberts Gallery is free. An opening reception is scheduled for 6pm on Friday 5 June 2026 during London Gallery Weekend, with the exhibition continuing until 11 July 2026.</p>`
};

function guideBlocks() {
  return [
    heading1('Yinka Ilori — Regenerated Draft Test Output'),
    paragraph('This page archives the regenerated Yinka Ilori draft produced after adding a linked Source Article Analysis record and using the Source Packet role prompt-lite workflow. It should be compared with the earlier baseline draft.'),

    heading2('Test Status'),
    bullet('Workflow: Generate BAAD Draft – Yinka Source Analysis Regeneration Test'),
    bullet('Test type: controlled regeneration test'),
    bullet('Article: Yinka Ilori — Joy Through Resistance'),
    bullet('Article record ID: recox39UXZK7pdkJc'),
    bullet('Source Article Analysis record ID: recgD7yIjOlKi7Oah'),
    bullet('Approved Source Packets used: 2'),
    bullet('Result: technically passed. Draft was generated and saved back to Airtable.'),

    heading2('Quality Assessment'),
    bullet('Technical result: PASS.'),
    bullet('Source Article Analysis usage: PASS.'),
    bullet('Source Packet role usage: PASS.'),
    bullet('Human-review sensitivity handling: PASS.'),
    bullet('Editorial rhythm: needs improvement. The draft is too mechanical around venue/date/practical details.'),
    bullet('Prompt refinement needed later: improve natural editorial rhythm around venue, dates and practical details without losing safety controls.'),

    heading2('Important Prompt Refinement Note'),
    paragraph('A generic instruction such as “do not be technical” is not enough to fix this problem. The issue is not technical jargon; it is administrative/listing-style prose caused by the prompt requiring venue, date and source-preservation details too literally. The Build Draft Prompt and possibly the Style Blueprint should be patched with specific rhythm rules.'),

    heading2('Recommended Future Prompt Patch'),
    bullet('Do not front-load full address/date details as a listing in paragraph two.'),
    bullet('Fold venue and dates into editorial prose unless the article is an event listing.'),
    bullet('Keep full street address, opening reception and extended hours for the final practical paragraph when needed.'),
    bullet('Avoid stiff phrases such as “Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, will present the show...”'),
    bullet('Avoid mechanical source-attribution phrasing unless direct quote, disputed claim or source-sensitive interpretation requires it.'),
    bullet('Preserve safety controls: no invented facts, no sensitive Wallpaper details without editorial need, no overclaiming, no unsupported criticism.'),

    heading2('Generated BAAD Title'),
    paragraph(regeneratedDraft.baadTitle),

    heading2('Generated BAAD Dek'),
    paragraph(regeneratedDraft.baadDek),

    heading2('Generated BAAD Editor Summary'),
    paragraph(regeneratedDraft.baadEditorSummary),

    heading2('Generated BAAD Meta Description'),
    paragraph(regeneratedDraft.baadMetaDescription),

    heading2('Generated BAAD SEO Title'),
    paragraph(regeneratedDraft.baadSeoTitle),

    heading2('Generated BAAD Body'),
    codeBlock(regeneratedDraft.baadBody, 'html'),

    heading2('Full Regenerated Draft JSON'),
    codeBlock(JSON.stringify(regeneratedDraft, null, 2), 'json'),
  ];
}

async function main() {
  const section = await findChildPage(HQ_PAGE_ID, SECTION_TITLE);

  if (!section) {
    console.error(`Could not find section: ${SECTION_TITLE}`);
    process.exit(1);
  }

  const existing = await findChildPage(section.id, PAGE_TITLE);

  if (existing) {
    console.log(`Page already exists: ${PAGE_TITLE}`);
    console.log(`Page ID: ${existing.id}`);
    console.log(`URL: https://www.notion.so/${existing.id.replace(/-/g, '')}`);
    return;
  }

  const page = await createChildPage(section.id, PAGE_TITLE);
  await appendBlocks(page.id, guideBlocks());

  console.log(`Created page: ${PAGE_TITLE}`);
  console.log(`Page ID: ${page.id}`);
  console.log(`URL: ${page.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
