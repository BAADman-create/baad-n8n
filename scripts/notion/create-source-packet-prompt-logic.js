const NOTION_TOKEN =
  process.env.NOTION_TOKEN ||
  process.env.NOTION_API_KEY ||
  process.env.NOTION_SECRET;

if (!NOTION_TOKEN) {
  console.error('Missing Notion token. Set NOTION_TOKEN, NOTION_API_KEY, or NOTION_SECRET in your shell environment.');
  process.exit(1);
}

const NOTION_VERSION = '2022-06-28';

// Existing Notion section created earlier:
// BAAD Editorial Intelligence HQ → 03 Source Packet System
const SOURCE_PACKET_SECTION_PAGE_ID = '38416598-b06e-81e1-bd39-e6ca94a7b566';

const PAGE_TITLE = 'BAAD Source Packet Prompt Logic';

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

function divider() {
  return { object: 'block', type: 'divider', divider: {} };
}

async function listChildren(blockId) {
  const results = [];
  let cursor;

  do {
    const query = cursor ? `?page_size=100&start_cursor=${cursor}` : '?page_size=100';
    const data = await notion('GET', `/blocks/${blockId}/children${query}`);
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return results;
}

async function findChildPageByTitle(parentBlockId, title) {
  const children = await listChildren(parentBlockId);
  return children.find((block) => block.type === 'child_page' && block.child_page?.title === title);
}

async function createPage(parentPageId, title) {
  return notion('POST', '/pages', {
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: rich(title),
      },
    },
  });
}

async function appendBlocks(blockId, blocks) {
  for (let i = 0; i < blocks.length; i += 90) {
    await notion('PATCH', `/blocks/${blockId}/children`, {
      children: blocks.slice(i, i + 90),
    });
  }
}

const outputJsonSchema = `{
  "sourceType": "Gallery Press Release | Artist Bio | Artist Statement | Interview | Museum / Institution Page | Review / Article | Exhibition Listing | Book / Film / Media Source | Other",
  "sourcePublisher": "",
  "sourceTitle": "",
  "sourceUrl": "",
  "sourceReliability": "high | medium | low",
  "copyingRisk": "high | medium | low",
  "shortSourceSummary": "",
  "verifiedFacts": [],
  "materialProcessDetails": [],
  "quoteCandidates": [],
  "quoteUseNotes": "",
  "sourceMeaningToRecast": [],
  "avoidCopyingNotes": [],
  "editorialUseNotes": "",
  "promptReadyExtract": "",
  "humanReviewNeeded": false,
  "humanReviewNotes": "",
  "recommendedDraftUse": "factual_skeleton | artist_voice | context | external_interpretation | closing_info | discovery_only",
  "draftUsePriority": 1
}`;

const promptSkeleton = `You are creating a BAAD Source Packet.

Your job is not to write the article.
Your job is to transform the source into verified, prompt-ready editorial evidence.

Read the source and produce structured JSON only.

Rules:
- Separate verified facts from interpretation.
- Do not copy the source's editorial language unless it is a direct quote candidate.
- Preserve exact names, titles, dates, venues, locations, mediums, and artwork details.
- Flag promotional or unsupported claims.
- Flag human review when the source is thin, sensitive, ambiguous, opinion-heavy, or high-risk.
- Use the source type rules from the BAAD Source Packet Source Type Guide.
- Never invent facts.
- Never infer biography, motive, career-span claims, or critical importance unless explicitly supported.

Return valid JSON only.`;

