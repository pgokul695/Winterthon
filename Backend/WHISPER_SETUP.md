# YouTube Transcription Setup (FREE - No API Costs!)

## Install Local Whisper

The system now uses **free, open-source Whisper** running locally instead of paid APIs.

### Option 1: OpenAI Whisper (Python - Recommended)

```bash
# Install Whisper
pip install openai-whisper

# Install ffmpeg (required for audio processing)
# On Ubuntu/Debian:
sudo apt install ffmpeg

# On macOS:
brew install ffmpeg

# On Windows (using chocolatey):
choco install ffmpeg
```

### Option 2: Faster Whisper (Python - More efficient)

```bash
pip install faster-whisper
```

### Verify Installation

```bash
# Test that whisper is available
which whisper

# Try transcribing a test file
whisper --help
```

## How It Works

1. **Existing Captions** → Uses YouTube captions if available (instant, free)
2. **Local Whisper** → Generates captions locally using AI (FREE, takes 1-2 minutes)
3. **Video Metadata** → Falls back to title/description if all else fails

## Models Available

- `tiny` - Fastest, least accurate (default, ~1 min for 10 min video)
- `base` - Good balance of speed and accuracy
- `small` - Better accuracy, slower
- `medium` - High accuracy, much slower
- `large` - Best accuracy, very slow

Current setting: **tiny model** for speed (good enough for questions)

## No API Costs!

- ✅ 100% free
- ✅ Runs locally on your machine
- ✅ No usage limits
- ✅ No API keys needed
- ✅ Works offline (after model download)

## Server Status

Server automatically uses local Whisper when videos don't have captions.
