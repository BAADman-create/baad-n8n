const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;

// BAAD Editorial Intelligence HQ parent page
const HQ_PARENT_PAGE_ID =
  process.env.NOTION_BAAD_HQ_PAGE_ID || '37e16598b06e80339ab3e44d6f1dd0bd';

if (!NOTION_TOKEN) {
  console.error('Missing NOTION_TOKEN or NOTION_API_KEY environment variable.');
  console.error('Export it first, then rerun this script.');
  process.exit(1);
}

const notionVersion = '2022-06-28';

function text(content) {
  return [{ type: 'text', text: { content: String(content || '') } }];
}

function paragraph(content) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: text(content) },
  };
}

function heading1(content) {
  return {
    object: 'block',
    type: 'heading_1',
    heading_1: { rich_text: text(content) },
  };
}

function heading2(content) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: text(content) },
  };
}

function heading3(content) {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: { rich_text: text(content) },
  };
}

function bullet(content) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: text(content) },
  };
}

function numbered(content) {
  return {
    object: 'block',
    type: 'numbered_list_item',
    numbered_list_item: { rich_text: text(content) },
  };
}

function divider() {
  return {
    object: 'block',
    type: 'divider',
    divider: {},
  };
}

function codeBlock(content, language = 'plain text') {
  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: text(content),
      language,
    },
  };
}

async function notion(path, method, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error(`Notion API error ${res.status} on ${method} ${path}`);
  }

  return json;
}

async function createPage(parentPageId, title, children) {
  return notion('/pages', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    properties: {
      title: {
        title: text(title),
      },
    },
    children,
  });
}

const mainBlocks = [
  heading1('Purpose'),
  paragraph('This page defines how BAAD article generation should be developed as a true arts editorial system rather than a simple automation that turns source material into rewritten articles.'),
  paragraph('The goal is not merely to produce text. The goal is to build an editorial process that can generate accurate, grounded, stylish, culturally intelligent BAAD articles that feel like they belong to a serious Black art and design publication.'),
  codeBlock('Basic automation: source in → article out\nBAAD editorial model: source in → editorial judgement → BAAD article'),
  heading1('Core principle'),
  paragraph('BAAD article generation quality improves when the system stops asking “How do we turn this source into an article?” and starts asking “What would a good BAAD editor do with this source?”'),
  paragraph('That means the workflow should develop the same layers that exist inside a publication: research, source assessment, fact extraction, editorial angle selection, style selection, drafting, validation, repair, copy-editing, and final publication preparation.'),
  heading1('The six BAAD editorial desks'),
  numbered('Source Desk — gathers gallery pages, museum pages, press releases, artist interviews, exhibition announcements, design project pages, news articles, image captions, artist bios, venue information, dates, access details, quotes, and background notes.'),
  numbered('Source Packet Desk — turns raw source material into verified facts, quote candidates, avoid-copying notes, source meaning to recast, source reliability, rights/copying risk, and editorial use notes.'),
  numbered('Source Article Analysis Desk — reads the source like an editor and decides article type, BAAD angle, source strength, risks, must-preserve facts, opening strategy, and recommended blueprint.'),
  numbered('Style Desk — applies BAAD Style Blueprints, Style References, tone rules, opening strategies, paragraph structures, title/dek rules, and closing patterns.'),
  numbered('Writing Desk — generates the first BAAD draft using Source Packets, Source Article Analysis, Style Blueprint, Style References, BAAD voice rules, and required facts.'),
  numbered('Editing Desk — validates, repairs when needed, polishes, validates again, and prepares final Airtable or Strapi-ready output.'),
  heading1('Why source in → article out is not enough'),
  paragraph('A simple source-to-article workflow can copy source structure, repeat promotional language, miss the strongest angle, overstate the artist’s importance, flatten Black cultural context, treat all articles as the same type, invent unsupported interpretation, quote poorly, bury practical details, and produce technically correct but dull articles.'),
  paragraph('A true editorial system adds judgement before writing. It asks what can be trusted, what should be foregrounded, what should be avoided, what BAAD readers need, and what article shape fits the source.'),
  heading1('Ideal BAAD article-generation flow'),
  numbered('Article is added to Airtable.'),
  numbered('Source material is collected or pasted.'),
  numbered('Source Packet workflow creates structured evidence.'),
  numbered('Source Article Analysis workflow creates editorial reading notes.'),
  numbered('Workflow selects a BAAD Style Blueprint.'),
  numbered('Workflow selects relevant Style References.'),
  numbered('Build Draft Prompt assembles Source Packet evidence, Editorial Brief, Style Blueprint, Style References, and BAAD voice rules.'),
  numbered('OpenAI generates the BAAD draft.'),
  numbered('Validator checks facts, source support, banned phrases, risky claims, quote use, closing logic, and copying risk.'),
  numbered('If validation fails, repair branch runs.'),
  numbered('If validation passes, polish branch runs.'),
  numbered('Polished draft is validated again.'),
  numbered('Final Clean Draft Fields prepares compact Airtable or Strapi-ready output.'),
  numbered('Human editor reviews before publication, especially in early production.'),
  heading1('Immediate next technical follow-up'),
  paragraph('The immediate technical follow-up remains: intentionally test the repair branch. The pass route has been tested and archived. The repair route still needs deliberate validation.'),
  codeBlock('Confirmed pass route:\nvalidation pass → skip repair → polish → parse → validate → final clean payload\n\nStill to test:\nvalidation fail → repair → parse repaired JSON → validate repaired draft → polish → parse polished JSON → validate polished draft → final clean payload'),
  heading1('Next major editorial development track'),
  paragraph('After the repair branch test, the next major development track should be the BAAD Editorial Intelligence Layer. This means strengthening Source Article Analysis, refining Style Blueprints, building Style References, centralising BAAD Voice and Standards, and adding editorial quality scoring.'),
  divider(),
  paragraph('Child pages below define each desk in more detail.'),
];

