import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Trash2,
  Filter,
  Brain,
  Binary,
  Calculator,
  Eye,
  Search,
} from 'lucide-react';
import { ErrorLogItem, ErrorCategory } from '../types';
import { ALL_MODULES, TOPICS } from '../data/cfaData';

interface ErrorLogViewProps {
  errorLogs: ErrorLogItem[];
  onAddError: (item: Omit<ErrorLogItem, 'id' | 'dateLogged'>) => void;
  onUpdateError: (id: string, updates: Partial<ErrorLogItem>) => void;
  onDeleteError: (id: string) => void;
}

const CATEGORY_INFO: Record<
  ErrorCategory,
  { label: string; icon: React.FC<{ className?: string }>; desc: string }
> = {
  'Concept misunderstood': {
    label: 'Concept Misunderstood',
    icon: Brain,
    desc: 'Underlying financial theory or market mechanism was not understood.',
  },
  'Formula forgotten': {
    label: 'Formula Forgotten',
    icon: Binary,
    desc: 'Equation, variable ratio, or decomposition formula forgotten.',
  },
  'Calculator mistake': {
    label: 'Calculator Mistake',
    icon: Calculator,
    desc: 'Keystroke sequence, BGN mode, P/Y settings, or clearing registers.',
  },
  'Question misread': {
    label: 'Question Misread',
    icon: Eye,
    desc: 'Missed "LEAST likely", "EXCEPT", wrong units, or rushed answer.',
  },
};

export const ErrorLogView: React.FC<ErrorLogViewProps> = ({
  errorLogs,
  onAddError,
  onUpdateError,
  onDeleteError,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'all'>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newModuleId, setNewModuleId] = useState<number>(1);
  const [newCategory, setNewCategory] = useState<ErrorCategory>('Concept misunderstood');
  const [newQuestionSource, setNewQuestionSource] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCorrectConcept, setNewCorrectConcept] = useState('');

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ErrorCategory, number> = {
      'Concept misunderstood': 0,
      'Formula forgotten': 0,
      'Calculator mistake': 0,
      'Question misread': 0,
    };
    errorLogs.forEach((err) => {
      counts[err.category] = (counts[err.category] || 0) + 1;
    });
    return counts;
  }, [errorLogs]);

  // Filtered error list
  const filteredErrors = useMemo(() => {
    return errorLogs.filter((err) => {
      if (selectedCategory !== 'all' && err.category !== selectedCategory) return false;
      if (filterResolved === 'pending' && err.resolved) return false;
      if (filterResolved === 'resolved' && !err.resolved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = err.description.toLowerCase().includes(q);
        const matchesConcept = err.correctConcept.toLowerCase().includes(q);
        const matchesSource = err.questionSource.toLowerCase().includes(q);
        return matchesDesc || matchesConcept || matchesSource;
      }
      return true;
    });
  }, [errorLogs, selectedCategory, filterResolved, searchQuery]);

  const handleSubmitNewError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !newCorrectConcept.trim()) {
      alert('Please fill out both the error description and the key correct concept.');
      return;
    }
    const mod = ALL_MODULES.find((m) => m.id === newModuleId);
    onAddError({
      moduleId: newModuleId,
      topicId: mod ? mod.topicId : 'quant',
      questionSource: newQuestionSource.trim() || 'Practice Question',
      category: newCategory,
      description: newDescription.trim(),
      correctConcept: newCorrectConcept.trim(),
      resolved: false,
    });
    setNewDescription('');
    setNewCorrectConcept('');
    setNewQuestionSource('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Strategy */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Diagnostic Error Log
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Categorize every missed or guessed question into one of 4 root causes to identify your precise revision priorities.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Missed Question</span>
          </button>
        </div>

        {/* 4 Category Filter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-900">
          {(Object.keys(CATEGORY_INFO) as ErrorCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const Icon = info.icon;
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;

            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-zinc-400'}`} />
                    <span className="text-xs font-semibold">
                      {info.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono">
                    {count}
                  </span>
                </div>
                <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  {info.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search error notes, concepts, or question sources..."
            className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono">
            <Filter className="w-3 h-3 text-zinc-500" />
            <select
              value={filterResolved}
              onChange={(e) => setFilterResolved(e.target.value as any)}
              className="py-1 px-2 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 focus:outline-none text-xs"
            >
              <option value="all">All ({errorLogs.length})</option>
              <option value="pending">Pending ({errorLogs.filter((e) => !e.resolved).length})</option>
              <option value="resolved">Resolved ({errorLogs.filter((e) => e.resolved).length})</option>
            </select>
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-zinc-400 hover:text-white font-medium text-xs underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Error Cards List */}
      <div className="space-y-2.5">
        {filteredErrors.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
            No errors match the current filters.
          </div>
        ) : (
          filteredErrors.map((err) => {
            const catInfo = CATEGORY_INFO[err.category];
            const mod = ALL_MODULES.find((m) => m.id === err.moduleId);
            const topic = TOPICS[err.topicId];

            return (
              <div
                key={err.id}
                className={`p-4 rounded-xl border transition-colors ${
                  err.resolved
                    ? 'bg-zinc-950/60 border-zinc-900 opacity-70'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {catInfo.label}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-800">
                      Module {err.moduleId}: {mod?.title}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      [{topic?.name}]
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Source: {err.questionSource}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onUpdateError(err.id, { resolved: !err.resolved })}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                        err.resolved
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{err.resolved ? 'Resolved ✓' : 'Mark Resolved'}</span>
                    </button>
                    <button
                      onClick={() => onDeleteError(err.id)}
                      className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
                      title="Delete error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* What went wrong & Remediation */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-zinc-300 block mb-0.5 font-mono text-[11px]">
                      Mistake / Trap:
                    </span>
                    <p className="text-zinc-400 leading-relaxed">
                      {err.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80">
                    <span className="font-semibold text-white block mb-0.5 font-mono text-[11px]">
                      Correct Rule / Formula:
                    </span>
                    <p className="text-zinc-200 leading-relaxed font-mono text-[11px]">
                      {err.correctConcept}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Logged: {err.dateLogged}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Error Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <span>Log Missed Question Diagnostic</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewError} className="space-y-3">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Root Cause Category:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ErrorCategory)}
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                >
                  <option value="Concept misunderstood">Concept misunderstood (Core theory flaw)</option>
                  <option value="Formula forgotten">Formula forgotten (Missed equation/ratio)</option>
                  <option value="Calculator mistake">Calculator mistake (Keystrokes/BGN)</option>
                  <option value="Question misread">Question misread (LEAST likely/rushing)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Module:
                </label>
                <select
                  value={newModuleId}
                  onChange={(e) => setNewModuleId(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                >
                  {ALL_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.id}: {m.title} ({m.topicName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Question Source / Reference:
                </label>
                <input
                  type="text"
                  value={newQuestionSource}
                  onChange={(e) => setNewQuestionSource(e.target.value)}
                  placeholder="e.g. CFAI Ecosystem Q#42, Mock 1 AM #15"
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  What Did You Do Wrong?:
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your reasoning error..."
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  The Correct Rule / Formula:
                </label>
                <textarea
                  rows={2}
                  value={newCorrectConcept}
                  onChange={(e) => setNewCorrectConcept(e.target.value)}
                  placeholder="The concept to remember..."
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold"
                >
                  Save to Error Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
