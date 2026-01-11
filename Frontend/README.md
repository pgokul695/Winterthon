# MindCue Frontend

An intelligent React-based web application for generating educational quiz questions from PDFs and YouTube videos. Powered by AI through local Ollama models or Google Gemini API.

## 🌟 Overview

MindCue is a modern, responsive web application that helps students and educators create custom quizzes from educational content. Simply paste text, upload a PDF, or link a YouTube video, and let AI generate comprehensive questions instantly.

## ✨ Features

### Core Capabilities
- 📄 **PDF Support**: Upload and extract text from PDF documents
- 🎥 **YouTube Integration**: Generate questions from video content
- 📝 **Text Input**: Direct transcript input for quick question generation
- ⚡ **Real-time Generation**: Instant question creation with progress tracking
- 🎯 **Interactive Quiz**: Take quizzes with immediate feedback
- 🎨 **Modern UI**: Clean, responsive design built with React and Material-UI
- ⚙️ **Flexible Settings**: Choose between Ollama (local) or Gemini (cloud)
- 🔄 **Adaptive Selection**: Generate questions from specific text selections

### Question Types
- **MCQ** - Multiple Choice Questions (4 options)
- **SOL** - Simple One-Line answers
- **SML** - Short Multi-Line answers
- **TF** - True/False questions
- **FIB** - Fill in the Blanks

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Backend Server** running (see Backend README)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file in the Frontend directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:9006

# Or for production
VITE_API_URL=https://api.mindcue.gokulp.online
```

### 3. Run Development Server

```bash
npm run dev
```

Application will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 🏗️ Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx           # Top navigation bar
│   │   ├── quiz/
│   │   │   ├── Overlay.tsx          # Quiz overlay interface
│   │   │   ├── Question.tsx         # Individual question component
│   │   │   └── QuestionPopup.tsx    # Question display modal
│   │   └── reader/
│   │       ├── PDFReader.tsx        # PDF viewer and text extraction
│   │       └── VideoPlayer.tsx      # YouTube video player
│   ├── api/
│   │   └── api.ts                   # API client with timeout config
│   ├── hooks/
│   │   ├── UseSelection.ts          # Text selection hook
│   │   └── UseTimer.ts              # Quiz timer hook
│   ├── utils/
│   │   └── helpers.ts               # Utility functions
│   ├── App.tsx                      # Main application component
│   ├── App.css                      # Application styles
│   └── main.tsx                     # Application entry point
├── public/                           # Static assets
├── index.html                        # HTML template
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind CSS config
└── tsconfig.json                     # TypeScript config
```

## 🎯 Usage Guide

### 1. Text/Transcript Input Mode

1. Navigate to the text input section
2. Paste your lecture transcript or notes
3. Configure question settings:
   - Select AI mode (Gemini recommended for best quality)
   - Choose model (gemini-2.5-flash is default and recommended)
   - Set question types and counts
4. Click "Generate Questions"
5. Take the quiz or review questions

### 2. PDF Reader Mode

1. Click on the PDF upload area
2. Select a PDF file from your device
3. Read through the PDF content
4. Select specific text you want questions from
5. Click "Generate from Selection"
6. Quiz opens with generated questions

### 3. YouTube Video Mode

1. Paste YouTube video URL
2. Optionally set start/end time for specific segments
3. Select question types and counts
4. Click "Transcribe & Generate"
5. Wait for transcription and question generation
6. Start your quiz

### Settings Panel

Access settings to configure:
- **AI Mode**: Ollama (local, free) or Gemini (cloud, API key required)
- **Model Selection**: Choose from available models
- **Question Types**: Enable/disable specific question formats
- **Question Counts**: Set how many of each type to generate

## 🎨 Components

### PDF Reader
- Built with `react-pdf` and `pdfjs-dist`
- Text selection support
- Page navigation
- Zoom controls
- Download capability

### Video Player
- YouTube embed integration
- Time range selection
- Auto-play controls
- Timestamp support

### Quiz Interface
- Progress tracking
- Timer functionality
- Immediate feedback
- Score calculation
- Review mode

### Question Display
- Clean, readable layout
- Option highlighting
- Explanation display
- Solution reveal

## 🔧 Configuration

### API Integration

The frontend communicates with the backend via REST API:

```typescript
// api/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 600000, // 10 minutes for long operations
});

export const generateQuestions = (payload: any) =>
  API.post("/api/generate", payload, { timeout: 600000 });

export const generateFromYoutube = (payload: any) =>
  API.post("/api/transcribe-and-generate", payload, { timeout: 600000 });
```

