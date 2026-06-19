const NOTION_TOKEN =
  process.env.NOTION_TOKEN ||
  process.env.NOTION_API_KEY ||
  process.env.NOTION_SECRET;

if (!NOTION_TOKEN) {
  console.error('Missing Notion token. Set NOTION_TOKEN, NOTION_API_KEY, or NOTION_SECRET in your shell environment.');
  process.exit(1);
}

const NOTION_VERSION = '2022-06-28';

// Existing Notion section:
// BAAD Editorial Intelligence HQ → 03 Source Packet System
const SOURCE_PACKET_SECTION_PAGE_ID = '38416598-b06e-81e1-bd39-e6ca94a7b566';

const PAGE_TITLE = 'BAAD Source Packet → Draft Generation Rules';

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

const draftPacketUseSchema = `{
  "articleRecordId": "",
  "approvedSourcePackets": [],
  "primaryFactualPacket": "",
  "artistVoicePackets": [],
  "contextPackets": [],
  "externalInterpretationPackets": [],
  "closingInfoPackets": [],
  "doNotUsePackets": [],
  "draftInstructions": {
    "opening": "",
    "middle": "",
    "quoteUse": "",
    "materialProcessUse": "",
    "contextUse": "",
    "closing": "",
    "avoid": []
  },
  "humanReviewRequiredBeforeDraft": true
}`;

const yinkaExample = `Yinka Ilori example:

Cristea Roberts Gallery Source Packet
- Use as factual skeleton.
- Use for exhibition title, venue, dates, gallery, confirmed works, materials, installation details, composers, visitor facts, and official framing.
- Treat promotional claims as official gallery framing.
- Do not use gallery praise as BAAD criticism.

Wallpaper Source Packet
- Use for artist voice.
- Use for quotes, personal context, family/church/migration memory, artist explanation of joy, lace, sound, flowers, and gallery transition.
- Treat writer interpretation as external framing.
- Handle sensitive family/migration material carefully and only with attribution.
- Do not copy the article’s thesis, structure, headline language, or phrases such as “artist of joy” unless attributed and necessary.`;

