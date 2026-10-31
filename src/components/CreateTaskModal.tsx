import React, { useState } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Clock, 
  Tag, 
  Flame, 
  Calendar, 
  Plus, 
  Check, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { PriorityLevel, Task } from '../types';
import { soundFx } from '../services/soundEffects';
import { AcousticWaveform } from './AcousticWaveform';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: Partial<Task>) => void;
  isDictating?: boolean;
  onToggleDictation?: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  isDictating = false,
  onToggleDictation,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [project, setProject] = useState<string>('Core Pipeline');
  const [dueTime, setDueTime] = useState<string>('Today, 17:00');
  const [isToday, setIsToday] = useState<boolean>(true);
  const [subtasksText, setSubtasksText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const subtasks = subtasksText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        text,
        completed: false,
      }));

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      project,
      dueTime,
      isToday,
      subtasks,
      pipelineStatus: 'SYNCED',
      createdAt: new Date().toISOString(),
    });

    soundFx.playCommandParsed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-xl bg-[#0F172A] border border-[#334155]/60 shadow-[0_0_32px_-4px_rgba(37,99,235,0.3)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#334155]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="font-display text-lg font-semibold text-white tracking-wide">
              Create New Task Unit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8D90A0] hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title Input with integrated right-aligned audio waveform toggle */}
          <div>
            <label className="block text-xs font-mono text-[#8D90A0] uppercase mb-1.5 tracking-wider">
              Task Command & Title *
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calibrate FFT filter response for voice stream"
                className="w-full px-3.5 py-2.5 pr-24 rounded-md text-sm font-sans bg-[#090D16] border border-[#334155] text-white placeholder-[#8D90A0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all"
              />

              {/* Right-aligned integrated audio waveform toggle button */}
              {onToggleDictation && (
                <button
                  type="button"
                  onClick={onToggleDictation}
                  title={isDictating ? 'Stop dictation' : 'Voice speech-to-text dictation'}
                  className={`absolute right-1.5 px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all text-xs font-mono border ${
                    isDictating
                      ? 'bg-[#2563EB] text-white border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                      : 'bg-[#181B25] text-[#7BD0FF] border-[#334155]/60 hover:border-[#38BDF8]'
                  }`}
                >
                  <AcousticWaveform barCount={6} isActive={isDictating} height={12} variant="compact" />
                  <Mic className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-[#8D90A0] uppercase mb-1.5 tracking-wider">
              Specification / Technical Brief
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational details, expected parameters or reference issue..."
              className="w-full px-3.5 py-2 rounded-md text-xs font-sans bg-[#090D16] border border-[#334155] text-[#DFE2EF] placeholder-[#8D90A0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all resize-none"
            />
          </div>

          {/* Priority & Pipeline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-mono text-[#8D90A0] uppercase mb-1.5 tracking-wider">
                Priority Tier
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['urgent', 'medium', 'normal'] as PriorityLevel[]).map((p) => {
                  const isSelected = priority === p;
                  const borderColors = {
                    urgent: isSelected ? 'border-[#F87171] bg-[#F87171]/20 text-[#F87171]' : 'border-[#334155] text-[#8D90A0]',
                    medium: isSelected ? 'border-[#FBBF24] bg-[#FBBF24]/20 text-[#FBBF24]' : 'border-[#334155] text-[#8D90A0]',
                    normal: isSelected ? 'border-[#38BDF8] bg-[#38BDF8]/20 text-[#38BDF8]' : 'border-[#334155] text-[#8D90A0]',
                  }[p];

                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-2 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition-all text-center ${borderColors}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Project */}
            <div>
              <label className="block text-xs font-mono text-[#8D90A0] uppercase mb-1.5 tracking-wider">
                Project Domain
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-xs font-mono bg-[#090D16] border border-[#334155] text-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Acoustic Engine">Acoustic Engine</option>
                <option value="Core Pipeline">Core Pipeline</option>
                <option value="Client Interface">Client Interface</option>
                <option value="Telemetry Stream">Telemetry Stream</option>
                <option value="DSP Protocol">DSP Protocol</option>
              </select>
            </div>
          </div>

          {/* Due Time & Today checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono text-[#8D90A0] uppercase mb-1.5 tracking-wider">
                Due Execution Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  placeholder="e.g. Today, 17:00"
                  className="w-full px-3 py-2 rounded-md text-xs font-mono bg-[#090D16] border border-[#334155] text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-[#DFE2EF]">
                <input
                  type="checkbox"
                  checked={isToday}
                  onChange={(e) => setIsToday(e.target.checked)}
                  className="rounded bg-[#090D16] border-[#334155] text-[#2563EB] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Include in "Today's Tasks" Agenda</span>
              </label>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-mono text-[#8D90A0] uppercase mb-1.5 tracking-wider">
              Execution Sub-Steps (One per line)
            </label>
            <textarea
              rows={2}
              value={subtasksText}
              onChange={(e) => setSubtasksText(e.target.value)}
              placeholder="Step 1: Check microphone input frequency&#10;Step 2: Run latency benchmark..."
              className="w-full px-3.5 py-2 rounded-md text-xs font-mono bg-[#090D16] border border-[#334155] text-[#DFE2EF] placeholder-[#8D90A0] focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#334155]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-mono text-[#8D90A0] hover:text-white hover:bg-[#1E293B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-xs font-mono font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-[0_0_16px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Queue Task Unit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
