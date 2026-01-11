import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 600000, // 10 minutes timeout
});

export const generateQuestions = (payload: any) =>
  API.post("/api/generate", payload, { timeout: 600000 });

export const generateFromYoutube = (payload: any) =>
  API.post("/api/transcribe-and-generate", payload, { timeout: 600000 });

export default API;
