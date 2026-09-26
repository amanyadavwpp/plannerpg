import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { MockExam } from '../types';

interface MockExamSimulatorProps {
  mockExams: MockExam[];
  onUpdateMock: (id: string, updates: Partial<MockExam>) => void;
  onOpenAddError: (moduleId?: number) => void;
}

export const MockExamSimulator: React.FC<MockExamSimulatorProps> = ({
  mockExams,
  onUpdateMock,
  onOpenAddError,
}) => {
  const SESSION_SECONDS = 135 * 60;
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(SESSION_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSessionType, setActiveSessionType] = useState<'AM' | 'PM'>('AM');
  const [activeMockId, setActiveMockId] = useState<string>(mockExams[0]?.id || 'mock-1');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert(`${activeSessionType} Session Time Expired! 135 minutes reached.`);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, activeSessionType]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const elapsedSeconds = SESSION_SECONDS - timerSecondsLeft;
  const targetQuestionNumber = Math.min(90, Math.max(1, Math.floor(elapsedSeconds / 90) + 1));

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(SESSION_SECONDS);
  };

  const handleStartAM = (mockId: string) => {
    setActiveMockId(mockId);
    setActiveSessionType('AM');
    setTimerSecondsLeft(SESSION_SECONDS);
    setIsTimerRunning(true);
  };

  const handleStartPM = (mockId: string) => {
    setActiveMockId(mockId);
    setActiveSessionType('PM');
    setTimerSecondsLeft(SESSION_SECONDS);
    setIsTimerRunning(true);
  };

  return (
    <div className="space-y-4">
      {/* 135-Minute Live Exam Simulation Timer Widget */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800">
                Official Exam Session Timer
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                90 Questions • 135 Minutes (90s / question)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {activeSessionType} Session Timing — {mockExams.find((m) => m.id === activeMockId)?.name.split(' (')[0] || 'Active Simulation'}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              CFA Level I consists of two 135-minute sessions (180 questions total). Pacing benchmark: Never spend more than 2 minutes on any single question.
            </p>
          </div>

          {/* Clock Display & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-black p-4 rounded-xl border border-zinc-800">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                {formatTimer(timerSecondsLeft)}
              </div>
              <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Target Question: <span className="text-white font-bold">#{targetQuestionNumber}</span> of 90
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    isTimerRunning
                      ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  onClick={handleResetTimer}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
                  title="Reset to 135:00"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                <button
                  onClick={() => {
                    setActiveSessionType('AM');
                    setTimerSecondsLeft(SESSION_SECONDS);
                    setIsTimerRunning(false);
                  }}
                  className={`flex-1 py-1 px-2 rounded font-medium transition-colors ${
                    activeSessionType === 'AM'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  AM (90 Qs)
                </button>
                <button
                  onClick={() => {
                    setActiveSessionType('PM');
                    setTimerSecondsLeft(SESSION_SECONDS);
                    setIsTimerRunning(false);
                  }}
                  className={`flex-1 py-1 px-2 rounded font-medium transition-colors ${
                    activeSessionType === 'PM'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  PM (90 Qs)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target passing benchmark info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="font-semibold text-white mb-0.5">
            Target Pass Benchmark: ≥ 70%
          </div>
          <p className="text-zinc-400 text-[11px]">
            MPS historically sits around 67–70%. Consistently hitting 70%+ gives safety margin on exam day.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="font-semibold text-white mb-0.5">
            1:1 Mock Review Ratio
          </div>
          <p className="text-zinc-400 text-[11px]">
            For every 4.5 hours spent taking a mock (2x 135 mins), spend at least 4.5 hours reviewing incorrect and guessed questions.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="font-semibold text-white mb-0.5">
            Phase 6 Protected Window
          </div>
          <p className="text-zinc-400 text-[11px]">
            October 27 onwards is strictly reserved for full mocks, weak area repairs, and formula consolidation.
          </p>
        </div>
      </div>

      {/* 4 Mock Slots Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            The 4 Full Mock Exams (180 Questions Each)
          </h3>
          <button
            onClick={() => onOpenAddError()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Missed Question</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {mockExams.map((mock) => {
            const hasScore = mock.session1Score != null || mock.session2Score != null;
            const totalScore = (mock.session1Score || 0) + (mock.session2Score || 0);
            const percent = mock.totalScorePercent || 0;
            const isPassing = percent >= 70;

            return (
              <div
                key={mock.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {mock.targetDate}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-0.5">
                        {mock.name}
                      </h4>
                    </div>

                    {hasScore && (
                      <div className="text-center px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700">
                        <span className="block text-lg font-mono font-bold text-white">{percent}%</span>
                        <span className="text-[9px] font-mono uppercase text-zinc-400">
                          {isPassing ? 'Passing Target' : 'Review Needed'}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mt-1">
                    {mock.notes}
                  </p>

                  {/* Score Inputs (AM / PM) */}
                  <div className="mt-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* AM Session */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-medium text-zinc-300">
                            AM Session (90 Qs):
                          </label>
                          <button
                            onClick={() => handleStartAM(mock.id)}
                            className="text-[10px] text-zinc-400 hover:text-white font-mono"
                          >
                            Timer
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={mock.session1Score ?? ''}
                            onChange={(e) =>
                              onUpdateMock(mock.id, {
                                session1Score:
                                  e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                              })
                            }
                            placeholder="0–90"
                            className="w-full px-2 py-1 rounded border border-zinc-800 bg-zinc-950 text-center font-bold text-white text-xs focus:outline-none focus:border-zinc-500"
                          />
                          <span className="text-zinc-500">/ 90</span>
                        </div>
                      </div>

                      {/* PM Session */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-medium text-zinc-300">
                            PM Session (90 Qs):
                          </label>
                          <button
                            onClick={() => handleStartPM(mock.id)}
                            className="text-[10px] text-zinc-400 hover:text-white font-mono"
                          >
                            Timer
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={mock.session2Score ?? ''}
                            onChange={(e) =>
                              onUpdateMock(mock.id, {
                                session2Score:
                                  e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                              })
                            }
                            placeholder="0–90"
                            className="w-full px-2 py-1 rounded border border-zinc-800 bg-zinc-950 text-center font-bold text-white text-xs focus:outline-none focus:border-zinc-500"
                          />
                          <span className="text-zinc-500">/ 90</span>
                        </div>
                      </div>
                    </div>

                    {hasScore && (
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-mono">
                        <span className="text-zinc-500">Total Score:</span>
                        <span className="text-white font-semibold">
                          {totalScore} / 180 questions ({percent}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onOpenAddError()}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log Missed Questions</span>
                  </button>
                  <span className="text-zinc-500 text-[11px] font-mono">
                    {hasScore ? 'Score Saved' : 'Pending simulation'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