### Styling

The application uses:
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - React component library
- **Custom CSS** - App-specific styles in App.css

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:3000` |

## 📦 Dependencies

### Core
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client

### UI Components
- **@mui/material** - Material-UI components
- **@mui/icons-material** - Material icons
- **@emotion/react** - CSS-in-JS
- **Tailwind CSS** - Utility CSS

### PDF Support
- **react-pdf** - PDF rendering
- **pdfjs-dist** - PDF.js library

## 🚨 Troubleshooting

### PDF Not Loading
```bash
# Ensure PDF.js worker is configured
# Check pdfjs-dist version compatibility
npm install pdfjs-dist@latest
```

### API Connection Failed
- Verify backend server is running on correct port
- Check `VITE_API_URL` in .env matches backend URL
- Ensure CORS is configured on backend for your domain
- Check browser console for specific error messages
- Try accessing backend health endpoint directly

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### Slow Question Generation
- Use smaller models (gemma3:2b)
- Reduce question counts
- For YouTube: use time ranges instead of full video
- Check backend server performance and logs
- Ensure 10-minute timeout is configured

### CORS Errors
If you see CORS errors in console:
1. Check backend server is running
2. Verify your domain is in backend's `allowedOrigins` array
3. Check backend console for "Blocked origin" messages
4. Ensure backend CORS middleware is configured correctly

## 🎯 Best Practices

### For Students
1. Start with shorter texts/videos for faster results
2. Use time ranges for long YouTube videos
3. Review explanations after completing quiz
4. Try different question types for variety
5. Save or bookmark important questions

### For Educators
1. Pre-review generated questions for accuracy
2. Use quality models (gemma:7b) for better questions
3. Mix question types for comprehensive assessment
4. Set appropriate difficulty levels
5. Customize question counts based on content length

## 🔐 Security

- No sensitive data stored in local storage
- API calls use HTTPS in production
- CORS configured for trusted domains only
- No user authentication required (public API)
- All API timeouts properly configured

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Mobile browsers (limited PDF support)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Configure environment variables in Vercel dashboard:
- `VITE_API_URL` = Your backend API URL

### Netlify

```bash
# Build
npm run build

# Deploy dist folder
netlify deploy --prod --dir=dist
```

Add environment variable in Netlify dashboard:
- Key: `VITE_API_URL`
- Value: Your backend API URL

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
EXPOSE 5173
```

Build and run:
```bash
docker build -t mindcue-frontend .
docker run -p 5173:5173 -e VITE_API_URL=http://your-backend-url mindcue-frontend
```

## 📊 Performance Optimization

1. **Lazy Loading**: Components loaded on demand
2. **Code Splitting**: Vite automatic chunking
3. **Image Optimization**: Compressed assets
4. **Bundle Size**: Tree shaking enabled
5. **API Timeouts**: 10-minute timeout for long operations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
```

## 🎓 Use Cases

### Students
- Study for exams with custom quizzes
- Create practice questions from lecture notes
- Review YouTube educational videos actively
- Self-assessment and knowledge testing

### Educators
- Generate quiz questions quickly
- Create homework assignments
- Prepare exam materials
- Assess content understanding

### Content Creators
- Validate educational content quality
- Create engagement materials for viewers
- Test comprehension of topics
- Generate discussion questions

## 🔮 Future Enhancements

- [ ] Question bank storage with local persistence
- [ ] User authentication and profiles
- [ ] Quiz history tracking and analytics
- [ ] Export quizzes to PDF, Word, or Google Forms
- [ ] Collaborative quiz creation and sharing
- [ ] Advanced analytics and performance insights
- [ ] Mobile app version (React Native)
- [ ] Offline mode with service workers
- [ ] Spaced repetition learning algorithm
- [ ] Multi-language support

## 📄 License

ISC

## 🔗 Links

- [Backend Repository](../Backend)
- [Live Demo](https://mindcue.gokulp.online)
- [API Documentation](../Backend#api-endpoints)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Material-UI](https://mui.com)
- [Tailwind CSS](https://tailwindcss.com)

## 👨‍💻 Author
AMEENA PARVIN PL
MARIA Joby
Gokul P


## 🙏 Acknowledgments

- OpenAI Whisper for transcription
- Ollama for local AI models
- Google Gemini for cloud AI
- React and Vite communities

---

**MindCue Frontend** - Smart Learning Through AI-Powered Quizzes 🎓
