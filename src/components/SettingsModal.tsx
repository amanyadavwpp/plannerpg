import React, { useState } from 'react';
import {
  Settings,
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react';
import { StudySettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudySettings;
  onUpdateSettings: (newSettings: Partial<StudySettings>) => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onResetAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetAll,
}) => {
  const [localSettings, setLocalSettings] = useState<StudySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onImportBackup(text);
          onClose();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4 my-8 text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold">
              <Settings className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Planner Parameters & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Active Reference Date & Time */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
            <label className="block font-semibold text-white">
              Active Reference Date & Clock Time:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Date:</span>
                <input
                  type="date"
                  value={localSettings.currentSimulatedDate || '2026-09-27'}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, currentSimulatedDate: e.target.value })
                  }
                  className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-950 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Time:</span>
                <input
                  type="time"
                  value={localSettings.currentSimulatedTime || '01:00'}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, currentSimulatedTime: e.target.value })
                  }
                  className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-950 text-white font-mono text-xs text-center focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-400">
              Default is Sunday, Sep 27, 2026 (01:00 AM). Drives the countdown timer and active day highlighting.
            </p>
          </div>

          {/* Start Date Selection */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Curriculum Start Date:
            </label>
            <div className="flex items-center gap-2 mb-1">
              <input
                type="date"
                value={localSettings.startDate}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, startDate: e.target.value })
                }
                className="flex-1 p-1.5 rounded border border-zinc-800 bg-zinc-900 text-white font-mono focus:outline-none focus:border-zinc-500"
              />
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, startDate: '2026-09-26' })}
                className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800"
              >
                26 Sept (Day 1)
              </button>
            </div>
          </div>

          {/* Booked Exam Date */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Booked Exam Date:
            </label>
            <input
              type="date"
              value={localSettings.examDate}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, examDate: e.target.value })
              }
              className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-900 text-white font-mono focus:outline-none focus:border-zinc-500"
            />
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
              Default is Nov 16, 2026 (November window: Nov 11–17, 2026)
            </span>
          </div>

          {/* Study Hours Pacing */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Weekday Hours / Day:
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={localSettings.weekdayHours}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    weekdayHours: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-900 text-white font-mono text-center focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Weekend Hours / Day:
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="18"
                value={localSettings.weekendHours}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    weekendHours: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-900 text-white font-mono text-center focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Target Study Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Target Hours Benchmark:
              </label>
              <input
                type="number"
                step="10"
                min="100"
                max="600"
                value={localSettings.targetStudyHours}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    targetStudyHours: parseInt(e.target.value, 10) || 300,
                  })
                }
                className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-900 text-white font-mono text-center focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 font-mono">CFAI target: 300h</span>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Daily Ethics Drill:
              </label>
              <input
                type="number"
                step="5"
                min="10"
                max="60"
                value={localSettings.dailyEthicsMinutes}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    dailyEthicsMinutes: parseInt(e.target.value, 10) || 20,
                  })
                }
                className="w-full p-1.5 rounded border border-zinc-800 bg-zinc-900 text-white font-mono text-center focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 font-mono">Minutes per day</span>
            </div>
          </div>

          {/* Backup & Export Options */}
          <div className="pt-2.5 border-t border-zinc-900 space-y-2">
            <label className="block font-semibold text-zinc-300">
              Full Data Backup & GitHub Deploy Restore:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Restore Backup (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset All */}
          <div className="pt-2 border-t border-zinc-900 flex justify-between items-center">
            <button
              type="button"
              onClick={onResetAll}
              className="text-zinc-500 hover:text-red-400 flex items-center gap-1 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Progress</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{savedSuccess ? 'Saved' : 'Save Parameters'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
