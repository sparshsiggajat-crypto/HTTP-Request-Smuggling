import React, { useState, useEffect } from "react";
import { Search, Bell, Shield, Clock, Sun, Moon, Sparkles } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [timeStr, setTimeStr] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header 
      id="top-navbar"
      className="h-16 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-6 select-none"
    >
      {/* Left Section: Logo & Search */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#3B82F6]" />
          <span className="font-sans font-extrabold text-sm tracking-tight text-[#F8FAFC]">CLZero</span>
          <span className="text-[9px] bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-0.5 rounded-full font-mono border border-[#3B82F6]/20 font-bold uppercase tracking-wider">PRO</span>
        </div>

        {/* Search */}
        <div className="relative w-80 hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search assets, payloads, incidents, systems..."
            className="w-full bg-[#1E293B]/60 border border-slate-800 focus:border-[#3B82F6]/50 rounded-xl py-1.5 pl-10 pr-4 text-xs font-sans text-[#F8FAFC] focus:outline-none placeholder-slate-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Section: Engine Status, Current Time, Theme, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Engine Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#1E293B]/50 border border-slate-800 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="text-[10px] text-slate-300 font-mono font-bold uppercase tracking-wider">
            Engine: Live
          </span>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#1E293B]/50 border border-slate-800 rounded-lg text-slate-300">
          <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span className="font-mono text-xs tracking-wider font-bold">{timeStr || "00:00:00"}</span>
          <span className="font-mono text-[9px] text-[#3B82F6] font-extrabold uppercase">UTC</span>
        </div>

        {/* Theme Toggle */}
        <button 
          id="navbar-theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle System Theme"
          className="p-2 bg-[#1E293B]/50 hover:bg-[#1E293B] text-slate-400 hover:text-[#F8FAFC] rounded-lg border border-slate-800 transition-all duration-150"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button 
          id="navbar-notification-btn"
          className="relative p-2 bg-[#1E293B]/50 hover:bg-[#1E293B] text-slate-400 hover:text-[#F8FAFC] rounded-lg border border-slate-800 transition-all duration-150"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/20 font-mono font-extrabold text-xs flex items-center justify-center shadow-md">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : "SP"}
          </div>
          <div className="hidden sm:block overflow-hidden">
            <div className="font-sans font-bold text-xs text-slate-200 leading-none truncate max-w-[100px]">
              {user?.username || "Sparsh"}
            </div>
            <div className="text-[9px] text-slate-500 font-mono leading-none mt-1 truncate max-w-[120px]">
              {user?.email || "sparsh@clzero.io"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
