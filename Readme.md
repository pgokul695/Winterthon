# 🎓 MindCue - AI-Powered Quiz Generation Platform

Transform educational content into interactive quizzes instantly using the power of AI. MindCue helps students learn smarter and educators create assessments faster.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://mindcue.gokulp.online/)
[![Backend Demo](https://img.shields.io/badge/API-online-brightgreen)](https://mindcueb.gokulp.online/test)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## 🌐 Live Deployments

- **Frontend Application**: [https://mindcue.gokulp.online/](https://mindcue.gokulp.online/)
- **Backend API & Tester**: [https://mindcueb.gokulp.online/test](https://mindcueb.gokulp.online/test)

## 🌟 Overview

MindCue is a comprehensive full-stack application that leverages AI to automatically generate educational quiz questions from multiple content sources. Whether you're studying from PDFs, watching YouTube lectures, or reviewing text transcripts, MindCue creates personalized quizzes to enhance your learning experience.

### Key Highlights

- 🤖 **Dual AI Support**: Choose between local Ollama models or cloud-based Google Gemini
- 📄 **PDF Integration**: Upload and extract text from PDF documents
- 🎥 **YouTube Transcription**: Automatic video-to-text using Whisper AI
- 📝 **Multiple Question Types**: MCQ, True/False, Short Answer, Fill in the Blanks
- ⚡ **Real-time Generation**: Instant question creation with progress tracking
- 🎯 **Interactive Quizzes**: Take generated quizzes with immediate feedback
- 🔄 **Flexible Configuration**: Customize question types, counts, and AI models

## ✨ Features

### For Students
- 📚 Generate practice questions from lecture materials
- 🎬 Create quizzes from educational YouTube videos
- 📖 Extract questions from PDF textbooks
- ✅ Self-assessment with immediate feedback
- ⏱️ Timed quiz mode for exam preparation

### For Educators
- 🚀 Rapid quiz creation from teaching materials
- 📊 Multiple question format support
- 🎯 Customizable difficulty and question counts
- 💾 Export and save generated questions
- 🔍 Quality AI-generated questions with explanations

## 🏗️ Architecture

```
MindCue/
├── Frontend/                 # React + TypeScript + Vite
│   ├── PDF Reader           # Upload and extract text from PDFs
│   ├── YouTube Player       # Video embedding with time selection
│   ├── Quiz Interface       # Interactive quiz taking experience
│   └── Settings Panel       # AI model and question configuration
│
└── Backend/                  # Express + TypeScript
    ├── AI Integration       # Ollama & Gemini support
    ├── YouTube Service      # Whisper transcription
    ├── Question Generator   # Multi-format question creation
    └── API Endpoints        # RESTful API with CORS support
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+
- **Python** 3.8+ (for YouTube transcription)
- **FFmpeg** (for audio processing)
- **Ollama** (optional, for local AI)

### 1. Clone the Repository

```bash
git clone https://github.com/pgokul695/Winterthon.git
cd mindcue
```

### 2. Backend Setup

```bash
cd Backend
npm install

# Install Python dependencies
pip install openai-whisper

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the server
npm run dev
```

Backend will start on `http://localhost:9006`

### 3. Frontend Setup

```bash
cd Frontend
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:9006" > .env

# Run the application
npm run dev
```

Frontend will start on `http://localhost:5173`

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API Tester**: http://localhost:9006/test

## 📖 Usage Guide

### Generate Questions from Text

1. Open the MindCue application
2. Paste your lecture transcript or notes
3. Select AI mode (Ollama/Gemini) and model
4. Choose question types and quantities
5. Click "Generate Questions"
6. Take the interactive quiz

### Generate Questions from PDF

1. Click the PDF upload area
2. Select a PDF file from your device
3. Read through the content
4. Select specific text passages
5. Click "Generate from Selection"
6. Start your quiz immediately

### Generate Questions from YouTube

1. Paste a YouTube video URL
2. Optionally set start/end timestamps
3. Configure question settings
4. Click "Transcribe & Generate"
5. Wait for transcription (uses Whisper AI)
6. Begin your quiz

## 🎯 Question Types

| Type | Description | Best For |
|------|-------------|----------|
| **MCQ** | Multiple Choice (4 options) | Concept testing, comprehension |
| **SOL** | Simple One-Line answers | Fact recall, definitions |
| **SML** | Short Multi-Line answers | Explanations, understanding |
| **TF** | True/False questions | Quick assessment, verification |
| **FIB** | Fill in the Blanks | Terminology, vocabulary |

## 🔧 Configuration

### AI Models

**Google Gemini (Cloud - API Key Required) ⭐ Recommended**
- `gemini-2.5-flash` - **Default & Recommended** - Fast, efficient, high quality
- `gemini-pro` - Premium quality for complex content
- `gemini-1.5-flash` - Balanced performance

**Ollama (Local - Free)**
- `gemma3:latest` - Fast, local alternative
- `gemma:7b` - High quality output
- `gemma3:2b` - Quick generation
- `llama2` - Alternative option
- `mistral` - Alternative option

### Environment Variables

**Backend (.env)**
```env
PORT=9006
GOOGLE_API_KEY=your_gemini_api_key
OLLAMA_BASE_URL=http://localhost:11434
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:9006
```

## 📡 API Endpoints

### Health Check
```http
GET https://mindcueb.gokulp.online/
```

### Generate from Transcript
```http
POST https://mindcueb.gokulp.online/api/generate
Content-Type: application/json

{
  "mode": "ollama",
  "model": "gemma3:latest",
  "transcript": "Your text here...",
  "questionTypes": {
    "MCQ": 2,
    "SOL": 1
  }
}
```

### Generate from YouTube
```http
POST https://mindcueb.gokulp.online/api/transcribe-and-generate
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "mode": "ollama",
  "model": "gemma3:latest",
  "questionTypes": {
    "MCQ": 3
  }
}
```

For complete API documentation, visit: [Backend API Docs](Backend/README.md)

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Material-UI** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **React-PDF** - PDF rendering
- **pdfjs-dist** - PDF.js library

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **Ollama** - Local AI models
- **Google Gemini AI** - Cloud AI
- **OpenAI Whisper** - Speech-to-text
- **FFmpeg** - Audio processing
- **youtube-transcript** - YouTube captions
- **@distube/ytdl-core** - YouTube downloader

## 📊 Performance

- **API Timeout**: 10 minutes (for long video transcriptions)
- **Whisper CPU Mode**: Prevents GPU memory issues
- **Question Generation**: 2-5 seconds per question (varies by model)
- **YouTube Transcription**: ~1-2 minutes per 10-minute video

## 🚨 Troubleshooting

### Backend Not Responding (502 Error)

```bash
# Check if backend is running
curl http://localhost:9006

# Restart backend
cd Backend
npm run dev

# Check logs for errors
```

### CORS Issues

If frontend shows CORS errors:
1. Ensure backend is running
2. Check `allowedOrigins` in backend `server.ts`
3. Verify your domain is listed
4. Restart backend after changes

### Whisper CUDA Out of Memory

The app automatically uses CPU mode. If issues persist:
```bash
export CUDA_VISIBLE_DEVICES=""
```

### PDF Not Loading

```bash
# Update pdfjs-dist
cd Frontend
npm install pdfjs-dist@latest
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd Frontend
vercel --prod
```

Set environment variable:
- `VITE_API_URL` = `https://mindcueb.gokulp.online`

### Backend (VPS/Cloud Server)

```bash
cd Backend
npm run build
npm start

# Or use PM2 for process management
pm2 start npm --name "mindcue-backend" -- start
pm2 save
```

Configure reverse proxy (Nginx):
```nginx
server {
    listen 80;
    server_name mindcueb.gokulp.online;

    location / {
        proxy_pass http://localhost:9006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📁 Project Structure

```
MindCue/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navigation, layout
│   │   │   ├── quiz/            # Quiz interface
│   │   │   └── reader/          # PDF & video players
│   │   ├── api/                 # API client
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Helper functions
│   ├── public/                  # Static assets
│   └── README.md
│
├── Backend/
│   ├── services/
│   │   ├── gemini.ts           # Gemini AI integration
│   │   ├── ollama.ts           # Ollama integration
│   │   ├── youtube.ts          # YouTube & Whisper
│   │   └── logger.ts           # Logging service
│   ├── utils/
│   │   ├── parsers.ts          # Question parsers
│   │   └── prompts.ts          # AI prompts
│   ├── public/
│   │   └── test.html           # API tester
│   ├── logs/                   # Generation logs
│   ├── temp/                   # Temporary files
│   └── README.md
│
├── Readme.md                   # This file
└── Featurelist.md             # Feature roadmap
```

## 🔐 Security

- ✅ CORS enabled for trusted domains
- ✅ API timeouts configured (10 min)
- ✅ Environment variables for sensitive data
- ✅ HTTPS in production
- ✅ No sensitive data in logs
- ⚠️ API keys should never be committed

## 📈 Future Roadmap

- [ ] User authentication & profiles
- [ ] Question bank storage & history
- [ ] Export to PDF/Word/Google Forms
- [ ] Collaborative quiz creation
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline mode with service workers
- [ ] Multi-language support
- [ ] Spaced repetition algorithm
- [ ] Integration with LMS platforms

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write descriptive commit messages
- Add types for all functions
- Test with both Ollama and Gemini
- Update documentation for new features
- Ensure CORS is properly configured

## 📝 Documentation

- [Frontend README](Frontend/README.md) - Detailed frontend documentation
- [Backend README](Backend/README.md) - Detailed backend documentation
- [API Tester](https://mindcueb.gokulp.online/test) - Interactive API testing

## 📄 License

ISC - See [LICENSE](LICENSE) file for details

## 👨‍💻 Author

**Gokul P**

- Portfolio: [gokulp.online](https://gokulp.online)
- Frontend: [mindcue.gokulp.online](https://mindcue.gokulp.online)
- Backend: [mindcueb.gokulp.online](https://mindcueb.gokulp.online)

## 🙏 Acknowledgments

- **OpenAI** - Whisper speech recognition
- **Ollama** - Local AI model deployment
- **Google** - Gemini AI API
- **React Team** - React framework
- **Vercel** - Frontend hosting
- **The Open Source Community** - Various tools and libraries

## 📞 Support

- 🐛 [Report a Bug](https://github.com/yourusername/mindcue/issues)
- 💡 [Request a Feature](https://github.com/yourusername/mindcue/issues)
- 📧 Email: support@gokulp.online

## ⭐ Show Your Support

If you find MindCue helpful, please consider:
- Starring the repository ⭐
- Sharing with fellow students and educators
- Contributing to the project
- Reporting bugs and suggesting features

---

<div align="center">

**MindCue** - Transform Learning with AI 🎓

[Frontend](https://mindcue.gokulp.online/) • [Backend API](https://mindcueb.gokulp.online/test) • [Documentation](./Readme.md)

Made with ❤️ for better education

</div>
