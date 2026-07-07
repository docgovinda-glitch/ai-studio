"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { 
  PaperProject, 
  GroundingMap, 
  DiscoveredDataSource, 
  RecommendJournal, 
  ComplianceRules, 
  QCReport,
  SubmissionPack,
  AISettings,
  WORKFLOW_PHASES
} from "@/lib/journal-types";
import ResearchIntakeWizard from "@/components/journal/ResearchIntakeWizard";
import GroundingMapDisplay from "@/components/journal/GroundingMapDisplay";
import DataDiscoveryPanel from "@/components/journal/DataDiscoveryPanel";
import JournalDiscoveryPanel from "@/components/journal/JournalDiscoveryPanel";
import ComplianceChecklistPanel from "@/components/journal/ComplianceChecklistPanel";
import ManuscriptDraftingWorkspace from "@/components/journal/ManuscriptDraftingWorkspace";
import QualityControlSuite from "@/components/journal/QualityControlSuite";
import SubmissionPackagingSuite from "@/components/journal/SubmissionPackagingSuite";

// Default state
const DEFAULT_STATE: PaperProject = {
  id: `project-${Date.now()}`,
  title: "",
  objectives: "",
  researchQuestions: "",
  researchGap: "",
  methodology: "",
  field: "",
  keywords: "",
  preferredJournalScope: "",
  articleType: "",
  dissertationMaterials: "",
  styleAspiration: "",
  authorDetails: "",
  currentPhase: "A",
  aiSettings: { provider: "gemini" },
  sections: {},
};

export default function JournalAssistantPage() {
  const [project, setProject] = useState<PaperProject>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journal-assistant-state");
    if (saved) {
      try {
        setProject(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved state:", e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("journal-assistant-state", JSON.stringify(project));
  }, [project]);

  const updateProject = (fields: Partial<PaperProject>) => {
    setProject(prev => ({ ...prev, ...fields }));
  };

  const goToPhase = (phase: string) => {
    updateProject({ currentPhase: phase as PaperProject["currentPhase"] });
  };

  const renderPhase = () => {
    switch (project.currentPhase) {
      case "A":
        return <ResearchIntakeWizard project={project} updateProject={updateProject} onNext={() => goToPhase("B")} />;
      case "B":
        return <GroundingMapDisplay project={project} updateProject={updateProject} onNext={() => goToPhase("C")} onBack={() => goToPhase("A")} />;
      case "C":
        return <DataDiscoveryPanel project={project} updateProject={updateProject} onNext={() => goToPhase("D")} onBack={() => goToPhase("B")} />;
      case "D":
        return <JournalDiscoveryPanel project={project} updateProject={updateProject} onNext={() => goToPhase("E")} onBack={() => goToPhase("C")} />;
      case "E":
        return <ComplianceChecklistPanel project={project} updateProject={updateProject} onNext={() => goToPhase("F")} onBack={() => goToPhase("D")} />;
      case "F":
        return <ManuscriptDraftingWorkspace project={project} updateProject={updateProject} onNext={() => goToPhase("G")} onBack={() => goToPhase("E")} />;
      case "G":
        return <QualityControlSuite project={project} updateProject={updateProject} onNext={() => goToPhase("H")} onBack={() => goToPhase("F")} />;
      case "H":
        return <SubmissionPackagingSuite project={project} updateProject={updateProject} onNext={() => goToPhase("I")} onBack={() => goToPhase("G")} />;
      case "I":
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Submission Support</h2>
            <p className="text-gray-600">Track your submission status and receive support for portal interactions.</p>
          </div>
        );
      default:
        return <ResearchIntakeWizard project={project} updateProject={updateProject} onNext={() => goToPhase("B")} />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4">
        {/* Phase Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {WORKFLOW_PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => goToPhase(phase.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                project.currentPhase === phase.id
                  ? "bg-[#1A365D] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#1A365D] hover:bg-[#FAF9F6]"
              }`}
            >
              {phase.id}. {phase.name}
            </button>
          ))}
        </div>

        {/* Phase Content */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
          {renderPhase()}
        </div>
      </div>
    </AppShell>
  );
}