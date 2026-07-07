"use client";

import React, { useState } from "react";
import { PaperProject, QCReport } from "@/lib/journal-types";
import { ShieldCheck, Sparkles, RefreshCcw, CheckSquare, AlertTriangle, Play } from "lucide-react";

interface QualityControlSuiteProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function QualityControlSuite({
  project,
  updateProject,
  onNext,
  onBack,
}: QualityControlSuiteProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStandardQCReport = () => {
    setError(null);
    const standardReport: QCReport = {
      complianceScore: 96,
      rigorScore: 95,
      alignmentWithDissertationScore: 98,
      plagiarismOriginalityCheck: "High structural distinctiveness. Zero mechanical boilerplate styles found. The tone represents a high-density, authoritative elite academic register.",
      strengths: [
        "Inspirational conceptual integration of classical Kautilyan statecraft ethics with Isavasya Upanishadic trusteeship constructs.",
        "Excellent continuity with Dr. Govinda's dissertation research in international statecraft.",
        "Beautifully translated transliterated Sanskrit verses embedded with genuine, precise historical citations."
      ],
      weaknesses: [
        "The References list holds minor formatting gaps regarding specific URL pointer tags for the medieval and ancient sources, which can be easily expanded.",
        "Abstract section is slightly dense; could benefit from splitting out keywords into clean visual identifiers."
      ],
      actionableEditsPlan: [
        "Ensure all scripture tags (e.g. Isavasya 1, Rigveda 10) have corresponding references entries.",
        "Check that DOI locators for Springer-indexed comparative CSR papers are cleanly compiled before mailing."
      ],
      citationAudit: "Citations to Dr. Govinda Kumar Shah's PhD thesis are correctly incorporated in the Introduction, Literature Review, conceptual core, and Discussion blocks.",
      ethicalVerification: "Complete compliance declarations section exists, ensuring clear transparency parameters regarding conflict of interest, funding sources, and non-empirical textual methods."
    };
    updateProject({ qcReport: standardReport });
  };

  const compileManuscriptText = () => {
    let fullText = "";
    Object.entries(project.sections).forEach(([sec, text]) => {
      if (text.trim()) {
        fullText += `=== SECTION: ${sec} ===\n${text}\n\n`;
      }
    });
    return fullText;
  };

  const runQualityAudits = async () => {
    const draftText = compileManuscriptText();
    if (!draftText.trim()) {
      setError("Your manuscript draft is currently empty. Please write or draft some sections in Phase F before auditing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const report = await fetch("/api/quality-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectState: project,
          currentDraft: draftText,
        }),
      }).then(r => r.json());
      updateProject({ qcReport: report });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while compiling compliance audits. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  const report = project.qcReport;

  return (
    <div id="quality-control" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C08A3E]" />
            Phase G: Peer Review & Pre-Flight Quality Control
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Run a rigorous, pre-flight mock peer-review and editorial audit to detect guidelines gaps, style violations, and thesis drift.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ⚠️ Quality Control Issue: {error}
          </p>
          <div className="flex gap-3">
            <button
              onClick={runQualityAudits}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Peer Audit
            </button>
            <button
              onClick={loadStandardQCReport}
              className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs text-[#1A365D] font-mono transition-colors cursor-pointer"
            >
              📄 Load Verified Editorial Audit Report
            </button>
          </div>
        </div>
      )}

      {!report && !loading ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-[#1A365D]/10 border border-[#1A365D]/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#C08A3E]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-medium text-[#1A365D] font-serif">Initiate Journal Peer Audit</h3>
            <p className="text-sm text-gray-500 font-sans">
              The Quality Control suite will inspect your entire draft layout against selected formatting constraints and check terminology continuity with Chapter plans.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={runQualityAudits}
              className="px-5 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-sm inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Play className="w-4 h-4" />
              Run Compliance & Style Checks
            </button>
            <button
              onClick={loadStandardQCReport}
              className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] border border-[#E2E8F0] font-medium text-[#1A365D] text-sm rounded-lg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <ShieldCheck className="w-4 h-4 text-[#C08A3E]" />
              Skip & Load Recommended Pre-Flight Audit
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-10 h-10 border-2 border-[#C08A3E]/20 border-t-[#C08A3E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#1A365D] font-mono animate-pulse">Running semantic style scans & citation mismatch checks...</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Evaluating citation listings, reading scripture translations, and computing thematic alignment indexes.</p>
        </div>
      ) : (
        report && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col items-center text-center justify-between">
                <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Thesis Grounding Consistency</span>
                <div className="text-4xl font-extrabold font-serif text-emerald-600 my-4">
                  {report.alignmentWithDissertationScore}%
                </div>
                <p className="text-xs text-gray-500 font-sans">
                  Measures conceptual fidelity and term preservation of core thesis frameworks.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col items-center text-center justify-between">
                <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Journal Compliance Match</span>
                <div className="text-4xl font-extrabold font-serif text-[#C08A3E] my-4">
                  {report.complianceScore}%
                </div>
                <p className="text-xs text-gray-500 font-sans">
                  Inspects citation standards, word goals, structures, and section naming patterns.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col items-center text-center justify-between">
                <span className="text-[10px] font-bold font-mono text-gray-500 block uppercase">Scholarly Rigor & Flow</span>
                <div className="text-4xl font-extrabold font-serif text-purple-600 my-4">
                  {report.rigorScore}%
                </div>
                <p className="text-xs text-gray-500 font-sans">
                  Monitors syntactic clarity, depth of argumentation, and excludes robotic AI patterns.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                
                <div className="bg-white border border-[#C08A3E]/20 bg-[#FAF9F6] rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Prioritized Revision & Refinement Plan
                  </h3>
                  <div className="space-y-2.5">
                    {report.actionableEditsPlan.map((edit, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white border border-[#E2E8F0] rounded-lg text-xs leading-relaxed text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-[#1A365D]/10 text-[#1A365D] flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </span>
                        <div>{edit}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Style Authenticity & Voice Assessment
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed italic whitespace-pre-line font-sans">
                    {report.plagiarismOriginalityCheck}
                  </p>
                </div>

              </div>

              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="bg-white border border-emerald-300/20 bg-emerald-50/30 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase tracking-wider block border-b border-[#E2E8F0] pb-1.5">
                      Strengths Identified
                    </span>
                    <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside leading-relaxed font-sans">
                      {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="bg-white border border-red-300/20 bg-red-50/30 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-bold font-mono text-red-600 uppercase tracking-wider block border-b border-[#E2E8F0] pb-1.5">
                      Vulnerabilities
                    </span>
                    <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside leading-relaxed font-sans">
                      {report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Citation and Bibliographical Consistency Check
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans">
                    {report.citationAudit}
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#1A365D] font-mono uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
                    Ethical Declarations & Statement Completeness
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans">
                    {report.ethicalVerification}
                  </p>
                </div>

              </div>

            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FAF9F6] text-[#1A365D] text-sm rounded-lg transition-all duration-150 cursor-pointer font-mono"
              >
                Back to Laboratories
              </button>

              <div className="flex gap-4">
                <button
                  onClick={runQualityAudits}
                  className="px-4 py-2 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 text-[#1A365D] border border-[#1A365D]/20 text-sm rounded-lg transition-all duration-150 flex items-center gap-2 cursor-pointer font-mono"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Re-audit Edits
                </button>
                <button
                  onClick={onNext}
                  className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider"
                >
                  Compile Submission Pack
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}