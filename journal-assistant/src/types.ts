export const PROFILE_STATE_PREFIX = "phd_profile_state_";
export const PROFILES_LIST_KEY = "phd_profiles_meta";
export const DEFAULT_STATE = (username: string): PaperProject => ({
  id: `${username}-${Date.now()}`,
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
});

export interface DiscoveredDataSource {
  name: string;
  url: string;
  type: "Quantitative" | "Qualitative" | "Mixed";
  relevance: string;
  reliability: string;
  limitations: string;
  approved: boolean;
}

export interface GroundingMap {
  conceptualFramework: string;
  keyConstructs: string[];
  theoreticalAssumptions: string[];
  reusableArguments: string[];
  relevantCitations: string[];
  consistentTerminology: string[];
  philosophicalAnchors: string;
  academicVoiceAdjustment: string;
}

export interface RecommendJournal {
  name: string;
  publisher: string;
  scopeFit: string;
  ranking: string;
  feeStatus: string;
  submissionOpenness: string;
  reviewContext: string;
  whyFit: string;
}

export interface ComplianceRules {
  wordCountGoal: string;
  citationStyle: string;
  formattingRules: string[];
  sectionStructure: string[];
  abstractRequirements: string;
  referencesRequirement: string;
  ethicalDisclosure: string;
  coverLetterNecessity: string;
}

export interface QCReport {
  complianceScore: number;
  rigorScore: number;
  alignmentWithDissertationScore: number;
  plagiarismOriginalityCheck: string;
  strengths: string[];
  weaknesses: string[];
  actionableEditsPlan: string[];
  citationAudit: string;
  ethicalVerification: string;
}

export interface SubmissionPack {
  coverLetter: string;
  submissionChecklist: string[];
  complianceSummary: string;
  responseToReviewersDraft: string;
}

// --- AI Gateway Types ---

export interface HealthStatus {
  provider: string;
  status: 'online' | 'offline' | 'degraded' | 'unchecked';
  latencyMs?: number;
  lastChecked?: string;
  availableModels?: string[];
  error?: string;
}

export interface AIProviderInfo {
  id: string;
  name: string;
  type: 'cloud' | 'local' | 'proxy';
  icon: string;
  description: string;
  defaultModel: string;
  availableModels: string[];
  requiresApiKey: boolean;
  pricingTier: 'free' | 'freemium' | 'paid';
  color: string;
}

export interface AIRequest {
  systemInstruction: string;
  prompt: string;
  temperature: number;
  responseMimeType?: string;
  taskType: string;
  model?: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  inputWords: number;
  outputWords: number;
  latencyMs: number;
  fromFallback: boolean;
}

export interface AISettings {
  provider: "auto" | "server" | "gemini" | "openai" | "ollama" | "custom" | "claude" | "deepseek" | "cohere" | "qwen";
  ollamaModel?: string;
  ollamaEndpoint?: string;
  customModel?: string;
  customEndpoint?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  claudeApiKey?: string;
  claudeModel?: string;
  deepseekApiKey?: string;
  deepseekModel?: string;
  cohereApiKey?: string;
  cohereModel?: string;
  qwenApiKey?: string;
  qwenModel?: string;
  
  // Gateway extensions
  providerHealth?: Record<string, HealthStatus>;
  fallbackOrder?: string[];
  aiReadiness?: 'validated' | 'simulated' | 'unchecked';
}

export interface ProjectVersion {
  id: string;
  timestamp: string;
  phase: string;
  data: any; // Serialized state of PaperProject
  description: string;
}

export interface ResponseLogItem {
  id: string;
  timestamp: string;
  phase: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
}

export interface WritingStyleProfile {
  id: string;
  name: string;
  description: string;
  terminology: string[];
  sentenceComplexity: string;
  citationStyle: string;
  sampleText: string;
  rawAnalysis?: any;
}

export interface UserProfile {
  username: string;
  passcodeHash?: string;
  projectState: PaperProject; // Primary / active project state for backward compatibility
  fullName?: string;
  email?: string;
  phone?: string;
  affiliation?: string;
  authenticId?: string;
  status?: "pending" | "approved";
  activationKeyHash?: string;
  
  // Multi-workspace & style personalization support
  projects?: PaperProject[];
  activeProjectId?: string;
  writingProfiles?: WritingStyleProfile[];
  activeStyleProfileId?: string;
}

export interface PaperProject {
  id: string;
  title: string;
  objectives: string;
  researchQuestions: string;
  researchGap: string;
  methodology: string;
  field: string;
  keywords: string;
  preferredJournalScope: string;
  articleType: string;
  dissertationMaterials: string;
  styleAspiration: string;
  authorDetails: string;
  currentPhase: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
  aiSettings: AISettings;
  
  // Project metadata
  status?: "Draft" | "Submitted" | "Accepted" | "Rejected";
  lastActivity?: string;
  lockedSections?: string[]; // Array of section names that are locked
  
  // Stored outputs of various phases
  groundingMap?: GroundingMap;
  dataSources?: DiscoveredDataSource[];
  targetJournal?: RecommendJournal;
  complianceRules?: ComplianceRules;
  sections: Record<string, string>; // Maps section keys e.g. "Abstract" to drafted text
  qcReport?: QCReport;
  submissionPack?: SubmissionPack;

  // New Analytics & Tracking fields
  usageLogs?: Array<{
    timestamp: string;
    provider: string;
    model: string;
    inputWords: number;
    outputWords: number;
    estimatedCost: number;
    taskType: string;
  }>;
  costMetrics?: {
    totalCost: number;
    totalCalls: number;
  };
  modelPreferences?: {
    grounding?: string;
    dataDiscovery?: string;
    journalDiscovery?: string;
    requirements?: string;
    drafting?: string;
    qc?: string;
    submissionPack?: string;
  };

  // Revisions & response logs
  versions?: ProjectVersion[];
  responseHistory?: ResponseLogItem[];
  
  // Personalized writing style settings
  styleLearningEnabled?: boolean;
  activeStyleProfileId?: string;
}

export const WORKFLOW_PHASES = [
  { id: "A", name: "Intake", desc: "Define core research inputs" },
  { id: "B", name: "Grounding", desc: "Anchor paper draft in doctoral thesis" },
  { id: "C", name: "Data Discovery", desc: "Qualitative/Quantitative sources" },
  { id: "D", name: "Journal Match", desc: "Discover Scopus/WoS indexed journals" },
  { id: "E", name: "Requirements", desc: "Author guideline checklist parsing" },
  { id: "F", name: "Drafting", desc: "Guided section co-writer" },
  { id: "G", name: "Quality Control", desc: "Peer review compliance audit" },
  { id: "H", name: "Submission Pack", desc: "Compile cover letter & checklists" },
  { id: "I", name: "Submission Support", desc: "Portal trackers & portal letters" }
] as const;
