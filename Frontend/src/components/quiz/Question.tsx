import React, { useState } from "react";

interface QuestionOption {
  optionText: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuestionData {
  questionText: string;
  options: QuestionOption[];
  questionType?: string;
}

interface Props {
  question: QuestionData;
  onContinue: () => void;
}

const Question: React.FC<Props> = ({ question, onContinue }) => {
  console.log("Question component rendering with:", question);
  
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  if (!question || !question.options || question.options.length === 0) {
    console.error("Invalid question data:", question);
    return <div className="text-red-600 p-4">Error: Invalid question data</div>;
  }

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setShowFeedback(true);
    
    const isCorrect = question.options[selected].isCorrect;
    if (!isCorrect) {
      setTimeout(() => setShowSummary(true), 2000);
    }
  };

  const handleUnderstood = () => {
    onContinue();
  };

  const handleCorrectContinue = () => {
    onContinue();
  };

  const selectedOption = selected !== null ? question.options[selected] : null;
  const isCorrect = selectedOption?.isCorrect || false;

  return (
    <div className="w-full">
      {!showSummary ? (
        <div className="space-y-6">
          {/* Question Text */}
          <div className="text-center pb-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {question.questionText}
            </h3>
            <p className="text-gray-500 text-sm">Select one answer</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const showCorrect = showFeedback && opt.isCorrect;
              const showIncorrect = showFeedback && isSelected && !opt.isCorrect;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showFeedback}
                  className={`
                    w-full text-left p-5 rounded-xl border-2 transition-all duration-200 
                    ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
                    ${showCorrect 
                      ? 'bg-green-50 border-green-500 shadow-green-100 shadow-lg' 
                      : showIncorrect
                      ? 'bg-red-50 border-red-500 shadow-red-100 shadow-lg'
                      : isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-blue-100 shadow-md'
                      : 'bg-white border-gray-300 hover:border-blue-400'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-lg ${showCorrect ? 'text-green-900 font-semibold' : showIncorrect ? 'text-red-900 font-semibold' : 'text-gray-800'}`}>
                      {opt.optionText}
                    </span>
                    {showCorrect && <span className="text-3xl">✓</span>}
                    {showIncorrect && <span className="text-3xl">✗</span>}
                  </div>
                  {showFeedback && (isSelected || opt.isCorrect) && (
                    <p className="mt-3 text-sm text-gray-700 pt-3 border-t border-gray-200">
                      {opt.explanation}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!showFeedback && (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg transition-all mt-4
                ${selected === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                }
              `}
            >
              Submit Answer
            </button>
          )}

          {/* Feedback Messages */}
          {showFeedback && (
            <div className="pt-4">
              {isCorrect ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <h4 className="text-2xl font-bold text-green-800 mb-2">Excellent Work!</h4>
                  <p className="text-green-700 text-lg mb-4">You got it right!</p>
                  <button
                    onClick={handleCorrectContinue}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Continue Learning →
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-3">💭</div>
                  <h4 className="text-2xl font-bold text-orange-800 mb-2">Let's Review</h4>
                  <p className="text-orange-700 mb-4">Take a moment to understand the correct answer</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Summary Popup for Incorrect Answer */
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center pb-4">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Key Concepts</h3>
            <p className="text-gray-600">Here's what you should remember</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-bold text-xl text-gray-800 mb-4">{question.questionText}</h4>
            
            <div className="bg-white rounded-lg p-5 border-2 border-green-400">
              <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <span className="text-xl">✓</span> Correct Answer:
              </p>
              <p className="text-lg font-medium text-gray-900 mb-3">
                {question.options.find(opt => opt.isCorrect)?.optionText}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {question.options.find(opt => opt.isCorrect)?.explanation}
              </p>
            </div>
          </div>

          <button
            onClick={handleUnderstood}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Understood, Continue Learning →
          </button>
        </div>
      )}
    </div>
  );
};

export default Question;