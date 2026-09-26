import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StudySettings,
  ModuleProgress,
  ErrorLogItem,
  MockExam,
  TopicId,
  DailyTimeBlock,
  ActivityLogEntry,
} from '../types';
import {
  ALL_MODULES,
  INITIAL_MOCKS,
  DEFAULT_HOURLY_SCHEDULE_SEP_27,
} from '../data/cfaData';
import {
  generateInitialModuleProgress,
  generateDayByDaySchedule,
  diffInDays,
  formatDate,
} from '../utils/scheduleGenerator';
import confetti from 'canvas-confetti';

const STORAGE_KEY_PREFIX = 'cfa_2026_planner_';

const DEFAULT_SETTINGS: StudySettings = {
  startDate: '2026-09-26',
  currentSimulatedDate: '2026-09-27',
  currentSimulatedTime: '01:00',
  examDate: '2026-11-16',
  weekdayHours: 5.0,
  weekendHours: 8.5,
  dailyEthicsMinutes: 20,
  targetStudyHours: 300,
};

const INITIAL_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: 'act-init-1',
    timestamp: '2026-09-26T09:00:00.000Z',
    formattedTime: 'Sep 26, 2026, 09:00 AM',
    actionType: 'module_status',
    title: 'Curriculum Kick-Off (Phase 1)',
    detail: 'Started Quantitative Methods module 1: Rates and Returns.',
    moduleId: 1,
  },
  {
    id: 'act-init-2',
    timestamp: '2026-09-26T12:30:00.000Z',
    formattedTime: 'Sep 26, 2026, 12:30 PM',
    actionType: 'score_logged',
    title: 'First Attempt Practice Score',
    detail: 'Scored 82% on 20 practice questions for Module 1 (Rates and Returns).',
    moduleId: 1,
  },
  {
    id: 'act-init-3',
    timestamp: '2026-09-26T21:00:00.000Z',
    formattedTime: 'Sep 26, 2026, 09:00 PM',
    actionType: 'ethics_logged',
    title: 'Daily Ethics Drill Completed',
    detail: 'Completed 20-minute Ethics questions drill (Standard I: Professionalism).',
  },
  {
    id: 'act-init-4',
    timestamp: '2026-09-27T01:00:00.000Z',
    formattedTime: 'Sep 27, 2026, 01:00 AM',
    actionType: 'block_completed',
    title: 'Day 2 Active Reference Initialized',
    detail: 'Sunday study schedule ready: 8.5 hours planned across TVM, Probability & Portfolio Math.',
  },
];

const SAMPLE_ERRORS: ErrorLogItem[] = [
  {
    id: 'err-1',
    moduleId: 32, // Inventories
    topicId: 'fsa',
    questionSource: 'CFAI Practice Q#18 (Inventories)',
    category: 'Concept misunderstood',
    description: 'Confused LIFO reserve effect when prices are declining. Under falling prices, LIFO COGS is lower than FIFO COGS!',
    correctConcept: 'LIFO to FIFO conversion: When inventory prices are falling, LIFO COGS is lower and LIFO ending inventory is higher. Watch out for deflationary environments.',
    dateLogged: '2026-10-02',
    resolved: true,
  },
  {
    id: 'err-2',
    moduleId: 57, // Duration
    topicId: 'fixed_income',
    questionSource: 'Mock 1 AM Q#44',
    category: 'Formula forgotten',
    description: 'Forgot that Modified Duration = Macaulay Duration / (1 + YTM/m). Used annual YTM instead of periodic semi-annual rate in denominator.',
    correctConcept: 'Always divide annual YTM by coupon frequency m in the denominator: ModDur = MacDur / (1 + YTM/m).',
    dateLogged: '2026-10-10',
    resolved: false,
  },
  {
    id: 'err-3',
    moduleId: 2, // TVM
    topicId: 'quant',
    questionSource: 'Topic Quiz TVM Q#9',
    category: 'Calculator mistake',
    description: 'BA II Plus was left in END mode when computing lease advance payment (annuity due). Result was off by (1+r).',
    correctConcept: 'For payments made at the start of period, press [2nd] [BGN] -> [2nd] [SET] to enable BGN mode. Always clear or reset after calculation.',
    dateLogged: '2026-09-28',
    resolved: true,
  },
  {
    id: 'err-4',
    moduleId: 91, // Ethics Standards
    topicId: 'ethics',
    questionSource: 'CFAI Ethics Practice Q#27',
    category: 'Question misread',
    description: 'Missed the word "LEAST likely" in the prompt regarding Standard III(A) Loyalty, Prudence, and Care.',
    correctConcept: 'Always highlight or double-check negative stems: "LEAST likely", "EXCEPT", "MOST accurately".',
    dateLogged: '2026-10-04',
    resolved: false,
  },
];

