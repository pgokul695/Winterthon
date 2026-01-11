/**
 * Create a text-based question generation prompt
 */
export function createQuestionPrompt(
  questionType: string,
  transcriptContent: string,
  previousQuestions: string[] = []
): string {
  let baseText = `===== TEXT TO CREATE QUESTION FROM =====
${transcriptContent}
===== END OF TEXT =====

`;

  // Add previous questions context if any
  let prevQuestionsText = "";
  if (previousQuestions.length > 0) {
    prevQuestionsText = `
ALREADY GENERATED QUESTIONS:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

IMPORTANT: Do NOT generate any question similar to the above. 
Create a COMPLETELY DIFFERENT question about a DIFFERENT topic from the text.
Do NOT repeat or rephrase the questions listed above.

`;
  }

  // Different prompts for different question types
  const prompts: Record<string, string> = {
    SOL: `${baseText}${prevQuestionsText}Create a quiz question about the text above. Follow this exact structure:

QUESTION:
[Your question text]

CORRECT:
[The correct answer in 2-5 words]

WRONG:
[First wrong answer in 2-5 words]
[Second wrong answer in 2-5 words]
[Third wrong answer in 2-5 words]

EXPLANATIONS:
CORRECT: [Why this answer is correct]
WRONG 1: [Why first option is wrong]
WRONG 2: [Why second option is wrong]
WRONG 3: [Why third option is wrong]

CRITICAL RULES:
- You MUST provide exactly THREE wrong answers after "WRONG:"
- Each wrong answer goes on its own line with NO prefixes (no WRONG 1:, WRONG 2:, WRONG 3:)
- After "EXPLANATIONS:" you MUST use the labels CORRECT:, WRONG 1:, WRONG 2:, WRONG 3:
- Keep all answer options SHORT (2-5 words only)
- Do NOT use A/B/C/D or 1/2/3/4 prefixes on answers
- Do NOT use markdown formatting
- Question must be answerable from the text above


Generate now:`,

    SML: `${baseText}${prevQuestionsText}Create a MULTIPLE-CORRECT multiple choice question. 2-3 answers are correct.

OUTPUT FORMAT:
QUESTION:
[write your question here]

CORRECT:
[write first correct answer - no prefix]
[write second correct answer - no prefix]
[optionally write third correct answer - no prefix]

WRONG:
[write first wrong answer - no prefix]
[write second wrong answer - no prefix]

EXPLANATIONS:
CORRECT 1: [explain why this is correct]
CORRECT 2: [explain why this is correct]
WRONG 1: [explain why this is wrong]
WRONG 2: [explain why this is wrong]

Generate the question:`,

    MCQ: `${baseText}${prevQuestionsText}Create a quiz question about the text above. Follow this exact structure:

QUESTION:
[Your question text]

CORRECT:
[The correct answer in 2-5 words]

WRONG:
[First wrong answer in 2-5 words]
[Second wrong answer in 2-5 words]
[Third wrong answer in 2-5 words]

EXPLANATIONS:
CORRECT: [Why this answer is correct]
WRONG 1: [Why first option is wrong]
WRONG 2: [Why second option is wrong]
WRONG 3: [Why third option is wrong]

Important rules:
- After "WRONG:" write THREE options on separate lines (no WRONG 1:, WRONG 2: labels)
- After "EXPLANATIONS:" you can use CORRECT: and WRONG 1:, WRONG 2:, WRONG 3: labels
- Keep all answer options SHORT (2-5 words only)
- Do NOT use A/B/C/D or 1/2/3/4 prefixes on answers
- Do NOT use markdown formatting
- Question must be answerable from the text above

Generate now:`,

    TF: `${baseText}${prevQuestionsText}Create a TRUE/FALSE question.

OUTPUT FORMAT:
QUESTION:
[write a statement that is either true or false]

CORRECT:
[True or False]

EXPLANATION:
[explain why this is true or false based on the text]

Generate the question:`,

    FIB: `${baseText}${prevQuestionsText}Create a FILL IN THE BLANK question.

OUTPUT FORMAT:
QUESTION:
[write question with _____ where the answer should go]

CORRECT:
[write the word/phrase that fills the blank]

EXPLANATION:
[explain why this is the correct answer]

Generate the question:`,

    NAT: `${baseText}${prevQuestionsText}Create a NUMERIC ANSWER question with a specific number as the answer.

OUTPUT FORMAT:
QUESTION:
[write your question]

CORRECT:
[write the numeric answer]

EXPLANATION:
[explain why this is the correct value]

Generate the question:`,

    DES: `${baseText}${prevQuestionsText}Create a DESCRIPTIVE question requiring a detailed written answer.

OUTPUT FORMAT:
QUESTION:
[write open-ended question]

SOLUTION:
[write detailed 2-3 sentence answer]

Generate the question:`
  };

  return prompts[questionType] || prompts["SOL"];
}
