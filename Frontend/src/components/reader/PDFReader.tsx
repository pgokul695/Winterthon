import React, { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  onGenerateQuestions: (text: string) => void;
  isGenerating: boolean;
}

const PDFReader: React.FC<Props> = ({ onGenerateQuestions, isGenerating }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lastQuestionTime, setLastQuestionTime] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const isGeneratingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref whenever isGenerating prop changes
  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    setIsExtracting(true);
    try {
      // Extract text from PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }

      setExtractedText(fullText.trim());
      
      // Create a blob URL for the PDF to display in iframe
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      // Start random question generation timer
      startQuestionTimer();
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      alert("Failed to extract text from PDF");
    } finally {
      setIsExtracting(false);
    }
  };

  const startQuestionTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Trigger questions every 2 minutes
    timerRef.current = setTimeout(() => {
      // Check if still have PDF and not currently generating
      if (pdfUrl && !isGeneratingRef.current && extractedText) {
        const now = Date.now();
        if (now - lastQuestionTime > 110000) { // At least 110s since last question
          setLastQuestionTime(now); // Update immediately to prevent duplicate triggers
          onGenerateQuestions(extractedText);
        }
      }
      // Continue timer if PDF still open and not generating
      if (pdfUrl && !isGeneratingRef.current) {
        startQuestionTimer();
      }
    }, 120000); // 2 minutes
  };

  useEffect(() => {
    return () => {
      // Cleanup: revoke blob URL and clear timer when component unmounts
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pdfUrl]);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          📄 PDF Reader
        </h2>

        {!pdfUrl ? (
          <div className="flex-1 flex items-center justify-center">
            <label
              htmlFor="pdf-upload"
              className="w-full max-w-xl p-16 border-2 border-dashed border-blue-400 rounded-2xl text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all hover:scale-105 bg-white shadow-sm"
            >
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="mb-4">
                <svg
                  className="mx-auto h-20 w-20 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-gray-700 mb-2">
                {isExtracting ? "Extracting text..." : "Upload PDF"}
              </p>
              <p className="text-base text-gray-500">
                {isExtracting ? "Please wait while we process your PDF" : "Drop your PDF here or click to browse"}
              </p>
              {!isExtracting && (
                <p className="text-sm text-gray-400 mt-2">
                  Maximum file size: 50MB
                </p>
              )}
            </label>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {isGenerating ? (
                  <span className="flex items-center gap-2 font-semibold text-blue-600">
                    <span className="animate-spin">⏳</span>
                    Generating question...
                  </span>
                ) : (
                  "📖 Reading your PDF - Questions will appear automatically"
                )}
              </p>
              <button
                onClick={() => setPdfUrl(null)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Upload Different PDF
              </button>
            </div>
            <div className="flex-1 border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden bg-gray-50">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFReader;
