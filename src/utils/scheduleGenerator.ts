import { ALL_MODULES } from '../data/cfaData';
import { DaySchedule, ModuleProgress, StudySettings } from '../types';

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // midday to avoid daylight saving issues
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffInDays(startStr: string, endStr: string): number {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Generate the initial module progress state with realistic target finish dates based on phases
export function generateInitialModuleProgress(settings: StudySettings): Record<number, ModuleProgress> {
  const progress: Record<number, ModuleProgress> = {};
  const totalDays = Math.max(10, diffInDays(settings.startDate, settings.examDate));

  // Default module distribution across the phases:
  // Phase 1: 1-11
  // Phase 2: 20-26 (Corp) & 27-38 (FSA)
  // Phase 3: 39-46 (Equity) & 47-65 (Fixed Income)
  // Phase 4: 12-19 (Econ) & 66-75 (Derivatives)
  // Phase 5: 76-82 (Alts) & 83-88 (PM) & 89-93 (Ethics)
  // Target date fractions (percentage of days to exam):
  const phaseTargetFractions: Record<number, number> = {
    1: 0.10, // ~Day 5
    2: 0.25, // ~Day 13
    3: 0.45, // ~Day 23
    4: 0.58, // ~Day 30
    5: 0.70, // ~Day 36
  };

  const getModulePhase = (id: number): number => {
    if (id >= 1 && id <= 11) return 1;
    if ((id >= 20 && id <= 26) || (id >= 27 && id <= 38)) return 2;
    if ((id >= 39 && id <= 46) || (id >= 47 && id <= 65)) return 3;
    if ((id >= 12 && id <= 19) || (id >= 66 && id <= 75)) return 4;
    return 5; // 76-93
  };

  ALL_MODULES.forEach((mod) => {
    const phase = getModulePhase(mod.id);
    const fraction = phaseTargetFractions[phase] || 0.70;
    const targetDayOffset = Math.floor(totalDays * fraction);
    const targetDate = addDays(settings.startDate, targetDayOffset);
    const rev1 = addDays(targetDate, 2);
    const rev2 = addDays(targetDate, 7);

    progress[mod.id] = {
      id: mod.id,
      status: 'Not started',
      learningComplete: false,
      hoursActual: 0,
      practiceScoreFirst: null,
      practiceScoreRepeat: null,
      targetFinishDate: targetDate,
      revisit1Date: rev1,
      revisit2Date: rev2,
      revisit1Done: false,
      revisit2Done: false,
      notes: '',
      lastUpdated: new Date().toISOString(),
    };
  });

  return progress;
}

// Generate day-by-day plan mapping modules, revisits, ethics, and mocks
export function generateDayByDaySchedule(
  settings: StudySettings,
  moduleProgress: Record<number, ModuleProgress>
): DaySchedule[] {
  const days: DaySchedule[] = [];
  const start = parseDate(settings.startDate);
  const end = parseDate(settings.examDate);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) + 1;

  // Define Phase boundaries based on fraction of total days (default 52 days)
  // 1: Quant (0-8%), 2: FSA+Corp (8-22%), 3: FI+Equity (22-40%), 4: Econ+Deriv (40-50%), 5: Alt+PM+Ethics (50-62%)
  // 6: Mocks 1&2 + Rev (62-76%), 7: Mocks 3&4 + Weak areas (76-90%), 8: Light review + Rest (90-100%)
  const phaseBounds = [
    { phaseId: 1, maxPct: 0.08, title: 'Phase 1: Quant & Daily Ethics Kickoff' },
    { phaseId: 2, maxPct: 0.22, title: 'Phase 2: FSA & Corporate Issuers' },
    { phaseId: 3, maxPct: 0.40, title: 'Phase 3: Fixed Income & Equity' },
    { phaseId: 4, maxPct: 0.50, title: 'Phase 4: Economics & Derivatives' },
    { phaseId: 5, maxPct: 0.62, title: 'Phase 5: Alts, PM & Ethics Coverage' },
    { phaseId: 6, maxPct: 0.77, title: 'Phase 6: Mixed Revision & Timed Mocks 1 & 2' },
    { phaseId: 7, maxPct: 0.90, title: 'Phase 7: Timed Mocks 3 & 4 + Weak Repair' },
    { phaseId: 8, maxPct: 1.01, title: 'Phase 8: Formula Drills, Calculator & Exam Rest' },
  ];

  // Specific module lists per phase
  const phaseModules: Record<number, number[]> = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    2: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 20, 21, 22, 23, 24, 25, 26],
    3: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 39, 40, 41, 42, 43, 44, 45, 46],
    4: [12, 13, 14, 15, 16, 17, 18, 19, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
    5: [76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93],
    6: [], // Revision & Mocks
    7: [], // Revision & Mocks
    8: [], // Final review & Exam
  };

  // Group modules assigned to each day
  for (let i = 0; i < totalDays; i++) {
    const curDate = new Date(start);
    curDate.setDate(curDate.getDate() + i);
    const dateStr = formatDate(curDate);
    const dayOfWeek = curDate.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;

    const progressFraction = i / totalDays;
    const currentPhase = phaseBounds.find((p) => progressFraction <= p.maxPct) || phaseBounds[phaseBounds.length - 1];

    // Determine mock day
    let isMockDay = false;
    let mockName: string | undefined;
    if (i === Math.floor(totalDays * 0.65)) {
      isMockDay = true;
      mockName = 'Timed Mock 1 (180 Qs: 2x 135 mins)';
    } else if (i === Math.floor(totalDays * 0.73)) {
      isMockDay = true;
      mockName = 'Timed Mock 2 (180 Qs: 2x 135 mins)';
    } else if (i === Math.floor(totalDays * 0.81)) {
      isMockDay = true;
      mockName = 'Timed Mock 3 (180 Qs: 2x 135 mins)';
    } else if (i === Math.floor(totalDays * 0.88)) {
      isMockDay = true;
      mockName = 'Timed Mock 4 (180 Qs: 2x 135 mins)';
    }

    const isRestDay = i === totalDays - 1 ? false : i === totalDays - 2; // day before exam light rest

    // Distribute modules for Phases 1-5
    const phaseMods = phaseModules[currentPhase.phaseId] || [];
    let assignedModuleIds: number[] = [];

    if (phaseMods.length > 0) {
      // Find days in this phase
      const phaseStartIdx = Math.floor(totalDays * (phaseBounds[currentPhase.phaseId - 2]?.maxPct || 0));
      const phaseEndIdx = Math.floor(totalDays * currentPhase.maxPct);
      const phaseTotalDays = Math.max(1, phaseEndIdx - phaseStartIdx);
      const dayOffsetInPhase = i - phaseStartIdx;

      // Map slice of modules to today
      const modsPerDay = phaseMods.length / phaseTotalDays;
      const startModIdx = Math.floor(dayOffsetInPhase * modsPerDay);
      const endModIdx = Math.min(phaseMods.length, Math.ceil((dayOffsetInPhase + 1) * modsPerDay));

      if (startModIdx < phaseMods.length && startModIdx >= 0) {
        assignedModuleIds = phaseMods.slice(startModIdx, Math.max(startModIdx + 1, endModIdx));
      }
    }

    // Determine spaced revisits scheduled for today
    const scheduledRevisits: { moduleId: number; revisitNumber: 1 | 2 }[] = [];
    Object.values(moduleProgress).forEach((mp) => {
      if (mp.revisit1Date === dateStr) {
        scheduledRevisits.push({ moduleId: mp.id, revisitNumber: 1 });
      }
      if (mp.revisit2Date === dateStr) {
        scheduledRevisits.push({ moduleId: mp.id, revisitNumber: 2 });
      }
    });

    const plannedHours = isRestDay
      ? 1.5
      : isMockDay
      ? 5.5
      : isWeekend
      ? settings.weekendHours
      : settings.weekdayHours;

    days.push({
      date: dateStr,
      dayOfWeek,
      dayIndex: i + 1,
      isWeekend,
      phaseId: currentPhase.phaseId,
      phaseTitle: currentPhase.title,
      assignedModuleIds,
      scheduledRevisits,
      ethicsSession: true, // As recommended: 15-20 min daily Ethics
      ethicsMinutes: settings.dailyEthicsMinutes,
      isMockDay,
      mockName,
      isRestDay,
      plannedHours,
      completed: false,
      actualHoursLogged: 0,
      notes: '',
    });
  }

  return days;
}

