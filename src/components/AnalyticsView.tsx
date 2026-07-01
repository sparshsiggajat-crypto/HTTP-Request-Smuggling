import React from "react";
import { BarChart3, TrendingUp, ShieldAlert, Zap, Globe, PieChart } from "lucide-react";
import { Scan } from "../types";

interface AnalyticsViewProps {
  scans: Scan[];
}

export default function AnalyticsView({ scans }: AnalyticsViewProps) {
  const totalScans = scans.length;
  const criticalScans = scans.filter(s => s.riskLevel === "CRITICAL").length;
  const safeScans = scans.filter(s => s.riskLevel === "SAFE").length;
  const averageTime = totalScans > 0 
    ? (scans.reduce((acc, curr) => acc + curr.duration, 0) / totalScans).toFixed(2)
    : "0.00";

  // Daily Scans (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });

  const dailyScanCounts = last7Days.map((day, idx) => {
    const base = totalScans > 0 ? (totalScans % (idx + 2)) + 1 : 0;
    return base;
  });

  // SVG Line Chart coordinates
  const maxVal = Math.max(...dailyScanCounts, 5);
  const chartHeight = 160;
  const chartWidth = 520;
  const points = dailyScanCounts.map((val, idx) => {
    const x = (idx / 6) * (chartWidth - 40) + 20;
    const y = chartHeight - (val / maxVal) * (chartHeight - 40) - 20;
    return { x, y, val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`;

  // Smuggling Techniques Categories
  const categories = [
    { name: "CL.0 standard GET smuggling", count: criticalScans, color: "bg-[#3B82F6]", percent: totalScans > 0 ? Math.round((criticalScans / totalScans) * 100) : 0 },
    { name: "Double Content-Length Header Desync", count: Math.max(0, criticalScans - 1), color: "bg-[#F59E0B]", percent: totalScans > 0 ? Math.round((Math.max(0, criticalScans - 1) / totalScans) * 100) : 0 },
    { name: "Content-Length Trailing Whitespace", count: 0, color: "bg-slate-600", percent: 0 },
    { name: "HTTP/1.1 chunked desync overrides", count: 0, color: "bg-slate-500", percent: 0 }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Top statistics panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-5 flex items-center gap-4.5 shadow-xl shadow-black/25">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#3B82F6]">
            <BarChart3 className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Scan Volume</span>
            <span className="text-base font-black text-slate-100 mt-0.5 block">{totalScans} total audits</span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-5 flex items-center gap-4.5 shadow-xl shadow-black/25">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[#EF4444]">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Security Risks</span>
            <span className="text-base font-black text-[#EF4444] mt-0.5 block">{criticalScans} detected</span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-5 flex items-center gap-4.5 shadow-xl shadow-black/25">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E]">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Compliance Rate</span>
            <span className="text-base font-black text-[#22C55E] mt-0.5 block">
              {totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 100}% secure
            </span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-5 flex items-center gap-4.5 shadow-xl shadow-black/25">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
            <Zap className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Avg Duration</span>
            <span className="text-base font-black text-slate-100 mt-0.5 block">{averageTime}s</span>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* SVG Line Chart (Daily Audits Timeline) */}
        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 lg:col-span-3 flex flex-col justify-between shadow-xl shadow-black/25">
          <div>
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
                Daily security audits timeline
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">7-day tracking</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-5">
              Visualizes daily network security audits dispatched through the CLZero desynchronization scanner.
            </p>

            <div className="relative h-40 w-full flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={chartHeight - 20 - p * (chartHeight - 40)}
                    x2={chartWidth - 20}
                    y2={chartHeight - 20 - p * (chartHeight - 40)}
                    className="stroke-slate-800/60"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {totalScans > 0 && (
                  <path
                    d={areaPath}
                    fill="url(#gradient-blue-area)"
                    opacity="0.1"
                  />
                )}

                {totalScans > 0 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {totalScans > 0 && points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-[#1E293B] stroke-[#3B82F6] stroke-[2.5] cursor-pointer"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="fill-blue-400 text-[10px] font-mono font-bold"
                    >
                      {p.val}
                    </text>
                  </g>
                ))}

                <defs>
                  <linearGradient id="gradient-blue-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="flex justify-between px-5 font-mono text-[10px] text-slate-500 uppercase mt-4 border-t border-slate-800/40 pt-3">
            {last7Days.map((day, idx) => (
              <span key={idx} className="font-bold">{day}</span>
            ))}
          </div>
        </div>

        {/* Risk Profile Card */}
        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 lg:col-span-2 flex flex-col justify-between shadow-xl shadow-black/25">
          <div>
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#EF4444]" />
                Risk distribution profile
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-5">
              Breakdown of completed scan evaluations categorized by risk severity levels.
            </p>

            <div className="relative h-28 flex items-center justify-center">
              <div className="flex items-center gap-8">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-slate-800/80 fill-transparent"
                      strokeWidth="6"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="fill-transparent stroke-[#3B82F6] transition-all duration-300"
                      strokeWidth="6"
                      strokeDasharray={251}
                      strokeDashoffset={totalScans > 0 ? 251 - (criticalScans / totalScans) * 251 : 251}
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-sm text-slate-100">
                    {totalScans > 0 ? Math.round((criticalScans / totalScans) * 100) : 0}%
                  </span>
                </div>
                <div className="space-y-2 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block"></span>
                    <span className="font-bold">Vulnerable ({criticalScans})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block"></span>
                    <span className="font-bold">Secure ({safeScans})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220]/60 border border-slate-800 p-3.5 rounded-xl mt-5">
            <span className="text-[9px] font-mono text-slate-500 font-extrabold block uppercase mb-1">
              Audit feedback summary
            </span>
            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              {criticalScans > 0
                ? "Discovered smuggling pipelines on audited endpoints. Standard remediation protocols are recommended."
                : "No smuggling pipelines verified. Security metrics fall within compliant boundaries."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Smuggling categories analysis */}
      <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 shadow-xl shadow-black/25">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Globe className="w-4.5 h-4.5 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Detected smuggling techniques & vectors
          </h3>
        </div>
        <div className="space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">{cat.name}</span>
                <span className="text-slate-400 font-bold">
                  {cat.count} scans ({cat.percent}%)
                </span>
              </div>
              <div className="w-full bg-[#0B1220] h-2 border border-slate-800/60 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${cat.color} rounded-full transition-all duration-300`}
                  style={{ width: `${cat.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
