import React, { useState, useEffect, useRef } from "react";

interface Props {
  onGenerateQuestions: (videoUrl: string, startTime: number, endTime: number) => void;
  isGenerating: boolean;
}

const VideoPlayer: React.FC<Props> = ({ onGenerateQuestions, isGenerating }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastQuestionTime, setLastQuestionTime] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const isGeneratingRef = useRef(false);

  // Update ref whenever isGenerating prop changes
  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Define the callback for when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API ready');
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoId && (window as any).YT) {
      initializePlayer();
    }
  }, [videoId]);

  const initializePlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new (window as any).YT.Player('youtube-player', {
      videoId: videoId,
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === (window as any).YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startPlaybackTracking();
    } else {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const startPlaybackTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      // Only proceed if not currently generating a question
      if (playerRef.current && playerRef.current.getCurrentTime && !isGeneratingRef.current) {
        const time = Math.floor(playerRef.current.getCurrentTime());
        setCurrentTime(time);

        // Trigger questions every 2 minutes of watch time
        const timeSinceLastQuestion = time - lastQuestionTime;
        const shouldTrigger = timeSinceLastQuestion >= 120; // Every 120 seconds (2 minutes)

        if (shouldTrigger && time > 10) { // At least 10s into video
          setLastQuestionTime(time); // Update immediately to prevent duplicate triggers
          onGenerateQuestions(videoUrl, 0, time);
        }
      }
    }, 5000); // Check every 5 seconds
  };


  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(videoUrl);
    
    if (!id) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    setVideoId(id);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          🎥 YouTube Learning
        </h2>

        {/* URL Input Form */}
        {!videoId && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Enter YouTube Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Paste any YouTube video URL and start learning
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md"
          >
            🚀 Start Learning
          </button>
        </form>
      )}

      {/* Video Player */}
      {videoId && (
        <div className="flex-1 flex flex-col">
          <div className="mb-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-base font-semibold text-gray-800">
                  ⏱️ Watch Time: <span className="text-blue-600">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      <span className="font-semibold text-blue-600">Generating question...</span>
                    </span>
                  ) : (
                    "💡 Questions will pop up as you learn"
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setVideoId("");
                  setCurrentTime(0);
                  setLastQuestionTime(0);
                  if (playerRef.current) playerRef.current.destroy();
                  if (intervalRef.current) clearInterval(intervalRef.current);
                }}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all font-medium border border-gray-200 shadow-sm hover:shadow"
              >
                Change Video
              </button>
            </div>
          </div>
          
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200">
            <div id="youtube-player" className="w-full h-full"></div>
          </div>
        </div>
      )}
    </div>
</div>
  );
}

export default VideoPlayer;
