import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Mic, 
  Activity, 
  Calendar,
  SquareCheckBig,
  Bot,
  FileAudio
} from 'lucide-react';
import { ScreenView, Task } from '../types';
import { soundFx } from '../services/soundEffects';

interface HeaderHUDProps {
  currentScreen: ScreenView;
  onScreenChange: (screen: ScreenView) => void;
  tasks: Task[];
  isListening: boolean;
  onTriggerBriefing: () => void;
  isBriefingPlaying: boolean;
  onOpenHelp: () => void;
  onOpenTranscribe?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentScreen,
  onScreenChange,
  tasks,
  isListening,
  onTriggerBriefing,
  isBriefingPlaying,
  onOpenHelp,
  onOpenTranscribe,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.isMuted);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    soundFx.isMuted = !soundFx.isMuted;
    setIsMuted(soundFx.isMuted);
    if (!soundFx.isMuted) {
      soundFx.playCommandParsed();
    }
  };

  const todayTasks = tasks.filter((t) => t.isToday);
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const completionPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/85 backdrop-blur-md border-b border-[#334155]/30">
      {/* Top instrumentation readout strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs border-b border-[#334155]/20 font-mono tracking-wider">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-[#38BDF8]' : 'bg-[#34D399]'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-[#38BDF8]' : 'bg-[#34D399]'}`} />
            </span>
            <span className="text-[#38BDF8] font-semibold">
              {isListening ? 'AURAL RX: STREAMING' : 'CORE DSP: ONLINE'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[#8D90A0]">
            <span>FORMAT:</span>
            <span className="text-[#DFE2EF] font-semibold">48.0 kHz / 24-bit PCM</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[#8D90A0]">
            <span>LATENCY:</span>
            <span className="text-[#34D399] font-semibold">12ms ZERO-BUFFER</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#DFE2EF] bg-[#090D16] px-2.5 py-1 rounded border border-[#334155]/40 font-mono">
            <span className="text-[#38BDF8]">UTC-07:00</span>
            <span className="text-white font-bold">{timeStr || '12:00:00'}</span>
          </div>

          <button
            onClick={toggleSound}
            title={isMuted ? 'Tactile Audio Muted' : 'Tactile Audio Active'}
            className="p-1.5 rounded hover:bg-[#1E293B] text-[#8D90A0] hover:text-[#DFE2EF] transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#F87171]" /> : <Volume2 className="w-3.5 h-3.5 text-[#34D399]" />}
          </button>

          <button
            onClick={onOpenHelp}
            title="Voice Command Syntaxes & Cheatsheet"
            className="p-1.5 rounded hover:bg-[#1E293B] text-[#8D90A0] hover:text-[#38BDF8] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main command bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#003ea8] flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-[#7BD0FF]/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Voca<span className="text-[#38BDF8]">Do</span>
                </h1>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1E293B] text-[#7BD0FF] font-mono border border-[#38BDF8]/20">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-[#8D90A0] tracking-wide font-mono hidden sm:block">
                Acoustic Command Workspace & Task Engine
              </p>
            </div>
          </div>

          {/* Mobile Briefing Button */}
          <button
            onClick={onTriggerBriefing}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#1E293B] hover:bg-[#2563EB]/20 text-[#38BDF8] border border-[#38BDF8]/30 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isBriefingPlaying ? 'animate-spin text-[#34D399]' : ''}`} />
            <span>{isBriefingPlaying ? 'Speaking...' : 'Briefing'}</span>
          </button>
        </div>

        {/* Screen View Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onScreenChange('today')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentScreen === 'today'
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)]'
                : 'bg-[#1E293B]/70 text-[#C3C6D7] hover:text-white hover:bg-[#1E293B] border border-[#334155]/40'
            }`}
          >
            <SquareCheckBig className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Today's Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
              {todayTasks.filter(t => !t.completed).length}
            </span>
          </button>

          <button
            onClick={() => onScreenChange('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentScreen === 'chat'
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)]'
                : 'bg-[#1E293B]/70 text-[#C3C6D7] hover:text-white hover:bg-[#1E293B] border border-[#334155]/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Gemini Chat</span>
          </button>

          <button
            onClick={() => onScreenChange('studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentScreen === 'studio'
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)]'
                : 'bg-[#1E293B]/70 text-[#C3C6D7] hover:text-white hover:bg-[#1E293B] border border-[#334155]/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Acoustic Studio</span>
          </button>

          <button
            onClick={() => onScreenChange('projects')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentScreen === 'projects'
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)]'
                : 'bg-[#1E293B]/70 text-[#C3C6D7] hover:text-white hover:bg-[#1E293B] border border-[#334155]/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#7BD0FF]" />
            <span>Pipelines</span>
          </button>

          <button
            onClick={() => onScreenChange('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentScreen === 'telemetry'
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)]'
                : 'bg-[#1E293B]/70 text-[#C3C6D7] hover:text-white hover:bg-[#1E293B] border border-[#334155]/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Telemetry</span>
          </button>
        </nav>

        {/* Right side: Vocal Briefing trigger + Transcribe lab + Daily Execution Gauge */}
        <div className="hidden md:flex items-center gap-3">
          {onOpenTranscribe && (
            <button
              onClick={onOpenTranscribe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#181B25] hover:bg-[#1E293B] text-[#7BD0FF] hover:text-white border border-[#334155]/60 hover:border-[#38BDF8] transition-all"
              title="Transcribe voice with gemini-3.5-transcribe"
            >
              <FileAudio className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Transcribe</span>
            </button>
          )}
          <div className="flex items-center gap-3 bg-[#090D16] px-3 py-1.5 rounded-lg border border-[#334155]/40">
            <div className="text-right">
              <div className="text-[10px] text-[#8D90A0] font-mono tracking-wider uppercase">
                Execution Rate
              </div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1 justify-end">
                <span>{completedToday}</span>
                <span className="text-[#8D90A0]">/</span>
                <span>{todayTasks.length}</span>
                <span className="text-[#34D399] ml-1">({completionPercent}%)</span>
              </div>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-16 h-2 bg-[#1E293B] rounded-full overflow-hidden border border-[#334155]/60">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#34D399] transition-all duration-500 rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={onTriggerBriefing}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono transition-all border ${
              isBriefingPlaying
                ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399] shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse'
                : 'bg-[#1E293B] hover:bg-[#2563EB]/25 text-[#DFE2EF] hover:text-white border-[#334155] hover:border-[#38BDF8]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isBriefingPlaying ? 'text-[#34D399] animate-spin' : 'text-[#38BDF8]'}`} />
            <span>{isBriefingPlaying ? 'Vocal Synthesis Active' : "Read Today's Tasks"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
