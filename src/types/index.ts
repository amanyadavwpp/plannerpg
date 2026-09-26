export type TopicId =
  | 'quant'
  | 'econ'
  | 'corp'
  | 'fsa'
  | 'equity'
  | 'fixed_income'
  | 'derivatives'
  | 'alt'
  | 'portfolio'
  | 'ethics';

export interface TopicInfo {
  id: TopicId;
  name: string;
  weight: string;
  minWeight: number;
  maxWeight: number;
  moduleCount: number;
  startModule: number;
  endModule: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  phaseId: number;
  phaseName: string;
}

export type ModuleStatus = 'Not started' | 'Learning' | 'Questions' | 'Reviewed';

export interface ModuleData {
  id: number;
  topicId: TopicId;
  topicName: string;
  title: string;
  hoursPlanned: number;
  weightRange: string;
  keyConcepts: string[];
}

export interface ModuleProgress {
  id: number;
  status: ModuleStatus;
  learningComplete: boolean;
  hoursActual: number;
  practiceScoreFirst?: number | null;
  practiceScoreRepeat?: number | null;
  targetFinishDate: string; // YYYY-MM-DD
  revisit1Date?: string;    // +2 days
  revisit2Date?: string;    // +7 days
  revisit1Done?: boolean;
  revisit2Done?: boolean;
  notes?: string;
  masteredConcepts?: string[];
  lastUpdated?: string;
}

export type ErrorCategory =
  | 'Concept misunderstood'
  | 'Formula forgotten'
  | 'Calculator mistake'
  | 'Question misread';

export interface ErrorLogItem {
  id: string;
  moduleId: number;
  topicId: TopicId;
  questionSource: string; // e.g. "CFAI LES Q#14" or "Mock 1 AM #42"
  category: ErrorCategory;
  description: string;
  correctConcept: string;
  dateLogged: string;
  resolved: boolean;
}

export interface MockExam {
  id: string;
  name: string;
  targetDate: string;
  completedDate?: string;
  session1Score?: number; // out of 90
  session2Score?: number; // out of 90
  totalScorePercent?: number; // 0 - 100
  session1TimeSpentMinutes?: number; // target 135
  session2TimeSpentMinutes?: number; // target 135
  notes?: string;
  topicScores?: Partial<Record<TopicId, { correct: number; total: number }>>;
}

export interface DailyTimeBlock {
  id: string;
  timeRange: string;
  title: string;
  category: 'rest' | 'deep_study' | 'practice_questions' | 'ethics' | 'review' | 'break';
  description: string;
  completed: boolean;
  associatedModuleId?: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  formattedTime: string;
  actionType:
    | 'module_status'
    | 'learning_done'
    | 'score_logged'
    | 'hour_logged'
    | 'block_completed'
    | 'error_logged'
    | 'mock_updated'
    | 'ethics_logged';
  title: string;
  detail: string;
  moduleId?: number;
}

export interface StudySettings {
  startDate: string; // default 2026-09-26
  currentSimulatedDate: string; // "2026-09-27"
  currentSimulatedTime: string; // "01:00"
  examDate: string;  // default 2026-11-16
  weekdayHours: number;
  weekendHours: number;
  dailyEthicsMinutes: number;
  targetStudyHours: number; // default 300
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  dayIndex: number;
  isWeekend: boolean;
  phaseId: number;
  phaseTitle: string;
  assignedModuleIds: number[];
  scheduledRevisits: { moduleId: number; revisitNumber: 1 | 2 }[];
  ethicsSession: boolean;
  ethicsMinutes: number;
  isMockDay: boolean;
  mockName?: string;
  isRestDay: boolean;
  plannedHours: number;
  completed: boolean;
  actualHoursLogged: number;
  notes?: string;
}

export interface SchedulePhase {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  topics: TopicId[];
  description: string;
  recommendation: string;
  color: string;
}
