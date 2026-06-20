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
const PAGE_TITLE = 'Yinka Ilori — Source Article Analysis Test Output — 2026-06-20';

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

const analysisJson = {
  "sourceArticleSummary": "Cristea Roberts Gallery will present Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best from 5 June to 11 July 2026 in London. The exhibition is described by the gallery as Ilori’s first solo gallery exhibition in his home city and his first solo show at Cristea Roberts since joining the gallery in 2023. It features over 20 new and recent works across painting, print, sculpture, and immersive sound, using flowers, ornamental lace, wrapped instruments, and commissioned sound to explore British Nigerian identity, diaspora resilience, ceremony, joy, and resistance.",
  "primaryScenario": "Exhibition / project spotlight",
  "secondaryScenario": "Material / process story",
  "mainArticleShape": "exhibition/project spotlight",
  "articleFocusType": "exhibition/project",
  "articlePurpose": "Preview the exhibition with a neutral, source-backed focus on how Ilori uses floral imagery, lace, instruments, and sound to connect joy, resistance, British Nigerian identity, and communal memory.",
  "currentExhibitionOrProject": "Yes",
  "exhibitionProjectNames": "Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best",
  "venueInstitutionNames": "Cristea Roberts Gallery, 43 Pall Mall, London SW1Y 5JG",
  "datesMentioned": "5 June to 11 July 2026; opening reception scheduled for 6pm on Friday 5 June 2026 during London Gallery Weekend; extended opening hours listed for 6 and 7 June 2026.",
  "timelinessHookType": "unclear",
  "timelinessHookDetails": "The show opens at Cristea Roberts Gallery during London Gallery Weekend and runs from 5 June to 11 July 2026.",
  "specificArtworkFocus": "Partial",
  "specificArtworkTitles": "Paradise for All, 2024; An Abundance of Flowers blessed by us, for us, 2026; A Flower surrounded by Gold, from An Abundance of Flowers blessed by us, for us, 2026",
  "artworkPartOfExhibitionProject": "Yes",
  "artistSubjectNames": "Yinka Ilori",
  "leadWith": "material/process",
  "mentionExhibitionInDraft": "Yes",
  "mentionSpecificArtworkInDraft": "Briefly",
  "quoteWorthPreserving": "Yes",
  "bestQuoteToPreserve": "“This exhibition is my most personal to date” / “a reflection of my own story and the resilience of the diaspora” — Yinka Ilori",
  "whyQuoteMatters": "The quote supports the article’s personal and diasporic framing without requiring BAAD to make an unsupported critical claim. It should be attributed directly to Ilori.",
  "bestBAADAngle": "Frame the exhibition around Ilori’s material language of joy and resistance: Nigerian yellow trumpet and UK-associated daffodil forms layered over lace, alongside lace-wrapped instruments and sound works that connect worship, ceremony, diaspora memory, vulnerability, and communal strength.",
  "whyThisMattersForBAAD": "The project sits at the intersection of Black British design, contemporary art, sound, diaspora symbolism, and material storytelling. It offers a strong BAAD angle on how Ilori extends his public-facing language of joy into a gallery context through culturally specific motifs and collaborative sound.",
  "mustPreserve": "Preserve the exhibition title, venue, dates, and London location. State that the gallery describes it as Ilori’s first solo gallery exhibition in his home city and his first solo exhibition at Cristea Roberts since joining the gallery in 2023. Preserve that the exhibition includes over 20 new and recent works across painting, print, sculpture, and immersive sound. Mention the flower groups Paradise for All, 2024, and An Abundance of Flowers blessed by us, for us, 2026, if discussing specific works. Preserve the use of Nigerian yellow trumpet and daffodil imagery layered over ornamental lace patterns. Preserve that sculptural/sound elements include handmade congas, a custom-made shekere, and a drumkit enveloped in lace. Preserve that the sound installation includes new music by Peter Adjaye and James William Blades, with Blades’ piece incorporating field recordings, Yoruba lullabies, church songs, linguistic training records, and Nigerian blow horn samples.",
  "avoidOveremphasising": "Do not present gallery promotional claims as BAAD criticism. Do not overstate the exhibition as a definitive career turning point beyond the supported facts. Avoid making broad claims about all diaspora experience. Be careful with sensitive Wallpaper details about family migration, grief, therapy, and immigration status; these should not be foregrounded without human editorial approval. Do not imply that Peter Adjaye or James William Blades are co-authors of the whole exhibition; mention them only in relation to the sound commissions.",
  "recommendedBAADBlueprint": "BAAD Exhibition / Project Spotlight",
  "recommendedBAADArticleShape": "A concise exhibition preview led by Ilori’s materials and symbols: flowers, lace, percussion, and sound. Open with the visual/material setup, then identify the exhibition, venue, and dates, followed by a short explanation of the British Nigerian and diaspora-resilience framing, the sound collaborators, and practical visitor details.",
  "needsHumanReview": true,
  "humanReviewReason": "Human review is recommended because the source set includes promotional gallery language and sensitive personal context from Wallpaper, including family migration status, grief, faith, and racial discrimination. A draft should avoid using those sensitive details unless an editor decides they are necessary and properly contextualised.",
  "analysisStatus": "Complete",
  "baadCategories": ["Art", "Design"],
  "mediaFilmHook": "No",
  "mediaScenario": "No media scenario",
  "mediaType": "unclear",
  "filmVideoTitle": "",
  "filmVideoPlatform": "",
  "mentionFilmInDraft": "No",
  "filmAsMainHookOrSecondaryHook": "No film hook",
  "filmMediaNotes": "No film or video hook is present. The sound installation is part of the exhibition but should not be treated as film/media.",
  "multiArtistArticle": "No",
  "artistRelationshipType": "solo exhibition",
  "baadAnchorArtists": "Yinka Ilori",
  "nonAnchorArtists": "Peter Adjaye; James William Blades",
  "framingBalance": "single BAAD-anchor artist",
  "mentionNonAnchorArtist": "Briefly",
  "nonAnchorFramingNote": "Mention Adjaye and Blades only as composers/producers of the two sound pieces developed for the installation. Keep the article led by Ilori and the exhibition.",
  "baadAnchorOpeningRule": "Open with Yinka Ilori and the exhibition’s material/sound world, not with the gallery, collaborators, or broad promotional claims."
};

