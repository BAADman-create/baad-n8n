const fs = require('fs');
const crypto = require('crypto');

const inputFile = 'workflows/generate-baad-draft-blueprint-test-manual-blueprint-override-candidate-2026-06-26-reference-structure-lookup.json';
const outputFile = 'workflows/generate-baad-draft-blueprint-test-manual-blueprint-override-candidate-2026-06-26-article-structure-plan.json';

const workflow = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

function uuid() {
  return crypto.randomUUID();
}

function getNode(name) {
  const node = workflow.nodes.find(n => n.name === name);
  if (!node) throw new Error(`Missing node: ${name}`);
  return node;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function setMainConnection(from, targets) {
  workflow.connections[from] = {
    main: [
      targets.map(target => ({
        node: target.node,
        type: 'main',
        index: target.index || 0,
      })),
    ],
  };
}

function assertNoNode(name) {
  if (workflow.nodes.some(n => n.name === name)) {
    throw new Error(`Refusing to patch because node already exists: ${name}`);
  }
}

[
  'Build Article Structure Plan Prompt',
  'OpenAI – Generate Article Structure Plan',
  'Parse Article Structure Plan JSON',
  'Validate Article Structure Plan',
  'Attach Article Structure Plan to Draft Context',
  'Add Empty Article Structure Plan',
].forEach(assertNoNode);

const attachReferenceStructure = getNode('Attach Reference Structure to Draft Context');
const addEmptyReferenceStructure = getNode('Add Empty Reference Structure');
const buildDraftPrompt = getNode('Build Draft Prompt');
const openAiDraft = getNode('OpenAI – Generate BAAD Draft');

const attachReferenceTargets =
  workflow.connections?.['Attach Reference Structure to Draft Context']?.main?.[0]?.map(c => c.node) || [];

const addEmptyReferenceTargets =
  workflow.connections?.['Add Empty Reference Structure']?.main?.[0]?.map(c => c.node) || [];

if (!attachReferenceTargets.includes('Build Draft Prompt')) {
  throw new Error('Expected Attach Reference Structure to Draft Context -> Build Draft Prompt before patching.');
}

if (!addEmptyReferenceTargets.includes('Build Draft Prompt')) {
  throw new Error('Expected Add Empty Reference Structure -> Build Draft Prompt before patching.');
}

// -----------------------------------------------------------------------------
// Build Article Structure Plan Prompt
// -----------------------------------------------------------------------------

const buildArticleStructurePlanPrompt = {
  parameters: {
    mode: 'runOnceForEachItem',
    jsCode: `// Build Article Structure Plan Prompt
// Creates an article-specific paragraph plan prompt using the selected
// Reference Article Structure plus current article context.
// The Reference Article Structure is not a factual source.

const item = $json;

const articleFields = item.articleFields || {};
const sourceAnalysisFields = item.sourceAnalysisFields || {};

const sourcePacketsForPrompt = item.sourcePacketsForPrompt || '';
const sourcePacketRoleGuide = item.sourcePacketRoleGuide || '';

const referenceStructureForPrompt = item.referenceStructureForPrompt || '';
const referenceStructureJson = item.referenceStructureJson || {};
const referenceStructureName = item.referenceStructureName || '';
const referenceStructureId = item.referenceStructureId || '';

const sourceTitle = articleFields['Title'] || '';
const sourceDek = articleFields['Dek'] || '';
const sourceBody = articleFields['Source Body / Summary'] || '';
const sourceOutlet = articleFields['Source Outlet'] || '';
const sourceUrl = articleFields['Source URL'] || '';
const notes = articleFields['Notes'] || '';
const articleType = articleFields['Article Type'] || '';
const category = articleFields['Category'] || '';
const medium = articleFields['Medium'] || '';

const styleBlueprint = {
  id: item.styleBlueprintId || '',
  name: item.styleBlueprintName || '',
  openingFormula: item.styleOpeningFormula || '',
  paragraphStructure: item.styleParagraphStructure || '',
  toneRules: item.styleToneRules || '',
  avoidTheseHabits: item.styleAvoidTheseHabits || '',
  sentenceEngineRules: item.styleSentenceEngineRules || '',
  titleDekOpeningRules: item.styleTitleDekOpeningRules || '',
};

const sourceAnalysis = {
  primaryScenario: item.primaryScenario || sourceAnalysisFields['Primary Scenario'] || '',
  secondaryScenario: item.secondaryScenario || sourceAnalysisFields['Secondary Scenario'] || '',
  recommendedBaadArticleShape: item.recommendedBaadArticleShape || sourceAnalysisFields['Recommended BAAD Article Shape'] || '',
  leadWith: item.leadWith || sourceAnalysisFields['Lead With'] || '',
  bestBaadAngle: item.bestBaadAngle || sourceAnalysisFields['Best BAAD Angle'] || '',
  mustPreserve: item.mustPreserve || sourceAnalysisFields['Must Preserve'] || '',
  avoidOveremphasising: item.avoidOveremphasising || sourceAnalysisFields['Avoid Overemphasising'] || '',
  baadAnchorOpeningRule: item.baadAnchorOpeningRule || sourceAnalysisFields['BAAD-Anchor Opening Rule'] || '',
  articleFocusType: sourceAnalysisFields['Article Focus Type'] || '',
  openingStrategy: item.openingStrategy || sourceAnalysisFields['Opening Strategy'] || '',
  sourceArticleSummary: sourceAnalysisFields['Source Article Summary'] || '',
  datesMentioned: sourceAnalysisFields['Dates Mentioned'] || '',
};

const planningContext = {
  article: {
    articleId: item.articleId || '',
    title: sourceTitle,
    dek: sourceDek,
    sourceOutlet,
    sourceUrl,
    sourceBody,
    notes,
    articleType,
    category,
    medium,
  },
  sourceAnalysis,
  styleBlueprint,
  sourcePackets: {
    sourcePacketsApplied: item.sourcePacketsApplied === true,
    sourcePacketsCount: Number(item.sourcePacketsCount || 0),
    sourcePacketRoleGuide,
    sourcePacketsForPrompt,
  },
  referenceStructure: {
    referenceStructureApplied: item.referenceStructureApplied === true,
    id: referenceStructureId,
    name: referenceStructureName,
    referenceStructureJson,
    referenceStructureForPrompt,
  },
};

const prompt = \`
You are planning a BAAD article before drafting.

Your task is to create an ARTICLE STRUCTURE PLAN for the current article.

The Article Structure Plan must adapt the selected Reference Article Structure to the current article's verified source material.

IMPORTANT:
- The Reference Article Structure is NOT a factual source.
- Use it only for paragraph architecture, movement, rhythm, and article shape.
- Use the article source, Source Analysis, Source Packets, and verified context for facts.
- Do not copy wording from the reference article.
- Do not invent facts.
- Keep background sources in their assigned role.

CURRENT ARTICLE:
Title: \${sourceTitle}
Dek: \${sourceDek}
Source outlet: \${sourceOutlet}
Source URL: \${sourceUrl}
Article type: \${articleType}
Category: \${category}
Medium: \${medium}

SOURCE BODY / SUMMARY:
\${sourceBody}

ARTICLE NOTES:
\${notes}

SOURCE ANALYSIS:
Primary scenario: \${sourceAnalysis.primaryScenario}
Secondary scenario: \${sourceAnalysis.secondaryScenario}
Recommended article shape: \${sourceAnalysis.recommendedBaadArticleShape}
Lead with: \${sourceAnalysis.leadWith}
Opening strategy: \${sourceAnalysis.openingStrategy}
BAAD-anchor opening rule: \${sourceAnalysis.baadAnchorOpeningRule}
Best BAAD angle: \${sourceAnalysis.bestBaadAngle}

MUST PRESERVE:
\${sourceAnalysis.mustPreserve}

AVOID OVEREMPHASISING:
\${sourceAnalysis.avoidOveremphasising}

DATES / DATE WARNINGS:
\${sourceAnalysis.datesMentioned}

STYLE BLUEPRINT SUMMARY:
Blueprint name: \${styleBlueprint.name}

Opening formula:
\${styleBlueprint.openingFormula}

Paragraph structure:
\${styleBlueprint.paragraphStructure}

Sentence engine rules:
\${styleBlueprint.sentenceEngineRules}

Title / dek / opening rules:
\${styleBlueprint.titleDekOpeningRules}

Tone rules:
\${styleBlueprint.toneRules}

Avoid these habits:
\${styleBlueprint.avoidTheseHabits}

REFERENCE ARTICLE STRUCTURE TO ADAPT:
\${referenceStructureForPrompt || 'No Reference Article Structure is attached.'}

APPROVED SOURCE PACKET ROLE GUIDE:
\${sourcePacketRoleGuide || 'No Source Packet role guide available.'}

APPROVED SOURCE PACKETS:
\${sourcePacketsForPrompt || 'No Source Packets available.'}

PLAN REQUIREMENTS:
- Make a paragraph-by-paragraph plan for the article.
- Each paragraph job must be specific to the current article.
- For David Uzochukwu, keep the article anchored to Bodies of Water.
- Do not let IN THE WAKE or Mare Monstrum become the main subject.
- Do not use unresolved Weisman opening dates.
- Use background artist statement / Vogue material lightly and only as practice context.
- Keep the plan useful for a drafting model.
- The plan should help title, dek, and opening do different jobs.

Return ONLY valid JSON.
Do not wrap the JSON in markdown fences.

Return exactly this JSON shape:

{
  "articleStructurePlanApplied": true,
  "referenceStructureUsed": {
    "id": "string",
    "name": "string"
  },
  "openingPlan": {
    "openingEngine": "string",
    "openingInstruction": "string",
    "avoidOpeningWith": ["string"]
  },
  "paragraphPlan": [
    {
      "paragraph": 1,
      "job": "string",
      "mustInclude": ["string"],
      "avoid": ["string"],
      "sourceBasis": ["string"]
    }
  ],
  "titleDekOpeningSeparation": {
    "titleJob": "string",
    "dekJob": "string",
    "openingJob": "string"
  },
  "sourceUsePlan": {
    "primarySourceRole": "string",
    "sourcePacketUse": ["string"],
    "backgroundSourceLimits": ["string"]
  },
  "rhythmNotes": ["string"],
  "warnings": ["string"]
}
\`;

return {
  json: {
    ...item,
    articleStructurePlanPrompt: prompt,
    articleStructurePlanningContext: planningContext,
  },
};`,
  },
  id: uuid(),
  name: 'Build Article Structure Plan Prompt',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [
    attachReferenceStructure.position[0] + 240,
    attachReferenceStructure.position[1],
  ],
};

// -----------------------------------------------------------------------------
// OpenAI – Generate Article Structure Plan
// -----------------------------------------------------------------------------

const openAiArticleStructurePlan = clone(openAiDraft);
openAiArticleStructurePlan.id = uuid();
openAiArticleStructurePlan.name = 'OpenAI – Generate Article Structure Plan';
openAiArticleStructurePlan.typeVersion = openAiDraft.typeVersion || 2;
openAiArticleStructurePlan.position = [
  attachReferenceStructure.position[0] + 520,
  attachReferenceStructure.position[1],
];
openAiArticleStructurePlan.parameters.responses = {
  values: [
    {
      content: '={{ $json.articleStructurePlanPrompt }}',
    },
  ],
};

// -----------------------------------------------------------------------------
// Parse Article Structure Plan JSON
// -----------------------------------------------------------------------------

const parseArticleStructurePlan = {
  parameters: {
    mode: 'runOnceForEachItem',
    jsCode: `// Parse Article Structure Plan JSON

const raw =
  $json.output?.[0]?.content?.[0]?.text ??
  $json.text ??
  $json.message?.content ??
  $json.choices?.[0]?.message?.content ??
  $json.content ??
  '';

const cleaned = String(raw || '')
  .replace(/\\\`\\\`\\\`json/i, '')
  .replace(/\\\`\\\`\\\`/g, '')
  .trim();

let data;

try {
  data = JSON.parse(cleaned);
} catch (err) {
  throw new Error(
    'Failed to parse Article Structure Plan JSON: ' + err.message + '\\nRaw text:\\n' + cleaned
  );
}

const promptItems = $items('Build Article Structure Plan Prompt') || [];
const promptItem = promptItems[$itemIndex] || promptItems[0];

if (!promptItem) {
  throw new Error('Could not find Build Article Structure Plan Prompt item.');
}

const original = promptItem.json || {};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}

function formatParagraphPlan(plan) {
  if (!Array.isArray(plan)) return '';

  return plan.map((p) => {
    return [
      'Paragraph ' + (p.paragraph || ''),
      'Job: ' + (p.job || ''),
      'Must include: ' + asArray(p.mustInclude).join('; '),
      'Avoid: ' + asArray(p.avoid).join('; '),
      'Source basis: ' + asArray(p.sourceBasis).join('; '),
    ].join('\\n');
  }).join('\\n\\n');
}

const articleStructurePlanForPrompt = [
  'ARTICLE STRUCTURE PLAN:',
  '',
  'Reference structure used: ' + (data.referenceStructureUsed?.name || original.referenceStructureName || ''),
  'Reference structure ID: ' + (data.referenceStructureUsed?.id || original.referenceStructureId || ''),
  '',
  'Opening engine:',
  data.openingPlan?.openingEngine || '',
  '',
  'Opening instruction:',
  data.openingPlan?.openingInstruction || '',
  '',
  'Avoid opening with:',
  asArray(data.openingPlan?.avoidOpeningWith).join('; '),
  '',
  'Paragraph plan:',
  formatParagraphPlan(data.paragraphPlan),
  '',
  'Title / Dek / Opening separation:',
  'Title job: ' + (data.titleDekOpeningSeparation?.titleJob || ''),
  'Dek job: ' + (data.titleDekOpeningSeparation?.dekJob || ''),
  'Opening job: ' + (data.titleDekOpeningSeparation?.openingJob || ''),
  '',
  'Source use plan:',
  'Primary source role: ' + (data.sourceUsePlan?.primarySourceRole || ''),
  'Source packet use: ' + asArray(data.sourceUsePlan?.sourcePacketUse).join('; '),
  'Background source limits: ' + asArray(data.sourceUsePlan?.backgroundSourceLimits).join('; '),
  '',
  'Rhythm notes:',
  asArray(data.rhythmNotes).join('; '),
  '',
  'Warnings:',
  asArray(data.warnings).join('; '),
].join('\\n');

return {
  json: {
    ...original,
    articleStructurePlanApplied: data.articleStructurePlanApplied !== false,
    articleStructurePlanJson: data,
    articleStructurePlanForPrompt,
    articleStructurePlanWarnings: asArray(data.warnings),
  },
};`,
  },
  id: uuid(),
  name: 'Parse Article Structure Plan JSON',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [
    attachReferenceStructure.position[0] + 800,
    attachReferenceStructure.position[1],
  ],
};

// -----------------------------------------------------------------------------
// Validate Article Structure Plan
// -----------------------------------------------------------------------------

const validateArticleStructurePlan = {
  parameters: {
    mode: 'runOnceForEachItem',
    jsCode: `// Validate Article Structure Plan

const plan = $json.articleStructurePlanJson || {};
const errors = [];
const warnings = [];

if ($json.articleStructurePlanApplied !== true) {
  errors.push('articleStructurePlanApplied is not true.');
}

if (!plan.openingPlan || typeof plan.openingPlan !== 'object') {
  errors.push('Missing openingPlan object.');
}

if (!Array.isArray(plan.paragraphPlan) || plan.paragraphPlan.length < 3) {
  errors.push('paragraphPlan must contain at least 3 paragraph objects.');
}

if (!plan.referenceStructureUsed || !plan.referenceStructureUsed.name) {
  warnings.push('referenceStructureUsed.name is missing.');
}

if (Array.isArray(plan.paragraphPlan)) {
  plan.paragraphPlan.forEach((p, index) => {
    if (!p.job) errors.push('Paragraph ' + (index + 1) + ' is missing job.');
  });
}

if (errors.length) {
  throw new Error('Article Structure Plan validation failed:\\n' + errors.join('\\n'));
}

return {
  json: {
    ...$json,
    articleStructurePlanValidation: {
      valid: true,
      warnings,
    },
  },
};`,
  },
  id: uuid(),
  name: 'Validate Article Structure Plan',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [
    attachReferenceStructure.position[0] + 1040,
    attachReferenceStructure.position[1],
  ],
};

// -----------------------------------------------------------------------------
// Attach Article Structure Plan to Draft Context
// -----------------------------------------------------------------------------

const attachArticleStructurePlan = {
  parameters: {
    mode: 'runOnceForEachItem',
    jsCode: `// Attach Article Structure Plan to Draft Context
// Keeps the planned context stable before Build Draft Prompt.

return {
  json: {
    ...$json,
    articleStructurePlanApplied: $json.articleStructurePlanApplied === true,
    articleStructurePlanForPrompt: $json.articleStructurePlanForPrompt || '',
    articleStructurePlanJson: $json.articleStructurePlanJson || {},
    articleStructurePlanWarnings: Array.isArray($json.articleStructurePlanWarnings)
      ? $json.articleStructurePlanWarnings
      : [],
  },
};`,
  },
  id: uuid(),
  name: 'Attach Article Structure Plan to Draft Context',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [
    attachReferenceStructure.position[0] + 1280,
    attachReferenceStructure.position[1],
  ],
};

// -----------------------------------------------------------------------------
// Add Empty Article Structure Plan
// -----------------------------------------------------------------------------

const addEmptyArticleStructurePlan = {
  parameters: {
    mode: 'runOnceForEachItem',
    jsCode: `// Add Empty Article Structure Plan
// Used when no Reference Article Structure is selected.

return {
  json: {
    ...$json,
    articleStructurePlanApplied: false,
    articleStructurePlanJson: {},
    articleStructurePlanForPrompt: '',
    articleStructurePlanWarnings: [],
    articleStructurePlanValidation: {
      valid: true,
      warnings: ['No Reference Article Structure selected; Article Structure Plan skipped.'],
    },
  },
};`,
  },
  id: uuid(),
  name: 'Add Empty Article Structure Plan',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [
    addEmptyReferenceStructure.position[0] + 280,
    addEmptyReferenceStructure.position[1],
  ],
};

// Move Build Draft Prompt right for readability.
buildDraftPrompt.position = [
  attachReferenceStructure.position[0] + 1540,
  attachReferenceStructure.position[1] + 40,
];

// -----------------------------------------------------------------------------
// Patch Build Draft Prompt code to use articleStructurePlan
// -----------------------------------------------------------------------------

let buildCode = buildDraftPrompt.parameters.jsCode;

const planConst = `
// -----------------------------------------------------------------------------
// 5b) Article Structure Plan context
// -----------------------------------------------------------------------------

const articleStructurePlanApplied = item.articleStructurePlanApplied === true;
const articleStructurePlanJson = item.articleStructurePlanJson || {};
const articleStructurePlanForPrompt = item.articleStructurePlanForPrompt || '';
const articleStructurePlanWarnings = Array.isArray(item.articleStructurePlanWarnings)
  ? item.articleStructurePlanWarnings
  : [];

const articleStructurePlanContext = {
  articleStructurePlanApplied,
  articleStructurePlanJson,
  articleStructurePlanForPrompt,
  articleStructurePlanWarnings,
};
`;

if (!buildCode.includes('// 5b) Article Structure Plan context')) {
  buildCode = buildCode.replace(
    '// -----------------------------------------------------------------------------\\n// 6) Final compact context for OpenAI',
    planConst + '\\n// -----------------------------------------------------------------------------\\n// 6) Final compact context for OpenAI'
  );
}

buildCode = buildCode.replace(
  '  sourcePackets: sourcePacketsContext,\\n\\n  workflow: {',
  '  sourcePackets: sourcePacketsContext,\\n\\n  articleStructurePlan: articleStructurePlanContext,\\n\\n  workflow: {'
);

buildCode = buildCode.replace(
  '    sourcePacketsCount,\\n  },\\n};',
  '    sourcePacketsCount,\\n    articleStructurePlanApplied,\\n  },\\n};'
);

buildCode = buildCode.replace(
  '  sourcePacketsSummary: {\\n    sourcePacketsApplied,\\n    sourcePacketsCount,\\n    sourcePacketRoleGuide,\\n  },\\n\\n  workflow: {',
  '  sourcePacketsSummary: {\\n    sourcePacketsApplied,\\n    sourcePacketsCount,\\n    sourcePacketRoleGuide,\\n  },\\n\\n  articleStructurePlan: {\\n    articleStructurePlanApplied,\\n    articleStructurePlanForPrompt,\\n    articleStructurePlanWarnings,\\n  },\\n\\n  workflow: {'
);

buildCode = buildCode.replace(
  '    sourcePacketsCount,\\n  },\\n};\\n\\n// -----------------------------------------------------------------------------\\n// 7) Build final reusable prompt',
  '    sourcePacketsCount,\\n    articleStructurePlanApplied,\\n  },\\n};\\n\\n// -----------------------------------------------------------------------------\\n// 7) Build final reusable prompt'
);

const articlePlanPromptSection = `
ARTICLE STRUCTURE PLAN:
The Article Structure Plan is article-specific planning guidance generated from the selected Reference Article Structure and current article context.

Use it to shape paragraph movement, opening logic, title/dek/opening separation, source roles, and rhythm.

The Article Structure Plan is not a factual source. Use it only when its instructions are supported by the source body, Source Analysis, Source Packets, or Closing Info.

\${articleStructurePlanApplied && articleStructurePlanForPrompt
  ? articleStructurePlanForPrompt
  : 'No Article Structure Plan is attached for this article.'}

ARTICLE STRUCTURE PLAN RULES:
- Follow the paragraph movement unless it conflicts with verified facts.
- Do not copy wording from the Reference Article Structure or any reference article.
- Use the plan to adapt the structure, not to import facts.
- Keep title, dek, and opening from repeating the same job.
- Keep background sources in their assigned role.
- If the plan warns against overusing a background source, follow that warning.
- If no Article Structure Plan is attached, follow the BAAD Style Blueprint and Source Analysis as usual.

`;

if (!buildCode.includes('ARTICLE STRUCTURE PLAN:')) {
  buildCode = buildCode.replace(
    'STYLE BLUEPRINT:\\nThe selected BAAD Style Blueprint is the primary style authority',
    articlePlanPromptSection + 'STYLE BLUEPRINT:\\nThe selected BAAD Style Blueprint is the primary style authority'
  );
}

buildCode = buildCode.replace(
  '      sourcePackets: contextForPromptJson.sourcePacketsSummary,\\n    },\\n    fullDebugContext: context,',
  '      sourcePackets: contextForPromptJson.sourcePacketsSummary,\\n      articleStructurePlan: contextForPromptJson.articleStructurePlan,\\n    },\\n    fullDebugContext: context,'
);

buildCode = buildCode.replace(
  '    sourcePacketsCount,\\n  },\\n};',
  '    sourcePacketsCount,\\n    articleStructurePlanApplied,\\n  },\\n};'
);

buildDraftPrompt.parameters.jsCode = buildCode;

// Add nodes.
workflow.nodes.push(
  buildArticleStructurePlanPrompt,
  openAiArticleStructurePlan,
  parseArticleStructurePlan,
  validateArticleStructurePlan,
  attachArticleStructurePlan,
  addEmptyArticleStructurePlan
);

// Rewire success path.
setMainConnection('Attach Reference Structure to Draft Context', [
  { node: 'Build Article Structure Plan Prompt' },
]);

setMainConnection('Build Article Structure Plan Prompt', [
  { node: 'OpenAI – Generate Article Structure Plan' },
]);

setMainConnection('OpenAI – Generate Article Structure Plan', [
  { node: 'Parse Article Structure Plan JSON' },
]);

setMainConnection('Parse Article Structure Plan JSON', [
  { node: 'Validate Article Structure Plan' },
]);

setMainConnection('Validate Article Structure Plan', [
  { node: 'Attach Article Structure Plan to Draft Context' },
]);

setMainConnection('Attach Article Structure Plan to Draft Context', [
  { node: 'Build Draft Prompt' },
]);

// Rewire no-structure path.
setMainConnection('Add Empty Reference Structure', [
  { node: 'Add Empty Article Structure Plan' },
]);

setMainConnection('Add Empty Article Structure Plan', [
  { node: 'Build Draft Prompt' },
]);

workflow.name = 'Generate BAAD Draft – Manual Blueprint Override Candidate – Article Structure Plan';

fs.writeFileSync(outputFile, JSON.stringify(workflow, null, 2) + '\\n');

console.log('==============================');
console.log('ARTICLE STRUCTURE PLAN PATCH CREATED');
console.log('==============================');
console.log('Input:', inputFile);
console.log('Output:', outputFile);
console.log('Nodes:', workflow.nodes.length);
console.log('Added nodes:');
console.log('- Build Article Structure Plan Prompt');
console.log('- OpenAI – Generate Article Structure Plan');
console.log('- Parse Article Structure Plan JSON');
console.log('- Validate Article Structure Plan');
console.log('- Attach Article Structure Plan to Draft Context');
console.log('- Add Empty Article Structure Plan');
