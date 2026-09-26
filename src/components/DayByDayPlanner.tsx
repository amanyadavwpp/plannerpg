import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { DaySchedule, ModuleProgress } from '../types';
import { ALL_MODULES, SCHEDULE_PHASES } from '../data/cfaData';

interface DayByDayPlannerProps {
  daySchedule: (DaySchedule & { ethicsCompleted?: boolean })[];
  moduleProgress: Record<number, ModuleProgress>;
  currentSimulatedDate?: string;
  onUpdateDay: (
    date: string,
    updates: { completed?: boolean; actualHours?: number; notes?: string; ethicsDone?: boolean }
  ) => void;
  onUpdateModule: (id: number, updates: Partial<ModuleProgress>) => void;
  onNavigateToChecklist: (moduleId: number) => void;
}

export const DayByDayPlanner: React.FC<DayByDayPlannerProps> = ({
  daySchedule,
  moduleProgress,
  currentSimulatedDate = '2026-09-27',
  onUpdateDay,
  onUpdateModule,
  onNavigateToChecklist,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [filterIncompleteOnly, setFilterIncompleteOnly] = useState<boolean>(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const todayStr = currentSimulatedDate;

  // Filter days
  const filteredDays = useMemo(() => {
    return daySchedule.filter((d) => {
      if (selectedPhase !== 'all' && d.phaseId !== selectedPhase) return false;
      if (filterIncompleteOnly && d.completed) return false;
      return true;
    });
  }, [daySchedule, selectedPhase, filterIncompleteOnly]);

  const scrollToDate = (dateStr: string) => {
    const el = document.getElementById(`day-${dateStr}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-zinc-400" />
              <span>Day-by-Day Study Schedule</span>
              <span className="text-xs font-mono font-normal text-zinc-500">
                ({daySchedule.length} days • Exam: Nov 16, 2026)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Each study day includes targeted modules, spaced repetition revisits (+2d and +7d), and 15–20m daily Ethics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => scrollToDate(todayStr)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors"
            >
              Jump to Today (Sep 27)
            </button>
            <label className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium cursor-pointer bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <input
                type="checkbox"
                checked={filterIncompleteOnly}
                onChange={(e) => setFilterIncompleteOnly(e.target.checked)}
                className="rounded accent-white"
              />
              <span>Incomplete Only</span>
            </label>
          </div>
        </div>

        {/* Phase selector buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-zinc-900 pt-3">
          <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Phase:
          </span>
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 ${
              selectedPhase === 'all'
                ? 'bg-white text-black font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Phases ({daySchedule.length}d)
          </button>
          {SCHEDULE_PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 ${
                selectedPhase === phase.id
                  ? 'bg-white text-black font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Phase {phase.id}
            </button>
          ))}
        </div>
      </div>

      {/* Days Timeline List */}
      <div className="space-y-2.5">
        {filteredDays.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
            No days match the current filters.
          </div>
        ) : (
          filteredDays.map((day) => {
            const isToday = day.date === todayStr;
            const isExpanded = expandedDate === day.date;
            const isExamDay = day.dayIndex === daySchedule.length;

            return (
              <div
                key={day.date}
                id={`day-${day.date}`}
                className={`rounded-xl border transition-colors ${
                  isToday
                    ? 'bg-zinc-950 border-white ring-1 ring-white/20'
                    : day.completed
                    ? 'bg-zinc-950/70 border-zinc-800/80 opacity-75'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Day Header Row */}
                <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Day info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => onUpdateDay(day.date, { completed: !day.completed })}
                      className="mt-0.5 sm:mt-0 text-zinc-500 hover:text-white transition-colors"
                      title={day.completed ? 'Mark Day Incomplete' : 'Mark Day Complete'}
                    >
                      {day.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-white" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm sm:text-base text-white">
                          {day.date}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {day.dayOfWeek}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Day {day.dayIndex} / {daySchedule.length}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-white text-black">
                            TODAY (1 AM)
                          </span>
                        )}
                        {day.isWeekend && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">
                            Weekend
                          </span>
                        )}
                        {day.isMockDay && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-zinc-900 text-white border border-zinc-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 180Q Mock Day
                          </span>
                        )}
                        {isExamDay && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-white text-black">
                            EXAM DAY
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                        {day.phaseTitle}
                      </div>
                    </div>
                  </div>

                  {/* Right: Hours & Details Toggle */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500 font-mono">Hours:</span>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={day.actualHoursLogged || ''}
                          onChange={(e) =>
                            onUpdateDay(day.date, { actualHours: parseFloat(e.target.value) || 0 })
                          }
                          placeholder={String(day.plannedHours)}
                          className="w-14 px-1.5 py-1 text-xs rounded border border-zinc-800 bg-zinc-900 text-white font-bold text-center focus:outline-none focus:border-zinc-500"
                        />
                        <span className="text-zinc-500">/ {day.plannedHours}h</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors flex items-center gap-1 border border-zinc-800"
                    >
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Day Summary Pill Strip */}
                <div className="px-3.5 sm:px-4 pb-3 flex flex-wrap items-center gap-2 text-xs">
                  {day.assignedModuleIds.map((mId) => {
                    const mod = ALL_MODULES.find((m) => m.id === mId);
                    const prog = moduleProgress[mId];
                    if (!mod) return null;
                    return (
                      <span
                        key={mId}
                        onClick={() => onNavigateToChecklist(mId)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border transition-colors ${
                          prog?.status === 'Reviewed'
                            ? 'bg-zinc-800 text-white border-zinc-600 font-semibold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                        }`}
                        title="Click to view module in checklist"
                      >
                        <span className="text-zinc-200">M#{mod.id}:</span>
                        <span className="max-w-[140px] truncate">{mod.title}</span>
                      </span>
                    );
                  })}

                  {day.scheduledRevisits.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono text-[10px]">
                      <RotateCcw className="w-3 h-3 text-zinc-400" />
                      {day.scheduledRevisits.length} Revisits Due
                    </span>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.ethicsCompleted || false}
                      onChange={(e) => onUpdateDay(day.date, { ethicsDone: e.target.checked })}
                      className="rounded accent-white"
                    />
                    <span>20m Ethics</span>
                  </label>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-3.5 sm:px-4 pb-4 pt-3 border-t border-zinc-900 space-y-3 bg-zinc-950/90 rounded-b-xl">
                    {/* Primary Study Assignment */}
                    {day.assignedModuleIds.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                          Assigned Learning Modules:
                        </h4>
                        <div className="space-y-2">
                          {day.assignedModuleIds.map((mId) => {
                            const mod = ALL_MODULES.find((m) => m.id === mId);
                            const prog = moduleProgress[mId];
                            if (!mod) return null;

                            return (
                              <div
                                key={mId}
                                className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200">
                                      Module {mod.id}
                                    </span>
                                    <h5 className="font-semibold text-xs sm:text-sm text-white">
                                      {mod.title}
                                    </h5>
                                  </div>
                                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                    {mod.topicName} ({mod.weightRange}) • Key focus: {mod.keyConcepts.slice(0, 2).join(', ')}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                  <button
                                    onClick={() =>
                                      onUpdateModule(mId, {
                                        learningComplete: !prog?.learningComplete,
                                        status: !prog?.learningComplete && prog?.status === 'Not started' ? 'Questions' : prog?.status,
                                      })
                                    }
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                      prog?.learningComplete
                                        ? 'bg-white text-black'
                                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                                    }`}
                                  >
                                    {prog?.learningComplete ? 'Learning Done ✓' : 'Mark Learning Done'}
                                  </button>
                                  <button
                                    onClick={() => onNavigateToChecklist(mId)}
                                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                                  >
                                    View Matrix
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Spaced Revisits */}
                    {day.scheduledRevisits.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Spaced Repetition Revisits Due:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {day.scheduledRevisits.map((rev) => {
                            const mod = ALL_MODULES.find((m) => m.id === rev.moduleId);
                            const prog = moduleProgress[rev.moduleId];
                            if (!mod) return null;
                            const isDone = rev.revisitNumber === 1 ? prog?.revisit1Done : prog?.revisit2Done;

                            return (
                              <div
                                key={`${rev.moduleId}-${rev.revisitNumber}`}
                                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                                      +{rev.revisitNumber === 1 ? '2d' : '7d'}
                                    </span>
                                    <span className="font-semibold text-xs text-white truncate max-w-[140px]">
                                      M#{mod.id}: {mod.title}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    onUpdateModule(rev.moduleId, {
                                      ...(rev.revisitNumber === 1
                                        ? { revisit1Done: !isDone }
                                        : { revisit2Done: !isDone }),
                                    })
                                  }
                                  className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                                    isDone
                                      ? 'bg-white text-black'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {isDone ? 'Reviewed ✓' : 'Mark Reviewed'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Day Notes Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        Notes & Takeaways for {day.date}:
                      </label>
                      <textarea
                        rows={2}
                        value={day.notes || ''}
                        onChange={(e) => onUpdateDay(day.date, { notes: e.target.value })}
                        placeholder="Log formula traps, calculator mistakes, or personal insights..."
                        className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
