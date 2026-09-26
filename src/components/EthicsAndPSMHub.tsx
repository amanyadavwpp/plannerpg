import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { ETHICS_STANDARDS } from '../data/cfaData';

interface EthicsHubProps {
  examDate: string;
}

export const EthicsAndPSMHub: React.FC<EthicsHubProps> = ({ examDate }) => {
  const [expandedStandardIndex, setExpandedStandardIndex] = useState<number | null>(0);
  const [ethicsDrillCount, setEthicsDrillCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cfa_ethics_drill_count');
      return saved ? parseInt(saved, 10) : 12;
    } catch {
      return 12;
    }
  });

  const [completedDrillToday, setCompletedDrillToday] = useState<boolean>(false);

  const handleIncrementDrill = () => {
    const next = ethicsDrillCount + 1;
    setEthicsDrillCount(next);
    setCompletedDrillToday(true);
    localStorage.setItem('cfa_ethics_drill_count', String(next));
  };

  const codeOfEthicsPrinciples = [
    { title: 'Integrity & Competence', desc: 'Act with integrity, competence, diligence, respect and in an ethical manner with the public, clients, employers, and capital markets participants.' },
    { title: 'Client Primacy', desc: 'Place the integrity of the investment profession and the interests of clients above personal interests.' },
    { title: 'Reasonable Care', desc: 'Use reasonable care and exercise independent professional judgment when conducting investment analysis, recommendations, and actions.' },
    { title: 'Professional Practice', desc: 'Practice and encourage others to practice in a professional and ethical manner that will reflect credit on themselves and the profession.' },
    { title: 'Capital Market Integrity', desc: 'Promote the integrity and viability of global capital markets for the ultimate benefit of society.' },
    { title: 'Continuous Competence', desc: 'Maintain and improve their professional competence and strive to maintain and improve the competence of other investment professionals.' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner: The Ethics Golden Rule */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-zinc-300" /> 15–20% Weight • Pass Tie-Breaker
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Daily Ethics Habit & Standards I–VII Hub
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong>"Practise Ethics throughout preparation. Schedule 15–20 minutes on most study days rather than leaving it entirely to the end."</strong> CFA Institute applies the "Ethics Adjustment" for candidates hovering near the Minimum Passing Score (MPS). High performance in Ethics can pull a borderline score into a Pass.
            </p>
          </div>

          {/* Daily Ethics Practice Card */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 text-center shrink-0 min-w-[200px]">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              15–20m Practice Sessions
            </span>
            <span className="text-3xl font-mono font-bold text-white mt-0.5 block">
              {ethicsDrillCount}
            </span>
            <p className="text-[10px] text-zinc-500 mt-0.5 mb-2 font-mono">
              Daily drills logged
            </p>
            <button
              onClick={handleIncrementDrill}
              className={`w-full py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                completedDrillToday
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-white hover:bg-zinc-200 text-black'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedDrillToday ? 'Drill Logged Today ✓' : '+ Log Today’s 15m Drill'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 6 Code of Ethics Principles */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-300" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            The 6 Fundamental Principles of the Code of Ethics
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {codeOfEthicsPrinciples.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between text-xs space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-white">{p.title}</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Standards I to VII Master Guidance Reference */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>Standards of Professional Conduct (Standards I through VII)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tested nuances, requirements, and compliance procedures for all 22 sub-sections.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Scale className="w-3.5 h-3.5 text-zinc-400" />
            <span>Target: 1 Standard / 2 Days until {examDate}</span>
          </div>
        </div>

        <div className="space-y-2">
          {ETHICS_STANDARDS.map((std, idx) => {
            const isExpanded = expandedStandardIndex === idx;

            return (
              <div
                key={std.code}
                className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950"
              >
                <button
                  onClick={() => setExpandedStandardIndex(isExpanded ? null : idx)}
                  className="w-full p-3.5 bg-zinc-900/60 hover:bg-zinc-900 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-200 border border-zinc-700">
                      {std.code}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-white">
                      {std.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                      ({std.subsections.length} subsections)
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                {isExpanded && (
                  <div className="p-3.5 space-y-2.5 bg-zinc-950 text-xs divide-y divide-zinc-900">
                    {std.subsections.map((sub) => (
                      <div key={sub.code} className="pt-2.5 first:pt-0">
                        <div className="flex items-center gap-2 font-semibold text-white mb-0.5">
                          <span className="font-mono text-zinc-400">{sub.code}:</span>
                          <span>{sub.title}</span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed text-[11px] pl-2.5 border-l border-zinc-700">
                          {sub.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
