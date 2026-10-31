import React from 'react';
import { X, Mic, Terminal, Sparkles, Volume2, CheckCircle2, Flame, Layers } from 'lucide-react';

interface VoiceCheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryExample: (commandText: string) => void;
}

export const VoiceCheatsheetModal: React.FC<VoiceCheatsheetModalProps> = ({
  isOpen,
  onClose,
  onTryExample,
}) => {
  if (!isOpen) return null;

  const commandGroups = [
    {
      category: 'TASK CREATION',
      icon: <Mic className="w-4 h-4 text-[#38BDF8]" />,
      examples: [
        { spoken: 'Add task: Benchmark Web Audio latency by 4 PM urgent', note: 'Parses title, 16:00 deadline, and urgent priority' },
        { spoken: 'New task Calibrate FFT spectral filter for acoustic engine', note: 'Automatically maps to Acoustic Engine project' },
        { spoken: 'Schedule meeting with telemetry team tomorrow at 10 AM', note: 'Extracts time and domain' },
        { spoken: 'Remind me to update client documentation #frontend', note: 'Maps #frontend hashtag to project' },
      ],
    },
    {
      category: 'HANDS-FREE CONTROL & ACTIONS',
      icon: <Terminal className="w-4 h-4 text-[#34D399]" />,
      examples: [
        { spoken: "Read today's tasks", note: 'Speaks audio briefing of today’s pending agenda' },
        { spoken: 'Complete task 1', note: 'Marks the top pending task as finished' },
        { spoken: 'Show urgent tasks', note: 'Filters view to high-priority items' },
        { spoken: 'Brief me on core pipeline', note: 'Synthesizes acoustic brief' },
      ],
    },
    {
      category: 'PRIORITY KEYWORDS',
      icon: <Flame className="w-4 h-4 text-[#F87171]" />,
      examples: [
        { spoken: 'urgent / high priority / asap / critical', note: 'Coral 2px border + elevated alert status' },
        { spoken: 'medium priority / moderate', note: 'Amber 2px border accent' },
        { spoken: 'normal / standard', note: 'Slate 2px border accent' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-xl bg-[#0F172A] border border-[#334155]/60 shadow-[0_0_32px_-4px_rgba(37,99,235,0.3)] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#334155]/40 flex items-center justify-between bg-[#090D16]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="font-display text-lg font-semibold text-white tracking-wide">
              Acoustic Voice Command Syntax
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8D90A0] hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <p className="text-xs font-mono text-[#C3C6D7] bg-[#181B25] p-3 rounded-lg border border-[#334155]/40 leading-relaxed">
            VocaDo continuously analyzes streaming acoustic input via Web Speech API and Web Audio FFT. Speak naturally or click any sample command below to simulate instant execution.
          </p>

          <div className="space-y-5">
            {commandGroups.map((group) => (
              <div key={group.category} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8D90A0] tracking-wider uppercase">
                  {group.icon}
                  <span>{group.category}</span>
                </div>

                <div className="space-y-1.5">
                  {group.examples.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onTryExample(item.spoken);
                        onClose();
                      }}
                      className="p-3 rounded-lg bg-[#090D16] border border-[#334155]/40 hover:border-[#38BDF8] cursor-pointer group transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#38BDF8] font-mono text-xs">&gt;</span>
                        <span className="text-xs font-mono text-white group-hover:text-[#38BDF8] transition-colors">
                          "{item.spoken}"
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8D90A0]">
                        {item.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#334155]/40 flex items-center justify-between bg-[#090D16] text-xs font-mono text-[#8D90A0]">
          <span>Tip: Tap the big blue mic or press Space to dictate</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[#1E293B] text-white hover:bg-[#2563EB] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
