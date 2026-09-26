import React from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Award,
  ArrowRight,
  Zap,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { SCHEDULE_PHASES, TOPICS, ALL_MODULES } from '../data/cfaData';
import { DaySchedule, ModuleProgress, TopicId, DailyTimeBlock } from '../types';
import { TopCountdownAndCalendar } from './TopCountdownAndCalendar';

interface DashboardOverviewProps {
  stats: {
    totalModules: number;
    completedModules: number;
    learningDoneModules: number;
    questionsDoneModules: number;
    percentComplete: number;
    totalHoursLogged: number;
    targetStudyHours: number;
    daysRemaining: number;
    exactHoursRemaining?: number;
    totalPlanDays: number;
    requiredHoursPerWeek: number;
    averageScore: number | null;
    pendingErrorsCount: number;
    topicStats: Record<
      TopicId,
      { total: number; reviewed: number; learningDone: number; avgScore: number | null }
    >;
  };
  todaySchedule?: DaySchedule;
  daySchedule: DaySchedule[];
  hourlyBlocks: DailyTimeBlock[];
  onToggleHourlyBlock: (id: string) => void;
  currentSimulatedDate?: string;
  currentSimulatedTime?: string;
  examDate: string;
  moduleProgress: Record<number, ModuleProgress>;
  onNavigateTab: (tab: string, filterTopic?: TopicId) => void;
  onOpenSettings: () => void;
  onSelectDay: (dateStr: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  todaySchedule,
  daySchedule,
  hourlyBlocks,
  onToggleHourlyBlock,
  currentSimulatedDate = '2026-09-27',
  currentSimulatedTime = '01:00',
  examDate,
  moduleProgress,
  onNavigateTab,
  onOpenSettings,
  onSelectDay,
}) => {
  const todayStr = currentSimulatedDate;
  const activePhase =
    SCHEDULE_PHASES.find(
      (p) => todayStr >= p.startDate && todayStr <= p.endDate
    ) || SCHEDULE_PHASES[0];

  const hoursRemaining = Math.max(0, stats.targetStudyHours - stats.totalHoursLogged);
  const hoursProgressPercent = Math.min(
    100,
    Math.round((stats.totalHoursLogged / stats.targetStudyHours) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Live Master Countdown & Interactive Remaining Days Calendar */}
      <TopCountdownAndCalendar
        currentSimulatedDate={currentSimulatedDate}
        currentSimulatedTime={currentSimulatedTime}
        examDate={examDate}
        daySchedule={daySchedule}
        hourlyBlocks={hourlyBlocks}
        onToggleHourlyBlock={onToggleHourlyBlock}
        moduleProgress={moduleProgress}
        onSelectDay={onSelectDay}
        onNavigateTab={onNavigateTab}
      />

      {/* 2. 300+ Hour Readiness Progress Bar & Strategy Banner */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 text-zinc-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                7-Week Intensive Catch-Up Plan
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Window: Nov 11–17 • Target: Nov 16, 2026
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              CFA Institute 300+ Study Hours Target
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Targeting 300 hours across <strong className="text-white">{stats.daysRemaining} days remaining</strong> requires approximately{' '}
              <span className="text-white font-mono font-semibold underline decoration-zinc-600 underline-offset-4">
                {stats.requiredHoursPerWeek} hrs / week
              </span>
              . Protecting the final 2 weeks (Oct 27 – Nov 16) for mocks and formula repair is essential.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('calendar')}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors border border-zinc-800"
            >
              Adjust Parameters
            </button>
          </div>
        </div>

        {/* Minimalist Monochrome Progress Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-900">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{stats.totalHoursLogged} hrs logged</span>
            </span>
            <span>
              {hoursRemaining} hrs to goal ({hoursProgressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-white transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(2, hoursProgressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Modules Completion */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Curriculum Modules
            </span>
            <Zap className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {stats.completedModules}{' '}
              <span className="text-sm font-normal text-zinc-500">/ {stats.totalModules}</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {stats.learningDoneModules} learning done • {stats.questionsDoneModules} practice attempted
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-xs">
            <span className="text-zinc-300 font-mono text-[11px]">
              {stats.percentComplete}% Reviewed
            </span>
            <button
              onClick={() => onNavigateTab('checklist')}
              className="text-zinc-400 hover:text-white font-medium flex items-center gap-1"
            >
              <span>Matrix</span> <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Average Practice Score */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Practice Accuracy
            </span>
            <Award className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {stats.averageScore != null ? `${stats.averageScore}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Passing benchmark: <strong className="text-zinc-300">≥ 70%</strong>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">
              {stats.averageScore && stats.averageScore >= 70 ? 'On Target' : 'Log missed items'}
            </span>
            <button
              onClick={() => onNavigateTab('errors')}
              className="text-zinc-400 hover:text-white font-medium"
            >
              Errors
            </button>
          </div>
        </div>

        {/* Card 3: Error Log Tracker */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Open Errors
            </span>
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {stats.pendingErrorsCount}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Unresolved errors needing review
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-xs">
            <span className="text-zinc-500 text-[11px]">4 Categories</span>
            <button
              onClick={() => onNavigateTab('errors')}
              className="text-zinc-400 hover:text-white font-medium flex items-center gap-1"
            >
              <span>Resolve</span> <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Timed Mock Milestone */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Mock Exam 1
            </span>
            <Target className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              In 31 Days
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Scheduled for Oct 28 (Phase 6)
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">4 Mocks Planned</span>
            <button
              onClick={() => onNavigateTab('mocks')}
              className="text-zinc-400 hover:text-white font-medium flex items-center gap-1"
            >
              <span>Simulator</span> <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Focus Modules Today & Active Phase Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Mission */}
        <div className="lg:col-span-2 rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px] uppercase border border-zinc-800">
                  Directive
                </span>
                <h3 className="text-sm font-bold text-white">
                  Sunday, Sep 27 Study Targets
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Target: {todaySchedule?.plannedHours || 8.5} hours • TVM, Probability & Portfolio Math
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1"
            >
              <span>Schedule Table</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Assigned Modules Today */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Focus Modules for Today:
            </h4>
            {todaySchedule && todaySchedule.assignedModuleIds.length > 0 ? (
              <div className="space-y-2">
                {todaySchedule.assignedModuleIds.map((mId) => {
                  const mod = ALL_MODULES.find((m) => m.id === mId);
                  const prog = moduleProgress[mId];
                  if (!mod) return null;
                  return (
                    <div
                      key={mId}
                      className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {mod.id}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">
                            {mod.title}
                          </p>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {mod.topicName} • ~{mod.hoursPlanned}h
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            prog?.status === 'Reviewed'
                              ? 'bg-white text-black font-semibold'
                              : prog?.status === 'Questions'
                              ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          {prog?.status || 'Not started'}
                        </span>
                        <button
                          onClick={() => onNavigateTab('checklist', mod.topicId)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-white hover:text-black text-zinc-200 text-xs font-semibold transition-colors"
                        >
                          Study
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500">
                Mixed revision or timed mock exam scheduled for today. Check timetable below!
              </div>
            )}
          </div>

          {/* Ethics Daily Slot */}
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-800 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                20m
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  Daily Ethics Habit (15–20 minutes)
                </h5>
                <p className="text-[11px] text-zinc-400">
                  15–20% exam weight • Pass tie-breaker. Practice vignettes daily.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('ethics')}
              className="px-3 py-1 rounded-md bg-white hover:bg-zinc-200 text-black font-semibold text-xs shrink-0 transition-colors"
            >
              Ethics Hub
            </button>
          </div>
        </div>

        {/* Current Intensive Phase Card */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Active Phase
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                Phase {activePhase.id} of 8
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {activePhase.title}
            </h3>

            <div className="text-xs text-zinc-400 font-mono">
              {activePhase.startDate} to {activePhase.endDate}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
              {activePhase.description}
            </p>

            <div className="text-xs text-zinc-400 pt-1">
              <strong className="text-zinc-200">Recommendation:</strong> {activePhase.recommendation}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900">
            <button
              onClick={() => onNavigateTab('calendar')}
              className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-zinc-800"
            >
              <span>Explore All 8 Phases</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. 10 Curriculum Topics Breakdown with Exam Weights */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>All 10 Exam Topics Breakdown</span>
              <span className="text-xs font-normal text-zinc-500 font-mono">(2026 Curriculum Weights)</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Prioritize the 4 big pillars (FSA, Fixed Income, Equity, Ethics) = 52–66% of the exam.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('checklist')}
            className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Open 93-Module Matrix</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.values(TOPICS).map((topic) => {
            const tStat = stats.topicStats[topic.id];
            const reviewed = tStat?.reviewed || 0;
            const total = topic.moduleCount;
            const pct = Math.round((reviewed / total) * 100);

            return (
              <div
                key={topic.id}
                onClick={() => onNavigateTab('checklist', topic.id)}
                className="group cursor-pointer p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {topic.weight}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {topic.moduleCount} mods
                  </span>
                </div>

                <h4 className="font-semibold text-xs sm:text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                  {topic.name}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 mb-1 font-mono">
                  <span>M{topic.startModule}–{topic.endModule}</span>
                  <span>{pct}%</span>
                </div>

                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
