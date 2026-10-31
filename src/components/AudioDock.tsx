import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Plus, 
  Radio, 
  Sparkles, 
  Command, 
  Check, 
  ChevronUp, 
  HelpCircle,
  Keyboard,
  Send
} from 'lucide-react';
import { PipelineStatus } from '../types';
import { AcousticWaveform } from './AcousticWaveform';

interface AudioDockProps {
  isListening: boolean;
  onToggleListening: () => void;
  pipelineStatus: PipelineStatus;
  liveTranscript: string;
  onQuickTextSubmit: (text: string) => void;
  onOpenCreateModal: () => void;
  onOpenHelpModal: () => void;
  frequencyData?: number[];
  decibels?: number;
}

export const AudioDock: React.FC<AudioDockProps> = ({
  isListening,
  onToggleListening,
  pipelineStatus,
  liveTranscript,
  onQuickTextSubmit,
  onOpenCreateModal,
  onOpenHelpModal,
  frequencyData,
  decibels = 0,
}) => {
  const [quickInput, setQuickInput] = useState<string>('');
  const [showKeyboardInput, setShowKeyboardInput] = useState<boolean>(false);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickTextSubmit(quickInput.trim());
    setQuickInput('');
    setShowKeyboardInput(false);
  };

  const statusDotColors: Record<PipelineStatus, string> = {
    LISTENING: 'bg-[#38BDF8] animate-ping',
    PARSING: 'bg-[#FBBF24] animate-pulse',
    QUEUED: 'bg-[#2563EB]',
    SYNCED: 'bg-[#34D399]',
  };

  const statusBadgeColors: Record<PipelineStatus, string> = {
    LISTENING: 'text-[#38BDF8] border-[#38BDF8]/40 bg-[#38BDF8]/10',
    PARSING: 'text-[#FBBF24] border-[#FBBF24]/40 bg-[#FBBF24]/10',
    QUEUED: 'text-[#7BD0FF] border-[#2563EB]/40 bg-[#2563EB]/10',
    SYNCED: 'text-[#34D399] border-[#34D399]/40 bg-[#34D399]/10',
  };

  return (
    <aside aria-label="Acoustic Voice Command Dock" className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-3 sm:pb-4 pointer-events-auto">
        {/* Live Streaming Audio / Transcript Floating Bar */}
        {(isListening || liveTranscript) && (
          <div className="mb-2.5 p-3 rounded-lg bg-[#0F172A]/95 backdrop-blur-xl border border-[#38BDF8]/40 shadow-[0_0_32px_-4px_rgba(37,99,235,0.35)] transition-all animate-fadeIn">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#334155]/40 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                <span className="text-[#38BDF8] font-bold tracking-wider uppercase">
                  {isListening ? 'STREAMING REAL-TIME ACOUSTICS' : 'ACOUSTIC BUFFER CAPTURED'}
                </span>
                {decibels > 0 && (
                  <span className="text-[#8D90A0]">
                    [{decibels} dB SPL]
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8D90A0]">WAVEFORM FFT</span>
                <AcousticWaveform barCount={16} isActive={isListening} height={14} variant="compact" />
              </div>
            </div>

            {/* Live Streaming Transcription Text with Cyan Terminal Blinking Cursor */}
            <div className="min-h-[28px] flex items-center font-mono text-sm sm:text-base text-white">
              <span className="text-[#38BDF8] mr-2">&gt;</span>
              <span className="tracking-wide">
                {liveTranscript || (
                  <span className="text-[#8D90A0] italic">
                    Listening for task or command... (e.g., "Add task: calibrate DSP filter by 4pm urgent")
                  </span>
                )}
              </span>
              <span className="inline-block w-2 h-4 ml-1 bg-[#38BDF8] animate-terminal-blink align-middle" />
            </div>
          </div>
        )}

        {/* Manual Quick Inset Keyboard Input Bar (Toggleable) */}
        {showKeyboardInput && (
          <form
            onSubmit={handleInputSubmit}
            className="mb-2.5 p-2 rounded-lg bg-[#090D16] border border-[#2563EB] shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center gap-2"
          >
            <span className="text-[#38BDF8] font-mono pl-2 text-sm">&gt;</span>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Type task or voice command (e.g. 'Complete #2' or 'New task urgent...')"
              autoFocus
              className="flex-1 bg-transparent text-sm font-mono text-white placeholder-[#8D90A0] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Execute</span>
            </button>
            <button
              type="button"
              onClick={() => setShowKeyboardInput(false)}
              className="px-2 py-1.5 text-xs font-mono text-[#8D90A0] hover:text-white"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Primary Dock Hub Container */}
        <div className="rounded-xl bg-[#0F172A]/90 backdrop-blur-xl border border-[#334155]/40 px-3 sm:px-6 py-2.5 sm:py-3 shadow-[0_12px_28px_rgba(0,0,0,0.8),_0_0_24px_-4px_rgba(37,99,235,0.2)] flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Pipeline State Chip & Cheatsheet trigger */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded text-[11px] font-mono tracking-wider uppercase border transition-all ${statusBadgeColors[pipelineStatus]}`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusDotColors[pipelineStatus]}`} />
              </span>
              <span>{pipelineStatus}</span>
            </div>

            <button
              onClick={onOpenHelpModal}
              title="Voice Commands Help"
              className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#8D90A0] hover:text-[#38BDF8] px-2 py-1 rounded hover:bg-[#1E293B] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Voice Cheatsheet</span>
            </button>
          </div>

          {/* Center: Primary Voice Trigger Hub with 3-color radial stroke */}
          <div className="flex flex-col items-center">
            <button
              onClick={onToggleListening}
              title={isListening ? 'Tap to complete voice input' : 'Tap to start acoustic capture'}
              className={`relative group p-0.5 rounded-full transition-all duration-300 focus:outline-none ${
                isListening ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              {/* Live 3-color radial waveform stroke: #2563EB, #38BDF8, #34D399 */}
              <div
                className={`absolute -inset-1 rounded-full opacity-75 blur-sm transition duration-300 ${
                  isListening
                    ? 'bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#34D399] animate-spin'
                    : 'bg-gradient-to-r from-[#2563EB] to-[#38BDF8] group-hover:opacity-100 group-hover:blur-md'
                }`}
              />

              {/* Main Button Surface */}
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-gradient-to-br from-[#2563EB] to-[#0053db] text-white shadow-[0_0_32px_rgba(56,189,248,0.7)] animate-acoustic-pulse'
                    : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-[0_0_24px_rgba(37,99,235,0.45)]'
                }`}
              >
                {isListening ? (
                  <Mic className="w-6 h-6 text-[#bdffdc] animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                )}
              </div>
            </button>

            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8D90A0] mt-1 hidden sm:block">
              {isListening ? 'Listening (Tap to stop)' : 'Push to Talk'}
            </span>
          </div>

          {/* Right: Quick Manual Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowKeyboardInput(!showKeyboardInput)}
              title="Manual command entry"
              className={`p-2 rounded-lg text-xs font-mono border transition-all ${
                showKeyboardInput
                  ? 'bg-[#2563EB] text-white border-[#38BDF8]'
                  : 'bg-[#1E293B]/80 text-[#C3C6D7] hover:text-white border-[#334155]/60 hover:border-[#38BDF8]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCreateModal}
              title="Add task dialog"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold bg-[#1E293B]/90 hover:bg-[#2563EB]/25 text-[#38BDF8] hover:text-white border border-[#334155]/60 hover:border-[#38BDF8] transition-all"
            >
              <Plus className="w-4 h-4 text-[#34D399]" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
