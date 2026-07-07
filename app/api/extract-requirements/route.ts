import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequirementsRequestBody = {
  journalName?: string;
  guidelinesText?: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequirementsRequestBody;
    const { journalName, guidelinesText, aiSettings } = body;

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

    const messages: { role: AiRole; content: string }[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ];

    const apiKeys: Record<string, string> = {};
    const provider = aiSettings?.provider || "mock";
    
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

    try {
      const parsed = JSON.parse(response.content);
      return Response.json(parsed);
    } catch {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
      return Response.json({ error: "Failed to parse requirements response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Requirements extraction error:", error);
    return Response.json({ error: error.message || "Failed to extract journal rules" }, { status: 500 });
  }
}