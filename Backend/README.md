# MindCue Backend - Question Generation API

A powerful Express-based REST API that generates educational questions from lecture transcripts and YouTube videos using AI. Supports both local Ollama models and Google Gemini AI for flexible deployment options.

## 🌟 Overview

MindCue Backend is an intelligent question generation service that helps educators and students create assessment questions automatically from educational content. It features dual AI support, YouTube transcription, and multiple question formats.

## ✨ Features

### Core Capabilities
- 🤖 **Dual AI Support**: Seamlessly switch between Ollama (local) and Google Gemini (cloud)
- 🎥 **YouTube Integration**: Automatic video transcription using Whisper AI
- 📝 **Text-Based Parsing**: Robust question parser with fallback mechanisms
- 📊 **5 Question Types**: 
  - **MCQ**: Multiple Choice Questions with 4 options
  - **SOL**: Simple One-Line answers
  - **SML**: Short Multi-Line answers
  - **TF**: True/False questions
  - **FIB**: Fill in the Blanks
- ⏱️ **Time Range Support**: Generate questions from specific video segments
- 🔍 **Comprehensive Logging**: JSONL-based logging with unique IDs
- 🌐 **CORS Enabled**: Ready for production deployment
- 🚀 **TypeScript**: Full type safety and IDE support
- 🧪 **Test Interface**: Built-in test page at `/test` endpoint

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Python 3.8+** (for Whisper transcription)
- **FFmpeg** (for audio processing)
- **Ollama** (optional, for local AI models)
- **OpenAI Whisper** (optional, for YouTube transcription)

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Python Dependencies (for YouTube features)

```bash
pip install openai-whisper
```

### 3. Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### 4. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=9006

# Google Gemini API (Optional - for cloud AI)
GOOGLE_API_KEY=your_api_key_here
# Get your key from: https://makersuite.google.com/app/apikey

# Ollama Configuration (Optional - for local AI)
OLLAMA_BASE_URL=http://localhost:11434

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://mindcue.gokulp.online,https://mindcueb.gokulp.online,http://localhost:5173
```

### 5. Install Ollama (Optional - For Local Models)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull recommended models:

```bash
# Fast, efficient model (recommended)
ollama pull gemma3:latest

# Alternative models
ollama pull llama2
ollama pull mistral
ollama pull gemma:7b  # For quality output
ollama pull gemma3:2b # For quick output
```

### 6. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server will start on `http://localhost:9006`

### 7. Test the API

Visit `http://localhost:9006/test` for an interactive API tester, or check health:

```bash
curl http://localhost:9006
```

## 📡 API Endpoints

### Health Check
```http
GET /
```

Returns API status and available endpoints.

### Test Interface
```http
GET /test
```

Interactive web interface for testing the API.

### Get Available Models

**Ollama Models:**
```http
GET /api/models/ollama
```

**Gemini Models:**
```http
GET /api/models/gemini
```

Response:
```json
{
  "models": ["gemma3:latest", "llama2", "mistral"]
}
```

### Generate Questions from Transcript

```http
POST /api/generate
Content-Type: application/json
```

**Request Body:**
```json
{
  "mode": "ollama",
  "model": "gemma3:latest",
  "transcript": "The nervous system is one of the most complex systems in the human body...",
  "questionTypes": {
    "MCQ": 2,
    "SOL": 1,
    "SML": 1,
    "TF": 1,
    "FIB": 0
  }
}
```

**Response:**
```json
{
  "mode": "ollama",
  "model": "gemma3:latest",
  "questions": [
    {
      "questionText": "What is the nervous system primarily composed of?",
      "options": [
        {"text": "Neurons", "correct": true, "explanation": "Neurons are the basic units"},
        {"text": "Muscles", "correct": false, "explanation": "Muscles are not part of nervous system"},
        {"text": "Bones", "correct": false, "explanation": "Bones are skeletal system"},
        {"text": "Blood cells", "correct": false, "explanation": "Blood cells are circulatory system"}
      ],
      "solution": "Neurons",
      "questionType": "MCQ",
      "timeTaken": 3.45
    }
  ],
  "totalTime": 12.34,
  "logId": "1234567890-abcdef"
}
```

### Generate Questions from YouTube Video

```http
POST /api/transcribe-and-generate
Content-Type: application/json
```

