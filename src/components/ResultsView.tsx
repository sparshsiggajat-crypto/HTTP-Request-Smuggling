import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  Layers, 
  Terminal as TerminalIcon, 
  BookOpen, 
  Copy, 
  Check, 
  Flame,
  Gauge,
  Clock,
  ExternalLink
} from "lucide-react";
import { Scan, Vulnerability } from "../types";

interface ResultsViewProps {
  scan: Scan;
  onDownloadReport: (id: string, format: "pdf" | "json" | "html") => void;
  onNavigateToScan: () => void;
}

export default function ResultsView({
  scan,
  onDownloadReport,
  onNavigateToScan
}: ResultsViewProps) {
  const [selectedVulnIdx, setSelectedVulnIdx] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isCritical = scan.riskLevel === "CRITICAL";
  const hasVulns = scan.vulnerabilities && scan.vulnerabilities.length > 0;
  const currentVuln: Vulnerability | undefined = hasVulns ? scan.vulnerabilities[selectedVulnIdx] : undefined;

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner & Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Score Circle widget */}
        <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
            Threat Severity Index
          </span>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-slate-800 fill-transparent"
                strokeWidth="6"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                className={`fill-transparent transition-all duration-1000 ${
                  isCritical ? "stroke-rose-500" : "stroke-emerald-500"
                }`}
                strokeWidth="6"
                strokeDasharray={351}
                strokeDashoffset={isCritical ? 0 : 351}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-xl font-mono font-bold ${isCritical ? "text-rose-500" : "text-emerald-500"}`}>
                {isCritical ? "10 / 10" : "0 / 10"}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
                {isCritical ? "Critical" : "Compliant"}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-4 leading-normal max-w-xs">
            {isCritical 
              ? "Immediate action required. Vulnerable to RFC-compliant Request Smuggling vectors."
              : "No vulnerable HTTP pipeline desynchronizations identified on tested vectors."
            }
          </span>
        </div>

        {/* Scan metadata and configuration panels */}
        <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider block mb-1">
                  Security Analysis Metrics
                </span>
                <h2 className="text-base font-semibold text-slate-100 truncate max-w-xl">
                  {scan.target}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="results-export-json"
                  onClick={() => onDownloadReport(scan.id, "json")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-xs text-slate-300 transition-all font-medium"
                >
                  JSON
                </button>
                <button
                  id="results-export-html"
                  onClick={() => onDownloadReport(scan.id, "html")}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-all font-semibold shadow-sm"
                >
                  Download Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Session ID</span>
                <span className="font-mono text-xs font-bold text-slate-300 uppercase">{scan.id.substring(0, 10)}</span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Scan Date</span>
                <span className="text-xs font-medium text-slate-300">
                  {new Date(scan.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Duration</span>
                <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {scan.duration}s
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Risk State</span>
                <span className={`font-mono text-xs font-bold ${isCritical ? "text-rose-500" : "text-emerald-400"}`}>
                  {isCritical ? "CRITICAL" : "COMPLIANT"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-slate-400">
                Tested <span className="font-mono text-slate-200 font-semibold">{scan.payloadCount} probes</span> with <span className="font-mono text-slate-200 font-semibold">{scan.threads} concurrency threads</span>.
              </span>
            </div>
            <button
              id="results-rescan-btn"
              onClick={onNavigateToScan}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              Run New Scan <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Vulnerabilities Analyzer Block */}
      {hasVulns ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Finding list tab bar */}
          <div className="bg-[#162033] border border-slate-800 rounded-xl overflow-hidden h-[500px] flex flex-col">
            <div className="bg-[#111827] p-3.5 border-b border-slate-800">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Vulnerability Incidents ({scan.vulnerabilities.length})
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
              {scan.vulnerabilities.map((vuln, idx) => {
                const isSelected = selectedVulnIdx === idx;
                return (
                  <button
                    key={idx}
                    id={`vuln-tab-${idx}`}
                    onClick={() => setSelectedVulnIdx(idx)}
                    className={`w-full p-3.5 text-left transition-all flex flex-col gap-1.5 ${
                      isSelected ? "bg-rose-500/5 border-l-2 border-rose-500" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/10 font-semibold">
                        Critical
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Confidence: {vuln.confidence}</span>
                    </div>
                    <span className={`text-xs font-mono leading-normal truncate w-full ${isSelected ? "text-rose-400 font-bold" : "text-slate-300"}`}>
                      {vuln.technique}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed analysis console */}
          <div className="bg-[#162033] border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-5 overflow-y-auto h-[500px]">
            {currentVuln && (
              <>
                {/* Vulnerability header */}
                <div className="pb-3 border-b border-slate-800 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-rose-400 font-mono">
                      {currentVuln.technique}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Confirmed pipeline vulnerability detected via HTTP/1.1 Transfer-Encoding parsing bypass.
                    </p>
                  </div>
                </div>

                {/* Technical Evidence */}
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1 tracking-wider">
                    Anatomy & Evidence
                  </span>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 border border-slate-850 rounded-md font-sans leading-relaxed">
                    {currentVuln.evidence}
                  </p>
                </div>

                {/* HTTP Outbound Smuggling Vector Code block */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-blue-400" />
                      Payload Sent
                    </span>
                    <button
                      id="copy-payload-btn"
                      onClick={() => copyToClipboard(currentVuln.payload, "payload")}
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === "payload" ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Raw
                        </>
                      )}
                    </button>
                  </div>
                  <pre id="raw-payload-viewer" className="bg-[#09090B] border border-slate-800 rounded-md p-3 overflow-x-auto text-xs font-mono text-blue-400 font-medium whitespace-pre">
                    {currentVuln.payload.trim()}
                  </pre>
                </div>

                {/* HTTP Inbound Response Code block */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <TerminalIcon className="w-3 h-3 text-emerald-400" />
                      Server response captured
                    </span>
                    <button
                      id="copy-response-btn"
                      onClick={() => copyToClipboard(currentVuln.response, "response")}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === "response" ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Raw
                        </>
                      )}
                    </button>
                  </div>
                  <pre id="raw-response-viewer" className="bg-[#09090B] border border-slate-800 rounded-md p-3 overflow-x-auto text-xs font-mono text-emerald-400 font-medium whitespace-pre">
                    {currentVuln.response.trim()}
                  </pre>
                </div>

                {/* Recommendations */}
                <div className="pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-2 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Mitigation Protocols
                  </span>
                  <div className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-md space-y-2 text-xs text-slate-300">
                    <div className="flex gap-2">
                      <span className="text-blue-400 font-bold font-mono">1.</span>
                      <span>Enforce HTTP/2 or HTTP/3 protocols to restrict parsing of legacy raw socket content streams.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-400 font-bold font-mono">2.</span>
                      <span>Configure upstream proxies to strictly reject mismatched <code>Content-Length: 0</code> and <code>Transfer-Encoding</code> requests.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-400 font-bold font-mono">3.</span>
                      <span>Inject <code>Connection: close</code> headers dynamically into multi-stage requests to prevent proxy reuse of socket pipes.</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Safe layout */
        <div className="bg-[#162033] border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[350px]">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
            Target Host Security Verification Successful
          </h3>
          <p className="text-slate-400 text-xs max-w-lg leading-relaxed mb-5">
            Our multi-vector analysis finished auditing <strong>{scan.target}</strong>. No HTTP/1.1 CL.0 Request Smuggling pipeline desynchronizations were confirmed. The server successfully validated request content lengths.
          </p>
          <div className="flex gap-3">
            <button
              id="safe-view-logs-btn"
              onClick={() => onDownloadReport(scan.id, "json")}
              className="px-3 py-1.5 border border-slate-700 hover:border-slate-600 bg-[#1e293b] hover:bg-slate-800 text-slate-300 rounded text-xs font-semibold transition-all"
            >
              Raw Export (JSON)
            </button>
            <button
              id="safe-new-scan-btn"
              onClick={onNavigateToScan}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded transition-all shadow-sm"
            >
              New Audit Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
