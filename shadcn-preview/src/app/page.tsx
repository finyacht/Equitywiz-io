"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Grid, List } from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const savedView = localStorage.getItem("toolsViewMode") as "grid" | "list" | null;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("toolsViewMode", mode);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5">
      {/* Header removed in favor of global Navbar.tsx component */}

      {/* Tools Container */}
      <div className="bg-white/90 rounded-2xl p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md border border-slate-200/70 w-full relative">
        
        {/* View Controls */}
        <div className="absolute top-5 right-5 flex gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <button 
            onClick={() => handleViewChange("grid")}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Bento Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleViewChange("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Investment & Growth Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8 pb-5 border-b-2 border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4a6cf7] to-[#2ecc71] rounded-xl flex items-center justify-center mr-4 text-white text-2xl shadow-sm">
               📈
            </div>
            <div>
              <h2 className="text-[1.8rem] font-bold text-slate-800 m-0">Investment & Growth</h2>
              <p className="text-[1rem] text-slate-500 m-0 mt-1">Plan your financial future with powerful calculators</p>
            </div>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            
            {/* Debt Snowball Card */}
            <Link href="/debt-snowball-calculator" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#8B5CF6] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Debt Payoff Strategy</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#8B5CF6] transition-colors">Debt Snowball Calculator</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Accelerate your journey to becoming debt-free by calculating how paying off your smallest debts first can save you time and money.
                </p>
              </div>
              
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#8B5CF6] bg-white/40 border-2 border-[#8B5CF6] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#8B5CF6] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Interest Rate Calculator Card */}
            <Link href="/interest-calculator" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0ea5e9] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Investment Growth Modeler</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#0ea5e9] transition-colors">Interest Rate Calculator</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Calculate how your investments grow over time with this interactive tool. Compare simple and compound interest visually.
                </p>
              </div>
              
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#0ea5e9] bg-white/40 border-2 border-[#0ea5e9] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* SIP Calculator Card */}
            <Link href="/sip-calculator" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#4a6cf7] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#4a6cf7]/10 text-[#4a6cf7] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Systematic Investment Plan</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#4a6cf7] transition-colors">SIP Calculator</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Plan recurring investments with flexible frequency & currency. Features powerful interactive inflation comparison.
                </p>
              </div>
              
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#4a6cf7] bg-white/40 border-2 border-[#4a6cf7] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#4a6cf7] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Budget & Finances Modeler Card */}
            <Link href="/budget-calculator" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#8B5CF6] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Financial Planner</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#8B5CF6] transition-colors">Budget & Finances Modeler</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Apply the 50/30/20 rule to your income and project how your designated savings will grow through various compounding methods.
                </p>
              </div>
              
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#8B5CF6] bg-white/40 border-2 border-[#8B5CF6] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#8B5CF6] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>

        {/* Equity Compensation Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8 pb-5 border-b-2 border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2ecc71] to-[#0ea5e9] rounded-xl flex items-center justify-center mr-4 text-white text-2xl shadow-sm">
               💼
            </div>
            <div>
              <h2 className="text-[1.8rem] font-bold text-slate-800 m-0">Equity Compensation</h2>
              <p className="text-[1rem] text-slate-500 m-0 mt-1">Value and manage options, RSUs, and ESPPs</p>
            </div>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {/* Grant Lifecycle Calculator v3 */}
            <Link href="#" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0a5264] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#0a5264]/10 text-[#0a5264] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Basic Past / Present / Future View</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#0a5264] transition-colors">Portfolio Timeline</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   A clear helicopter view of your equity journey: Past, Present, and Future, with a clean lifecycle chart. (Coming Soon to React)
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#0a5264] bg-white/40 border-2 border-[#0a5264] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#0a5264] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Grant Calculator */}
            <Link href="/grant-calculator" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0a5264] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#0a5264]/10 text-[#0a5264] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Equity Compensation Calculator</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#0a5264] transition-colors">Grant Calculator</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Estimate the value of your equity compensation, including both stock options and RSUs, with modern analysis.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#0a5264] bg-white/40 border-2 border-[#0a5264] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#0a5264] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Vanilla Options */}
            <Link href="/vanilla-option-modeler" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2ecc71] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#2ecc71]/10 text-[#2ecc71] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Option Value Calculator</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#2ecc71] transition-colors">Vanilla Option Modeler</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Analyze vanilla options by calculating their value at different price points. Visualize total value and net gain.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#2ecc71] bg-white/40 border-2 border-[#2ecc71] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#2ecc71] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Netflix Supplemental Stock Options */}
            <Link href="/netflix-options-modeler" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#e50914] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#e50914]/10 text-[#e50914] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Supplemental Options</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#e50914] transition-colors">Netflix Options Modeler</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Compare the value of purchasing Netflix stock vs stock options under the Supplemental Allocation plan with value & return visualizations over time.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#e50914] bg-white/40 border-2 border-[#e50914] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#e50914] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Grant Lifecycle Calculator Tool */}
            <Link href="/grant-lifecycle-calculator" className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden ${viewMode === 'list' ? 'flex-row items-center border-slate-200' : 'border-[#10b981]/20 hover:border-[#10b981] h-full sm:col-span-1 min-h-[220px]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#10b981] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Portfolio Timeline</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight tracking-tight group-hover:text-[#10b981] transition-colors">Grant Lifecycle Calculator</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-4">
                   Track and analyze your multi-grant equity portfolio over time, including vesting, deliveries, and tax-cover modeling.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#10b981] bg-white/40 border-2 border-[#10b981] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#10b981] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* ESPP Calculator Tool */}
            <Link href="/espp-calculator" className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden ${viewMode === 'list' ? 'flex-row items-center border-slate-200' : 'border-[#10b981]/20 hover:border-[#10b981] h-full sm:col-span-1 min-h-[220px]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#10b981] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Employee Purchase</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight tracking-tight group-hover:text-[#10b981] transition-colors">ESPP Calculator</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-4">
                   Calculate potential returns from your Employee Stock Purchase Plan with detailed tax modeling.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#10b981] bg-white/40 border-2 border-[#10b981] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#10b981] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* Mortgage AI Advisor Tool */}
            <Link href="/mortgage-calculator" className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden ${viewMode === 'list' ? 'flex-row items-center border-slate-200' : 'border-[#e50914]/20 hover:border-[#e50914] h-full sm:col-span-1 min-h-[220px]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-500/10 text-indigo-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Real Estate Planning</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">Mortgage AI Advisor</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-4">
                   Calculate and amortize your mortgage payments with precision, featuring extra payment schedules and AI-assisted financing strategy.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-indigo-600 bg-white/40 border-2 border-indigo-600 px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* Stock Screener Tool */}
            <Link href="/stock-screener" className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden ${viewMode === 'list' ? 'flex-row items-center border-slate-200' : 'border-[#e50914]/20 hover:border-[#e50914] h-full sm:col-span-1 min-h-[220px]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Markets & Equities</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight tracking-tight group-hover:text-emerald-600 transition-colors">Stock Market Screener</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-4">
                   Analyze real-time stock market data, view top movers, and screen equities based on sector, market cap, and performance.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-emerald-600 bg-white/40 border-2 border-emerald-600 px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* News Sentiment Tracker Tool */}
            <Link href="/news-sentiment" className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden ${viewMode === 'list' ? 'flex-row items-center border-slate-200' : 'border-[#e50914]/20 hover:border-[#e50914] h-full sm:col-span-1 min-h-[220px]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-orange-500/10 text-orange-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Alternative Data</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight tracking-tight group-hover:text-orange-600 transition-colors">News Sentiment Tracker</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-4">
                   Analyze thousands of financial news articles in real-time, utilizing our embedded NLP algorithms to spot broader market bias.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-orange-600 bg-white/40 border-2 border-orange-600 px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
            
          </div>
        </div>

        {/* Exits & Cap Tables Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8 pb-5 border-b-2 border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e50914] to-[#f97316] rounded-xl flex items-center justify-center mr-4 text-white text-2xl shadow-sm">
               🏛️
            </div>
            <div>
              <h2 className="text-[1.8rem] font-bold text-slate-800 m-0">Exits & Cap Tables</h2>
              <p className="text-[1rem] text-slate-500 m-0 mt-1">Analyze term sheets and liquidity events</p>
            </div>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {/* Term Sheet Benchmarker */}
            <Link href="/term-sheet-benchmark" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#4a6cf7] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#4a6cf7]/10 text-[#4a6cf7] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">AI SAFE / Note review</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#4a6cf7] transition-colors">Term Sheet Benchmarker</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Upload or paste a term sheet and get a simple market-fit score, key risks, and benchmarks.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#4a6cf7] bg-white/40 border-2 border-[#4a6cf7] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#4a6cf7] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Waterfall Analysis */}
            <Link href="/waterfall-analysis" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#4a6cf7] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#4a6cf7]/10 text-[#4a6cf7] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Distribution Calculator</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#4a6cf7] transition-colors">Waterfall Analysis Tool</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Visualize how investment proceeds are distributed among different share classes during an exit based on liquidation preferences.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#4a6cf7] bg-white/40 border-2 border-[#4a6cf7] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#4a6cf7] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Share Registry Converter Tool */}
            <Link href="/share-registry-converter" className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] overflow-hidden ${viewMode === 'list' ? 'flex-row items-center border-slate-200' : 'border-[#4a6cf7]/20 hover:border-[#4a6cf7]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#4a6cf7] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#4a6cf7]/10 text-[#4a6cf7] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Data Converter</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#4a6cf7] transition-colors">Share Registry Setup</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Transform messy cap table exports into clean, standardized import formats with automated data mapping.
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#4a6cf7] bg-white/40 border-2 border-[#4a6cf7] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#4a6cf7] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch App
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

          </div>
        </div>

        {/* Real Estate & Markets Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8 pb-5 border-b-2 border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-[#059669] to-[#10b981] rounded-xl flex items-center justify-center mr-4 text-white text-2xl shadow-sm">
               🏠
            </div>
            <div>
              <h2 className="text-[1.8rem] font-bold text-slate-800 m-0">Real Estate & Markets</h2>
              <p className="text-[1rem] text-slate-500 m-0 mt-1">Mortgage advisors and stock screeners</p>
            </div>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {/* Mortgage Calculator */}
            <Link href="#" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0ea5e9] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Real Estate</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#0ea5e9] transition-colors">Mortgage AI Advisor</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Smart mortgage planning with AI-powered advice and dynamic visualizations. (Coming Soon)
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#0ea5e9] bg-white/40 border-2 border-[#0ea5e9] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Stock Screener */}
            <Link href="#" className={`group bg-white/90 rounded-2xl p-6 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col relative overflow-hidden backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:border-slate-300 ${viewMode === 'grid' ? 'min-h-[250px]' : 'sm:flex-row sm:items-center sm:min-h-0'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#4a6cf7] opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className={viewMode === 'list' ? "flex-grow pr-6" : ""}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#4a6cf7]/10 text-[#4a6cf7] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Data & Analysis</span>
                </div>
                <h3 className="text-[1.35rem] font-bold text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-[#4a6cf7] transition-colors">Stock Market Screener</h3>
                <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-5">
                   Professional stock market dashboard with S&P charts, real-time data, and top gainers/losers. (Coming Soon)
                </p>
              </div>
              <div className={`mt-auto inline-flex items-center justify-center font-semibold text-[0.9rem] text-[#4a6cf7] bg-white/40 border-2 border-[#4a6cf7] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide group-hover:bg-[#4a6cf7] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${viewMode === 'list' ? 'sm:mt-0 sm:shrink-0 sm:w-auto w-full' : 'self-start'}`}>
                Launch Calculator
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Game Break Section */}
        <div className="mt-16 p-10 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl relative overflow-hidden shadow-xl text-center">
            {/* Faux Neon glow background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.5) 0%, transparent 300px), radial-gradient(circle at 80% 70%, rgba(255, 0, 255, 0.4) 0%, transparent 400px)' }}></div>
            
            <div className="text-[3rem] mb-4 filter drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">🎮</div>
            <h2 className="text-[2.5rem] font-bold text-white mb-3 tracking-tight drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">Need a Break?</h2>
            <p className="text-[1.2rem] text-slate-400 mb-8 font-normal">Feeling bored? Take a gaming break from all those calculations!</p>
            
            <div className="bg-[#0f172a]/80 border-2 border-[#0ff] rounded-2xl p-8 max-w-2xl mx-auto shadow-[0_0_20px_rgba(0,255,255,0.2)] relative group hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all">
                <h3 className="text-[2.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0ff] to-[#f0f] tracking-widest mb-1 italic">NEON CYCLES</h3>
                <div className="text-[#0ff] text-[0.9rem] uppercase tracking-[3px] font-bold mb-5">Light Trail Battle Arena</div>
                <p className="text-slate-300 text-[1rem] leading-relaxed mb-8 max-w-lg mx-auto">
                    Test your reflexes in this retro-futuristic Tron-style game. Battle against AI opponents, create light trails, and be the last one standing in the neon arena!
                </p>
                <div className="inline-flex cursor-not-allowed items-center justify-center bg-transparent border-2 border-[#0ff] text-[#0ff] font-bold px-8 py-4 rounded-full tracking-[2px] shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all hover:bg-[#0ff] hover:text-[#0f172a] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]">
                    ENTER THE ARENA (Coming Soon)
                </div>
            </div>
        </div>

      </div>

      <footer className="mt-10 py-8 text-center bg-white/85 backdrop-blur-md border-t border-slate-200 rounded-2xl shadow-sm px-10 flex flex-col md:flex-row justify-between items-center">
         <p className="text-slate-500 text-sm m-0">© {new Date().getFullYear()} All Rights Reserved</p>
         <p className="text-slate-500 text-sm flex items-center mt-4 md:mt-0">
             <a href="https://forms.gle/QzKyMR5wFdhb4Enu5" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">
                 💡 Have an idea? Share feedback
             </a>
         </p>
      </footer>

    </div>
  );
}
