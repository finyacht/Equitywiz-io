"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="w-full bg-white/92 backdrop-blur-md border-b border-slate-200/70 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08)] sticky top-0 z-50 relative">
      {/* Gradient accent bar — matches original brand */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#4a6cf7] via-[#2ecc71] to-[#e50914]" />

      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[64px]">

        {/* Logo + Brand Name */}
        <Link href="/" className="flex items-center gap-3 group no-underline">
          {/* Logo mark — exact replica of original CSS logo */}
          <div className="flex items-center justify-center w-[38px] h-[38px] bg-gradient-to-br from-[#4a6cf7] to-[#2ecc71] rounded-[10px] shadow-[0_4px_10px_rgba(74,108,247,0.3)] relative overflow-hidden shrink-0 transition-transform group-hover:-translate-y-0.5">
            <div
              className="absolute w-[22px] h-[22px] bg-white opacity-90 top-[8px] left-[8px]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%)" }}
            />
            <div
              className="absolute w-[11px] h-[11px] bg-white opacity-70 bottom-[7px] right-[7px]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 80% 100%, 80% 80%, 0 80%)" }}
            />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-[1.15rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight group-hover:from-[#4a6cf7] group-hover:to-[#2ecc71] transition-all duration-300">
              Equity-Wiz.io
            </span>
            <span className="text-[0.62rem] text-slate-400 font-normal tracking-widest uppercase hidden sm:block mt-0.5">
              Financial Modeling Tools
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Back to All Tools — only on inner pages */}
          {!isHome && (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[0.82rem] font-medium text-slate-500 hover:text-[#4a6cf7] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 5 5 12 12 19" />
              </svg>
              All Tools
            </Link>
          )}

          {/* Author */}
          <div className="hidden sm:flex items-center gap-2 text-[0.8rem] text-slate-500 border-l border-slate-200 pl-4">
            <span>by <strong className="text-slate-700 font-semibold">Amal Ganatra</strong></span>
            <a
              href="https://www.linkedin.com/in/amalganatra/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0a66c2] hover:text-[#004182] transition-colors"
              title="LinkedIn Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </header>
  );
}
