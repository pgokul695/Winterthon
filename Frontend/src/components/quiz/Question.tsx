import React, { useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Overlay from "../quiz/Overlay";

interface Props {
  showQuestion: boolean;
  question: {
    questionText: string;
    options: string[];
  };
  onAnswer?: (answer: string) => void;
  onClose?: () => void;
}

const QuizPopup: React.FC<Props> = ({ showQuestion, question, onAnswer, onClose }) => {
  const [selected, setSelected] = useState("");

  if (!showQuestion) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelected(value);
    if (onAnswer) onAnswer(value);
  };

  return (
    // The content is rendered directly inside the Overlay's white frame div.
    <div className="flex flex-col space-y-6">
      
      {/* Question Header: Now only handles background and text style */}
      <div className="-m-8 -mt-8 -mx-8 bg-indigo-600 p-6 rounded-t-2xl">
        <FormLabel component="legend" className="block text-white text-xl font-bold tracking-tight">
          {question.questionText}
        </FormLabel>
      </div>

      {/* Options Body */}
      <FormControl component="fieldset" className="w-full">
        <RadioGroup
          value={selected}
          onChange={handleChange}
          // Added margin top to account for the header covering the top padding
          className="space-y-3 pt-4" 
        >
          {question.options.map((opt, idx) => {
            const isSelected = selected === opt;
            return (
              <FormControlLabel
                key={idx}
                value={opt}
                control={
                  <Radio
                    sx={{
                      color: "#9ca3af", // gray-400
                      "&.Mui-checked": { color: "#4f46e5" }, // indigo-600
                    }}
                  />
                }
                label={opt}
                // Styling the option container to look like a clickable card
                className={`
                  w-full m-0 px-4 py-3 rounded-lg border-2 transition-all duration-200 
                  cursor-pointer items-start 
                  ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 shadow-sm font-semibold text-gray-900"
                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }
                `}
              />
            );
          })}
        </RadioGroup>
      </FormControl>

      {/* Action Button Section */}
      {onClose && (
        // -m-8 -mx-8 here removes the bottom and side padding from the parent Overlay frame
        <div className="-m-8 -mx-8 mt-4 pt-4 pb-8 flex justify-end border-t border-gray-100 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            // px-8 instead of px-6 because of the removed padding
            className="mr-8 px-8 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 transition duration-150"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPopup;