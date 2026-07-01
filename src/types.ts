export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Vulnerability {
  technique: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  payload: string;
  response: string;
  evidence: string;
}

export interface Scan {
  id: string;
  userId: string;
  target: string;
  config: string;
  threads: number;
  timeout: number;
  verbose: boolean;
  skipRead: boolean;
  lastByteSync: boolean;
  status: "idle" | "running" | "completed" | "failed" | "stopped";
  progress: number;
  duration: number;
  payloadCount: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  vulnerabilities: Vulnerability[];
  logs: string[];
  createdAt: string;
}

export interface Settings {
  defaultThreads: number;
  defaultTimeout: number;
  notificationsEnabled: boolean;
  alertRules: string;
  theme: "dark" | "light";
}

export type ActiveTab = 
  | "dashboard"
  | "new_scan"
  | "live_scan"
  | "results"
  | "scan_history"
  | "analytics"
  | "assets"
  | "reports"
  | "logs"
  | "settings"
  | "about"
  | "help";
