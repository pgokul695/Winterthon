import axios from "axios";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models || [];
    return models.map((model: any) => model.name);
  } catch (error: any) {
    throw new Error(`Failed to fetch Ollama models: ${error.message}`);
  }
}

export async function generateWithOllama(
  model: string,
  prompt: string
): Promise<string> {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 2048, // Increased from 1024 to allow longer completions
        },
      },
      { timeout: 180000 }
    );
    
    return response.data.response || "";
  } catch (error: any) {
    console.error("[Ollama] Error:", error.message);
    if (error.response) {
      console.error("[Ollama] Response:", error.response.data);
    }
    throw new Error(`Ollama API error: ${error.message}`);
  }
}
