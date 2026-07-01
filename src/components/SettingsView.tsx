import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Sliders, Bell, Key } from "lucide-react";
import { Settings as SettingsType } from "../types";

interface SettingsViewProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
}

export default function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const [defaultThreads, setDefaultThreads] = useState(10);
  const [defaultTimeout, setDefaultTimeout] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alertRules, setAlertRules] = useState("high-confidence-only");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setDefaultThreads(settings.defaultThreads);
      setDefaultTimeout(settings.defaultTimeout);
      setNotificationsEnabled(settings.notificationsEnabled);
      setAlertRules(settings.alertRules);
      setTheme(settings.theme);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      defaultThreads,
      defaultTimeout,
      notificationsEnabled,
      alertRules,
      theme
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 max-w-2xl select-none shadow-xl shadow-black/25 animate-fade-in">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800/60">
        <Settings className="w-4.5 h-4.5 text-[#3B82F6]" />
        <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
          Scanner Engine Settings
        </h2>
      </div>

      {saved && (
        <div className="mb-5 p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl flex items-center gap-2.5 text-xs text-[#22C55E]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Scanner configuration successfully saved to active memory.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Constraints */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#3B82F6]" />
            1. Core Scan Constraints
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Default Threads Concurrency
              </label>
              <input
                id="settings-threads-input"
                type="number"
                min="1"
                max="50"
                value={defaultThreads}
                onChange={(e) => setDefaultThreads(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 transition-colors shadow-inner"
              />
              <span className="text-[10px] text-slate-500 block leading-normal pt-0.5">
                Parallel socket handshakes allowed per target scan block.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Default Response Timeout (s)
              </label>
              <input
                id="settings-timeout-input"
                type="number"
                min="1"
                max="30"
                value={defaultTimeout}
                onChange={(e) => setDefaultTimeout(parseInt(e.target.value, 10) || 5)}
                className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 transition-colors shadow-inner"
              />
              <span className="text-[10px] text-slate-500 block leading-normal pt-0.5">
                Duration wait limit for socket lines to fully flush responses.
              </span>
            </div>
          </div>
        </div>

        {/* System & Alert Rules */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3B82F6]" />
            2. Alerting Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Threat Filter Rules
              </label>
              <select
                id="settings-alert-select"
                value={alertRules}
                onChange={(e) => setAlertRules(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 cursor-pointer"
              >
                <option value="high-confidence-only">Verified Exploits (High Confidence)</option>
                <option value="all-anomalies">All Pipeline Anomalies & Latency Lags</option>
                <option value="strict-compliance">Strict RFC 7230 Compliance Anomalies</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Theme Accent Profile
              </label>
              <select
                id="settings-theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]/50 cursor-pointer"
              >
                <option value="dark">Slate Dark (Crowdstrike Style)</option>
                <option value="light">Compliance Classic Light</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-3 group">
            <input
              id="settings-notifications-checkbox"
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="rounded-md border-slate-800 text-[#3B82F6] focus:ring-0 focus:ring-offset-0 bg-[#0B1220] w-4.5 h-4.5 cursor-pointer"
            />
            <div className="select-none">
              <span className="block text-xs font-bold text-slate-300 group-hover:text-slate-100 transition-colors">Audible notification alert</span>
              <span className="block text-[10px] text-slate-500 leading-none mt-1">Play dynamic operator alert tone when vulnerability verified</span>
            </div>
          </label>
        </div>

        {/* SIEM / Third Party Integrations */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-[#3B82F6]" />
            3. WebHook & SIEM Integration
          </h3>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
              Splunk / Slack Alert Gateway Webhook
            </label>
            <input
              id="settings-webhook-input"
              type="password"
              placeholder="https://hooks.slack.com/services/T00000/B00000/XXXXXXXX"
              disabled
              className="w-full bg-[#0B1220]/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-600 cursor-not-allowed placeholder-slate-700"
            />
            <span className="text-[10px] text-slate-500 block leading-normal">
              Instantly broadcast validated request smuggling incidents straight to corporate SIEM ingestion pipelines.
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800/60 flex justify-end">
          <button
            id="settings-submit-btn"
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#3B82F6]/20"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
