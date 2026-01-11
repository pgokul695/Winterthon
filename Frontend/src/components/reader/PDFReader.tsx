import React, { useEffect, useRef, useState } from "react";
import QuestionPopup from "../quiz/QuestionPopup";

interface Props {
  onTextReady: (text: string) => void;
}

const PDFReader: React.FC<Props> = ({ onTextReady }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [questionTriggered, setQuestionTriggered] = useState(false);

  const handleScroll = () => {
    if (!textareaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = textareaRef.current;
    const percent =
      scrollHeight > clientHeight
        ? (scrollTop / (scrollHeight - clientHeight)) * 100
        : 0;
    setScrollPercent(percent);
  };

  useEffect(() => {
    // Only trigger if scrolled past 25% and popup hasn't been triggered yet
    if (scrollPercent >= 25 && !questionTriggered) {
      if (!timerId) {
        const id = setTimeout(() => {
          setShowQuestion(true);
          setQuestionTriggered(true);
        }, 5000); // 5 seconds for testing (change to 60000 for 1 min)
        setTimerId(id);
      }
    }

    // Reset timer if scrolled back before 25%
    if (scrollPercent < 25 && timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
  }, [scrollPercent, questionTriggered, timerId]);

  useEffect(() => {
    onTextReady(text);
  }, [text]);

  return (
    <>
      {showQuestion && (
        <QuestionPopup
          showQuestion={showQuestion}
          question={{
            questionText: "What was the main point of the paragraph?",
            options: ["Option A", "Option B", "Option C", "Option D"],
          }}
          onAnswer={() => setShowQuestion(false)}
          onClose={() => setShowQuestion(false)} // optional close button inside popup
        />
      )}

      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Read and Learn
        </h2>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={handleScroll}
          className="w-full h-[32rem] p-6 border rounded-lg overflow-y-scroll resize-none bg-white shadow-md text-lg leading-relaxed"
          placeholder="Paste your PDF text here..."
        />

        <div className="mt-3 w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${scrollPercent}%` }}
          />
        </div>

        <p className="mt-1 text-sm text-gray-600 text-right">
          Scroll progress: {Math.round(scrollPercent)}%
        </p>
      </div>
    </>
  );
};

export default PDFReader;
