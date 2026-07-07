"use client";

import React, { useState, useEffect } from "react";
import { PaperProject, ComplianceRules } from "@/lib/journal-types";
import { FileSearch, Sparkles, ClipboardCheck, Edit3, CheckSquare, ListPlus } from "lucide-react";

interface ComplianceChecklistPanelProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ComplianceChecklistPanel({
  project,
  updateProject,
  onNext,
  onBack,
}: ComplianceChecklistPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidelineInput, setGuidelineInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [lclWordGoal, setLclWordGoal] = useState("");
  const [lclCitations, setLclCitations] = useState("");

  const loadStandardGuidelines = () => {
    setError(null);
    const standardRules: ComplianceRules = {
      wordCountGoal: "6,000 - 8,000 words",
      citationStyle: "APA 7th Edition",
      formattingRules: [
        "Double-spaced, 12pt Times New Roman, 1-inch margins",
        "Continuous line numbers activated on review file",
        "Include separate Title Page with email and affiliations",
        "No author identifications on the main anonymous manuscript files"
      ],
      sectionStructure: [
        "Title Page",
        "Abstract & Keywords",
        "Introduction",
        "Literature Review / Related Work",
        "Conceptual / Ethical Framework",
        "Methodology / Methods",
        "Results / Analysis",
        "Discussion (including ethical implications and limitations)",
        "Conclusion",
        "Declarations (Funding, Conflicts of Interest, Ethical Approval, Consent, Data Availability)",
        "References",
        "Appendices (if applicable)"
      ],
      abstractRequirements: "Strict limit of 250 words, non-structured single paragraph format. Underneath specify 4 to 6 indexing keywords.",
      referencesRequirement: "Ensure APA 2020 format. Complete DOI pointers or portal URLs for every reference listed.",
      ethicalDisclosure: "Mandatory Declarations Section detailing Conflicts of Interest, Funding sources, and Ethical Approval status.",
      coverLetterNecessity: "Highly recommended or mandatory. Must state that the submission is original and has not been submitted elsewhere."
    };
    updateProject({ complianceRules: standardRules });
    setLclWordGoal(standardRules.wordCountGoal);
    setLclCitations(standardRules.citationStyle);
  };

  const extractRules = async () => {
    if (!project.targetJournal) return;
    setLoading(true);
    setError(null);
    try {
      const rules = await fetch("/api/extract-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalName: project.targetJournal.name,
          guidelinesText: guidelineInput,
          aiSettings: project.aiSettings,
        }),
      }).then(r => r.json());
      updateProject({ complianceRules: rules });
      setLclWordGoal(rules.wordCountGoal);
      setLclCitations(rules.citationStyle);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while compiling Author guidelines. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project.targetJournal && !project.complianceRules && !loading) {
      extractRules();
    } else if (project.complianceRules) {
      setLclWordGoal(project.complianceRules.wordCountGoal);
      setLclCitations(project.complianceRules.citationStyle);
    }
  }, [project.targetJournal]);

  const saveLocalEdits = () => {
    if (!project.complianceRules) return;
    updateProject({
      complianceRules: {
        ...project.complianceRules,
        wordCountGoal: lclWordGoal,
        citationStyle: lclCitations,
      },
    });
    setIsEditing(false);
  };

  const rules = project.complianceRules;

  return (
    <div id="compliance-checklist" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#C08A3E]" />
            Phase E: Journal Specification & Compliance Audit setup
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Convert complex publisher guidelines for <strong className="text-[#C08A3E]">{project.targetJournal?.name || "Target Journal"}</strong> into a highly actionable pre-writing compilation checklist.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold text-xs font-mono uppercase">⚠️ Compilation Issue: {error}</p>
          <div className="flex gap-3">
            <button
              onClick={extractRules}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Extraction
            </button>
            <button
              onClick={loadStandardGuidelines}
              className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs text-[#1A365D] font-mono transition-colors cursor-pointer"
            >
              📄 Load Standard Journal Template
            </button>
          </div>
        </div>
      )}

      {!rules && !loading ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-medium text-[#1A365D] font-serif">Author Guidelines Parser</h3>
            <p className="text-sm text-gray-500 font-sans">
              Optional: You can paste raw HTML/text excerpts of Author Instructions/Guidelines from the journal website, or bypass the AI parser to build with standard premier compliance structures right away.
            </p>
          </div>
          <div className="max-w-xl mx-auto space-y-4">
            <textarea
              rows={4}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#1A365D] font-mono focus:outline-none focus:border-[#C08A3E] placeholder:text-gray-400 mb-2"
              placeholder="Paste submission guidelines, styling rules, word count limits, reference specs here (optional)..."
              value={guidelineInput}
              onChange={(e) => setGuidelineInput(e.target.value)}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={extractRules}
                className="px-5 py-2 bg-[#1A365D] hover:bg-[#122847] font-medium text-white text-sm rounded-lg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer shadow-sm font-mono uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                Compile Spec Rules Map
              </button>
              <button
                onClick={loadStandardGuidelines}
                className="px-5 py-2 bg-white hover:bg-[#FAF9F6] border border-[#E2E8F0] font-medium text-[#1A365D] text-sm rounded-lg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 text-[#C08A3E]" />
                Skip & Load Standard Guidelines
              </button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-10 h-10 border-2 border-[#C08A3E]/20 border-t-[#C08A3E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#1A365D] font-mono animate-pulse">De-serialising Guidelines & establishing rule checklist...</p>
        </div>
      ) : (
        rules && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                    <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider">
                      Core Metrics
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs text-[#C08A3E] hover:text-[#1A365D] font-semibold cursor-pointer font-mono"
                    >
                      {isEditing ? "Cancel" : "Edit Target Values"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase">Word Count limit:</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 text-xs text-[#1A365D]"
                          value={lclWordGoal}
                          onChange={(e) => setLclWordGoal(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-gray-500 uppercase">Citation Style:</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 text-xs text-[#1A365D]"
                          value={lclCitations}
                          onChange={(e) => setLclCitations(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={saveLocalEdits}
                        className="w-full py-1.5 bg-[#1A365D] hover:bg-[#122847] text-white rounded text-xs font-mono font-medium cursor-pointer"
                      >
                        Save Configuration
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Word Count Goal:</span>
                        <div className="text-xl font-bold font-serif text-[#1A365D] mt-1">{rules.wordCountGoal}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Citation Standard:</span>
                        <div className="text-base font-semibold text-[#C08A3E] mt-1">{rules.citationStyle}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Cover Letter Necessity:</span>
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed">{rules.coverLetterNecessity}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Abstract Mandates
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed italic border border-[#E2E8F0] p-3 rounded-lg bg-[#FAF9F6]">
                    {rules.abstractRequirements}
                  </p>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Guideline Rules Checklist ({rules.formattingRules.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                    {rules.formattingRules.map((rule, i) => (
                      <div key={i} className="flex gap-2.5 items-start p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                        <CheckSquare className="w-4 h-4 text-[#C08A3E] shrink-0 mt-0.5" />
                        <span className="leading-normal">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#A3E635]/20 bg-[#A3E635]/5 rounded-xl p-5 space-y-4 border">
                  <div className="flex items-center justify-between border-b border-[#A3E635]/15 pb-2 flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-[#A3E635] font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Target Section Structure (Successfully Learned Journal Format)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1A365D]/10 text-[#A3E635] border border-[#A3E635]/40 rounded font-bold uppercase">
                      Journal Template Aligned
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-700 leading-relaxed">
                    The entire system has absorbed this target workflow structure. The <strong>Manuscript Drafting Workbench (Phase F)</strong> and the <strong>PDF Pre-Print Compiler</strong> are currently locked-in to this precise structure:
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {rules.sectionStructure.map((sec, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#1A365D]">
                        <span className="font-bold text-[#C08A3E]">{i + 1}.</span>
                        {sec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Integrity, Conflicts & Ethical Statements
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {rules.ethicalDisclosure}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FAF9F6] text-[#1A365D] text-sm rounded-lg transition-all duration-150 cursor-pointer font-mono"
              >
                Back to Journals
              </button>
              <button
                onClick={onNext}
                className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider"
              >
                Proceed to Drafting Workspace
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}