import { PriorityLevel, VoiceCommandIntent } from '../types';

// Natural language acoustic parser
export function parseVoiceCommand(text: string): VoiceCommandIntent {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Voice query / Read commands
  if (
    lower.includes('read tasks') ||
    lower.includes("read today's tasks") ||
    lower.includes('read my tasks') ||
    lower.includes('brief me') ||
    lower.includes('audio summary') ||
    lower.includes('what are my tasks')
  ) {
    return {
      action: 'read_tasks',
      rawText: clean,
    };
  }

  // 2. Complete / Done commands
  if (lower.startsWith('complete task') || lower.startsWith('finish task') || lower.startsWith('mark done') || lower.startsWith('check off')) {
    const target = clean.replace(/^(complete task|finish task|mark done|check off)\s*/i, '').trim();
    return {
      action: 'complete_task',
      rawText: clean,
      title: target,
    };
  }

  // 3. Delete commands
  if (lower.startsWith('delete task') || lower.startsWith('remove task') || lower.startsWith('cancel task')) {
    const target = clean.replace(/^(delete task|remove task|cancel task)\s*/i, '').trim();
    return {
      action: 'delete_task',
      rawText: clean,
      title: target,
    };
  }

  // 4. Filter / Show priority
  if (lower.includes('show urgent') || lower.includes('filter urgent')) {
    return {
      action: 'filter_priority',
      rawText: clean,
      priority: 'urgent',
    };
  }

  // 5. Add / Create Task
  // Strip common command prefaces: "add task", "new task", "create task", "remind me to", "note:"
  let parsedTitle = clean.replace(/^(add task:?|new task:?|create task:?|remind me to:?|schedule:?|remember to)\s*/i, '').trim();

  // Extract priority
  let priority: PriorityLevel = 'normal';
  if (lower.includes('urgent') || lower.includes('high priority') || lower.includes('asap') || lower.includes('critical')) {
    priority = 'urgent';
    parsedTitle = parsedTitle.replace(/\b(urgent|high priority|asap|critical)\b/gi, '').trim();
  } else if (lower.includes('medium priority') || lower.includes('moderate')) {
    priority = 'medium';
    parsedTitle = parsedTitle.replace(/\b(medium priority|moderate)\b/gi, '').trim();
  }

  // Extract project tags if mentioned: #project or "for project [name]" or "in [name]"
  let project = 'Core Pipeline';
  const tagMatch = parsedTitle.match(/#(\w+)/);
  if (tagMatch) {
    project = tagMatch[1];
    parsedTitle = parsedTitle.replace(/#\w+/, '').trim();
  } else if (lower.includes('acoustic') || lower.includes('audio') || lower.includes('dsp') || lower.includes('fft')) {
    project = 'Acoustic Engine';
  } else if (lower.includes('frontend') || lower.includes('ui') || lower.includes('component') || lower.includes('css')) {
    project = 'Client Interface';
  } else if (lower.includes('backend') || lower.includes('api') || lower.includes('database') || lower.includes('telemetry')) {
    project = 'Telemetry Stream';
  }

  // Extract due time / deadlines
  let dueTime = 'Today, 17:00';
  const timeMatch = parsedTitle.match(/\b(by\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|tomorrow|in\s+\d+\s+(?:hours?|minutes?)|tonight)\b/i);
  if (timeMatch) {
    dueTime = timeMatch[0].trim();
    parsedTitle = parsedTitle.replace(timeMatch[0], '').trim();
  }

  // Clean trailing prepositions or punctuation
  parsedTitle = parsedTitle.replace(/^[:\-–\s]+/, '').replace(/[:\-–\s]+$/, '');
  if (!parsedTitle) {
    parsedTitle = 'Acoustic Voice Note #' + Math.floor(Math.random() * 900 + 100);
  }

  return {
    action: 'add_task',
    rawText: clean,
    title: parsedTitle.charAt(0).toUpperCase() + parsedTitle.slice(1),
    priority,
    project,
    dueTime,
  };
}

// Text-to-speech readout
export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Prefer high quality English voice if available
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(
    (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
