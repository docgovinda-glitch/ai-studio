import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QualityControlRequestBody = {
  projectState?: {
    title?: string;
    objectives?: string;
    researchQuestions?: string;
    researchGap?: string;
    methodology?: string;
    targetJournal?: { name?: string };
    complianceRules?: { citationStyle?: string; wordCountGoal?: string };
    groundingMap?: {
      conceptualFramework?: string;
      keyConstructs?: string[];
      consistentTerminology?: string[];
    };
    sections?: Record<string, string>;
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
  currentDraft?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QualityControlRequestBody;
    const { projectState, currentDraft } = body;

    const systemInstruction = `You are a rigorous, pre-flight Quality Control Auditor and Editorial Consultant. 
Your job is to perform a mock peer-review of the draft, checking for:
1. Journal compliance (word count, citation style, structure)
2. Scholarly rigor (argumentation, flow, depth)
3. Thesis continuity (conceptual alignment with the underlying doctoral dissertation)
4. Style authenticity (no robotic AI patterns, natural academic voice)
5. Citation consistency and completeness

Return a detailed JSON report with scores and actionable feedback.`;

    const prompt = `Perform a comprehensive quality audit on the following manuscript draft.

--- Manuscript Context ---
Title: ${projectState?.title}
Objectives: ${projectState?.objectives}
Research Questions: ${projectState?.researchQuestions}
Methodology: ${projectState?.methodology}
Target Journal: ${projectState?.targetJournal?.name || "Academic Journal"}
Citation Style Required: ${projectState?.complianceRules?.citationStyle || "APA 7th"}
Word Count Goal: ${projectState?.complianceRules?.wordCountGoal || "6000-8000 words"}

--- Dissertation Grounding ---
Conceptual Framework: ${projectState?.groundingMap?.conceptualFramework || "Not provided"}
Key Constructs: ${JSON.stringify(projectState?.groundingMap?.keyConstructs || [])}
Consistent Terminology: ${JSON.stringify(projectState?.groundingMap?.consistentTerminology || [])}

--- Draft to Audit ---
${currentDraft || "No draft provided"}

Return strictly valid JSON in this format:
{
  "complianceScore": 85,
  "rigorScore": 88,
  "alignmentWithDissertationScore": 92,
  "plagiarismOriginalityCheck": "Detailed analysis of originality, style authenticity, and absence of AI boilerplate patterns",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "actionableEditsPlan": ["Edit 1", "Edit 2", "Edit 3"],
  "citationAudit": "Analysis of citation consistency, completeness, and format adherence",
  "ethicalVerification": "Check on ethical disclosures, conflict of interest statements, and data availability"
}`;

    const messages: { role: AiRole; content: string }[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ];

    const apiKeys: Record<string, string> = {};
    const provider = projectState?.aiSettings?.provider || "gemini";
    
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
      temperature: 0.2,
    });

    try {
      const parsed = JSON.parse(response.content);
      return Response.json(parsed);
    } catch {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
      return Response.json({ error: "Failed to parse quality control response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Quality control error:", error);
    return Response.json({ error: error.message || "Failed to run quality control" }, { status: 500 });
  }
}