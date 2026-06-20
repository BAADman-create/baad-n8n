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
const PAGE_TITLE = 'Yinka Ilori — Production Candidate Draft Test Output — 2026-06-20';

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

const productionDraft = {
  articleId: 'recox39UXZK7pdkJc',
  sourceAnalysisId: 'recgD7yIjOlKi7Oah',
  workflow: 'Generate BAAD Draft – Source Packet Role Prompt Lite Production Candidate',
  workflowCommit: 'd26018f',
  testType: 'Production candidate controlled queue test',
  baadTitle: 'Yinka Ilori Layers Flowers, Lace and Sound at Cristea Roberts',
  baadDek: 'Joy Through Resistance: He Who Laughs Last, Laughs Best brings painting, print, sculpture and commissioned sound into a personal London exhibition.',
  baadEditorSummary: 'A concise BAAD preview of Yinka Ilori’s 2026 Cristea Roberts Gallery exhibition, focused on flowers, lace, percussion and commissioned sound.',
  baadMetaDescription: 'Yinka Ilori’s Joy Through Resistance opens at Cristea Roberts Gallery, London, with works across painting, print, sculpture and sound.',
  baadSeoTitle: 'Yinka Ilori: Joy Through Resistance at Cristea Roberts Gallery',
  baadBody: `<p>Yinka Ilori layers Nigerian yellow trumpet flowers and UK-associated daffodils over ornamental lace in <em>Joy Through Resistance: He Who Laughs Last, Laughs Best</em>. Floral motifs, patterned fabric, percussion and sound carry his British Nigerian references into the gallery, with objects that point toward ceremony, worship, pride and endurance.</p>

<p>At Cristea Roberts Gallery in London, the exhibition runs from 5 June to 11 July 2026 and brings together more than 20 new and recent works across painting, print, sculpture and an immersive sound installation. Cristea Roberts describes it as Ilori’s first solo gallery exhibition in his home city, and his first solo exhibition with the gallery since joining its programme in 2023.</p>

<p>The flower pieces include the six-screenprint group <em>Paradise for All</em>, 2024, and <em>An Abundance of Flowers blessed by us, for us</em>, 2026. In these works, the Nigerian yellow trumpet and the daffodil appear alongside ornamental lace patterns. Lace, including Swiss voile, is linked in the exhibition materials to ceremonial and church dress in the West African diaspora and beyond, giving the surface a social charge without treating pattern as simple decoration.</p>

<p>That attention to fabric carries into the sculptural and sonic elements. Handmade congas, a custom-made shekere and a drumkit enveloped in lace sit within a project that also recalls Ilori learning drums as a child in church. The sound installation includes new music by Peter Adjaye and James William Blades: Adjaye’s piece features horns and brass instruments, while Blades’ work incorporates field recordings, Yoruba lullabies, church songs, linguistic training records and Nigerian blow horn samples.</p>

<p>Ilori has called the exhibition &ldquo;my most personal to date&rdquo; and &ldquo;a reflection of my own story and the resilience of the diaspora.&rdquo; The personal framing is carried through the materials themselves: yellow flowers, patterned lace, wrapped instruments and sound holding joy and resistance in the same space.</p>

<p><em>Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best</em> is at Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, from 5 June to 11 July 2026. Admission is free, with an opening reception scheduled for 6pm on Friday 5 June 2026 during London Gallery Weekend.</p>`
};

function guideBlocks() {
  return [
    heading1('Yinka Ilori — Production Candidate Draft Test Output'),
    paragraph('This page archives the BAAD draft generated by the patched production candidate workflow after the editorial-rhythm rule was copied from the Yinka-only test workflow into the production candidate.'),

    heading2('Test Status'),
    bullet('Workflow: Generate BAAD Draft – Source Packet Role Prompt Lite Production Candidate'),
    bullet('Workflow commit tested: d26018f'),
    bullet('Test type: controlled production-candidate queue test'),
    bullet('Article: Yinka Ilori — Joy Through Resistance'),
    bullet('Article record ID: recox39UXZK7pdkJc'),
    bullet('Source Article Analysis record ID: recgD7yIjOlKi7Oah'),
    bullet('Queue before run: exactly 1 matching record.'),
    bullet('Review Status after run: Draft Generated.'),
    bullet('Result: production candidate passed controlled test.'),

    heading2('What This Confirms'),
    bullet('The production candidate correctly picked up a queued Airtable article.'),
    bullet('The workflow used the linked Source Article Analysis.'),
    bullet('The workflow used the linked BAAD Source Packets.'),
    bullet('The editorial-rhythm patch worked in the production candidate.'),
    bullet('Venue/date details were folded into editorial prose rather than listing-style copy.'),
    bullet('Full address and practical details appeared in the final paragraph.'),

    heading2('Remaining Minor Style Notes'),
    bullet('“UK-associated daffodils” is accurate but awkward. Future prompt refinement should prefer phrases such as “daffodils familiar in the UK” or “daffodils common in the UK.”'),
    bullet('“Cristea Roberts describes it as...” is safer than unsupported assertion, but still slightly mechanical. Future prompt refinement could soften attribution phrasing further.'),
    bullet('This is not blocking. The production candidate is strong enough for the next controlled queue test.'),

    heading2('Generated BAAD Title'),
    paragraph(productionDraft.baadTitle),

    heading2('Generated BAAD Dek'),
    paragraph(productionDraft.baadDek),

    heading2('Generated BAAD Editor Summary'),
    paragraph(productionDraft.baadEditorSummary),

    heading2('Generated BAAD Meta Description'),
    paragraph(productionDraft.baadMetaDescription),

    heading2('Generated BAAD SEO Title'),
    paragraph(productionDraft.baadSeoTitle),

    heading2('Generated BAAD Body'),
    codeBlock(productionDraft.baadBody, 'html'),

    heading2('Full Production Candidate Draft JSON'),
    codeBlock(JSON.stringify(productionDraft, null, 2), 'json'),
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
