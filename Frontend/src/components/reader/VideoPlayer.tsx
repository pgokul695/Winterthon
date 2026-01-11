import React, { useState, useEffect } from "react";
import QuestionPopup from "../quiz/QuestionPopup";

const VideoPlayer: React.FC = () => {
  const [showQuestion, setShowQuestion] = useState(false);

  // Use embed URL format
  const videoUrl = "https://www.youtube.com/embed/fLPS4sIpYh0";

  // Timer to trigger popup after 10 seconds for testing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, 10000); // 10 sec for testing
    return () => clearTimeout(timer);
  }, []);

  const handleAnswer = () => {
    setShowQuestion(false);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative">
      {/* Video iframe */}
      <div className="w-full max-w-5xl h-[60vh]">
        <iframe
          src={videoUrl}
          className="w-full h-full rounded border"
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Popup */}
      {showQuestion && (
        <QuestionPopup
          showQuestion={showQuestion}
          question={{
            questionText: "What was the main point of the video segment?",
            options: ["Option A", "Option B", "Option C", "Option D"],
          }}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
