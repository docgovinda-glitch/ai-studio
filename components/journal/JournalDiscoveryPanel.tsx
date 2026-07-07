"use client";

import React, { useState } from "react";
import { PaperProject, RecommendJournal } from "@/lib/journal-types";
import { BookOpen, Sparkles, Check, ChevronRight } from "lucide-react";

interface JournalDiscoveryPanelProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function JournalDiscoveryPanel({
  project,
  updateProject,
  onNext,
  onBack,
}: JournalDiscoveryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<RecommendJournal[] | null>(null);

  const loadStandardJournals = () => {
    setError(null);
    const standardJournals: RecommendJournal[] = [
      {
        name: "AI and Ethics",
        publisher: "Springer Nature",
        scopeFit: "Direct fit for theoretical conceptual analysis blending Eastern ethical structures with statecraft and modern technological responsibility.",
        ranking: "Scopus indexed, ESCI, high growth JIF.",
        feeStatus: "No APC to publish under standard subscription option. Mandatory open access is fully optional.",
        submissionOpenness: "Average 4-6 weeks first editorial feedback.",
        reviewContext: "Double-blind constructive peer review, highly supportive of innovative global ethics perspectives.",
        whyFit: "Direct editorial interest in international governance frameworks, global philosophies, and indigenous ethical systems."
      },
      {
        name: "Journal of Business Ethics",
        publisher: "Springer",
        scopeFit: "The premier elite forum for publishing non-Western corporate accountability models, corporate governance philosophies, and systemic ethics.",
        ranking: "FT50, Scopus Q1, Web of Science high JIF.",
        feeStatus: "Zero fee subscription track available; high prestige peer venue.",
        submissionOpenness: "Average 8-12 weeks comprehensive academic review.",
        reviewContext: "Double-blind, prestigious board.",
        whyFit: "Matches Dr. Govinda's high-rigor comparative text analyses aligning Upanishadic and Kautilyan theory."
      }
    ];
    setShortlist(standardJournals);
    if (!project.targetJournal) {
      updateProject({ 
        targetJournal: standardJournals[0],
        complianceRules: undefined
      });
    }
  };

  const findJournals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/journal-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          keywords: project.keywords,
          field: project.field,
          preferredJournalScope: project.preferredJournalScope,
          articleType: project.articleType,
          aiSettings: project.aiSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setShortlist(data.journals || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to search for journals. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  const selectJournal = (journal: RecommendJournal) => {
    updateProject({ 
      targetJournal: journal,
      complianceRules: undefined
    });
  };

  const listToRender = shortlist || (project.targetJournal ? [project.targetJournal] : null);

  return (
    <div id="journal-discovery" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C08A3E]" />
            Phase D: Candidate Journal Matcher & Strategic Selection
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Identify Scopus or Web of Science indexed, reputable journals matching your scope, avoiding predatory venues.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold text-xs font-mono uppercase">⚠️ Compilation Issue: {error}</p>
          <div className="flex gap-3">
            <button
              onClick={findJournals}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Extraction
            </button>
            <button
              onClick={loadStandardJournals}
              className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs text-[#1A365D] font-mono transition-colors cursor-pointer"
            >
              📄 Load Verified Springer / Springer Nature Index
            </button>
          </div>
        </div>
      )}

      {!listToRender && !loading ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-[#1A365D]/10 border border-[#1A365D]/20 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-[#1A365D]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#1A365D] font-serif">Shortlist Peer Journals</h3>
            <p className="text-xs text-gray-500 font-sans">
              The Publishing Strategist agent will parse international databases to suggest highly fitting, reputable, non-predatory publication options.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={findJournals}
              className="px-5 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-bold text-white text-xs rounded-xl transition-all duration-200 shadow-sm inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-[#C08A3E]" />
              Consult Bibliometric Indexes
            </button>
            <button
              onClick={loadStandardJournals}
              className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] border border-[#E2E8F0] font-bold text-[#1A365D] text-xs rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-[#C08A3E]" />
              Skip & Load Recommended Journals
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-10 h-10 border-2 border-[#C08A3E]/20 border-t-[#C08A3E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#1A365D] font-mono animate-pulse">Filtering Scopus Q1/Q2 registries...</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Auditing APC levels and checking editorial turnarounds of compliant publishers.</p>
        </div>
      ) : (
        listToRender && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A365D]/5 border border-[#1A365D]/10 rounded-xl p-4">
              <div>
                <h4 className="text-sm font-bold text-[#1A365D] font-serif">Target Publication</h4>
                <p className="text-xs text-gray-500 font-sans">
                  Select a journal to lock-in its submission constraints for Phase E compliance translation.
                </p>
              </div>
              <button
                onClick={findJournals}
                className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs font-mono text-[#1A365D] transition-all cursor-pointer"
              >
                Re-scan Registries
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listToRender.map((journal, i) => {
                const isSelected = project.targetJournal?.name === journal.name;
                return (
                  <div
                    key={i}
                    onClick={() => selectJournal(journal)}
                    className={`bg-white border rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? "border-[#C08A3E] shadow-[#C08A3E]/10"
                        : "border-[#E2E8F0] hover:border-[#C08A3E]/30"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#1A365D]/10 text-[#1A365D] rounded border border-[#E2E8F0]">
                            {journal.publisher}
                          </span>
                          <h3 className="text-base font-bold text-[#1A365D] font-serif mt-2 group-hover:text-[#C08A3E] transition-colors">
                            {journal.name}
                          </h3>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "bg-[#C08A3E] border-[#C08A3E] text-white"
                              : "border-[#E2E8F0] text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-3 rounded-lg border border-[#E2E8F0]">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Fee / APC Status:</span>
                          <span className="text-xs text-[#1A365D] mt-1 block font-mono">{journal.feeStatus}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Indexing & Ranking:</span>
                          <span className="text-xs text-[#1A365D] mt-1 block font-mono">{journal.ranking}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold font-mono text-[#C08A3E] uppercase block">Aim & Scope Alignment:</span>
                          <p className="text-gray-700 mt-0.5 leading-relaxed font-sans">{journal.scopeFit}</p>
                        </div>
                        <div>
                          <span className="font-bold font-mono text-[#C08A3E] uppercase block">Why this is an ideal strategic fit:</span>
                          <p className="text-gray-700 mt-0.5 leading-relaxed font-sans">{journal.whyFit}</p>
                        </div>
                        <div>
                          <span className="font-bold font-mono text-[#C08A3E] uppercase block">Reviewing Style:</span>
                          <p className="text-gray-500 mt-0.5 leading-relaxed italic font-sans">{journal.reviewContext}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-4 border-t border-[#E2E8F0]">
                      <span className={`text-[11px] font-mono flex items-center gap-1 ${
                        isSelected ? "text-[#C08A3E] font-semibold" : "text-gray-500"
                      }`}>
                        {isSelected ? "Selected Target Venue" : "Click to select journal"}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FAF9F6] text-[#1A365D] text-xs rounded-lg transition-all duration-150 cursor-pointer font-mono"
              >
                Back to Empirical Data
              </button>
              <button
                disabled={!project.targetJournal}
                onClick={onNext}
                className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold text-white text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider"
              >
                Assemble Rule Checklist →
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}