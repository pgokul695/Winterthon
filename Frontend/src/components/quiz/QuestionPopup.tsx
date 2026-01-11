import React, { useState } from "react";
import Overlay from "../quiz/Overlay";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

interface Props {
  showQuestion: boolean;
  question: {
    questionText: string;
    options: string[];
  };
  onAnswer?: (answer: string) => void;
}

const QuestionPopup: React.FC<Props> = ({ showQuestion, question, onAnswer }) => {
  const [selected, setSelected] = useState("");

  if (!showQuestion) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setSelected(val);
    if (onAnswer) onAnswer(val);
  };

  return (
    <Overlay>
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 3,
          p: 4,
          width: "90%",
          maxWidth: 500,
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "center", // ensure Box respects flex centering
        }}
      >
        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <FormLabel
            component="legend"
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              p: 2,
              borderRadius: 1,
              mb: 3,
              textAlign: "center",
              fontSize: "1.25rem",
            }}
          >
            {question.questionText}
          </FormLabel>
          <RadioGroup value={selected} onChange={handleChange}>
            {question.options.map((opt, idx) => (
              <FormControlLabel
                key={idx}
                value={opt}
                control={<Radio />}
                label={opt}
                sx={{
                  bgcolor: selected === opt ? "#bbdefb" : "transparent",
                  mb: 1,
                  borderRadius: 1,
                  p: 1,
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
    </Overlay>
  );
};

export default QuestionPopup;
