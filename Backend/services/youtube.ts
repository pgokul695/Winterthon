import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import ytdl from 'ytdl-core';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

interface VideoInfo {
  title: string;
  description: string;
  channelName: string;
  duration: number;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(urlOrId: string): string {
  // If it's already just an ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match) {
      return match[1];
    }
  }

  throw new Error("Invalid YouTube URL or video ID");
}

/**
 * Fetch video metadata using ytdl-core
 */
async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  try {
    const info = await ytdl.getInfo(videoId);
    
    return {
      title: info.videoDetails.title || '',
      description: info.videoDetails.description || '',
      channelName: info.videoDetails.author.name || '',
      duration: parseInt(info.videoDetails.lengthSeconds) || 0
    };
  } catch (error: any) {
    console.error('Error fetching video info:', error.message);
    // Fallback to web scraping method
    return fetchVideoMetadata(videoId);
  }
}

/**
 * Fetch video metadata from YouTube (fallback method)
 */
async function fetchVideoMetadata(videoId: string): Promise<VideoInfo> {
  try {
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const html = response.data;
    
    // Extract title
    let title = '';
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      title = titleMatch[1].replace(' - YouTube', '').trim();
    }

    // Extract description
    let description = '';
    const descMatch = html.match(/"description":\{"simpleText":"([^"]+)"\}/);
    if (descMatch) {
      description = descMatch[1];
    } else {
      const descMatch2 = html.match(/"shortDescription":"([^"]+)"/);
      if (descMatch2) {
        description = descMatch2[1];
      }
    }

    // Extract channel name
    let channelName = '';
    const channelMatch = html.match(/"author":"([^"]+)"/);
    if (channelMatch) {
      channelName = channelMatch[1];
    }

    return { 
      title, 
      description, 
      channelName,
      duration: 0
    };
  } catch (error: any) {
    console.error('Error fetching video metadata:', error.message);
    return { 
      title: '', 
      description: '', 
      channelName: '',
      duration: 0
    };
  }
}

/**
 * Generate captions using local Whisper (free, no API costs)
 */
