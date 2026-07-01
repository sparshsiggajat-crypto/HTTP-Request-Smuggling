import React from "react";
import { Info, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from "lucide-react";

export default function AboutView() {
  return (
    <div className="space-y-6 max-w-4xl select-none animate-fade-in">
      {/* Hero introduction card */}
      <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 shadow-xl shadow-black/25">
        <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-slate-800/60">
          <Info className="w-4.5 h-4.5 text-[#3B82F6]" />
          <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
            HTTP/1.1 CL.0 Request Smuggling Mechanics
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
          HTTP Request Smuggling is an advanced attack vector that targets synchronization discrepancies between frontend proxy servers (e.g., Load Balancers, Content Delivery Networks) and backend application services. By desynchronizing how these systems parse boundaries in consecutive HTTP request streams, an attacker can "smuggle" a malicious request inside a legitimate request, causing the server to process the smuggled payload under a victim's connection.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          The <strong className="font-bold text-slate-100">CLZero</strong> platform is designed specifically to audit, detect, and mitigate a critical subset of HTTP request smuggling known as <strong className="text-[#3B82F6] font-bold">CL.0 Smuggling</strong>.
        </p>
      </div>

      {/* Interactive visual smuggling flowchart */}
      <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 space-y-5 shadow-xl shadow-black/25">
        <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
          CL.0 Attack Stream Mechanics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Box 1: Attacker payload */}
          <div className="bg-[#0B1220]/80 p-5 border border-slate-800 rounded-xl text-center space-y-2">
            <span className="font-mono text-[9px] uppercase font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/10 px-2 py-1 rounded">
              1. Attack Payload
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attacker sends a POST request containing a nested smuggling block with a <code>Content-Length: 0</code> instruction.
            </p>
          </div>

          <div className="flex justify-center text-[#3B82F6]">
            <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          {/* Box 2: Proxy behavior */}
          <div className="bg-[#0B1220]/80 p-5 border border-slate-800 rounded-xl text-center space-y-2">
            <span className="font-mono text-[9px] uppercase font-bold text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/10 px-2 py-1 rounded">
              2. Frontend Proxy
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              The frontend proxy processes <code>Content-Length: 0</code>, ignores the request body, but still forwards the stream.
            </p>
          </div>

          <div className="hidden md:flex justify-center text-[#3B82F6]">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>

          {/* Box 3: Backend Desync */}
          <div className="bg-[#0B1220]/80 p-5 border border-slate-800 rounded-xl text-center space-y-2 md:col-span-3">
            <span className="font-mono text-[9px] uppercase font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/10 px-2 py-1 rounded">
              3. Backend Pipeline Desynchronization
            </span>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
              The backend server processes the nested block as a subsequent client request in the socket cache. 
              The next innocent client requesting a page receives the hijacked smuggled response, leading to token or credential disclosure.
            </p>
          </div>
        </div>
      </div>

      {/* Technical analysis details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 space-y-3.5 shadow-xl shadow-black/25">
          <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-[#3B82F6]" />
            Vulnerability Context
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The CL.0 vulnerability refers specifically to cases where a proxy/frontend server ignores the <code>Content-Length</code> header altogether or sets it to `0` automatically for certain requests (e.g., GET requests), whereas the backend server interprets the body as part of a persistent HTTP pipeline.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            CLZero scans for this by testing multiple pipeline formats and monitoring response body differences on secondary requests.
          </p>
        </div>

        <div className="bg-[#1E293B] border border-slate-800/80 rounded-[20px] p-6 space-y-3.5 shadow-xl shadow-black/25">
          <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#22C55E]" />
            Mitigation Guidelines
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mitigation requires strict parsing standards across proxy boundaries:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
            <li>Transition to HTTP/2 or HTTP/3 where boundaries are structured natively.</li>
            <li>Enforce Nginx, Cloudflare or AWS ALB to strictly parse multi-header content mismatches.</li>
            <li>Configure backend proxies to drop persistent keep-alive connections on parsing errors.</li>
          </ul>
        </div>
      </div>

      {/* General Ethical Disclaimer */}
      <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 p-5 rounded-xl flex gap-3.5 text-xs text-[#EF4444] leading-relaxed shadow-xl shadow-black/10">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-1 uppercase tracking-wider font-extrabold text-[11px]">Ethical Security Disclaimer</strong>
          CLZero is intended strictly for authorized educational research, security audits, and ethical penetration testing. Running automated vulnerability scanners against external servers without explicit written authorization is unauthorized and highly disruptive.
        </div>
      </div>
    </div>
  );
}
