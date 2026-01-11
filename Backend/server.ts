import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { QuestionRequest, QuestionResponse, GeneratedQuestion } from "./types";
import { parseMCQText } from "./utils/parsers";
import { createQuestionPrompt } from "./utils/prompts";
import { getOllamaModels, generateWithOllama } from "./services/ollama";
import { getGeminiModels, generateWithGemini } from "./services/gemini";
import { saveLog, loadLogs, clearLogs, getLogById } from "./services/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
        try {
          // Create prompt
          const prompt = createQuestionPrompt(
            questionType,
            request.transcript,
            generatedQuestionsText
          );
          
          const qStart = Date.now();
          let generatedText: string;
          
          // Generate based on mode
          if (request.mode === "ollama") {
            generatedText = await generateWithOllama(request.model, prompt);
          } else {
            generatedText = await generateWithGemini(request.model, prompt);
          }
          
          const qTime = (Date.now() - qStart) / 1000;
          
          // Parse the response
          const parsed = parseMCQText(generatedText);
          
          const questionData: GeneratedQuestion = {
            questionText: parsed.question,
            options: [
              { text: parsed.correct, correct: true, explanation: parsed.explanations[0] },
              { text: parsed.wrong[0], correct: false, explanation: parsed.explanations[1] },
              { text: parsed.wrong[1], correct: false, explanation: parsed.explanations[2] },
              { text: parsed.wrong[2], correct: false, explanation: parsed.explanations[3] },
            ],
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

