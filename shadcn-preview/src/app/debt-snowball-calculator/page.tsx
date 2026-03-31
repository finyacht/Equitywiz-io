"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator, ArrowRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Debt = {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
  paidOff?: boolean;
};

// Formatters
const fmtCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// AI Fetch matching original logic
async function callAIAssistant(prompt: string, contextData: any, setAiLoading: any, setAiMessage: any) {
  if (!prompt.trim()) return;

  try {
    setAiLoading(true);
    setAiMessage("");

    const systemContext = `You are a financial planning AI assistant specializing in debt management.
    
IMPORTANT RESPONSE RULES:
1. Be direct and actionable.
2. Use bullet points (•) or HTML lists for clarity.
3. Always show specific numbers with currency symbols where relevant.
4. Keep responses concise and encouraging (under 250 words).
5. Format the response using clean HTML (e.g., <p>, <ul>, <li>, <strong>) instead of markdown text. DO NOT wrap the response in markdown code blocks like \`\`\`html.

Current Calculator Context:
${JSON.stringify(contextData, null, 2)}`;

    const res = await fetch('/.netlify/functions/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: `${systemContext}\n\nUser Query: ${prompt}`
        })
    });

    const data = await res.json();
    if (res.ok && data.response) {
        setAiMessage(data.response);
    } else {
        setAiMessage('<p>⚠️ AI is temporarily unavailable. Please try again later.</p>');
    }
  } catch (e) {
      console.error('AI Error:', e);
      setAiMessage('<p>❌ Unable to connect to AI service.</p>');
  } finally {
      setAiLoading(false);
  }
}

// Logic ported exactly from original Express HTML file
function calculateAmortization(debtArray: Debt[], extraSnowballPayment: number) {
  let currentDebts = debtArray.map(d => ({
      ...d,
      balance: d.balance || 0,
      rate: (d.rate || 0) / 100 / 12, // Monthly interest rate
      min: d.minPayment || 0,
      paidOff: false
  })).filter(d => d.balance > 0);

  currentDebts.sort((a, b) => a.balance - b.balance);

  let totalInterest = 0;
  let month = 0;
  let schedule = [{
      month: 0,
      totalBalance: currentDebts.reduce((sum, d) => sum + d.balance, 0)
  }];

  const MAX_MONTHS = 600; 

  while (currentDebts.some(d => !d.paidOff) && month < MAX_MONTHS) {
      month++;
      let availableSnowball = extraSnowballPayment;

      for (let i = 0; i < currentDebts.length; i++) {
          let d = currentDebts[i];
          if (d.paidOff) {
              availableSnowball += d.min;
              continue;
          }

          let interest = d.balance * d.rate;
          totalInterest += interest;
          d.balance += interest;

          if (d.balance <= d.min) {
              availableSnowball += (d.min - d.balance); 
              d.balance = 0;
              d.paidOff = true;
          } else {
              d.balance -= d.min;
              if (d.min <= interest && extraSnowballPayment === 0) {
                  return { error: true, message: `Minimum payment on ${d.name} is not covering interest.` };
              }
          }
      }

      if (availableSnowball > 0) {
          for (let i = 0; i < currentDebts.length; i++) {
              let d = currentDebts[i];
              if (!d.paidOff) {
                  if (d.balance <= availableSnowball) {
                      availableSnowball -= d.balance;
                      d.balance = 0;
                      d.paidOff = true;
                  } else {
                      d.balance -= availableSnowball;
                      availableSnowball = 0;
                      break; 
                  }
              }
          }
      }

      schedule.push({
          month: month,
          totalBalance: currentDebts.reduce((sum, d) => sum + d.balance, 0)
      });
  }

  return { months: month, totalInterest, schedule, error: month >= MAX_MONTHS };
}

function addMonthsToDate(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}