const sourcePacketBlocks = [
  heading1('Purpose'),
  paragraph('The Source Packet Desk turns raw sources into verified, usable evidence. It separates evidence from writing so BAAD can generate stronger articles without copying source language or relying on messy raw text.'),
  paragraph('A Source Packet is not the article. It is the researched evidence pack that makes a better article possible.'),
  heading1('Core outputs'),
  heading2('Prompt-Ready Extract'),
  paragraph('A clean, condensed version of the usable source material. It should include who, what, where, when, key works, key materials, collaborators, project or exhibition context, and useful source-supported meaning.'),
  heading2('Verified Facts'),
  paragraph('A list of concrete facts directly supported by the source: exhibition title, artist name, venue, city, dates, works, materials, media, collaborators, admission details, opening reception, publication/source details, quoted speaker, and artist biography when directly stated.'),
  paragraph('Verified facts should be factual, not promotional. “The exhibition runs from 5 June to 11 July 2026” is a verified fact. “The exhibition is groundbreaking” is promotional framing unless attributed.'),
  heading2('Quote Candidates'),
  paragraph('Useful quotes with speaker, source, context, and use notes. Quotes should be selected sparingly and intentionally, not included just because they exist.'),
  heading2('Quote Use Notes'),
  paragraph('Guidance on whether a quote should be used directly, paraphrased, attributed carefully, or avoided.'),
  heading2('Source Meaning to Recast'),
  paragraph('The editorial meaning BAAD can responsibly draw from the source. This gives the writing node an angle without inventing unsupported claims.'),
  heading2('Avoid Copying Notes'),
  paragraph('A list of distinctive phrases, memorable metaphors, promotional language, and source-specific sentence rhythms that BAAD should not reuse. BAAD may use the underlying idea only when it is source-supported and rewritten in BAAD’s own language.'),
  heading2('Editorial Use Notes'),
  paragraph('Guidance on how the source should shape the article: primary source, supporting source, thin source, strong interview source, gallery source reliable for dates but promotional in tone, etc.'),
  heading2('Source Reliability and Copying Risk'),
  paragraph('Reliability helps weight the source. Copying risk helps the system know how careful it must be with language. Official gallery/museum pages are usually high reliability for facts, while interviews and feature articles may carry medium or high copying risk because of distinctive phrasing.'),
];

