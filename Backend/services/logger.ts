import fs from "fs";
import path from "path";
import { LogEntry } from "../types";

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "question_generation.jsonl");

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function saveLog(logEntry: LogEntry): void {
  const logLine = JSON.stringify(logEntry) + "\n";
  fs.appendFileSync(LOG_FILE, logLine, "utf-8");
}

export function loadLogs(): LogEntry[] {
  if (!fs.existsSync(LOG_FILE)) {
    return [];
  }
  
  const content = fs.readFileSync(LOG_FILE, "utf-8");
  const lines = content.split("\n").filter(line => line.trim().length > 0);
  
  return lines.map(line => JSON.parse(line));
}

export function clearLogs(): void {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
}

export function getLogById(logId: string): LogEntry | null {
  const logs = loadLogs();
  return logs.find(log => log.id === logId) || null;
}
