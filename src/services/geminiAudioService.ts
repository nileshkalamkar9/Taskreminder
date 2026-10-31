// Audio recording and Gemini 3.5 transcription service

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    this.audioChunks = [];
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported on this browser');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Choose optimal mimeType supported by browser
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    }

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Slice chunks every 250ms
  }

  async stopRecording(): Promise<{ blob: Blob; base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not started'));
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });

        // Clean up tracks
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve({ blob, base64, mimeType });
        };
        reader.onerror = () => reject(new Error('Failed to convert audio to base64'));
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}

export const audioRecorder = new AudioRecorderService();

// Transcribe audio using gemini-3.5-transcribe server endpoint
export async function transcribeAudioWithGemini(
  base64Audio: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioData: base64Audio,
      mimeType,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Transcription failed' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.transcript || '';
}
