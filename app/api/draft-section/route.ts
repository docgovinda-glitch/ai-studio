import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DraftSectionRequestBody = {
  projectState?: {
    title?: string;
    objectives?: string;
    researchQuestions?: string;
    researchGap?: string;
    methodology?: string;
    targetJournal?: { name?: string };
    complianceRules?: { citationStyle?: string };
    groundingMap?: {
      conceptualFramework?: string;
      keyConstructs?: string[];
      reusableArguments?: string[];
      consistentTerminology?: string[];
    };
    aiSettings?: {
      provider?: string;
      geminiApiKey?: string;
      openaiApiKey?: string;
      claudeApiKey?: string;
      deepseekApiKey?: string;
      qwenApiKey?: string;
      cohereApiKey?: string;
    };
  };
  sectionName?: string;
  sectionOutline?: string;
  userStyleSample?: string;
  includeScriptures?: boolean;
  draftInstruction?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DraftSectionRequestBody;
    const { 
      projectState, 
      sectionName, 
      sectionOutline, 
      userStyleSample, 
      includeScriptures, 
      draftInstruction 
    } = body;

    const groundingInfo = projectState?.groundingMap ? `
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
Title: ${projectState?.title}
Objectives: ${projectState?.objectives}
Research Questions: ${projectState?.researchQuestions}
Research Gap: ${projectState?.researchGap}
Methodology: ${projectState?.methodology}
Target Journal: ${projectState?.targetJournal?.name || "Academic Journal"} (Citation style: ${projectState?.complianceRules?.citationStyle || "APA 7th"})

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

    const messages: { role: AiRole; content: string }[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ];

    const apiKeys: Record<string, string> = {};
    const provider = projectState?.aiSettings?.provider || "mock";
    
    if (projectState?.aiSettings?.geminiApiKey) apiKeys.gemini = projectState.aiSettings.geminiApiKey;
    if (projectState?.aiSettings?.openaiApiKey) apiKeys.openai = projectState.aiSettings.openaiApiKey;
    if (projectState?.aiSettings?.claudeApiKey) apiKeys.claude = projectState.aiSettings.claudeApiKey;
    if (projectState?.aiSettings?.deepseekApiKey) apiKeys.deepseek = projectState.aiSettings.deepseekApiKey;
    if (projectState?.aiSettings?.qwenApiKey) apiKeys.qwen = projectState.aiSettings.qwenApiKey;
    if (projectState?.aiSettings?.cohereApiKey) apiKeys.cohere = projectState.aiSettings.cohereApiKey;

    const kernel = createAiKernel();

    const response = await kernel.generateText({
      providerId: provider,
      model: provider === "openai" ? "gpt-4o-mini" : 
             provider === "claude" ? "claude-3-5-sonnet-20241022" :
             provider === "deepseek" ? "deepseek-chat" :
             provider === "qwen" ? "qwen-plus" :
             provider === "cohere" ? "command-r-plus" :
             "gemini-2.5-flash",
      messages,
      apiKeys,
      temperature: 0.4,
    });

    return Response.json({ draftText: response.content });
  } catch (error: any) {
    console.error("Drafting error:", error);
    return Response.json({ error: error.message || "Failed to generate section draft" }, { status: 500 });
  }
}