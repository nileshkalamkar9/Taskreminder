import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Volume2, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Tag, 
  Flame, 
  AlertCircle,
  Sparkles,
  Edit2
} from 'lucide-react';
import { Task, PriorityLevel } from '../types';
import { soundFx } from '../services/soundEffects';
import { speakText, stopSpeech } from '../services/speechService';
import { AcousticWaveform } from './AcousticWaveform';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onSelectTask?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onUpdateSubtask,
  onAddSubtask,
  onSelectTask,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [newSubtaskText, setNewSubtaskText] = useState<string>('');
  const [showAddSubtask, setShowAddSubtask] = useState<boolean>(false);

  // Priority Left Border Accent
  const priorityBorderClass = {
    urgent: 'border-l-[3px] border-l-[#F87171]',
    medium: 'border-l-[3px] border-l-[#FBBF24]',
    normal: 'border-l-[3px] border-l-[#475569]',
  }[task.priority];

  // Priority badge styling
  const priorityBadge = {
    urgent: {
      text: 'URGENT',
      classes: 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30',
      icon: <Flame className="w-2.5 h-2.5 text-[#F87171]" />,
    },
    medium: {
      text: 'MEDIUM',
      classes: 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30',
      icon: <AlertCircle className="w-2.5 h-2.5 text-[#FBBF24]" />,
    },
    normal: {
      text: 'NORMAL',
      classes: 'bg-[#475569]/20 text-[#8D90A0] border border-[#475569]/30',
      icon: null,
    },
  }[task.priority];

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      soundFx.playTaskCompleted();
    }
    onToggleComplete(task.id);
  };

  const handlePlayAudioMemo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    soundFx.playCommandParsed();
    const memoContent = task.voiceNoteSnippet || `${task.title}. Priority ${task.priority}. Due ${task.dueTime}.`;
    speakText(memoContent, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    onAddSubtask(task.id, newSubtaskText.trim());
    setNewSubtaskText('');
    soundFx.playCommandParsed();
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div
      className={`group rounded-lg bg-[#0F172A] border border-[#334155]/30 hover:border-[#38BDF8]/40 transition-all duration-200 overflow-hidden ${priorityBorderClass} ${
        task.completed ? 'opacity-60 bg-[#0F172A]/70' : 'hover:shadow-[0_4px_20px_rgba(15,23,42,0.8)]'
      }`}
    >
      {/* Main Task Row */}
      <div
        onClick={() => onSelectTask && onSelectTask(task)}
        className="p-3 sm:px-4 sm:py-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Checkbox */}
          <button
            onClick={handleCheckboxClick}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            className={`mt-0.5 sm:mt-0 flex-shrink-0 w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${
              task.completed
                ? 'bg-[#34D399] border-[#34D399] text-[#002114] shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                : 'bg-[#181B25] border-[#434655] hover:border-[#38BDF8] text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Title and metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-sans text-sm sm:text-base font-normal sm:font-medium tracking-tight break-words ${
                  task.completed ? 'line-through text-[#8D90A0]' : 'text-[#DFE2EF]'
                }`}
              >
                {task.title}
              </span>

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold ${priorityBadge.classes}`}
              >
                {priorityBadge.icon}
                {priorityBadge.text}
              </span>

              {/* Project Tag */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E293B] text-[#7BD0FF] border border-[#38BDF8]/20">
                <Tag className="w-2.5 h-2.5 text-[#38BDF8]" />
                {task.project}
              </span>
            </div>

            {/* Second row metadata */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8D90A0] font-mono flex-wrap">
              {/* Due time */}
              <span className="flex items-center gap-1 text-[#C3C6D7]">
                <Clock className="w-3 h-3 text-[#38BDF8]" />
                {task.dueTime}
              </span>

              {/* Voice Memo badge & Play button */}
              {task.voiceDuration && (
                <button
                  onClick={handlePlayAudioMemo}
                  title="Play vocal memo"
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] transition-all border ${
                    isPlayingAudio
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8] animate-pulse'
                      : 'bg-[#181B25] text-[#7BD0FF] border-[#334155]/60 hover:border-[#38BDF8]/60'
                  }`}
                >
                  <Volume2 className="w-3 h-3 text-[#38BDF8]" />
                  <span>{isPlayingAudio ? 'Playing...' : task.voiceDuration}</span>
                  {isPlayingAudio && <AcousticWaveform barCount={8} isActive={true} height={12} variant="compact" />}
                </button>
              )}

              {/* Subtask count */}
              {task.subtasks.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex items-center gap-1 hover:text-[#38BDF8] transition-colors"
                >
                  <span>
                    {completedSubtasks}/{task.subtasks.length} subtasks
                  </span>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              )}

              {/* Pipeline State Dot */}
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#8D90A0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                {task.pipelineStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {task.voiceNoteSnippet && !task.voiceDuration && (
            <button
              onClick={handlePlayAudioMemo}
              title="Listen to synthesized note"
              className="p-1.5 rounded hover:bg-[#1E293B] text-[#8D90A0] hover:text-[#38BDF8] transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title="Toggle subtasks & breakdown"
            className="p-1.5 rounded hover:bg-[#1E293B] text-[#8D90A0] hover:text-[#DFE2EF] transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete task"
            className="p-1.5 rounded hover:bg-[#1E293B] text-[#8D90A0] hover:text-[#F87171] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Subtasks & Voice Note Section */}
      {isExpanded && (
        <div className="px-4 pb-3.5 pt-1 border-t border-[#334155]/30 bg-[#0A0E17]/60">
          {/* Voice transcript snippet if available */}
          {task.voiceNoteSnippet && (
            <div className="mb-3 p-2.5 rounded bg-[#181B25] border border-[#334155]/40 text-xs font-mono">
              <div className="flex items-center justify-between text-[#8D90A0] mb-1">
                <span className="flex items-center gap-1.5 text-[10px] uppercase text-[#38BDF8]">
                  <Sparkles className="w-3 h-3" />
                  Acoustic Stream Source
                </span>
                <span className="text-[10px] text-[#34D399]">
                  {Math.round((task.acousticConfidence || 0.95) * 100)}% Match
                </span>
              </div>
              <p className="text-[#C3C6D7] italic">"{task.voiceNoteSnippet}"</p>
            </div>
          )}

          {/* Subtask items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8D90A0] font-mono mb-2">
              <span>EXECUTION SUB-STEPS</span>
              <button
                onClick={() => setShowAddSubtask(!showAddSubtask)}
                className="text-[#38BDF8] hover:text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Step</span>
              </button>
            </div>

            {task.subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-[#181B25]/80 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={(e) => onUpdateSubtask(task.id, sub.id, e.target.checked)}
                  className="rounded bg-[#090D16] border-[#334155] text-[#2563EB] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span
                  className={`text-xs font-mono ${
                    sub.completed ? 'line-through text-[#8D90A0]' : 'text-[#DFE2EF]'
                  }`}
                >
                  {sub.text}
                </span>
              </div>
            ))}

            {/* Add Subtask Input */}
            {showAddSubtask && (
              <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 mt-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Enter sub-step..."
                  autoFocus
                  className="flex-1 px-2.5 py-1 text-xs font-mono bg-[#090D16] border border-[#334155] rounded text-white focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-mono bg-[#2563EB] text-white rounded hover:bg-[#1d4ed8]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubtask(false)}
                  className="px-2 py-1 text-xs font-mono text-[#8D90A0] hover:text-white"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
