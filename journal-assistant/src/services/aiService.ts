import { PaperProject, GroundingMap, DiscoveredDataSource, RecommendJournal, ComplianceRules, QCReport, SubmissionPack, AISettings, AIResponse } from "../types";
import { decryptData } from "../utils/crypto";
import AIGateway from "./aiGateway";

// Estimate pricing based on input/output words
function calculateCost(provider: string, model: string, inputWords: number, outputWords: number): number {
  const inputTokens = inputWords * 1.33;
  const outputTokens = outputWords * 1.33;
  
  let inputRate = 0.075; // rate per 1M tokens
  let outputRate = 0.30; // rate per 1M tokens

  if (provider === "gemini" || provider === "server") {
    inputRate = 0.075;
    outputRate = 0.30;
  } else if (provider === "openai") {
    if (model.includes("gpt-4o-mini")) {
      inputRate = 0.15;
      outputRate = 0.60;
    } else {
      inputRate = 2.50;
      outputRate = 10.00;
    }
  } else if (provider === "claude") {
    inputRate = 3.00;
    outputRate = 15.00;
  } else if (provider === "deepseek") {
    inputRate = 0.14;
    outputRate = 0.28;
  } else if (provider === "qwen") {
    inputRate = 0.075;
    outputRate = 0.30;
  } else if (provider === "cohere") {
    inputRate = 2.50;
    outputRate = 10.00;
  } else {
    // Local Ollama or custom models are free
    return 0;
  }

  const cost = ((inputTokens * inputRate) + (outputTokens * outputRate)) / 1000000;
  return Number(cost.toFixed(6));
}

// Log usage and cost metrics to the active profile's localStorage
function logAIUsage(provider: string, model: string, inputWords: number, outputWords: number, taskType: string) {
  if (typeof localStorage === "undefined") return;
  const user = localStorage.getItem("phd_active_session_username");
  if (!user) return;
  
  const savedStateStr = localStorage.getItem(`phd_profile_state_${user}`);
  if (!savedStateStr) return;
  
  try {
    const profile = JSON.parse(savedStateStr);
    const project = profile.projectState;
    if (!project) return;
    
    const cost = calculateCost(provider, model, inputWords, outputWords);
    
    const newLog = {
      timestamp: new Date().toISOString(),
      provider,
      model,
      inputWords,
      outputWords,
      estimatedCost: cost,
      taskType
    };
    
    const usageLogs = project.usageLogs || [];
    usageLogs.push(newLog);
    
    const costMetrics = project.costMetrics || { totalCost: 0, totalCalls: 0 };
    costMetrics.totalCost = Number((costMetrics.totalCost + cost).toFixed(6));
    costMetrics.totalCalls += 1;
    
    project.usageLogs = usageLogs;
    project.costMetrics = costMetrics;
    profile.projectState = project;
    
    localStorage.setItem(`phd_profile_state_${user}`, JSON.stringify(profile));
    
    // Dispatch a custom event to notify React components to update project state
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("scholar_project_updated", { detail: project }));
    }
  } catch (e) {
    console.error("Failed to log AI usage:", e);
  }
}

// Unified client-side fetch router for AI requests
async function generateWithSettings(params: {
  systemInstruction: string;
  prompt: string;
  temperature: number;
  responseMimeType?: string;
  aiSettings?: AISettings;
  taskType?: string;
}): Promise<string> {
  const taskType = params.taskType || "general";
  const settings = params.aiSettings || { provider: "auto" } as AISettings;

  const response = await AIGateway.generate({
    systemInstruction: params.systemInstruction,
    prompt: params.prompt,
    temperature: params.temperature,
    responseMimeType: params.responseMimeType,
    taskType
  }, settings);

  logAIUsage(response.provider, response.model || "unknown", response.inputWords, response.outputWords, taskType);

  return response.text;
}

