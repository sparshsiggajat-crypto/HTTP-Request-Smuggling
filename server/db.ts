import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  createdAt: string;
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
  duration: number; // in seconds
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

interface DatabaseSchema {
  users: User[];
  scans: Scan[];
  settings: Settings;
}

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

const DEFAULT_SETTINGS: Settings = {
  defaultThreads: 10,
  defaultTimeout: 5,
  notificationsEnabled: true,
  alertRules: "high-confidence-only",
  theme: "dark"
};

// Initial database template
const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: "admin-id",
      email: "jat567432spa@gmail.com", // pre-seed the user's email to make login/testing immediate!
      passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
      username: "Security Analyst",
      createdAt: new Date().toISOString()
    }
  ],
  scans: [
    {
      id: "scan-1",
      userId: "admin-id",
      target: "https://demo-smuggle.clzero.local/api",
      config: "default.json",
      threads: 10,
      timeout: 5,
      verbose: true,
      skipRead: false,
      lastByteSync: false,
      status: "completed",
      progress: 100,
      duration: 12.4,
      payloadCount: 6,
      riskLevel: "CRITICAL",
      vulnerabilities: [
        {
          technique: "CL.0 GET request smuggling (standard)",
          confidence: "HIGH",
          payload: "POST /api HTTP/1.1\r\nHost: demo-smuggle.clzero.local\r\nUser-Agent: CLZero/1.4.2\r\nContent-Length: 0\r\nConnection: keep-alive\r\n\r\nGET /robots.txt HTTP/1.1\r\nHost: demo-smuggle.clzero.local\r\n\r\n",
          response: "HTTP/1.1 200 OK\r\nServer: nginx/1.18.0\r\nContent-Type: text/html\r\nContent-Length: 124\r\nConnection: keep-alive\r\n\r\n<html>\r\n<head><title>Admin Panel</title></head>\r\n<body><h1>Unauthorized access to smuggled pipeline!</h1></body>\r\n</html>",
          evidence: "Server processed subsequent pipelined GET request inside the initial POST request boundaries, returning unauthorized pipeline body response."
        }
      ],
      logs: [
        "[INFO] [22:00:01] Initializing CLZero core engine v1.4.2 on demo-smuggle.clzero.local:443...",
        "[INFO] [22:00:02] Configuration profile loaded: default.json",
        "[INFO] [22:00:02] Scanner settings: Threads=10, Timeout=5s, LastByteSync=false",
        "[INFO] [22:00:03] Performing initial connection handshakes and pre-flight checks...",
        "[INFO] [22:00:04] Measuring baseline round-trip time (RTT)...",
        "[INFO] [22:00:05] Baseline RTT established: 84.12ms",
        "[INFO] [22:00:06] Testing Technique 1/6: CL.0 GET request smuggling (standard)...",
        "[WARNING] [22:00:07] Atypical server pipeline behavior detected. Connection remained open with content-length error.",
        "[INFO] [22:00:08] Sending pipeline follow-up verification request...",
        "[CRITICAL] [22:00:09] Vulnerability CONFIRMED: CL.0 Request Smuggling via CL.0 GET request smuggling (standard)!",
        "[INFO] [22:00:10] Smuggled pipeline response captured (status: 200 OK, payload mismatch)",
        "[INFO] [22:00:10] Testing Technique 2/6: CL.0 via duplicate Content-Length headers...",
        "[INFO] [22:00:11] Testing Technique 3/6: CL.0 via Content-Length with trailing space...",
        "[INFO] [22:00:11] Testing Technique 4/6: CL.0 via malformed Content-Length: 0\\r\\n...",
        "[INFO] [22:00:12] Testing Technique 5/6: CL.0 via HTTP/1.1 transfer-encoding override...",
        "[INFO] [22:00:12] Testing Technique 6/6: CL.0 via Content-Length in HEAD request...",
        "[INFO] [22:00:13] --------------------------------------------------------",
        "[INFO] [22:00:13] CLZero Scan Audit Finished.",
        "[INFO] [22:00:13] Total Smuggling Vectors Tested: 6",
        "[CRITICAL] [22:00:13] SECURITY ALERT: 1 CL.0 Smuggling Vulnerabilities IDENTIFIED!"
      ],
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
    },
    {
      id: "scan-2",
      userId: "admin-id",
      target: "https://secure-target.com",
      config: "default.json",
      threads: 10,
      timeout: 5,
      verbose: false,
      skipRead: false,
      lastByteSync: false,
      status: "completed",
      progress: 100,
      duration: 8.5,
      payloadCount: 6,
      riskLevel: "SAFE",
      vulnerabilities: [],
      logs: [
        "[INFO] [22:15:01] Initializing CLZero core engine v1.4.2 on secure-target.com:443...",
        "[INFO] [22:15:02] Configuration profile loaded: default.json",
        "[INFO] [22:15:02] Scanner settings: Threads=10, Timeout=5s, LastByteSync=false",
        "[INFO] [22:15:03] Performing initial connection handshakes and pre-flight checks...",
        "[INFO] [22:15:04] Measuring baseline round-trip time (RTT)...",
        "[INFO] [22:15:05] Baseline RTT established: 42.15ms",
        "[INFO] [22:15:06] Testing Technique 1/6: CL.0 GET request smuggling (standard)...",
        "[INFO] [22:15:06] Testing Technique 2/6: CL.0 via duplicate Content-Length headers...",
        "[INFO] [22:15:07] Testing Technique 3/6: CL.0 via Content-Length with trailing space...",
        "[INFO] [22:15:07] Testing Technique 4/6: CL.0 via malformed Content-Length: 0\\r\\n...",
        "[INFO] [22:15:08] Testing Technique 5/6: CL.0 via HTTP/1.1 transfer-encoding override...",
        "[INFO] [22:15:08] Testing Technique 6/6: CL.0 via Content-Length in HEAD request...",
        "[INFO] [22:15:09] --------------------------------------------------------",
        "[INFO] [22:15:09] CLZero Scan Audit Finished.",
        "[INFO] [22:15:09] Total Smuggling Vectors Tested: 6",
        "[SUCCESS] [22:15:09] No CL.0 Request Smuggling vulnerabilities found. Target appears secure against Content-Length validation bypass."
      ],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    }
  ],
  settings: DEFAULT_SETTINGS
};

