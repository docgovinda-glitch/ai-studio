import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DataDiscoveryRequestBody = {
  title?: string;
  methodology?: string;
  field?: string;
  keywords?: string;
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
    const body = (await request.json()) as DataDiscoveryRequestBody;
    const { title, methodology, field, keywords, aiSettings } = body;

    const systemInstruction = `You are a scholarly Research Data discovery system. 
Your purpose is to identify 3 to 4 open, free, authentic, and official databases or registries matching the research methodology. 
Provide real, authentic public source names (e.g. World Bank Open Data, IPUMS, UN Data, Kaggle Public Datasets, Harvard Dataverse, DOAJ, Pew Research center). 
Never suggest fictional or simulated databases. Label reliability and limitations objectively.`;

    const prompt = `Based on the following research parameters:
- Title: ${title || "Untitled Paper"}
- Methodology: ${methodology || ""}
- Discipline: ${field || ""}
- Keywords: ${keywords || ""}

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
      return Response.json({ error: "Failed to parse data discovery response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Data discovery error:", error);
    return Response.json({ error: error.message || "Failed to discover data sources" }, { status: 500 });
  }
}