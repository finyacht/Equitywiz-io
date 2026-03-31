"use client";

import React, { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Search, Loader2 } from "lucide-react";

const SAMPLE_TEXT = `Company: Acme AI, Inc. (Delaware C-Corp)
Round: Seed SAFE (post-money)
Valuation Cap: $12,000,000
Discount: 15%
MFN: Yes
Pro Rata: Investor pro-rata through Series B; non-participating
Participation: None (standard SAFE)
Liquidation Preference: 1x non-participating
Board: No seat; observer until Series A
Information Rights: Quarterly financials + annual budget
Closing: Rolling close, $250k min ticket`;

interface BenchmarkItem {
  name: string;
  provided: string;
  market_range: string;
  assessment: string;
  risk_level: "green" | "amber" | "red";
}

export default function TermSheetBenchmarkPage() {
  const [termText, setTermText] = useState("");
  const [persona, setPersona] = useState("founder");
  const [stage, setStage] = useState("seed");
  const [status, setStatus] = useState("Ready. Typical response ~3s.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Result States
  const [score, setScore] = useState("--");
  const [verdict, setVerdict] = useState("Waiting");
  const [angle, setAngle] = useState("-");
  const [summary, setSummary] = useState("Upload or use sample to see a concise readout.");
  const [risks, setRisks] = useState<string[]>(["Waiting for analysis"]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([
    { name: "Discount", provided: "—", market_range: "Seed SAFE: 10-20%", assessment: "Pending", risk_level: "amber" },
    { name: "Valuation Cap", provided: "—", market_range: "Seed SaaS: $8M-$15M", assessment: "Pending", risk_level: "amber" },
    { name: "Pro Rata", provided: "—", market_range: "Standard to Series A/B", assessment: "Pending", risk_level: "amber" },
    { name: "Participation", provided: "—", market_range: "Seed: non-participating standard", assessment: "Pending", risk_level: "amber" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Wait for pdfjsLib to load from the script tag
    const setupPdfWorker = () => {
      if ((window as any).pdfjsLib) {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";
      }
    };
    
    // In case script loaded before effect
    if ((window as any).pdfjsLib) {
      setupPdfWorker();
    } else {
      // Listen for the script load event
      window.addEventListener('load', setupPdfWorker);
    }
    
    return () => window.removeEventListener('load', setupPdfWorker);
  }, []);

  const extractPdfText = async (file: File) => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      throw new Error("PDF Library failed to load");
    }
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    const pages = Math.min(pdf.numPages, 6);
    for (let i = 1; i <= pages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    return text;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        setStatus("Reading PDF securely…");
        const text = await extractPdfText(file);
        setTermText(text);
        setStatus(`Loaded ${file.name}. Click Benchmark.`);
      } else {
        setStatus("Reading text file…");
        const text = await file.text();
        setTermText(text);
        setStatus(`Loaded ${file.name}. Click Benchmark.`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Could not read file. Please paste instead.");
    }
  };

  const buildPrompt = (text: string) => {
    return `You are a venture financing counsel benchmarking term sheet economics for founders.
Persona: ${persona}
Stage: ${stage}

Return ONLY valid JSON with:
{
  "score": number 0-100,
  "verdict": "Near market / Aggressive / Founder-friendly / Risky",
  "negotiation_angle": "short sentence",
  "summary": "3-5 lines",
  "risks": ["bullets"],
  "benchmarks": [
    {"name":"Discount","provided":"15%","market_range":"Seed SAFE 10-20%","assessment":"Market standard","risk_level":"amber"}
  ]
}

Term sheet text:
${text}`;
  };

  const handleBenchmark = async () => {
    const terms = termText.trim();
    if (!terms) {
      setStatus("Add terms via upload or paste.");
      return;
    }
    
    setIsAnalyzing(true);
    setStatus("Analyzing with Gemini…");
    
    try {
      const prompt = buildPrompt(terms);
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      };

      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
      
      const data = await res.json();
      const rawResponse = data.response || data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Attempt to parse JSON
      let parsed: any = { summary: rawResponse };
      try {
        parsed = JSON.parse(rawResponse);
      } catch (e) {
        const match = rawResponse.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      const p = parsed as any;
      if (p.score) setScore(`${p.score}/100`);
      if (p.verdict) setVerdict(p.verdict);
      if (p.negotiation_angle || p.negotiation) setAngle(p.negotiation_angle || p.negotiation);
      if (p.summary) setSummary(p.summary);
      if (p.risks || p.risk_flags) setRisks(p.risks || p.risk_flags || []);
      if (p.benchmarks) setBenchmarks(p.benchmarks);
      
      setStatus("Benchmark complete.");
    } catch (err) {
      console.error(err);
      setStatus("Gemini request failed. Please retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      {/* PDF.js Core Script (must be loaded for pdf parsing to work) */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header section matching legacy layout but utilizing Shadcn styles */}
        <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 shadow-md flex items-center justify-center shrink-0">
             <Search className="text-white w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Founder-friendly term sheet read</h1>
            <p className="text-slate-500 mb-3 text-sm md:text-base">Upload or paste a SAFE/Note/Equity term sheet. Gemini gives one verdict, key risks, and clean benchmarks.</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Gemini-powered</Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">PDF / DOCX / TXT</Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Stage-aware ranges</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span> 
                Upload or paste key terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="text-slate-400 w-8 h-8" />
                  <p className="text-sm font-medium text-slate-700">Click to upload document</p>
                  <p className="text-xs text-slate-500">PDF stays in-browser. Paste if DOCX formatting is messy.</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt,.md" 
                  onChange={handleFileUpload} 
                />
              </div>

              <textarea 
                value={termText}
                onChange={(e) => setTermText(e.target.value)}
                className="w-full min-h-[160px] p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                placeholder="Paste valuation cap, discount %, MFN, pro-rata/participation rights, liquidation prefs, board/info rights..."
              />

              <div className="pt-2">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span> 
                  Pick viewpoint
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <Select value={persona} onValueChange={(v) => { if(v) setPersona(v); }}>
                       <SelectTrigger>
                         <SelectValue placeholder="Persona" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="founder">Founder-friendly</SelectItem>
                         <SelectItem value="investor">Investor protection</SelectItem>
                         <SelectItem value="neutral">Neutral</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1">
                     <Select value={stage} onValueChange={(v) => { if(v) setStage(v); }}>
                       <SelectTrigger>
                         <SelectValue placeholder="Stage" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="pre-seed">Pre-seed</SelectItem>
                         <SelectItem value="seed">Seed</SelectItem>
                         <SelectItem value="series-a">Series A</SelectItem>
                         <SelectItem value="series-b">Series B+</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleBenchmark} 
                  disabled={isAnalyzing} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-bold h-11"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : "Benchmark with Gemini"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setTermText(SAMPLE_TEXT)}
                  disabled={isAnalyzing}
                  className="h-11 border-slate-200 text-slate-700"
                >
                  Use sample SAFE
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 inline-block mt-2">
                  Tip: Start with the sample, then swap in your terms.
                </p>
                <p className="text-xs text-slate-500 mt-2">{status}</p>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="shadow-sm">
             <CardHeader className="pb-3 border-b border-slate-100">
               <CardTitle className="text-lg flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span> 
                 Results
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 pt-5">
               <div className="grid grid-cols-3 gap-3">
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Fit</p>
                   <p className="text-2xl font-black text-slate-900 mt-1">{score}</p>
                 </div>
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verdict</p>
                   <p className="text-lg font-bold text-blue-700 mt-1 truncate">{verdict}</p>
                 </div>
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Angle</p>
                   <p className="text-sm font-bold text-slate-800 mt-1 line-clamp-2">{angle}</p>
                 </div>
               </div>

               <div>
                 <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                 <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-3 rounded-xl text-sm leading-relaxed">
                   {summary}
                 </div>
               </div>

               <div>
                 <h4 className="font-semibold text-slate-900 mb-2">Top Risks</h4>
                 <div className="flex flex-wrap gap-2">
                   {risks.map((risk, i) => (
                     <Badge key={i} variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 font-medium px-2.5 py-1">
                       {risk}
                     </Badge>
                   ))}
                 </div>
               </div>

               <div>
                 <h4 className="font-semibold text-slate-900 mb-3">Benchmarks (stage-aware)</h4>
                 <div className="space-y-2">
                   {benchmarks.map((bench, i) => {
                     // Determine color classes for pills
                     let pillColors = "bg-slate-100 text-slate-700";
                     if (bench.risk_level === 'green') pillColors = "bg-green-100 text-green-800 border-green-200";
                     if (bench.risk_level === 'amber') pillColors = "bg-amber-100 text-amber-800 border-amber-200";
                     if (bench.risk_level === 'red') pillColors = "bg-red-100 text-red-800 border-red-200";
                     
                     return (
                       <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-3 border border-slate-200 rounded-xl bg-white text-sm">
                         <div>
                           <p className="font-bold text-slate-900">{bench.name}</p>
                           <p className="text-xs text-slate-500 mt-0.5">{bench.market_range}</p>
                         </div>
                         <div className="flex items-center text-slate-700 font-medium">
                           {bench.provided}
                         </div>
                         <div className="flex justify-start sm:justify-end items-center">
                           <Badge variant="outline" className={`${pillColors} font-bold px-2 py-0.5`}>
                             {bench.assessment}
                           </Badge>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
