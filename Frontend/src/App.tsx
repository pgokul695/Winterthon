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
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug effect
  useEffect(() => {
    console.log("State changed - showOverlay:", showOverlay, "questions:", questions);
  }, [showOverlay, questions]);

  // Transform API response to match Question component format
  const transformQuestion = (apiQuestion: any) => {
    return {
      questionText: apiQuestion.questionText,
      questionType: apiQuestion.questionType,
      options: apiQuestion.options.map((opt: any) => ({
        optionText: opt.text,
        isCorrect: opt.correct,
        explanation: opt.explanation
      }))
    };
  };

  const handlePDFGenerate = async (pdfText: string) => {
    if (!pdfText || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const res = await generateQuestions({
        mode: "ollama",
        model,
        transcript: pdfText,
        questionTypes: { MCQ: 1 },
      });
      console.log("API Response:", res.data);
      if (res.data.questions && res.data.questions.length > 0) {
        const transformedQuestions = res.data.questions.map(transformQuestion);
        console.log("Transformed Questions:", transformedQuestions);
        setQuestions(transformedQuestions);
        setShowOverlay(true);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Check if backend is running on port 9006.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoGenerate = async (videoUrl: string, startTime: number, endTime: number) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const res = await generateFromYoutube({
        videoUrl,
        startTime,
        endTime,
        mode: "ollama",
        model:"gemma:7b",
        questionTypes: { MCQ: 1 },
      });
      console.log("API Response:", res.data);
      if (res.data.questions && res.data.questions.length > 0) {
        const transformedQuestions = res.data.questions.map(transformQuestion);
        console.log("Transformed Questions:", transformedQuestions);
        setQuestions(transformedQuestions);
        setShowOverlay(true);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Make sure the backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    setShowOverlay(false);
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        model={model}
        setModel={setModel}
      />

      {currentPage === "pdf" && (
        <PDFReader 
          onGenerateQuestions={handlePDFGenerate} 
          isGenerating={isGenerating}
        />
      )}
      {currentPage === "video" && (
        <VideoPlayer 
          onGenerateQuestions={handleVideoGenerate}
          isGenerating={isGenerating}
        />
      )}

      {console.log("Render check - showOverlay:", showOverlay, "questions.length:", questions.length)}
      
      {showOverlay && questions.length > 0 ? (
        <Overlay>
          <Question question={questions[0]} onContinue={handleContinue} />
        </Overlay>
      ) : null}
    </div>
  );
};

export default App;
