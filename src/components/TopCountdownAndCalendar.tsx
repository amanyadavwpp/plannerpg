import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Target,
  Zap,
} from 'lucide-react';
import { DaySchedule, DailyTimeBlock, ModuleProgress } from '../types';
import { ALL_MODULES } from '../data/cfaData';

interface TopCountdownAndCalendarProps {
  currentSimulatedDate: string; // "2026-09-27"
  currentSimulatedTime: string; // "01:00"
  examDate: string; // "2026-11-16"
  daySchedule: DaySchedule[];
  hourlyBlocks: DailyTimeBlock[];
  onToggleHourlyBlock: (id: string) => void;
  moduleProgress: Record<number, ModuleProgress>;
  onSelectDay: (dateStr: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const TopCountdownAndCalendar: React.FC<TopCountdownAndCalendarProps> = ({
  currentSimulatedDate,
  currentSimulatedTime,
  examDate,
  daySchedule,
  hourlyBlocks,
  onToggleHourlyBlock,
  moduleProgress,
  onSelectDay,
  onNavigateTab,
}) => {
  const [secondsElapsedSinceLoad, setSecondsElapsedSinceLoad] = useState(0);
  const [isHourlyScheduleExpanded, setIsHourlyScheduleExpanded] = useState(true);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(currentSimulatedDate);

  // Clock tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsedSinceLoad((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulatedBaseTime = useMemo(() => {
    return new Date(`${currentSimulatedDate}T${currentSimulatedTime}:00`).getTime();
  }, [currentSimulatedDate, currentSimulatedTime]);

  const currentTickingTimestamp = simulatedBaseTime + secondsElapsedSinceLoad * 1000;
  const currentTickingDate = new Date(currentTickingTimestamp);

  const examTargetTimestamp = useMemo(() => {
    return new Date(`${examDate}T08:00:00`).getTime();
  }, [examDate]);

  const diffMs = Math.max(0, examTargetTimestamp - currentTickingTimestamp);
  const countdownDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const countdownHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const countdownMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const countdownSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formattedTickingTime = currentTickingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const remainingDays = useMemo(() => {
    return daySchedule.filter((d) => d.date >= currentSimulatedDate);
  }, [daySchedule, currentSimulatedDate]);

  const activeSelectedDay = useMemo(() => {
    return daySchedule.find((d) => d.date === selectedCalendarDate) || remainingDays[0] || daySchedule[0];
  }, [daySchedule, selectedCalendarDate, remainingDays]);

  const completedBlocksCount = hourlyBlocks.filter((b) => b.completed).length;

