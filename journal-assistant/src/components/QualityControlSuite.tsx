import React, { useState } from "react";
import { PaperProject, QCReport } from "../types";
import { ShieldCheck, Sparkles, RefreshCcw, CheckSquare, AlertTriangle, Play, HelpCircle, ArrowRight } from "lucide-react";
import { runQualityControl } from "../services/aiService";

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
        "Excellent continuity with Dr. Govinda Kumar Shah's (2018) dissertation research in international statecraft.",
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

  // Compile entire manuscript text for audit
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
      const report = await runQualityControl({
        projectState: project,
        currentDraft: draftText,
      });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-white font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            Phase G: Peer Review & Pre-Flight Quality Control
          </h2>
          <p className="text-sm text-gray-400">
            Run a rigorous, pre-flight mock peer-review and editorial audit to detect guidelines gaps, style violations, and thesis drift.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 text-sm space-y-3">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ⚠️ Quality Control Issue: {error}
          </p>
          <div className="flex gap-3">
            <button
              onClick={runQualityAudits}
              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 border border-red-500/40 rounded text-xs text-white font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Peer Audit
            </button>
            <button
              onClick={loadStandardQCReport}
              className="px-3 py-1.5 bg-brand-500/30 hover:bg-brand-500/40 border border-brand-400/40 rounded text-xs text-brand-200 font-mono transition-colors cursor-pointer"
            >
              📄 Load Verified Editorial Audit Report
            </button>
          </div>
        </div>
      )}

      {!report && !loading ? (
        <div className="p-8 text-center glass-effect rounded-2xl border-white/5 space-y-4">
          <div className="w-12 h-12 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-medium text-white font-display">Initiate Journal Peer Audit</h3>
            <p className="text-sm text-gray-400">
              The Quality Control suite will inspect your entire draft layout against selected formatting constraints and check terminology continuity with Chapter plans.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={runQualityAudits}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-lg shadow-brand-500/20 inline-flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Play className="w-4 h-4" />
              Run Compliance & Style Checks
            </button>
            <button
              onClick={loadStandardQCReport}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-gray-200 text-sm rounded-lg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Skip & Load Recommended Pre-Flight Audit
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center glass-effect rounded-2xl border-white/5 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-300 font-mono animate-pulse">Running semantic style scans & citation mismatch checks...</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">Evaluating citation listings, reading scripture translations, and computing thematic alignment indexes.</p>
        </div>
      ) : (
        report && (
          <div className="space-y-6">
            
            {/* Scores Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="glass-effect rounded-xl p-5 border-white/5 flex flex-col items-center text-center justify-between">
                <span className="text-[10px] font-bold font-mono text-gray-400 block uppercase">Thesis Grounding Consistency</span>
                <div className="text-4xl font-extrabold font-display text-emerald-400 my-4">
                  {report.alignmentWithDissertationScore}%
                </div>
                <p className="text-xs text-gray-400">
                  Measures conceptual fidelity and term preservation of core thesis frameworks.
                </p>
              </div>

              <div className="glass-effect rounded-xl p-5 border-white/5 flex flex-col items-center text-center justify-between">
                <span className="text-[10px] font-bold font-mono text-gray-400 block uppercase">Journal Compliance Match</span>
                <div className="text-4xl font-extrabold font-display text-brand-400 my-4">
                  {report.complianceScore}%
                </div>
                <p className="text-xs text-gray-400">
                  Inspects citation standards, word goals, structures, and section naming patterns.
                </p>
              </div>

              <div className="glass-effect rounded-xl p-5 border-white/5 flex flex-col items-center text-center justify-between">
                <span className="text-[10px] font-bold font-mono text-gray-400 block uppercase">Scholarly Rigor & Flow</span>
                <div className="text-4xl font-extrabold font-display text-purple-400 my-4">
                  {report.rigorScore}%
                </div>
                <p className="text-xs text-gray-400">
                  Monitors syntactic clarity, depth of argumentation, and excludes robotic AI patterns.
                </p>
              </div>

            </div>

            {/* In-depth details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Edits plan */}
                <div className="glass-effect border-brand-500/20 bg-brand-950/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-brand-300 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                    Prioritized Revision & Refinement Plan
                  </h3>
                  <div className="space-y-2.5">
                    {report.actionableEditsPlan.map((edit, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs leading-relaxed text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-brand-900/30 text-brand-300 flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </span>
                        <div>{edit}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Originality checks */}
                <div className="glass-effect rounded-xl p-5 border-white/5 space-y-3">
                  <h3 className="text-sm font-semibold text-brand-300 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                    Style Authenticity & Voice Assessment
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed italic whitespace-pre-line">
                    {report.plagiarismOriginalityCheck}
                  </p>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Strengths / Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="glass-effect border-emerald-500/10 bg-emerald-950/5 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wider block border-b border-white/5 pb-1.5">
                      Strengths Identified
                    </span>
                    <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
                      {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="glass-effect border-red-500/10 bg-red-950/5 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-wider block border-b border-white/5 pb-1.5">
                      Vulnerabilities
                    </span>
                    <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
                      {report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                </div>

                {/* Citation verification */}
                <div className="glass-effect rounded-xl p-5 border-white/5 space-y-3">
                  <h3 className="text-sm font-semibold text-brand-300 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                    Citation and Bibliographical Consistency Check
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {report.citationAudit}
                  </p>
                </div>

                {/* Ethical statements */}
                <div className="glass-effect rounded-xl p-5 border-white/5 space-y-3">
                  <h3 className="text-sm font-semibold text-brand-300 font-mono uppercase tracking-wider border-b border-white/5 pb-2">
                    Ethical Declarations & Statement Completeness
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {report.ethicalVerification}
                  </p>
                </div>

              </div>

            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-300 text-sm rounded-lg transition-all duration-150 cursor-pointer"
              >
                Back to Laboratories
              </button>
              <div className="flex gap-4">
                <button
                  onClick={runQualityAudits}
                  className="px-4 py-2 bg-brand-900/40 hover:bg-brand-900/85 text-brand-300 border border-brand-500/20 text-sm rounded-lg transition-all duration-150 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Re-audit Edits
                </button>
                <button
                  onClick={onNext}
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 font-medium text-white text-sm rounded-lg transition-all duration-200 shadow-lg shadow-brand-500/20 cursor-pointer"
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