const sourceAnalysisBlocks = [
  heading1('Purpose'),
  paragraph('The Source Article Analysis Desk is BAAD’s editorial reading layer. It should not merely summarise the source. It should decide what kind of editorial treatment the source deserves.'),
  heading1('Core decisions'),
  heading2('Article Type'),
  bullet('Exhibition Announcement'),
  bullet('Exhibition Spotlight'),
  bullet('Artist Practice Spotlight'),
  bullet('Design Project Spotlight'),
  bullet('Interview-Derived Feature'),
  bullet('News Brief'),
  bullet('Community-Based Public Art Environment'),
  bullet('Group Exhibition with BAAD-Anchor Artist'),
  bullet('Restitution/Repatriation Story'),
  bullet('Appointment/Role Change'),
  bullet('Award, Prize, Fair, Commission, Book, Film, Architecture, or Fashion story'),
  heading2('Source Strength'),
  paragraph('Classify the source as Thin, Medium, Strong, or Rich. Thin sources should produce compact articles. Rich sources can support deeper practice-led or feature-style articles.'),
  heading2('Primary BAAD Angle'),
  bullet('material/process angle'),
  bullet('artist-practice angle'),
  bullet('diaspora/cultural memory angle'),
  bullet('exhibition access angle'),
  bullet('public art/community angle'),
  bullet('institutional news angle'),
  bullet('design innovation angle'),
  bullet('historical recovery angle'),
  bullet('curatorial framing angle'),
  bullet('Black cultural infrastructure angle'),
  heading2('Opening Strategy'),
  bullet('artist-led opening'),
  bullet('visual/object-led opening'),
  bullet('exhibition-led opening'),
  bullet('material-led opening'),
  bullet('city/venue-led opening'),
  bullet('quote-led opening'),
  bullet('news-led opening'),
  bullet('historical-context opening'),
  heading2('Must Preserve'),
  paragraph('Identify dates, venue, city, title, artist names, collaborator names, specific works, materials, key quotes, access details, and source-supported context that the article must keep.'),
  heading2('Avoid Overemphasising'),
  paragraph('Prevent distortion: do not overstate a minor quote, make a group exhibition sound like a solo show, imply sole authorship in collaborative contexts, overemphasise biography, or turn gallery framing into BAAD critical praise.'),
  heading2('Main Risk'),
  paragraph('Identify the primary risk: copying source language, overclaiming, thin source, missing required facts, over-centering one artist in a group show, promotional tone, unsupported career claim, quote misuse, weak closing, or generic artspeak.'),
];

const styleBlueprintBlocks = [
  heading1('Purpose'),
  paragraph('BAAD Style Blueprints define article shape. They should not be rigid templates. They should act like editorial structures that help a draft move naturally.'),
  paragraph('A blueprint answers: what kind of article are we writing, and what should its movement be?'),
  heading1('Core blueprint examples'),
  heading2('BAAD Short Visual Design Spotlight'),
  paragraph('Best for design projects, solo design exhibitions, visual installations, material-led design stories, and public design work. Movement: visual anchor → materials/process → cultural or practice context → practical close.'),
  heading2('BAAD Exhibition Announcement'),
  paragraph('Best for gallery or museum exhibition openings and factual upcoming shows. Movement: what is opening → who is involved → what the show includes → why it matters for BAAD readers → date/venue close.'),
  heading2('BAAD Artist Practice Spotlight'),
  paragraph('Best for artists with strong material, process, or solo exhibition stories. Movement: artist action → material/process → visual detail → source-supported meaning → current exhibition/project close.'),
  heading2('BAAD Interview-Derived Feature'),
  paragraph('Best for artist interviews and sources with strong artist voice. Movement: artist voice → practice context → concrete details → carefully selected quote → current project close.'),
  heading2('BAAD Community-Based Public Art Environment'),
  paragraph('Best for public art, social practice, community art environments, and site-specific cultural projects. Movement: place/community → artist/project action → materials/site details → social/cultural meaning → visitor/current relevance close.'),
  heading2('BAAD Group Exhibition with BAAD-Anchor Artist'),
  paragraph('Best for group exhibitions where one or more Black artists are central. Movement: full exhibition context → BAAD-anchor artist contribution → other artists fairly named → curatorial frame → practical close. Do not imply a solo show if it is a group show.'),
  heading2('BAAD Compact News Brief'),
  paragraph('Best for thin sources, appointments, awards, announcements, and brief updates. Movement: news fact → relevant context → why it matters → practical close.'),
];

const styleReferenceBlocks = [
  heading1('Purpose'),
  paragraph('BAAD Style References help BAAD learn from strong articles without copying them. A Style Reference is not a source for facts. It is a source for editorial lessons.'),
  heading1('What a Style Reference should capture'),
  heading2('Opening Type'),
  bullet('object-led'),
  bullet('artist-led'),
  bullet('material-led'),
  bullet('scene-led'),
  bullet('question-led'),
  bullet('news-led'),
  bullet('quote-led'),
  heading2('Paragraph Movement'),
  bullet('visual detail first, context second'),
  bullet('artist practice first, exhibition details later'),
  bullet('material description followed by cultural meaning'),
  bullet('concise news lead followed by institutional context'),
  heading2('Sentence Rhythm'),
  bullet('short opening sentence followed by richer second sentence'),
  bullet('compact paragraphs'),
  bullet('precise noun choices'),
  bullet('limited adjectives'),
  bullet('no inflated claims'),
  heading2('Tone'),
  bullet('calm'),
  bullet('observational'),
  bullet('visually attentive'),
  bullet('precise'),
  bullet('culturally literate'),
  bullet('concise'),
  bullet('warm but not promotional'),
  heading2('Reusable Lesson'),
  paragraph('Example: lead with one concrete material detail before naming the broader exhibition context.'),
  heading2('Avoid Copying'),
  paragraph('Every Style Reference should identify what BAAD must not imitate directly: metaphors, opening sentence structure, signature rhythm, and distinctive conceptual phrases.'),
  heading1('Key rule'),
  codeBlock('Reference article → editorial lesson → BAAD original writing\n\nNot:\nReference article → copied style → imitation'),
];

