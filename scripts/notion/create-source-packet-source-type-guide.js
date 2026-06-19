const fs = require('fs');

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

const SECTION_TITLE = '03 Source Packet System';
const GUIDE_TITLE = 'BAAD Source Packet Source Type Guide';

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
  const value = String(text || '');
  return [{ type: 'text', text: { content: value.slice(0, 2000) } }];
}

function paragraph(text) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: rich(text) },
  };
}

function heading1(text) {
  return {
    object: 'block',
    type: 'heading_1',
    heading_1: { rich_text: rich(text) },
  };
}

function heading2(text) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: rich(text) },
  };
}

function heading3(text) {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: { rich_text: rich(text) },
  };
}

function bullet(text) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: rich(text) },
  };
}

function numbered(text) {
  return {
    object: 'block',
    type: 'numbered_list_item',
    numbered_list_item: { rich_text: rich(text) },
  };
}

function divider() {
  return {
    object: 'block',
    type: 'divider',
    divider: {},
  };
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
    const chunk = blocks.slice(i, i + 90);
    await notion('PATCH', `/blocks/${blockId}/children`, {
      children: chunk,
    });
  }
}

const sourceTypes = [
  {
    title: 'Gallery Press Release',
    definition: 'Official text issued by a gallery, dealer, fair booth, or exhibition organiser to announce or describe an exhibition, artist presentation, project, or represented artist.',
    trusted: [
      'Exhibition title, artist name, gallery name, venue location, and exhibition dates.',
      'Mediums included, number or type of works, listed artwork details, and installation details.',
      'Official exhibition framing, artist quotes, gallery director quotes, and basic artist biography if included.',
    ],
    caution: [
      'Treat promotional language such as major, groundbreaking, important, must-see, celebrated, leading, internationally renowned, and transformative as marketing unless supported by specific evidence.',
      'Do not automatically turn gallery claims into BAAD claims.',
    ],
    notTrusted: [
      'Critical consensus, market importance, long-term art-historical significance, or claims that an artist is one of the most important unless independently supported.',
      'Claims that an exhibition redefines a field or is historically unprecedented unless the evidence is explicit.',
    ],
    contributes: [
      'Provides the factual skeleton: what is happening, where, when, who is involved, what works or materials are included, and how the project is officially framed.',
      'Useful for clear exhibition spotlights, but promotional tone should usually be reduced.',
    ],
    quotes: [
      'Use artist quotes when they reveal process, material choices, cultural meaning, personal history, exhibition intent, or relationship to place, memory, identity, community, or form.',
      'Avoid generic excited/honoured quotes unless essential.',
    ],
    copying: [
      'High copying risk. Extract facts and meaning, but avoid repeating the release’s sentence structure, rhythm, or promotional adjectives.',
    ],
    review: [
      'Flag human review when the release is extremely short, is the only source, contains heavy promotional language with few facts, makes strong art-historical claims, has no independent support, or covers sensitive political/historical/legal/traumatic subject matter.',
    ],
  },
  {
    title: 'Artist Bio',
    definition: 'A biographical summary from a gallery, museum, artist website, CV, catalogue, or institutional profile.',
    trusted: [
      'Birth year, birthplace, current location, education, mediums or disciplines, selected exhibitions, collections, awards, residencies, representation, and public commissions.',
      'Broad practice description if written neutrally.',
    ],
    caution: [
      'Use caution with “known for”, “best known for”, “primarily works in”, “has long explored”, “central to their practice”, and “internationally recognised”.',
    ],
    notTrusted: [
      'Do not use a bio alone to interpret a current exhibition unless the current exhibition is documented elsewhere.',
      'Do not invent current motivations, meaning of a new body of work, emotional claims, or direct links between biography and new artworks unless stated.',
    ],
    contributes: [
      'Helps BAAD place the artist, explain where their practice sits, and connect current work to a longer practice without overloading the draft.',
    ],
    quotes: [
      'Artist bios rarely contain useful quotes. If they do, verify attribution and treat them like artist-statement material.',
    ],
    copying: [
      'Recast compact practice descriptions in BAAD’s own language.',
    ],
    review: [
      'Flag human review when the bio is the only source, outdated, conflicting, sensitive, or used to interpret a current exhibition without current exhibition evidence.',
    ],
  },
  {
    title: 'Artist Statement',
    definition: 'First-person or artist-approved text explaining the artist’s ideas, process, motivations, materials, identity, or relationship to a body of work.',
    trusted: [
      'The artist’s own stated intentions, personal motivations, material choices, conceptual concerns, cultural/political/spiritual references, process details, and autobiographical framing when clearly stated.',
    ],
    caution: [
      'Do not turn metaphor into literal fact. Poetic statements need careful recasting.',
    ],
    notTrusted: [
      'Audience response, critical interpretation, market value, institutional interpretation, or the idea that the artist’s intention fully determines the meaning of the work.',
    ],
    contributes: [
      'Gives BAAD articles a practice-led, artist-centred perspective and helps explain why materials, questions, and references matter.',
    ],
    quotes: [
      'Use quotes that reveal process, tension, transformation, memory, material meaning, or relationship to place, family, migration, spirituality, labour, or community.',
    ],
    copying: [
      'Do not copy distinctive poetic language unless quoting briefly and intentionally. Separate quote candidates from meaning to recast.',
    ],
    review: [
      'Flag human review when the statement is highly poetic, discusses sensitive subjects, is the only interpretive source, risks over-identifying the artist with sensitive experience, or has high copying risk.',
    ],
  },
  {
    title: 'Interview',
    definition: 'A source where the artist, curator, designer, filmmaker, writer, or subject speaks in response to questions.',
    trusted: [
      'Direct statements from the speaker, process details, personal history when stated, motivations, influences, working methods, reflections on a project, anecdotes, and explanations of materials or references.',
    ],
    caution: [
      'Interviews are edited and shaped by publication angle. Distinguish artist words from interviewer paraphrase.',
    ],
    notTrusted: [
      'Objective importance, critical consensus, full meaning of an artwork beyond what the speaker says, facts about others unless independently supported, or legal/medical/highly sensitive claims without verification.',
    ],
    contributes: [
      'Adds human specificity, stronger openings, process insight, personal stakes, cultural context, and a more precise understanding of tone.',
    ],
    quotes: [
      'Best source type for direct quotes. Prefer quotes that explain material, symbol, intention, or insight BAAD cannot paraphrase as effectively.',
    ],
    copying: [
      'Avoid copying the structure or thesis of the source interview/article.',
    ],
    review: [
      'Flag human review when the interview includes sensitive personal material, long central quotes, paywalled/rights-sensitive content, or the BAAD draft risks sounding too close to the source article.',
    ],
  },
  {
    title: 'Museum / Institution Page',
    definition: 'Official page from a museum, public art organisation, biennial, university gallery, archive, foundation, cultural institute, or non-commercial institution.',
    trusted: [
      'Exhibition title, artist name, institution name, dates, curator names, public programme details, commission details, collection information, artwork information, institutional framing, educational context, and visitor information.',
    ],
    caution: [
      'Curatorial language such as landmark, urgent, timely, unprecedented, radical, and transformative must be grounded in concrete details.',
    ],
    notTrusted: [
      'Do not use alone to claim wider critical reception, market status, or long-term historical importance.',
    ],
    contributes: [
      'Anchors public significance, curatorial framing, educational context, institutional programme, archives, and public-facing access.',
    ],
    quotes: [
      'Curator quotes can be useful when specific. Generic institutional quotes should usually be paraphrased or omitted.',
    ],
    copying: [
      'Translate dense curatorial language into clearer BAAD prose without flattening meaning.',
    ],
    review: [
      'Flag human review for colonial history, restitution, slavery, genocide, war, state violence, contested heritage, or when institutional framing needs critical distance.',
    ],
  },
  {
    title: 'Review / Article',
    definition: 'A third-party editorial source from an arts publication, newspaper, magazine, critic, journalist, or cultural platform.',
    trusted: [
      'Reported facts, critical observations, descriptions of works or installation, interview excerpts, context gathered by the writer, public reception if explicitly described, and critical interpretation when attributed.',
    ],
    caution: [
      'Reviews and articles are interpretive sources, not neutral fact sheets. Treat opinions, value judgments, strong claims, distinctive angles, and unique language carefully.',
    ],
    notTrusted: [
      'Do not treat a review as BAAD’s own opinion unless BAAD independently supports that view.',
      'Do not copy the source article’s thesis, structure, opening device, distinctive phrases, or critical judgments without attribution.',
    ],
    contributes: [
      'Adds external perspective, richer context, visual/conceptual observations, tensions, broader conversations, and reported details not found in official sources.',
    ],
    quotes: [
      'Quote critics sparingly and attribute clearly. Artist quotes inside third-party articles can be used if clear and sourceable.',
    ],
    copying: [
      'Very high copying risk because the source already has editorial shape. Extract facts, quotes, and context while avoiding source architecture.',
    ],
    review: [
      'Flag human review when the draft may follow the source structure, the source is opinion-heavy, or it includes allegations, controversy, legal claims, or sensitive material.',
    ],
  },
  {
    title: 'Exhibition Listing',
    definition: 'A short listing page from a gallery, museum, art fair, event platform, city guide, or directory.',
    trusted: [
      'Exhibition title, artist name, venue, dates, city, address, basic description, event times, visitor information, and sometimes one or two core themes.',
    ],
    caution: [
      'Listings are often too short to support a full article. Use caution when below 100–150 useful words or lacking detail about the work.',
    ],
    notTrusted: [
      'Do not use alone for deep interpretation, artist biography, significance claims, material/process analysis, long-form article generation, or quotes unless clearly present.',
    ],
    contributes: [
      'Useful as a discovery signal and factual anchor. Usually enough for a directory entry but not a full editorial article unless paired with stronger sources.',
    ],
    quotes: [
      'Listings rarely contain strong quotes. Avoid inventing quote-like framing from listing text.',
    ],
    copying: [
      'Short listings are easy to overuse because every sentence may contain necessary facts. Recast carefully.',
    ],
    review: [
      'Flag human review when it is the only source, under 100 words, lacks supporting material, would require invented context, or covers sensitive subject matter.',
    ],
  },
  {
    title: 'Book / Film / Media Source',
    definition: 'Publisher pages, film pages, streaming descriptions, book announcements, artist documentary pages, catalogue descriptions, podcast pages, or video-based source material.',
    trusted: [
      'Title, author/filmmaker/artist/subject, publisher/platform, release date, description, episode or segment summary, participating artists, named themes, quotes in official text, and basic production/publication facts.',
    ],
    caution: [
      'Media descriptions are often promotional. Recast terms like definitive, essential, powerful, intimate, revealing, never-before-seen, and unprecedented unless grounded in details.',
    ],
    notTrusted: [
      'Do not use alone to claim critical reception, cultural impact, the full argument of a book not read, the full content of a film not viewed, or artist intention unless directly quoted.',
    ],
    contributes: [
      'Supports artist-documentary articles, book announcements, film and moving-image coverage, artist-profile features, and Art + Film / Art + Books / Design + Film stories.',
    ],
    quotes: [
      'Use quotes only when clearly attributed. For video/audio, direct quotes should ideally come from transcripts or official text unless manually verified.',
    ],
    copying: [
      'Publisher/platform blurbs are compact and promotional. Recast heavily and avoid copying taglines unless quoting briefly.',
    ],
    review: [
      'Flag human review when the source is only a trailer/blurb, content has not been independently described, claims are not verified, or transcript accuracy is uncertain.',
    ],
  },
];

