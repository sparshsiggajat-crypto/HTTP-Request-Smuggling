import React, { useState, useEffect } from "react";
import { Play, Square, RotateCcw, AlertTriangle, ShieldCheck, Terminal, Cpu, Clock, Sliders } from "lucide-react";
import { Scan } from "../types";

interface ScanFormProps {
  onStartScan: (params: {
    target: string;
    config: string;
    threads: number;
    timeout: number;
    verbose: boolean;
    skipRead: boolean;
    lastByteSync: boolean;
  }) => void;
  onStopScan: () => void;
  activeScan: Scan | null;
  errorMsg: string | null;
  clearError: () => void;
}

export default function ScanForm({
  onStartScan,
  onStopScan,
  activeScan,
  errorMsg,
  clearError
}: ScanFormProps) {
  const [target, setTarget] = useState("");
  const [config, setConfig] = useState("default.json");
  const [threads, setThreads] = useState(10);
  const [timeout, setTimeoutVal] = useState(5);
  const [verbose, setVerbose] = useState(true);
  const [skipRead, setSkipRead] = useState(false);
  const [lastByteSync, setLastByteSync] = useState(false);
  
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeScan && activeScan.status === "running") {
      setElapsed(0);
      const start = Date.now();
      timer = setInterval(() => {
        setElapsed(Math.round((Date.now() - start) / 100) / 10);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeScan?.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    let formattedTarget = target.trim();
    if (!/^https?:\/\//i.test(formattedTarget)) {
      formattedTarget = "https://" + formattedTarget;
      setTarget(formattedTarget);
    }

    onStartScan({
      target: formattedTarget,
      config,
      threads,
      timeout,
      verbose,
      skipRead,
      lastByteSync
    });
  };

  const handleReset = () => {
    setTarget("");
    setConfig("default.json");
    setThreads(10);
    setTimeoutVal(5);
    setVerbose(true);
    setSkipRead(false);
    setLastByteSync(false);
    clearError();
  };

  const isScanning = activeScan?.status === "running";

  return (
    <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 shadow-xl shadow-black/35 transition-all select-none">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800/60">
        <Sliders className="w-4.5 h-4.5 text-[#3B82F6]" />
        <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
          Security Analysis Settings
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-5 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl flex items-start gap-3 text-xs text-[#EF4444]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Execution Error:</span> {errorMsg}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* URL Target Input */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
            Target Endpoint Address <span className="text-[#EF4444] font-bold">*</span>
          </label>
          <input
            id="scan-target-input"
            type="text"
            placeholder="e.g. target.corp.internal/api"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={isScanning}
            required
            className="w-full bg-[#0B1220] border border-slate-800 focus:border-[#3B82F6]/50 rounded-xl px-4 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none placeholder-slate-600 disabled:opacity-50 transition-all shadow-inner"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">
            Domain URL or IP. CL.0 desynchronization probes will check request pipeline integrity.
          </span>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
              Payload Class
            </label>
            <select
              id="scan-config-select"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              disabled={isScanning}
              className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 disabled:opacity-50 cursor-pointer"
            >
              <option value="default.json">default.json (6 vectors)</option>
              <option value="strict.json">strict.json (12 vectors)</option>
              <option value="aggressive.json">aggressive.json (18 vectors)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
              Cores / Threads
            </label>
            <input
              id="scan-threads-input"
              type="number"
              min="1"
              max="50"
              value={threads}
              onChange={(e) => setThreads(parseInt(e.target.value, 10) || 10)}
              disabled={isScanning}
              className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
              Timeout (sec)
            </label>
            <input
              id="scan-timeout-input"
              type="number"
              min="1"
              max="30"
              value={timeout}
              onChange={(e) => setTimeoutVal(parseInt(e.target.value, 10) || 5)}
              disabled={isScanning}
              className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Pipeline Toggles */}
        <div className="bg-[#0B1220]/75 border border-slate-800/80 p-4 rounded-xl">
          <span className="block text-[9px] font-mono text-slate-500 font-extrabold uppercase mb-3 tracking-wider">
            Pipeline Verification Modifiers
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                id="scan-verbose-checkbox"
                type="checkbox"
                checked={verbose}
                onChange={(e) => setVerbose(e.target.checked)}
                disabled={isScanning}
                className="rounded-md border-slate-800 text-[#3B82F6] focus:ring-0 focus:ring-offset-0 bg-[#0B1220] w-4.5 h-4.5 cursor-pointer"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-slate-300 group-hover:text-slate-100 transition-colors">Verbose Logs</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">Socket diagnostics</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                id="scan-skipread-checkbox"
                type="checkbox"
                checked={skipRead}
                onChange={(e) => setSkipRead(e.target.checked)}
                disabled={isScanning}
                className="rounded-md border-slate-800 text-[#3B82F6] focus:ring-0 focus:ring-offset-0 bg-[#0B1220] w-4.5 h-4.5 cursor-pointer"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-slate-300 group-hover:text-slate-100 transition-colors">Skip Read</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">Socket write only</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                id="scan-lastbyte-checkbox"
                type="checkbox"
                checked={lastByteSync}
                onChange={(e) => setLastByteSync(e.target.checked)}
                disabled={isScanning}
                className="rounded-md border-slate-800 text-[#3B82F6] focus:ring-0 focus:ring-offset-0 bg-[#0B1220] w-4.5 h-4.5 cursor-pointer"
              />
              <div className="select-none">
                <span className="block text-xs font-bold text-slate-300 group-hover:text-slate-100 transition-colors">Last Byte Sync</span>
                <span className="block text-[9px] text-slate-500 mt-0.5">Delay line send</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
          <div>
            {isScanning && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]"></span>
                </span>
                <span className="text-[11px] text-[#3B82F6] font-mono font-bold">
                  PROBING ENGINE: {elapsed}s
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2.5">
            {!isScanning ? (
              <>
                <button
                  id="scan-reset-btn"
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3.5 py-2 border border-slate-700 hover:border-slate-600 bg-slate-800/20 hover:bg-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs transition-all duration-150 font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  id="scan-start-btn"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white text-xs rounded-xl transition-all duration-150 font-bold shadow-md shadow-[#3B82F6]/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch Scanner
                </button>
              </>
            ) : (
              <button
                id="scan-stop-btn"
                type="button"
                onClick={onStopScan}
                className="flex items-center gap-2 px-5 py-2 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white text-xs rounded-xl transition-all duration-150 font-bold shadow-md shadow-[#EF4444]/20"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop Scan Core
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Progress View */}
      {isScanning && (
        <div id="scan-progress-section" className="mt-5 p-4 bg-[#0B1220] border border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-wider">
              Scan task in progress
            </span>
            <span className="text-xs text-slate-100 font-extrabold font-mono">{activeScan?.progress || 0}%</span>
          </div>
          <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden border border-slate-800/60">
            <div 
              id="scan-progress-bar-fill"
              className="bg-gradient-to-r from-[#3B82F6] to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${activeScan?.progress || 0}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800/40 text-[10px]">
            <div>
              <span className="block text-slate-500 uppercase font-bold">Target</span>
              <span className="block font-mono font-bold text-slate-300 truncate mt-0.5">{target || activeScan?.target}</span>
            </div>
            <div>
              <span className="block text-slate-500 uppercase font-bold">Incidents</span>
              <span className={`block font-extrabold mt-0.5 ${activeScan && activeScan.vulnerabilities.length > 0 ? "text-[#EF4444] font-mono" : "text-[#22C55E]"}`}>
                {activeScan?.vulnerabilities.length || 0} found
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