// -------------------------------------------------------------
// ROBUST JSON EXTRACTION UTILITY
// Handles cases where AI returns plain text, markdown fences,
// or prose preamble before/after the actual JSON object.
// -------------------------------------------------------------
function safeParseJSON<T>(rawText: string): T {
  if (!rawText || rawText.trim() === "") {
    throw new Error("AI returned an empty response.");
  }

  let text = rawText.trim();

  // 1. Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // 2. Try parsing directly if it's already clean JSON
  try {
    return JSON.parse(text) as T;
  } catch (_) {
    // Continue to extraction strategies below
  }

  // 3. Extract the FIRST complete JSON object or array from the text
  // Find the outermost { } or [ ] block
  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");

  let start = -1;
  let endChar = "";
  let startChar = "";

  if (objStart === -1 && arrStart === -1) {
    throw new Error(`AI response does not contain JSON. Response started with: "${rawText.substring(0, 80)}"`);
  } else if (objStart === -1) {
    start = arrStart;
    startChar = "[";
    endChar = "]";
  } else if (arrStart === -1) {
    start = objStart;
    startChar = "{";
    endChar = "}";
  } else {
    // Use whichever comes first
    if (objStart < arrStart) {
      start = objStart;
      startChar = "{";
      endChar = "}";
    } else {
      start = arrStart;
      startChar = "[";
      endChar = "]";
    }
  }

  // Walk through text to find matching close bracket
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;
    if (ch === startChar) depth++;
    if (ch === endChar) {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  if (end === -1) {
    throw new Error(`AI response JSON is malformed or incomplete. Started with: "${rawText.substring(0, 80)}"`);
  }

  const extracted = text.substring(start, end + 1);

  try {
    return JSON.parse(extracted) as T;
  } catch (parseErr) {
    throw new Error(`AI response could not be parsed as JSON. Content: "${extracted.substring(0, 120)}"`);
  }
}

// -------------------------------------------------------------
// CLIENT-SIDE GENERATION WRAPPERS
// -------------------------------------------------------------

// Phase B: Dissertation Grounding Map
export async function generateDissertationGrounding(project: PaperProject): Promise<GroundingMap> {
  const systemInstruction = `You are an elite, senior Academic Grounding and Epistemological Agent. 
Your objective is to ingest doctoral dissertation details and research intent, and map them into a solid publication blueprint. 
Maintain a rigorous, formal scholarly and philosophical tone, and identify direct lines of theoretical and conceptual continuity between the dissertation and the proposed article.
You must always default to treating the user's doctoral research (Dr. Govinda Kumar Shah, PhD, Tribhuvan University, Nepal) in International Relations and Diplomacy as the absolute, primary conceptual framework. Direct all theoretical and conceptual continuity to substantially citing and extending Dr. Shah's doctoral thesis as the foundational backbone.`;

  const prompt = `Perform Phase B of the publication preparation. Take the following inputs:
- Proposed Title: ${project.title || "Untitled Paper"}
- Fields & Keywords: ${project.field || ""} | Keywords: ${project.keywords || ""}
- Objectives: ${project.objectives || ""}
- Research Questions: ${project.researchQuestions || ""}
- Research Gap: ${project.researchGap || ""}
- Methodology: ${project.methodology || ""}
- Article Type: ${project.articleType || "Academic"}
- Preferred Journal Scope: ${project.preferredJournalScope || ""}
- Dissertation Materials Provided: ${project.dissertationMaterials || "None provided"}
- Writing Style Guidelines: ${project.styleAspiration || "Standard Academic Style"}

Generate a comprehensive "Dissertation Grounding Map" in JSON format. Ensure all constructs, assumptions, arguments, and citations are systematically mapped back to treating the doctoral thesis of Dr. Govinda Kumar Shah (Tribhuvan University, Nepal) as the foundational conceptual framework. Return strictly valid JSON containing the following properties:
{
  "conceptualFramework": "How the concepts relate and are grounded in Dr. Govinda Kumar Shah's doctoral dissertation",
  "keyConstructs": ["Construct A: definition/aspect", "Construct B: definition/aspect"],
  "theoreticalAssumptions": ["Assumption 1", "Assumption 2"],
  "reusableArguments": ["Argument A", "Argument B"],
  "relevantCitations": ["Citation idea A", "Citation idea B"],
  "consistentTerminology": ["Term 1", "Term 2"],
  "philosophicalAnchors": "Theoretical framework summary bridging Dr. Govinda Kumar Shah's thesis to this paper",
  "academicVoiceAdjustment": "Analyzes the requested style or material, providing instructions for maintaining consistency"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.2,
    responseMimeType: "application/json",
    aiSettings: project.aiSettings,
    taskType: "grounding"
  });

  return safeParseJSON<GroundingMap>(responseText);
}

// Phase C: Research Data Discovery
export async function discoverDataSources(project: PaperProject): Promise<{ sources: DiscoveredDataSource[] }> {
  const systemInstruction = `You are a scholarly Research Data discovery system. 
Your purpose is to identify 3 to 4 open, free, authentic, and official databases or registries matching the research methodology. 
Provide real, authentic public source names (e.g. World Bank Open Data, IPUMS, UN Data, Kaggle Public Datasets, Harvard Dataverse, DOAJ, Pew Research center). 
Never suggest fictional or simulated databases. Label reliability and limitations objectively.`;

  const prompt = `Based on the following research parameters:
- Title: ${project.title || "Untitled Paper"}
- Methodology: ${project.methodology || ""}
- Discipline: ${project.field || ""}
- Keywords: ${project.keywords || ""}

Generate 3 to 4 high-quality public data source recommendations. Include both quantitative and qualitative options if appropriate.
Return strictly valid JSON in this format:
{
  "sources": [
    {
      "name": "Exact Name of Public Source (e.g. World Bank Open Data)",
      "url": "Authentic portal URL or locator identifier",
      "type": "Quantitative" or "Qualitative" or "Mixed",
      "relevance": "Direct explanation of why it is relevant to the proposed methodology and research questions",
      "reliability": "Assessment of data governance, official standing, peer-recognized trust",
      "limitations": "Inherent limitations of this public dataset (e.g., temporal coverage, geographical caps, self-reporting biases)"
    }
  ]
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.3,
    responseMimeType: "application/json",
    aiSettings: project.aiSettings,
    taskType: "data-discovery"
  });

  return safeParseJSON<{ sources: DiscoveredDataSource[] }>(responseText);
}