function sourceTypeBlocks(source) {
  const blocks = [
    heading2(source.title),
    paragraph(source.definition),
    heading3('Trusted for'),
    ...source.trusted.map(bullet),
    heading3('Use with caution for'),
    ...source.caution.map(bullet),
    heading3('Should not be trusted for'),
    ...source.notTrusted.map(bullet),
    heading3('What it contributes to BAAD writing'),
    ...source.contributes.map(bullet),
    heading3('Quote rules'),
    ...source.quotes.map(bullet),
    heading3('Copying-risk rules'),
    ...source.copying.map(bullet),
    heading3('Human review needed when'),
    ...source.review.map(bullet),
    divider(),
  ];

  return blocks;
}

const guideBlocks = [
  heading1('BAAD Source Packet Source Type Guide'),
  paragraph('Version 1. Created as part of the BAAD editorial automation system. This guide defines how different source types should be interpreted before they reach the BAAD draft-generation prompt.'),
  paragraph('A Source Packet is not just a copied source. It is an interpreted editorial evidence unit. It tells the draft workflow what the source can safely support, what it should not overstate, what details are useful for BAAD’s angle, and where copying risk is high.'),
  paragraph('The goal is to make BAAD articles more precise, original, visually grounded, and contextually rich while avoiding unsupported claims, generic art writing, and source imitation.'),
  divider(),

  heading1('Source Types'),
  ...sourceTypes.flatMap(sourceTypeBlocks),

  heading1('Cross-Source Editorial Rules'),
  heading2('1. Source hierarchy'),
  paragraph('When multiple sources are available, BAAD should generally treat them in this order:'),
  numbered('Official exhibition or project source for factual details.'),
  numbered('Artist interview or artist statement for intention and process.'),
  numbered('Museum/institution page for curatorial and public context.'),
  numbered('Artist bio for background.'),
  numbered('Third-party article/review for external interpretation.'),
  numbered('Exhibition listing for basic facts only.'),

  heading2('2. Avoid unsupported career-span claims'),
  paragraph('Do not write phrases such as “has long used”, “has long explored”, “is known for”, “is best known for”, “has always been concerned with”, “central to their practice”, “primary medium”, or “lifelong interest” unless the source clearly supports that claim.'),

  heading2('3. Separate fact from interpretation'),
  paragraph('Every Source Packet should distinguish between verified facts, source interpretation, artist’s own words, BAAD editorial angle, and claims that need human review.'),

  heading2('4. Recast meaning, do not copy language'),
  paragraph('Source Packets should help BAAD understand what a source means, not give the draft prompt phrases to copy. A useful Source Packet should include prompt-ready factual extract, quote candidates, meaning to recast, avoid copying notes, and editorial use notes.'),

  heading2('5. Human review is not failure'),
  paragraph('Human review means the source is usable but needs editorial judgement. It should be triggered when the system cannot safely decide whether the source supports the article’s claim, tone, quote use, or interpretation.'),

  divider(),

  heading1('Recommended Source Packet Fields'),
  ...[
    'Source Type',
    'Source Publisher',
    'Source Title',
    'Source URL',
    'Source Date',
    'Source Reliability',
    'Rights / Copying Risk',
    'Full Text / Extract',
    'Short Source Summary',
    'Verified Facts',
    'Quote Candidates',
    'Quote Use Notes',
    'Source Meaning to Recast',
    'Avoid Copying Notes',
    'Editorial Use Notes',
    'Prompt-Ready Extract',
    'Use in Draft?',
    'Use for Quotes?',
    'Use for Closing?',
    'Human Review Needed?',
    'Human Review Notes',
    'Processing Status',
    'Packet JSON',
    'Draft Use Priority',
  ].map(bullet),

  divider(),

  heading1('How BAAD Should Use Source Packets in Draft Generation'),
  paragraph('The draft prompt should not treat all source packets equally. It should ask:'),
  numbered('Which source gives the factual skeleton?'),
  numbered('Which source gives the strongest material/process detail?'),
  numbered('Which source gives the best artist voice?'),
  numbered('Which source gives the strongest BAAD angle?'),
  numbered('Which source has the highest copying risk?'),
  numbered('Which claims need to be avoided?'),
  numbered('Which details should appear in the opening paragraph?'),
  numbered('Which details belong in the middle/context paragraph?'),
  numbered('Which details belong in the closing paragraph?'),
  paragraph('The draft should be built from verified details and editorial logic, not from source imitation.'),

  divider(),

  heading1('Version 1 Implementation Note'),
  paragraph('For the current BAAD workflow, this guide should first be used to improve the Source Packet analysis prompt. Later, the rules can be converted into structured Airtable fields, n8n condition checks, and validation rules.'),
  paragraph('Immediate next automation goal: make Source Packet generation classify each source by type and produce structured outputs that follow this guide.'),
];

