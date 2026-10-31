import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support large payloads for base64 audio
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System role definitions
const SYSTEM_ROLES: Record<string, string> = {
  executive: `You are the VocaDo Acoustic Command Executive & Task Strategist.
Your goal is to help users manage high-velocity technical tasks, decompose ambitious workflows, prioritize urgent deadlines, and formulate structured action steps.
Respond with clarity, technical rigor, and concise bullet points tailored for dark-mode command center users. You can recommend tasks to add directly to the queue.`,

  engineer: `You are the VocaDo DSP & Acoustic Research Engineer.
You specialize in digital signal processing, Web Audio API, Fourier Transforms (FFT), speech recognition algorithms, latency benchmarking, and frontend/backend software architecture.
Provide precise, technical, and actionable engineering solutions.`,

  logistics: `You are the VocaDo Errand & Location Operations Coordinator.
You help engineers and researchers coordinate in-person meetings, identify tech hubs, hardware supply stores, quiet research cafes, electronics labs, and transit routes.
When Google Maps grounding is active, integrate real location details, place names, addresses, and directions.`,
};

// ==========================================
// 1. Multi-Turn Gemini Chatbot Endpoint
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      messages, 
      role = 'executive', 
      model = 'gemini-3.8-flash', 
      enableMaps = false,
      userLocation
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Determine target model
    let targetModel = model;
    // Map alias or fallback
    if (model === 'complex' || model === 'gemini-4-argon') {
      targetModel = 'gemini-4-argon';
    } else if (model === 'fast' || model === 'gemini-3.1-flash-lite') {
      targetModel = 'gemini-3.1-flash-lite';
    } else {
      targetModel = 'gemini-3.8-flash';
    }

    // If Maps is enabled, Google Maps grounding requires gemini-3.8-flash
    if (enableMaps) {
      targetModel = 'gemini-3.8-flash';
    }

    const systemInstruction = SYSTEM_ROLES[role] || SYSTEM_ROLES.executive;

    // Build chat contents from history
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const config: any = {
      systemInstruction,
    };

    // Google Maps Grounding tool integration
    if (enableMaps) {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            },
          },
        };
      }
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const replyText = response.text || '';

    // Extract Maps grounding links if present
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const mapSources: Array<{ title: string; uri: string; snippets?: string[] }> = [];

    if (Array.isArray(rawChunks)) {
      for (const chunk of rawChunks) {
        if (chunk && (chunk as any).maps) {
          const mapsData = (chunk as any).maps;
          const uri = mapsData.uri || '';
          const title = mapsData.title || 'View on Google Maps';
          const snippets = mapsData.placeAnswerSources?.reviewSnippets?.map((s: any) => s.snippet) || [];
          if (uri) {
            mapSources.push({ title, uri, snippets });
          }
        }
      }
    }

    return res.json({
      text: replyText,
      modelUsed: targetModel,
      mapSources,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Error communicating with Gemini model',
      status: error?.status || 500,
    });
  }
});

// ==========================================
// 2. Audio Transcription via gemini-3.5-transcribe
// ==========================================
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Clean base64 prefix if client sent data URI
    const cleanBase64 = audioData.includes(',') ? audioData.split(',')[1] : audioData;

    const audioPart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this spoken audio recording accurately into text. Output only the transcribed text without conversational commentary.',
          },
        ],
      },
    });

    const transcript = (response.text || '').trim();

    return res.json({
      transcript,
      modelUsed: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
    });
  }
});

// ==========================================
// 3. Smart Task Decomposer Endpoint
// ==========================================
app.post('/api/decompose-task', async (req, res) => {
  try {
    const { taskTitle, project } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const prompt = `Decompose this engineering task into 3 to 4 sequential, high-leverage execution steps:
Task: "${taskTitle}"
Project: "${project || 'General'}"
Output a JSON array of short string sub-steps. Example: ["Step 1", "Step 2", "Step 3"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let steps: string[] = [];
    try {
      steps = JSON.parse(response.text || '[]');
    } catch {
      steps = [
        'Analyze architecture parameters',
        'Implement prototype test suite',
        'Verify latency and throughput metrics',
      ];
    }

    return res.json({ steps });
  } catch (error: any) {
    console.error('Task decomposition error:', error);
    return res.status(500).json({ error: error?.message || 'Decomposition failed' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`VocaDo Acoustic Server listening on port ${PORT}`);
  });
}

startServer();
