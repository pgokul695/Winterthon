# Question Generation API - Backend

An Express-based question generation API that supports both Ollama (local) and Google Gemini AI models. Uses text-based parsing for generating educational questions from transcripts.

## Features

- 🤖 **Dual AI Support**: Works with both Ollama and Google Gemini
- 📝 **Text-Based Parsing**: Robust MCQ text parser (no JSON schemas)
- 📊 **Multiple Question Types**: SOL, SML, MCQ, TF, FIB
- 🔍 **Logging System**: JSONL-based logging for all generations
- 🚀 **TypeScript**: Full type safety

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
- Set `GOOGLE_API_KEY` if using Gemini (get from https://makersuite.google.com/app/apikey)
- Set `OLLAMA_BASE_URL` if Ollama is not on localhost:11434

### 3. Install Ollama (Optional)

If using local models, install Ollama from https://ollama.ai

Pull a model:
```bash
ollama pull llama2
# or
ollama pull mistral
```

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /
```

### Get Available Models
```
GET /api/models/ollama
GET /api/models/gemini
```

### Generate Questions
```
POST /api/generate
Content-Type: application/json

{
  "mode": "ollama",  // or "gemini"
  "model": "llama2",
  "transcript": "Your lecture transcript here...",
  "questionTypes": {
    "MCQ": 2,
    "SOL": 1,
    "TF": 1
  }
}
```

Response:
```json
{
  "questions": [
    {
      "questionText": "What is...",
      "options": [
        {"text": "Answer 1", "correct": true, "explanation": "..."},
        {"text": "Answer 2", "correct": false, "explanation": "..."}
      ],
      "solution": "Answer 1",
      "questionType": "MCQ",
      "timeTaken": 3.45,
      "rawOutput": "...",
      "parsedData": {...}
    }
  ],
  "totalTime": 10.2,
  "mode": "ollama",
  "model": "llama2",
  "logId": "20260111_123456"
}
```

### Logs Management
```
GET /api/logs          # Get all logs
GET /api/logs/:id      # Get specific log
DELETE /api/logs       # Clear all logs
```

## Question Types

- **SOL** (Simple One-Line): Brief, factual answer
- **SML** (Short Multi-Line): Paragraph answer
- **MCQ** (Multiple Choice): 4 options, 1 correct
- **TF** (True/False): True or false statement
- **FIB** (Fill in the Blank): Missing word/phrase

## Architecture

```
Backend/
├── server.ts           # Main Express server
├── types.ts            # TypeScript interfaces
├── services/
│   ├── ollama.ts       # Ollama API client
│   ├── gemini.ts       # Gemini API client
│   └── logger.ts       # Logging utilities
├── utils/
│   ├── parsers.ts      # Text parsing (MCQ format)
│   └── prompts.ts      # Prompt generation
└── logs/
    └── question_generation.jsonl
```

## Text Format

Questions are generated in this text format:

```
QUESTION:
Your question text here

CORRECT:
The correct answer

WRONG:
Wrong answer 1
Wrong answer 2
Wrong answer 3

EXPLANATIONS:
CORRECT: Why this is correct
WRONG 1: Why this is wrong
WRONG 2: Why this is wrong
WRONG 3: Why this is wrong
```

## Development

The server uses TypeScript with hot-reload via ts-node-dev:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `OLLAMA_BASE_URL` | Ollama API URL | `http://localhost:11434` |
| `GOOGLE_API_KEY` | Google Gemini API key | `` |

## License

ISC
