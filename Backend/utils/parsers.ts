import { ParsedMCQ } from "../types";

/**
 * Parse plain text MCQ output from LLM into structured format
 * Robust parser that handles various LLM output quirks
 * 
 * Expected format (flexible):
 * QUESTION:
 * [question text]
 * 
 * CORRECT:
 * [correct answer]
 * 
 * WRONG: (or WRONG 1:, WRONG 2:, WRONG 3:)
 * [wrong answer 1]
 * [wrong answer 2]
 * [wrong answer 3]
 * 
 * EXPLANATIONS:
 * CORRECT: [explanation]
 * WRONG 1: [explanation]
 * WRONG 2: [explanation]
 * WRONG 3: [explanation]
 */
export function parseMCQText(text: string): ParsedMCQ {
  // Remove any markdown code blocks
  text = text.replace(/```[^\n]*\n/g, '');
  text = text.replace(/```/g, '');
  
  // Helper to strip common prefixes and markdown from options
  function stripPrefix(line: string): string {
    line = line.replace(/^[A-D]\.\s*/i, '');  // Remove A., B., C., D.
    line = line.replace(/^\d+\.\s*/, '');     // Remove 1., 2., 3.
    line = line.replace(/^\*+\s*/, '');       // Remove leading * or **
    line = line.replace(/\*\*/g, '');         // Remove markdown bold **text**
    line = line.replace(/\*([^\*]+)\*/g, '$1');  // Remove markdown italic *text*
    line = line.replace(/`([^`]+)`/g, '$1');  // Remove inline code `text`
    line = line.replace(/^[-•]\s*/, '');      // Remove bullet points
    return line.trim();
  }
  
  // Helper to extract section between labels
  function extractSection(startLabel: string, endLabel?: string): string {
    const startIdx = text.toUpperCase().indexOf(startLabel.toUpperCase());
    if (startIdx === -1) {
      return '';
    }
    
    let contentStart = startIdx + startLabel.length;
    let contentEnd = text.length;
    
    if (endLabel) {
      const endIdx = text.toUpperCase().indexOf(endLabel.toUpperCase(), contentStart);
      if (endIdx !== -1) {
        contentEnd = endIdx;
      }
    }
    
    return text.substring(contentStart, contentEnd).trim();
  }
  
  // Extract question
  const questionText = extractSection('QUESTION:', 'CORRECT:');
  if (!questionText) {
    throw new Error("Could not find QUESTION section in text");
  }
  // Take all non-empty lines and join them (handles multi-line questions)
  const question = questionText
    .split('\n')
    .map(line => stripPrefix(line.trim()))
    .filter(line => line.length > 0)
    .join(' ')
    .trim();
  
  // Extract correct answer
  const correctText = extractSection('CORRECT:', 'WRONG');
  if (!correctText) {
    throw new Error("Could not find CORRECT section in text");
  }
  // Take all non-empty lines and join them
  const correct = correctText
    .split('\n')
    .map(line => stripPrefix(line.trim()))
    .filter(line => line.length > 0)
    .join(' ')
    .trim();
  
  // Extract wrong answers - handle both "WRONG:" and "WRONG 1:" formats
  let wrongStartIdx = -1;
  let wrongMarker: string | null = null;
  
  // Try to find "WRONG:" first
  if (text.toUpperCase().includes('WRONG:')) {
    wrongStartIdx = text.toUpperCase().indexOf('WRONG:');
    wrongMarker = 'WRONG:';
  } else if (text.toUpperCase().includes('WRONG 1:')) {
    // If not found, try "WRONG 1:"
    wrongStartIdx = text.toUpperCase().indexOf('WRONG 1:');
    wrongMarker = 'WRONG 1:';
  }
  
  if (wrongStartIdx === -1) {
    throw new Error("Could not find WRONG section in text");
  }
  
  // Extract the wrong answers block
  const explanationsIdx = text.toUpperCase().indexOf('EXPLANATIONS:', wrongStartIdx);
  let wrongBlock: string;
  if (explanationsIdx !== -1) {
    wrongBlock = text.substring(wrongStartIdx, explanationsIdx);
  } else {
    wrongBlock = text.substring(wrongStartIdx);
  }
  
  // Remove the initial "WRONG:" or "WRONG 1:" marker
  if (wrongMarker) {
    const markerEnd = wrongBlock.toUpperCase().indexOf(wrongMarker.toUpperCase()) + wrongMarker.length;
    wrongBlock = wrongBlock.substring(markerEnd);
  }
  
  // Parse wrong answers
  const wrongLines: string[] = [];
  for (const line of wrongBlock.split('\n')) {
    let trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }
    
    // Remove "WRONG:" prefix if present
    trimmedLine = trimmedLine.replace(/^WRONG:\s*/i, '');
    // Remove "WRONG N:" prefix if present
    trimmedLine = trimmedLine.replace(/^WRONG\s+\d+:\s*/i, '');
    // Strip common prefixes
    trimmedLine = stripPrefix(trimmedLine);
    
    if (trimmedLine && !trimmedLine.toUpperCase().startsWith('WRONG')) {
      wrongLines.push(trimmedLine);
    }
  }
  
  // Ensure we have exactly 3 wrong answers
  if (wrongLines.length < 3) {
    throw new Error(`Expected at least 3 wrong answers, found ${wrongLines.length}: ${wrongLines.join(', ')}`);
  }
  
  const wrong = wrongLines.slice(0, 3);  // Take first 3
  
  // Extract explanations (with fallback)
  const explanations: string[] = [
    'This is the correct answer based on the transcript.',
    'This option is incorrect.',
    'This option is incorrect.',
    'This option is incorrect.'
  ];
  
  const expSection = extractSection('EXPLANATIONS:', undefined);
  if (expSection) {
    // Split by explanation markers - they might be on same line or different lines
    // Use regex to find all CORRECT: and WRONG N: markers
    const expMatches = expSection.match(/(CORRECT|WRONG\s+\d+):\s*([^]*?)(?=(CORRECT|WRONG\s+\d+):|$)/gi);
    
    if (expMatches && expMatches.length > 0) {
      const expLines: string[] = [];
      
      for (const match of expMatches) {
        // Extract just the explanation text (remove the CORRECT: or WRONG N: prefix)
        const cleaned = match.replace(/^(CORRECT|WRONG\s+\d+):\s*/i, '').trim();
        if (cleaned) {
          expLines.push(stripPrefix(cleaned));
        }
      }
      
      // Map explanations to our array (ensure we have exactly 4)
      if (expLines.length >= 1) explanations[0] = expLines[0];
      if (expLines.length >= 2) explanations[1] = expLines[1];
      if (expLines.length >= 3) explanations[2] = expLines[2];
      if (expLines.length >= 4) explanations[3] = expLines[3];
    }
  }
  
  return {
    question,
    correct,
    wrong,
    explanations
  };
}

/**
 * Extract JSON from markdown code blocks
 */
export function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  return cleaned.trim();
}

/**
 * Parse the TypeScript-style JSON schema format
 * Handles both single question and array of questions
 */
export function parseJsonSchemaFormat(data: any): any {
  const result: any = {
    questionText: "",
    options: [],
    solution: "",
    isParameterized: false,
    timeLimitSeconds: 60,
    points: 5
  };
  
  // Extract question text and metadata
  if (data.question) {
    const q = data.question;
    result.questionText = q.text || "";
    result.isParameterized = q.isParameterized || false;
    result.timeLimitSeconds = q.timeLimitSeconds || 60;
    result.points = q.points || 5;
  }
  
  // Extract solution and options
  if (data.solution) {
    const sol = data.solution;
    
    // Correct answer
    if (sol.correctLotItem) {
      const correctItem = sol.correctLotItem;
      result.options.push({
        text: correctItem.text || "",
        correct: true,
        explanation: correctItem.explaination || correctItem.explanation || ""
      });
      result.solution = correctItem.text || "";
    }
    
    // Incorrect answers
    if (sol.incorrectLotItems) {
      for (const item of sol.incorrectLotItems) {
        result.options.push({
          text: item.text || "",
          correct: false,
          explanation: item.explaination || item.explanation || ""
        });
      }
    }
  }
  
  return result;
}

function cleanText(text: string): string {
  // Remove prefixes like A., B., C., D.
  text = text.replace(/^[A-D]\.\s*/, '');
  return text.trim();
}

function parseExplanations(text: string, explanations: string[]) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    
    if (upperLine.startsWith("CORRECT:")) {
      explanations.push(line.substring(8).trim());
    } else if (upperLine.startsWith("WRONG 1:")) {
      explanations.push(line.substring(8).trim());
    } else if (upperLine.startsWith("WRONG 2:")) {
      explanations.push(line.substring(8).trim());
    } else if (upperLine.startsWith("WRONG 3:")) {
      explanations.push(line.substring(8).trim());
    }
  }
}