function guideBlocks() {
  return [
    heading1('Yinka Ilori — Source Article Analysis Test Output'),
    paragraph('This page archives the first successful manual test output from the standalone Create Source Article Analysis – Production Candidate workflow. The test used the Yinka Ilori article record and two approved Source Packets.'),

    heading2('Test Status'),
    bullet('Workflow: Create Source Article Analysis – Production Candidate'),
    bullet('Workflow status during test: inactive/manual'),
    bullet('Article: Yinka Ilori — Joy Through Resistance'),
    bullet('Article record ID: recox39UXZK7pdkJc'),
    bullet('Created Source Article Analysis record ID: recgD7yIjOlKi7Oah'),
    bullet('Created time: 2026-06-20T17:06:11.000Z'),
    bullet('Result: passed first manual test'),
    bullet('The workflow created and linked one Source Article Analysis record back to the Article.'),

    heading2('Approved Source Packets Used'),
    bullet('rec8ngS3O6IKRF5ig — Cristea Roberts Gallery — Yinka Ilori: Joy Through Resistance: He Who Laughs Last, Laughs Best'),
    bullet('reccZLSLcwYRZ3e6I — Wallpaper — Inside Yinka Ilori’s Joy Through Resistance'),

    heading2('Editorial Summary'),
    paragraph(analysisJson.sourceArticleSummary),

    heading2('Key Structured Output'),
    bullet(`Primary Scenario: ${analysisJson.primaryScenario}`),
    bullet(`Secondary Scenario: ${analysisJson.secondaryScenario}`),
    bullet(`Main Article Shape: ${analysisJson.mainArticleShape}`),
    bullet(`Article Focus Type: ${analysisJson.articleFocusType}`),
    bullet(`Lead With: ${analysisJson.leadWith}`),
    bullet(`Recommended BAAD Blueprint: ${analysisJson.recommendedBAADBlueprint}`),
    bullet(`Analysis Status: ${analysisJson.analysisStatus}`),
    bullet(`Needs Human Review: ${analysisJson.needsHumanReview}`),
    bullet(`BAAD Categories: ${analysisJson.baadCategories.join(', ')}`),

    heading2('Best BAAD Angle'),
    paragraph(analysisJson.bestBAADAngle),

    heading2('Must Preserve'),
    paragraph(analysisJson.mustPreserve),

    heading2('Avoid Overemphasising'),
    paragraph(analysisJson.avoidOveremphasising),

    heading2('Human Review Reason'),
    paragraph(analysisJson.humanReviewReason),

    heading2('BAAD Anchor Opening Rule'),
    paragraph(analysisJson.baadAnchorOpeningRule),

    heading2('Notes for Future Refinement'),
    bullet('The output is editorially strong and correctly separates evidence from writing guidance.'),
    bullet('Needs Human Review = true is correct because the source set contains sensitive Wallpaper material.'),
    bullet('Future refinement: Timeliness Hook Type returned “unclear”; for this record it could likely be “current exhibition” or “current project”.'),
    bullet('Future drafting note: the recommended blueprint is BAAD Exhibition / Project Spotlight, but the Generate BAAD Draft workflow may currently fall back to BAAD Short Visual Art Spotlight until a dedicated Exhibition / Project blueprint is fully wired.'),

    heading2('Full Analysis JSON'),
    codeBlock(JSON.stringify(analysisJson, null, 2), 'json'),
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
