export type PriorityLevel = 'urgent' | 'medium' | 'normal';
export type PipelineStatus = 'LISTENING' | 'PARSING' | 'QUEUED' | 'SYNCED';
export type ScreenView = 'today' | 'studio' | 'chat' | 'projects' | 'telemetry';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: PriorityLevel;
  pipelineStatus: PipelineStatus;
  project: string;
  dueTime: string;
  isToday: boolean;
  subtasks: Subtask[];
  tags: string[];
  voiceNoteSnippet?: string;
  voiceDuration?: string;
  acousticConfidence?: number;
  createdAt: string;
  completedAt?: string;
}

export interface VoiceCommandIntent {
  action: 'add_task' | 'complete_task' | 'delete_task' | 'read_tasks' | 'filter_priority' | 'unknown';
  rawText: string;
  title?: string;
  priority?: PriorityLevel;
  project?: string;
  dueTime?: string;
  targetId?: string;
}

export interface AcousticLogEntry {
  id: string;
  timestamp: string;
  rawTranscript: string;
  intent: string;
  confidence: number;
  decibelPeak: number;
  durationSec: number;
  status: 'SUCCESS' | 'EXECUTED' | 'FILTERED';
}