// Phase D: Journal Discovery
export async function discoverJournals(project: PaperProject): Promise<{ journals: RecommendJournal[] }> {
  const systemInstruction = `You are an academic Publishing Strategist and Bibliometric expert. 
Your objective is to find 3 to 4 candidate peer-reviewed academic journals indexed in Scopus, Web of Science, or DOAJ. 
Provide authentic, well-known academic journals. Focus on journals that do not charge high APC (Article Processing Charge) fees (prefer diamond open access or standard subscription journals with no submission fees if possible). 
Identify predatory indicators and rule out predatory journals entirely.`;

  const prompt = `Identify candidate journals for:
- Paper Title: ${project.title || "A dissertation-grounded study"}
- Keywords: ${project.keywords || ""}
- Target Field: ${project.field || ""}
- Desired Journal Scope/Vibe: ${project.preferredJournalScope || ""}
- Article Type: ${project.articleType || ""}

Generate a shortlist of exactly 3 to 4 reputable journals. Return strictly valid JSON matching this format:
{
  "journals": [
    {
      "name": "Official Journal Name (e.g., Journal of Cleaner Production)",
      "publisher": "Academic Publisher (e.g., Elsevier, Springer, Oxford University Press)",
      "scopeFit": "Critical analysis of why this paper fits the journal's aims and scope",
      "ranking": "Realistic indexing and rankings (e.g., Scopus Q1, WoS JIF, ABDC, SJR rating)",
      "feeStatus": "Accurate publication/APC fees (e.g. No APC to publish under standard subscription, or $0 Open Access, or specific APC)",
      "submissionOpenness": "General turnaround speed and open call info",
      "reviewContext": "Likely peer review context (double-blind, constructive, rigorous, etc.)",
      "whyFit": "Main strategic reason for choosing this journal"
    }
  ]
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.3,
    responseMimeType: "application/json",
    aiSettings: project.aiSettings,
    taskType: "journal-match"
  });

  return safeParseJSON<{ journals: RecommendJournal[] }>(responseText);
}

// Phase E: Journal Requirements Compliance Setup
export async function extractRequirements(
  journalName: string,
  guidelinesText: string,
  aiSettings: AISettings
): Promise<ComplianceRules> {
  const systemInstruction = `You are a meticulous Journal Compliance Auditor. Your job is to convert raw author guidelines, or standard requirements of highly recognized publishers, into a structured, executable formatting & style checklist. Ensure exact, clear compliance criteria are outlined.`;

  const prompt = `Synthesize formatting and workflow rules for:
Journal Name: ${journalName}
Raw Instructions excerpt provided: ${guidelinesText || "None - generate standard guidelines for a premier peer-reviewed journal in this field (Elsevier/Springer format)"}

Produce a high-fidelity checklists and internal compliance guidelines in JSON format. Return strictly valid JSON containing:
{
  "wordCountGoal": "Word count limit or recommendation (e.g., 6000-8000 words)",
  "citationStyle": "Citation Style (e.g., APA 7th, Harvard, IEEE, Chicago)",
  "formattingRules": ["Double spaced, 12pt Times New Roman, margins", "Line numbers included", "Header formatting requirements"],
  "sectionStructure": ["Title Page", "Abstract & Keywords", "Introduction", "Literature Review / Related Work", "Conceptual / Ethical Framework", "Methodology / Methods", "Results / Analysis", "Discussion (including ethical implications and limitations)", "Conclusion", "Declarations (Funding, Conflicts of Interest, Ethical Approval, Consent, Data Availability)", "References", "Appendices (if applicable)"],
  "abstractRequirements": "Max word count (e.g., 150-250), structure rules (e.g. structured, graphical abstract info)",
  "referencesRequirement": "Specific references/bib format rules",
  "ethicalDisclosure": "Standard statement requirements (no conflict of interest, funding details)",
  "coverLetterNecessity": "Whether a cover letter is mandatory and what key points are typically required"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.2,
    responseMimeType: "application/json",
    aiSettings,
    taskType: "requirements"
  });

  return safeParseJSON<ComplianceRules>(responseText);
}

