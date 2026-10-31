import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, ScreenView, PriorityLevel, PipelineStatus, AcousticLogEntry } from './types';
import { HeaderHUD } from './components/HeaderHUD';
import { AudioDock } from './components/AudioDock';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { VoiceCheatsheetModal } from './components/VoiceCheatsheetModal';
import { TodaysTasksScreen } from './screens/TodaysTasksScreen';
import { AcousticStudioScreen } from './screens/AcousticStudioScreen';
import { PipelinesScreen } from './screens/PipelinesScreen';
import { TelemetryScreen } from './screens/TelemetryScreen';
import { GeminiChatScreen } from './screens/GeminiChatScreen';
import { AudioTranscriptionModal } from './components/AudioTranscriptionModal';
import { soundFx } from './services/soundEffects';
import { parseVoiceCommand, speakText, stopSpeech } from './services/speechService';

// Initial realistic technical tasks for VocaDo
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Calibrate FFT spectral filter for v2 voice stream',
    description: 'Ensure 48 kHz 24-bit windowing eliminates high-frequency aliasing during push-to-talk microphone bursts.',
    completed: false,
    priority: 'urgent',
    pipelineStatus: 'SYNCED',
    project: 'Acoustic Engine',
    dueTime: 'Today, 14:00',
    isToday: true,
    voiceDuration: '0:09',
    voiceNoteSnippet: 'Add task calibrate FFT spectral filter for v2 voice stream by 2 PM urgent',
    acousticConfidence: 0.99,
    createdAt: '2026-10-30T10:15:00Z',
    subtasks: [
      { id: 'sub-1', text: 'Verify Blackman-Harris window coefficients', completed: true },
      { id: 'sub-2', text: 'Benchmark 1024-bin FFT execution under 4ms', completed: false },
      { id: 'sub-3', text: 'Test clipping prevention at +3dB peak', completed: false },
    ],
    tags: ['dsp', 'fft', 'audio'],
  },
  {
    id: 'task-2',
    title: 'Benchmark Web Audio latency on mobile web',
    description: 'Measure time-to-first-buffer on mobile Safari and Chrome under low-power modes.',
    completed: false,
    priority: 'urgent',
    pipelineStatus: 'SYNCED',
    project: 'Client Interface',
    dueTime: 'Today, 15:30',
    isToday: true,
    voiceDuration: '0:06',
    voiceNoteSnippet: 'Benchmark Web Audio latency on mobile web by 3:30 PM urgent',
    acousticConfidence: 0.98,
    createdAt: '2026-10-30T10:45:00Z',
    subtasks: [
      { id: 'sub-4', text: 'Collect AudioContext suspended-state resume timings', completed: false },
      { id: 'sub-5', text: 'Confirm zero touch delay on primary voice trigger', completed: false },
    ],
    tags: ['mobile', 'latency', 'interface'],
  },
  {
    id: 'task-3',
    title: 'Sync with DevOps on telemetry container deploy',
    description: 'Review Docker multi-stage manifest and memory allocation for signal logging daemon.',
    completed: false,
    priority: 'medium',
    pipelineStatus: 'SYNCED',
    project: 'Telemetry Stream',
    dueTime: 'Today, 16:30',
    isToday: true,
    voiceDuration: '0:11',
    voiceNoteSnippet: 'Schedule meeting with DevOps on telemetry container deploy today at 4:30 PM',
    acousticConfidence: 0.97,
    createdAt: '2026-10-30T11:00:00Z',
    subtasks: [
      { id: 'sub-6', text: 'Export Prometheus metrics endpoint on port 9090', completed: true },
      { id: 'sub-7', text: 'Set container healthcheck threshold to 200ms', completed: false },
    ],
    tags: ['devops', 'cloud', 'telemetry'],
  },
  {
    id: 'task-4',
    title: 'Review pull request #142 for latency drop',
    description: 'Inspect Web Speech API retry backoff logic and UI state synchronization.',
    completed: false,
    priority: 'medium',
    pipelineStatus: 'SYNCED',
    project: 'Core Pipeline',
    dueTime: 'Today, 17:00',
    isToday: true,
    voiceDuration: '0:08',
    voiceNoteSnippet: 'Review pull request #142 for latency drop medium priority by 5 PM',
    acousticConfidence: 0.96,
    createdAt: '2026-10-30T11:30:00Z',
    subtasks: [
      { id: 'sub-8', text: 'Code review on acoustic state machine', completed: false },
      { id: 'sub-9', text: 'Run automated end-to-end unit suite', completed: false },
    ],
    tags: ['git', 'pr', 'review'],
  },
  {
    id: 'task-5',
    title: 'Prepare slide deck for engineering all-hands',
    description: 'Summarize voice command parsing accuracy and hands-free developer throughput gains.',
    completed: false,
    priority: 'normal',
    pipelineStatus: 'SYNCED',
    project: 'Core Pipeline',
    dueTime: 'Today, 18:00',
    isToday: true,
    acousticConfidence: 0.95,
    createdAt: '2026-10-30T11:45:00Z',
    subtasks: [
      { id: 'sub-10', text: 'Draft 4 summary slides on acoustic workflow', completed: false },
      { id: 'sub-11', text: 'Include real-time FFT screenshot benchmark', completed: false },
    ],
    tags: ['slides', 'sync'],
  },
  {
    id: 'task-6',
    title: 'Verify Web Speech API fallback on Safari',
    description: 'Ensure graceful degradation to simulated waveform and manual keyboard dispatch when speech permission is ungranted.',
    completed: true,
    priority: 'normal',
    pipelineStatus: 'SYNCED',
    project: 'Client Interface',
    dueTime: 'Completed Today',
    isToday: true,
    voiceDuration: '0:05',
    voiceNoteSnippet: 'Verify Web Speech API fallback on Safari',
    acousticConfidence: 0.99,
    createdAt: '2026-10-30T09:00:00Z',
    completedAt: '2026-10-30T11:20:00Z',
    subtasks: [
      { id: 'sub-12', text: 'Add window.webkitSpeechRecognition polyfill check', completed: true },
      { id: 'sub-13', text: 'Provide clear visual feedback and manual trigger', completed: true },
    ],
    tags: ['safari', 'compatibility'],
  },
  {
    id: 'task-7',
    title: 'Optimize 3-color radial waveform stroke frame rate',
    description: 'Hardware accelerate CSS radial breathing pulse animation and reduce re-renders.',
    completed: true,
    priority: 'medium',
    pipelineStatus: 'SYNCED',
    project: 'Acoustic Engine',
    dueTime: 'Completed Today',
    isToday: true,
    voiceDuration: '0:07',
    voiceNoteSnippet: 'Optimize 3-color radial waveform stroke frame rate',
    acousticConfidence: 0.98,
    createdAt: '2026-10-30T09:30:00Z',
    completedAt: '2026-10-30T10:50:00Z',
    subtasks: [
      { id: 'sub-14', text: 'Profile 60 FPS transform compositing', completed: true },
    ],
    tags: ['css', 'animation'],
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('today');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isTranscribeModalOpen, setIsTranscribeModalOpen] = useState<boolean>(false);
  const [defaultProjectForCreate, setDefaultProjectForCreate] = useState<string>('Core Pipeline');

  // Acoustic voice state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('SYNCED');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [decibels, setDecibels] = useState<number>(42);
  const [isBriefingPlaying, setIsBriefingPlaying] = useState<boolean>(false);
  const [logs, setLogs] = useState<AcousticLogEntry[]>([]);

  // Web Audio & Speech Recognition refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setPipelineStatus('LISTENING');
          soundFx.playMicStart();
        };

        recognition.onresult = (event: any) => {
          let currentSpeech = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentSpeech += event.results[i][0].transcript;
          }
          if (currentSpeech.trim()) {
            setLiveTranscript(currentSpeech);
            setPipelineStatus('PARSING');
          }
        };

        recognition.onerror = () => {
          setPipelineStatus('SYNCED');
        };

        recognition.onend = () => {
          setIsListening(false);
          soundFx.playMicStop();
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioCapture();
    };
  }, []);

  // Web Audio Mic Capture for live FFT & decibel calculation
  const startAudioCapture = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Compute average amplitude for dB
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const calculatedDb = Math.round(30 + (avg / 255) * 60);
          setDecibels(calculatedDb);

          animFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      }
    } catch {
      // If mic blocked or denied, synthetic ambient decibels
      setDecibels(58);
    }
  };

  const stopAudioCapture = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setDecibels(38);
  };

  // Toggle listening
  const handleToggleListening = useCallback(() => {
    if (isListening) {
      // Stop listening and process transcript
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      stopAudioCapture();
      setIsListening(false);
      soundFx.playMicStop();

      if (liveTranscript.trim()) {
        executeVoiceCommand(liveTranscript);
      } else {
        setPipelineStatus('SYNCED');
      }
    } else {
      // Start listening
      setLiveTranscript('');
      setIsListening(true);
      setPipelineStatus('LISTENING');
      soundFx.playMicStart();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // If already starting or error, simulate
        }
      }
      startAudioCapture();
    }
  }, [isListening, liveTranscript]);

  // Execute Voice Command
  const executeVoiceCommand = (rawSpeech: string) => {
    const text = rawSpeech.trim();
    if (!text) return;

    setPipelineStatus('PARSING');
    const intent = parseVoiceCommand(text);

    // Record Telemetry Audit Log
    const newLog: AcousticLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      rawTranscript: text,
      intent: intent.action,
      confidence: 0.98,
      decibelPeak: decibels > 45 ? decibels : 68,
      durationSec: 2.4,
      status: 'EXECUTED',
    };
    setLogs((prev) => [newLog, ...prev]);

    // Handle intent
    if (intent.action === 'read_tasks') {
      triggerTodayBriefing();
      setPipelineStatus('SYNCED');
      setLiveTranscript('');
      return;
    }

    if (intent.action === 'complete_task') {
      // Find matching task by title or index
      const targetQuery = intent.title?.toLowerCase() || '';
      let targetTask = tasks.find(
        (t) => !t.completed && (t.title.toLowerCase().includes(targetQuery) || targetQuery.includes('1') || targetQuery.includes('first'))
      );
      if (!targetTask && tasks.length > 0) {
        targetTask = tasks.find((t) => !t.completed);
      }

      if (targetTask) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === targetTask!.id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
          )
        );
        soundFx.playTaskCompleted();
      }
      setPipelineStatus('SYNCED');
      setLiveTranscript('');
      return;
    }

    if (intent.action === 'filter_priority') {
      setCurrentScreen('today');
      soundFx.playCommandParsed();
      setPipelineStatus('SYNCED');
      setLiveTranscript('');
      return;
    }

    // Default: Add task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: intent.title || 'Acoustic Task Unit',
      completed: false,
      priority: intent.priority || 'normal',
      pipelineStatus: 'SYNCED',
      project: intent.project || 'Core Pipeline',
      dueTime: intent.dueTime || 'Today, 17:00',
      isToday: true,
      subtasks: [
        { id: `sub-${Date.now()}-1`, text: 'Initial acoustic dispatch setup', completed: false },
      ],
      tags: ['voice-dispatch'],
      voiceNoteSnippet: text,
      voiceDuration: '0:06',
      acousticConfidence: 0.99,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    soundFx.playCommandParsed();
    setPipelineStatus('QUEUED');
    setTimeout(() => {
      setPipelineStatus('SYNCED');
    }, 600);
    setLiveTranscript('');
  };

  // Trigger vocal briefing of today's tasks
  const triggerTodayBriefing = () => {
    if (isBriefingPlaying) {
      stopSpeech();
      setIsBriefingPlaying(false);
      return;
    }

    setIsBriefingPlaying(true);
    soundFx.playCommandParsed();

    const todayPending = tasks.filter((t) => t.isToday && !t.completed);
    const urgentItems = todayPending.filter((t) => t.priority === 'urgent');

    let speechText = `Acoustic status report. You have ${todayPending.length} tasks scheduled for today. `;
    if (urgentItems.length > 0) {
      speechText += `Alert: ${urgentItems.length} require high-priority attention. `;
      urgentItems.forEach((item, idx) => {
        speechText += `Priority item ${idx + 1}: ${item.title}, due ${item.dueTime}. `;
      });
    } else if (todayPending.length > 0) {
      speechText += `Next item in queue: ${todayPending[0].title}. `;
    } else {
      speechText += `All scheduled agenda items are completed. `;
    }
    speechText += `Acoustic stream is active.`;

    speakText(speechText, () => {
      setIsBriefingPlaying(false);
    });
  };

  // Task actions
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    soundFx.playMicStop();
  };

  const handleUpdateSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed } : s
        );
        return { ...t, subtasks: updatedSubs };
      })
    );
    if (completed) {
      soundFx.playCommandParsed();
    }
  };

  const handleAddSubtask = (taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newSub = {
          id: `sub-${Date.now()}`,
          text,
          completed: false,
        };
        return { ...t, subtasks: [...t.subtasks, newSub] };
      })
    );
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'normal',
      pipelineStatus: 'SYNCED',
      project: taskData.project || defaultProjectForCreate || 'Core Pipeline',
      dueTime: taskData.dueTime || 'Today, 17:00',
      isToday: taskData.isToday ?? true,
      subtasks: taskData.subtasks || [],
      tags: ['manual-dispatch'],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleOpenCreateForProject = (project: string) => {
    setDefaultProjectForCreate(project);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#DFE2EF] flex flex-col font-sans selection:bg-[#2563EB]/40 selection:text-[#38BDF8]">
      {/* Header HUD with real-time status and navigation tabs */}
      <HeaderHUD
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        tasks={tasks}
        isListening={isListening}
        onTriggerBriefing={triggerTodayBriefing}
        isBriefingPlaying={isBriefingPlaying}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenTranscribe={() => setIsTranscribeModalOpen(true)}
      />

      {/* Main Screen Views */}
      <main className="flex-1">
        {currentScreen === 'today' && (
          <TodaysTasksScreen
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onUpdateSubtask={handleUpdateSubtask}
            onAddSubtask={handleAddSubtask}
            onSelectTask={setSelectedTask}
            onOpenCreateModal={() => {
              setDefaultProjectForCreate('Core Pipeline');
              setIsCreateModalOpen(true);
            }}
            onToggleVoiceCapture={handleToggleListening}
            isListening={isListening}
            liveTranscript={liveTranscript}
            onRunVoiceExample={(cmd) => {
              setLiveTranscript(cmd);
              setTimeout(() => {
                executeVoiceCommand(cmd);
              }, 400);
            }}
          />
        )}

        {currentScreen === 'chat' && (
          <GeminiChatScreen onAddTaskFromChat={handleAddTask} />
        )}

        {currentScreen === 'studio' && (
          <AcousticStudioScreen
            isListening={isListening}
            onToggleListening={handleToggleListening}
            liveTranscript={liveTranscript}
            onExecuteTranscript={(text) => {
              executeVoiceCommand(text);
            }}
            decibels={decibels}
          />
        )}

        {currentScreen === 'projects' && (
          <PipelinesScreen
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onUpdateSubtask={handleUpdateSubtask}
            onAddSubtask={handleAddSubtask}
            onSelectTask={setSelectedTask}
            onOpenCreateForProject={handleOpenCreateForProject}
          />
        )}

        {currentScreen === 'telemetry' && (
          <TelemetryScreen
            logs={logs}
            totalVoiceCommands={logs.length}
          />
        )}
      </main>

      {/* Persistent Bottom Audio Docking Zone */}
      <AudioDock
        isListening={isListening}
        onToggleListening={handleToggleListening}
        pipelineStatus={pipelineStatus}
        liveTranscript={liveTranscript}
        onQuickTextSubmit={(text) => executeVoiceCommand(text)}
        onOpenCreateModal={() => {
          setDefaultProjectForCreate('Core Pipeline');
          setIsCreateModalOpen(true);
        }}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        decibels={decibels}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddTask={handleAddTask}
        isDictating={isListening}
        onToggleDictation={handleToggleListening}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={(updated) => {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setSelectedTask(updated);
        }}
        onDeleteTask={(id) => {
          handleDeleteTask(id);
          setSelectedTask(null);
        }}
      />

      {/* Voice Cheatsheet Modal */}
      <VoiceCheatsheetModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onTryExample={(cmd) => {
          setLiveTranscript(cmd);
          setTimeout(() => {
            executeVoiceCommand(cmd);
          }, 350);
        }}
      />

      {/* Audio Transcription Modal (gemini-3.5-transcribe) */}
      <AudioTranscriptionModal
        isOpen={isTranscribeModalOpen}
        onClose={() => setIsTranscribeModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
