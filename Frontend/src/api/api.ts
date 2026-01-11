import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const generateQuestions = (payload: any) =>
  API.post("/api/generate", payload);

export const generateFromYoutube = (payload: any) =>
  API.post("/api/transcribe-and-generate", payload);

export default API;