// Phase F: Manuscript Section Co-Drafting Agent
export async function draftSection(params: {
  projectState: PaperProject;
  sectionName: string;
  sectionOutline: string;
  userStyleSample: string;
  includeScriptures: boolean;
  draftInstruction: string;
}): Promise<{ draftText: string }> {
  const { projectState, sectionName, sectionOutline, userStyleSample, includeScriptures, draftInstruction } = params;

  const groundingInfo = projectState.groundingMap ? `
--- Dissertation Anchors & Key Constructs ---
Conceptual Framework: ${projectState.groundingMap.conceptualFramework}
Key Constructs: ${JSON.stringify(projectState.groundingMap.keyConstructs)}
Reusable Arguments: ${JSON.stringify(projectState.groundingMap.reusableArguments)}
Consistent Terminology: ${JSON.stringify(projectState.groundingMap.consistentTerminology)}
` : "";

  const userStyleContext = userStyleSample ? `
--- User Style Reference ---
Mimic the vocabulary density, sentence progression, scholarly pacing, and tone of this text:
"${userStyleSample}"
` : "";

  const scriptureInstruction = includeScriptures ? `
--- Philosophical & Scriptural Support Mandate ---
All generated or refined sections MUST include supporting Sanskrit verses (in Roman transliteration or neat English synthesis) and citations from authentic, genuine Hindu scriptures such as the Vedas (Rigveda, Yajurveda, Samaveda, Atharvaveda), major Upanishads (e.g., Isa, Katha, Chandogya, Mundaka, Brihadaranyaka), Bhagavad Gita, and statecraft treatises (Kautilya's Arthashastra). 
Every scripture support MUST use authentic sources and specify genuine verses and citations (e.g., Isavasya Upanishad, Verse 1; Rigveda, 10.191.2; Bhagavad Gita, 2.47; Arthashastra, 1.19.34). These verses must be analytically and seamlessly integrated into the academic argument.
` : `Do not inject any verses or scriptures into this output unless they are directly part of the literature review already requested by the outline.`;

  const systemInstruction = `You are an elite, human-sounding Academic Writing Agent with years of successful publish-or-perish journal placements. 
Your tone is sophisticated, precise, deeply analytical, and fluid. You write without robotic filler phrases, artificial buzzwords (do NOT overuse 'revolutionize', 'testament', 'beacon', 'moreover', 'delve', 'demystify'), or repetitive transitions. 
Ensure you maintain extreme conceptual continuity with the underlying doctoral dissertation of Dr. Govinda Kumar Shah (PhD in International Relations and Diplomacy, Tribhuvan University, Nepal) and cite his thesis (e.g. "Shah, 2018" or "Shah, PhD thesis") substantially in all drafts as the foundational conceptual framework.`;

  const prompt = `Draft or refine the "${sectionName}" section of our manuscript.

--- Manuscript Details ---
Title: ${projectState.title}
Objectives: ${projectState.objectives}
Research Questions: ${projectState.researchQuestions}
Research Gap: ${projectState.researchGap}
Methodology: ${projectState.methodology}
Target Journal: ${projectState.targetJournal?.name || "Academic Journal"} (Citation style: ${projectState.complianceRules?.citationStyle || "APA 7th"})

${groundingInfo}
${userStyleContext}
${scriptureInstruction}

--- Section Instructions ---
Outline/Subsections requested:
${sectionOutline || "Standard flow for " + sectionName}

Custom Guidance for this turn:
${draftInstruction || "Write/complete the subsection with scholarly density and appropriate citations."}

Drafting Rules: 
1. Treat Dr. Govinda Kumar Shah's doctoral dissertation (and his previous research in international relations and diplomacy at Tribhuvan University) as the foundational conceptual framework, and cite it substantially (e.g., Shah, PhD Thesis; Shah, 2018) in the body.
2. Begin by clearly identifying where corresponding dissertation material is being leveraged or extended (e.g., "[Dissertation Reference Note: This section maps directly to and builds upon Chapter 3, Section 3.2 of the doctoral thesis to maintain theoretical rigor.]") before writing the main academic text.
3. Integrate authentic Sanskrit/Vedic/Upanishadic scriptural verses with precise and real historical citation tags (e.g., Rigveda 10.191.2).

Write the draft section in full, ready-to-publish academic prose. Do not leave placeholder text or summarized notes.`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.4,
    aiSettings: projectState.aiSettings,
    taskType: "drafting"
  });

  return { draftText: responseText };
}