  return (
    <div className="space-y-4">
      {/* 1. MINIMALIST COUNTDOWN TERMINAL */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 text-zinc-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Headline & Context */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                Live Study Clock
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Sunday, Sep 27, 2026 • {formattedTickingTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Countdown to Exam: Nov 16, 2026 (08:00 AM)
            </h2>

            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              Starting point: <strong>Day 2 (Sunday, 27th Sept, 1:00 AM)</strong>. Exactly{' '}
              <span className="text-white font-semibold">{countdownDays} days and {countdownHours} hours</span> remain until Session 1.
            </p>
          </div>

          {/* Right: Crisp Monochrome Countdown Segment */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black p-3 rounded-lg border border-zinc-800 shrink-0 self-start lg:self-auto font-mono">
            {/* Days */}
            <div className="text-center px-3 py-1.5 rounded bg-zinc-900/80 border border-zinc-800/80 min-w-[64px]">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {String(countdownDays).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans mt-0.5">
                Days
              </div>
            </div>

            <span className="text-lg font-bold text-zinc-600">:</span>

            {/* Hours */}
            <div className="text-center px-3 py-1.5 rounded bg-zinc-900/80 border border-zinc-800/80 min-w-[64px]">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {String(countdownHours).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans mt-0.5">
                Hours
              </div>
            </div>

            <span className="text-lg font-bold text-zinc-600">:</span>

            {/* Minutes */}
            <div className="text-center px-3 py-1.5 rounded bg-zinc-900/80 border border-zinc-800/80 min-w-[64px]">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-300 tracking-tight">
                {String(countdownMinutes).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans mt-0.5">
                Mins
              </div>
            </div>

            <span className="text-lg font-bold text-zinc-600">:</span>

            {/* Seconds */}
            <div className="text-center px-3 py-1.5 rounded bg-zinc-900/80 border border-zinc-800/80 min-w-[64px]">
              <div className="text-2xl sm:text-3xl font-bold text-zinc-300 tracking-tight">
                {String(countdownSeconds).padStart(2, '0')}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans mt-0.5">
                Secs
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-zinc-300" />
              <span>Mock 1 (Oct 28): <strong className="text-white">31 Days Left</strong></span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
              <span>Final Revision Window (Oct 27): <strong className="text-white">30 Days Left</strong></span>
            </div>
          </div>

          <button
            onClick={() => setIsHourlyScheduleExpanded(!isHourlyScheduleExpanded)}
            className="flex items-center gap-1 text-zinc-300 hover:text-white font-medium transition-colors"
          >
            <span>{isHourlyScheduleExpanded ? 'Hide Sep 27 Plan' : 'Show Sep 27 Plan (1:00 AM)'}</span>
            {isHourlyScheduleExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. TODAY'S DETAILED 24-HOUR TIME-BLOCKING MATRIX (Starting 1:00 AM, Sep 27) */}
      {isHourlyScheduleExpanded && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                  <Clock className="w-3 h-3 inline mr-1" /> Sunday Timetable
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Sunday, September 27 Study Schedule (Starting 1:00 AM)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target: ~8.5 hours covering Quantitative Methods (TVM, Stats, Probability, Portfolio Math) + 20m Ethics.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>{completedBlocksCount} / {hourlyBlocks.length} Blocks Complete</span>
            </div>
          </div>

          {/* Time blocks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {hourlyBlocks.map((block) => {
              const isCurrentNightRest = block.id === 'block-1';

              return (
                <div
                  key={block.id}
                  onClick={() => onToggleHourlyBlock(block.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex flex-col justify-between gap-2 ${
                    block.completed
                      ? 'bg-zinc-900/90 border-zinc-700 opacity-75'
                      : isCurrentNightRest
                      ? 'bg-zinc-900 border-zinc-700 ring-1 ring-zinc-500'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {block.timeRange}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isCurrentNightRest && !block.completed && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                            Current (1 AM)
                          </span>
                        )}
                        {block.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                    </div>

                    <h4 className="font-semibold text-white line-clamp-1">
                      {block.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {block.description}
                    </p>
                  </div>

                  {block.associatedModuleId && (
                    <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Module #{block.associatedModuleId}</span>
                      <span className="text-zinc-400">
                        {ALL_MODULES.find((m) => m.id === block.associatedModuleId)?.topicName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MINIMALIST CALENDAR STRIP (Sep 27 – Nov 16) */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Timeline: All {remainingDays.length} Remaining Days
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Scroll across the countdown days from September 27 to November 16. Click any date to view target modules.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-0.5"
          >
            <span>Full Schedule Table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Calendar Carousel */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="flex items-center gap-1.5 min-w-max py-1">
            {remainingDays.map((d) => {
              const isToday = d.date === currentSimulatedDate;
              const isSelected = d.date === selectedCalendarDate;
              const isExamDay = d.date === examDate;
              const isMock = d.isMockDay;

              return (
                <div
                  key={d.date}
                  onClick={() => {
                    setSelectedCalendarDate(d.date);
                    onSelectDay(d.date);
                  }}
                  className={`p-2 rounded-lg border text-center cursor-pointer transition-colors w-24 shrink-0 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white text-black border-white'
                      : isToday
                      ? 'bg-zinc-900 border-zinc-600 text-white'
                      : isExamDay
                      ? 'bg-zinc-900 border-zinc-500 text-white font-bold'
                      : isMock
                      ? 'bg-zinc-900/80 border-zinc-700 text-zinc-200'
                      : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono uppercase mb-1">
                    <span>{d.dayOfWeek}</span>
                    <span>D{d.dayIndex}</span>
                  </div>

                  <div className={`text-sm font-bold font-mono ${isSelected ? 'text-black' : 'text-white'}`}>
                    {d.date.slice(5)}
                  </div>

                  <div className="mt-1">
                    {isToday ? (
                      <span className={`block px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${isSelected ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        TODAY
                      </span>
                    ) : isExamDay ? (
                      <span className={`block px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                        EXAM
                      </span>
                    ) : isMock ? (
                      <span className={`block px-1 py-0.2 rounded text-[9px] font-mono uppercase ${isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                        MOCK
                      </span>
                    ) : (
                      <span className={`block text-[10px] font-mono truncate ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                        {d.plannedHours}h • P{d.phaseId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector */}
        {activeSelectedDay && (
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-mono flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] text-zinc-400 uppercase">{activeSelectedDay.dayOfWeek}</span>
                <span className="text-xs font-bold">{activeSelectedDay.date.slice(8)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {activeSelectedDay.date} (Day {activeSelectedDay.dayIndex} of {daySchedule.length})
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {activeSelectedDay.phaseTitle}
                  </span>
                  {activeSelectedDay.isMockDay && (
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-white border border-zinc-700 font-semibold">
                      {activeSelectedDay.mockName}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                  <span>Planned: <strong>{activeSelectedDay.plannedHours}h</strong></span>
                  <span>•</span>
                  <span>
                    Focus Modules:{' '}
                    {activeSelectedDay.assignedModuleIds.length > 0
                      ? activeSelectedDay.assignedModuleIds
                          .map((id) => {
                            const p = moduleProgress[id];
                            return `M${id}${p?.status === 'Reviewed' ? ' (✓)' : ''}`;
                          })
                          .join(', ')
                      : 'Mock Review & Formulas'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('calendar')}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-black font-semibold text-xs shrink-0 transition-colors self-start md:self-auto"
            >
              Open in Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
