import React from 'react';
import { 
  Layers, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Flame, 
  ArrowRight,
  FolderKanban
} from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from '../components/TaskItem';

interface PipelinesScreenProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateForProject: (project: string) => void;
}

export const PipelinesScreen: React.FC<PipelinesScreenProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onUpdateSubtask,
  onAddSubtask,
  onSelectTask,
  onOpenCreateForProject,
}) => {
  const projectPipelines = [
    {
      id: 'Acoustic Engine',
      title: 'Acoustic Engine & DSP',
      description: 'Web Audio FFT, speech recognition filters, spectral telemetry',
      color: '#38BDF8',
      accentBg: 'border-[#38BDF8]/40',
    },
    {
      id: 'Core Pipeline',
      title: 'Core Protocol & Orchestration',
      description: 'Voice command intent parsing, agenda scheduling & states',
      color: '#2563EB',
      accentBg: 'border-[#2563EB]/40',
    },
    {
      id: 'Client Interface',
      title: 'Client UI & Control Surface',
      description: 'Responsive Grotesk typography, glass panels, tactile sound',
      color: '#34D399',
      accentBg: 'border-[#34D399]/40',
    },
    {
      id: 'Telemetry Stream',
      title: 'Telemetry & Signal Analysis',
      description: 'Confidence ratings, decibel SPL history, command logs',
      color: '#FBBF24',
      accentBg: 'border-[#FBBF24]/40',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155]/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#7BD0FF] uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4 text-[#38BDF8]" />
            <span>Multi-Domain Execution Matrix</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Pipelines & Project Domains
          </h1>
          <p className="text-sm text-[#8D90A0] mt-1">
            Tasks organized by functional technical domain with individual velocity and audio memos.
          </p>
        </div>
      </div>

      {/* Pipelines Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projectPipelines.map((pipeline) => {
          const projectTasks = tasks.filter((t) => t.project === pipeline.id || (!t.project && pipeline.id === 'Core Pipeline'));
          const completedCount = projectTasks.filter((t) => t.completed).length;
          const percent = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

          return (
            <div
              key={pipeline.id}
              className={`rounded-xl bg-[#0F172A] border border-[#334155]/50 flex flex-col shadow-sm overflow-hidden`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-[#334155]/40 bg-[#090D16]">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color: pipeline.color, backgroundColor: `${pipeline.color}15` }}
                  >
                    {pipeline.id}
                  </span>
                  <button
                    onClick={() => onOpenCreateForProject(pipeline.id)}
                    className="p-1 rounded text-[#8D90A0] hover:text-white hover:bg-[#1E293B] transition-colors"
                    title={`Add task to ${pipeline.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display text-sm font-semibold text-white">
                  {pipeline.title}
                </h3>
                <p className="text-[11px] text-[#8D90A0] line-clamp-1 mt-0.5">
                  {pipeline.description}
                </p>

                {/* Progress bar */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#8D90A0] mb-1">
                  <span>Progress</span>
                  <span className="text-white font-bold">{percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: pipeline.color }}
                  />
                </div>
              </div>

              {/* Tasks List inside column */}
              <div className="p-3 space-y-2 flex-1 min-h-[220px] overflow-y-auto max-h-[500px]">
                {projectTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#334155]/40 rounded-lg">
                    <p className="text-xs font-mono text-[#8D90A0]">No tasks queued</p>
                    <button
                      onClick={() => onOpenCreateForProject(pipeline.id)}
                      className="mt-2 text-xs font-mono text-[#38BDF8] hover:underline"
                    >
                      + Add Task
                    </button>
                  </div>
                ) : (
                  projectTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onUpdateSubtask={onUpdateSubtask}
                      onAddSubtask={onAddSubtask}
                      onSelectTask={onSelectTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
