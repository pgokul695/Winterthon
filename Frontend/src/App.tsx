import React, { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import PDFReader from "./components/reader/PDFReader";
import VideoPlayer from "./components/reader/VideoPlayer";
import Overlay from "./components/quiz/Overlay";
import Question from "./components/quiz/Question";
import { generateQuestions, generateFromYoutube } from "./api/api";

const App = () => {
  const [model, setModel] = useState("gemma3:latest");
  const [currentPage, setCurrentPage] = useState<"pdf" | "video">("pdf");
  const [questions, setQuestions] = useState<any[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [text, setText] = useState("");
  const [scrollPercent, setScrollPercent] = useState(0);
  const [lastTriggered, setLastTriggered] = useState(0);

  // Trigger question generation when user scrolls past 30% and 70%
  useEffect(() => {
    if (scrollPercent > 30 && scrollPercent < 100 && Date.now() - lastTriggered > 15000) {
      handleGenerate();
      setLastTriggered(Date.now());
    }
  }, [scrollPercent]);

  const handleGenerate = async () => {
    if (!text) return;
    const res = await generateQuestions({
      mode: "ollama",
      model,
      transcript: text,
      questionTypes: { MCQ: 1 },
    });
    setQuestions(res.data.questions);
    setShowOverlay(true);
  };

  const handleVideoSubmit = async (videoData: { videoUrl: string; startTime?: number; endTime?: number }) => {
    const res = await generateFromYoutube({
      ...videoData,
      mode: "ollama",
      model,
      questionTypes: { MCQ: 2 },
    });
    setQuestions(res.data.questions);
    setShowOverlay(true);
  };

  return (
    <>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        model={model}
        setModel={setModel}
      />

      <main className="max-w-5xl mx-auto p-4">
        {currentPage === "pdf" && (
          <PDFReader
            onTextReady={(t) => setText(t)}
          />
        )}
        {currentPage === "video" && <VideoPlayer onSubmit={handleVideoSubmit} />}
      </main>

      {showOverlay && (
        <Overlay>
          {questions.map((q, i) => (
            <Question key={i} question={q} />
          ))}
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setShowOverlay(false)}
          >
            Continue Reading
          </button>
        </Overlay>
      )}
    </>
  );
};

export default App;