const blocks = [
  heading1('BAAD Source Packet Prompt Logic'),
  paragraph('Version 1. This page translates the BAAD Source Packet Source Type Guide into practical prompt logic for n8n/OpenAI. It defines what the Source Packet generation prompt should do, how it should classify source material, and what structured fields it should return.'),
  divider(),

  heading1('Purpose'),
  paragraph('The Source Packet prompt exists to convert raw source material into structured editorial evidence. It should not write a BAAD article. It should prepare verified facts, useful quotes, copying-risk notes, and editorial-use guidance so that the later draft-generation prompt can write with more precision and originality.'),
  paragraph('The Source Packet layer sits between raw source intake and BAAD article generation. It gives the draft workflow a cleaner, safer, more editorially intelligent evidence layer.'),

  heading1('Core Prompt Role'),
  codeBlock(promptSkeleton),

  heading1('Required Inputs'),
  paragraph('The n8n prompt should ideally provide these inputs to the OpenAI node:'),
  bullet('Article record ID'),
  bullet('Source record ID'),
  bullet('Source title'),
  bullet('Source publisher / outlet'),
  bullet('Source URL'),
  bullet('Source date, if known'),
  bullet('Raw source body or extract'),
  bullet('Known article category, such as Art, Design, Film, Books, Architecture, Fashion, Performance, or Photography'),
  bullet('Known artist or entity names'),
  bullet('Known exhibition/project title, if available'),
  bullet('BAAD Source Packet Source Type Guide summary or compressed rules'),

  heading1('Source Type Classification'),
  paragraph('The prompt should classify each source into one primary source type. It may note a secondary source type in editorial notes, but the main output field should contain one sourceType.'),
  bullet('Gallery Press Release'),
  bullet('Artist Bio'),
  bullet('Artist Statement'),
  bullet('Interview'),
  bullet('Museum / Institution Page'),
  bullet('Review / Article'),
  bullet('Exhibition Listing'),
  bullet('Book / Film / Media Source'),
  bullet('Other'),

  heading2('Classification Rules'),
  bullet('If the source is official gallery text announcing or describing a show, classify it as Gallery Press Release.'),
  bullet('If it mainly summarises the artist’s life, education, exhibitions, awards, and practice, classify it as Artist Bio.'),
  bullet('If it is written in the artist’s voice or explains the artist’s intentions, classify it as Artist Statement.'),
  bullet('If it is question-and-answer or built around direct conversation, classify it as Interview.'),
  bullet('If it comes from a museum, biennial, archive, public institution, or university gallery, classify it as Museum / Institution Page.'),
  bullet('If it is a third-party editorial text, review, magazine article, or critic/journalist article, classify it as Review / Article.'),
  bullet('If it is a short event/listing/directory page, classify it as Exhibition Listing.'),
  bullet('If it describes a book, film, documentary, episode, catalogue, podcast, or media work, classify it as Book / Film / Media Source.'),

  heading1('Output JSON Schema'),
  paragraph('The OpenAI node should return JSON only. The output should be parseable by n8n and mapped directly into Airtable Source Packet fields.'),
  codeBlock(outputJsonSchema, 'json'),

  heading1('Field Logic'),
  heading2('sourceReliability'),
  bullet('high: official source, direct artist/institution/gallery source, or clear interview with direct attribution.'),
  bullet('medium: third-party article, review, listing, or source with some interpretation but usable facts.'),
  bullet('low: very short, unclear, unattributed, heavily promotional, scraped with missing context, or not enough useful details.'),

  heading2('copyingRisk'),
  bullet('high: gallery press releases, reviews/articles, artist statements, publisher blurbs, and any source with distinctive prose.'),
  bullet('medium: museum pages, interviews, longer listings, and institutional descriptions.'),
  bullet('low: simple factual records, basic event listings, or structured data with little prose.'),

  heading2('verifiedFacts'),
  paragraph('This should contain only facts directly supported by the source. These should be short, concrete, and article-usable.'),
  bullet('Names, titles, dates, locations, venues, institutions, mediums, artwork titles, collaborators, composers, curators, publishers, and clearly stated project facts.'),
  bullet('Do not include broad interpretation or promotional claims in verifiedFacts unless phrased as source attribution.'),

  heading2('materialProcessDetails'),
  paragraph('This should capture concrete details about how the work is made, what materials are used, what forms are present, and what viewers encounter.'),
  bullet('Examples: flowers layered over lace, handmade congas, pigment prints, field recordings, Yoruba lullabies, archival photographs, ceramic vessels, textile installation.'),
  bullet('This field is important because BAAD writing should move from physical detail to meaning.'),

  heading2('quoteCandidates'),
  paragraph('This should include short quote candidates only when the source contains clearly attributable quotes. Do not fabricate quotes.'),
  bullet('Prefer quotes that reveal process, material meaning, personal stakes, cultural context, or the artist’s own framing.'),
  bullet('Avoid generic excited/honoured quotes unless no stronger quote exists.'),
  bullet('For each quote candidate, include speaker and why the quote may be useful.'),

  heading2('sourceMeaningToRecast'),
  paragraph('This field should explain the source’s useful meaning in fresh language. It should not copy source phrasing.'),
  bullet('Use this for the ideas the BAAD draft may draw on: memory, community, ritual, diaspora, material contrast, design language, institutional context, etc.'),
  bullet('This field should help the draft prompt write originally without losing the source’s meaning.'),

  heading2('avoidCopyingNotes'),
  paragraph('This field should identify language, structure, or claims the draft must avoid copying.'),
  bullet('Flag distinctive openings, promotional descriptions, unique metaphors, critic thesis, publisher blurbs, and poetic artist-statement phrases.'),
  bullet('Also flag broad source claims that need attribution or should be softened.'),

  heading2('editorialUseNotes'),
  paragraph('This field tells the later draft workflow how to use the source. It should be practical and directive.'),
  bullet('Example: Use this source for factual skeleton and exhibition details, but avoid promotional language.'),
  bullet('Example: Use this source for artist voice and quote support, not for independent critical claims.'),
  bullet('Example: Use this source only as a discovery listing unless paired with stronger source material.'),

  heading2('promptReadyExtract'),
  paragraph('This should be a concise, clean extract that can be safely fed into the BAAD draft prompt. It should include facts and useful editorial context, but should not mimic the source’s prose.'),
  bullet('Keep it compact enough for prompt use.'),
  bullet('Prioritise concrete article-building details over general background.'),
  bullet('Include attribution where needed.'),

  heading2('humanReviewNeeded'),
  paragraph('Set humanReviewNeeded to true when the source can be useful but needs editorial judgement before automated drafting.'),
  bullet('Source is too short or thin.'),
  bullet('Source is the only evidence for a full article.'),
  bullet('Source contains sensitive material.'),
  bullet('Source is opinion-heavy or has legal/controversial claims.'),
  bullet('Copying risk is high and the draft may follow source structure.'),
  bullet('The source uses claims such as major, groundbreaking, first, leading, or unprecedented without enough evidence.'),

  heading2('recommendedDraftUse'),
  bullet('factual_skeleton: best for dates, venue, title, project facts, exhibition details.'),
  bullet('artist_voice: best for direct quotes, intention, process, personal framing.'),
  bullet('context: best for biography, institution, background, programme context.'),
  bullet('external_interpretation: best for third-party observations and critical context.'),
  bullet('closing_info: best for dates, venue, public programme, visitor info, publication/release details.'),
  bullet('discovery_only: useful for finding the story, but too thin for article generation alone.'),

  heading1('Prompt Behaviour Rules'),
  numbered('Do not write the final article.'),
  numbered('Do not summarise by copying source sentences.'),
  numbered('Do not invent facts, quotes, dates, locations, artworks, or motivations.'),
  numbered('Do not make career-span claims unless explicitly supported.'),
  numbered('Do not turn promotional language into BAAD editorial judgement.'),
  numbered('Do not treat a critic’s opinion as BAAD’s opinion unless clearly attributed.'),
  numbered('Do not overstate the importance of an exhibition, artwork, artist, or project.'),
  numbered('Prioritise material, process, artwork, place, voice, and specific cultural context.'),
  numbered('Flag human review rather than forcing certainty.'),

  heading1('Integration with Airtable'),
  paragraph('The Source Packet prompt output should map directly into Airtable fields in the BAAD Source Packets table. The most important fields for draft quality are:'),
  bullet('Source Type'),
  bullet('Source Reliability'),
  bullet('Rights / Copying Risk'),
  bullet('Short Source Summary'),
  bullet('Verified Facts'),
  bullet('Quote Candidates'),
  bullet('Quote Use Notes'),
  bullet('Source Meaning to Recast'),
  bullet('Avoid Copying Notes'),
  bullet('Editorial Use Notes'),
  bullet('Prompt-Ready Extract'),
  bullet('Human Review Needed?'),
  bullet('Human Review Notes'),
  bullet('Draft Use Priority'),
  bullet('Packet JSON'),

  heading1('Integration with n8n'),
  paragraph('In n8n, the Source Packet generation workflow should follow this basic shape:'),
  numbered('Receive or find an Article Source record.'),
  numbered('Normalise article/source context.'),
  numbered('Build Source Packet prompt using source text and source-type rules.'),
  numbered('Run OpenAI Source Packet analysis.'),
  numbered('Parse JSON safely.'),
  numbered('Validate required fields.'),
  numbered('Write/update BAAD Source Packet record in Airtable.'),
  numbered('Flag human review when needed.'),
  numbered('Link Source Packet back to the Article and/or Article Source.'),

  heading1('Immediate Next Automation Goal'),
  paragraph('The next n8n improvement should be to inspect the existing Source Packet workflow and update its prompt so it follows this prompt logic. The prompt should classify source type, produce structured JSON, and map cleanly into the BAAD Source Packets Airtable fields.'),
];

async function main() {
  const existing = await findChildPageByTitle(SOURCE_PACKET_SECTION_PAGE_ID, PAGE_TITLE);

  if (existing) {
    console.log('Page already exists. Not creating duplicate.');
    console.log('Existing page ID:', existing.id);
    console.log('URL: https://www.notion.so/' + existing.id.replace(/-/g, ''));
    return;
  }

  const page = await createPage(SOURCE_PACKET_SECTION_PAGE_ID, PAGE_TITLE);
  await appendBlocks(page.id, blocks);

  console.log('Created page:', PAGE_TITLE);
  console.log('Page ID:', page.id);
  console.log('Page URL:', page.url);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