// Export checklist to CSV formatted exactly for Excel or Google Sheets
export function exportChecklistToCSV(
  modules: typeof ALL_MODULES,
  progress: Record<number, ModuleProgress>
): string {
  const headers = [
    'Topic',
    'Module Number',
    'Module Name',
    'Target Finish',
    'Hours Planned',
    'Hours Actual',
    'Learning Complete',
    'Practice Score (First %)',
    'Practice Score (Repeat %)',
    'Revisit 1 (+2d)',
    'Revisit 1 Done',
    'Revisit 2 (+7d)',
    'Revisit 2 Done',
    'Status',
    'Notes',
  ];

  const rows = modules.map((m) => {
    const p = progress[m.id] || {
      targetFinishDate: '',
      hoursActual: 0,
      learningComplete: false,
      practiceScoreFirst: null,
      practiceScoreRepeat: null,
      revisit1Date: '',
      revisit1Done: false,
      revisit2Date: '',
      revisit2Done: false,
      status: 'Not started',
      notes: '',
    };

    return [
      `"${m.topicName}"`,
      m.id,
      `"${m.title.replace(/"/g, '""')}"`,
      `"${p.targetFinishDate || ''}"`,
      m.hoursPlanned,
      p.hoursActual || 0,
      p.learningComplete ? 'YES' : 'NO',
      p.practiceScoreFirst != null ? `${p.practiceScoreFirst}%` : '',
      p.practiceScoreRepeat != null ? `${p.practiceScoreRepeat}%` : '',
      `"${p.revisit1Date || ''}"`,
      p.revisit1Done ? 'YES' : 'NO',
      `"${p.revisit2Date || ''}"`,
      p.revisit2Done ? 'YES' : 'NO',
      `"${p.status}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(csvContent: string, fileName = 'CFA_Level_1_Study_Plan_2026.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