// Phase F: Manuscript Section Co-Drafting Streaming Agent
export async function draftSectionStream(params: {
  projectState: PaperProject;
  sectionName: string;
  sectionOutline: string;
  userStyleSample: string;
  includeScriptures: boolean;
  draftInstruction: string;
  onToken: (token: string) => void;
}): Promise<AIResponse> {
  const { projectState, sectionName, sectionOutline, userStyleSample, includeScriptures, draftInstruction, onToken } = params;

  const groundingInfo = projectState.groundingMap ? `
--- Dissertation Anchors & Key Constructs ---
Conceptual Framework: ${projectState.groundingMap.conceptualFramework}
Key Constructs: ${JSON.stringify(projectState.groundingMap.keyConstructs)}
Reusable Arguments: ${JSON.stringify(projectState.groundingMap.reusableArguments)}
Consistent Terminology: ${JSON.stringify(projectState.groundingMap.consistentTerminology)}
` : "";

  const userStyleContext = userStyleSample ? `
--- User Style Reference ---
Mimic the vocabulary density, scholarly pacing, and tone of this text:
"${userStyleSample}"
` : "";

  // Incorporate writing profile if active
  let styleProfileContext = "";
  if (projectState.styleLearningEnabled && projectState.activeStyleProfileId) {
    try {
      const activeUser = localStorage.getItem("phd_active_session_username");
      if (activeUser) {
        const stateStr = localStorage.getItem(`phd_profile_state_${activeUser}`);
        if (stateStr) {
          const parsed = JSON.parse(stateStr);
          const profile = (parsed.writingProfiles || []).find((p: any) => p.id === projectState.activeStyleProfileId);
          if (profile) {
            styleProfileContext = `
--- Learned Author Style Profile ---
Preferred Terminology: ${JSON.stringify(profile.terminology)}
Sentence Complexity: ${profile.sentenceComplexity}
Citation Format style: ${profile.citationStyle}
`;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load active style profile in aiService:", e);
    }
  }

  // Include locked sections for continuity context (Priority 7)
  let continuityContext = "";
  if (projectState.sections && projectState.lockedSections && projectState.lockedSections.length > 0) {
    continuityContext = "\n--- Previously Drafted and Locked Sections (for Flow & Continuity) ---\n";
    projectState.lockedSections.forEach(sec => {
      const content = projectState.sections[sec];
      if (content) {
        continuityContext += `\n[Section: ${sec}]\n${content.slice(0, 3000)}\n`; // Pass first 3k chars of context
      }
    });
    continuityContext += "\n--- End of Locked Sections Context ---\n";
  }

  const scriptureInstruction = includeScriptures ? `
--- Philosophical & Scriptural Support Mandate ---
All generated or refined sections MUST include supporting Sanskrit verses (in Roman transliteration or neat English synthesis) and citations from authentic, genuine Hindu scriptures such as the Vedas, major Upanishads, Bhagavad Gita, and statecraft treatises (Kautilya's Arthashastra).
Every scripture support MUST use authentic sources and specify genuine verses and citations (e.g., Isavasya Upanishad, Verse 1).
` : "Do not inject any verses or scriptures into this output.";

  const systemInstruction = `You are an elite, human-sounding Academic Writing Agent. 
Your tone is sophisticated, precise, deeply analytical, and fluid. You write without robotic filler phrases.
Ensure you maintain extreme conceptual continuity with the underlying doctoral dissertation of Dr. Govinda Kumar Shah (PhD in International Relations and Diplomacy, Tribhuvan University, Nepal) and cite his thesis (e.g. "Shah, 2018" or "Shah, PhD thesis") substantially in all drafts.`;

  const prompt = `Draft or refine the "${sectionName}" section of our manuscript.

Title: ${projectState.title}
Objectives: ${projectState.objectives}
Research Questions: ${projectState.researchQuestions}
Methodology: ${projectState.methodology}
Target Journal: ${projectState.targetJournal?.name || "Academic Journal"}

${groundingInfo}
${userStyleContext}
${styleProfileContext}
${continuityContext}
${scriptureInstruction}

Outline/Subsections:
${sectionOutline || "Standard flow for " + sectionName}

Custom Guidance:
${draftInstruction || "Write/complete the subsection with scholarly density."}

Write the draft section in full academic prose.`;

  const response = await AIGateway.generateStream({
    systemInstruction,
    prompt,
    temperature: 0.4,
    taskType: "drafting"
  }, projectState.aiSettings || { provider: "auto" }, onToken);

  logAIUsage(response.provider, response.model || "unknown", response.inputWords, response.outputWords, "drafting");

  return response;
}

// Phase G: Quality Control (QC) Agent
export async function runQualityControl(params: {
  projectState: PaperProject;
  currentDraft: string;
}): Promise<QCReport> {
  const { projectState, currentDraft } = params;

  const systemInstruction = `You are a ruthless, expert Peer Reviewer and Journal Editor acting as a Quality Control Agent. 
Your objective is to evaluate the drafted paper for:
1. Strict alignment with the core doctoral dissertation framework.
2. Compliance with target journal guidelines and citation style.
3. Logical reasoning, lack of cliché AI style patterns, academic rigor, and style consistency.
Provide constructive, direct, scholarly scores and highly actionable edits.`;

  const prompt = `Perform a comprehensive QC Audit of the current manuscript draft:

--- Manuscript Details ---
Title: ${projectState.title}
Target Journal: ${projectState.targetJournal?.name || "Peer-Reviewed Journal"}
Required Style: ${projectState.complianceRules?.citationStyle || "APA 7th"}
Expected word count: ${projectState.complianceRules?.wordCountGoal || "Standard"}

--- Formatting Rules to verify ---
${JSON.stringify(projectState.complianceRules?.formattingRules || [])}

--- Current manuscript draft content to evaluate ---
${currentDraft || "No text compiled yet."}

Compile a comprehensive evaluation in JSON. Return strictly valid JSON with formatting:
{
  "complianceScore": 85, // out of 100
  "rigorScore": 90, // out of 100
  "alignmentWithDissertationScore": 95, // out of 100
  "plagiarismOriginalityCheck": "Summary of stylistic authenticity and distinct academic voice",
  "strengths": ["Strength A", "Strength B"],
  "weaknesses": ["Weakness A", "Weakness B"],
  "actionableEditsPlan": ["Specific issue and how to resolve it", "Another specific styling correction needed"],
  "citationAudit": "Check on format completeness, in-text citations vs references list consistency",
  "ethicalVerification": "Confirm whether the required disclosures, conflict of interest, and funding details are clean"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.2,
    responseMimeType: "application/json",
    aiSettings: projectState.aiSettings,
    taskType: "qc"
  });

  return safeParseJSON<QCReport>(responseText);
}

// Phase H: Compilation & Submission Pack Generator (Cover Letter)
export async function generateSubmissionPack(params: {
  projectState: PaperProject;
  authorDetails: string;
  revisionsStatus: string;
}): Promise<SubmissionPack> {
  const { projectState, authorDetails, revisionsStatus } = params;

  const systemInstruction = `You are a professional Academic submission advisor. Your goal is to draft a highly polished, respectful, and compelling Cover Letter to the Editors-in-Chief of peer journals, and construct a robust pre-flight checklist.`;

  const prompt = `Prepare a complete submission package for:
- Paper Title: ${projectState.title}
- Target Journal: ${projectState.targetJournal?.name || "Top Peer Journal"}
- Aim & Editorial Vibe: ${projectState.targetJournal?.whyFit || "High relevance"}
- Author Profile: ${authorDetails || "Doctoral Scholar"}
- Current revisions/status: ${revisionsStatus || "Final First Submission"}

Generate a comprehensive "Submission Package" in JSON. Return strictly valid JSON containing:
{
  "coverLetter": "Full-text formal, persuasive cover letter to the journal Editor-in-Chief highlighting the paper's contribution, dissertation backing, and alignment with the journal's scope.",
  "submissionChecklist": ["Pre-flight check list item 1 (title page anonymity, blind review check)", "Pre-flight item 2 (figures dpi limit check)", "Pre-flight item 3 (copyright/conflict check)"],
  "complianceSummary": "Summary of word counts, template details, and how we checked off every rule of the journal",
  "responseToReviewersDraft": "A template/framework for a response letter to reviewers for if revisions are requested later"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.3,
    responseMimeType: "application/json",
    aiSettings: projectState.aiSettings,
    taskType: "submission-pack"
  });

  return safeParseJSON<SubmissionPack>(responseText);
}

// AI Service: Suggest Academic Fields based on research title
export async function suggestAcademicFields(params: {
  title: string;
  aiSettings: AISettings;
}): Promise<{ fields: { name: string; rationale: string }[] }> {
  const systemInstruction = `You are an academic advisor specializing in multi-disciplinary research taxonomy. You suggest fitting disciplines for research.`;

  const prompt = `Analyze the research title: "${params.title}".
Suggest exactly 3 to 4 fitting academic fields or disciplines that this research spans. For each field, provide a brief 1-sentence rationale of why it is relevant.
Return strictly valid JSON in this format:
{
  "fields": [
    {
      "name": "Field Name",
      "rationale": "Why it fits and how it is relevant"
    }
  ]
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.3,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "fields-suggest"
  });

  return safeParseJSON<{ fields: { name: string; rationale: string }[] }>(responseText);
}

// AI Service: Suggest a novel research topic/title based on keywords
export async function suggestTopic(params: {
  keywords: string;
  aiSettings: AISettings;
}): Promise<{ topic: string; objectives: string; field: string }> {
  const systemInstruction = "You are a senior doctoral advisor helping scholars discover highly novel, publishable, and deep research topics.";
  const prompt = `Based on the keywords/ideas: "${params.keywords}", suggest a comprehensive, high-impact doctoral research topic/title.
Provide a clear title, a brief set of objectives, and the academic fields.
Return strictly valid JSON in this format:
{
  "topic": "The proposed research title",
  "objectives": "A summary of the main objectives of this topic",
  "field": "Standard academic fields (separated by commas)"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.7,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "topic-suggest"
  });
  return safeParseJSON<{ topic: string; objectives: string; field: string }>(responseText);
}

// AI Service: Improve/refine a draft research title
export async function improveTitle(params: {
  title: string;
  aiSettings: AISettings;
}): Promise<{ title: string; rationale: string }> {
  const systemInstruction = "You are an academic editor refining research titles for elite journals (Scopus/WoS).";
  const prompt = `Refine and improve this draft title: "${params.title}" to make it sound more academic, precise, and compelling for peer review.
Return strictly valid JSON in this format:
{
  "title": "The improved title",
  "rationale": "Brief rationale of what was changed and why"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.5,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "title-improve"
  });
  return safeParseJSON<{ title: string; rationale: string }>(responseText);
}

// AI Service: Generate alternative variations of a title
export async function generateTitleVariations(params: {
  title: string;
  aiSettings: AISettings;
}): Promise<{ variations: string[] }> {
  const systemInstruction = "You are a research consultant generating title variations across theoretical, conceptual, and empirical directions.";
  const prompt = `Given the title: "${params.title}", generate exactly 3 alternative variations showing different framings (e.g. theoretical, empirical, conceptual).
Return strictly valid JSON in this format:
{
  "variations": [
    "Variation 1: ...",
    "Variation 2: ...",
    "Variation 3: ..."
  ]
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.7,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "title-improve"
  });
  return safeParseJSON<{ variations: string[] }>(responseText);
}

