import React, { useState } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  FileAudio, 
  Copy, 
  Check, 
  Plus, 
  Sparkles,
  Radio
} from 'lucide-react';
import { AcousticWaveform } from './AcousticWaveform';
import { soundFx } from '../services/soundEffects';
import { audioRecorder, transcribeAudioWithGemini } from '../services/geminiAudioService';
import { Task } from '../types';

interface AudioTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: Partial<Task>) => void;
}

export const AudioTranscriptionModal: React.FC<AudioTranscriptionModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleToggleRecord = async () => {
    setErrorMsg('');
    if (isRecording) {
      try {
        setIsRecording(false);
        setIsProcessing(true);
        soundFx.playMicStop();

        const { base64, mimeType } = await audioRecorder.stopRecording();
        const text = await transcribeAudioWithGemini(base64, mimeType);
        setTranscribedText(text);
        soundFx.playCommandParsed();
      } catch (err: any) {
        console.error('Transcription error:', err);
        setErrorMsg(err.message || 'Failed to transcribe audio with gemini-3.5-transcribe');
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        await audioRecorder.startRecording();
        setIsRecording(true);
        soundFx.playMicStart();
      } catch (err: any) {
        setErrorMsg(err.message || 'Microphone access denied or unavailable');
      }
    }
  };

  const handleCopy = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleCreateTask = () => {
    if (!transcribedText) return;
    onAddTask({
      title: transcribedText.slice(0, 70),
      description: transcribedText,
      priority: transcribedText.toLowerCase().includes('urgent') ? 'urgent' : 'normal',
      project: 'Acoustic Engine',
      dueTime: 'Today, 17:00',
      isToday: true,
      voiceNoteSnippet: transcribedText,
      voiceDuration: '0:08',
      acousticConfidence: 0.99,
      pipelineStatus: 'SYNCED',
    });
    soundFx.playTaskCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-xl bg-[#0F172A] border border-[#334155]/60 shadow-[0_0_32px_-4px_rgba(37,99,235,0.35)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#334155]/40 flex items-center justify-between bg-[#090D16]">
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <h2 className="font-display text-base font-semibold text-white tracking-wide">
                Microphone Transcription Lab
              </h2>
              <span className="text-[10px] font-mono text-[#34D399]">
                MODEL: gemini-3.5-transcribe
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8D90A0] hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs font-mono text-[#8D90A0]">
            Speak into your microphone. Your audio will be recorded and processed by Google's specialized <strong className="text-white">gemini-3.5-transcribe</strong> model into accurate text.
          </p>

          {/* Central Recording Hub */}
          <div className="flex flex-col items-center justify-center py-4 bg-[#090D16] rounded-xl border border-[#334155]/40 space-y-4">
            <AcousticWaveform
              barCount={32}
              isActive={isRecording}
              height={40}
              variant="standard"
            />

            <button
              onClick={handleToggleRecord}
              disabled={isProcessing}
              className={`p-1 rounded-full transition-all duration-300 ${
                isRecording ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-[#F87171] text-white shadow-[0_0_24px_rgba(248,113,113,0.7)] animate-pulse'
                    : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </div>
            </button>

            <span className="text-xs font-mono text-white font-medium">
              {isProcessing
                ? 'Processing with gemini-3.5-transcribe...'
                : isRecording
                ? 'Recording... Tap to stop & transcribe'
                : 'Tap to start recording'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#F87171]/15 border border-[#F87171]/40 text-xs font-mono text-[#F87171]">
              {errorMsg}
            </div>
          )}

          {/* Output text */}
          {transcribedText && (
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block">
                Transcribed Output
              </span>
              <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#334155]/60 text-xs sm:text-sm font-mono text-white">
                "{transcribedText}"
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#334155]/40 flex items-center justify-between bg-[#090D16]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-mono text-[#8D90A0] hover:text-white"
          >
            Close
          </button>

          {transcribedText && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono bg-[#1E293B] text-white hover:bg-[#334155] transition-colors"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleCreateTask}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-mono font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Queue as Task Unit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