**Request Body:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "startTime": 0,
  "endTime": 300,
  "mode": "ollama",
  "model": "gemma3:latest",
  "questionTypes": {
    "MCQ": 3,
    "SOL": 1
  }
}
```

**Supported URL formats:**
- Full URL: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URL: `https://youtu.be/VIDEO_ID`
- Video ID: `VIDEO_ID`

**Response:** Same as `/api/generate`

### Logging Endpoints

**Get All Logs:**
```http
GET /api/logs
```

**Get Log by ID:**
```http
GET /api/logs/:id
```

**Clear All Logs:**
```http
DELETE /api/logs
```

## 🏗️ Project Structure

```
Backend/
├── server.ts              # Main Express server
├── types.ts               # TypeScript type definitions
├── services/
│   ├── gemini.ts         # Google Gemini AI integration
│   ├── ollama.ts         # Ollama local AI integration
│   ├── youtube.ts        # YouTube transcription service
│   └── logger.ts         # Logging service
├── utils/
│   ├── parsers.ts        # Question text parsers
│   └── prompts.ts        # AI prompt templates
├── public/
│   └── test.html         # Interactive API tester
├── logs/
│   └── question_generation.jsonl  # Generation logs
└── temp/                  # Temporary files (audio, transcripts)
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `9006` | No |
| `GOOGLE_API_KEY` | Gemini API key | - | For Gemini mode |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` | For Ollama mode |

### Supported AI Models

**Ollama (Local):**
- `gemma3:latest` - Recommended for speed
- `gemma:7b` - Better quality
- `gemma3:2b` - Quick output
- `llama2` - Alternative model
- `mistral` - Alternative model

**Gemini (Cloud):**
- `gemini-2.5-flash` - Fast and efficient
- `gemini-pro` - High quality
- `gemini-1.5-flash` - Balanced

## 🎯 Question Types Explained

### MCQ (Multiple Choice Questions)
- 4 options per question
- One correct answer
- Includes explanations for each option
- Best for testing comprehension

### SOL (Simple One-Line)
- Short answer format
- Single sentence responses
- Good for fact recall

### SML (Short Multi-Line)
- Paragraph-style answers
- 2-4 sentences
- Tests understanding and explanation ability

### TF (True/False)
- Binary choice questions
- Quick assessment
- Tests basic knowledge

### FIB (Fill in the Blanks)
- Sentence completion
- Tests specific terminology
- Good for vocabulary

## 🚨 Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve
```

### Whisper CUDA Out of Memory
The API automatically forces CPU usage for Whisper to avoid GPU memory issues. If you still face problems:

```bash
# Set environment variable
export CUDA_VISIBLE_DEVICES=""
```

### FFmpeg Not Found
```bash
# Verify FFmpeg installation
ffmpeg -version

# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

### YouTube Download Fails
- Check your internet connection
- Ensure the video is publicly accessible
- Try using the video ID instead of full URL
- Some videos may be geo-restricted

### Port Already in Use
```bash
# Kill process on port 9006
lsof -ti:9006 | xargs kill -9

# Or use a different port
PORT=3000 npm run dev
```

## 📊 Performance Tips

1. **Use Smaller Models**: `gemma3:2b` for faster generation
2. **Limit Question Count**: 2-3 questions per type is optimal
3. **Time Ranges**: For long videos, use startTime/endTime
4. **Local vs Cloud**: Ollama is slower but free; Gemini is faster but has API limits
5. **CPU vs GPU**: Whisper uses CPU to avoid memory issues (slower but reliable)

## 🔐 Security Notes

- Never commit `.env` file with API keys
- Use environment variables for production
- Enable CORS only for trusted domains
- Regularly update dependencies
- Logs contain user inputs - handle securely

## 📝 Logging

All question generations are logged to `logs/question_generation.jsonl` with:
- Unique log ID
- Timestamp
- Mode and model used
- Transcript (truncated)
- Generated questions
- Generation time
- Errors (if any)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add types for all functions
3. Write descriptive commit messages
4. Test with both Ollama and Gemini
5. Update documentation for new features

## 📄 License

ISC

## 🔗 Links

- [Ollama Documentation](https://ollama.ai)
- [Google Gemini API](https://makersuite.google.com)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [FFmpeg](https://ffmpeg.org)

## 👨‍💻 Author

Gokul P
Vandana S

---

**MindCue Backend** - Intelligent Question Generation for Modern Education