// AI Service: Suggest objectives for a title
export async function suggestObjectives(params: {
  title: string;
  aiSettings: AISettings;
}): Promise<{ objectives: string[] }> {
  const systemInstruction = "You are a research mentor drafting structured doctoral objectives.";
  const prompt = `For the research title: "${params.title}", suggest 3 to 4 clear, action-oriented, and sequential research objectives.
Return strictly valid JSON in this format:
{
  "objectives": [
    "To analyze...",
    "To evaluate...",
    "To formulate..."
  ]
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.5,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "drafting"
  });
  return safeParseJSON<{ objectives: string[] }>(responseText);
}

// AI Service: Recommend methodology based on title and objectives
export async function suggestMethodology(params: {
  title: string;
  objectives: string;
  aiSettings: AISettings;
}): Promise<{ methodology: string; confidence: string; rationale: string }> {
  const systemInstruction = "You are an expert research methodologist.";
  const prompt = `Given the research title: "${params.title}" and objectives: "${params.objectives}", recommend a solid methodology approach (e.g. Mixed Methods, Textual Hermeneutics, Qualitative Grounded Theory, Quantitative Survey).
Evaluate your selection and return strictly valid JSON in this format:
{
  "methodology": "Name of the methodology",
  "confidence": "High" | "Medium" | "Low",
  "rationale": "Brief explanation of why this methodology fits the objectives"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.5,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "methodology"
  });
  return safeParseJSON<{ methodology: string; confidence: string; rationale: string }>(responseText);
}

