import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Sparkles, 
  Activity, 
  Check, 
  Terminal, 
  Volume2, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { AcousticWaveform } from '../components/AcousticWaveform';
import { PriorityLevel, Task } from '../types';
import { soundFx } from '../services/soundEffects';

interface AcousticStudioScreenProps {
  isListening: boolean;
  onToggleListening: () => void;
  liveTranscript: string;
  onExecuteTranscript: (text: string) => void;
  decibels: number;
}

export const AcousticStudioScreen: React.FC<AcousticStudioScreenProps> = ({
  isListening,
  onToggleListening,
  liveTranscript,
  onExecuteTranscript,
  decibels,
}) => {
  const [continuousMode, setContinuousMode] = useState<boolean>(false);
  const [manualCommandInput, setManualCommandInput] = useState<string>('');

  const sampleVoiceAudios = [
    {
      title: 'Benchmark FFT Latency for v2 Stream',
      spoken: 'Add task: Benchmark FFT latency for acoustic pipeline by 4 PM urgent',
      priority: 'urgent',
      project: 'Acoustic Engine',
    },
    {
      title: 'Sync Telemetry Container with DevOps',
      spoken: 'Schedule meeting with DevOps on telemetry container deploy tomorrow',
      priority: 'normal',
      project: 'Telemetry Stream',
    },
    {
      title: 'Review PR #142 for Web Audio Latency',
      spoken: 'Add task Review pull request #142 for latency drop medium priority',
      priority: 'medium',
      project: 'Client Interface',
    },
    {
      title: 'Audio Briefing Query',
      spoken: "Read today's tasks",
      priority: 'query',
      project: 'System Action',
    },
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCommandInput.trim()) return;
    onExecuteTranscript(manualCommandInput.trim());
    setManualCommandInput('');
    soundFx.playCommandParsed();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-8 animate-fadeIn">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155]/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-[#34D399]" />
            <span>Digital Audio Workstation & Acoustic Command Lab</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Acoustic Studio & Voice Dispatch
          </h1>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-[#334155]/40 text-xs font-mono">
          <span className="text-[#8D90A0] px-2">CAPTURE MODE:</span>
          <button
            onClick={() => setContinuousMode(false)}
            className={`px-3 py-1 rounded transition-all ${
              !continuousMode
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                : 'text-[#8D90A0] hover:text-white'
            }`}
          >
            Push-to-Talk
          </button>
          <button
            onClick={() => setContinuousMode(true)}
            className={`px-3 py-1 rounded transition-all ${
              continuousMode
                ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                : 'text-[#8D90A0] hover:text-white'
            }`}
          >
            Hands-Free Continuous
          </button>
        </div>
      </div>

      {/* Main Orbital Acoustic Visualizer Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#0A0E17] border border-[#334155]/60 p-6 sm:p-10 shadow-[0_0_40px_-5px_rgba(37,99,235,0.25)] relative overflow-hidden">
        {/* Ambient background glow ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-72 h-72 rounded-full transition-all duration-700 ${
              isListening
                ? 'bg-gradient-to-r from-[#2563EB]/25 via-[#38BDF8]/20 to-[#34D399]/20 blur-3xl scale-125'
                : 'bg-[#2563EB]/5 blur-2xl'
            }`}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Signal Level Badge */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#8D90A0]">
              <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
              FFT BINS: 1024
            </span>
            <span className="text-[#334155]">|</span>
            <span className="flex items-center gap-1.5 text-[#8D90A0]">
              <Activity className="w-3.5 h-3.5 text-[#34D399]" />
              PRESSURE: <strong className="text-white">{decibels} dB</strong>
            </span>
            <span className="text-[#334155]">|</span>
            <span className="text-[#38BDF8] font-bold">
              {isListening ? 'STREAM BUFFER: ACTIVE' : 'STREAM BUFFER: IDLE'}
            </span>
          </div>

          {/* Central Spectral Waveform (44 bars sweeping cobalt -> cyan -> emerald) */}
          <div className="w-full max-w-xl py-6 flex flex-col items-center justify-center">
            <AcousticWaveform
              barCount={44}
              isActive={isListening}
              height={70}
              variant="large"
              className="w-full"
            />
          </div>

          {/* Primary Voice Hub Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={onToggleListening}
              className={`relative p-1 rounded-full transition-all duration-300 ${
                isListening ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              {/* Radial gradient border */}
              <div
                className={`absolute -inset-1 rounded-full ${
                  isListening
                    ? 'bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#34D399] animate-spin blur-sm'
                    : 'bg-[#2563EB]/40'
                }`}
              />

              <div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-gradient-to-br from-[#2563EB] to-[#0053db] text-white shadow-[0_0_40px_rgba(56,189,248,0.7)] animate-acoustic-pulse'
                    : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-[0_0_30px_rgba(37,99,235,0.5)]'
                }`}
              >
                {isListening ? <Mic className="w-9 h-9 text-[#bdffdc]" /> : <Mic className="w-9 h-9 text-white" />}
              </div>
            </button>

            <span className="mt-3 font-display text-sm font-semibold text-white tracking-wide">
              {isListening ? 'Streaming Live Voice... Tap to Process' : 'Click to Speak Acoustic Command'}
            </span>
            <span className="text-xs font-mono text-[#8D90A0] mt-0.5">
              Natural speech intent: add tasks, mark completed, read agenda
            </span>
          </div>

          {/* Live Streaming Terminal Window */}
          <div className="w-full max-w-2xl text-left rounded-xl bg-[#090D16] border border-[#334155]/60 p-4 font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#334155]/40 text-xs text-[#8D90A0]">
              <span className="flex items-center gap-1.5 text-[#38BDF8]">
                <Terminal className="w-3.5 h-3.5" />
                ACOUSTIC TRANSCRIPT BUFFER
              </span>
              <span>CONFIDENCE: {isListening ? '98.4%' : 'READY'}</span>
            </div>

            <div className="text-sm sm:text-base text-white min-h-[48px] flex items-center">
              <span className="text-[#38BDF8] mr-2 font-bold">&gt;</span>
              <span className="break-words">
                {liveTranscript || (
                  <span className="text-[#8D90A0] italic">
                    {isListening
                      ? 'Say something like: "Add task: calibrate DSP filter by 4pm urgent"'
                      : 'Voice buffer awaiting input. Click the microphone or use prompt shortcuts below.'}
                  </span>
                )}
              </span>
              <span className="inline-block w-2.5 h-4 ml-1 bg-[#38BDF8] animate-terminal-blink align-middle" />
            </div>

            {liveTranscript && (
              <div className="mt-3 pt-2 border-t border-[#334155]/40 flex items-center justify-end gap-2">
                <button
                  onClick={() => onExecuteTranscript(liveTranscript)}
                  className="px-4 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Execute Spoken Command</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Input or Voice Simulation Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            Acoustic Test Patterns (Instant Dispatch)
          </h2>
          <span className="text-xs font-mono text-[#8D90A0]">
            Click any pattern to trigger parsing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleVoiceAudios.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => onExecuteTranscript(sample.spoken)}
              className="p-4 rounded-xl bg-[#0F172A] border border-[#334155]/40 hover:border-[#38BDF8]/60 cursor-pointer group transition-all space-y-2 hover:shadow-[0_4px_16px_rgba(15,23,42,0.9)]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-medium group-hover:text-[#38BDF8] transition-colors">
                  {sample.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#1E293B] text-[#7BD0FF] border border-[#38BDF8]/20">
                  {sample.project}
                </span>
              </div>

              <p className="text-xs font-mono text-[#8D90A0] italic">
                "{sample.spoken}"
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#38BDF8]">
                <span>Click to simulate acoustic capture</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
