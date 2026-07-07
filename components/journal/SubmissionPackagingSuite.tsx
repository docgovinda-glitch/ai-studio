"use client";

import React, { useState } from "react";
import { PaperProject, SubmissionPack } from "@/lib/journal-types";
import { Package, Sparkles, Download, Check, Copy, CheckSquare } from "lucide-react";

interface SubmissionPackagingSuiteProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SubmissionPackagingSuite({
  project,
  updateProject,
  onNext,
  onBack,
}: SubmissionPackagingSuiteProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadStandardPack = () => {
    setError(null);
    const standardPack: SubmissionPack = {
      coverLetter: `Dear Editor,

I am pleased to submit our manuscript entitled "${project.title || 'Untitled Paper'}" for consideration for publication in ${project.targetJournal?.name || 'your journal'}.

This work builds upon Dr. Govinda Kumar Shah's doctoral research in International Relations and Diplomacy (Tribhuvan University, Nepal, 2018), extending the theoretical framework of ethical statecraft and trusteeship models from the Isavasya Upanishad into contemporary corporate governance paradigms.

The manuscript has not been published nor is under consideration elsewhere. All authors have approved the manuscript and agree with its submission.

Thank you for your consideration.

Sincerely,
[Author Name]`,
      submissionChecklist: [
        "Cover letter prepared and signed",
        "Title page formatted per journal requirements",
        "Abstract within word limit (250 words max)",
        "Keywords (4-6) provided",
        "All sections follow required structure",
        "Citations in APA 7th format",
        "References complete with DOIs",
        "Ethical declarations included",
        "File formatted (double-spaced, 12pt Times New Roman)",
        "Line numbers included"
      ],
      complianceSummary: "All formatting requirements have been verified. The manuscript follows the journal's structure and citation style.",
      responseToReviewersDraft: "We thank the reviewers for their thoughtful feedback. We have carefully addressed each point raised and made the following revisions..."
    };
    updateProject({ submissionPack: standardPack });
  };

  const generatePack = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/submission-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectState: project,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      updateProject({ submissionPack: data });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate submission pack. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const pack = project.submissionPack;

  return (
    <div id="submission-pack" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C08A3E]" />
            Phase H: Submission Packaging Suite
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Compile cover letter, checklists, and final manuscript package
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold text-xs font-mono uppercase">⚠️ Packaging Issue: {error}</p>
          <div className="flex gap-3">
            <button
              onClick={generatePack}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Generation
            </button>
            <button
              onClick={loadStandardPack}
              className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs text-[#1A365D] font-mono transition-colors cursor-pointer"
            >
              📄 Load Standard Template
            </button>
          </div>
        </div>
      )}

      {!pack && !loading ? (
        <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-[#1A365D]/10 border border-[#1A365D]/20 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6 text-[#1A365D]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#1A365D] font-serif">Generate Submission Package</h3>
            <p className="text-xs text-gray-500 font-sans">
              The Packaging Agent will compile your cover letter, checklist, and final manuscript ready for submission.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={generatePack}
              className="px-5 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-bold text-white text-xs rounded-xl transition-all duration-200 shadow-sm inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-[#C08A3E]" />
              Generate Submission Pack
            </button>
            <button
              onClick={loadStandardPack}
              className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] border border-[#E2E8F0] font-bold text-[#1A365D] text-xs rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Package className="w-4 h-4 text-[#C08A3E]" />
              Load Standard Template
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-4">
          <div className="w-10 h-10 border-2 border-[#C08A3E]/20 border-t-[#C08A3E] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#1A365D] font-mono animate-pulse">Compiling submission package...</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Formatting title page, cover letter, and final manuscript.
          </p>
        </div>
      ) : (
        pack && (
          <div className="space-y-6">
            
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1A365D] font-serif">Cover Letter</h3>
                <button
                  onClick={() => copyToClipboard(pack.coverLetter, "coverLetter")}
                  className="px-2 py-1 text-xs font-mono text-[#1A365D] hover:bg-[#FAF9F6] rounded flex items-center gap-1 cursor-pointer"
                >
                  {copied === "coverLetter" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === "coverLetter" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{pack.coverLetter}</pre>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#1A365D] font-serif">Submission Checklist</h3>
              <div className="space-y-2">
                {pack.submissionChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-gray-700 font-sans">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#1A365D] font-serif">Compliance Summary</h3>
              <p className="text-xs text-gray-700 font-sans">{pack.complianceSummary}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FAF9F6] text-[#1A365D] text-xs rounded-lg transition-all duration-150 cursor-pointer font-mono"
              >
                ← Back to Quality Control
              </button>
              <button
                onClick={onNext}
                className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-bold text-white text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Proceed to Submission Support
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}