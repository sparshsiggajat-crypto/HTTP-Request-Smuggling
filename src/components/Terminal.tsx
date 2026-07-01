import React, { useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Cpu } from "lucide-react";

interface TerminalProps {
  logs: string[];
  status: string;
}

export default function Terminal({ logs, status }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#0B1220] border border-slate-800 rounded-[20px] overflow-hidden flex flex-col h-[340px] select-none shadow-lg shadow-black/20">
      {/* Header bar */}
      <div className="bg-[#111827] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#3B82F6]" />
          <span className="font-mono text-[11px] font-extrabold text-[#F8FAFC] tracking-wider">
            Diagnostic Output Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status === "running" && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
              <Cpu className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="font-mono text-[9px] font-bold text-blue-400">Core Active</span>
            </div>
          )}
          <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">STDOUT</span>
        </div>
      </div>

      {/* Code body screen */}
      <div 
        ref={containerRef}
        id="terminal-body"
        className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5 scrollbar-thin"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic flex flex-col items-center justify-center h-full gap-2">
            <TerminalIcon className="w-6 h-6 text-slate-700" />
            <span>No active socket stream log history. Run a scan to capture diagnostics.</span>
          </div>
        ) : (
          <>
            {logs.map((log, index) => {
              let colorClass = "text-[#22C55E]";
              if (log.includes("[INFO]")) {
                colorClass = "text-blue-400";
              } else if (log.includes("[WARNING]")) {
                colorClass = "text-[#F59E0B] font-medium";
              } else if (log.includes("[CRITICAL]")) {
                colorClass = "text-[#EF4444] font-semibold";
              } else if (log.includes("[PAYLOAD]")) {
                colorClass = "text-indigo-300";
              } else if (log.includes("[ERROR]") || log.includes("[SYSTEM_CRITICAL]")) {
                colorClass = "text-[#EF4444] italic";
              } else if (log.includes("[SUCCESS]")) {
                colorClass = "text-[#22C55E] font-semibold";
              }
              
              return (
                <div key={index} className={`${colorClass} hover:bg-slate-900/40 px-1 rounded transition-colors`}>
                  {log}
                </div>
              );
            })}
            
            {status === "running" && (
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span>▶</span>
                <span>Auditing active request pipeline...</span>
                <span className="w-1.5 h-3.5 bg-blue-500 animate-pulse inline-block"></span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
