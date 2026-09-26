import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';
import { ALL_MODULES, TOPICS } from '../data/cfaData';
import { ModuleProgress, ModuleStatus, TopicId } from '../types';
import { exportChecklistToCSV, downloadCSV } from '../utils/scheduleGenerator';

interface ModuleChecklistProps {
  moduleProgress: Record<number, ModuleProgress>;
  onUpdateModule: (id: number, updates: Partial<ModuleProgress>) => void;
  onBulkUpdate: (ids: number[], updates: Partial<ModuleProgress>) => void;
  onOpenAddError: (moduleId: number) => void;
  initialTopicFilter?: TopicId;
}

export const ModuleChecklist: React.FC<ModuleChecklistProps> = ({
  moduleProgress,
  onUpdateModule,
  onBulkUpdate,
  onOpenAddError,
  initialTopicFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicId | 'all'>(initialTopicFilter || 'all');
  const [selectedStatus, setSelectedStatus] = useState<ModuleStatus | 'all'>('all');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  React.useEffect(() => {
    if (initialTopicFilter) {
      setSelectedTopic(initialTopicFilter);
    }
  }, [initialTopicFilter]);

  const filteredModules = useMemo(() => {
    return ALL_MODULES.filter((mod) => {
      if (selectedTopic !== 'all' && mod.topicId !== selectedTopic) return false;
      const prog = moduleProgress[mod.id];
      if (selectedStatus !== 'all' && (prog?.status || 'Not started') !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = mod.title.toLowerCase().includes(query);
        const matchesNum = String(mod.id).includes(query);
        const matchesTopic = mod.topicName.toLowerCase().includes(query);
        const matchesConcepts = mod.keyConcepts.some((c) => c.toLowerCase().includes(query));
        return matchesTitle || matchesNum || matchesTopic || matchesConcepts;
      }

      return true;
    });
  }, [selectedTopic, selectedStatus, searchQuery, moduleProgress]);

  const handleExportCSV = () => {
    const csv = exportChecklistToCSV(ALL_MODULES, moduleProgress);
    downloadCSV(csv, 'CFA_2026_Level_1_Checklist.csv');
  };

  const handleMarkAllVisibleReviewed = () => {
    const ids = filteredModules.map((m) => m.id);
    if (window.confirm(`Mark all ${ids.length} currently filtered modules as 'Reviewed'?`)) {
      onBulkUpdate(ids, { status: 'Reviewed', learningComplete: true });
    }
  };

  const handleMarkAllVisibleLearning = () => {
    const ids = filteredModules.map((m) => m.id);
    if (window.confirm(`Mark all ${ids.length} currently filtered modules as 'Learning Complete'?`)) {
      onBulkUpdate(ids, { learningComplete: true, status: 'Questions' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Export Toolbar */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
              <span>93-Module Curriculum Matrix</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Complete module tracking table: Target finish dates, hours, practice question scores, spaced revisits (+2d & +7d), and status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors"
              title="Download CSV to open in Excel or Google Sheets"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleMarkAllVisibleLearning}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors border border-zinc-800"
            >
              Filtered: Learning Done
            </button>
            <button
              onClick={handleMarkAllVisibleReviewed}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors border border-zinc-700"
            >
              Filtered: Reviewed
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-900 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by module name, formula, concept..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as TopicId | 'all')}
              className="w-full py-1.5 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
            >
              <option value="all">All 10 Topics ({ALL_MODULES.length} modules)</option>
              {Object.values(TOPICS).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.weight} • {t.moduleCount} mods)
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ModuleStatus | 'all')}
              className="w-full py-1.5 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="Not started">Not started</option>
              <option value="Learning">Learning</option>
              <option value="Questions">Questions</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-zinc-900 text-zinc-300 border-b border-zinc-800 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[130px]">Topic</th>
                <th className="py-2.5 px-3 min-w-[240px]">Learning Module</th>
                <th className="py-2.5 px-3 min-w-[110px]">Target Finish</th>
                <th className="py-2.5 px-3 min-w-[110px] text-center">Hours (Plan / Act)</th>
                <th className="py-2.5 px-3 min-w-[100px] text-center">Learning Done</th>
                <th className="py-2.5 px-3 min-w-[140px] text-center">Score (1st / Rpt)</th>
                <th className="py-2.5 px-3 min-w-[130px] text-center">Revisits (+2d / +7d)</th>
                <th className="py-2.5 px-3 min-w-[120px]">Status</th>
                <th className="py-2.5 px-2 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No modules match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => {
                  const prog = moduleProgress[mod.id] || {
                    id: mod.id,
                    status: 'Not started',
                    learningComplete: false,
                    hoursActual: 0,
                    targetFinishDate: '',
                    revisit1Date: '',
                    revisit2Date: '',
                    revisit1Done: false,
                    revisit2Done: false,
                  };
                  const topic = TOPICS[mod.topicId];
                  const isExpanded = expandedRowId === mod.id;

                  return (
                    <React.Fragment key={mod.id}>
                      <tr
                        className={`hover:bg-zinc-900/50 transition-colors ${
                          prog.status === 'Reviewed'
                            ? 'bg-zinc-900/30'
                            : ''
                        }`}
                      >
                        {/* Module ID */}
                        <td className="py-2 px-3 text-center font-mono font-bold text-zinc-400">
                          {mod.id}
                        </td>

                        {/* Topic */}
                        <td className="py-2 px-3">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {topic.name}
                          </span>
                          <span className="block font-mono text-[10px] text-zinc-500 mt-0.5">
                            {mod.weightRange}
                          </span>
                        </td>

                        {/* Module Title */}
                        <td className="py-2 px-3">
                          <div className="font-semibold text-white">
                            {mod.title}
                          </div>
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : mod.id)}
                            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-0.5 mt-0.5"
                          >
                            <span>{isExpanded ? 'Hide Concepts' : 'Concepts & Notes'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>

                        {/* Target Finish Date */}
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={prog.targetFinishDate || ''}
                            onChange={(e) =>
                              onUpdateModule(mod.id, { targetFinishDate: e.target.value })
                            }
                            className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
                          />
                        </td>

                        {/* Hours (Plan / Actual) */}
                        <td className="py-2 px-3 text-center font-mono">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <span className="text-zinc-500">{mod.hoursPlanned}h</span>
                            <span className="text-zinc-600">/</span>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="30"
                              value={prog.hoursActual || ''}
                              onChange={(e) =>
                                onUpdateModule(mod.id, {
                                  hoursActual: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="0"
                              className="w-10 px-1 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-center font-bold text-white text-xs focus:outline-none focus:border-zinc-500"
                            />
                            <span className="text-zinc-500">h</span>
                          </div>
                        </td>

                        {/* Learning Complete Checkbox */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() =>
                              onUpdateModule(mod.id, {
                                learningComplete: !prog.learningComplete,
                                status: !prog.learningComplete && prog.status === 'Not started' ? 'Questions' : prog.status,
                              })
                            }
                            className="inline-flex items-center justify-center p-0.5 text-zinc-500 hover:text-white transition-colors"
                          >
                            {prog.learningComplete ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <div className="w-4 h-4 rounded border border-zinc-600 hover:border-white" />
                            )}
                          </button>
                        </td>

                        {/* Practice Score (1st vs Repeat) */}
                        <td className="py-2 px-3 text-center font-mono">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <span className="text-[10px] text-zinc-500">1st:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={prog.practiceScoreFirst ?? ''}
                              onChange={(e) =>
                                onUpdateModule(mod.id, {
                                  practiceScoreFirst:
                                    e.target.value === '' ? null : parseInt(e.target.value, 10),
                                })
                              }
                              placeholder="%"
                              className="w-10 px-1 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-center text-xs text-white"
                            />
                            <span className="text-zinc-600">|</span>
                            <span className="text-[10px] text-zinc-500">Rpt:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={prog.practiceScoreRepeat ?? ''}
                              onChange={(e) =>
                                onUpdateModule(mod.id, {
                                  practiceScoreRepeat:
                                    e.target.value === '' ? null : parseInt(e.target.value, 10),
                                })
                              }
                              placeholder="%"
                              className="w-10 px-1 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-center text-xs text-white"
                            />
                          </div>
                        </td>

                        {/* Spaced Revisits */}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-[11px] font-mono">
                            <label
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer border ${
                                prog.revisit1Done
                                  ? 'bg-zinc-800 text-white border-zinc-600'
                                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                              }`}
                              title={`Revisit 1 due: ${prog.revisit1Date || '+2 days'}`}
                            >
                              <input
                                type="checkbox"
                                checked={prog.revisit1Done || false}
                                onChange={(e) =>
                                  onUpdateModule(mod.id, { revisit1Done: e.target.checked })
                                }
                                className="rounded accent-white w-3 h-3"
                              />
                              <span>+2d</span>
                            </label>

                            <label
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer border ${
                                prog.revisit2Done
                                  ? 'bg-zinc-800 text-white border-zinc-600'
                                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                              }`}
                              title={`Revisit 2 due: ${prog.revisit2Date || '+7 days'}`}
                            >
                              <input
                                type="checkbox"
                                checked={prog.revisit2Done || false}
                                onChange={(e) =>
                                  onUpdateModule(mod.id, { revisit2Done: e.target.checked })
                                }
                                className="rounded accent-white w-3 h-3"
                              />
                              <span>+7d</span>
                            </label>
                          </div>
                        </td>

                        {/* Status Select */}
                        <td className="py-2 px-3">
                          <select
                            value={prog.status}
                            onChange={(e) =>
                              onUpdateModule(mod.id, { status: e.target.value as ModuleStatus })
                            }
                            className={`w-full py-1 px-2 rounded font-mono text-xs focus:outline-none border ${
                              prog.status === 'Reviewed'
                                ? 'bg-white text-black font-semibold border-white'
                                : prog.status === 'Questions'
                                ? 'bg-zinc-800 text-white border-zinc-700'
                                : prog.status === 'Learning'
                                ? 'bg-zinc-900 text-zinc-200 border-zinc-800'
                                : 'bg-zinc-950 text-zinc-500 border-zinc-900'
                            }`}
                          >
                            <option value="Not started">Not started</option>
                            <option value="Learning">Learning</option>
                            <option value="Questions">Questions</option>
                            <option value="Reviewed">Reviewed</option>
                          </select>
                        </td>

                        {/* Action: Add to Error Log */}
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => onOpenAddError(mod.id)}
                            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                            title="Log missed question for this module"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Drawer: Key Concepts & Notes */}
                      {isExpanded && (
                        <tr className="bg-zinc-900/40">
                          <td colSpan={10} className="p-3.5 border-b border-zinc-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                                    Tested Key Concepts ({mod.keyConcepts.length} Areas):
                                  </h5>
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {(prog.masteredConcepts || []).length} / {mod.keyConcepts.length} Mastered
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {mod.keyConcepts.map((kc, idx) => {
                                    const isMastered = (prog.masteredConcepts || []).includes(kc);
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          const currentMastered = prog.masteredConcepts || [];
                                          const updated = currentMastered.includes(kc)
                                            ? currentMastered.filter((c) => c !== kc)
                                            : [...currentMastered, kc];
                                          onUpdateModule(mod.id, { masteredConcepts: updated });
                                        }}
                                        className={`px-2 py-0.5 rounded text-xs flex items-center gap-1.5 border transition-colors ${
                                          isMastered
                                            ? 'bg-white text-black font-semibold border-white'
                                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                                        }`}
                                      >
                                        <span className={`w-3 h-3 rounded text-[9px] flex items-center justify-center ${isMastered ? 'bg-black text-white' : 'border border-zinc-600'}`}>
                                          {isMastered ? '✓' : ''}
                                        </span>
                                        <span>{kc}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <h5 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                                  Personal Notes / Formula Traps:
                                </h5>
                                <textarea
                                  rows={2}
                                  value={prog.notes || ''}
                                  onChange={(e) =>
                                    onUpdateModule(mod.id, { notes: e.target.value })
                                  }
                                  placeholder="Record formula traps, trick questions, or calculator nuances..."
                                  className="w-full p-2 text-xs rounded border border-zinc-800 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