const blocks = [
  heading1('BAAD Source Packet → Draft Generation Rules'),
  paragraph('Version 1. This guide defines how approved BAAD Source Packets should be used by the article draft-generation workflow. It bridges Source Packet creation and BAAD article writing.'),
  paragraph('The purpose is to make the draft workflow use each source according to its editorial role, rather than treating all source material as equal.'),
  divider(),

  heading1('Core Principle'),
  paragraph('The draft workflow should not simply ingest all source text and write from it. It should first understand the role of each Source Packet: factual skeleton, artist voice, context, external interpretation, closing information, or discovery-only material.'),
  paragraph('A BAAD draft should be built from approved, structured packet evidence. It should not copy the structure, thesis, promotional language, or article logic of any source.'),

  heading1('Source Packet Approval Rule'),
  paragraph('A Source Packet should only be used by the draft workflow when it is intentionally approved for draft use.'),
  bullet('Use in Draft? must be checked.'),
  bullet('Ready to Generate Draft? must be checked.'),
  bullet('Processing Status should normally be Approved.'),
  bullet('Human Review Needed? should be false, unless a human editor has reviewed the issue and deliberately approved the packet anyway.'),
  bullet('Avoid Copying? may remain true, but the draft prompt must then actively use Avoid Copying Notes.'),

  heading1('Draft-Use Roles'),
  heading2('1. Factual Skeleton'),
  paragraph('A factual skeleton packet gives the article its reliable facts. It usually comes from an official gallery, museum, institution, press release, project page, publisher page, or verified source.'),
  bullet('Use for title, artist, venue, dates, location, medium, works, collaborators, public programme, and official project framing.'),
  bullet('Do not use for independent critical judgement unless supported elsewhere.'),
  bullet('In the Yinka example, the Cristea Roberts Gallery packet is the factual skeleton.'),

  heading2('2. Artist Voice'),
  paragraph('An artist voice packet gives the article direct speech, motivation, process, personal stakes, and first-person framing. It usually comes from an interview, artist statement, Q&A, podcast transcript, or studio text.'),
  bullet('Use for quotes, process, intentions, memory, family, material meaning, and personal context.'),
  bullet('Handle sensitive personal details carefully.'),
  bullet('Do not turn the artist’s specific statement into a general career claim.'),
  bullet('In the Yinka example, the Wallpaper interview packet is the artist voice source.'),

  heading2('3. Material / Process Detail'),
  paragraph('Material/process detail can come from either official or interview sources. It is essential for BAAD’s visual and design-led writing.'),
  bullet('Prioritise concrete details: works, materials, surfaces, sounds, objects, colours, installation elements, image captions, dimensions, edition details, collaborators.'),
  bullet('Use material details to move from description to meaning.'),
  bullet('Do not write vague art language when the packet contains concrete details.'),

  heading2('4. Context'),
  paragraph('Context packets provide background that helps the reader understand the project. These may include artist bios, institutional pages, catalogue text, historical notes, or reliable third-party sources.'),
  bullet('Use for biography, previous commissions, institutional context, related exhibitions, public art history, or relevant cultural background.'),
  bullet('Do not over-expand context beyond what the source supports.'),
  bullet('Context should support the article, not overwhelm the main project.'),

  heading2('5. External Interpretation'),
  paragraph('External interpretation comes from reviews, articles, critics, journalists, or other third-party sources. It may be useful, but it has high copying risk.'),
  bullet('Use for reported observations, external framing, public reception, or critical context when clearly attributed.'),
  bullet('Do not adopt a critic’s view as BAAD’s view unless BAAD independently supports it.'),
  bullet('Do not copy the source article’s thesis, paragraph order, or opening logic.'),

  heading2('6. Closing Information'),
  paragraph('Closing information packets provide practical details for the end of the article.'),
  bullet('Use for exhibition dates, venue, city, opening hours, public events, admission, publication release dates, film/book availability, and official links.'),
  bullet('Closing paragraphs should be factual and concise.'),
  bullet('Do not introduce unsupported interpretation in the closing paragraph.'),

  divider(),

  heading1('How the Draft Workflow Should Rank Packets'),
  paragraph('When multiple approved Source Packets are available, the draft workflow should rank them by role, not just by length.'),
  numbered('Choose one primary factual skeleton packet.'),
  numbered('Identify artist voice packets and quote sources.'),
  numbered('Identify material/process details across all approved packets.'),
  numbered('Identify context packets and decide whether they are necessary.'),
  numbered('Identify external interpretation and copying-risk warnings.'),
  numbered('Identify closing information.'),
  numbered('Exclude discovery-only or do-not-use packets from article prose.'),

  heading1('Prompt Behaviour Rules'),
  numbered('Do not write from unapproved Source Packets.'),
  numbered('Do not treat all packets as equal.'),
  numbered('Do not copy any packet’s wording unless using a short, attributed quote.'),
  numbered('Do not use official-source promotional language as BAAD judgement.'),
  numbered('Do not use third-party interpretation as fact.'),
  numbered('Do not make career-span claims unless directly supported.'),
  numbered('Do not use sensitive personal material without attribution and editorial care.'),
  numbered('Do not use quote candidates just because they exist; choose only quotes that add something the article cannot say better in original prose.'),
  numbered('Use material and process details to make BAAD writing specific.'),
  numbered('When evidence is thin or conflicting, prefer a narrower article rather than invention.'),

  heading1('Opening Paragraph Rules'),
  paragraph('The opening should usually be built from the factual skeleton packet and the strongest concrete material/process detail.'),
  bullet('It should establish who, what, where, and why the project is worth attention.'),
  bullet('It should avoid promotional adjectives.'),
  bullet('It should not begin by copying the source article’s opening structure.'),
  bullet('For the Yinka example, the opening can combine the Cristea Roberts factual skeleton with concrete details: flowers, lace, instruments, and sound.'),

  heading1('Middle Paragraph Rules'),
  paragraph('The middle should develop the article through materials, process, artist voice, and context.'),
  bullet('Use official facts for what is in the exhibition.'),
  bullet('Use interview material for why those details matter to the artist.'),
  bullet('Use artist quotes sparingly and with attribution.'),
  bullet('Use Source Meaning to Recast fields to write original BAAD prose.'),
  bullet('Use Avoid Copying Notes as negative instructions.'),

  heading1('Quote Rules'),
  bullet('Use quotes when they add artist voice, specificity, or emotional/intellectual precision.'),
  bullet('Do not over-quote.'),
  bullet('Do not use quotes that are mainly promotional unless they serve a clear purpose.'),
  bullet('Sensitive quotes about family, migration, trauma, grief, discrimination, religion, or politics need extra care.'),
  bullet('Quotes from gallery directors or curators should not be used as evidence of critical consensus.'),

  heading1('Closing Paragraph Rules'),
  paragraph('The closing should return to practical facts and direct the reader without overstatement.'),
  bullet('Use dates, venue, city, official link, book/film release details, or public programme details.'),
  bullet('Do not introduce a new interpretive claim in the final sentence unless strongly supported.'),
  bullet('Avoid generic endings such as “the exhibition invites viewers to reflect...” unless made specific by the source.'),

  divider(),

  heading1('Yinka Ilori Prototype Case'),
  codeBlock(yinkaExample),

  heading1('Recommended Draft Packet Plan for Yinka Ilori'),
  heading2('Primary factual source'),
  bullet('Cristea Roberts Gallery packet.'),
  bullet('Use for title, exhibition dates, gallery, venue, city, works, media, flower/lace/instrument/sound details, collaborators, and official context.'),

  heading2('Primary artist voice source'),
  bullet('Wallpaper interview/article packet.'),
  bullet('Use for Ilori’s direct quotes about joy, church, migration memory, yellow flowers, lace, sound, and the move into a gallery setting.'),

  heading2('High-risk areas'),
  bullet('Do not copy the Wallpaper article’s thesis about where joy comes from.'),
  bullet('Do not copy the gallery’s promotional framing around joy, resistance, vitality, inventiveness, or important practice.'),
  bullet('Do not overstate claims about diaspora, church, migration, drums, or cultural symbolism without attribution.'),
  bullet('Do not use sensitive family/migration quotes casually or sensationally.'),

  heading2('Safe BAAD angle'),
  paragraph('A concise exhibition spotlight on how Yinka Ilori uses flowers, lace, percussion, and sound to connect British Nigerian identity, family memory, church, joy, and resistance, grounded in official exhibition facts and selected artist quotes.'),

  divider(),

  heading1('Draft-Generation Context Schema'),
  paragraph('Later, n8n can build a draft context object that looks like this before calling OpenAI:'),
  codeBlock(draftPacketUseSchema, 'json'),

  heading1('Immediate n8n Implementation Goal'),
  paragraph('The next n8n step is to inspect the Generate BAAD Draft workflow and confirm how approved Source Packets are currently attached to the draft prompt. Then update the Build Draft Prompt node so it uses packet roles more explicitly.'),
  bullet('Official/gallery packet should be treated as factual skeleton.'),
  bullet('Interview/article packet should be treated as artist voice or external interpretation depending on Source Type and recommendedDraftUse.'),
  bullet('Avoid Copying Notes should become hard negative instructions inside the draft prompt.'),
  bullet('Source Meaning to Recast should become the positive originality guide.'),
  bullet('Quote Candidates should be used selectively, not automatically.'),
  bullet('Human Review Needed packets should not be used unless approved intentionally.'),
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
