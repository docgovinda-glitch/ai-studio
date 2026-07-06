import React, { useState } from "react";
import { PaperProject, RecommendJournal } from "../types";
import { BookOpen, Sparkles, Check, ChevronRight } from "lucide-react";
import { discoverJournals } from "../services/aiService";

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
    // Auto-select the first one if none is selected
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
      const data = await discoverJournals(project);
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
      complianceRules: undefined // Reset rules so they are re-learned for the new journal
    });
  };

  const listToRender = shortlist || (project.targetJournal ? [project.targetJournal] : null);

  return (
    <div id="journal-discovery" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-white font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            Phase D: Candidate Journal Matcher & Strategic Selection
          </h2>
          <p className="text-sm text-gray-400">
            Identify Scopus or Web of Science indexed, reputable journals matching your scope, avoiding predatory venues.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-sm space-y-3">
          <p className="font-semibold">⚠️ Compilation Issue: {error}</p>
          <div className="flex gap-3">
            <button
              onClick={findJournals}
              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-500/40 rounded text-xs text-white font-mono transition-colors cursor-pointer animate-pulse"
            >
              🔄 Retry Extraction
            </button>
            <button
              onClick={loadStandardJournals}
              className="px-3 py-1.5 bg-brand-500/30 hover:bg-brand-500/40 border border-brand-400/40 rounded text-xs text-brand-200 font-mono transition-colors cursor-pointer"
            >
              📄 Load Verified Springer / Springer Nature Index
            </button>
          </div>
        </div>
      )}

      {!listToRender && !loading ? (
        <div className="p-8 text-center glass-effect rounded-2xl border-white/5 space-y-4">
          <div className="w-12 h-12 bg-brand-900/40 border border-brand-500/30 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-brand-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-medium text-white font-display">Shortlist Peer Journals</h3>
            <p className="text-sm text-gray-400">
              The Publishing Strategist agent will parse international databases to suggest highly fitting, reputable, non-predatory publication options.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={findJournals}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-lg shadow-brand-500/20 inline-flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Consult Bibliometric Indexes
            </button>
            <button
              onClick={loadStandardJournals}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-gray-200 text-sm rounded-lg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer text-xs"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              Skip & Load Recommended Journals
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center glass-effect rounded-2xl border-white/5 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-300 font-mono animate-pulse">Filtering Scopus Q1/Q2 registries...</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">Auditing APC levels and checking editorial turnarounds of compliant publishers.</p>
        </div>
      ) : (
        listToRender && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-950/30 border border-brand-500/10 rounded-xl p-4">
              <div>
                <h4 className="text-sm font-medium text-white font-display font-display">Target Publication</h4>
                <p className="text-xs text-gray-400">
                  Select a journal to locks-in its submission constraints for Phase E compliance translation.
                </p>
              </div>
              <button
                onClick={findJournals}
                className="px-3 py-1.5 bg-brand-900/60 hover:bg-brand-900/90 border border-white/10 rounded-lg text-xs font-mono text-gray-300 transition-all cursor-pointer"
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
                    className={`glass-effect rounded-xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? "border-brand-500 bg-brand-950/20 ring-1 ring-brand-500"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-brand-900/30 text-brand-300 rounded border border-brand-500/10">
                            {journal.publisher}
                          </span>
                          <h3 className="text-base font-bold text-white font-display mt-2 group-hover:text-brand-300 transition-colors">
                            {journal.name}
                          </h3>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "bg-brand-500 border-brand-500 text-white"
                              : "border-white/20 text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-gray-400 block uppercase">Fee / APC Status:</span>
                          <span className="text-xs text-brand-200 mt-1 block font-mono">{journal.feeStatus}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold font-mono text-gray-400 block uppercase">Indexing & Ranking:</span>
                          <span className="text-xs text-brand-200 mt-1 block font-mono">{journal.ranking}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold font-mono text-brand-300 uppercase block">Aim & Scope Alignment:</span>
                          <p className="text-gray-300 mt-0.5 leading-relaxed">{journal.scopeFit}</p>
                        </div>
                        <div>
                          <span className="font-bold font-mono text-brand-300 uppercase block">Why this is an ideal strategic fit:</span>
                          <p className="text-gray-300 mt-0.5 leading-relaxed">{journal.whyFit}</p>
                        </div>
                        <div>
                          <span className="font-bold font-mono text-brand-300 uppercase block">Reviewing Style:</span>
                          <p className="text-gray-400 mt-0.5 leading-relaxed italic">{journal.reviewContext}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-4 border-t border-white/5">
                      <span className={`text-[11px] font-mono flex items-center gap-1 ${
                        isSelected ? "text-brand-400 font-semibold" : "text-gray-500"
                      }`}>
                        {isSelected ? "Selected Target Venue" : "Click to select journal"}
                        <ChevronRight className="w-3 h-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-300 text-sm rounded-lg transition-all duration-150 cursor-pointer"
              >
                Back to Empirical Data
              </button>
              <button
                disabled={!project.targetJournal}
                onClick={onNext}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-850 disabled:text-gray-500 disabled:cursor-not-allowed font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-lg shadow-brand-500/20 cursor-pointer"
              >
                Assemble Rule Checklist
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
