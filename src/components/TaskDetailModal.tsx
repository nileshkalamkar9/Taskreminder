import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Clock, 
  Tag, 
  Flame, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles,
  Activity,
  Layers,
  Radio
} from 'lucide-react';
import { Task, PriorityLevel } from '../types';
import { speakText, stopSpeech } from '../services/speechService';
import { soundFx } from '../services/soundEffects';
import { AcousticWaveform } from './AcousticWaveform';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [newSubtask, setNewSubtask] = useState<string>('');

  if (!task) return null;

  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    soundFx.playCommandParsed();
    const memo = task.voiceNoteSnippet || `${task.title}. Priority ${task.priority}. Due ${task.dueTime}.`;
    speakText(memo, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleToggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
    soundFx.playCommandParsed();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const added = {
      id: `sub-${Date.now()}`,
      text: newSubtask.trim(),
      completed: false,
    };
    onUpdateTask({ ...task, subtasks: [...task.subtasks, added] });
    setNewSubtask('');
    soundFx.playCommandParsed();
  };

  const handleChangePriority = (p: PriorityLevel) => {
    onUpdateTask({ ...task, priority: p });
    soundFx.playCommandParsed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg h-full bg-[#0F172A] border-l border-[#334155]/60 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#334155]/40 flex items-center justify-between bg-[#090D16]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono text-[#8D90A0] uppercase tracking-wider">
              TASK SPECIFICATION #{task.id.slice(-6)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8D90A0] hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* Status & Priority */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {(['urgent', 'medium', 'normal'] as PriorityLevel[]).map((p) => {
                const isSelected = task.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => handleChangePriority(p)}
                    className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider border transition-all ${
                      isSelected
                        ? p === 'urgent'
                          ? 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]'
                          : p === 'medium'
                          ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]'
                          : 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]'
                        : 'bg-[#181B25] text-[#8D90A0] border-[#334155]/60 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 rounded border border-[#34D399]/30">
              STATUS: {task.completed ? 'COMPLETED' : 'IN EXECUTION'}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {task.title}
            </h1>
            {task.description && (
              <p className="mt-2 text-sm text-[#C3C6D7] font-sans leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Acoustic Source Memo Card */}
          <div className="p-4 rounded-xl bg-[#090D16] border border-[#334155]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Acoustic Voice Memo
              </span>
              {task.voiceDuration && (
                <span className="text-xs font-mono text-[#8D90A0]">
                  Length: {task.voiceDuration}
                </span>
              )}
            </div>

            {task.voiceNoteSnippet ? (
              <p className="text-xs font-mono text-[#DFE2EF] italic bg-[#181B25] p-2.5 rounded border border-[#334155]/40">
                "{task.voiceNoteSnippet}"
              </p>
            ) : (
              <p className="text-xs font-mono text-[#8D90A0]">
                Synthesized brief ready for playback.
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePlayAudio}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${
                  isPlayingAudio
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]'
                    : 'bg-[#1E293B] text-white border-[#334155] hover:border-[#38BDF8]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{isPlayingAudio ? 'Speaking Briefing...' : 'Play Vocal Readout'}</span>
              </button>

              <AcousticWaveform barCount={16} isActive={isPlayingAudio} height={16} variant="compact" />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#181B25] border border-[#334155]/30">
              <span className="text-[#8D90A0] block text-[10px] uppercase">Execution Window</span>
              <span className="text-white font-semibold mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                {task.dueTime}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#181B25] border border-[#334155]/30">
              <span className="text-[#8D90A0] block text-[10px] uppercase">Target Domain</span>
              <span className="text-white font-semibold mt-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#34D399]" />
                {task.project}
              </span>
            </div>
          </div>

          {/* Subtasks breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#8D90A0]">
              <span className="uppercase tracking-wider">Subtask Breakdown Steps</span>
              <span>
                {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {task.subtasks.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleToggleSubtask(s.id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#181B25] border border-[#334155]/30 hover:border-[#38BDF8]/40 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      s.completed
                        ? 'bg-[#34D399] border-[#34D399] text-[#002114]'
                        : 'border-[#434655]'
                    }`}
                  >
                    {s.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs font-mono flex-1 ${
                      s.completed ? 'line-through text-[#8D90A0]' : 'text-white'
                    }`}
                  >
                    {s.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add step form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add execution step..."
                className="flex-1 px-3 py-2 text-xs font-mono bg-[#090D16] border border-[#334155] rounded-md text-white focus:outline-none focus:border-[#2563EB]"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-mono bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-md flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 border-t border-[#334155]/40 flex items-center justify-between bg-[#090D16]">
          <button
            onClick={() => {
              onDeleteTask(task.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Task</span>
          </button>

          <button
            onClick={() => {
              onUpdateTask({ ...task, completed: !task.completed });
              if (!task.completed) soundFx.playTaskCompleted();
              onClose();
            }}
            className={`px-4 py-2 rounded-md text-xs font-mono font-semibold transition-all ${
              task.completed
                ? 'bg-[#1E293B] text-[#DFE2EF] hover:bg-[#334155]'
                : 'bg-[#34D399] hover:bg-[#2bc48f] text-[#002114] shadow-[0_0_15px_rgba(52,211,153,0.4)]'
            }`}
          >
            {task.completed ? 'Mark As Incomplete' : 'Mark As Completed'}
          </button>
        </div>
      </div>
    </div>
  );
};