// AI Service: Check Research Questions quality and relevance
export async function checkRQsQuality(params: {
  questions: string;
  aiSettings: AISettings;
}): Promise<{ relevance: number; novelty: number; publishability: number; feedback: string }> {
  const systemInstruction = "You are an elite journal editor scoring the strength of research questions.";
  const prompt = `Evaluate the following Research Questions:
"${params.questions}"
Rate them from 0% to 100% on Relevance, Novelty, and Publishability, and provide a single brief feedback sentence.
Return strictly valid JSON in this format:
{
  "relevance": 95,
  "novelty": 82,
  "publishability": 88,
  "feedback": "Feedback description..."
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.4,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "rq-check"
  });
  return safeParseJSON<{ relevance: number; novelty: number; publishability: number; feedback: string }>(responseText);
}

// AI Service: Suggest complete research blueprint based on a title
export async function suggestFullBlueprint(params: {
  title: string;
  aiSettings: AISettings;
}): Promise<{
  objectives: string;
  researchQuestions: string;
  methodology: string;
  field: string;
  keywords: string;
  researchGap: string;
  articleType: string;
}> {
  const systemInstruction = "You are a senior academic research advisor helping a doctoral scholar build a full research blueprint.";
  const prompt = `Based on the proposed research title: "${params.title}", generate a comprehensive suggested blueprint for the other workspace fields.
Provide a high-quality academic response. Return strictly valid JSON in the following format:
{
  "objectives": "1. To analyze...\\n2. To evaluate...\\n3. To formulate...",
  "researchQuestions": "1. How does...\\n2. What is...",
  "field": "Target Academic Field (e.g. Business Ethics, Philosophy)",
  "articleType": "Theoretical/Conceptual",
  "methodology": "Brief methodology description (study framework, textual analysis, or comparative tests)...",
  "researchGap": "Description of the literature discrepancy or missing research this study reconciles...",
  "keywords": "Comma-separated keywords (e.g. Vedic Trusteeship, CSR, Governance)"
}`;

  const responseText = await generateWithSettings({
    systemInstruction,
    prompt,
    temperature: 0.6,
    responseMimeType: "application/json",
    aiSettings: params.aiSettings,
    taskType: "blueprint"
  });
  return safeParseJSON<{ objectives: string; researchQuestions: string; methodology: string; field: string; keywords: string; researchGap: string; articleType: string; }>(responseText);
}

