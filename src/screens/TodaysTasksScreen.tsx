import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Radio, 
  Volume2, 
  Plus, 
  Mic, 
  AlertTriangle,
  Layers,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { Task, PriorityLevel, PipelineStatus } from '../types';
import { TaskItem } from '../components/TaskItem';
import { AcousticWaveform } from '../components/AcousticWaveform';
import { soundFx } from '../services/soundEffects';

interface TodaysTasksScreenProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateModal: () => void;
  onToggleVoiceCapture: () => void;
  isListening: boolean;
  liveTranscript: string;
  onRunVoiceExample: (cmd: string) => void;
}

export const TodaysTasksScreen: React.FC<TodaysTasksScreenProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onUpdateSubtask,
  onAddSubtask,
  onSelectTask,
  onOpenCreateModal,
  onToggleVoiceCapture,
  isListening,
  liveTranscript,
  onRunVoiceExample,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'created'>('priority');

  // Quick voice prompt recommendations
  const quickVoicePills = [
    'Add task: Calibrate FFT filter response by 4 PM urgent',
    'Add task: Review pull request #142 for telemetry',
    "Read today's tasks",
    'Complete task 1',
  ];

  // Distinct projects
  const projects = useMemo(() => {
    const list = Array.from(new Set(tasks.map((t) => t.project)));
    return list;
  }, [tasks]);

  // Filter and sort today's tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchProject = task.project.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchProject && !matchDesc) return false;
        }

        // Priority filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) {
          return false;
        }

        // Project filter
        if (filterProject !== 'all' && task.project !== filterProject) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Active tasks before completed
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        if (sortBy === 'priority') {
          const priorityWeight = { urgent: 3, medium: 2, normal: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === 'time') {
          return a.dueTime.localeCompare(b.dueTime);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, searchQuery, filterPriority, filterProject, sortBy]);

  // Breakdown today tasks vs completed
  const urgentTasks = filteredTasks.filter((t) => !t.completed && t.priority === 'urgent');
  const standardTasks = filteredTasks.filter((t) => !t.completed && t.priority !== 'urgent');
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      
      {/* Top Banner / Today's Acoustic Queue Overview */}
      <div className="relative rounded-xl p-5 sm:p-6 bg-gradient-to-r from-[#0F172A] via-[#181B25] to-[#0F172A] border border-[#334155]/40 shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Ambient spectral glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#38BDF8]">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="tracking-widest uppercase">DISCIPLINE: HIGH-VELOCITY ACOUSTIC DISPATCH</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Today's Action Tasks
            </h2>
            <p className="text-sm text-[#8D90A0] mt-1 max-w-xl">
              Real-time hands-free task execution. Speak commands, dictate specifications, and monitor spectral waveforms as speech compiles into structured sub-steps.
            </p>

            {/* Quick voice suggestion pills */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-[11px] font-mono text-[#8D90A0] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                Voice Quick-Triggers:
              </span>
              {quickVoicePills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => onRunVoiceExample(pill)}
                  className="px-2.5 py-1 rounded bg-[#090D16] hover:bg-[#1E293B] text-xs font-mono text-[#C3C6D7] hover:text-[#38BDF8] border border-[#334155]/60 hover:border-[#38BDF8]/60 transition-all flex items-center gap-1.5"
                >
                  <span className="text-[#38BDF8]">&gt;</span>
                  <span>{pill}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick Stats Matrix */}
          <div className="grid grid-cols-3 gap-3 bg-[#090D16]/90 p-3.5 rounded-lg border border-[#334155]/60">
            <div className="text-center px-3 py-1 border-r border-[#334155]/40">
              <span className="block text-[10px] font-mono uppercase text-[#8D90A0]">Active</span>
              <span className="font-display text-2xl font-bold text-white">
                {tasks.filter((t) => !t.completed).length}
              </span>
            </div>

            <div className="text-center px-3 py-1 border-r border-[#334155]/40">
              <span className="block text-[10px] font-mono uppercase text-[#F87171] flex items-center justify-center gap-1">
                <Flame className="w-2.5 h-2.5" />
                Urgent
              </span>
              <span className="font-display text-2xl font-bold text-[#F87171]">
                {tasks.filter((t) => !t.completed && t.priority === 'urgent').length}
              </span>
            </div>

            <div className="text-center px-3 py-1">
              <span className="block text-[10px] font-mono uppercase text-[#34D399]">Completed</span>
              <span className="font-display text-2xl font-bold text-[#34D399]">
                {tasks.filter((t) => t.completed).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Command Strip */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155]/40 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Deep obsidian inset search field with integrated waveform toggle */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D90A0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, project tags, or specifications..."
              className="w-full pl-10 pr-28 py-2.5 rounded-md text-xs sm:text-sm font-sans bg-[#090D16] border border-[#334155] text-white placeholder-[#8D90A0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all"
            />
            
            {/* Integrated waveform voice button right-aligned */}
            <button
              onClick={onToggleVoiceCapture}
              title={isListening ? 'Acoustic stream active' : 'Push voice command'}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-all border ${
                isListening
                  ? 'bg-[#2563EB] text-white border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'bg-[#181B25] text-[#7BD0FF] border-[#334155]/60 hover:border-[#38BDF8]'
              }`}
            >
              <AcousticWaveform barCount={6} isActive={isListening} height={12} variant="compact" />
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-[0_0_15px_rgba(37,99,235,0.35)] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task Unit</span>
          </button>
        </div>

        {/* Filter and sorting chips */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-xs font-mono">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#8D90A0] text-[11px] uppercase mr-1">Filter:</span>
            
            {(['all', 'urgent', 'medium', 'normal'] as const).map((p) => {
              const isSelected = filterPriority === p;
              return (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded text-xs uppercase tracking-wider transition-all border ${
                    isSelected
                      ? 'bg-[#2563EB] text-white border-[#38BDF8] font-semibold'
                      : 'bg-[#181B25] text-[#8D90A0] hover:text-white border-[#334155]/60'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Project dropdown */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-2.5 py-1 rounded text-xs uppercase bg-[#181B25] text-[#C3C6D7] border border-[#334155]/60 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Projects</option>
              {projects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By selector */}
          <div className="flex items-center gap-2">
            <span className="text-[#8D90A0] text-[11px] uppercase flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded text-xs bg-[#181B25] text-[#C3C6D7] border border-[#334155]/60 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="priority">Priority First</option>
              <option value="time">Execution Time</option>
              <option value="created">Recently Queued</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Groups */}

      {/* 1. Urgent / Critical Alert Tasks */}
      {urgentTasks.length > 0 && (
        <section aria-labelledby="urgent-tasks-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#F87171] font-bold">
              <Flame className="w-4 h-4 text-[#F87171]" />
              <h3 id="urgent-tasks-heading">High-Priority Alert Channel ({urgentTasks.length})</h3>
            </div>
            <span className="text-[11px] font-mono text-[#8D90A0]">
              Elevated DSP attention required
            </span>
          </div>

          <div className="space-y-2">
            {urgentTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onUpdateSubtask={onUpdateSubtask}
                onAddSubtask={onAddSubtask}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Standard Scheduled Today Tasks */}
      <section aria-labelledby="standard-tasks-heading" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#DFE2EF] font-bold">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <h3 id="standard-tasks-heading">Scheduled Agenda ({standardTasks.length})</h3>
          </div>
          <span className="text-[11px] font-mono text-[#8D90A0]">
            Continuous execution queue
          </span>
        </div>

        {standardTasks.length === 0 && urgentTasks.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0F172A] border border-[#334155]/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1E293B] flex items-center justify-center text-[#38BDF8]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-display text-base font-semibold text-white">
              No tasks currently active
            </h4>
            <p className="text-xs font-mono text-[#8D90A0] max-w-sm mx-auto">
              All scheduled tasks are completed or filtered out. Speak a command or press the mic to queue new tasks hands-free.
            </p>
            <button
              onClick={onOpenCreateModal}
              className="mt-2 px-4 py-2 rounded-md bg-[#2563EB] text-white text-xs font-mono font-semibold"
            >
              Add New Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {standardTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onUpdateSubtask={onUpdateSubtask}
                onAddSubtask={onAddSubtask}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Completed Today (Collapsible) */}
      {completedTasks.length > 0 && (
        <section aria-labelledby="completed-tasks-heading" className="space-y-2.5 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#34D399] font-bold hover:text-white transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <h3 id="completed-tasks-heading">Completed ({completedTasks.length})</h3>
              <span className="text-[11px] text-[#8D90A0]">
                {showCompleted ? '(Hide)' : '(Show)'}
              </span>
            </button>
            <span className="text-[11px] font-mono text-[#34D399]">
              Affirmative verification
            </span>
          </div>

          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onUpdateSubtask={onUpdateSubtask}
                  onAddSubtask={onAddSubtask}
                  onSelectTask={onSelectTask}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
