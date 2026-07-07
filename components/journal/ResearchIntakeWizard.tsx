"use client";

import React, { useState } from "react";
import { PaperProject } from "@/lib/journal-types";
import { FileText, Sparkles, ArrowRight } from "lucide-react";

interface ResearchIntakeWizardProps {
  project: PaperProject;
  updateProject: (fields: Partial<PaperProject>) => void;
  onNext: () => void;
}

export default function ResearchIntakeWizard({
  project,
  updateProject,
  onNext,
}: ResearchIntakeWizardProps) {
  const [formData, setFormData] = useState({
    title: project.title || "",
    objectives: project.objectives || "",
    researchQuestions: project.researchQuestions || "",
    researchGap: project.researchGap || "",
    methodology: project.methodology || "",
    field: project.field || "",
    keywords: project.keywords || "",
    preferredJournalScope: project.preferredJournalScope || "",
    articleType: project.articleType || "Academic",
    dissertationMaterials: project.dissertationMaterials || "",
    styleAspiration: project.styleAspiration || "",
    authorDetails: project.authorDetails || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    updateProject(formData);
    onNext();
  };

  return (
    <div id="research-intake" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C08A3E]" />
            Phase A: Research Intake & Project Setup
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Define core research inputs and paper parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Paper Title
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Enter your paper title..."
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Research Field
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="e.g., International Relations, Business Ethics..."
            value={formData.field}
            onChange={(e) => handleChange("field", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Keywords
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Comma-separated keywords..."
            value={formData.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Objectives
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Primary research objectives..."
            value={formData.objectives}
            onChange={(e) => handleChange("objectives", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Research Questions
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Key research questions..."
            value={formData.researchQuestions}
            onChange={(e) => handleChange("researchQuestions", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Research Gap
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Identified research gap..."
            value={formData.researchGap}
            onChange={(e) => handleChange("researchGap", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Methodology
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Research methodology and approach..."
            value={formData.methodology}
            onChange={(e) => handleChange("methodology", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Dissertation Materials (Optional)
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Paste excerpts from your doctoral dissertation to ground this paper..."
            value={formData.dissertationMaterials}
            onChange={(e) => handleChange("dissertationMaterials", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Preferred Journal Scope/Vibe
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="e.g., Ethics-focused, Business & Society, etc."
            value={formData.preferredJournalScope}
            onChange={(e) => handleChange("preferredJournalScope", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-mono font-bold text-[#1A365D] mb-1.5 uppercase">
            Writing Style Aspiration
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#C08A3E]"
            placeholder="Describe your desired writing style or paste a sample..."
            value={formData.styleAspiration}
            onChange={(e) => handleChange("styleAspiration", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
        <button
          onClick={handleNext}
          disabled={!formData.title.trim()}
          className="px-6 py-2.5 bg-[#1A365D] hover:bg-[#122847] disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-white text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer font-mono uppercase tracking-wider inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#C08A3E]" />
          Proceed to Grounding
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}