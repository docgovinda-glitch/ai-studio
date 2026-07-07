// Re-export types from journal-assistant for use in Next.js app
import type {
  PaperProject,
  GroundingMap,
  DiscoveredDataSource,
  RecommendJournal,
  ComplianceRules,
  QCReport,
  SubmissionPack,
  AISettings,
} from "../journal-assistant/src/types";

export type {
  PaperProject,
  GroundingMap,
  DiscoveredDataSource,
  RecommendJournal,
  ComplianceRules,
  QCReport,
  SubmissionPack,
  AISettings,
};

// Re-export the WORKFLOW_PHASES constant
export { WORKFLOW_PHASES } from "../journal-assistant/src/types";