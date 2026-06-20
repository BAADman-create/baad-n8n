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
const PAGE_TITLE = 'Yinka Ilori — Editorial Rhythm Patch Test Output — 2026-06-20';

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

const improvedDraft = {
  articleId: 'recox39UXZK7pdkJc',
  sourceAnalysisId: 'recgD7yIjOlKi7Oah',
  workflow: 'Generate BAAD Draft – Yinka Source Analysis Regeneration Test',
  workflowCommit: 'f9eff90',
  testType: 'Editorial rhythm patch regeneration test',
  baadTitle: 'Yinka Ilori Layers Flowers, Lace and Percussion at Cristea Roberts',
  baadDek: 'Opening in London in June 2026, Joy Through Resistance brings together new and recent painting, print, sculpture and immersive sound.',
  baadEditorSummary: 'A concise exhibition preview of Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best at Cristea Roberts Gallery, focused on Ilori’s use of flowers, lace, percussion and commissioned sound.',
  baadMetaDescription: 'Yinka Ilori’s Joy Through Resistance opens at Cristea Roberts Gallery, London, with flowers, lace-wrapped percussion and immersive sound.',
  baadSeoTitle: 'Yinka Ilori: Joy Through Resistance at Cristea Roberts Gallery',
  baadBody: `<p>Yinka Ilori layers Nigerian yellow trumpet flowers and UK-associated daffodils over ornamental lace patterns, setting bright floral forms against fabric codes tied to ceremony, pride and endurance. In <em>Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best</em>, the British Nigerian artist and designer carries that language beyond the image plane into percussion instruments made or wrapped for the gallery space.</p>

<p>At Cristea Roberts Gallery in London, the show runs from 5 June to 11 July 2026 and brings together over 20 new and recent works across painting, print, sculpture and immersive sound. Cristea Roberts identifies it as Ilori’s first solo gallery exhibition in his home city, and his first solo exhibition at the gallery since joining it in 2023.</p>

<p>Among the flower works are <em>Paradise for All</em>, 2024, a group of six screenprints, and <em>An Abundance of Flowers blessed by us, for us</em>, 2026. Ilori places the yellow trumpet, Nigeria’s national flower, alongside the daffodil, treated here as a flower familiar in the UK. Their shared yellow tones and layered lace grounds connect the works to British Nigerian identity, ceremonial dress, pride, hardship and resilience without reducing them to a single symbol.</p>

<p>That material language continues through handmade congas, a custom-made shekere and a drumkit enveloped in lace. Ilori learned drums as a child in church, and the sound commissions draw on that relationship between percussion, worship and gathering. Peter Adjaye has created one new piece with horns and brass instruments; James William Blades’ contribution incorporates field recordings, Yoruba lullabies, church songs, linguistic training records and Nigerian blow horn samples.</p>

<p>Ilori has called the exhibition “my most personal to date” and “a reflection of my own story and the resilience of the diaspora.” <em>Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best</em> is on view at Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, from 5 June to 11 July 2026. Admission is free, with an opening reception scheduled for 6pm on Friday 5 June 2026 during London Gallery Weekend.</p>`
};

const patchRules = `EDITORIAL RHYTHM FOR VENUE / DATE / PRACTICAL DETAILS:
- Keep venue, city, dates, admission, opening reception, and address facts accurate, but do not write them as listing copy.
- Do not front-load full postal addresses in the first half of the article unless the location itself is editorially meaningful.
- Fold venue, city, and date information into natural editorial sentences.
- Prefer sentences like: “Opening at Cristea Roberts Gallery in London, the exhibition runs from 5 June to 11 July 2026 and brings together more than 20 new and recent works across painting, print, sculpture and sound.”
- Avoid stiff administrative constructions such as: “Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, will present the show from 5 June to 11 July 2026.”
- Avoid formulaic source-attribution constructions such as: “Cristea Roberts presents it as...” unless attribution is needed for a direct quote, disputed claim, or source-sensitive claim.
- Put full address, admission, reception time, extended hours, and visitor logistics near the final paragraph when they are useful.
- Do not let practical details interrupt the article’s editorial rhythm.
- Preserve required facts, but make the published prose read like an edited BAAD article, not an Airtable record, event listing, press release, or workflow output.`;

function guideBlocks() {
  return [
    heading1('Yinka Ilori — Editorial Rhythm Patch Test Output'),
    paragraph('This page archives the improved Yinka Ilori regeneration test after adding explicit editorial rhythm rules for venue, date, address and practical details in the Build Draft Prompt node.'),

    heading2('Test Status'),
    bullet('Workflow: Generate BAAD Draft – Yinka Source Analysis Regeneration Test'),
    bullet('Workflow commit tested: f9eff90'),
    bullet('Article: Yinka Ilori — Joy Through Resistance'),
    bullet('Article record ID: recox39UXZK7pdkJc'),
    bullet('Source Article Analysis record ID: recgD7yIjOlKi7Oah'),
    bullet('Result: technical pass and editorial-rhythm improvement.'),
    bullet('The test no longer produced the stiff sentence: “Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, will present the show...”'),

    heading2('What Improved'),
    bullet('Venue/date information was folded into a more natural editorial sentence.'),
    bullet('Full address and practical details moved to the final paragraph.'),
    bullet('Source Article Analysis and Source Packet safety controls remained intact.'),
    bullet('The draft kept the focus on material/process: flowers, lace, percussion and sound.'),
    bullet('Sensitive Wallpaper material remained restrained and was not overused.'),

    heading2('Before / After Comparison'),
    paragraph('Before patch:'),
    codeBlock('Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG, will present the show from 5 June to 11 July 2026.', 'plain text'),
    paragraph('After patch:'),
    codeBlock('At Cristea Roberts Gallery in London, the show runs from 5 June to 11 July 2026 and brings together over 20 new and recent works across painting, print, sculpture and immersive sound.', 'plain text'),

    heading2('Remaining Minor Style Notes'),
    bullet('“UK-associated daffodils” is accurate but slightly awkward. Prefer “daffodils familiar in the UK” or “daffodils common in the UK.”'),
    bullet('“Cristea Roberts identifies it as...” is safe but still slightly mechanical. Later prompt refinement could soften this attribution phrase.'),
    bullet('This test is strong enough to copy the editorial rhythm rule into the production candidate after one final check.'),

    heading2('Prompt Patch Added'),
    codeBlock(patchRules, 'plain text'),

    heading2('Generated BAAD Title'),
    paragraph(improvedDraft.baadTitle),

    heading2('Generated BAAD Dek'),
    paragraph(improvedDraft.baadDek),

    heading2('Generated BAAD Editor Summary'),
    paragraph(improvedDraft.baadEditorSummary),

    heading2('Generated BAAD Meta Description'),
    paragraph(improvedDraft.baadMetaDescription),

    heading2('Generated BAAD SEO Title'),
    paragraph(improvedDraft.baadSeoTitle),

    heading2('Generated BAAD Body'),
    codeBlock(improvedDraft.baadBody, 'html'),

    heading2('Full Improved Draft JSON'),
    codeBlock(JSON.stringify(improvedDraft, null, 2), 'json'),
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
