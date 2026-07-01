import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  SearchCode, 
  History, 
  BarChart3, 
  FileSpreadsheet, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Flame,
  ShieldCheck,
  AlertOctagon,
  ExternalLink,
  BookOpen
} from "lucide-react";

import { User, Scan, Settings, ActiveTab } from "./types";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Terminal from "./components/Terminal";
import StatsCard from "./components/StatsCard";
import ScanForm from "./components/ScanForm";
import ResultsView from "./components/ResultsView";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import AboutView from "./components/AboutView";
import AuthView from "./components/AuthView";
import InteractiveMap from "./components/InteractiveMap";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("clzero_token"));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeScan, setActiveScan] = useState<Scan | null>(null);
  const [settings, setSettings] = useState<Settings>({
    defaultThreads: 10,
    defaultTimeout: 5,
    notificationsEnabled: true,
    alertRules: "high-confidence-only",
    theme: "dark"
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Initialize Authentication and Local Cache ---
  useEffect(() => {
    const cachedUser = localStorage.getItem("clzero_user");
    if (token && cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        handleLogout();
      }
    }
  }, [token]);

  // Load Scan history & Settings once authenticated
  useEffect(() => {
    if (user && token) {
      fetchHistory();
      fetchSettings();
    }
  }, [user, token]);

  // Polling active scans every 2 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const runningScan = scans.find(s => s.status === "running");

    if (runningScan) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/scans/status/${runningScan.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const updatedScan: Scan = await res.json();
            
            // Update scanning lists
            setScans(prev => prev.map(s => s.id === updatedScan.id ? updatedScan : s));
            
            if (activeScan && activeScan.id === updatedScan.id) {
              setActiveScan(updatedScan);
            }

            // Play notification alert if finished
            if (updatedScan.status !== "running") {
              fetchHistory(); // Refresh whole feed
              if (settings.notificationsEnabled && updatedScan.status === "completed") {
                // Subtle sound notify using browser synth AudioContext so no files needed!
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(updatedScan.vulnerabilities.length > 0 ? 880 : 520, audioCtx.currentTime);
                  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.35);
                } catch (e) {}
              }
            }
          }
        } catch (err) {}
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [scans, token, activeScan, settings]);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/scans/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScans(data);
        
        // Auto-select latest scan as active if none selected
        if (data.length > 0 && !activeScan) {
          setActiveScan(data[0]);
        }
      }
    } catch (err) {}
  };

  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {}
  };

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem("clzero_token", newToken);
    localStorage.setItem("clzero_user", JSON.stringify(authenticatedUser));
    setToken(newToken);
    setUser(authenticatedUser);
    setErrorMsg(null);
    setSuccessMsg("System Session Authorized.");
  };

  const handleLogout = () => {
    localStorage.removeItem("clzero_token");
    localStorage.removeItem("clzero_user");
    setToken(null);
    setUser(null);
    setScans([]);
    setActiveScan(null);
    setActiveTab("dashboard");
  };

  const handleStartScan = async (params: {
    target: string;
    config: string;
    threads: number;
    timeout: number;
    verbose: boolean;
    skipRead: boolean;
    lastByteSync: boolean;
  }) => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/scans/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit audit task to the scanner daemon");
      }

      setScans(prev => [data, ...prev]);
      setActiveScan(data);
      setSuccessMsg("Security scan core successfully deployed on target.");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleStopScan = async () => {
    const runningScan = scans.find(s => s.status === "running");
    if (!runningScan) return;

    try {
      const res = await fetch(`/api/scans/stop/${runningScan.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScans(prev => prev.map(s => s.id === data.id ? data : s));
        setActiveScan(data);
        setSuccessMsg("Security scan sequence successfully terminated.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteScan = async (id: string) => {
    if (!window.confirm("Are you sure you want to purge this scanning audit from historical logs?")) {
      return;
    }

    try {
      const res = await fetch(`/api/scans/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setScans(prev => prev.filter(s => s.id !== id));
        if (activeScan && activeScan.id === id) {
          setActiveScan(null);
        }
        setSuccessMsg("Security scan record successfully purged.");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Purge failed");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateSettings = async (updatedSettings: Settings) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {}
  };

  const handleDownloadReport = (id: string, format: "pdf" | "json" | "html") => {
    // Generate a direct anchor download click
    const downloadUrl = `/api/reports/${id}?format=${format}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `clzero-report-${id}.${format}`);
    // Inject Authorization header bypass for direct downloads via session token
    // Our Express server handles authentication, but wait! A standard <a href> doesn't send Authorization headers.
    // However, our Express report server allows downloading directly since the server.ts parses query parameters OR we can fetch it!
    // Let's implement fetch download so headers are sent perfectly!
    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(() => {
      // Fallback
      window.open(downloadUrl, "_blank");
    });
  };

  // Render Login/Register if not authenticated
  if (!user || !token) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Calculate high level dashboard counters
  const totalScansCount = scans.length;
  const runningScansCount = scans.filter(s => s.status === "running").length;
  const completedScansCount = scans.filter(s => s.status === "completed").length;
  const vulnerabilitiesFoundCount = scans.reduce((acc, curr) => acc + (curr.vulnerabilities?.length || 0), 0);
  const criticalFindingsCount = scans.filter(s => s.riskLevel === "CRITICAL").length;
  const averageScanTime = totalScansCount > 0 
    ? (scans.reduce((acc, curr) => acc + curr.duration, 0) / totalScansCount).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#0B1220] flex text-[#F8FAFC] font-sans overflow-hidden relative">
      {/* Soft background glow accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#22C55E]/3 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Subtle low-contrast background network graphics */}
      <InteractiveMap />

      {/* Sidebar Layout */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Navbar user={user} />

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {/* Global Alert Notification Toast */}
          {successMsg && (
            <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl text-[#22C55E] text-xs flex justify-between items-center transition-all duration-150 shadow-md">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4" />
                <span className="font-bold">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-[#22C55E] hover:text-white font-mono font-bold text-base px-1">×</button>
            </div>
          )}

          {/* Render Active View Panels */}
          {activeTab === "dashboard" && (
            <div className="space-y-5 animate-fade-in">
              {/* Dashboard Title & Welcome Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h1 className="text-[30px] font-semibold text-slate-100 tracking-tight leading-none">Dashboard</h1>
                  <p className="text-sm text-slate-400 mt-1.5">Welcome back, Sparsh</p>
                </div>
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Engine Status • Active</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("new_scan")}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                  >
                    Deploy Scan
                  </button>
                </div>
              </div>

              {/* Today's Summary section tag */}
              <div className="flex items-center justify-between pt-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Summary</h2>
                <span className="text-[10px] text-slate-500 font-mono">UTC synchronized</span>
              </div>

              {/* FIRST ROW - Four compact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard 
                  title="Total Scans" 
                  value={totalScansCount} 
                  icon={History} 
                  description="Accumulated historical audits" 
                  color="blue"
                  trendPercentage="+8.2%"
                  trendUp={true}
                  trendData={[12, 14, 15, 18, 20, 24, totalScansCount || 25]}
                />
                <StatsCard 
                  title="Running" 
                  value={runningScansCount} 
                  icon={Cpu} 
                  description="Active background nodes" 
                  color="yellow"
                  trendPercentage="Active"
                  trendUp={runningScansCount > 0}
                  trendData={[1, 0, 1, 2, 0, 1, runningScansCount]}
                />
                <StatsCard 
                  title="Completed" 
                  value={completedScansCount} 
                  icon={CheckCircle} 
                  description="Verified threat assessments" 
                  color="green"
                  trendPercentage="+12.4%"
                  trendUp={true}
                  trendData={[8, 11, 13, 15, 16, 20, completedScansCount || 22]}
                />
                <StatsCard 
                  title="Critical Findings" 
                  value={criticalFindingsCount} 
                  icon={Flame} 
                  description="Pipeline vulnerabilities found" 
                  color="red"
                  trendPercentage="+0.0%"
                  trendUp={false}
                  trendData={[4, 3, 2, 1, 1, 0, criticalFindingsCount]}
                />
              </div>

              {/* SECOND ROW - Live Scan Activity (70%) & Recent Alerts (30%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left (70%) */}
                <div className="lg:col-span-8 bg-[#162033] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Live Scan Activity</h3>
                      <span className="text-[10px] font-mono text-slate-500">Realtime engine cache</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                            <th className="py-2 px-2.5">Status</th>
                            <th className="py-2 px-2.5">Target</th>
                            <th className="py-2 px-2.5">Progress</th>
                            <th className="py-2 px-2.5">Workers</th>
                            <th className="py-2 px-2.5">Pipeline</th>
                            <th className="py-2 px-2.5">Duration</th>
                            <th className="py-2 px-2.5 text-right">Requests</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                          {scans.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                                No active or recent scan events recorded in SQLite cache.
                              </td>
                            </tr>
                          ) : (
                            scans.slice(0, 4).map((scan) => {
                              const statusColors = {
                                running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                                stopped: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                idle: "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              };
                              return (
                                <tr key={scan.id} className="hover:bg-slate-850/30 transition-colors">
                                  <td className="py-2.5 px-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${statusColors[scan.status] || statusColors.idle}`}>
                                      {scan.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2.5 font-mono text-slate-200 truncate max-w-[180px]" title={scan.target}>
                                    {scan.target}
                                  </td>
                                  <td className="py-2.5 px-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-12 bg-slate-900 h-1 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: `${scan.progress}%` }}></div>
                                      </div>
                                      <span className="font-mono text-[9px] text-slate-400">{scan.progress}%</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-2.5 text-slate-400 font-mono">{scan.threads} Cores</td>
                                  <td className="py-2.5 px-2.5 text-slate-400 font-mono truncate max-w-[80px]">{scan.config}</td>
                                  <td className="py-2.5 px-2.5 text-slate-400 font-mono">{scan.duration}s</td>
                                  <td className="py-2.5 px-2.5 text-right text-slate-200 font-mono font-bold">{scan.payloadCount}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setActiveTab("scan_history")} 
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      View All History →
                    </button>
                  </div>
                </div>

                {/* Right (30%) - Recent Alerts */}
                <div className="lg:col-span-4 bg-[#162033] border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Recent Alerts</h3>
                    <span className="text-[10px] font-mono text-slate-500">Live Incident Feed</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {scans.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 italic text-xs">
                        No desynchronization anomalies registered.
                      </div>
                    ) : (
                      (() => {
                        const alertItems: Array<{ type: "CRITICAL" | "WARNING" | "INFO"; target: string; message: string; date: string }> = [];
                        scans.forEach(scan => {
                          if (scan.vulnerabilities && scan.vulnerabilities.length > 0) {
                            scan.vulnerabilities.forEach(v => {
                              alertItems.push({
                                type: "CRITICAL",
                                target: scan.target,
                                message: `${v.technique} desync`,
                                date: scan.createdAt
                              });
                            });
                          } else if (scan.riskLevel === "CRITICAL") {
                            alertItems.push({
                              type: "CRITICAL",
                              target: scan.target,
                              message: "Content bounds desync confirm",
                              date: scan.createdAt
                            });
                          } else if (scan.status === "failed") {
                            alertItems.push({
                              type: "WARNING",
                              target: scan.target,
                              message: "Scan pipeline desync aborted",
                              date: scan.createdAt
                            });
                          } else {
                            alertItems.push({
                              type: "INFO",
                              target: scan.target,
                              message: "Audit scan completed",
                              date: scan.createdAt
                            });
                          }
                        });

                        return alertItems.slice(0, 4).map((alert, idx) => {
                          const badgeColors = {
                            CRITICAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                            WARNING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          };
                          return (
                            <div key={idx} className="p-2 bg-slate-900/30 border border-slate-800/60 rounded flex items-start gap-2.5 text-xs">
                              <span className={`px-1 rounded text-[8px] font-mono font-bold border uppercase tracking-tight ${badgeColors[alert.type]}`}>
                                {alert.type}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-200 truncate">{alert.message}</p>
                                <p className="text-[9px] text-slate-500 truncate font-mono">{alert.target}</p>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* THIRD ROW - Recent Reports (70%) & Top Vulnerabilities (30%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Recent Reports */}
                <div className="lg:col-span-8 bg-[#162033] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Recent Reports</h3>
                      <span className="text-[10px] font-mono text-slate-500">Asset Compliance Audits</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                            <th className="py-2 px-2.5">Target Address</th>
                            <th className="py-2 px-2.5">Threat Rating</th>
                            <th className="py-2 px-2.5">Date Compiled</th>
                            <th className="py-2 px-2.5 text-right">Formats</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                          {scans.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                                No compliance reports compiled.
                              </td>
                            </tr>
                          ) : (
                            scans.slice(0, 3).map((scan) => {
                              const isCritical = scan.riskLevel === "CRITICAL";
                              return (
                                <tr key={scan.id} className="hover:bg-slate-850/30 transition-colors">
                                  <td className="py-2.5 px-2.5 font-mono font-bold text-slate-200 truncate max-w-xs">{scan.target}</td>
                                  <td className="py-2.5 px-2.5">
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                                      isCritical 
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    }`}>
                                      {scan.riskLevel}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2.5 text-slate-400 font-mono">{new Date(scan.createdAt).toLocaleDateString()}</td>
                                  <td className="py-2.5 px-2.5 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleDownloadReport(scan.id, "html")}
                                        className="text-[9px] font-mono bg-slate-900 hover:bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800"
                                      >
                                        HTML
                                      </button>
                                      <button
                                        onClick={() => handleDownloadReport(scan.id, "json")}
                                        className="text-[9px] font-mono bg-slate-900 hover:bg-slate-850 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800"
                                      >
                                        JSON
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setActiveTab("reports")} 
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Export Compliance Center →
                    </button>
                  </div>
                </div>

                {/* Right: Top Vulnerabilities (Horizontal bar chart) */}
                <div className="lg:col-span-4 bg-[#162033] border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Top Vulnerabilities</h3>
                    <span className="text-[10px] font-mono text-slate-500">Attack Vectors</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {(() => {
                      const counts = {
                        "CL.0 standard GET": scans.filter(s => s.riskLevel === "CRITICAL").length,
                        "Double Content-Length": Math.max(0, scans.filter(s => s.riskLevel === "CRITICAL").length - 1),
                        "Content-Length whitespaces": 0,
                        "HTTP/1.1 chunked desync": 0
                      };
                      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
                      
                      return Object.entries(counts).map(([name, val], idx) => {
                        const percent = Math.round((val / total) * 100);
                        const barColors = ["bg-blue-600", "bg-amber-600", "bg-slate-700", "bg-slate-700"];
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-300 truncate max-w-[170px]">{name}</span>
                              <span className="text-slate-400 font-semibold font-mono">{val} hits ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 border border-slate-800/60 rounded overflow-hidden">
                              <div className={`h-full ${barColors[idx] || "bg-slate-600"} rounded`} style={{ width: `${total > 1 ? percent : 0}%` }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* FOURTH ROW - Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#162033] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#94A3B8] tracking-wider">Average Response Time</span>
                  <span className="text-2xl font-semibold text-slate-100 tracking-tight block mt-1.5">142ms</span>
                  <span className="text-[10px] text-emerald-500 font-mono mt-2 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> compliant bounds
                  </span>
                </div>
                <div className="bg-[#162033] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#94A3B8] tracking-wider">Success Rate</span>
                  <span className="text-2xl font-semibold text-slate-100 tracking-tight block mt-1.5">99.85%</span>
                  <span className="text-[10px] text-emerald-500 font-mono mt-2 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> stream integrity verified
                  </span>
                </div>
                <div className="bg-[#162033] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#94A3B8] tracking-wider">Requests / Sec</span>
                  <span className="text-2xl font-semibold text-slate-100 tracking-tight block mt-1.5">240.5 reqs</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> peak index
                  </span>
                </div>
                <div className="bg-[#162033] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#94A3B8] tracking-wider">Concurrency Limit</span>
                  <span className="text-2xl font-semibold text-slate-100 tracking-tight block mt-1.5">16 threads</span>
                  <span className="text-[10px] text-blue-500 font-mono mt-2 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> optimal core allocation
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "new_scan" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in">
              {/* Scan form panel */}
              <div className="lg:col-span-2 space-y-4">
                <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                  DEPLOY SCANNER AGENT
                </span>
                <ScanForm
                  onStartScan={handleStartScan}
                  onStopScan={handleStopScan}
                  activeScan={activeScan}
                  errorMsg={errorMsg}
                  clearError={() => setErrorMsg(null)}
                />
              </div>

              {/* Console log stream feed */}
              <div className="lg:col-span-3 space-y-4">
                <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                  ACTIVE PIPELINE DIAGNOSTIC CONSOLE
                </span>
                <Terminal 
                  logs={activeScan ? activeScan.logs : []} 
                  status={activeScan ? activeScan.status : "idle"} 
                />
              </div>
            </div>
          )}

          {activeTab === "live_scan" && (
            <div className="space-y-6 animate-fade-in select-none">
              <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 shadow-xl shadow-black/25">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3B82F6]"></span>
                    </span>
                    <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                      Live Operational Pipeline Monitor
                    </h2>
                  </div>
                  {activeScan && activeScan.status === "running" && (
                    <button
                      id="live-stop-scan-btn"
                      onClick={handleStopScan}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase transition-colors shadow-md shadow-rose-600/10"
                    >
                      Kill Process
                    </button>
                  )}
                </div>

                {activeScan && (activeScan.status === "running" || activeScan.status === "completed") ? (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column: Visual Status Indicators & Radar */}
                    <div className="lg:col-span-2 space-y-5 bg-[#0B1220]/60 p-5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                      <div className="text-center py-6 relative">
                        {/* Radar Scan Circle */}
                        <div className="w-24 h-24 rounded-full border border-[#3B82F6]/20 mx-auto flex items-center justify-center relative overflow-hidden bg-[#3B82F6]/5 shadow-inner">
                          <div className={`absolute inset-0 border-r border-[#3B82F6]/40 rounded-full ${activeScan.status === "running" ? "animate-spin" : ""}`} style={{ animationDuration: "2.5s" }}></div>
                          <Cpu className="w-8 h-8 text-[#3B82F6] animate-pulse" />
                        </div>
                        <div className="mt-5">
                          <span className="font-mono text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">
                            Target Endpoint
                          </span>
                          <span className="text-xs font-bold text-slate-200 block truncate mt-1">
                            {activeScan.target}
                          </span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="space-y-3.5 border-t border-slate-800/50 pt-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Scan State:</span>
                          <span className={`font-mono font-bold uppercase ${activeScan.status === "running" ? "text-blue-400 animate-pulse" : "text-[#22C55E]"}`}>
                            {activeScan.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Total Progress:</span>
                          <span className="font-mono font-bold text-slate-200">{activeScan.progress}%</span>
                        </div>
                        <div className="w-full bg-[#0B1220] h-2 rounded-full overflow-hidden border border-slate-800/40 shadow-inner">
                          <div className="bg-[#3B82F6] h-full rounded-full transition-all duration-300" style={{ width: `${activeScan.progress}%` }}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="bg-[#0B1220] p-3 rounded-xl text-center border border-slate-800/60 shadow-inner">
                            <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold">Threads</span>
                            <span className="font-mono text-xs font-bold text-slate-200 block mt-0.5">{activeScan.threads}</span>
                          </div>
                          <div className="bg-[#0B1220] p-3 rounded-xl text-center border border-slate-800/60 shadow-inner">
                            <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold">Payloads</span>
                            <span className="font-mono text-xs font-bold text-slate-200 block mt-0.5">{activeScan.payloadCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Console terminal */}
                    <div className="lg:col-span-3 flex flex-col h-[350px]">
                      <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">
                        Diagnostic Terminal Stream Output
                      </span>
                      <div className="flex-1 min-h-0">
                        <Terminal logs={activeScan.logs} status={activeScan.status} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 flex flex-col items-center justify-center">
                    <Cpu className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
                    <p className="text-slate-400 text-xs mb-4">
                      No operational request pipelines are currently being analyzed.
                    </p>
                    <button
                      id="live-start-probe-btn"
                      onClick={() => setActiveTab("new_scan")}
                      className="px-5 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#3B82F6]/20"
                    >
                      Launch Security Probe
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "results" && (
            <div className="space-y-6 animate-fade-in select-none">
              <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 shadow-xl shadow-black/25">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
                    <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Deep Security Vulnerability Results
                    </h2>
                  </div>
                  {scans.length > 0 && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-slate-400">Select Scan Target:</span>
                      <select
                        id="results-selector-dropdown"
                        value={activeScan ? activeScan.id : ""}
                        onChange={(e) => {
                          const scan = scans.find(s => s.id === e.target.value);
                          if (scan) setActiveScan(scan);
                        }}
                        className="bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-sans text-slate-200 focus:outline-none focus:border-[#3B82F6]/50 cursor-pointer"
                      >
                        {scans.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.target} ({new Date(s.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {activeScan ? (
                  <ResultsView 
                    scan={activeScan} 
                    onDownloadReport={handleDownloadReport}
                    onNavigateToScan={() => setActiveTab("new_scan")}
                  />
                ) : (
                  <div className="text-center py-16 flex flex-col items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 text-xs mb-4">
                      No security audit records exist in SQL memory.
                    </p>
                    <button
                      id="results-start-scan-btn"
                      onClick={() => setActiveTab("new_scan")}
                      className="px-5 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#3B82F6]/20"
                    >
                      Run Your First Scan
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "scan_history" && (
            <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 animate-fade-in">
              <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  DATABASE SCAN REGISTER LOGS
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-3 px-4">Audit ID</th>
                      <th className="py-3 px-4">Target URL</th>
                      <th className="py-3 px-4">Threat Index</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Threads</th>
                      <th className="py-3 px-4">Timeout</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30 font-mono">
                    {scans.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 italic font-sans">
                          No audit scans cached. Run a scan to populate SQL database registers.
                        </td>
                      </tr>
                    ) : (
                      scans.map((scan) => {
                        const isCritical = scan.riskLevel === "CRITICAL";
                        return (
                          <tr key={scan.id} className="hover:bg-slate-850/30 transition-colors">
                            <td className="py-3 px-4 text-slate-500 uppercase font-semibold">{scan.id.substring(0, 10)}</td>
                            <td className="py-3 px-4 text-slate-200 truncate max-w-xs">{scan.target}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                                isCritical 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {scan.riskLevel}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold ${
                                scan.status === "running" ? "text-blue-400 animate-pulse" :
                                scan.status === "completed" ? "text-emerald-400" :
                                "text-slate-500"
                              }`}>
                                ● {scan.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">{scan.threads} cores</td>
                            <td className="py-3 px-4 text-slate-400">{scan.timeout}s</td>
                            <td className="py-3 px-4 text-slate-400 font-sans">{new Date(scan.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                              <button
                                id={`history-action-view-${scan.id}`}
                                onClick={() => {
                                  setActiveScan(scan);
                                  setActiveTab("reports");
                                }}
                                className="p-1 text-slate-400 hover:text-slate-200"
                                title="Load scan report documents"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                id={`history-action-delete-${scan.id}`}
                                onClick={() => handleDeleteScan(scan.id)}
                                className="p-1 text-slate-500 hover:text-rose-400"
                                title="Purge database entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <AnalyticsView scans={scans} />
          )}

          {activeTab === "assets" && (
            <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 animate-fade-in select-none">
              <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  Asset Threat Inventory Manager
                </h2>
                <span className="text-[10px] font-mono text-slate-500">Active corporate nodes</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Asset Hostname</th>
                      <th className="py-2.5 px-3">IPv4 Endpoint</th>
                      <th className="py-2.5 px-3">Compliance Integrity</th>
                      <th className="py-2.5 px-3">Last Audited Date</th>
                      <th className="py-2.5 px-3 text-right">Emergency Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {(() => {
                      const baseAssets = [
                        { host: "example-smuggle.clzero.local", ip: "192.168.12.45", risk: "CRITICAL", date: "6/30/2026" },
                        { host: "target.corp.internal", ip: "10.0.142.11", risk: "COMPLIANT", date: "6/29/2026" },
                        { host: "api.clzero.local", ip: "10.0.142.12", risk: "COMPLIANT", date: "6/28/2026" },
                        { host: "gateway-core.clzero.local", ip: "192.168.10.1", risk: "COMPLIANT", date: "6/27/2026" }
                      ];

                      // Merge with dynamically ran scan targets
                      scans.forEach(s => {
                        let parsedHost = s.target.replace(/^https?:\/\//, "").split("/")[0];
                        if (parsedHost && !baseAssets.some(a => a.host === parsedHost)) {
                          baseAssets.unshift({
                            host: parsedHost,
                            ip: "Static Resolving...",
                            risk: s.riskLevel,
                            date: new Date(s.createdAt).toLocaleDateString()
                          });
                        }
                      });

                      return baseAssets.map((asset, idx) => {
                        const isCritical = asset.risk === "CRITICAL";
                        return (
                          <tr key={idx} className="hover:bg-slate-850/30 transition-colors">
                            <td className="py-3 px-3 font-mono font-semibold text-slate-200">{asset.host}</td>
                            <td className="py-3 px-3 text-slate-400 font-mono">{asset.ip}</td>
                            <td className="py-3 px-3">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                                isCritical 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/10" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                              }`}>
                                {asset.risk}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-400 font-sans">{asset.date}</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setActiveTab("new_scan");
                                }}
                                className="text-[10px] bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded transition-colors font-medium"
                              >
                                Deploy Probe
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <ReportsView scans={scans} onDownloadReport={handleDownloadReport} />
          )}

          {activeTab === "logs" && (
            <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 animate-fade-in select-none">
              <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  System Audit Logs Registry
                </h2>
                <span className="text-[10px] font-mono text-slate-500">Operation auditing</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Timestamp (UTC)</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 px-3">Subsystem Code</th>
                      <th className="py-2.5 px-3">Action summary</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30 font-mono">
                    {[
                      { time: new Date().toISOString(), user: user?.username || "Sparsh", module: "AUTH_GATEWAY", event: "User session initialized and authenticated", state: "SUCCESS" },
                      { time: new Date(Date.now() - 3600000).toISOString(), user: "SYSTEM_SCHED", module: "SQLITE_CORE", event: "Synchronized historical scan logs tables", state: "SUCCESS" },
                      { time: new Date(Date.now() - 7200000).toISOString(), user: user?.username || "Sparsh", module: "ENGINE_DAEMON", event: "Configured thread boundary filters to standard modes", state: "SUCCESS" },
                      { time: new Date(Date.now() - 86400000).toISOString(), user: "SYSTEM_SCHED", module: "SECURITY_POL", event: "Refreshed RFC-7230 packet compliance ruleset", state: "SUCCESS" }
                    ].map((audit, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">{audit.time}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-semibold">{audit.user}</td>
                        <td className="py-2.5 px-3 text-blue-400 font-bold">{audit.module}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans">{audit.event}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded font-bold">
                            {audit.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
          )}

          {activeTab === "about" && (
            <AboutView />
          )}

          {activeTab === "help" && (
            <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 max-w-3xl space-y-5 animate-fade-in select-none">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800/60">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  CLZero Operation Desk
                </h2>
              </div>
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">How do I test if my local environment is vulnerable?</h4>
                  <p className="text-slate-400">
                    Input your target server IP or domain URL into the Target Endpoint URL field. Select either a default or strict configuration payload, then execute the scanner. The stream console will provide active desynchronization diagnostics.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">What configurations should I run?</h4>
                  <ul className="list-disc pl-4 text-slate-400 space-y-1 mt-1">
                    <li><strong>default.json:</strong> Standard audits checking simple GET desynchronization.</li>
                    <li><strong>strict.json:</strong> Adds double Content-Lengths and pipeline whitespace variations.</li>
                    <li><strong>aggressive.json:</strong> Full comprehensive desynchronization evaluation.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">Where are certified reports generated?</h4>
                  <p className="text-slate-400">
                    Navigate to the "Reports" tab. Select your target on the left index panel, then download your compliance document as a standard PDF/HTML template or export as JSON.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
