import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JournalDiscoveryRequestBody = {
  title?: string;
  keywords?: string;
  field?: string;
  preferredJournalScope?: string;
  articleType?: string;
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
    const body = (await request.json()) as JournalDiscoveryRequestBody;
    const { title, keywords, field, preferredJournalScope, articleType, aiSettings } = body;

    const systemInstruction = `You are an academic Publishing Strategist and Bibliometric expert. 
Your objective is to find 3 to 4 candidate peer-reviewed academic journals indexed in Scopus, Web of Science, or DOAJ. 
Provide authentic, well-known academic journals. Focus on journals that do not charge high APC (Article Processing Charge) fees (prefer diamond open access or standard subscription journals with no submission fees if possible). 
Identify predatory indicators and rule out predatory journals entirely.`;

    const prompt = `Identify candidate journals for:
- Paper Title: ${title || "A dissertation-grounded study"}
- Keywords: ${keywords || ""}
- Target Field: ${field || ""}
- Desired Journal Scope/Vibe: ${preferredJournalScope || ""}
- Article Type: ${articleType || ""}

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
      temperature: 0.3,
    });

    try {
      const parsed = JSON.parse(response.content);
      return Response.json(parsed);
    } catch {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
      return Response.json({ error: "Failed to parse journal discovery response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Journal discovery error:", error);
    return Response.json({ error: error.message || "Failed to discover journals" }, { status: 500 });
  }
}