import { createAiKernel } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubmissionPackRequestBody = {
  projectState?: {
    title?: string;
    targetJournal?: { name?: string; publisher?: string };
    complianceRules?: {
      citationStyle?: string;
      sectionStructure?: string[];
    };
    sections?: Record<string, string>;
    qcReport?: {
      strengths?: string[];
      weaknesses?: string[];
      actionableEditsPlan?: string[];
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
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionPackRequestBody;
    const { projectState } = body;

    const systemInstruction = `You are a Submission Packaging Specialist. Your job is to compile a complete, ready-to-submit manuscript package including:
1. A properly formatted title page
2. A cover letter
3. The compiled manuscript with all sections
4. A suggested response to reviewers (if needed)

All content should follow the journal's requirements and be ready for submission.`;

    const prompt = `Generate a complete submission package for the following manuscript.

--- Manuscript Details ---
Title: ${projectState?.title}
Target Journal: ${projectState?.targetJournal?.name || "Academic Journal"}
Publisher: ${projectState?.targetJournal?.publisher || "Publisher"}
Citation Style: ${projectState?.complianceRules?.citationStyle || "APA 7th"}

--- Section Structure ---
${projectState?.complianceRules?.sectionStructure?.join("\n") || "Standard academic structure"}

--- Manuscript Sections ---
${Object.entries(projectState?.sections || {}).map(([name, content]) => `### ${name}\n${content || ""}`).join("\n\n")}

--- Quality Control Notes ---
Strengths: ${JSON.stringify(projectState?.qcReport?.strengths || [])}
Weaknesses: ${JSON.stringify(projectState?.qcReport?.weaknesses || [])}
Actionable Edits: ${JSON.stringify(projectState?.qcReport?.actionableEditsPlan || [])}

Return strictly valid JSON in this format:
{
  "titlePage": "Complete title page content with proper formatting",
  "coverLetter": "Professional cover letter addressed to the editor",
  "compiledManuscript": "Full manuscript with all sections properly formatted",
  "reviewerResponseTemplate": "Template for responding to reviewer comments"
}`;

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
      return Response.json({ error: "Failed to parse submission pack response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Submission pack error:", error);
    return Response.json({ error: error.message || "Failed to generate submission pack" }, { status: 500 });
  }
}