export function useStudyPlanner() {
  // 1. Settings (Persisted)
  const [settings, setSettings] = useState<StudySettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Module Progress (Persisted)
  const [moduleProgress, setModuleProgress] = useState<Record<number, ModuleProgress>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}moduleProgress`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return generateInitialModuleProgress(DEFAULT_SETTINGS);
  });

  // 3. Error Logs (Persisted)
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}errorLogs`);
      return saved ? JSON.parse(saved) : SAMPLE_ERRORS;
    } catch {
      return SAMPLE_ERRORS;
    }
  });

  // 4. Mock Exams (Persisted)
  const [mockExams, setMockExams] = useState<MockExam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}mockExams`);
      return saved ? JSON.parse(saved) : INITIAL_MOCKS;
    } catch {
      return INITIAL_MOCKS;
    }
  });

  // 5. Day-specific completion & notes overrides (Persisted)
  const [dayOverrides, setDayOverrides] = useState<
    Record<string, { completed: boolean; actualHours: number; notes: string; ethicsDone: boolean }>
  >(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dayOverrides`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 6. Today's Hourly Time Blocks (Persisted)
  const [hourlyBlocks, setHourlyBlocks] = useState<DailyTimeBlock[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}hourlyBlocks_2026-09-27`);
      return saved ? JSON.parse(saved) : DEFAULT_HOURLY_SCHEDULE_SEP_27;
    } catch {
      return DEFAULT_HOURLY_SCHEDULE_SEP_27;
    }
  });

  // 7. Full History of whatever the user marks (Persisted)
  const [activityHistory, setActivityHistory] = useState<ActivityLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activityHistory`);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}moduleProgress`, JSON.stringify(moduleProgress));
  }, [moduleProgress]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}errorLogs`, JSON.stringify(errorLogs));
  }, [errorLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}mockExams`, JSON.stringify(mockExams));
  }, [mockExams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}dayOverrides`, JSON.stringify(dayOverrides));
  }, [dayOverrides]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}hourlyBlocks_2026-09-27`,
      JSON.stringify(hourlyBlocks)
    );
  }, [hourlyBlocks]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}activityHistory`,
      JSON.stringify(activityHistory)
    );
  }, [activityHistory]);

  // Log activity helper
  const logActivity = useCallback(
    (
      actionType: ActivityLogEntry['actionType'],
      title: string,
      detail: string,
      moduleId?: number
    ) => {
      const now = new Date();
      const newEntry: ActivityLogEntry = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now.toISOString(),
        formattedTime: now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        actionType,
        title,
        detail,
        moduleId,
      };
      setActivityHistory((prev) => [newEntry, ...prev.slice(0, 199)]); // Keep last 200 history logs
    },
    []
  );

  const clearActivityHistory = useCallback(() => {
    if (window.confirm('Clear all logged activity history?')) {
      setActivityHistory([]);
    }
  }, []);

  // Derived full day-by-day plan
  const daySchedule = useMemo(() => {
    const rawDays = generateDayByDaySchedule(settings, moduleProgress);
    return rawDays.map((d) => {
      const override = dayOverrides[d.date];
      if (override) {
        return {
          ...d,
          completed: override.completed,
          actualHoursLogged: override.actualHours,
          notes: override.notes || d.notes,
          ethicsCompleted: override.ethicsDone ?? false,
        };
      }
      return {
        ...d,
        ethicsCompleted: false,
      };
    });
  }, [settings, moduleProgress, dayOverrides]);

  // Trigger celebration effects
  const fireConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ffffff', '#a1a1aa', '#71717a', '#d4d4d8'],
      });
    } catch {
      // silent
    }
  }, []);

  // Update a single module's progress & log history
  const updateModuleProgress = useCallback(
    (id: number, updates: Partial<ModuleProgress>) => {
      setModuleProgress((prev) => {
        const current = prev[id] || {
          id,
          status: 'Not started',
          learningComplete: false,
          hoursActual: 0,
          targetFinishDate: '',
        };
        const updated = { ...current, ...updates, lastUpdated: new Date().toISOString() };
        if (updates.status === 'Reviewed' && current.status !== 'Reviewed') {
          fireConfetti();
        }
        return { ...prev, [id]: updated };
      });

      const mod = ALL_MODULES.find((m) => m.id === id);
      const modName = mod ? mod.title : `Module #${id}`;

      if (updates.status) {
        logActivity(
          'module_status',
          `Status: ${updates.status}`,
          `Module #${id} (${modName}) marked as "${updates.status}".`,
          id
        );
      } else if (updates.learningComplete !== undefined) {
        logActivity(
          'learning_done',
          updates.learningComplete ? 'Learning Complete' : 'Learning Reopened',
          `Module #${id} (${modName}) reading & lecture marked ${
            updates.learningComplete ? 'complete' : 'in progress'
          }.`,
          id
        );
      } else if (updates.practiceScoreFirst !== undefined) {
        logActivity(
          'score_logged',
          'Practice Score Recorded',
          `Module #${id} (${modName}) 1st attempt score: ${updates.practiceScoreFirst}%.`,
          id
        );
      } else if (updates.practiceScoreRepeat !== undefined) {
        logActivity(
          'score_logged',
          'Repeat Practice Score',
          `Module #${id} (${modName}) repeat score: ${updates.practiceScoreRepeat}%.`,
          id
        );
      } else if (updates.hoursActual !== undefined) {
        logActivity(
          'hour_logged',
          'Hours Logged',
          `Module #${id} (${modName}) logged ${updates.hoursActual} study hours.`,
          id
        );
      }
    },
    [fireConfetti, logActivity]
  );

  // Bulk update modules
  const bulkUpdateModules = useCallback(
    (ids: number[], updates: Partial<ModuleProgress>) => {
      setModuleProgress((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          if (next[id]) {
            next[id] = { ...next[id], ...updates, lastUpdated: new Date().toISOString() };
          }
        });
        return next;
      });
      logActivity(
        'module_status',
        'Batch Update Applied',
        `Updated ${ids.length} modules: ${JSON.stringify(updates)}`
      );
    },
    [logActivity]
  );

  // Day toggle completion and hours
  const updateDaySchedule = useCallback(
    (
      date: string,
      updates: { completed?: boolean; actualHours?: number; notes?: string; ethicsDone?: boolean }
    ) => {
      setDayOverrides((prev) => {
        const current = prev[date] || {
          completed: false,
          actualHours: 0,
          notes: '',
          ethicsDone: false,
        };
        return {
          ...prev,
          [date]: { ...current, ...updates },
        };
      });

      if (updates.completed !== undefined) {
        logActivity(
          'block_completed',
          updates.completed ? 'Study Day Completed' : 'Study Day Reopened',
          `Day ${date} marked ${updates.completed ? 'completed' : 'incomplete'}.`
        );
      }
      if (updates.actualHours !== undefined) {
        logActivity(
          'hour_logged',
          'Daily Hours Recorded',
          `Logged ${updates.actualHours} hours for ${date}.`
        );
      }
      if (updates.ethicsDone !== undefined) {
        logActivity(
          'ethics_logged',
          updates.ethicsDone ? 'Ethics Drill Done' : 'Ethics Drill Reset',
          `Daily 20m ethics session for ${date} marked ${updates.ethicsDone ? 'done' : 'pending'}.`
        );
      }
    },
    [logActivity]
  );

  // Toggle hourly block & log history
  const toggleHourlyBlock = useCallback(
    (id: string) => {
      let toggledTitle = '';
      let isNowComplete = false;
      setHourlyBlocks((prev) =>
        prev.map((b) => {
          if (b.id === id) {
            toggledTitle = b.title;
            isNowComplete = !b.completed;
            return { ...b, completed: isNowComplete };
          }
          return b;
        })
      );
      if (toggledTitle) {
        logActivity(
          'block_completed',
          isNowComplete ? 'Time Block Completed' : 'Time Block Reopened',
          `Sunday time block "${toggledTitle}" marked ${isNowComplete ? 'done' : 'pending'}.`
        );
      }
    },
    [logActivity]
  );

  // Error log operations
  const addErrorLog = useCallback(
    (item: Omit<ErrorLogItem, 'id' | 'dateLogged'>) => {
      const newItem: ErrorLogItem = {
        ...item,
        id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        dateLogged: formatDate(new Date()),
      };
      setErrorLogs((prev) => [newItem, ...prev]);
      logActivity(
        'error_logged',
        'New Error Logged',
        `Logged [${item.category}] for Module #${item.moduleId}: ${item.description.slice(0, 60)}...`,
        item.moduleId
      );
    },
    [logActivity]
  );

  const updateErrorLog = useCallback(
    (id: string, updates: Partial<ErrorLogItem>) => {
      setErrorLogs((prev) =>
        prev.map((err) => (err.id === id ? { ...err, ...updates } : err))
      );
      if (updates.resolved !== undefined) {
        logActivity(
          'error_logged',
          updates.resolved ? 'Error Item Resolved' : 'Error Reopened',
          `Error #${id} marked ${updates.resolved ? 'resolved' : 'pending'}.`
        );
      }
    },
    [logActivity]
  );

  const deleteErrorLog = useCallback(
    (id: string) => {
      setErrorLogs((prev) => prev.filter((err) => err.id !== id));
      logActivity('error_logged', 'Error Item Removed', `Deleted error log entry.`);
    },
    [logActivity]
  );

  // Mock exam operations
  const updateMockExam = useCallback(
    (id: string, updates: Partial<MockExam>) => {
      setMockExams((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const merged = { ...m, ...updates };
          if (merged.session1Score != null && merged.session2Score != null) {
            merged.totalScorePercent = Math.round(
              ((merged.session1Score + merged.session2Score) / 180) * 100
            );
          }
          return merged;
        })
      );
      logActivity(
        'mock_updated',
        'Mock Exam Recorded',
        `Updated scores for mock "${id}".`
      );
    },
    [logActivity]
  );

  // Settings update & re-alignment
  const updateSettings = useCallback((newSettings: Partial<StudySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Reset all to defaults
  const resetAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all study progress and settings?')) {
      localStorage.clear();
      setSettings(DEFAULT_SETTINGS);
      setModuleProgress(generateInitialModuleProgress(DEFAULT_SETTINGS));
      setErrorLogs(SAMPLE_ERRORS);
      setMockExams(INITIAL_MOCKS);
      setHourlyBlocks(DEFAULT_HOURLY_SCHEDULE_SEP_27);
      setActivityHistory(INITIAL_ACTIVITY_LOGS);
      setDayOverrides({});
    }
  }, []);

  // Export full backup JSON (all progress, error logs, and activity history)
  const exportBackupJSON = useCallback(() => {
    const backup = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      settings,
      moduleProgress,
      hourlyBlocks,
      activityHistory,
      errorLogs,
      mockExams,
      dayOverrides,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfa_level_1_study_backup_${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, moduleProgress, hourlyBlocks, activityHistory, errorLogs, mockExams, dayOverrides]);

  // Import full backup JSON
  const importBackupJSON = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.moduleProgress) setModuleProgress(parsed.moduleProgress);
      if (parsed.hourlyBlocks) setHourlyBlocks(parsed.hourlyBlocks);
      if (parsed.activityHistory) setActivityHistory(parsed.activityHistory);
      if (parsed.errorLogs) setErrorLogs(parsed.errorLogs);
      if (parsed.mockExams) setMockExams(parsed.mockExams);
      if (parsed.dayOverrides) setDayOverrides(parsed.dayOverrides);
      alert('Data and history successfully restored!');
    } catch {
      alert('Failed to parse backup JSON. Please check file format.');
    }
  }, []);

  // Aggregate statistics
  const stats = useMemo(() => {
    const totalModules = ALL_MODULES.length; // 93
    let completedModules = 0;
    let learningDoneModules = 0;
    let questionsDoneModules = 0;
    let totalHoursLogged = 0;
    let totalScoreSum = 0;
    let totalScoreCount = 0;

    Object.values(moduleProgress).forEach((mp) => {
      if (mp.status === 'Reviewed') completedModules++;
      if (mp.learningComplete) learningDoneModules++;
      if (mp.status === 'Questions' || mp.status === 'Reviewed') questionsDoneModules++;
      totalHoursLogged += mp.hoursActual || 0;
      if (mp.practiceScoreFirst != null) {
        totalScoreSum += mp.practiceScoreFirst;
        totalScoreCount++;
      }
      if (mp.practiceScoreRepeat != null) {
        totalScoreSum += mp.practiceScoreRepeat;
        totalScoreCount++;
      }
    });

    // Also add hours logged in day logs if greater
    const dayLoggedSum = Object.values(dayOverrides).reduce((acc, curr) => acc + (curr.actualHours || 0), 0);
    const finalHoursLogged = Math.max(totalHoursLogged, dayLoggedSum);

    const averageScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : null;

    // Reference today date based on simulated date (defaults to 2026-09-27)
    const todayStr = settings.currentSimulatedDate || '2026-09-27';
    const daysRemaining = Math.max(0, diffInDays(todayStr, settings.examDate));
    const totalPlanDays = Math.max(1, diffInDays(settings.startDate, settings.examDate));

    // Hours remaining to exam morning (2026-11-16 08:00:00)
    const currentSimulatedDateTime = new Date(`${todayStr}T${settings.currentSimulatedTime || '01:00'}:00`);
    const examDateTime = new Date(`${settings.examDate}T08:00:00`);
    const exactDiffMs = Math.max(0, examDateTime.getTime() - currentSimulatedDateTime.getTime());
    const exactHoursRemaining = Math.floor(exactDiffMs / (1000 * 60 * 60));

    // Required weekly hours to hit 300h target
    const remainingHours = Math.max(0, settings.targetStudyHours - finalHoursLogged);
    const remainingWeeks = Math.max(0.5, daysRemaining / 7);
    const requiredHoursPerWeek = Math.round((remainingHours / remainingWeeks) * 10) / 10;

    // By Topic stats
    const topicStats: Record<
      TopicId,
      { total: number; reviewed: number; learningDone: number; avgScore: number | null }
    > = {
      quant: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      econ: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      corp: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      fsa: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      equity: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      fixed_income: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      derivatives: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      alt: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      portfolio: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
      ethics: { total: 0, reviewed: 0, learningDone: 0, avgScore: null },
    };

    ALL_MODULES.forEach((mod) => {
      const t = mod.topicId;
      const prog = moduleProgress[mod.id];
      if (topicStats[t]) {
        topicStats[t].total++;
        if (prog?.status === 'Reviewed') topicStats[t].reviewed++;
        if (prog?.learningComplete) topicStats[t].learningDone++;
      }
    });

    const pendingErrorsCount = errorLogs.filter((e) => !e.resolved).length;

    return {
      totalModules,
      completedModules,
      learningDoneModules,
      questionsDoneModules,
      percentComplete: Math.round((completedModules / totalModules) * 100),
      totalHoursLogged: Math.round(finalHoursLogged * 10) / 10,
      targetStudyHours: settings.targetStudyHours,
      daysRemaining,
      exactHoursRemaining,
      totalPlanDays,
      requiredHoursPerWeek,
      averageScore,
      pendingErrorsCount,
      topicStats,
    };
  }, [moduleProgress, dayOverrides, settings, errorLogs]);

  return {
    settings,
    updateSettings,
    moduleProgress,
    updateModuleProgress,
    bulkUpdateModules,
    daySchedule,
    updateDaySchedule,
    hourlyBlocks,
    toggleHourlyBlock,
    activityHistory,
    logActivity,
    clearActivityHistory,
    errorLogs,
    addErrorLog,
    updateErrorLog,
    deleteErrorLog,
    mockExams,
    updateMockExam,
    stats,
    resetAllData,
    exportBackupJSON,
    importBackupJSON,
    fireConfetti,
  };
}
