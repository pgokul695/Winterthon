import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables FIRST before importing any services
dotenv.config();

import { QuestionRequest, QuestionResponse, GeneratedQuestion, YoutubeQuestionRequest } from "./types";
import { parseMCQText } from "./utils/parsers";
import { createQuestionPrompt } from "./utils/prompts";
import { getOllamaModels, generateWithOllama } from "./services/ollama";
import { getGeminiModels, generateWithGemini } from "./services/gemini";
import { saveLog, loadLogs, clearLogs, getLogById } from "./services/logger";
import { extractVideoId, fetchYoutubeTranscript } from "./services/youtube";

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - Allow all origins for testing
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Question Generation API",
    endpoints: {
      health: "GET /",
      ollamaModels: "GET /api/models/ollama",
      geminiModels: "GET /api/models/gemini",
      generate: "POST /api/generate",
      logs: "GET /api/logs",
      logById: "GET /api/logs/:id",
      clearLogs: "DELETE /api/logs",
      transcribeAndGenerate: "POST /api/transcribe-and-generate",
    },
  });
});

// Get Ollama models
app.get("/api/models/ollama", async (req: Request, res: Response) => {
  try {
    const models = await getOllamaModels();
    res.json({ models });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Gemini models
app.get("/api/models/gemini", async (req: Request, res: Response) => {
  try {
    const models = getGeminiModels();
    res.json({ models });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate questions
app.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const request: QuestionRequest = req.body;
    
    // Validate request
    if (!request.mode || !request.model || !request.transcript || !request.questionTypes) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const startTime = Date.now();
    const allQuestions: GeneratedQuestion[] = [];
    const allPrompts: Array<{
      questionType: string;
      prompt: string;
      response: string;
      timeTaken: number;
    }> = [];
    
    const logId = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const generatedQuestionsText: string[] = [];
    
    // Generate questions for each type
    for (const [questionType, count] of Object.entries(request.questionTypes)) {
      if (count <= 0) continue;
      
      for (let i = 0; i < count; i++) {
        const qStart = Date.now();
        let generatedText: string = '';
        let prompt: string = '';
        
        try {
          // Create prompt
          prompt = createQuestionPrompt(
            questionType,
            request.transcript,
            generatedQuestionsText
          );
          
          // Generate based on mode
          if (request.mode === "ollama") {
            generatedText = await generateWithOllama(request.model, prompt);
          } else {
            generatedText = await generateWithGemini(request.model, prompt);
          }
          
          const qTime = (Date.now() - qStart) / 1000;
          
          // Parse the response
          const parsed = parseMCQText(generatedText);
          
          // Create options array and shuffle
          const options = shuffleArray([
            { text: parsed.correct, correct: true, explanation: parsed.explanations[0] },
            { text: parsed.wrong[0], correct: false, explanation: parsed.explanations[1] },
            { text: parsed.wrong[1], correct: false, explanation: parsed.explanations[2] },
            { text: parsed.wrong[2], correct: false, explanation: parsed.explanations[3] },
          ]);
          
          const questionData: GeneratedQuestion = {
            questionText: parsed.question,
            options,
            solution: parsed.correct,
            questionType,
            timeTaken: qTime,
            rawOutput: generatedText,
            parsedData: parsed,
          };
          
          allQuestions.push(questionData);
          generatedQuestionsText.push(parsed.question);
          
          allPrompts.push({
            questionType,
            prompt,
            response: generatedText,
            timeTaken: qTime,
          });
        } catch (error: any) {
          console.error(`Error generating question ${i + 1} of type ${questionType}:`, error.message);
          
          // Log raw output for debugging
          if (generatedText) {
            console.error(`\n=== RAW OUTPUT THAT FAILED ===`);
            console.error(generatedText);
            console.error(`=== END RAW OUTPUT ===\n`);
            
            allPrompts.push({
              questionType,
              prompt,
              response: `ERROR: ${error.message}\n\nRaw output:\n${generatedText}`,
              timeTaken: (Date.now() - qStart) / 1000,
            });
          }
          continue;
        }
      }
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    
    // Save log
    const logEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      mode: request.mode,
      model: request.model,
      questionTypes: request.questionTypes,
      totalTime,
      questionsGenerated: allQuestions.length,
      questions: allQuestions,
      prompts: allPrompts,
      transcript: request.transcript.length > 500 
        ? request.transcript.substring(0, 500) + "..."
        : request.transcript,
    };
    
    saveLog(logEntry);
    
    const response: QuestionResponse = {
      questions: allQuestions,
      totalTime,
      mode: request.mode,
      model: request.model,
      logId,
    };
    
    res.json(response);
  } catch (error: any) {
    console.error("Error in generate endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});
//YouTube transcription + question generation
app.post("/api/transcribe-and-generate", async (req: Request, res: Response) => {
  try {
    const youtubeRequest: YoutubeQuestionRequest = req.body;
    
    // Validate required field
    if (!youtubeRequest.videoUrl) {
      return res.status(400).json({ error: "videoUrl is required" });
    }

    // Set defaults based on mode
    const mode = youtubeRequest.mode || "ollama";
    const model = youtubeRequest.model || (mode === "gemini" ? "gemini-2.5-flash" : "gemma3:latest");
    const questionTypes = youtubeRequest.questionTypes || { "MCQ": 3 };
    const startTime = youtubeRequest.startTime;
    const endTime = youtubeRequest.endTime;

    console.log(`[YouTube] Extracting transcript from: ${youtubeRequest.videoUrl}`);
    console.log(`[YouTube] Time range: ${startTime || 0}s - ${endTime || 'end'}s`);

    // Extract video ID
    let videoId: string;
    try {
      videoId = extractVideoId(youtubeRequest.videoUrl);
      console.log(`[YouTube] Video ID: ${videoId}`);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch transcript
    let transcript: string;
    try {
      transcript = await fetchYoutubeTranscript(videoId, startTime, endTime);
      console.log(`[YouTube] Transcript fetched: ${transcript.length} characters`);
    } catch (error: any) {
      console.error(`[YouTube] Error fetching transcript:`, error.message);
      return res.status(500).json({ 
        error: `Failed to fetch YouTube transcript: ${error.message}`,
        suggestion: "Make sure the video has captions/subtitles available"
      });
    }

    // Now generate questions using the same logic as /api/generate
    const startTimeGen = Date.now();
    const allQuestions: GeneratedQuestion[] = [];
    const allPrompts: Array<{
      questionType: string;
      prompt: string;
      response: string;
      timeTaken: number;
    }> = [];
    
    const logId = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    const generatedQuestionsText: string[] = [];
    
    // Generate questions for each type
    for (const [questionType, count] of Object.entries(questionTypes)) {
      if (count <= 0) continue;
      
      for (let i = 0; i < count; i++) {
        const qStart = Date.now();
        let generatedText: string = '';
        let prompt: string = '';
        
        try {
          // Create prompt
          prompt = createQuestionPrompt(
            questionType,
            transcript,
            generatedQuestionsText
          );
          
          // Generate based on mode
          if (mode === "ollama") {
            generatedText = await generateWithOllama(model, prompt);
          } else {
            generatedText = await generateWithGemini(model, prompt);
          }
          
          const qTime = (Date.now() - qStart) / 1000;
          
          // Parse the response
          const parsed = parseMCQText(generatedText);
          
          // Create options array and shuffle
          const options = shuffleArray([
            { text: parsed.correct, correct: true, explanation: parsed.explanations[0] },
            { text: parsed.wrong[0], correct: false, explanation: parsed.explanations[1] },
            { text: parsed.wrong[1], correct: false, explanation: parsed.explanations[2] },
            { text: parsed.wrong[2], correct: false, explanation: parsed.explanations[3] },
          ]);
          
          const questionData: GeneratedQuestion = {
            questionText: parsed.question,
            options,
            solution: parsed.correct,
            questionType,
            timeTaken: qTime,
            rawOutput: generatedText,
            parsedData: parsed,
          };
          
          allQuestions.push(questionData);
          generatedQuestionsText.push(parsed.question);
          
          allPrompts.push({
            questionType,
            prompt,
            response: generatedText,
            timeTaken: qTime,
          });
        } catch (error: any) {
          console.error(`Error generating question ${i + 1} of type ${questionType}:`, error.message);
          
          // Save failed prompt for debugging
          try {
            if (typeof generatedText !== 'undefined') {
              console.error(`Raw output that failed to parse:\n${generatedText}`);
              allPrompts.push({
                questionType,
                prompt,
                response: `ERROR: ${error.message}\n\nRaw output:\n${generatedText}`,
                timeTaken: (Date.now() - qStart) / 1000,
              });
            }
          } catch {}
          continue;
        }
      }
    }
    
    const totalTime = (Date.now() - startTimeGen) / 1000;
    
    // Save log with YouTube metadata
    const logEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      mode,
      model,
      questionTypes,
      totalTime,
      questionsGenerated: allQuestions.length,
      questions: allQuestions,
      prompts: allPrompts,
      transcript: transcript.length > 500 
        ? transcript.substring(0, 500) + "..."
        : transcript,
      youtube: {
        videoId,
        videoUrl: youtubeRequest.videoUrl,
        startTime,
        endTime,
        transcriptLength: transcript.length,
      }
    };
    
    saveLog(logEntry);
    
    const response: QuestionResponse = {
      questions: allQuestions,
      totalTime,
      mode,
      model,
      logId,
    };
    
    res.json(response);
  } catch (error: any) {
    console.error("Error in transcribe-and-generate endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

// 
// Get all logs
app.get("/api/logs", (req: Request, res: Response) => {
  try {
    const logs = loadLogs();
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get log by ID
app.get("/api/logs/:id", (req: Request, res: Response) => {
  try {
    const log = getLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }
    res.json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all logs
app.delete("/api/logs", (req: Request, res: Response) => {
  try {
    clearLogs();
    res.json({ message: "Logs cleared successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Question Generation API running on http://localhost:${PORT}`);
  console.log(`📝 Text-based question generation with Ollama and Gemini`);
  console.log(`📊 Logs saved to logs/question_generation.jsonl`);
});

