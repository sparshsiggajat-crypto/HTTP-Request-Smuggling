import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  BookOpen, 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  FileCode,
  ShieldCheck,
  Calendar,
  Layers
} from "lucide-react";
import { Scan } from "../types";

interface ReportsViewProps {
  scans: Scan[];
  onDownloadReport: (id: string, format: "pdf" | "json" | "html") => void;
}

export default function ReportsView({ scans, onDownloadReport }: ReportsViewProps) {
  const [selectedScanId, setSelectedScanId] = useState<string | null>(
    scans.length > 0 ? scans[0].id : null
  );
  const [search, setSearch] = useState("");

  const filteredScans = scans.filter((s) => 
    s.target.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const activeScan = scans.find((s) => s.id === selectedScanId) || (scans.length > 0 ? scans[0] : null);

  const handleDownload = (format: "pdf" | "json" | "html") => {
    if (activeScan) {
      onDownloadReport(activeScan.id, format);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none animate-fade-in">
      {/* Left side: Report lists index */}
      <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-5 h-[600px] flex flex-col shadow-xl shadow-black/25">
        <div className="border-b border-slate-800/60 pb-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="reports-search-input"
              type="text"
              placeholder="Filter reports by domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B1220] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 placeholder-slate-500 transition-colors shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {filteredScans.length === 0 ? (
            <div className="text-slate-500 italic text-xs text-center py-10">
              No matching security audit reports found.
            </div>
          ) : (
            filteredScans.map((scan) => {
              const isSelected = selectedScanId === scan.id;
              const isCritical = scan.riskLevel === "CRITICAL";
              return (
                <button
                  key={scan.id}
                  id={`report-item-${scan.id}`}
                  onClick={() => setSelectedScanId(scan.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-[#3B82F6]/10 border-[#3B82F6]/40 shadow-md shadow-[#3B82F6]/5"
                      : "bg-[#0B1220]/40 border-slate-800/80 hover:bg-[#0B1220]/75 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#3B82F6]">
                      REF: {scan.id.substring(0, 8)}
                    </span>
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-extrabold border ${
                      isCritical 
                        ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" 
                        : "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    }`}>
                      {scan.riskLevel}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate block w-full">
                    {scan.target}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1.5 border-t border-slate-800/30">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-mono font-semibold">{scan.duration}s audit</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right side: Active report reader console */}
      <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] lg:col-span-2 h-[600px] flex flex-col shadow-xl shadow-black/25 overflow-hidden">
        {activeScan ? (
          <>
            {/* Header / Export actions */}
            <div className="bg-[#111827] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4.5 h-4.5 text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Report Viewer ~ Session Document
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  id="report-export-json"
                  onClick={() => handleDownload("json")}
                  className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs transition-colors font-bold"
                  title="Download JSON"
                >
                  JSON
                </button>
                <button
                  id="report-export-html"
                  onClick={() => handleDownload("html")}
                  className="px-4 py-1.5 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors font-bold shadow-md shadow-[#3B82F6]/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export HTML
                </button>
              </div>
            </div>

            {/* Document Content Screen */}
            <div 
              id="report-viewer-content"
              className="flex-1 p-6 overflow-y-auto space-y-6 font-sans text-xs text-slate-300 leading-relaxed scrollbar-thin"
            >
              {/* Document Header Panel */}
              <div className="border-b border-slate-800/80 pb-4">
                <span className="text-[9px] text-[#3B82F6] font-extrabold uppercase tracking-widest block mb-1.5">
                  Security Compliance Audit Discovery
                </span>
                <h1 className="text-lg font-black text-slate-100 tracking-tight mb-2 truncate">
                  {activeScan.target}
                </h1>
                <div className="flex flex-wrap items-center gap-3.5 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" /> Date: {new Date(activeScan.createdAt).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>Session: <strong className="font-mono font-bold text-slate-400">{activeScan.id}</strong></span>
                  <span>•</span>
                  <span className={`font-bold uppercase ${activeScan.riskLevel === "CRITICAL" ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
                    Risk State: {activeScan.riskLevel}
                  </span>
                </div>
              </div>

              {/* Executive Summary Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                  1. Executive Summary
                </h3>
                <p className="text-slate-400">
                  A deep-inspection HTTP request smuggling scan was initiated using the CLZero evaluation core. 
                  The analysis targeted the endpoint <strong>{activeScan.target}</strong>. 
                  The objective was to identify pipeline boundary parsing discrepancies (CL.0) where server routers, 
                  content networks, or intermediate proxies fail to adhere strictly to standards.
                </p>
                {activeScan.riskLevel === "CRITICAL" ? (
                  <div className="p-4 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl flex gap-3.5 text-[#EF4444] font-sans">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1 uppercase tracking-wider text-[11px] font-black">Critical Security Findings Confirmed</strong>
                      Our analysis confirmed that upstream proxy servers are leaking Content-Length bounds, creating open smuggling tunnels. This can be exploited to hijack user sessions or cache poison routing grids.
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-xl flex gap-3.5 text-[#22C55E] font-sans">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1 uppercase tracking-wider text-[11px] font-black">Compliance Criteria Passed</strong>
                      No request smuggling or desynchronization anomalies were cached during tests. The remote endpoint processes content lengths correctly and closes mismatched connection lines.
                    </div>
                  </div>
                )}
              </div>

              {/* Finding Lists */}
              {activeScan.vulnerabilities.length > 0 && (
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#3B82F6]" />
                    2. Audited Vulnerabilities ({activeScan.vulnerabilities.length})
                  </h3>
                  {activeScan.vulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="bg-[#0B1220]/80 border border-slate-800 rounded-xl p-4.5 space-y-2.5 font-mono">
                      <div className="flex justify-between items-center text-xs font-extrabold text-[#EF4444] border-b border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          FINDING #{idx + 1}: {vuln.technique}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Confidence: {vuln.confidence}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        <strong className="block text-[#3B82F6] text-[10px] font-mono uppercase tracking-wider mb-1">Evidence Summary:</strong>
                        {vuln.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Remediation Summary */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#3B82F6]" />
                  3. Remediation Roadmap
                </h3>
                <div className="space-y-3 text-slate-400">
                  <p>To eliminate CL.0 Request Smuggling threats and secure intermediate proxy boundaries, apply the following protocols:</p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400">
                    <li>
                      <strong className="text-slate-200">Strict RFC Validation:</strong> Configure load-balancers to strictly validate <code>Content-Length</code> fields and drop requests with invalid characters or zero-length mismatches.
                    </li>
                    <li>
                      <strong className="text-slate-200">Migrate to HTTP/2:</strong> Transition backend routing channels to HTTP/2. HTTP/2 avoids framing errors through distinct length fields, bypassing request smuggling boundaries.
                    </li>
                    <li>
                      <strong className="text-slate-200">Dynamic Pipe Shutdowns:</strong> Inject header instructions to tear down and close keep-alive TCP lines when receiving anomalies.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-500 italic text-xs flex flex-col items-center justify-center flex-1 py-10">
            <FileText className="w-8 h-8 text-slate-600 mb-3" />
            No scans available. Run a security scan first to generate a professional compliance report.
          </div>
        )}
      </div>
    </div>
  );
}
