import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GroundingRequestBody = {
  title?: string;
  objectives?: string;
  researchQuestions?: string;
  researchGap?: string;
  methodology?: string;
  field?: string;
  keywords?: string;
  journalScope?: string;
  articleType?: string;
  dissertationMaterials?: string;
  styleAspiration?: string;
  aiSettings?: {
    provider?: string;
    geminiApiKey?: string;
    openaiApiKey?: string;
    claudeApiKey?: string;
    deepseekApiKey?: string;
    qwenApiKey?: string;
    cohereApiKey?: string;
    ollamaEndpoint?: string;
    ollamaModel?: string;
    customEndpoint?: string;
    customModel?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GroundingRequestBody;
    const { 
      title, objectives, researchQuestions, researchGap, 
      methodology, field, keywords, journalScope, articleType, 
      dissertationMaterials, styleAspiration, aiSettings 
    } = body;

    const systemInstruction = `You are an elite, senior Academic Grounding and Epistemological Agent. 
Your objective is to ingest doctoral dissertation details and research intent, and map them into a solid publication blueprint. 
Maintain a rigorous, formal scholarly and philosophical tone, and identify direct lines of theoretical and conceptual continuity between the dissertation and the proposed article.
You must always default to treating the user's doctoral research (Dr. Govinda Kumar Shah, PhD, Tribhuvan University, Nepal) in International Relations and Diplomacy as the absolute, primary conceptual framework. Direct all theoretical and conceptual continuity to substantially citing and extending Dr. Shah's doctoral thesis as the foundational backbone.`;

    const prompt = `Perform Phase B of the publication preparation. Take the following inputs:
- Proposed Title: ${title || "Untitled Paper"}
- Fields & Keywords: ${field || ""} | Keywords: ${keywords || ""}
- Objectives: ${objectives || ""}
- Research Questions: ${researchQuestions || ""}
- Research Gap: ${researchGap || ""}
- Methodology: ${methodology || ""}
- Article Type: ${articleType || "Academic"}
- Preferred Journal Scope: ${journalScope || ""}
- Dissertation Materials Provided: ${dissertationMaterials || "None provided"}
- Writing Style Guidelines: ${styleAspiration || "Standard Academic Style"}

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

    // Build messages array
    const messages: { role: AiRole; content: string }[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ];

    // Build apiKeys object
    const apiKeys: Record<string, string> = {};
    const provider = aiSettings?.provider || "gemini";
    
    if (aiSettings?.geminiApiKey) apiKeys.gemini = aiSettings.geminiApiKey;
    if (aiSettings?.openaiApiKey) apiKeys.openai = aiSettings.openaiApiKey;
    if (aiSettings?.claudeApiKey) apiKeys.claude = aiSettings.claudeApiKey;
    if (aiSettings?.deepseekApiKey) apiKeys.deepseek = aiSettings.deepseekApiKey;
    if (aiSettings?.qwenApiKey) apiKeys.qwen = aiSettings.qwenApiKey;
    if (aiSettings?.cohereApiKey) apiKeys.cohere = aiSettings.cohereApiKey;

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

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response.content);
      return Response.json(parsed);
    } catch {
      // If not valid JSON, try to extract JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
      return Response.json({ error: "Failed to parse grounding map response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Dissertation grounding error:", error);
    return Response.json({ error: error.message || "Failed to generate grounding map" }, { status: 500 });
  }
}