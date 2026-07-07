import "server-only";

import {
  AiGenerateTextRequest,
  AiGenerateTextResponse,
  AiGenerateImageRequest,
  AiGenerateImageResponse,
  AiGenerateVoiceRequest,
  AiGenerateVoiceResponse,
  AiGenerateVideoRequest,
  AiGenerateVideoResponse,
  AiProvider,
} from "@/lib/ai/types";
import { AiValidationError } from "@/lib/ai/errors";

export function createMockProvider(): AiProvider {
  return {
    id: "mock",
    name: "Developer Mock",
    capabilities: ["chat", "image", "voice", "video"],
    defaultModel: "mock-model-v1",
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      // Simulate a small network delay for realistic UI loading states
      await new Promise((resolve) => setTimeout(resolve, 800));

      const lastMessage = request.messages[request.messages.length - 1];
      const content = lastMessage.content.toLowerCase();

      let mockReply = "";

      // Journal Assistant JSON responses - check for submission pack first
      if (content.includes("submission package") || content.includes("title page") || content.includes("cover letter") || content.includes("reviewer response template")) {
        mockReply = JSON.stringify({
          titlePage: "Title: [Manuscript Title]\n\nAuthor: [Author Name]\nAffiliation: [University/Organization]\nCorresponding Author: [Email]\n\nDate: [Date]\nWord Count: [Word Count]",
          coverLetter: "Dear Editor,\n\nI am pleased to submit our manuscript entitled '[Title]' for consideration for publication in [Journal Name]. This work extends the theoretical framework established in my doctoral dissertation (Shah, 2018, Tribhuvan University) on International Relations and Diplomacy.\n\nThe manuscript has not been published nor is under consideration elsewhere. All authors approve of this submission.\n\nSincerely,\n[Author Name]",
          compiledManuscript: "# [Manuscript Title]\n\n## Abstract\n[Abstract content]\n\n## 1. Introduction\n[Introduction content]\n\n## 2. Literature Review\n[Literature review content]\n\n## 3. Conceptual Framework\n[Framework content]\n\n## 4. Methodology\n[Methodology content]\n\n## 5. Results\n[Results content]\n\n## 6. Discussion\n[Discussion content]\n\n## 7. Conclusion\n[Conclusion content]\n\n## References\n[References in APA 7th format]",
          reviewerResponseTemplate: "Dear Reviewers,\n\nThank you for your thoughtful feedback on our manuscript. We have carefully addressed each point raised:\n\n[Response to each comment with specific changes made]\n\nWe believe these revisions have significantly strengthened our work.\n\nSincerely,\n[Author Name]"
        });
      } else if (content.includes("quality audit") || content.includes("compliance score") || content.includes("rigor score") || content.includes("audit the draft")) {
        mockReply = JSON.stringify({
          complianceScore: 85,
          rigorScore: 88,
          alignmentWithDissertationScore: 92,
          plagiarismOriginalityCheck: "Original content with proper academic voice, no detectable AI boilerplate patterns",
          strengths: [
            "Strong theoretical grounding in doctoral research",
            "Clear argumentation and logical flow",
            "Appropriate citation density and format"
          ],
          weaknesses: [
            "Some sections could benefit from more detailed empirical evidence",
            "Consider expanding the literature review scope"
          ],
          actionableEditsPlan: [
            "Add 2-3 more recent citations to strengthen literature review",
            "Expand methodology section with more detail on data collection",
            "Include additional empirical examples in discussion section"
          ],
          citationAudit: "APA 7th format correctly applied, all sources properly cited with DOIs where available",
          ethicalVerification: "All required ethical disclosures present and properly formatted"
        });
      } else if (content.includes("draft or refine") || content.includes("draft the") || (content.includes("section") && content.includes("manuscript"))) {
        mockReply = `# Introduction

This research builds upon the theoretical foundations established in Dr. Govinda Kumar Shah's doctoral dissertation in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018). The study addresses the evolving nature of diplomatic practice in contemporary international systems, examining how traditional statecraft principles adapt to modern challenges.

## Background

The field of international relations has witnessed significant transformations in diplomatic methodologies over the past decades. This research extends the conceptual framework from Shah (2018) to analyze these developments through the lens of traditional diplomatic theory.

## Research Objectives

The primary objective of this study is to examine the intersection between classical diplomatic theory and contemporary international relations challenges, providing empirical evidence for the continued relevance of traditional statecraft approaches.

## Structure of the Paper

This paper is organized as follows: Section 2 reviews the relevant literature, Section 3 presents the conceptual framework, Section 4 outlines the methodology, Section 5 presents the findings, and Section 6 concludes with recommendations.`;
      } else if (content.includes("grounding map") || content.includes("dissertation grounding") || content.includes("conceptual framework") || content.includes("key constructs")) {
        mockReply = JSON.stringify({
          conceptualFramework: "This research builds upon Dr. Govinda Kumar Shah's doctoral dissertation in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018). The conceptual framework extends the theoretical foundations of diplomatic practice and statecraft analysis, particularly focusing on the intersection of traditional diplomatic theory and contemporary international relations challenges.",
          keyConstructs: [
            "Diplomatic Practice Theory: The study of diplomatic methods and their evolution in modern statecraft",
            "International Relations Framework: Core principles of Nepal's diplomatic engagement in regional politics",
            "Statecraft Analysis: Examination of policy implementation and diplomatic outcomes",
            "Theoretical Continuity: Maintaining conceptual alignment with doctoral research foundations"
          ],
          theoreticalAssumptions: [
            "Diplomatic theory remains relevant in analyzing contemporary international relations",
            "State behavior in international systems can be understood through traditional diplomatic lenses",
            "Nepal's diplomatic experience offers unique insights into small state diplomacy"
          ],
          reusableArguments: [
            "The theoretical framework from Shah (2018) provides a robust foundation for analyzing diplomatic practices",
            "Empirical evidence from the doctoral research supports the proposed analytical approach",
            "The conceptual model can be extended to examine contemporary diplomatic challenges"
          ],
          relevantCitations: [
            "Shah, G.K. (2018). Doctoral Thesis: International Relations and Diplomacy, Tribhuvan University",
            "Waltz, K.N. (1979). Theory of International Politics",
            "Kissinger, H. (1994). Diplomacy"
          ],
          consistentTerminology: [
            "Diplomatic Practice",
            "Statecraft",
            "International Relations",
            "Theoretical Framework",
            "Conceptual Continuity"
          ],
          philosophicalAnchors: "The research is anchored in classical diplomatic theory while incorporating contemporary IR analysis methods, maintaining continuity with the doctoral work on Nepal's diplomatic evolution.",
          academicVoiceAdjustment: "Maintain formal academic tone with emphasis on theoretical rigor and empirical grounding in the doctoral research framework."
        });
      } else if (content.includes("data source") || content.includes("data discovery") || content.includes("public data") || content.includes("database")) {
        mockReply = JSON.stringify({
          sources: [
            {
              name: "World Bank Open Data",
              url: "https://data.worldbank.org",
              type: "Quantitative",
              relevance: "Provides comprehensive economic and development indicators for international relations analysis",
              reliability: "High - Official World Bank data with rigorous governance and peer recognition",
              limitations: "Limited to World Bank member countries, annual updates, potential reporting biases"
            },
            {
              name: "UN Data",
              url: "https://data.un.org",
              type: "Mixed",
              relevance: "Official UN statistics on international relations, trade, and diplomatic activities",
              reliability: "High - Official United Nations data repository",
              limitations: "Varies by dataset, some gaps in historical data"
            },
            {
              name: "Pew Research Center",
              url: "https://www.pewresearch.org",
              type: "Qualitative",
              relevance: "Public opinion research on international affairs and diplomatic perceptions",
              reliability: "High - Non-partisan research organization with rigorous methodology",
              limitations: "Primarily US-focused, limited longitudinal data"
            }
          ]
        });
      } else if (content.includes("requirements") || content.includes("citation style") || content.includes("formatting rules") || content.includes("compliance") || content.includes("author guidelines")) {
        mockReply = JSON.stringify({
          wordCountGoal: "6000-8000 words",
          citationStyle: "APA 7th edition",
          formattingRules: [
            "Double-spaced, 12pt Times New Roman, 1-inch margins",
            "Line numbers included throughout manuscript",
            "Header with short title and page numbers",
            "Section headings in bold, numbered format"
          ],
          sectionStructure: [
            "Title Page",
            "Abstract & Keywords",
            "Introduction",
            "Literature Review",
            "Conceptual Framework",
            "Methodology",
            "Results/Analysis",
            "Discussion",
            "Conclusion",
            "Declarations",
            "References",
            "Appendices"
          ],
          abstractRequirements: "150-250 words, structured format with background, methods, results, conclusions",
          referencesRequirement: "APA 7th edition, DOI required for all sources, hanging indent format",
          ethicalDisclosure: "Conflict of interest statement, funding disclosure, ethical approval if applicable",
          coverLetterNecessity: "Required - include significance statement, no prior submission confirmation, suggested reviewers"
        });
      } else if (content.includes("quality control") || content.includes("compliance score") || content.includes("rigor score") || content.includes("audit")) {
        mockReply = JSON.stringify({
          complianceScore: 85,
          rigorScore: 88,
          alignmentWithDissertationScore: 92,
          plagiarismOriginalityCheck: "Original content with proper academic voice, no detectable AI boilerplate patterns",
          strengths: [
            "Strong theoretical grounding in doctoral research",
            "Clear argumentation and logical flow",
            "Appropriate citation density and format"
          ],
          weaknesses: [
            "Some sections could benefit from more detailed empirical evidence",
            "Consider expanding the literature review scope"
          ],
          actionableEditsPlan: [
            "Add 2-3 more recent citations to strengthen literature review",
            "Expand methodology section with more detail on data collection",
            "Include additional empirical examples in discussion section"
          ],
          citationAudit: "APA 7th format correctly applied, all sources properly cited with DOIs where available",
          ethicalVerification: "All required ethical disclosures present and properly formatted"
        });
      } else if (content.includes("submission pack") || content.includes("title page") || content.includes("cover letter") || content.includes("compiled manuscript")) {
        mockReply = JSON.stringify({
          titlePage: "Title: [Manuscript Title]\n\nAuthor: [Author Name]\nAffiliation: [University/Organization]\nCorresponding Author: [Email]\n\nDate: [Date]\nWord Count: [Word Count]",
          coverLetter: "Dear Editor,\n\nI am pleased to submit our manuscript entitled '[Title]' for consideration for publication in [Journal Name]. This work extends the theoretical framework established in my doctoral dissertation (Shah, 2018, Tribhuvan University) on International Relations and Diplomacy.\n\nThe manuscript has not been published nor is under consideration elsewhere. All authors approve of this submission.\n\nSincerely,\n[Author Name]",
          compiledManuscript: "# [Manuscript Title]\n\n## Abstract\n[Abstract content]\n\n## 1. Introduction\n[Introduction content]\n\n## 2. Literature Review\n[Literature review content]\n\n## 3. Conceptual Framework\n[Framework content]\n\n## 4. Methodology\n[Methodology content]\n\n## 5. Results\n[Results content]\n\n## 6. Discussion\n[Discussion content]\n\n## 7. Conclusion\n[Conclusion content]\n\n## References\n[References in APA 7th format]",
          reviewerResponseTemplate: "Dear Reviewers,\n\nThank you for your thoughtful feedback on our manuscript. We have carefully addressed each point raised:\n\n[Response to each comment with specific changes made]\n\nWe believe these revisions have significantly strengthened our work.\n\nSincerely,\n[Author Name]"
        });
      } else if (content.includes("section") || content.includes("introduction") || content.includes("literature review") || content.includes("methodology") || content.includes("results") || content.includes("discussion") || content.includes("conclusion")) {
        mockReply = `# Introduction

This research builds upon the theoretical foundations established in Dr. Govinda Kumar Shah's doctoral dissertation in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018). The study addresses the evolving nature of diplomatic practice in contemporary international systems, examining how traditional statecraft principles adapt to modern challenges.

## Background

The field of international relations has witnessed significant transformations in diplomatic methodologies over the past decades. This research extends the conceptual framework from Shah (2018) to analyze these developments through the lens of traditional diplomatic theory.

## Research Objectives

The primary objective of this study is to examine the intersection between classical diplomatic theory and contemporary international relations challenges, providing empirical evidence for the continued relevance of traditional statecraft approaches.

## Structure of the Paper

This paper is organized as follows: Section 2 reviews the relevant literature, Section 3 presents the conceptual framework, Section 4 outlines the methodology, Section 5 presents the findings, and Section 6 concludes with recommendations.`;
      } else if (content.includes("outline") || content.includes("blog") || content.includes("write")) {
        mockReply = `### AI Studio Content Draft Outline

Here is a structured draft suggestion based on your query:

1. **Introduction**
   - Grab attention with a hook.
   - Define the core topic and relevance.
   - Summarize the thesis.

2. **Core Concepts & Key Pillars**
   - **Pillar A:** Technical feasibility & architectural simplicity.
   - **Pillar B:** User experience (UX) & developer experience (DX).
   - **Pillar C:** Extensibility & robust provider routing.

3. **Implementation Timeline**
   - Phase 1: Interactive mockup and schema definition.
   - Phase 2: Live provider integration and error tolerance.
   - Phase 3: Deployment, monitoring, and telemetry hookups.

4. **Conclusion**
   - Summary of key takeaways.
   - Next actionable steps.

*Generated automatically by the AI Studio Writing assistant.*`;
      } else if (content.includes("project")) {
        mockReply = `AI Studio supports organizing work into independent workspaces called **Projects**. 

A project can bundle:
- Writing drafts and scripts
- Generated image prompts and assets
- Narration storyboards
- Custom local/cloud models configurations

To get started, click the "New Project" button in the navigation or dashboard.`;
      } else if (content.includes("voice") || content.includes("audio") || content.includes("speak")) {
        mockReply = `Voice Studio supports Text-to-Speech narration generation, voice cloning, and audio transcription workflows.

You can specify tone parameters (e.g., *Professional*, *Energetic*, *Calm*) and generate high-fidelity speech previews. Connect cloud speech APIs or run local cloning models behind the AI Kernel adapter.`;
      } else if (content.includes("image") || content.includes("generate")) {
        mockReply = `Image Studio permits prompt-based generation of assets.

Recommended styling keywords:
- **Style**: *Cinematic, Photorealistic, Minimalist vector, 3D render*
- **Composition**: *Macro close-up, wide landscape, isometric view*
- **Lighting**: *Golden hour, studio soft light, high contrast*`;
      } else {
        mockReply = `Hello! I am AI Studio's offline Developer Mock model. 

I'm processing your request using the local Mock provider adapter because:
1. Local Ollama instance is not detected or was bypassed.
2. You are in offline/development mode.

You can ask me to draft blog posts, outline projects, or explain Voice and Image studio features to see how the system interfaces between client views and the AI Kernel backend.`;
      }

      const promptTokens = lastMessage.content.split(/\s+/).length + 10;
      const completionTokens = mockReply.split(/\s+/).length;

      return {
        providerId: "mock",
        model: request.model ?? "mock-model-v1",
        content: mockReply,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        metadata: {
          simulatedDelayMs: 800,
          offlineMode: true,
        },
      };
    },

    async generateTextStream(
      request: AiGenerateTextRequest
    ): Promise<ReadableStream> {
      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      const lastMessage = request.messages[request.messages.length - 1];
      const content = lastMessage.content.toLowerCase();

      let mockReply = "";

      // Journal Assistant JSON responses - check for submission pack first
      if (content.includes("submission package") || content.includes("title page") || content.includes("cover letter") || content.includes("reviewer response template")) {
        mockReply = JSON.stringify({
          titlePage: "Title: [Manuscript Title]\n\nAuthor: [Author Name]\nAffiliation: [University/Organization]\nCorresponding Author: [Email]\n\nDate: [Date]\nWord Count: [Word Count]",
          coverLetter: "Dear Editor,\n\nI am pleased to submit our manuscript entitled '[Title]' for consideration for publication in [Journal Name]. This work extends the theoretical framework established in my doctoral dissertation (Shah, 2018, Tribhuvan University) on International Relations and Diplomacy.\n\nThe manuscript has not been published nor is under consideration elsewhere. All authors approve of this submission.\n\nSincerely,\n[Author Name]",
          compiledManuscript: "# [Manuscript Title]\n\n## Abstract\n[Abstract content]\n\n## 1. Introduction\n[Introduction content]\n\n## 2. Literature Review\n[Literature review content]\n\n## 3. Conceptual Framework\n[Framework content]\n\n## 4. Methodology\n[Methodology content]\n\n## 5. Results\n[Results content]\n\n## 6. Discussion\n[Discussion content]\n\n## 7. Conclusion\n[Conclusion content]\n\n## References\n[References in APA 7th format]",
          reviewerResponseTemplate: "Dear Reviewers,\n\nThank you for your thoughtful feedback on our manuscript. We have carefully addressed each point raised:\n\n[Response to each comment with specific changes made]\n\nWe believe these revisions have significantly strengthened our work.\n\nSincerely,\n[Author Name]"
        });
      } else if (content.includes("quality audit") || content.includes("compliance score") || content.includes("rigor score") || content.includes("audit the draft")) {
        mockReply = JSON.stringify({
          complianceScore: 85,
          rigorScore: 88,
          alignmentWithDissertationScore: 92,
          plagiarismOriginalityCheck: "Original content with proper academic voice, no detectable AI boilerplate patterns",
          strengths: [
            "Strong theoretical grounding in doctoral research",
            "Clear argumentation and logical flow",
            "Appropriate citation density and format"
          ],
          weaknesses: [
            "Some sections could benefit from more detailed empirical evidence",
            "Consider expanding the literature review scope"
          ],
          actionableEditsPlan: [
            "Add 2-3 more recent citations to strengthen literature review",
            "Expand methodology section with more detail on data collection",
            "Include additional empirical examples in discussion section"
          ],
          citationAudit: "APA 7th format correctly applied, all sources properly cited with DOIs where available",
          ethicalVerification: "All required ethical disclosures present and properly formatted"
        });
      } else if (content.includes("draft or refine") || content.includes("draft the") || (content.includes("section") && content.includes("manuscript"))) {
        mockReply = `# Introduction

This research builds upon the theoretical foundations established in Dr. Govinda Kumar Shah's doctoral dissertation in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018). The study addresses the evolving nature of diplomatic practice in contemporary international systems, examining how traditional statecraft principles adapt to modern challenges.

## Background

The field of international relations has witnessed significant transformations in diplomatic methodologies over the past decades. This research extends the conceptual framework from Shah (2018) to analyze these developments through the lens of traditional diplomatic theory.

## Research Objectives

The primary objective of this study is to examine the intersection between classical diplomatic theory and contemporary international relations challenges, providing empirical evidence for the continued relevance of traditional statecraft approaches.

## Structure of the Paper

This paper is organized as follows: Section 2 reviews the relevant literature, Section 3 presents the conceptual framework, Section 4 outlines the methodology, Section 5 presents the findings, and Section 6 concludes with recommendations.`;
      } else if (content.includes("grounding map") || content.includes("dissertation grounding") || content.includes("conceptual framework") || content.includes("key constructs")) {
        mockReply = JSON.stringify({
          conceptualFramework: "This research builds upon Dr. Govinda Kumar Shah's doctoral dissertation in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018). The conceptual framework extends the theoretical foundations of diplomatic practice and statecraft analysis, particularly focusing on the intersection of traditional diplomatic theory and contemporary international relations challenges.",
          keyConstructs: [
            "Diplomatic Practice Theory: The study of diplomatic methods and their evolution in modern statecraft",
            "International Relations Framework: Core principles of Nepal's diplomatic engagement in regional politics",
            "Statecraft Analysis: Examination of policy implementation and diplomatic outcomes",
            "Theoretical Continuity: Maintaining conceptual alignment with doctoral research foundations"
          ],
          theoreticalAssumptions: [
            "Diplomatic theory remains relevant in analyzing contemporary international relations",
            "State behavior in international systems can be understood through traditional diplomatic lenses",
            "Nepal's diplomatic experience offers unique insights into small state diplomacy"
          ],
          reusableArguments: [
            "The theoretical framework from Shah (2018) provides a robust foundation for analyzing diplomatic practices",
            "Empirical evidence from the doctoral research supports the proposed analytical approach",
            "The conceptual model can be extended to examine contemporary diplomatic challenges"
          ],
          relevantCitations: [
            "Shah, G.K. (2018). Doctoral Thesis: International Relations and Diplomacy, Tribhuvan University",
            "Waltz, K.N. (1979). Theory of International Politics",
            "Kissinger, H. (1994). Diplomacy"
          ],
          consistentTerminology: [
            "Diplomatic Practice",
            "Statecraft",
            "International Relations",
            "Theoretical Framework",
            "Conceptual Continuity"
          ],
          philosophicalAnchors: "The research is anchored in classical diplomatic theory while incorporating contemporary IR analysis methods, maintaining continuity with the doctoral work on Nepal's diplomatic evolution.",
          academicVoiceAdjustment: "Maintain formal academic tone with emphasis on theoretical rigor and empirical grounding in the doctoral research framework."
        });
      } else if (content.includes("data source") || content.includes("data discovery") || content.includes("public data") || content.includes("database")) {
        mockReply = JSON.stringify({
          sources: [
            {
              name: "World Bank Open Data",
              url: "https://data.worldbank.org",
              type: "Quantitative",
              relevance: "Provides comprehensive economic and development indicators for international relations analysis",
              reliability: "High - Official World Bank data with rigorous governance and peer recognition",
              limitations: "Limited to World Bank member countries, annual updates, potential reporting biases"
            },
            {
              name: "UN Data",
              url: "https://data.un.org",
              type: "Mixed",
              relevance: "Official UN statistics on international relations, trade, and diplomatic activities",
              reliability: "High - Official United Nations data repository",
              limitations: "Varies by dataset, some gaps in historical data"
            },
            {
              name: "Pew Research Center",
              url: "https://www.pewresearch.org",
              type: "Qualitative",
              relevance: "Public opinion research on international affairs and diplomatic perceptions",
              reliability: "High - Non-partisan research organization with rigorous methodology",
              limitations: "Primarily US-focused, limited longitudinal data"
            }
          ]
        });
      } else if (content.includes("journal") || content.includes("scopus") || content.includes("publish") || content.includes("submission")) {
        mockReply = JSON.stringify({
          journals: [
            {
              name: "Journal of International Relations",
              publisher: "Taylor & Francis",
              scopeFit: "Excellent fit for diplomatic theory and international relations research",
              ranking: "Scopus Q2, WoS JIF 2.1",
              feeStatus: "No APC for standard subscription, optional open access $1500",
              submissionOpenness: "Rolling submissions, 8-12 week review process",
              reviewContext: "Double-blind peer review, rigorous academic standards",
              whyFit: "Strong focus on diplomatic theory and statecraft analysis aligns with doctoral research"
            },
            {
              name: "International Journal of Diplomacy",
              publisher: "SAGE Publications",
              scopeFit: "Direct match for diplomatic practice and international relations",
              ranking: "Scopus Q1, WoS JIF 3.2",
              feeStatus: "No APC, subscription-based journal",
              submissionOpenness: "Continuous submission, 10-14 week review",
              reviewContext: "Constructive double-blind review process",
              whyFit: "Specializes in diplomatic theory and practice research"
            }
          ]
        });
      } else if (content.includes("requirements") || content.includes("citation style") || content.includes("formatting rules") || content.includes("compliance") || content.includes("author guidelines")) {
        mockReply = JSON.stringify({
          wordCountGoal: "6000-8000 words",
          citationStyle: "APA 7th edition",
          formattingRules: [
            "Double-spaced, 12pt Times New Roman, 1-inch margins",
            "Line numbers included throughout manuscript",
            "Header with short title and page numbers",
            "Section headings in bold, numbered format"
          ],
          sectionStructure: [
            "Title Page",
            "Abstract & Keywords",
            "Introduction",
            "Literature Review",
            "Conceptual Framework",
            "Methodology",
            "Results/Analysis",
            "Discussion",
            "Conclusion",
            "Declarations",
            "References",
            "Appendices"
          ],
          abstractRequirements: "150-250 words, structured format with background, methods, results, conclusions",
          referencesRequirement: "APA 7th edition, DOI required for all sources, hanging indent format",
          ethicalDisclosure: "Conflict of interest statement, funding disclosure, ethical approval if applicable",
          coverLetterNecessity: "Required - include significance statement, no prior submission confirmation, suggested reviewers"
        });
      } else if (content.includes("quality control") || content.includes("compliance score") || content.includes("rigor score") || content.includes("audit")) {
        mockReply = JSON.stringify({
          complianceScore: 85,
          rigorScore: 88,
          alignmentWithDissertationScore: 92,
          plagiarismOriginalityCheck: "Original content with proper academic voice, no detectable AI boilerplate patterns",
          strengths: [
            "Strong theoretical grounding in doctoral research",
            "Clear argumentation and logical flow",
            "Appropriate citation density and format"
          ],
          weaknesses: [
            "Some sections could benefit from more detailed empirical evidence",
            "Consider expanding the literature review scope"
          ],
          actionableEditsPlan: [
            "Add 2-3 more recent citations to strengthen literature review",
            "Expand methodology section with more detail on data collection",
            "Include additional empirical examples in discussion section"
          ],
          citationAudit: "APA 7th format correctly applied, all sources properly cited with DOIs where available",
          ethicalVerification: "All required ethical disclosures present and properly formatted"
        });
      } else if (content.includes("submission pack") || content.includes("title page") || content.includes("cover letter") || content.includes("compiled manuscript")) {
        mockReply = JSON.stringify({
          titlePage: "Title: [Manuscript Title]\n\nAuthor: [Author Name]\nAffiliation: [University/Organization]\nCorresponding Author: [Email]\n\nDate: [Date]\nWord Count: [Word Count]",
          coverLetter: "Dear Editor,\n\nI am pleased to submit our manuscript entitled '[Title]' for consideration for publication in [Journal Name]. This work extends the theoretical framework established in my doctoral dissertation (Shah, 2018, Tribhuvan University) on International Relations and Diplomacy.\n\nThe manuscript has not been published nor is under consideration elsewhere. All authors approve of this submission.\n\nSincerely,\n[Author Name]",
          compiledManuscript: "# [Manuscript Title]\n\n## Abstract\n[Abstract content]\n\n## 1. Introduction\n[Introduction content]\n\n## 2. Literature Review\n[Literature review content]\n\n## 3. Conceptual Framework\n[Framework content]\n\n## 4. Methodology\n[Methodology content]\n\n## 5. Results\n[Results content]\n\n## 6. Discussion\n[Discussion content]\n\n## 7. Conclusion\n[Conclusion content]\n\n## References\n[References in APA 7th format]",
          reviewerResponseTemplate: "Dear Reviewers,\n\nThank you for your thoughtful feedback on our manuscript. We have carefully addressed each point raised:\n\n[Response to each comment with specific changes made]\n\nWe believe these revisions have significantly strengthened our work.\n\nSincerely,\n[Author Name]"
        });
      } else if (content.includes("section") || content.includes("introduction") || content.includes("literature review") || content.includes("methodology") || content.includes("results") || content.includes("discussion") || content.includes("conclusion")) {
        mockReply = `# Introduction

This research builds upon the theoretical foundations established in Dr. Govinda Kumar Shah's doctoral dissertation in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018). The study addresses the evolving nature of diplomatic practice in contemporary international systems, examining how traditional statecraft principles adapt to modern challenges.

## Background

The field of international relations has witnessed significant transformations in diplomatic methodologies over the past decades. This research extends the conceptual framework from Shah (2018) to analyze these developments through the lens of traditional diplomatic theory.

## Research Objectives

The primary objective of this study is to examine the intersection between classical diplomatic theory and contemporary international relations challenges, providing empirical evidence for the continued relevance of traditional statecraft approaches.

## Structure of the Paper

This paper is organized as follows: Section 2 reviews the relevant literature, Section 3 presents the conceptual framework, Section 4 outlines the methodology, Section 5 presents the findings, and Section 6 concludes with recommendations.`;
      } else if (content.includes("outline") || content.includes("blog") || content.includes("write")) {
        mockReply = `### AI Studio Content Draft Outline

Here is a structured draft suggestion based on your query:

1. **Introduction**
   - Grab attention with a hook.
   - Define the core topic and relevance.
   - Summarize the thesis.

2. **Core Concepts & Key Pillars**
   - **Pillar A:** Technical feasibility & architectural simplicity.
   - **Pillar B:** User experience (UX) & developer experience (DX).
   - **Pillar C:** Extensibility & robust provider routing.

3. **Implementation Timeline**
   - Phase 1: Interactive mockup and schema definition.
   - Phase 2: Live provider integration and error tolerance.
   - Phase 3: Deployment, monitoring, and telemetry hookups.

4. **Conclusion**
   - Summary of key takeaways.
   - Next actionable steps.

*Generated automatically by the AI Studio Writing assistant.*`;
      } else if (content.includes("project")) {
        mockReply = `AI Studio supports organizing work into independent workspaces called **Projects**. 

A project can bundle:
- Writing drafts and scripts
- Generated image prompts and assets
- Narration storyboards
- Custom local/cloud models configurations

To get started, click the "New Project" button in the navigation or dashboard.`;
      } else if (content.includes("voice") || content.includes("audio") || content.includes("speak")) {
        mockReply = `Voice Studio supports Text-to-Speech narration generation, voice cloning, and audio transcription workflows.

You can specify tone parameters (e.g., *Professional*, *Energetic*, *Calm*) and generate high-fidelity speech previews. Connect cloud speech APIs or run local cloning models behind the AI Kernel adapter.`;
      } else if (content.includes("image") || content.includes("generate")) {
        mockReply = `Image Studio permits prompt-based generation of assets.

Recommended styling keywords:
- **Style**: *Cinematic, Photorealistic, Minimalist vector, 3D render*
- **Composition**: *Macro close-up, wide landscape, isometric view*
- **Lighting**: *Golden hour, studio soft light, high contrast*`;
      } else {
        mockReply = `Hello! I am AI Studio's offline Developer Mock model. 

I'm processing your request using the local Mock provider adapter because:
1. Local Ollama instance is not detected or was bypassed.
2. You are in offline/development mode.

You can ask me to draft blog posts, outline projects, or explain Voice and Image studio features to see how the system interfaces between client views and the AI Kernel backend.`;
      }

      // Create a streaming response that simulates typing
      const stream = new ReadableStream({
        async start(controller) {
          const words = mockReply.split(" ");
          for (const word of words) {
            controller.enqueue(new TextEncoder().encode(word + " "));
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          controller.close();
        }
      });

      return stream;
    },

    async generateImage(
      request: AiGenerateImageRequest
    ): Promise<AiGenerateImageResponse> {
      if (!request.prompt || !request.prompt.trim()) {
        throw new AiValidationError("A prompt is required for image generation.");
      }

      // Simulate a small network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Return a mock image URL (using a placeholder service)
      const mockImageUrl = `https://placehold.co/1024x1024/6366f1/ffffff/png?text=${encodeURIComponent(request.prompt.substring(0, 50))}`;

      return {
        providerId: "mock",
        model: request.model ?? "mock-image-v1",
        imageUrl: mockImageUrl,
        metadata: {
          simulatedDelayMs: 1200,
          offlineMode: true,
        },
      };
    },

    async generateVoice(
      request: AiGenerateVoiceRequest
    ): Promise<AiGenerateVoiceResponse> {
      if (!request.text || !request.text.trim()) {
        throw new AiValidationError("Text is required for voice generation.");
      }

      // Simulate a small network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return a mock audio URL (using a placeholder service)
      const mockAudioUrl = `https://placehold.co/400x200/6366f1/ffffff/png?text=Voice+Mock`;

      return {
        providerId: "mock",
        model: request.model ?? "mock-voice-v1",
        audioUrl: mockAudioUrl,
        metadata: {
          simulatedDelayMs: 1000,
          offlineMode: true,
          voice: request.voice ?? "alloy",
        },
      };
    },

    async generateVideo(
      request: AiGenerateVideoRequest
    ): Promise<AiGenerateVideoResponse> {
      if (!request.prompt || !request.prompt.trim()) {
        throw new AiValidationError("A prompt is required for video generation.");
      }

      // Simulate a small network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Return a mock video URL (using a placeholder service)
      const mockVideoUrl = `https://placehold.co/640x360/6366f1/ffffff/png?text=Video+Mock`;

      return {
        providerId: "mock",
        model: request.model ?? "mock-video-v1",
        videoUrl: mockVideoUrl,
        metadata: {
          simulatedDelayMs: 2000,
          offlineMode: true,
          duration: request.duration ?? 5,
        },
      };
    },
  };
}
