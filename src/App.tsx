import React, { useState, useMemo } from 'react';
import { useStudyPlanner } from './hooks/useStudyPlanner';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { DayByDayPlanner } from './components/DayByDayPlanner';
import { ModuleChecklist } from './components/ModuleChecklist';
import { MockExamSimulator } from './components/MockExamSimulator';
import { ErrorLogView } from './components/ErrorLogView';
import { EthicsAndPSMHub } from './components/EthicsAndPSMHub';
import { FormulaCalculatorGuide } from './components/FormulaCalculatorGuide';
import { SettingsModal } from './components/SettingsModal';
import { ActivityHistoryModal } from './components/ActivityHistoryModal';
import { TopicId, ErrorCategory } from './types';
import { ALL_MODULES } from './data/cfaData';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const {
    settings,
    updateSettings,
    moduleProgress,
    updateModuleProgress,
    bulkUpdateModules,
    daySchedule,
    updateDaySchedule,
    hourlyBlocks,
    toggleHourlyBlock,
    activityHistory,
    clearActivityHistory,
    errorLogs,
    addErrorLog,
    updateErrorLog,
    deleteErrorLog,
    mockExams,
    updateMockExam,
    stats,
    resetAllData,
    exportBackupJSON,
    importBackupJSON,
  } = useStudyPlanner();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [initialTopicFilter, setInitialTopicFilter] = useState<TopicId | undefined>(undefined);

  // Quick Add Error Modal State
  const [quickErrorModalModuleId, setQuickErrorModalModuleId] = useState<number | null>(null);
  const [quickErrorCategory, setQuickErrorCategory] = useState<ErrorCategory>('Concept misunderstood');
  const [quickErrorSource, setQuickErrorSource] = useState('');
  const [quickErrorDesc, setQuickErrorDesc] = useState('');
  const [quickErrorConcept, setQuickErrorConcept] = useState('');

  // Find today's schedule item - aligns with user's starting point: Sunday Sep 27, 2026 (1:00 AM)
  const todayStr = settings.currentSimulatedDate || '2026-09-27';
  const todaySchedule = useMemo(() => {
    return daySchedule.find((d) => d.date === todayStr) || daySchedule[1] || daySchedule[0];
  }, [daySchedule, todayStr]);

  const handleNavigateTab = (tab: string, filterTopic?: TopicId) => {
    if (filterTopic) {
      setInitialTopicFilter(filterTopic);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToChecklist = (moduleId: number) => {
    const mod = ALL_MODULES.find((m) => m.id === moduleId);
    if (mod) {
      setInitialTopicFilter(mod.topicId);
    }
    setActiveTab('checklist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddErrorModal = (moduleId?: number) => {
    setQuickErrorModalModuleId(moduleId || 1);
    setQuickErrorSource(moduleId ? `Module ${moduleId} Practice` : 'Mock Exam Practice');
    setQuickErrorDesc('');
    setQuickErrorConcept('');
  };

  const handleSubmitQuickError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickErrorDesc.trim() || !quickErrorConcept.trim() || quickErrorModalModuleId == null) {
      alert('Please provide both the error description and the key concept.');
      return;
    }
    const mod = ALL_MODULES.find((m) => m.id === quickErrorModalModuleId);
    addErrorLog({
      moduleId: quickErrorModalModuleId,
      topicId: mod ? mod.topicId : 'quant',
      questionSource: quickErrorSource.trim() || `Module ${quickErrorModalModuleId} Practice`,
      category: quickErrorCategory,
      description: quickErrorDesc.trim(),
      correctConcept: quickErrorConcept.trim(),
      resolved: false,
    });
    setQuickErrorModalModuleId(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Sleek Top Header with Live Real-time Countdown & Modern Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        daysRemaining={stats.daysRemaining}
        totalModules={stats.totalModules}
        completedModules={stats.completedModules}
        percentComplete={stats.percentComplete}
        totalHoursLogged={stats.totalHoursLogged}
        targetHours={stats.targetStudyHours}
        examDate={settings.examDate}
        startDate={settings.startDate}
        currentSimulatedDate={settings.currentSimulatedDate}
        currentSimulatedTime={settings.currentSimulatedTime}
        moduleProgress={moduleProgress}
        pendingErrorsCount={stats.pendingErrorsCount}
        activityCount={activityHistory.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAddError={() => handleOpenAddErrorModal()}
      />

      {/* Main Content View Container - Pure Dedicated Page for each tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 sm:py-7">
        {/* Page 1: Command Center & Today's Plan */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            todaySchedule={todaySchedule}
            daySchedule={daySchedule}
            hourlyBlocks={hourlyBlocks}
            onToggleHourlyBlock={toggleHourlyBlock}
            currentSimulatedDate={settings.currentSimulatedDate}
            currentSimulatedTime={settings.currentSimulatedTime}
            examDate={settings.examDate}
            moduleProgress={moduleProgress}
            onNavigateTab={handleNavigateTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectDay={(dateStr) => {
              setActiveTab('calendar');
              setTimeout(() => {
                const el = document.getElementById(`day-${dateStr}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
          />
        )}

        {/* Page 2: Day-by-Day Schedule Calendar */}
        {activeTab === 'calendar' && (
          <DayByDayPlanner
            daySchedule={daySchedule}
            moduleProgress={moduleProgress}
            currentSimulatedDate={settings.currentSimulatedDate}
            onUpdateDay={updateDaySchedule}
            onUpdateModule={updateModuleProgress}
            onNavigateToChecklist={handleNavigateToChecklist}
          />
        )}

        {/* Page 3: 93-Module Curriculum Matrix (Spreadsheet) */}
        {activeTab === 'checklist' && (
          <ModuleChecklist
            moduleProgress={moduleProgress}
            onUpdateModule={updateModuleProgress}
            onBulkUpdate={bulkUpdateModules}
            onOpenAddError={handleOpenAddErrorModal}
            initialTopicFilter={initialTopicFilter}
          />
        )}

        {/* Page 4: Timed Mock Exam Simulator (180 Questions) */}
        {activeTab === 'mocks' && (
          <MockExamSimulator
            mockExams={mockExams}
            onUpdateMock={updateMockExam}
            onOpenAddError={handleOpenAddErrorModal}
          />
        )}

        {/* Page 5: Diagnostic Error Log (4 Root Causes) */}
        {activeTab === 'errors' && (
          <ErrorLogView
            errorLogs={errorLogs}
            onAddError={addErrorLog}
            onUpdateError={updateErrorLog}
            onDeleteError={deleteErrorLog}
          />
        )}

        {/* Page 6: Daily Ethics Hub (Standards I-VII & 15m daily drills) */}
        {activeTab === 'ethics' && (
          <EthicsAndPSMHub
            examDate={settings.examDate}
          />
        )}

        {/* Page 7: Formulas & Financial Calculator Guide */}
        {activeTab === 'formulas' && <FormulaCalculatorGuide />}
      </main>

      {/* Activity History Modal (Audit Trail of all marked items) */}
      <ActivityHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activityHistory={activityHistory}
        onClearHistory={clearActivityHistory}
      />

      {/* Quick Add Error Modal */}
      {quickErrorModalModuleId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <span>Log Missed Question Diagnostic</span>
              </h3>
              <button
                onClick={() => setQuickErrorModalModuleId(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuickError} className="space-y-3">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Module:</label>
                <select
                  value={quickErrorModalModuleId}
                  onChange={(e) => setQuickErrorModalModuleId(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                >
                  {ALL_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.id}: {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Root Cause Category:</label>
                <select
                  value={quickErrorCategory}
                  onChange={(e) => setQuickErrorCategory(e.target.value as ErrorCategory)}
                  className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                >
                  <option value="Concept misunderstood">Concept misunderstood</option>
                  <option value="Formula forgotten">Formula forgotten</option>
                  <option value="Calculator mistake">Calculator mistake</option>
                  <option value="Question misread">Question misread</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Question Source:</label>
                <input
                  type="text"
                  value={quickErrorSource}
                  onChange={(e) => setQuickErrorSource(e.target.value)}
                  placeholder="e.g. LES Q#12 or Mock 1 AM #4"
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">What went wrong?</label>
                <textarea
                  rows={2}
                  value={quickErrorDesc}
                  onChange={(e) => setQuickErrorDesc(e.target.value)}
                  placeholder="Describe your reasoning error..."
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Correct rule / Takeaway:</label>
                <textarea
                  rows={2}
                  value={quickErrorConcept}
                  onChange={(e) => setQuickErrorConcept(e.target.value)}
                  placeholder="Formula or concept to avoid repeating this mistake..."
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-zinc-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickErrorModalModuleId(null)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold"
                >
                  Save Error Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Planner Parameters / Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onExportBackup={exportBackupJSON}
        onImportBackup={importBackupJSON}
        onResetAll={resetAllData}
      />

      {/* Minimalist Professional Footer */}
      <footer className="border-t border-zinc-900 bg-black py-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 font-mono">
          <p>
            CFA® Level I 2026 Intensive Catch-Up Planner • November 2026 Exam Window (11–17 Nov 2026)
          </p>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Local State Auto-Saved</span>
            <span>•</span>
            <span className="text-zinc-200">GitHub Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