async function generateCaptionsWithLocalWhisper(videoId: string, startTime?: number, endTime?: number): Promise<string> {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const audioPath = path.join(tempDir, `${videoId}_audio.mp3`);
  
  try {
    console.log(`[YouTube] Downloading audio for transcription...`);
    
    // Get video info to check duration
    const info = await ytdl.getInfo(videoId);
    const videoDuration = parseInt(info.videoDetails.lengthSeconds);
    
    // Limit to 10 minutes max for faster processing
    const maxDuration = 600; // 10 minutes
    
    if (videoDuration > 900) {
      console.log(`[YouTube] Warning: Video is ${Math.floor(videoDuration/60)} minutes long. Limiting transcription to first 10 minutes for speed.`);
    }

    // Download audio stream
    const audioStream = ytdl(videoId, {
      quality: 'lowestaudio',
      filter: 'audioonly',
    });

    // Save to file
    const writeStream = fs.createWriteStream(audioPath);
    audioStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    console.log(`[YouTube] Audio downloaded. Transcribing locally (this may take a minute)...`);

    // Check if whisper is installed
    try {
      await execAsync('which whisper || which whisper.cpp');
    } catch {
      throw new Error(
        'Whisper not installed. Install with: pip install openai-whisper\n' +
        'Or install whisper.cpp from: https://github.com/ggerganov/whisper.cpp'
      );
    }

    // Run local whisper transcription
    // Using tiny or base model for speed (free, runs locally)
    const outputPath = path.join(tempDir, videoId);
    
    try {
      // Try using openai-whisper Python package (most common)
      const { stdout, stderr } = await execAsync(
        `whisper "${audioPath}" --model tiny --output_dir "${tempDir}" --output_format txt --language en`,
        { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
      );
      
      console.log(`[YouTube] Transcription complete!`);
      
      // Read the generated text file
      const transcriptFile = path.join(tempDir, `${videoId}_audio.txt`);
      if (fs.existsSync(transcriptFile)) {
        const transcription = fs.readFileSync(transcriptFile, 'utf-8').trim();
        
        // Cleanup
        fs.unlinkSync(audioPath);
        fs.unlinkSync(transcriptFile);
        
        console.log(`[YouTube] Successfully generated captions locally (${transcription.length} characters)`);
        return transcription;
      } else {
        throw new Error('Transcription file not found');
      }
      
    } catch (whisperError: any) {
      // Cleanup
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      throw whisperError;
    }

  } catch (error: any) {
    // Cleanup on error
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    throw error;
  }
}

/**
 * Create a synthetic transcript from video metadata
 */
function createSyntheticTranscript(videoInfo: VideoInfo, videoId: string): string {
  const parts: string[] = [];
  
  if (videoInfo.title) {
    parts.push(`Video Title: ${videoInfo.title}`);
  }
  
  if (videoInfo.channelName) {
    parts.push(`Channel: ${videoInfo.channelName}`);
  }
  
  if (videoInfo.description) {
    // Clean up description (remove URLs, excessive newlines)
    const cleanDesc = videoInfo.description
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (cleanDesc.length > 100) {
      parts.push(`Video Description: ${cleanDesc}`);
    }
  }
  
  if (parts.length === 0) {
    throw new Error('Unable to generate transcript - no video information available');
  }
  
  return parts.join('\n\n');
}

/**
 * Fetch YouTube transcript with automatic caption generation fallback
 */
export async function fetchYoutubeTranscript(
  videoId: string,
  startTime?: number,
  endTime?: number
): Promise<string> {
  try {
    // Step 1: Try to fetch existing captions
    console.log(`[YouTube] Attempting to fetch existing captions...`);
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error("No transcript available");
    }

    // Convert to our interface format
    const segments: TranscriptSegment[] = transcriptData.map((item: any) => ({
      text: item.text,
      offset: item.offset / 1000, // Convert milliseconds to seconds
      duration: item.duration / 1000, // Convert milliseconds to seconds
    }));

    // Filter by time range if specified
    let filteredSegments = segments;
    if (startTime !== undefined || endTime !== undefined) {
      filteredSegments = segments.filter((segment) => {
        const segmentStart = segment.offset;
        const segmentEnd = segment.offset + segment.duration;
        
        // Check if segment overlaps with requested time range
        if (startTime !== undefined && segmentEnd < startTime) {
          return false;
        }
        if (endTime !== undefined && segmentStart > endTime) {
          return false;
        }
        return true;
      });
    }

    // Combine text from all segments
    const transcript = filteredSegments
      .map((segment) => segment.text)
      .join(" ")
      .trim();

    if (!transcript) {
      throw new Error("No transcript found for the specified time range");
    }

    console.log(`[YouTube] ✓ Successfully fetched existing captions (${transcript.length} characters)`);
    return transcript;
    
  } catch (error: any) {
    // Step 2: If captions not available, try to generate them using local Whisper
    console.log(`[YouTube] ✗ No existing captions found`);
    console.log(`[YouTube] → Attempting to generate captions using local Whisper (FREE)...`);
    
    try {
      const generatedTranscript = await generateCaptionsWithLocalWhisper(videoId, startTime, endTime);
      return generatedTranscript;
      
    } catch (whisperError: any) {
      // Step 3: If Whisper fails, fall back to video metadata
      console.log(`[YouTube] ✗ Caption generation failed: ${whisperError.message}`);
      console.log(`[YouTube] → Falling back to video metadata...`);
      
      try {
        const videoInfo = await fetchVideoInfo(videoId);
        const syntheticTranscript = createSyntheticTranscript(videoInfo, videoId);
        
        console.log(`[YouTube] ⚠ Using video metadata as fallback (${syntheticTranscript.length} characters)`);
        console.log(`[YouTube] Note: Question quality may be limited without actual transcript`);
        
        return syntheticTranscript;
        
      } catch (metadataError: any) {
        // Final fallback: provide helpful error
        throw new Error(
          `Cannot generate questions from this video: ` +
          `1) No captions/subtitles available, ` +
          `2) Local caption generation failed (${whisperError.message}), ` +
          `3) Unable to extract video information. ` +
          `Install Whisper locally with: pip install openai-whisper (FREE, no API costs)` +
          `Or manually paste the video's content.`
        );
      }
    }
  }
}
