import React, { useState, useMemo } from 'react';
import {
  History,
  X,
  Search,
  CheckCircle,
  Clock,
  Award,
  AlertTriangle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { ActivityLogEntry } from '../types';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityHistory: ActivityLogEntry[];
  onClearHistory: () => void;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose,
  activityHistory,
  onClearHistory,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return activityHistory.filter((item) => {
      if (filterType !== 'all' && item.actionType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.detail.toLowerCase().includes(q) ||
          item.formattedTime.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activityHistory, filterType, searchQuery]);

  if (!isOpen) return null;

  const getActionIcon = (type: ActivityLogEntry['actionType']) => {
    switch (type) {
      case 'module_status':
      case 'learning_done':
        return <CheckCircle className="w-3.5 h-3.5 text-zinc-300" />;
      case 'hour_logged':
        return <Clock className="w-3.5 h-3.5 text-zinc-300" />;
      case 'score_logged':
      case 'mock_updated':
        return <Award className="w-3.5 h-3.5 text-zinc-300" />;
      case 'error_logged':
        return <AlertTriangle className="w-3.5 h-3.5 text-zinc-300" />;
      default:
        return <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <History className="w-4 h-4 text-zinc-100" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Study Activity & Marking History</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {activityHistory.length} events saved
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Persistent audit trail of all module completions, scores, hours, and error logs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter history log by module or action..."
              className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'module_status', 'learning_done', 'score_logged', 'hour_logged', 'error_logged'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    filterType === type
                      ? 'bg-white text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {type === 'all'
                    ? 'All'
                    : type === 'module_status'
                    ? 'Status'
                    : type === 'learning_done'
                    ? 'Learning'
                    : type === 'score_logged'
                    ? 'Scores'
                    : type === 'hour_logged'
                    ? 'Hours'
                    : 'Errors'}
                </button>
              )
            )}
          </div>
        </div>

        {/* History Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-zinc-900">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No activity logs match the selected filter.
            </div>
          ) : (
            filteredLogs.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    {getActionIcon(item.actionType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{item.title}</span>
                      {item.moduleId && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          M#{item.moduleId}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-500 shrink-0 text-right">
                  {item.formattedTime}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 flex items-center justify-between text-xs">
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold border border-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
