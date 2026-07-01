import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  color: "blue" | "green" | "yellow" | "red";
  trendPercentage?: string;
  trendUp?: boolean;
  trendData?: number[];
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color,
  trendPercentage = "+4.2%",
  trendUp = true,
  trendData = [4, 6, 5, 8, 7, 9, 11]
}: StatsCardProps) {
  const colorMap = {
    blue: {
      text: "text-[#3B82F6]",
      bg: "bg-[#3B82F6]/10",
      border: "hover:border-[#3B82F6]/40",
      accent: "#3B82F6"
    },
    green: {
      text: "text-[#22C55E]",
      bg: "bg-[#22C55E]/10",
      border: "hover:border-[#22C55E]/40",
      accent: "#22C55E"
    },
    yellow: {
      text: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      border: "hover:border-[#F59E0B]/40",
      accent: "#F59E0B"
    },
    red: {
      text: "text-[#EF4444]",
      bg: "bg-[#EF4444]/10",
      border: "hover:border-[#EF4444]/40",
      accent: "#EF4444"
    }
  };

  const currentStyle = colorMap[color] || colorMap.blue;

  // Simple SVG sparkline path generator
  const getSparklinePath = (data: number[]) => {
    if (!data || data.length === 0) return "";
    const width = 60;
    const height = 16;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className={`bg-gradient-to-br from-[#1E293B] to-[#1E293B]/80 border border-slate-800/80 ${currentStyle.border} rounded-[20px] p-5 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 select-none flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block">
            {title}
          </span>
          <span className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight block">
            {value}
          </span>
        </div>
        <div className={`p-3 rounded-xl ${currentStyle.bg} ${currentStyle.text} border border-slate-800 flex items-center justify-center shadow-md transition-all`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-800/60">
        {/* Sparkline & Trend */}
        <div className="flex items-center gap-1.5">
          {trendUp ? (
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
          )}
          <span className={`text-xs font-extrabold ${trendUp ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
            {trendPercentage}
          </span>
        </div>

        {/* Mini sparkline */}
        <div className="w-16 h-4 opacity-80">
          <svg className="w-full h-full overflow-visible">
            <path
              d={getSparklinePath(trendData)}
              fill="none"
              stroke={trendUp ? "#22C55E" : "#EF4444"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-slate-500 font-mono tracking-tight flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
        <span>{description}</span>
      </div>
    </div>
  );
}
