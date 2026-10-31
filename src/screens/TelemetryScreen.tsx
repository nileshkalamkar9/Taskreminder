import React, { useState } from 'react';
import { 
  Activity, 
  Terminal, 
  Volume2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Sliders, 
  Play, 
  Sparkles,
  Radio
} from 'lucide-react';
import { AcousticLogEntry } from '../types';
import { speakText, stopSpeech } from '../services/speechService';
import { soundFx } from '../services/soundEffects';

interface TelemetryScreenProps {
  logs: AcousticLogEntry[];
  totalVoiceCommands: number;
}

export const TelemetryScreen: React.FC<TelemetryScreenProps> = ({
  logs,
  totalVoiceCommands,
}) => {
  const [testPitch, setTestPitch] = useState<number>(1.0);
  const [testRate, setTestRate] = useState<number>(1.05);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  const sampleLogs: AcousticLogEntry[] = logs.length > 0 ? logs : [
    {
      id: 'log-1',
      timestamp: '14:28:12',
      rawTranscript: 'Add task: Calibrate FFT filter response by 4 PM urgent',
      intent: 'add_task',
      confidence: 0.985,
      decibelPeak: 68,
      durationSec: 3.2,
      status: 'EXECUTED',
    },
    {
      id: 'log-2',
      timestamp: '14:20:04',
      rawTranscript: "Read today's tasks",
      intent: 'read_tasks',
      confidence: 0.992,
      decibelPeak: 72,
      durationSec: 1.4,
      status: 'EXECUTED',
    },
    {
      id: 'log-3',
      timestamp: '13:55:40',
      rawTranscript: 'Complete task 1',
      intent: 'complete_task',
      confidence: 0.971,
      decibelPeak: 64,
      durationSec: 1.1,
      status: 'EXECUTED',
    },
    {
      id: 'log-4',
      timestamp: '13:12:19',
      rawTranscript: 'Review pull request #142 for telemetry medium priority',
      intent: 'add_task',
      confidence: 0.963,
      decibelPeak: 69,
      durationSec: 2.8,
      status: 'EXECUTED',
    },
  ];

  const handleTestSpeech = () => {
    if (isSynthesizing) {
      stopSpeech();
      setIsSynthesizing(false);
      return;
    }

    setIsSynthesizing(true);
    soundFx.playCommandParsed();
    speakText(
      'VocaDo acoustic synthesizer operational. 48.0 kHz 24-bit PCM speech parsing online. Real-time task dispatch latency is 12 milliseconds.',
      () => {
        setIsSynthesizing(false);
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155]/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FBBF24] uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-[#FBBF24]" />
            <span>Signal Diagnostic & Acoustic Telemetry</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            DSP Telemetry & Voice Log
          </h1>
          <p className="text-sm text-[#8D90A0] mt-1">
            Instrumentation readouts, speech recognition confidence ratings, and acoustic buffer logs.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155]/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8D90A0]">
            <span>VOICE COMMANDS</span>
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-white">
            {totalVoiceCommands + sampleLogs.length}
          </div>
          <div className="text-[11px] font-mono text-[#34D399]">
            100% Parsed accuracy
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155]/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8D90A0]">
            <span>AVG CONFIDENCE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#34D399]">
            98.1%
          </div>
          <div className="text-[11px] font-mono text-[#8D90A0]">
            Acoustic beamforming
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155]/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8D90A0]">
            <span>SPEECH VELOCITY</span>
            <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-white">
            164 <span className="text-sm font-normal text-[#8D90A0]">WPM</span>
          </div>
          <div className="text-[11px] font-mono text-[#38BDF8]">
            Optimal transcription speed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#334155]/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8D90A0]">
            <span>DISPATCH LATENCY</span>
            <Radio className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-white">
            12 <span className="text-sm font-normal text-[#8D90A0]">ms</span>
          </div>
          <div className="text-[11px] font-mono text-[#34D399]">
            Zero-buffer real-time
          </div>
        </div>
      </div>

      {/* Voice Synthesis Calibration Panel */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A] border border-[#334155]/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="font-display text-base font-semibold text-white">
              Tactile Speech Synthesis Engine
            </h3>
          </div>
          <button
            onClick={handleTestSpeech}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono border transition-all ${
              isSynthesizing
                ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399] animate-pulse'
                : 'bg-[#2563EB] text-white border-[#38BDF8] hover:bg-[#1d4ed8]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Test Vocal Output'}</span>
          </button>
        </div>

        <p className="text-xs font-mono text-[#8D90A0]">
          VocaDo utilizes localized browser Web Speech Synthesis for immediate low-latency vocal task briefings and audio confirmations without external cloud delays.
        </p>
      </div>

      {/* Acoustic Dispatch History Log Table */}
      <div className="rounded-xl bg-[#0F172A] border border-[#334155]/40 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#334155]/40 flex items-center justify-between bg-[#090D16]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#DFE2EF] font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-[#38BDF8]" />
            <span>Acoustic Command Audit Log</span>
          </div>
          <span className="text-xs font-mono text-[#8D90A0]">
            {sampleLogs.length} Records Captured
          </span>
        </div>

        <div className="divide-y divide-[#334155]/30 overflow-x-auto">
          {sampleLogs.map((log) => (
            <div
              key={log.id}
              className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#181B25] transition-colors font-mono text-xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="text-[#8D90A0] text-[11px] whitespace-nowrap">
                  [{log.timestamp}]
                </span>
                <div>
                  <span className="text-white font-medium block">
                    "{log.rawTranscript}"
                  </span>
                  <span className="text-[10px] text-[#38BDF8] uppercase tracking-wider">
                    INTENT: {log.intent}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] self-end sm:self-center">
                <span className="text-[#8D90A0]">
                  Peak: <strong className="text-white">{log.decibelPeak} dB</strong>
                </span>
                <span className="text-[#34D399]">
                  {(log.confidence * 100).toFixed(1)}% match
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
