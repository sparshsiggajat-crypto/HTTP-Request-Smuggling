import React from "react";
import { 
  Shield, 
  LayoutDashboard, 
  Play, 
  History, 
  BarChart3, 
  Server, 
  FileText, 
  Terminal, 
  Settings, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { ActiveTab, User } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  user,
  onLogout
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "new_scan", label: "New Scan", icon: Play },
    { id: "live_scan", label: "Live Scan", icon: Cpu },
    { id: "results", label: "Results", icon: ShieldCheck },
    { id: "scan_history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
  ] as const;

  return (
    <aside 
      id="sidebar-container"
      className={`bg-[#111827] border-r border-slate-800 transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Brand Logo */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg text-[#3B82F6] flex-shrink-0">
              <Shield className="w-4.5 h-4.5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-sans text-sm font-extrabold text-[#F8FAFC] tracking-tight leading-none">
                  CLZero Core
                </span>
                <span className="text-[9px] text-[#3B82F6] font-mono mt-1 font-semibold uppercase tracking-wider">
                  Enterprise Sec
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button 
              id="sidebar-collapse-btn"
              onClick={() => setCollapsed(true)}
              className="p-1 hover:bg-slate-800/80 rounded-md text-slate-400 hover:text-[#F8FAFC] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {collapsed && (
            <button 
              id="sidebar-expand-btn"
              onClick={() => setCollapsed(false)}
              className="p-1 hover:bg-slate-800/80 rounded-md text-slate-400 hover:text-[#F8FAFC] mx-auto transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-xs ${
                  isActive
                    ? "bg-[#3B82F6]/15 text-[#3B82F6] font-semibold border border-[#3B82F6]/20 shadow-sm shadow-[#3B82F6]/5"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                }`}
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isActive ? "text-[#3B82F6]" : "text-slate-500"}`} />
                {!collapsed && <span className="truncate tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator profile card at bottom */}
      <div className="border-t border-slate-800 p-3 bg-[#0d1421]">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 flex items-center justify-center font-mono font-extrabold text-xs shadow-inner">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "SP"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-200 truncate">
                  {user?.username || "Sparsh"}
                </div>
                <div className="text-[9px] text-[#3B82F6] font-mono tracking-wider uppercase font-semibold">
                  SecOps Engineer
                </div>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-800 hover:border-red-900 bg-slate-900 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 flex items-center justify-center font-mono font-extrabold text-xs" title={user?.username || "Sparsh"}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : "SP"}
            </div>
            <button
              id="sidebar-collapsed-logout-btn"
              onClick={onLogout}
              title="Sign Out"
              className="w-8 h-8 flex items-center justify-center bg-slate-900 hover:bg-red-950/20 border border-slate-800 hover:border-red-900 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
