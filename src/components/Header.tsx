import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  Calculator,
  Download,
  Settings,
  History,
  LayoutDashboard,
} from 'lucide-react';
import { exportChecklistToCSV, downloadCSV } from '../utils/scheduleGenerator';
import { ALL_MODULES } from '../data/cfaData';
import { ModuleProgress } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  daysRemaining: number;
  totalModules: number;
  completedModules: number;
  percentComplete: number;
  totalHoursLogged: number;
  targetHours: number;
  examDate: string;
  startDate: string;
  currentSimulatedDate?: string;
  currentSimulatedTime?: string;
  moduleProgress: Record<number, ModuleProgress>;
  pendingErrorsCount: number;
  activityCount: number;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenAddError: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  completedModules,
  percentComplete,
  totalHoursLogged,
  targetHours,
  examDate,
  currentSimulatedDate = '2026-09-27',
  currentSimulatedTime = '01:00',
  moduleProgress,
  pendingErrorsCount,
  activityCount,
  onOpenSettings,
  onOpenHistory,
}) => {
  // Live ticking countdown for the top bar
  const [secondsOffset, setSecondsOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsOffset((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulatedBase = new Date(`${currentSimulatedDate}T${currentSimulatedTime}:00`).getTime();
  const currentTs = simulatedBase + secondsOffset * 1000;
  const examTs = new Date(`${examDate}T08:00:00`).getTime();
  const diffMs = Math.max(0, examTs - currentTs);

  const cdDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const cdHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const cdMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const cdSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

  const handleExportCSV = () => {
    const csv = exportChecklistToCSV(ALL_MODULES, moduleProgress);
    downloadCSV(csv, `CFA_Level_1_Checklist_${examDate}.csv`);
  };

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'checklist', label: '93 Modules', icon: CheckSquare, badge: `${completedModules}/93` },
    { id: 'mocks', label: 'Timed Mocks', icon: Clock },
    {
      id: 'errors',
      label: 'Error Log',
      icon: AlertTriangle,
      badge: pendingErrorsCount > 0 ? `${pendingErrorsCount}` : undefined,
    },
    { id: 'ethics', label: 'Daily Ethics', icon: Award },
    { id: 'formulas', label: 'Formulas & Calc', icon: Calculator },
  ];

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 shadow-sm transition-all">
      {/* Top Bar: Minimalist Black & White ticker */}
      <div className="border-b border-zinc-800/80 bg-zinc-950 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Minimalist Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono font-medium text-white bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-sans">
                T-Minus
              </span>
              <span>
                {cdDays}d {String(cdHours).padStart(2, '0')}h {String(cdMins).padStart(2, '0')}m {String(cdSecs).padStart(2, '0')}s
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-zinc-400">
              <span className="text-zinc-700">•</span>
              <span>Today:</span>
              <span className="font-semibold text-zinc-200">
                Sun, Sep 27 (01:00 AM)
              </span>
              <span className="text-zinc-700">•</span>
              <span>Exam:</span>
              <span className="font-semibold text-zinc-200">Nov 16, 2026</span>
            </div>
          </div>

          {/* Right: History, Export, Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition-colors"
              title="View saved activity history"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>History</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                {activityCount}
              </span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-medium transition-colors"
              title="Download CSV for Excel or Google Sheets"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar: Clean Brand & Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-black font-black text-sm flex items-center justify-center tracking-tighter">
                L1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                    CFA Level I Planner
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    2026 Curriculum
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                  <span>{completedModules}/93 Reviewed ({percentComplete}%)</span>
                  <span>•</span>
                  <span>{totalHoursLogged}h / {targetHours}h Logged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist Monochrome Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isActive
                          ? 'bg-zinc-200 text-zinc-900 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
