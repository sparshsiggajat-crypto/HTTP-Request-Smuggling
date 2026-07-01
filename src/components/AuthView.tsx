import React, { useState } from "react";
import { ShieldAlert, Key, Mail, User, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

interface AuthViewProps {
  onAuthSuccess: (token: string, user: { id: string; email: string; username: string }) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin 
      ? { email, password }
      : { email, password, username };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication command rejected by security server");
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6 relative select-none overflow-hidden">
      {/* Background visual graphics - cybersecurity matrix grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>
      
      {/* Soft orb background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-slate-800 rounded-[24px] shadow-2xl shadow-black/60 p-8 relative z-10 transition-all">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-gradient-to-br from-[#3B82F6] to-blue-700 rounded-[18px] shadow-lg shadow-[#3B82F6]/25 mb-4 relative">
            <ShieldAlert className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]"></span>
            </span>
          </div>
          <h1 className="font-sans text-xl font-black tracking-tight text-[#F8FAFC]">
            CLZero Platform
          </h1>
          <p className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-wider font-extrabold mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> HTTP/1.1 Smuggling Auditing
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl flex items-start gap-3 text-xs text-[#EF4444]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security Reject:</span> {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                Operator Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="auth-username-input"
                  type="text"
                  placeholder="e.g. Neo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-[#1E293B] border border-slate-800 focus:border-[#3B82F6]/50 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-100 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
              Authorized Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="auth-email-input"
                type="email"
                placeholder="operator@clzero.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1E293B] border border-slate-800 focus:border-[#3B82F6]/50 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-100 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
              Access Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="auth-password-input"
                type="password"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1E293B] border border-slate-800 focus:border-[#3B82F6]/50 rounded-xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-100 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3B82F6] hover:bg-[#3B82F6]/90 active:scale-[0.98] text-white font-sans font-bold text-xs rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-[#3B82F6]/20 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <span className="tracking-wide animate-pulse">ESTABLISHING CRYPTO GATEWAY...</span>
            ) : (
              <>
                <span>{isLogin ? "Sign In & Connect" : "Create Operator Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <button
            id="auth-switch-view-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
            }}
            className="text-xs font-sans font-medium text-slate-400 hover:text-[#3B82F6] transition-colors"
          >
            {isLogin 
              ? "New here? Register a new SecOps key" 
              : "Already have access? Authorize existing key"}
          </button>
        </div>
      </div>
    </div>
  );
}
