import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Mic, 
  MicOff, 
  Sparkles, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCcw, 
  Zap, 
  BrainCircuit, 
  Compass, 
  Layers,
  Radio,
  FileAudio
} from 'lucide-react';
import { AcousticWaveform } from '../components/AcousticWaveform';
import { soundFx } from '../services/soundEffects';
import { audioRecorder, transcribeAudioWithGemini } from '../services/geminiAudioService';
import { Task } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  mapSources?: Array<{ title: string; uri: string; snippets?: string[] }>;
}

interface GeminiChatScreenProps {
  onAddTaskFromChat: (task: Partial<Task>) => void;
}

export const GeminiChatScreen: React.FC<GeminiChatScreenProps> = ({ onAddTaskFromChat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Welcome to the VocaDo Gemini Intelligence Workspace. I can assist with hands-free task decomposition, DSP engineering logic, and real-world errand and meeting location coordination with live Google Maps grounding.

You can speak via the microphone (transcribed by **gemini-3.5-transcribe**) or type your query below.`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'executive' | 'engineer' | 'logistics'>('executive');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [isMapsEnabled, setIsMapsEnabled] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedTaskId, setAddedTaskId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isTranscribing]);

  // Request browser geolocation for Maps Grounding
  const handleToggleMaps = () => {
    const nextState = !isMapsEnabled;
    setIsMapsEnabled(nextState);
    if (nextState && !userCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default fallback coordinates (e.g. San Francisco tech district)
          setUserCoords({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  };

  // Audio recording with gemini-3.5-transcribe
  const handleToggleAudioRecording = async () => {
    if (isRecordingAudio) {
      // Stop recording and transcribe
      try {
        setIsRecordingAudio(false);
        setIsTranscribing(true);
        soundFx.playMicStop();

        const { base64, mimeType } = await audioRecorder.stopRecording();
        const transcript = await transcribeAudioWithGemini(base64, mimeType);

        if (transcript) {
          setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
          soundFx.playCommandParsed();
        }
      } catch (err: any) {
        console.error('Transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      try {
        await audioRecorder.startRecording();
        setIsRecordingAudio(true);
        soundFx.playMicStart();
      } catch (err) {
        console.error('Failed to start microphone:', err);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);
    soundFx.playCommandParsed();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          role: selectedRole,
          model: selectedModel,
          enableMaps: isMapsEnabled,
          userLocation: userCoords,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text || 'Command processed.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        mapSources: data.mapSources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
      soundFx.playTaskCompleted();
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Error processing query: ${err.message}. Please check your connection or model parameters.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConvertMsgToTask = (msg: ChatMessage) => {
    // Extract first line or summary as title
    const firstLine = msg.text.split('\n')[0].replace(/^[#*\-—\s]+/, '').slice(0, 80);
    onAddTaskFromChat({
      title: firstLine || 'AI Strategy Task Unit',
      description: msg.text.slice(0, 300),
      priority: msg.text.toLowerCase().includes('urgent') ? 'urgent' : 'medium',
      project: selectedRole === 'engineer' ? 'Acoustic Engine' : selectedRole === 'logistics' ? 'Telemetry Stream' : 'Core Pipeline',
      dueTime: 'Today, 18:00',
      isToday: true,
      subtasks: [
        { id: `sub-${Date.now()}-1`, text: 'Review Gemini action brief', completed: false },
        { id: `sub-${Date.now()}-2`, text: 'Execute recommended solution', completed: false },
      ],
    });
    setAddedTaskId(msg.id);
    soundFx.playTaskCompleted();
    setTimeout(() => setAddedTaskId(null), 2500);
  };

  const promptSuggestions = [
    {
      label: 'Find electronic hardware supplies nearby',
      query: 'Find the best electronics hardware stores and component suppliers near me for prototyping.',
      role: 'logistics',
      maps: true,
    },
    {
      label: 'Locate quiet research coffee shops',
      query: 'Find quiet coffee shops or co-working study cafes with strong Wi-Fi near me for engineering work.',
      role: 'logistics',
      maps: true,
    },
    {
      label: 'Decompose audio DSP pipeline tasks',
      query: 'Decompose our Web Audio FFT pipeline benchmark into 4 prioritized engineering action steps with acceptance criteria.',
      role: 'engineer',
      maps: false,
    },
    {
      label: 'Formulate today execution strategy',
      query: 'Synthesize a high-velocity execution plan for 5 engineering tasks due today to minimize context-switching.',
      role: 'executive',
      maps: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-28 flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* Control Configuration Bar */}
      <div className="mb-3 p-3 rounded-xl bg-[#0F172A] border border-[#334155]/40 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Role Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-[#8D90A0] uppercase tracking-wider flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
            Agent Role:
          </span>
          {(['executive', 'engineer', 'logistics'] as const).map((r) => {
            const labels = {
              executive: 'Executive Strategist',
              engineer: 'DSP Engineer',
              logistics: 'Location & Logistics',
            };
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all border ${
                  isSelected
                    ? 'bg-[#2563EB] text-white border-[#38BDF8] font-semibold shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-[#181B25] text-[#8D90A0] hover:text-white border-[#334155]/60'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>

        {/* Model Selector & Google Maps Grounding Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Selection */}
          <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-lg border border-[#334155]/60 text-[11px] font-mono">
            <span className="text-[#8D90A0] px-1.5">MODEL:</span>
            <button
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`px-2 py-0.5 rounded transition-all ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-[#8D90A0] hover:text-white'
              }`}
              title="General tasks (balanced reasoning and speed)"
            >
              3.8 Flash
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2 py-0.5 rounded transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-[#8D90A0] hover:text-white'
              }`}
              title="Fast tasks (ultra-low latency)"
            >
              3.1 Lite (Fast)
            </button>
            <button
              onClick={() => setSelectedModel('gemini-4-argon')}
              className={`px-2 py-0.5 rounded transition-all ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-[#8D90A0] hover:text-white'
              }`}
              title="Complex reasoning & deep architecture"
            >
              4 Argon (Deep)
            </button>
          </div>

          {/* Google Maps Grounding Button */}
          <button
            onClick={handleToggleMaps}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isMapsEnabled
                ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.3)] font-semibold'
                : 'bg-[#181B25] text-[#8D90A0] hover:text-white border-[#334155]/60'
            }`}
            title="Ground answers with real-world Google Maps place data"
          >
            <MapPin className={`w-3.5 h-3.5 ${isMapsEnabled ? 'text-[#34D399]' : ''}`} />
            <span>Maps Grounding</span>
          </button>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-[#0A0E17] border border-[#334155]/40 mb-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#0053db] border border-[#38BDF8]/30 flex items-center justify-center text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2 max-w-full">
                {/* Header label */}
                <div className={`flex items-center gap-2 text-[10px] font-mono text-[#8D90A0] ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{isUser ? 'OPERATOR' : 'GEMINI AGENT'}</span>
                  <span>[{msg.timestamp}]</span>
                  {msg.modelUsed && (
                    <span className="px-1.5 py-0.2 rounded bg-[#1E293B] text-[#7BD0FF] border border-[#38BDF8]/20">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#1E293B] text-white border border-[#38BDF8]/40 shadow-[0_0_15px_rgba(37,99,235,0.15)] font-mono'
                      : 'bg-[#0F172A] text-[#DFE2EF] border border-[#334155]/50 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>

                  {/* Google Maps Grounded Places Display (MANDATORY REQUIREMENT) */}
                  {msg.mapSources && msg.mapSources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#334155]/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#34D399] font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Google Maps Grounded Locations ({msg.mapSources.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.mapSources.map((mapItem, idx) => (
                          <a
                            key={idx}
                            href={mapItem.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-[#090D16] border border-[#334155]/60 hover:border-[#34D399] text-xs font-mono group transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-white group-hover:text-[#34D399] transition-colors line-clamp-1">
                                {mapItem.title}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#8D90A0] group-hover:text-[#34D399] flex-shrink-0" />
                            </div>
                            {mapItem.snippets && mapItem.snippets.length > 0 && (
                              <p className="text-[11px] text-[#8D90A0] italic mt-1 line-clamp-2">
                                "{mapItem.snippets[0]}"
                              </p>
                            )}
                            <span className="text-[10px] text-[#38BDF8] mt-2 block">
                              Open in Google Maps &rarr;
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Message Actions */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-[#334155]/30 flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1E293B] text-[#8D90A0] hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#34D399]" />
                              <span className="text-[#34D399]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => handleConvertMsgToTask(msg)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all border ${
                          addedTaskId === msg.id
                            ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]'
                            : 'bg-[#181B25] text-[#38BDF8] hover:text-white border-[#334155]/60 hover:border-[#38BDF8]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{addedTaskId === msg.id ? 'Task Queued!' : 'Convert to Task'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#38BDF8]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#334155]/60 flex items-center gap-3">
              <AcousticWaveform barCount={12} isActive={true} height={18} variant="compact" />
              <span className="text-xs font-mono text-[#38BDF8] animate-pulse">
                {selectedModel} synthesizing response...
              </span>
            </div>
          </div>
        )}

        {/* Audio Transcribing Indicator */}
        {isTranscribing && (
          <div className="p-3 rounded-lg bg-[#2563EB]/20 border border-[#38BDF8] text-xs font-mono text-[#38BDF8] flex items-center gap-2 animate-pulse">
            <FileAudio className="w-4 h-4 animate-spin" />
            <span>Transcribing microphone audio with gemini-3.5-transcribe...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts strip */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-mono text-[#8D90A0] uppercase whitespace-nowrap mr-1">
          Suggestions:
        </span>
        {promptSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputPrompt(item.query);
              setSelectedRole(item.role as any);
              if (item.maps) setIsMapsEnabled(true);
            }}
            className="px-2.5 py-1 rounded bg-[#0F172A] hover:bg-[#1E293B] text-[11px] font-mono text-[#C3C6D7] hover:text-[#38BDF8] border border-[#334155]/50 whitespace-nowrap transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]/60 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center gap-2"
      >
        {/* Gemini 3.5 Audio Transcription Button */}
        <button
          type="button"
          onClick={handleToggleAudioRecording}
          title={isRecordingAudio ? 'Stop recording & transcribe with gemini-3.5-transcribe' : 'Record voice to transcribe with gemini-3.5-transcribe'}
          className={`p-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono ${
            isRecordingAudio
              ? 'bg-[#F87171] text-white border-[#F87171] shadow-[0_0_15px_rgba(248,113,113,0.5)] animate-pulse'
              : 'bg-[#181B25] text-[#7BD0FF] hover:text-white border-[#334155]/60 hover:border-[#38BDF8]'
          }`}
        >
          {isRecordingAudio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#38BDF8]" />}
          <span className="hidden sm:inline">
            {isRecordingAudio ? 'Stop & Transcribe' : 'Gemini Transcribe'}
          </span>
          {isRecordingAudio && <AcousticWaveform barCount={6} isActive={true} height={12} variant="compact" />}
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={
            isRecordingAudio
              ? 'Recording audio from mic for gemini-3.5-transcribe...'
              : `Ask ${selectedRole} (${selectedModel})...`
          }
          className="flex-1 px-3 py-2 rounded-lg text-sm font-sans bg-[#090D16] border border-[#334155] text-white placeholder-[#8D90A0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_8px_rgba(37,99,235,0.4)]"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
