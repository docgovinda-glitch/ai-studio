"use client";

import React, { useState } from "react";
import { PaperProject, ComplianceRules } from "@/lib/journal-types";
import { Edit3, Sparkles, RefreshCcw, CheckSquare, AlertTriangle, Play, HelpCircle, ArrowRight, BookOpen, FileText } from "lucide-react";

interface ManuscriptDraftingWorkspaceProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ManuscriptDraftingWorkspace({
  project,
  updateProject,
  onNext,
  onBack,
}: ManuscriptDraftingWorkspaceProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [sectionOutline, setSectionOutline] = useState("");
  const [draftInstruction, setDraftInstruction] = useState("");
  const [includeScriptures, setIncludeScriptures] = useState(true);
  const [userStyleSample, setUserStyleSample] = useState("");

  const sections = project.complianceRules?.sectionStructure || [
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
  ];

  const draftSection = async (sectionName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/draft-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectState: project,
          sectionName,
          sectionOutline,
          userStyleSample,
          includeScriptures,
          draftInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      updateProject({
        sections: {
          ...project.sections,
          [sectionName]: data.draftText,
        },
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate section draft. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  const updateSectionText = (sectionName: string, text: string) => {
    updateProject({
      sections: {
        ...project.sections,
        [sectionName]: text,
      },
    });
  };

  return (
    <div id="manuscript-drafting" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#C08A3E]" />
            Phase F: Manuscript Drafting Workspace
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Guided co-writer for each manuscript section
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold text-xs font-mono uppercase">⚠️ Drafting Issue: {error}</p>
          <button
            onClick={() => draftSection(activeSection)}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
          >
            🔄 Retry Draft
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <h3 className="text-xs font-mono font-bold text-[#1A365D] uppercase mb-3">Section Navigator</h3>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all font-mono ${
                    activeSection === section
                      ? "bg-[#1A365D] text-white"
                      : "bg-[#FAF9F6] text-[#1A365D] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#1A365D] uppercase mb-2">Drafting Controls</h3>
            
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Section Outline</label>
              <textarea
                rows={3}
                className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-xs text-[#1A365D] font-mono"
                placeholder="Subsections or focus points..."
                value={sectionOutline}
                onChange={(e) => setSectionOutline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Custom Instruction</label>
              <textarea
                rows={2}
                className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-xs text-[#1A365D] font-mono"
                placeholder="Specific guidance for this section..."
                value={draftInstruction}
                onChange={(e) => setDraftInstruction(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Style Sample (Optional)</label>
              <textarea
                rows={2}
                className="w-full bg-white border border-[#E2E8F0] rounded px-2 py-1.5 text-xs text-[#1A365D] font-mono"
                placeholder="Paste text to match style..."
                value={userStyleSample}
                onChange={(e) => setUserStyleSample(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={includeScriptures}
                onChange={(e) => setIncludeScriptures(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              Include Vedic/Scriptural Support
            </label>

            <button
              onClick={() => draftSection(activeSection)}
              disabled={!activeSection || loading}
              className="w-full py-2 bg-[#1A365D] hover:bg-[#122847] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-mono rounded-lg transition-all cursor-pointer"
            >
              {loading ? "Generating..." : "Generate Section Draft"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeSection ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-[#1A365D] font-serif">{activeSection}</h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  {project.sections[activeSection]?.split(/\s+/).length || 0} words
                </span>
              </div>
              <textarea
                className="flex-1 w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#1A365D] font-mono resize-none"
                placeholder="Section content will appear here..."
                value={project.sections[activeSection] || ""}
                onChange={(e) => updateSectionText(activeSection, e.target.value)}
              />
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center h-full flex items-center justify-center">
              <div>
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-mono">Select a section to begin drafting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FAF9F6] text-[#1A365D] text-xs rounded-lg transition-all duration-150 cursor-pointer font-mono"
        >
          ← Back to Requirements
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] font-bold text-white text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider"
        >
          Run Quality Control →
        </button>
      </div>
    </div>
  );
}