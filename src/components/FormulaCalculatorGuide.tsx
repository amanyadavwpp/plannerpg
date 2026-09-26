import React, { useState } from 'react';
import {
  Calculator,
  Binary,
  Search,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { FORMULA_CHEATSHEET, CALCULATOR_GUIDE } from '../data/cfaData';

export const FormulaCalculatorGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalcModel, setSelectedCalcModel] = useState<string>('Texas Instruments BA II Plus');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopy = (formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(formulaText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const filteredFormulas = FORMULA_CHEATSHEET.map((group) => {
    const matchingFormulas = group.formulas.filter((f) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.formula.toLowerCase().includes(q);
    });
    return {
      ...group,
      formulas: matchingFormulas,
    };
  }).filter((group) => group.formulas.length > 0);

  const activeCalcGuide = CALCULATOR_GUIDE.find((c) => c.model === selectedCalcModel) || CALCULATOR_GUIDE[0];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-zinc-400" /> Formulas & Calculator Reference
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              Calculator Setup & High-Yield Formulas
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5 leading-relaxed">
              Standardized keystrokes for Texas Instruments BA II Plus & HP 12C, plus essential Level I quantitative formulations.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Keystroke Guide Section */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-zinc-400" />
              <span>Exam-Approved Financial Calculator Setup</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Approved models: Texas Instruments BA II Plus (including Professional) & HP 12C.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {CALCULATOR_GUIDE.map((calc) => (
              <button
                key={calc.model}
                onClick={() => setSelectedCalcModel(calc.model)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedCalcModel === calc.model
                    ? 'bg-white text-black font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {calc.model.includes('BA II') ? 'TI BA II Plus' : 'HP 12C'}
              </button>
            ))}
          </div>
        </div>

        {/* Setup Checklist */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            {activeCalcGuide.title}:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {activeCalcGuide.steps.map((st, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between"
              >
                <span className="font-semibold text-white">
                  {st.action}
                </span>
                <code className="mt-1.5 p-1.5 rounded bg-black text-zinc-300 font-mono text-[11px] block border border-zinc-800">
                  {st.keys}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Keystroke Scenarios */}
        <div className="space-y-2 pt-2 border-t border-zinc-900">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Speed Keystroke Templates:
          </h4>
          <div className="space-y-2 text-xs">
            {activeCalcGuide.keystrokeExamples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800"
              >
                <div className="font-semibold text-white mb-1">
                  Scenario: {ex.scenario}
                </div>
                <div className="font-mono text-[11px] text-zinc-300 bg-black p-2 rounded border border-zinc-800 leading-relaxed overflow-x-auto">
                  {ex.steps}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formula Cheat-sheet Section */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-zinc-400" />
              <span>Core Formula Compendium by Topic</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Essential Level I quantitative formulations and ratio decompositions.
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>
        </div>

        {/* Formulas List */}
        <div className="space-y-5">
          {filteredFormulas.map((group) => (
            <div key={group.topic} className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {group.topic}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.formulas.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-2 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-white">
                        {f.name}
                      </span>
                      <button
                        onClick={() => handleCopy(f.formula)}
                        className="text-zinc-500 hover:text-white p-1 rounded transition-colors"
                        title="Copy formula"
                      >
                        {copiedFormula === f.formula ? (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="p-2 rounded bg-black font-mono text-xs text-zinc-300 border border-zinc-800/80 overflow-x-auto">
                      {f.formula}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