async function main() {
  console.log('Looking for section:', SECTION_TITLE);

  let sectionBlock = await findChildPageByTitle(HQ_PAGE_ID, SECTION_TITLE);
  let sectionPageId;

  if (sectionBlock) {
    sectionPageId = sectionBlock.id;
    console.log('Found existing section page:', sectionPageId);
  } else {
    const sectionPage = await createPage(HQ_PAGE_ID, SECTION_TITLE);
    sectionPageId = sectionPage.id;
    console.log('Created section page:', sectionPageId);
  }

  console.log('Checking for existing guide page:', GUIDE_TITLE);
  const existingGuide = await findChildPageByTitle(sectionPageId, GUIDE_TITLE);

  if (existingGuide) {
    console.log('Guide page already exists. Not creating duplicate.');
    console.log('Existing guide page ID:', existingGuide.id);
    console.log('URL: https://www.notion.so/' + existingGuide.id.replace(/-/g, ''));
    return;
  }

  const guidePage = await createPage(sectionPageId, GUIDE_TITLE);
  console.log('Created guide page:', guidePage.id);

  await appendBlocks(guidePage.id, guideBlocks);

  console.log('Added guide content.');
  console.log('Section page ID:', sectionPageId);
  console.log('Guide page ID:', guidePage.id);
  console.log('Guide URL:', guidePage.url);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
