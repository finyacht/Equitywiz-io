"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Info, ArrowRight, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

const currencyLocale: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: 'en-IN', symbol: 'INR' },
  USD: { locale: 'en-US', symbol: 'USD' },
  EUR: { locale: 'de-DE', symbol: 'EUR' },
  GBP: { locale: 'en-GB', symbol: 'GBP' },
  AUD: { locale: 'en-AU', symbol: 'AUD' },
  CAD: { locale: 'en-CA', symbol: 'CAD' },
  SGD: { locale: 'en-SG', symbol: 'SGD' },
  JPY: { locale: 'ja-JP', symbol: 'JPY' }
};

export default function SIPCalculatorPage() {
  const [currency, setCurrency] = useState("INR");
  const [isLumpsum, setIsLumpsum] = useState(false);
  const [amount, setAmount] = useState<number>(25000);
  const [frequency, setFrequency] = useState("monthly");
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [timeValue, setTimeValue] = useState<number>(10);
  const [timeUnit, setTimeUnit] = useState("years");
  const [inflationToggle, setInflationToggle] = useState(false);
  const [inflationRate, setInflationRate] = useState<number>(7);

  // Results State
  const [invested, setInvested] = useState(0);
  const [projectedValue, setProjectedValue] = useState(0);
  const [gain, setGain] = useState(0);
  const [realValue, setRealValue] = useState(0);
  const [realGain, setRealGain] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  // AI State
  const [aiGoalAmount, setAiGoalAmount] = useState("10,00,00,000"); // formatted string
  const [aiGoalTimeframe, setAiGoalTimeframe] = useState("15");
  const [aiGoalPurpose, setAiGoalPurpose] = useState("Child's education abroad");
  const [aiGoalReturn, setAiGoalReturn] = useState("12");
  const [aiQuery, setAiQuery] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fmt = (n: number) => {
    const c = currencyLocale[currency] || currencyLocale.USD;
    return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.symbol, maximumFractionDigits: 0 }).format(n || 0);
  };

  const getPeriodsPerYear = (freq: string) => {
    if (freq === 'monthly') return 12;
    if (freq === 'bi-monthly') return 6;
    if (freq === 'quarterly') return 4;
    if (freq === 'yearly') return 1;
    return 12;
  };

  const getTotalYears = (val: number, unit: string) => {
    if (unit === 'years') return val;
    if (unit === 'months') return val / 12;
    if (unit === 'days') return val / 365;
    return val / 12;
  };

  useEffect(() => {
    const P = Math.max(0, amount);
    const annual = Math.max(0, expectedReturn) / 100;
    const ppy = getPeriodsPerYear(frequency);
    const years = Math.max(0, getTotalYears(timeValue, timeUnit));
    const n = Math.floor(ppy * years);
    const r = Math.pow(1 + annual, 1 / ppy) - 1;

    let fv = 0;
    let totalInvested = 0;
    
    if (isLumpsum) {
        fv = P * Math.pow(1 + r, n);
        totalInvested = P;
    } else {
        if (r === 0) fv = P * n;
        else fv = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        totalInvested = P * n;
    }
    
    setInvested(totalInvested);
    setProjectedValue(fv);
    setGain(Math.max(0, fv - totalInvested));

    // Inflation calculations
    let rVal = 0, rGain = 0;
    const infRate = Math.max(0, inflationRate) / 100;
    const inflationPerPeriod = Math.pow(1 + infRate, 1 / ppy) - 1;

    if (inflationToggle) {
        rVal = fv / Math.pow(1 + inflationPerPeriod, n);
        rGain = rVal - totalInvested;
        setRealValue(rVal);
        setRealGain(rGain);
    }

    // Chart Data Generation
    const newChartData = [];
    if (isLumpsum) {
        let runningFV = P;
        for (let i = 1; i <= n; i++) {
            runningFV = runningFV * (1 + r);
            const dataPoint: any = { period: i, projected: runningFV, invested: P };
            if (inflationToggle) {
                dataPoint.realVal = runningFV / Math.pow(1 + inflationPerPeriod, i);
            }
            newChartData.push(dataPoint);
        }
    } else {
        let runningFV = 0;
        for (let i = 1; i <= n; i++) {
            runningFV = runningFV * (1 + r) + P;
            const dataPoint: any = { period: i, projected: runningFV, invested: P * i };
            if (inflationToggle) {
                dataPoint.realVal = runningFV / Math.pow(1 + inflationPerPeriod, i);
            }
            newChartData.push(dataPoint);
        }
    }

    // Sub-sample logic to prevent chart rendering issues if points > 600
    if (newChartData.length > 500) {
      const step = Math.ceil(newChartData.length / 50);
      const sampled = newChartData.filter((_, i) => i % step === 0 || i === newChartData.length - 1);
      setChartData(sampled);
    } else {
      setChartData(newChartData);
    }

  }, [amount, expectedReturn, frequency, isLumpsum, timeValue, timeUnit, inflationToggle, inflationRate]);

  const callGeminiGoal = async (prompt: string, includeGoalInputs = true) => {
    if (!prompt.trim()) return;
    try {
        setAiLoading(true);
        setAiMessage("");
        
        let contextData: any = {
            currency,
            currentSIP: amount,
            frequency,
            expectedReturn,
            timePeriod: timeValue,
            timeUnit,
            inflationRate,
            inflationEnabled: inflationToggle
        };
        
        if (includeGoalInputs) {
            contextData.goal = {
                targetAmount: aiGoalAmount,
                timeframe: aiGoalTimeframe,
                purpose: aiGoalPurpose,
                expectedReturn: aiGoalReturn
            };
        }
        
        const systemContext = `You are a financial planning AI assistant helping users achieve their investment goals through SIP (Systematic Investment Plan).

IMPORTANT RESPONSE RULES:
1. Be direct and actionable - start with the answer, not preambles
2. Use bullet points (•) for clarity or HTML lists
3. Format the response using clean HTML
4. Always show specific numbers with currency symbols
5. Consider inflation impact in all calculations

Current Context:
${JSON.stringify(contextData, null, 2)}`;

        const res = await fetch('/.netlify/functions/gemini-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `${systemContext}\n\nUser Query: ${prompt}` })
        });
        
        const data = await res.json();
        if (res.ok && data.response) {
            setAiMessage(data.response);
        } else {
            setAiMessage('<p>⚠️ AI is temporarily unavailable.</p>');
        }
    } catch (e) {
        setAiMessage('<p>❌ Unable to connect to AI service.</p>');
    } finally {
        setAiLoading(false);
    }
  };

  const unitLabel = timeUnit === 'years' ? (timeValue === 1 ? 'Year' : 'Years') : (timeUnit === 'days' ? (timeValue === 1 ? 'Day' : 'Days') : (timeValue === 1 ? 'Month' : 'Months'));
  const gainPercentage = invested > 0 ? ((gain / invested) * 100).toFixed(2) : 0;
  const realGainPercentage = invested > 0 ? ((realGain / invested) * 100).toFixed(2) : 0;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-5 space-y-6 text-[#1e293b]">
      
      {/* Navigation */}
      <div className="flex items-center bg-white/95 px-5 py-3 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md border border-white/50 text-[0.95rem]">
         <Link href="/" className="flex items-center text-slate-500 font-semibold hover:text-[#0ea5e9] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px] mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
         </Link>
         <span className="mx-3 text-slate-300 font-normal">/</span>
         <span className="text-slate-800 font-bold uppercase tracking-wide">SIP Calculator</span>
      </div>

      {/* Header Card */}
      <Card className="rounded-2xl border-l-[5px] border-l-[#0ea5e9] border-y-[1px] border-r-[1px] border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#10b981] shadow-md flex items-center justify-center text-white font-bold text-xl relative flex-shrink-0">
                  %%
              </div>
              <h2 className="text-2xl font-bold text-slate-800 m-0">Systematic Investment Plan (SIP)</h2>
            </div>
            
            <Dialog>
              <DialogTrigger>
                <div role="button" tabIndex={0} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20 hover:bg-[#0ea5e9]/20 hover:text-[#0369a1] h-10 px-4 py-2">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Calculator Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="CAD">CAD - Canadian Dollar (C$)</option>
                      <option value="SGD">SGD - Singapore Dollar (S$)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                    </select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-slate-500 text-[0.95rem] leading-relaxed mb-4">
            Plan recurring investments with flexible frequency, currency, and projected returns. Visualize growth vs total contributions.
          </p>
          <div className="flex items-center text-slate-500 text-[0.85rem] pt-4 border-t border-slate-200/60">
             <span>By <strong className="text-slate-700">Amal Ganatra</strong></span>
             <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="ml-1.5 text-[#0ea5e9] hover:text-[#0369a1] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                  </svg>
             </a>
          </div>
        </CardHeader>
      </Card>

      {/* Inputs and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Inputs */}
        <Card className="rounded-2xl border-[1px] border-white/80 shadow-md bg-white/95 backdrop-blur-md">
          <CardHeader>
            <h3 className="text-[1.3rem] font-bold text-slate-800 m-0">Inputs</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4 p-5 bg-slate-50/50 border border-slate-200/60 rounded-xl hover:border-[#0ea5e9] transition-colors">
              <div className="flex justify-between items-center">
                <Label className="text-slate-600 font-semibold text-[0.95rem]">Contribution & Frequency</Label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-500 cursor-pointer">Lumpsum</label>
                  <input type="checkbox" className="w-4 h-4 rounded text-[#0ea5e9] focus:ring-[#0ea5e9] border-gray-300" checked={isLumpsum} onChange={(e) => setIsLumpsum(e.target.checked)} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="range" className="flex-grow accent-[#0ea5e9]" min="0" max="100000" step="500" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                <div className="flex gap-2">
                  <Input type="number" className="w-28 bg-white" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                  <select 
                    className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value)}
                    disabled={isLumpsum}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-monthly">Bi-monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 bg-slate-50/50 border border-slate-200/60 rounded-xl hover:border-[#0ea5e9] transition-colors">
              <Label className="text-slate-600 font-semibold text-[0.95rem]">Expected return (p.a. %)</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input type="range" className="w-full accent-[#0ea5e9]" min="0" max="30" step="0.1" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} />
                <Input type="number" className="w-24 bg-white" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-4 p-5 bg-slate-50/50 border border-slate-200/60 rounded-xl hover:border-[#0ea5e9] transition-colors">
              <Label className="text-slate-600 font-semibold text-[0.95rem]">Time period</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input type="range" className="flex-grow w-full accent-[#0ea5e9]" min="1" max="50" step="1" value={timeValue} onChange={(e) => setTimeValue(Number(e.target.value))} />
                <div className="flex gap-2">
                  <Input type="number" className="w-20 bg-white" value={timeValue} onChange={(e) => setTimeValue(Number(e.target.value))} />
                  <select 
                    className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={timeUnit} 
                    onChange={(e) => setTimeUnit(e.target.value)}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>

            {inflationToggle && (
              <div className="space-y-4 p-5 bg-slate-50/50 border border-slate-200/60 rounded-xl hover:border-[#0ea5e9] transition-colors motion-safe:animate-in motion-safe:fade-in">
                <Label className="text-slate-600 font-semibold text-[0.95rem]">Inflation rate (p.a. %)</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input type="range" className="w-full accent-[#f59e0b]" min="0" max="15" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
                  <Input type="number" className="w-24 bg-white" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Right Col: Results */}
        <div className="space-y-6">
          {/* Main Results grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 border border-slate-200 rounded-xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0ea5e9] to-[#10b981]"></div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Invested</div>
              <div className="text-2xl font-black text-[#0369a1]">{fmt(invested)}</div>
            </div>
            
            <div className="bg-white/80 border border-slate-200 rounded-xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0ea5e9] to-[#10b981]"></div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Projected Value</div>
              <div className="text-2xl font-black text-[#0369a1]">{fmt(projectedValue)}</div>
            </div>
            
            <div className="bg-white/80 border border-slate-200 rounded-xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0ea5e9] to-[#10b981]"></div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Estimated Gain</div>
              <div className="text-2xl font-black text-[#10b981]">{fmt(gain)}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">(+{gainPercentage}%)</div>
            </div>
            
            <div className="bg-white/80 border border-slate-200 rounded-xl p-5 text-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0ea5e9] to-[#10b981]"></div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Tenure</div>
              <div className="text-2xl font-black text-[#0369a1]">{timeValue.toLocaleString()} {unitLabel}</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-2">
             <span className="text-sm font-semibold text-slate-600">Compare with Inflation</span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={inflationToggle} onChange={(e) => setInflationToggle(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0ea5e9] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
             </label>
          </div>

          {inflationToggle && (
            <Card className="border-[2px] border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm motion-safe:animate-in motion-safe:fade-in">
              <CardHeader className="py-4 border-b border-slate-200/60 flex flex-row items-center gap-2">
                <span className="text-xl">💰</span>
                <CardTitle className="text-[1.1rem]">Real Value After Inflation</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-[0.8rem] text-slate-500 font-semibold uppercase leading-tight mb-2">Projected Value<br/>(Adjusted)</div>
                  <div className="text-xl font-bold text-amber-600">{fmt(realValue)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[0.8rem] text-slate-500 font-semibold uppercase leading-tight mb-2">{realGain >= 0 ? "Real Gain" : "Real Loss"}</div>
                  <div className={`text-xl font-bold ${realGain >= 0 ? "text-[#10b981]" : "text-red-500"}`}>{fmt(Math.abs(realGain))}</div>
                  <div className="text-xs font-bold mt-1 opacity-80" style={{ color: realGain >= 0 ? "#10b981" : "#ef4444" }}>
                      ({realGain >= 0 ? '+' : ''}{realGainPercentage}%)
                  </div>
                </div>
                
                <div className={`col-span-2 mt-2 p-4 rounded-xl border-2 flex items-start gap-3 ${realGain > 0 ? 'bg-emerald-100/50 border-emerald-400 text-emerald-800' : 'bg-red-100/50 border-red-400 text-red-800'}`}>
                  {realGain > 0 ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 mt-0.5 shrink-0 text-emerald-600" />
                      <div className="text-sm">
                        <strong className="block mb-1 text-emerald-900">Making Real Profit!</strong>
                        Thanks to {expectedReturn}% returns, you outpace the {inflationRate}% inflation.
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0 text-red-600" />
                      <div className="text-sm">
                        <strong className="block mb-1 text-red-900">Losing Money in Real Terms</strong>
                        Your returns don&apos;t keep up with inflation. Consider higher return investments.
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Chart Section */}
      <Card className="rounded-2xl border-t-4 border-t-[#10b981] shadow-md border-x border-b border-slate-200">
        <CardHeader>
          <CardTitle>Growth Over Time</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Projected portfolio value vs total contributions over time.</p>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="period" tickFormatter={(v) => `${v}${timeUnit === 'years' ? 'Y' : 'M'}`} />
                  <YAxis tickFormatter={(val) => `${currencyLocale[currency]?.symbol || '$'}${val/1000}k`} />
                  <RechartsTooltip formatter={(value: number) => [fmt(value), '']} />
                  <Legend />
                  <Line type="monotone" dataKey="projected" name="Projected Value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                  {inflationToggle && (
                    <Line type="monotone" dataKey="realVal" name="Real Value (Adjusted)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  )}
                  <Line type="monotone" dataKey="invested" name={isLumpsum ? "Principal" : "Total Invested"} stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Goal-Based Planning Card */}
      <Card className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-yellow-50 to-amber-100/50 shadow-md">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
             <span className="text-3xl">🎯</span>
             <h2 className="text-[1.5rem] font-bold text-slate-800 m-0">AI Goal-Based Planning</h2>
          </div>
          <p className="text-slate-700 text-[0.95rem] mb-6 leading-relaxed">
             <strong>Start with your goal, not guesswork.</strong> Dream of a home? Planning your child&apos;s education? 
             Tell AI your goal, and it will calculate the <em>exact monthly SIP</em> you need—adjusted for inflation and market realities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm">
              <Label className="text-slate-600 mb-2 block font-semibold text-xs uppercase tracking-wide">Target Amount 🎯</Label>
              <Input value={aiGoalAmount} onChange={(e) => setAiGoalAmount(e.target.value)} className="bg-white border-slate-300" />
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm">
              <Label className="text-slate-600 mb-2 block font-semibold text-xs uppercase tracking-wide">Time to Achieve (Yrs) ⏱️</Label>
              <Input type="number" value={aiGoalTimeframe} onChange={(e) => setAiGoalTimeframe(e.target.value)} className="bg-white border-slate-300" />
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm">
              <Label className="text-slate-600 mb-2 block font-semibold text-xs uppercase tracking-wide">Purpose 💭</Label>
              <Input value={aiGoalPurpose} onChange={(e) => setAiGoalPurpose(e.target.value)} className="bg-white border-slate-300" />
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm">
              <Label className="text-slate-600 mb-2 block font-semibold text-xs uppercase tracking-wide">Expected Return (% p.a.) 📈</Label>
              <Input type="number" value={aiGoalReturn} onChange={(e) => setAiGoalReturn(e.target.value)} className="bg-white border-slate-300" />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <Button onClick={() => callGeminiGoal(`I want to accumulate ${aiGoalAmount} in ${aiGoalTimeframe} years for ${aiGoalPurpose}. Calculate REQUIRED monthly SIP given ${aiGoalReturn}% returns.`, true)} className="bg-gradient-to-r from-[#0ea5e9] to-[#0369a1] text-white hover:from-[#0369a1] hover:to-[#0c4a6e] shadow-md border-0">
               💰 Calculate Required SIP
            </Button>
            <Button variant="outline" onClick={() => {
                setAiGoalAmount(projectedValue.toLocaleString('en-US', { maximumFractionDigits: 0 }));
                setAiGoalTimeframe(getTotalYears(timeValue, timeUnit).toFixed(0));
                setAiGoalReturn(expectedReturn.toString());
            }} className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-semibold">
               ⬆️ Use My Calculator Results
            </Button>
          </div>

          {aiLoading && <div className="text-[#0ea5e9] font-semibold animate-pulse my-4">🤔 AI is crunching your numbers...</div>}
          
          {aiMessage && !aiLoading && (
            <div className="bg-white border-l-4 border-l-[#0ea5e9] border border-slate-200 rounded-xl p-6 text-slate-800 leading-relaxed shadow-sm my-6 prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: aiMessage }} />
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-amber-200/50">
             <Input 
               value={aiQuery} 
               onChange={(e) => setAiQuery(e.target.value)} 
               placeholder="Ask anything about your goal..." 
               className="bg-white flex-grow border-slate-300"
               onKeyDown={(e) => e.key === 'Enter' && callGeminiGoal(aiQuery, false)}
             />
             <Button onClick={() => callGeminiGoal(aiQuery, false)} className="bg-[#0f172a] text-white hover:bg-[#334155]">Ask AI</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
