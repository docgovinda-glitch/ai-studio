import React, { useState, useRef } from "react";
import { PaperProject, ProjectVersion } from "../types";
import {
  FileText,
  Sparkles,
  PenTool,
  RefreshCcw,
  AlertCircle,
  Lock,
  Unlock,
  History,
  GitCompare,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Save,
  Clock
} from "lucide-react";
import { draftSection as aiDraftSection } from "../services/aiService";

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
  const sectionsList = project.complianceRules?.sectionStructure || [
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

  const [activeSec, setActiveSec] = useState(sectionsList[0] || "Introduction");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState("");
  const [styleSample, setStyleSample] = useState(
    "Our current economic paradigms assume wealth is an end unto itself, stripping stewardship of moral consequence. Yet, as Kautilyan statecraft and Vedic trusteeship frameworks demonstrate, enterprise can only be legitimized when framed as 'Lokasangraha'—a sacred trust designated for the collective preservation and holistic nourishment of the social fabric."
  );
  const [includeScriptures, setIncludeScriptures] = useState(true);
  const [customInstruction, setCustomInstruction] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [diffPrev, setDiffPrev] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lockedSections = project.lockedSections || [];
  const isCurrentLocked = lockedSections.includes(activeSec);

  const toggleLock = () => {
    const updated = isCurrentLocked
      ? lockedSections.filter(s => s !== activeSec)
      : [...lockedSections, activeSec];
    updateProject({ lockedSections: updated });
  };

  const saveVersion = (description: string = "Manual save") => {
    const newVersion: ProjectVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "F",
      data: { sections: { ...project.sections } },
      description: `[${activeSec}] ${description}`
    };
    const versions = [...(project.versions || [])];
    if (versions.length >= 20) versions.shift(); // Keep max 20 versions
    versions.push(newVersion);
    updateProject({ versions });
  };

  const loadStandardDraftSegment = () => {
    setError(null);
    const standardDrafts: Record<string, string> = {
      "Title Page": `Title: Ethical Leadership and Dharmic Governance: Re-evaluating Corporate Responsibility through Kautilyan and Vedic Trusteeship Constructs\n\nAuthor: Dr. Govinda Kumar Shah, PhD\nAffiliation: Independent Scholar, PhD in International Relations and Diplomacy, Tribhuvan University, Kathmandu, Nepal\nEmail: doc.govinda@gmail.com\nORCID: 0000-0002-4190-3882\n\nTarget Journal Addendum: Prepared for blind peer submission to 'AI and Ethics' / 'Journal of Business Ethics'.`,
      "Abstract & Keywords": `Abstract:\nThis study re-conceptualizes contemporary Corporate Social Responsibility (CSR) paradigms by integrating classical Indian philosophical constructs—specifically Kautilya's statecraft logic (Arthasastra) and the Vedic trusteeship architecture from the Isavasya Upanishad. We construct a comparative conceptual model, Corporate Dharmic Responsibility (CDR), showing how ancient ethical parameters can be systematically translated into contemporary ESG indicators.\n\nKeywords: Vedic Trusteeship, Arthasastra, Corporate Governance, Dharmic Ethics, CSR, Yogakshema.`,
      "Introduction": `[Dissertation Reference Note: This section maps directly to Chapter 1 of the doctoral thesis.]\n\nModern corporate governance faces a deep crisis of legitimacy. The standard shareholder-supremacy doctrine operates on the assumption that wealth is an end unto itself. While modern ESG metrics and statutory Corporate Social Responsibility (CSR) models attempt to mitigate this, they remain superficial.\n\nThis manuscript proposes a comprehensive re-evaluation of corporate responsibility through two foundational Indian philosophical frameworks: the Vedic theory of Trusteeship (Isavasya Upanishad) and classical Kautilyan Rajadharma. We build on the foundational framework of state accountability pioneered by Shah (PhD Thesis, 2018).`,
      "Literature Review / Related Work": `[Dissertation Reference Note: Extends Chapter 2 of the doctoral dissertation.]\n\nExisting corporate ethics literature is dominated by Western-centric intellectual lineages. From Friedman's shareholder-profit model to Freeman's stakeholder theory, the debate remains trapped within a materialist framework.\n\nRecent inquiries have begun searching for non-Western alternatives. Kautilya's Arthasastra details a comprehensive framework where material acquisition (Artha) is subordinated to righteous order (Dharma). Shah (2018) demonstrates how South Asian statecraft historically integrated moral-ethical accountability as a stabilizing mechanism.`,
      "Conceptual / Ethical Framework": `[Dissertation Reference Note: Formalizes the core theoretical model bridging Vedic trusteeship to corporate governance.]\n\nAt the peak of Vedic ethical theory lies the Isavasya Upanishad (Verse 1):\n\n"ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥"\n\nTranslation: "All this—whatever moves in this moving world—is enveloped by the Supreme. Therefore, enjoy through renunciation; do not covet the wealth of anyone else."\n\nThis verse forms the metaphysical bedrock of Vedic Trusteeship. We integrate this with Kautilya's notion of "Yogakshema"—securing holistic welfare of the populace—establishing a moral obligation for corporations to act as agents of Lokasangraha.`,
      "Methodology / Methods": `[Dissertation Reference Note: Mapped to textual hermeneutics protocols in Chapter 3 of the dissertation.]\n\nThis paper employs an interpretive research design utilizing classical Sanskrit textual hermeneutics paired with comparative concept mapping. We conduct a close reading of Kautilya's Arthasastra and the Isavasya Upanishad.\n\nThese ancient principles are mapped against current ESG criteria using thematic analysis. We employ a hermeneutic retrieval methodology, extracting deep conceptual principles and operationalizing them into modern corporate metrics.`,
      "Results / Analysis": `[Dissertation Reference Note: Builds on empirical indicators from Chapter 4 of the thesis.]\n\nOur analysis reveals crucial structural differences between standard Western CSR and Corporate Dharmic Responsibility (CDR):\n\n1. Metaphysical Foundation:\n- Standard CSR: Social contract theory, utilitarianism\n- CDR: Vedic Trusteeship (cosmic moral obligation, Tyaktena Bhunjitha)\n\n2. Primary Target:\n- Standard CSR: Mitigating reputational damage\n- CDR: Lokasangraha (planetary and community preservation)\n\n3. Governance Objective:\n- Standard CSR: Legality, risk management\n- CDR: Yogakshema (proactive securing of multi-stakeholder wellbeing)`,
      "Discussion (including ethical implications and limitations)": `[Dissertation Reference Note: Maps to critical evaluation in Chapter 5 of Dr. Shah's thesis.]\n\nThe ethical implications of a Dharmic CSR model are far-reaching. By shifting the corporate focus from transaction to relationship, CDR solves the problem of moral disengagement that plagues current corporate efforts.\n\nLimitations include: (1) translating ancient Sanskrit constructs into standardized global business metrics, (2) placing metaphysical duty on corporate directors is fragile without secondary legal reinforcements. Nevertheless, as Shah (2018) argues, governance is strongest when grounded in authentic, centuries-old moral philosophies.`,
      "Conclusion": `[Dissertation Reference Note: Reflects final thematic integrations of the doctoral dissertation.]\n\nThis manuscript has re-conceptualized Corporate Social Responsibility through Kautilya's Arthasastra and Vedic Trusteeship. The Corporate Dharmic Responsibility (CDR) model demonstrates that business can be conducted within a robust spiritual-ethical framework. True governance treats wealth as a sacred trust held on behalf of the planetary ecosystem (Lokasangraha).`,
      "Declarations (Funding, Conflicts of Interest, Ethical Approval, Consent, Data Availability)": `Funding: This research did not receive any specific grant from funding agencies.\n\nConflicts of Interest: The author declares no competing financial or personal conflicts of interest.\n\nEthical Approval: This study is a theoretical-conceptual textual analysis of classical historical materials; formal human subject ethical approval was not required.\n\nData Availability Statement: No primary empirical datasets were analyzed; all referenced texts are publicly available.`,
      "References": `Isavasya Upanishad. Verse 1.\n\nKautilya. (c. 3rd century BCE). Arthasastra. Translated by R.P. Kangle (1972). Delhi: Motilal Banarsidass.\n\nShah, G.K. (2018). International Relations and Diplomatic History of Nepal. Kathmandu: Tribhuvan University Doctoral Dissertation.\n\nFreeman, R.E. (1984). Strategic Management: A Stakeholder Approach. Boston: Pitman.`
    };

    const existing = project.sections[activeSec] || null;
    if (existing) {
      setDiffPrev(existing);
      setShowDiff(true);
    }
    const updatedSections = { ...project.sections };
    updatedSections[activeSec] = standardDrafts[activeSec] || `Standard pre-referenced academic draft for section: ${activeSec}`;
    saveVersion("Pre-compiled standard draft loaded");
    updateProject({ sections: updatedSections });
  };

  const draftSection = async () => {
    if (isCurrentLocked) return;
    setLoading(true);
    setError(null);
    const existing = project.sections[activeSec] || null;
    try {
      const data = await aiDraftSection({
        projectState: project,
        sectionName: activeSec,
        sectionOutline: outline,
        userStyleSample: styleSample,
        includeScriptures: includeScriptures,
        draftInstruction: customInstruction,
      });
      const updatedSections = { ...project.sections };
      if (existing) {
        setDiffPrev(existing);
        setShowDiff(true);
      }
      updatedSections[activeSec] = data.draftText || "";
      saveVersion("AI co-agent draft generated");
      updateProject({ sections: updatedSections });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during section co-drafting. Check your API settings.");
    } finally {
      setLoading(false);
    }
  };

  const currentText = project.sections[activeSec] || "";

  const handleTextChange = (newVal: string) => {
    if (isCurrentLocked) return;
    const updatedSecs = { ...project.sections };
    updatedSecs[activeSec] = newVal;
    updateProject({ sections: updatedSecs });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopiedSection(activeSec);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const restoreVersion = (version: ProjectVersion) => {
    if (window.confirm(`Restore to version: "${version.description}"? Current content will be saved first.`)) {
      saveVersion("Auto-save before version restore");
      const restored = version.data?.sections?.[activeSec];
      if (restored !== undefined) {
        const updatedSections = { ...project.sections };
        updatedSections[activeSec] = restored;
        updateProject({ sections: updatedSections });
      }
      setShowHistory(false);
    }
  };

  const wordCount = currentText.split(/\s+/).filter(Boolean).length;
  const totalWordCount = Object.values(project.sections).join(" ").split(/\s+/).filter(Boolean).length;

  const sectionVersions = (project.versions || [])
    .filter(v => v.description.includes(`[${activeSec}]`))
    .reverse()
    .slice(0, 8);

  // Continuity context from other drafted sections
  const draftedSections = sectionsList.filter(s => !!project.sections[s] && s !== activeSec);

  return (
    <div id="drafting-workspace" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A365D] flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#C08A3E]" />
            Phase F: Manuscript Co-Drafting Laboratory
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
            Section-by-section co-writer · {totalWordCount.toLocaleString()} total words drafted
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-400">{sectionsList.filter(s => !!project.sections[s]).length}/{sectionsList.length} sections</span>
          <div className="w-24 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="bg-[#C08A3E] h-full rounded-full transition-all"
              style={{ width: `${(sectionsList.filter(s => !!project.sections[s]).length / sectionsList.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Panel */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
          <p className="font-semibold flex items-center gap-2 text-xs font-mono uppercase">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            Drafting Issue: {error}
          </p>
          <div className="flex gap-3">
            <button
              onClick={draftSection}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-xs text-red-700 font-mono transition-colors cursor-pointer"
            >
              🔄 Retry Drafting
            </button>
            <button
              onClick={loadStandardDraftSegment}
              className="px-3 py-1.5 bg-[#1A365D]/10 hover:bg-[#1A365D]/20 border border-[#1A365D]/20 rounded text-xs text-[#1A365D] font-mono transition-colors cursor-pointer"
            >
              📄 Auto-Compile High-Rigor Text
            </button>
          </div>
        </div>
      )}

      {/* Diff Comparison Panel */}
      {showDiff && diffPrev !== null && (
        <div className="bg-[#FFFBF5] border border-[#C08A3E]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[#C08A3E] uppercase tracking-wider flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              Revision Comparison — {activeSec}
            </h3>
            <button onClick={() => setShowDiff(false)} className="text-[10px] text-gray-400 hover:text-gray-600 font-mono cursor-pointer">
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-red-500 block mb-1">◀ Previous Version</span>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[11px] text-red-900 leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-wrap font-sans">
                {diffPrev || <em className="text-gray-400">Empty</em>}
              </div>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-emerald-600 block mb-1">▶ New Version (Current)</span>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[11px] text-emerald-900 leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-wrap font-sans">
                {currentText || <em className="text-gray-400">Empty</em>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main work interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left Side: Controls (lg:4) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Section picker */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2">
            <label className="block text-[10px] font-bold font-mono text-[#8C887F] uppercase tracking-wider">
              1. Select Manuscript Section
            </label>
            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {sectionsList.map((sec) => {
                const isDrafted = !!project.sections[sec];
                const isActive = activeSec === sec;
                const isLocked = lockedSections.includes(sec);
                return (
                  <button
                    key={sec}
                    onClick={() => {
                      setActiveSec(sec);
                      setError(null);
                      setShowDiff(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all text-left flex items-center justify-between gap-2 border cursor-pointer ${
                      isActive
                        ? "bg-[#1A365D] text-white border-[#1A365D] shadow-sm"
                        : isDrafted
                        ? "bg-[#F0F9F4] text-[#166534] border-emerald-200"
                        : "bg-[#FAF9F6] text-[#6B665E] border-[#E2E8F0] hover:bg-white hover:border-[#C08A3E]/30"
                    }`}
                  >
                    <span className="truncate flex-1">{sec}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isDrafted && (
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Drafted" />
                      )}
                      {isLocked && (
                        <Lock className="w-3 h-3 text-amber-500" title="Locked" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style & Writing Controls */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-bold font-mono text-[#8C887F] uppercase tracking-wider mb-1">
                2. Writing Style Sample
              </label>
              <textarea
                rows={2}
                className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg px-2.5 py-2 text-xs text-[#1A365D] focus:outline-none focus:border-[#C08A3E] font-sans"
                placeholder="Paste a sample of your academic writing for style mimicry..."
                value={styleSample}
                onChange={(e) => setStyleSample(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <span className="text-xs font-bold font-mono text-amber-800 uppercase block">Scriptural & Ethical Support</span>
                <p className="text-[10px] text-amber-700 leading-normal mt-0.5">
                  Integrate Vedic/classical references when relevant
                </p>
              </div>
              <input
                type="checkbox"
                id="scripture-toggle"
                checked={includeScriptures}
                onChange={(e) => setIncludeScriptures(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold font-mono text-[#8C887F] uppercase tracking-wider mb-1">
                3. Section Outline (Optional)
              </label>
              <textarea
                rows={2}
                className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg px-2.5 py-2 text-xs text-[#1A365D] focus:outline-none focus:border-[#C08A3E] placeholder:text-gray-400 font-sans"
                placeholder="e.g.:&#10;- Definition of trusteeship&#10;- Critique of Milton Friedman..."
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold font-mono text-[#8C887F] uppercase tracking-wider mb-1">
                4. Custom Writing Directives
              </label>
              <input
                type="text"
                className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg px-2.5 py-2 text-xs text-[#1A365D] focus:outline-none focus:border-[#C08A3E] font-sans"
                placeholder="e.g. 'Synthesize with World Bank data findings...'"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
              />
            </div>

            {/* Continuity Context Hint */}
            {draftedSections.length > 0 && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[9px] font-mono font-bold text-blue-700 uppercase block mb-1">
                  ✓ Multi-Section Continuity Active
                </span>
                <p className="text-[10px] text-blue-600 leading-normal">
                  AI will maintain consistency with: {draftedSections.slice(0, 3).join(", ")}{draftedSections.length > 3 ? ` + ${draftedSections.length - 3} more` : ""}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={draftSection}
              disabled={loading || isCurrentLocked}
              title={isCurrentLocked ? "Section is locked. Unlock to draft." : ""}
              className="w-full py-3 bg-[#1A365D] hover:bg-[#122847] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-white text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider shadow-sm"
            >
              {loading ? (
                <><RefreshCcw className="w-4 h-4 animate-spin" />Co-Writing Draft...</>
              ) : isCurrentLocked ? (
                <><Lock className="w-4 h-4 text-gray-400" />Section Locked</>
              ) : (
                <><Sparkles className="w-4 h-4 text-[#C08A3E]" />Trigger Drafting Co-Agent</>
              )}
            </button>
            <button
              onClick={loadStandardDraftSegment}
              disabled={loading || isCurrentLocked}
              className="w-full py-2.5 bg-white hover:bg-[#FAF9F6] border border-[#E2E8F0] disabled:opacity-50 text-[#1A365D] text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
              Skip & Pre-Compile Offline
            </button>
          </div>
        </div>

        {/* Right Side: Active Text Editor (lg:8) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-[#E2E8F0] rounded-xl overflow-hidden min-h-[540px] shadow-sm">
          {/* Editor Toolbar */}
          <div className="border-b border-[#E2E8F0] bg-[#FAF9F6] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C08A3E]" />
              <span className="text-xs font-mono font-bold text-[#1A365D] truncate max-w-[240px]">
                {activeSec}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-mono">{wordCount.toLocaleString()} words</span>

              {/* Version History */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 hover:bg-[#E2E8F0] rounded-lg transition-all cursor-pointer text-gray-500 hover:text-[#1A365D]"
                title="Version History"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              {/* Diff Toggle */}
              {diffPrev !== null && (
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${showDiff ? "bg-[#C08A3E]/10 text-[#C08A3E]" : "hover:bg-[#E2E8F0] text-gray-500"}`}
                  title="Show/hide diff"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-[#E2E8F0] rounded-lg transition-all cursor-pointer text-gray-500 hover:text-[#1A365D]"
                title="Copy text"
              >
                {copiedSection === activeSec ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Manual Save */}
              <button
                onClick={() => saveVersion("Manual save checkpoint")}
                className="p-1.5 hover:bg-[#E2E8F0] rounded-lg transition-all cursor-pointer text-gray-500 hover:text-[#1A365D]"
                title="Save version checkpoint"
              >
                <Save className="w-3.5 h-3.5" />
              </button>

              {/* Lock Toggle */}
              <button
                onClick={toggleLock}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-mono ${
                  isCurrentLocked
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "hover:bg-[#E2E8F0] text-gray-500 hover:text-[#1A365D]"
                }`}
                title={isCurrentLocked ? "Unlock section" : "Lock section to prevent edits"}
              >
                {isCurrentLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Version History Drawer */}
          {showHistory && (
            <div className="border-b border-[#E2E8F0] bg-[#FAFAF9] px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#8C887F] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Revision History — {activeSec}
                </span>
                <button onClick={() => setShowHistory(false)} className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer font-mono">
                  Close
                </button>
              </div>
              {sectionVersions.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">No saved versions for this section yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {sectionVersions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-[11px] bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 gap-4">
                      <div>
                        <span className="text-[#1A365D] font-mono font-semibold">{v.description.replace(`[${activeSec}] `, "")}</span>
                        <span className="text-gray-400 ml-2 font-mono">
                          {new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <button
                        onClick={() => restoreVersion(v)}
                        className="text-[10px] text-[#C08A3E] hover:text-[#1A365D] font-mono cursor-pointer uppercase tracking-wider"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Locked Banner */}
          {isCurrentLocked && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-800 font-sans">
                This section is <strong>locked</strong>. Editing and AI drafting are disabled. Click the lock icon to unlock.
              </p>
            </div>
          )}

          {/* Text Editor */}
          <div className="grow flex flex-col p-4">
            {loading ? (
              <div className="grow flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-8 h-8 border-2 border-[#C08A3E]/20 border-t-[#C08A3E] rounded-full animate-spin" />
                <div className="max-w-xs space-y-1">
                  <p className="text-xs text-[#1A365D] font-mono animate-pulse">Co-writing academic discourse...</p>
                  <p className="text-[10px] text-gray-500">
                    Retrieving dissertation terminology standards and applying cross-section continuity...
                  </p>
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                className={`grow w-full bg-transparent border-0 text-[#1A365D] text-sm leading-relaxed p-0 focus:ring-0 focus:outline-none font-sans whitespace-pre-line resize-none ${
                  isCurrentLocked ? "cursor-not-allowed opacity-60" : ""
                }`}
                placeholder={
                  isCurrentLocked
                    ? "🔒 This section is locked. Unlock to edit or draft."
                    : "Let the co-agent draft this section, or begin typing directly..."
                }
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                readOnly={isCurrentLocked}
              />
            )}
          </div>

          {/* Footer Status */}
          <div className="border-t border-[#E2E8F0] bg-[#FAF9F6] p-2.5 flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>Auto-saved · {wordCount} words</span>
            <div className="flex items-center gap-3">
              {isCurrentLocked && (
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />LOCKED
                </span>
              )}
              <span className="text-[#C08A3E] font-bold">DISSERTATION FIRST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
          Proceed to Quality Control →
        </button>
      </div>
    </div>
  );
}