class DBManager {
  private cache: DatabaseSchema | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
        this.cache = INITIAL_DB;
      } else {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.cache = JSON.parse(fileContent);
      }
    } catch (err) {
      console.error("Database initialization failed. Using in-memory cache fallback.", err);
      this.cache = INITIAL_DB;
    }
  }

  private persist() {
    if (!this.cache) return;
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.cache, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write database to disk", err);
    }
  }

  // --- User Operations ---
  public getUsers(): User[] {
    return this.cache?.users || [];
  }

  public getUserByEmail(email: string): User | undefined {
    return this.cache?.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.cache?.users.find((u) => u.id === id);
  }

  public createUser(user: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...user,
      id: crypto.randomBytes(8).toString("hex"),
      createdAt: new Date().toISOString()
    };
    if (this.cache) {
      this.cache.users.push(newUser);
      this.persist();
    }
    return newUser;
  }

  // --- Scan Operations ---
  public getScans(userId: string): Scan[] {
    return (this.cache?.scans || []).filter((s) => s.userId === userId);
  }

  public getScanById(id: string): Scan | undefined {
    return this.cache?.scans.find((s) => s.id === id);
  }

  public createScan(scan: Omit<Scan, "id" | "createdAt" | "logs" | "vulnerabilities" | "progress" | "status" | "duration" | "payloadCount" | "riskLevel">): Scan {
    const newScan: Scan = {
      ...scan,
      id: crypto.randomBytes(12).toString("hex"),
      status: "idle",
      progress: 0,
      duration: 0,
      payloadCount: 6,
      riskLevel: "SAFE",
      vulnerabilities: [],
      logs: [],
      createdAt: new Date().toISOString()
    };
    if (this.cache) {
      this.cache.scans.unshift(newScan); // New scans at the beginning
      this.persist();
    }
    return newScan;
  }

  public updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
    if (!this.cache) return undefined;
    const idx = this.cache.scans.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;

    this.cache.scans[idx] = {
      ...this.cache.scans[idx],
      ...updates
    };
    this.persist();
    return this.cache.scans[idx];
  }

  public appendScanLog(id: string, logLine: string): void {
    if (!this.cache) return;
    const scan = this.cache.scans.find((s) => s.id === id);
    if (scan) {
      scan.logs.push(logLine);
      this.persist();
    }
  }

  public deleteScan(id: string, userId: string): boolean {
    if (!this.cache) return false;
    const initialLen = this.cache.scans.length;
    this.cache.scans = this.cache.scans.filter((s) => !(s.id === id && s.userId === userId));
    const wasDeleted = this.cache.scans.length < initialLen;
    if (wasDeleted) {
      this.persist();
    }
    return wasDeleted;
  }

  // --- Settings Operations ---
  public getSettings(): Settings {
    return this.cache?.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(updates: Partial<Settings>): Settings {
    if (this.cache) {
      this.cache.settings = {
        ...this.cache.settings,
        ...updates
      };
      this.persist();
    }
    return this.cache?.settings || DEFAULT_SETTINGS;
  }
}

export const db = new DBManager();