export default function DebtSnowballPage() {
  const [debts, setDebts] = useState<Debt[]>([
    { id: "1", name: 'Credit Card 1', balance: 2500, rate: 19.99, minPayment: 75 },
    { id: "2", name: 'Car Loan', balance: 12000, rate: 5.5, minPayment: 250 },
    { id: "3", name: 'Student Loan', balance: 25000, rate: 4.5, minPayment: 300 }
  ]);
  const [extraPayment, setExtraPayment] = useState<number>(250);
  const [results, setResults] = useState<any>({ baselineRes: {}, snowballRes: {} });
  
  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const addDebt = () => {
    setDebts([...debts, { id: Math.random().toString(), name: `Debt ${debts.length + 1}`, balance: 1000, rate: 15.0, minPayment: 50 }]);
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
       setDebts(debts.filter(d => d.id !== id));
    }
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d ));
  };

  useEffect(() => {
    const totalDebt = debts.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
    const totalMin = debts.reduce((sum, d) => sum + (Number(d.minPayment) || 0), 0);
    
    const baselineRes = calculateAmortization(debts, 0);
    const snowballRes = calculateAmortization(debts, Number(extraPayment) || 0);

    // Format chart data matching the original logic (sampling ~20 points)
    let maxMonths = 0;
    if (!baselineRes.error && baselineRes.schedule) maxMonths = baselineRes.schedule.length;
    if (!snowballRes.error && snowballRes.schedule && snowballRes.schedule.length > maxMonths) maxMonths = snowballRes.schedule.length;
    
    const chartData = [];
    if (maxMonths > 0) {
      for (let i = 0; i < maxMonths; i += Math.ceil(maxMonths / 20)) {
          const dDate = new Date();
          dDate.setMonth(dDate.getMonth() + i);
          const monthLabel = dDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          chartData.push({
             month: monthLabel,
             baseline: baselineRes.error || !baselineRes.schedule || !baselineRes.schedule[i] ? 0 : baselineRes.schedule[i].totalBalance,
             snowball: snowballRes.error || !snowballRes.schedule || !snowballRes.schedule[i] ? 0 : snowballRes.schedule[i].totalBalance
          });
      }
      
      const lastDate = new Date();
      lastDate.setMonth(lastDate.getMonth() + maxMonths - 1);
      const lastIdx = maxMonths - 1;
      chartData.push({
          month: lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          baseline: baselineRes.error || !baselineRes.schedule || !baselineRes.schedule[lastIdx] ? 0 : baselineRes.schedule[lastIdx].totalBalance,
          snowball: snowballRes.error || !snowballRes.schedule || !snowballRes.schedule[lastIdx] ? 0 : snowballRes.schedule[lastIdx].totalBalance
      });
    }

    let savings: any = { interestSaved: 0, monthsSaved: 0, timeStr: "" };
    if (!baselineRes.error && !snowballRes.error && baselineRes.totalInterest !== undefined && snowballRes.totalInterest !== undefined && baselineRes.months !== undefined && snowballRes.months !== undefined && extraPayment > 0) {
        savings.interestSaved = baselineRes.totalInterest - snowballRes.totalInterest;
        savings.monthsSaved = baselineRes.months - snowballRes.months;
        
        const years = Math.floor(savings.monthsSaved / 12);
        const monthRemainder = savings.monthsSaved % 12;
        let timeStr = "";
        if (years > 0) timeStr += `${years} year${years > 1 ? 's' : ''} `;
        if (monthRemainder > 0) timeStr += `${monthRemainder} month${monthRemainder > 1 ? 's' : ''}`;
        savings.timeStr = timeStr;
    }

    setResults({ totalDebt, totalMin, baselineRes, snowballRes, savings, chartData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debts, extraPayment]);

  return (
    <div className="max-w-[1200px] mx-auto w-full px-5 space-y-6 text-[#1e293b]">
      
      {/* Navigation */}
      <div className="flex items-center bg-white/95 px-5 py-3 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md border border-white/50 text-[0.95rem]">
         <a href="https://equitywiz.io/" className="flex items-center text-slate-500 font-semibold hover:text-[#8B5CF6] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px] mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
         </a>
         <span className="mx-3 text-slate-300 font-normal">/</span>
         <span className="text-slate-800 font-bold">Debt Snowball Calculator</span>
      </div>

      {/* 1:1 Match of Original Header Style */}
      <Card className="rounded-2xl border-l-[5px] border-l-[#8B5CF6] border-y-[1px] border-r-[1px] border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] shadow-md flex items-center justify-center text-white relative flex-shrink-0">
               <div className="absolute w-5 h-5 bg-white opacity-90 top-2 left-2" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 m-0">Debt Snowball Calculator</h2>
          </div>
          <p className="text-slate-500 text-[0.95rem] leading-relaxed mb-4">
            Accelerate your journey to becoming debt-free. Discover how paying off your smallest debts first and
            rolling those payments into the next largest debt can save you time and money.
          </p>
          <div className="flex items-center text-slate-500 text-[0.85rem] pt-4 border-t border-slate-200/60">
             <span>By <strong className="text-slate-700">Amal Ganatra</strong></span>
             <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="ml-1.5 text-[#0a66c2] hover:text-[#004182] transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                     <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                 </svg>
             </a>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">

        {/* Inputs Section */}
        <Card className="rounded-2xl border-[1px] border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-[1.5rem] font-bold text-slate-800 m-0 leading-none">1. Enter Your Debts</h2>
            <Button onClick={addDebt} variant="outline" className="text-[#8B5CF6] border-2 border-[#8B5CF6] hover:bg-[#f5f3ff] rounded-lg h-[44px] px-5 font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Add Debt
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-[15px]">
              {debts.map((debt) => (
                <div key={debt.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start bg-[#f8fafc] p-4 rounded-xl border border-slate-200/80 transition-shadow hover:shadow-md hover:border-slate-300">
                  <div className="md:col-span-2 space-y-[6px]">
                    <Label className="text-[0.85rem] font-semibold text-slate-700">Debt Name/Type</Label>
                    <Input className="bg-white border-2 border-slate-200 h-[48px] rounded-lg focus-visible:ring-0 focus-visible:border-[#8B5CF6]" value={debt.name} onChange={(e) => updateDebt(debt.id, "name", e.target.value)} />
                  </div>
                  <div className="space-y-[6px] relative">
                    <Label className="text-[0.85rem] font-semibold text-slate-700">Balance</Label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold pointer-events-none">$</span>
                       <Input type="number" className="pl-8 bg-white border-2 border-slate-200 h-[48px] rounded-lg focus-visible:ring-0 focus-visible:border-[#8B5CF6]" value={debt.balance} onChange={(e) => updateDebt(debt.id, "balance", parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-[6px] relative">
                    <Label className="text-[0.85rem] font-semibold text-slate-700">Interest Rate</Label>
                    <div className="relative">
                       <Input type="number" className="pr-8 bg-white border-2 border-slate-200 h-[48px] rounded-lg focus-visible:ring-0 focus-visible:border-[#8B5CF6]" value={debt.rate} onChange={(e) => updateDebt(debt.id, "rate", parseFloat(e.target.value))} />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold pointer-events-none">%</span>
                    </div>
                  </div>
                  <div className="space-y-[6px] relative">
                    <Label className="text-[0.85rem] font-semibold text-slate-700">Min. Payment</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold pointer-events-none">$</span>
                         <Input type="number" className="pl-8 bg-white border-2 border-slate-200 h-[48px] rounded-lg focus-visible:ring-0 focus-visible:border-[#8B5CF6]" value={debt.minPayment} onChange={(e) => updateDebt(debt.id, "minPayment", parseFloat(e.target.value))} />
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-full h-[40px] w-[40px] mt-1 shrink-0" onClick={() => removeDebt(debt.id)} disabled={debts.length === 1}>
                        <Trash2 className="w-[20px] h-[20px]" color="currentColor" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-[1.5rem] font-bold text-slate-800 mt-[30px] mb-[20px] leading-none">2. Add Extra Payment (The Snowball)</h2>
            <div className="bg-[#f8fafc] p-[20px] rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-center gap-[20px]">
              <div className="flex-1 text-[0.95rem] text-slate-500 leading-[1.5]">
                <strong className="text-slate-700 font-semibold">How much extra can you pay each month?</strong><br />
                This is the key to the snowball method. Any extra money you put toward your smallest debt will drastically speed up your debt-free date.
              </div>
              <div className="w-full md:w-1/3 space-y-[6px]">
                <Label className="text-[0.95rem] font-semibold text-slate-700">Extra Monthly Payment</Label>
                <div className="relative mt-2">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold pointer-events-none">$</span>
                   <Input type="number" className="pl-8 bg-[#f8fafc] border-2 border-slate-200 h-[48px] rounded-lg focus-visible:ring-0 focus-visible:border-[#8B5CF6] text-lg text-slate-800" value={extraPayment} onChange={(e) => setExtraPayment(parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="rounded-2xl border-[1px] border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md">
          <CardHeader>
             <h2 className="text-[1.5rem] font-bold text-slate-800 m-0">Your Debt Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/50 border border-white/80 p-5 rounded-xl text-center">
                <div className="text-[0.9rem] text-slate-500 font-semibold uppercase tracking-wide mb-2">Total Debt</div>
                <div className="text-3xl font-extrabold text-slate-800">{fmtCurrency.format(results?.totalDebt || 0)}</div>
                <div className="text-[0.85rem] text-slate-500 mt-2">{debts.length} account(s)</div>
              </div>
              <div className="bg-white/50 border border-white/80 p-5 rounded-xl text-center">
                <div className="text-[0.9rem] text-slate-500 font-semibold uppercase tracking-wide mb-2">Base Min Payments</div>
                <div className="text-3xl font-extrabold text-slate-800">{fmtCurrency.format(results?.totalMin || 0)}</div>
                <div className="text-[0.85rem] text-slate-500 mt-2">Required every month</div>
              </div>
              <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white p-5 rounded-xl text-center shadow-lg shadow-purple-500/20">
                <div className="text-[0.9rem] text-white/90 font-semibold uppercase tracking-wide mb-2">Total Monthly Payment</div>
                <div className="text-3xl font-extrabold">{fmtCurrency.format((results?.totalMin || 0) + (Number(extraPayment) || 0))}</div>
                <div className="text-[0.85rem] text-white/90 mt-2">Minimums + Snowball</div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 pt-8 border-t-2 border-dashed border-slate-200">
               <div className="bg-white/50 rounded-xl p-6 text-center border border-white/80">
                  <div className="text-[1.1rem] font-bold text-slate-800 mb-4">Minimum Payments Only</div>
                  <div className={results?.baselineRes?.error ? "text-[1.5rem] font-bold text-red-500 mb-2" : "text-[2.2rem] font-extrabold text-[#8B5CF6] mb-2"}>
                     {results?.baselineRes?.error ? "Never" : addMonthsToDate(results?.baselineRes?.months || 0)}
                  </div>
                  <div className="text-[0.85rem] text-slate-500">Debt-free date</div>
                  <div className="mt-5">
                     <div className="text-[0.9rem] text-slate-500 font-semibold uppercase tracking-wide mb-2">Total Interest Paid</div>
                     <div className="text-[1rem] font-semibold text-red-500">
                        {results?.baselineRes?.error ? "Infinite (Min pays < Interest)" : fmtCurrency.format(results?.baselineRes?.totalInterest || 0)}
                     </div>
                  </div>
               </div>

               <div className="bg-[#f5f3ff] rounded-xl p-6 text-center border-2 border-[#8B5CF6] relative overflow-hidden">
                  <div className="absolute top-3 -right-8 bg-[#8B5CF6] text-white text-[0.7rem] font-bold px-8 py-1 rotate-45 uppercase tracking-wide">
                     Recommended
                  </div>
                  <div className="text-[1.1rem] font-bold text-slate-800 mb-4">Debt Snowball Method</div>
                  <div className="text-[2.2rem] font-extrabold text-[#8B5CF6] mb-2">
                     {results?.snowballRes?.error ? "Never" : addMonthsToDate(results?.snowballRes?.months || 0)}
                  </div>
                  <div className="text-[0.85rem] text-slate-500">Accelerated debt-free date</div>
                  <div className="mt-5">
                     <div className="text-[0.9rem] text-slate-500 font-semibold uppercase tracking-wide mb-2">Total Interest Paid</div>
                     <div className="text-[1rem] font-semibold text-emerald-500">
                        {results?.snowballRes?.error ? "Adjust Payments" : fmtCurrency.format(results?.snowballRes?.totalInterest || 0)}
                     </div>
                  </div>
                  {results?.savings?.interestSaved > 0 && (
                     <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-[0.95rem] mt-4 shadow-sm">
                        Save {fmtCurrency.format(results?.savings?.interestSaved)} in interest!
                     </div>
                  )}
                  {results?.savings?.monthsSaved > 0 && (
                     <div className="text-[#7C3AED] font-semibold text-[0.9rem] mt-3">
                        Debt-free {results?.savings?.timeStr} sooner
                     </div>
                  )}
               </div>
            </div>

            {/* Custom Chart matching exactly the dual-line aesthetic */}
            {results?.chartData && results.chartData.length > 0 && (
              <div className="h-[400px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Balance']} />
                    <Legend />
                    <Line type="monotone" dataKey="snowball" name="Snowball Payoff" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="baseline" name="Minimum Payments" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Integration Card */}
        <Card className="rounded-2xl border-[1px] border-white/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md">
           <CardContent className="p-[30px]">
              <div className="flex items-center gap-3 mb-[15px]">
                 <div className="text-[24px]">🎯</div>
                 <h2 className="text-[1.5rem] font-bold text-slate-800 m-0">AI Debt Strategy Planner</h2>
              </div>
              <p className="text-slate-500 text-[0.95rem] mb-5 leading-relaxed">
                 Ask our AI assistant for personalized advice on optimizing your extra payments or exploring
                 alternative strategies like the Debt Avalanche method based on your current inputs.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                 <Input 
                   value={aiQuery}
                   onChange={(e) => setAiQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && callAIAssistant(aiQuery, { debts, extraPayment: extraPayment, totalDebtAmount: results?.totalDebt, currentProjectedPayoffDate: addMonthsToDate(results?.snowballRes?.months || 0) }, setAiLoading, setAiMessage)}
                   placeholder="e.g., Should I use the Avalanche method instead? How can I free up more cash?"
                   className="flex-grow"
                 />
                 <Button onClick={() => callAIAssistant(aiQuery, { debts, extraPayment: extraPayment, totalDebtAmount: results?.totalDebt, currentProjectedPayoffDate: addMonthsToDate(results?.snowballRes?.months || 0) }, setAiLoading, setAiMessage)} className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                    Ask AI
                 </Button>
              </div>
              {aiLoading && (
                 <div className="text-slate-500 italic mt-4">🤔 AI is analyzing your debt profile...</div>
              )}
              {aiMessage && !aiLoading && (
                 <div className="bg-white/50 rounded-lg p-[20px] border-l-[4px] border-[#8B5CF6] border-y border-r border-white/80 mt-4 text-[0.95rem] leading-[1.6]" dangerouslySetInnerHTML={{ __html: aiMessage }} />
              )}
           </CardContent>
        </Card>

      </div>
    </div>
  );
}

