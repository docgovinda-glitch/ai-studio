"use client";

import React, { useState } from "react";
import { PaperProject, GroundingMap } from "@/lib/journal-types";
import { FileSearch, Sparkles, Check, AlertOctagon, ArrowLeft, ArrowRight } from "lucide-react";

interface GroundingMapDisplayProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GroundingMapDisplay({
  project,
  updateProject,
  onNext,
  onBack,
}: GroundingMapDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStandardGrounding = () => {
    setError(null);
    const standardGrounding: GroundingMap = {
      conceptualFramework: "This paper builds upon Dr. Govinda Kumar Shah's doctoral research in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018), extending the theoretical framework of ethical statecraft and trusteeship models from the Isavasya Upanishad into contemporary corporate governance paradigms.",
      keyConstructs: [
        "Dharma (Righteous Duty) in statecraft and organizational ethics",
        "Rajadharma (Sovereign Trusteeship) as applied to corporate leadership",
        "Upanishadic trusteeship (Ishana) in stakeholder management",
        "Kautilyan Arthashastra principles of ethical wealth creation"
      ],
      theoreticalAssumptions: [
        "Ancient Indian philosophical frameworks provide actionable models for modern governance",
        "Ethical leadership rooted in dharma produces sustainable organizational outcomes",
        "Trusteeship models bridge individual duty and collective welfare"
      ],
      reusableArguments: [
        "The Isavasya Upanishad's renunciation of ownership (verse 1) parallels modern ESG frameworks",
        "Kautilya's concept of progressive taxation aligns with contemporary wealth redistribution theories",
        "Shah's fieldwork in Nepal demonstrates practical application of dharmic governance"
      ],
      relevantCitations: [
        "Shah, G.K. (2018). 'Ethical Dimensions of Statecraft in Contemporary Nepal.' PhD Thesis, Tribhuvan University.",
        "Isavasya Upanishad, Verse 1 - 'Ishavasyam idam sarvam'",
        "Arthashastra, Book 1, Chapter 19 - 'Duties of the Ruler'"
      ],
      consistentTerminology: ["Dharma", "Rajadharma", "Trusteeship", "Ishana", "Karma", "Moksha"],
      philosophicalAnchors: "The paper is anchored in the synthesis of Vedic philosophical thought and modern governance theory, treating Dr. Shah's doctoral work as the primary empirical and theoretical foundation.",
      academicVoiceAdjustment: "Maintain formal academic register with Sanskrit transliterations in parentheses, following Shah's established citation patterns."
    };
    updateProject({ groundingMap: standardGrounding });
  };

  const generateGrounding = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dissertation-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          objectives: project.objectives,
          researchQuestions: project.researchQuestions,
          researchGap: project.researchGap,
          methodology: project.methodology,
          field: project.field,
          keywords: project.keywords,
          preferredJournalScope: project.preferredJournalScope,
          articleType: project.articleType,
          dissertationMaterials: project.dissertationMaterials,
          styleAspiration: project.styleAspiration,
          aiSettings: project.aiSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      updateProject({ groundingMap: data });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate grounding map. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  const grounding = project.groundingMap;

  return (
    <div id="grounding-map" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-[#C08A3E]" />
            Phase B: Dissertation Grounding Map
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Anchor paper in doctoral thesis and identify key constructs
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold text-xs font-mono uppercase">⚠️ Grounding Issue: {error}</p>
          <div className="flex gap-3">
            <button
              onClick={generateGrounding}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Generation
            </button>
            <button
              onClick={loadStandardGrounding}
              className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs text-[#1A365D] font-mono transition-colors cursor-pointer"
            >
              📄 Load Standard Template
            </button>
          </div>
        </div>
      )}

      {!grounding && !loading ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-[#1A365D]/10 border border-[#1A365D]/20 rounded-full flex items-center justify-center mx-auto">
            <FileSearch className="w-6 h-6 text-[#1A365D]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#1A365D] font-serif">Generate Grounding Map</h3>
            <p className="text-xs text-gray-500 font-sans">
              The Grounding Agent will map your research inputs to Dr. Govinda Kumar Shah's doctoral thesis framework.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={generateGrounding}
              className="px-5 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-bold text-white text-xs rounded-xl transition-all duration-200 shadow-sm inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-[#C08A3E]" />
              Generate Grounding Map
            </button>
            <button
              onClick={loadStandardGrounding}
              className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] border border-[#E2E8F0] font-bold text-[#1A365D] text-xs rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-[#C08A3E]" />
              Load Standard Template
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-10 h-10 border-2 border-[#C08A3E]/20 border-t-[#C08A3E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#1A365D] font-mono animate-pulse">Mapping dissertation constructs...</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Analyzing theoretical continuity with Dr. Govinda Kumar Shah's research.
          </p>
        </div>
      ) : (
        grounding && (
          <div className="space-y-5">
            <div className="bg-[#1A365D]/5 border border-[#1A365D]/10 rounded-xl p-4">
              <h4 className="text-sm font-bold text-[#1A365D] font-serif">Conceptual Framework</h4>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">{grounding.conceptualFramework}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
                <h4 className="text-xs font-mono font-bold text-[#C08A3E] uppercase mb-2">Key Constructs</h4>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  {grounding.keyConstructs.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
                <h4 className="text-xs font-mono font-bold text-[#C08A3E] uppercase mb-2">Consistent Terminology</h4>
                <div className="flex flex-wrap gap-1.5">
                  {grounding.consistentTerminology.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#C08A3E]/10 text-[#1A365D] text-[10px] font-mono rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-[#C08A3E] uppercase mb-2">Reusable Arguments</h4>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                {grounding.reusableArguments.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-[#C08A3E] uppercase mb-2">Relevant Citations</h4>
              <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                {grounding.relevantCitations.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FAF9F6] text-[#1A365D] text-xs rounded-lg transition-all duration-150 cursor-pointer font-mono"
              >
                ← Back to Intake
              </button>
              <button
                onClick={onNext}
                className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-bold text-white text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider"
              >
                Proceed to Data Discovery →
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}