const voiceBlocks = [
  heading1('Purpose'),
  paragraph('BAAD Voice and Standards should become the central voice guide used by generation, repair, polish, and editorial quality checks.'),
  heading1('BAAD voice'),
  bullet('clear'),
  bullet('precise'),
  bullet('visually attentive'),
  bullet('culturally literate'),
  bullet('serious but accessible'),
  bullet('grounded in source evidence'),
  bullet('respectful of Black artists and designers'),
  bullet('editorial rather than promotional'),
  bullet('concise without being shallow'),
  bullet('warm without hype'),
  heading1('BAAD should avoid'),
  bullet('generic artspeak'),
  bullet('inflated praise'),
  bullet('unsupported reputation claims'),
  bullet('press-release language'),
  bullet('over-academic writing'),
  bullet('copying source rhythm'),
  bullet('flattening Black artists into identity-only narratives'),
  bullet('treating every exhibition as powerful, groundbreaking, or important'),
  bullet('mechanical phrases like “the gallery says” unless attribution is necessary'),
  bullet('robotic endings'),
  bullet('raw URLs in article body'),
  heading1('BAAD should prefer'),
  bullet('concrete visual details'),
  bullet('specific materials'),
  bullet('exact dates and venues'),
  bullet('careful use of quotes'),
  bullet('clear source-supported context'),
  bullet('article-specific openings'),
  bullet('clean transitions'),
  bullet('strong but restrained titles'),
  bullet('natural closing paragraphs'),
];

const scoringBlocks = [
  heading1('Purpose'),
  paragraph('Editorial Quality Scoring should help BAAD judge whether a draft is only technically valid or genuinely good. Validation pass/fail protects accuracy and safety; quality scoring improves editorial strength.'),
  heading1('Suggested scoring areas'),
  bullet('Factual accuracy'),
  bullet('Source support'),
  bullet('Opening strength'),
  bullet('BAAD tone'),
  bullet('Paragraph flow'),
  bullet('Quote handling'),
  bullet('Title strength'),
  bullet('Dek clarity'),
  bullet('Copying risk'),
  bullet('Press-release feel'),
  bullet('Cultural/editorial depth'),
  bullet('Human review need'),
  heading1('Example output'),
  codeBlock('Factual accuracy: pass\nSource support: strong\nOpening strength: medium\nBAAD tone: good\nParagraph flow: good\nCopying risk: low\nPress-release feel: medium\nHuman review needed: no\nSuggested improvement: make the opening more artist-led and reduce repeated use of “exhibition.”'),
  heading1('Why this matters'),
  paragraph('A generated article can pass factual validation but still feel dull, generic, overly promotional, or structurally weak. Editorial Quality Scoring gives the workflow a way to improve articles before publication.'),
];

(async () => {
  console.log('Creating main BAAD Editorial Desk page...');
  const mainPage = await createPage(
    HQ_PARENT_PAGE_ID,
    'BAAD Article Generation as an Editorial Desk',
    mainBlocks
  );

  console.log(`Created main page: ${mainPage.url}`);

  const children = [
    ['Source Packet Desk', sourcePacketBlocks],
    ['Source Article Analysis Desk', sourceAnalysisBlocks],
    ['BAAD Style Blueprints', styleBlueprintBlocks],
    ['BAAD Style References', styleReferenceBlocks],
    ['BAAD Voice and Standards', voiceBlocks],
    ['Editorial Quality Scoring', scoringBlocks],
  ];

  for (const [title, blocks] of children) {
    console.log(`Creating child page: ${title}`);
    const page = await createPage(mainPage.id, title, blocks);
    console.log(`Created: ${page.url}`);
  }

  console.log('\nDone. BAAD Editorial Desk documentation has been created in Notion HQ.');
})();
