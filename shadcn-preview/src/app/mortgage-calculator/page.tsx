"use client";

import React, { useState, useMemo, useEffect, useRef, useDeferredValue } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Home, Settings, Search, Info, Plus, ArrowRight, Bot, Send } from "lucide-react";

type ExtraPayment = {
  month: number;
  amount: number;
};

type ChatMessage = {
  role: "user" | "bot";
  content: string;
};

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState(16400000);
  const [downPayment, setDownPayment] = useState(11400000);
  const [interestRate, setInterestRate] = useState(7.75);
  const [loanTermYears, setLoanTermYears] = useState(30);

  const [extraPayments, setExtraPayments] = useState<ExtraPayment[]>([]);
  const [extraMonthInput, setExtraMonthInput] = useState(1);
  const [extraAmountInput, setExtraAmountInput] = useState(10000);

  const [currency, setCurrency] = useState("USD");
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "bot", content: "Hi! I'm your AI housing market expert. I verify your calculated numbers and give advice. Ask me anything! 🏠" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [scheduleVisibility, setScheduleVisibility] = useState<number>(0); 

  // Prevent keystroke lag by deferring math-heavy updates
  const deferredHomePrice = useDeferredValue(homePrice);
  const deferredDownPayment = useDeferredValue(downPayment);
  const deferredInterestRate = useDeferredValue(interestRate);
  const deferredLoanTermYears = useDeferredValue(loanTermYears);
  const deferredExtraPayments = useDeferredValue(extraPayments);

  // Amortization Engine
  const metrics = useMemo(() => {
    const loanAmount = Math.max(0, deferredHomePrice - deferredDownPayment);
    const monthlyRate = (deferredInterestRate / 100) / 12;
    const totalMonths = deferredLoanTermYears * 12;

    let baseMonthlyPayment = 0;
    if (monthlyRate > 0) {
      baseMonthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      baseMonthlyPayment = loanAmount / totalMonths;
    }

    let balance = loanAmount;
    let totalInterest = 0;
    let currentMonthDate = new Date();
    
    // Sort extra payments
    const extraMap = new Map();
    deferredExtraPayments.forEach(ep => {
      extraMap.set(ep.month, (extraMap.get(ep.month) || 0) + ep.amount);
    });

    const schedule = [];
    let monthIdx = 1;
    let actualMonthsTaken = 0;

    while (balance > 0.01 && monthIdx <= totalMonths * 2) { // safety limit
      const interestPayment = balance * monthlyRate;
      let principalPayment = baseMonthlyPayment - interestPayment;
      
      const extraPay = extraMap.get(monthIdx) || 0;
      let totalPayment = baseMonthlyPayment + extraPay;

      if (balance + interestPayment < totalPayment) {
        totalPayment = balance + interestPayment;
        principalPayment = balance;
      } else {
         principalPayment += extraPay;
      }

      totalInterest += interestPayment;
      balance -= principalPayment;
      actualMonthsTaken++;

      const dateStr = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + monthIdx, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      schedule.push({
        month: monthIdx,
        date: dateStr,
        payment: totalPayment,
        principal: principalPayment,
        interest: interestPayment,
        extraPayment: extraPay,
        remainingBalance: Math.max(0, balance),
        totalInterestToDate: totalInterest
      });

      monthIdx++;
    }

    // Chart Data Reduction for performance
    const chartData = [];
    const step = Math.max(1, Math.floor(actualMonthsTaken / 50));
    for (let i = 0; i < schedule.length; i += step) {
       chartData.push({
         name: schedule[i].date,
         Balance: schedule[i].remainingBalance,
         'Cumulative Interest': schedule[i].totalInterestToDate
       });
    }

    const payoffDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + actualMonthsTaken, 1);

    return {
      loanAmount,
      monthlyPayment: baseMonthlyPayment,
      totalInterest,
      totalCost: loanAmount + totalInterest,
      actualMonthsTaken,
      payoffDate: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      schedule,
      chartData
    };
  }, [deferredHomePrice, deferredDownPayment, deferredInterestRate, deferredLoanTermYears, deferredExtraPayments]);

  const addExtraPayment = () => {
    if (extraAmountInput > 0 && extraMonthInput > 0) {
      setExtraPayments([...extraPayments, { month: extraMonthInput, amount: extraAmountInput }]);
      setExtraMonthInput(1);
    }
  };

  const removeExtraPayment = (index: number) => {
    const newExtras = [...extraPayments];
    newExtras.splice(index, 1);
    setExtraPayments(newExtras);
  };

  const executeAiQuery = async (query: string) => {
    if (!query.trim() || isAiLoading) return;
    
    const newUserMsg: ChatMessage = { role: "user", content: query };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const payload = {
        message: `CONTEXT: User is analyzing a $${metrics.loanAmount.toLocaleString()} loan at ${interestRate}% over ${loanTermYears} years. Monthly payment: $${metrics.monthlyPayment.toFixed(2)}.\n\nUSER QUESTION: ${query}`,
        history: chatHistory.map(h => ({ role: h.role === "bot" ? "assistant" : "user", content: h.content }))
      };
      
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.response) {
        setChatHistory(prev => [...prev, { role: "bot", content: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: "bot", content: "I'm currently unable to connect to the market analysis algorithms. Please try again." }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "bot", content: "Network error. Please check your connection." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const currencyMap: Record<string, string> = { "USD": "$", "EUR": "€", "GBP": "£", "INR": "₹" };
  const sym = currencyMap[currency] || "$";
  const formatCur = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-600">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-md flex items-center justify-center shrink-0">
               <Home className="text-white w-7 h-7" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Mortgage AI Advisor</h1>
              <p className="text-slate-500 text-sm max-w-lg">Calculate your monthly mortgage payments with precision. Input your home price, down payment, interest rate, and loan term to see detailed breakdowns.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger className="w-[100px] bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
             </Select>
             <Button variant="outline" className="border-slate-200 text-slate-600">
                <Settings className="w-4 h-4 mr-2" /> Settings
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left Section (Inputs & Extras) - 4 cols */}
           <div className="lg:col-span-4 space-y-6">
              <Card className="shadow-sm border-slate-200 bg-white/90 backdrop-blur">
                 <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg">Loan Parameters</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                       <Label className="flex justify-between">Home Price <span className="text-slate-400 font-normal">{formatCur(homePrice)}</span></Label>
                       <Input type="range" min={1000000} max={50000000} step={100000} value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} className="accent-indigo-600" />
                       <div className="relative">
                         <span className="absolute left-3 top-2.5 text-slate-500">{sym}</span>
                         <Input type="number" value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} className="pl-8" />
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       <Label className="flex justify-between">Down Payment <span className="text-slate-400 font-normal">{formatCur(downPayment)}</span></Label>
                       <Input type="range" min={0} max={homePrice} step={50000} value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="accent-indigo-600" />
                       <div className="relative">
                         <span className="absolute left-3 top-2.5 text-slate-500">{sym}</span>
                         <Input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="pl-8" />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="flex justify-between">Interest Rate <span className="text-slate-400 font-normal">{interestRate}%</span></Label>
                       <Input type="range" min={1} max={15} step={0.125} value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className="accent-indigo-600" />
                       <div className="flex gap-2">
                         <Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
                         <span className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600">%</span>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Label className="flex justify-between">Loan Term</Label>
                       <Select value={loanTermYears.toString()} onValueChange={v => v && setLoanTermYears(Number(v))}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 Years</SelectItem>
                            <SelectItem value="20">20 Years</SelectItem>
                            <SelectItem value="30">30 Years</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                 <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">Extra Payments</CardTitle>
                      <CardDescription>Pay off your loan faster</CardDescription>
                    </div>
                 </CardHeader>
                 <CardContent className="pt-4 space-y-4">
                    <div className="flex gap-2">
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Month (1-{loanTermYears*12})</Label>
                          <Input type="number" min={1} value={extraMonthInput} onChange={e => setExtraMonthInput(Number(e.target.value))} />
                       </div>
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Amount</Label>
                          <Input type="number" min={1} value={extraAmountInput} onChange={e => setExtraAmountInput(Number(e.target.value))} />
                       </div>
                       <div className="flex items-end">
                         <Button onClick={addExtraPayment} className="bg-indigo-600 hover:bg-indigo-700 w-10 px-0"><Plus className="w-4 h-4" /></Button>
                       </div>
                    </div>
                    {extraPayments.length > 0 && (
                      <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2 border-t pt-2">
                        {extraPayments.map((ep, i) => (
                           <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm border border-slate-100">
                             <span className="font-medium text-slate-700">Month {ep.month}</span>
                             <span className="text-emerald-600 font-bold">+{formatCur(ep.amount)}</span>
                             <button onClick={() => removeExtraPayment(i)} className="text-slate-400 hover:text-red-500 font-bold">&times;</button>
                           </div>
                        ))}
                      </div>
                    )}
                 </CardContent>
              </Card>
           </div>

           {/* Central & Right Section (Results, Chart, Chat, Schedule) - 8 cols */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-5 text-center md:text-left">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Monthly Payment</p>
                     <p className="text-2xl font-black text-indigo-600">{formatCur(metrics.monthlyPayment)}</p>
                   </CardContent>
                 </Card>
                 <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-5 text-center md:text-left">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Principal</p>
                     <p className="text-xl font-bold text-slate-800">{formatCur(metrics.loanAmount)}</p>
                   </CardContent>
                 </Card>
                 <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-5 text-center md:text-left">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Interest</p>
                     <p className="text-xl font-bold text-slate-800">{formatCur(metrics.totalInterest)}</p>
                   </CardContent>
                 </Card>
                 <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-5 text-center md:text-left">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Payoff Date</p>
                     <p className="text-lg font-bold text-emerald-600">{metrics.payoffDate}</p>
                   </CardContent>
                 </Card>
              </div>

              {/* Chart & AI Chat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* Recharts Area */}
                 <Card className="shadow-sm border-slate-200 border-t-4 border-t-indigo-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Amortization Trajectory</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="h-[320px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={metrics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={30} />
                             <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                             <RechartsTooltip formatter={(val: number) => formatCur(val)} contentStyle={{ borderRadius: '12px' }} />
                             <Legend wrapperStyle={{ paddingTop: "10px", fontSize: '12px' }} />
                             <Area type="monotone" dataKey="Balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
                             <Area type="monotone" dataKey="Cumulative Interest" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorInt)" />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                    </CardContent>
                 </Card>

                 {/* AI Chat Interface */}
                 <Card className="shadow-sm border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 flex flex-col h-[410px]">
                    <CardHeader className="pb-2 border-b border-amber-200/60 flex flex-row items-center gap-3 space-y-0">
                       <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Bot size={20} /></div>
                       <div>
                         <CardTitle className="text-amber-900 text-base">AI Mortgage Advisor</CardTitle>
                         <CardDescription className="text-amber-700/70 text-xs">Powered by AI Analytics</CardDescription>
                       </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
                       <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-thin scrollbar-thumb-amber-200">
                          {chatHistory.map((msg, idx) => (
                             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-amber-100 rounded-bl-none'}`}>
                                 {msg.content}
                               </div>
                             </div>
                          ))}
                          {isAiLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 border border-amber-100 text-slate-400 text-sm shadow-sm flex items-center gap-1">
                                <span className="animate-bounce">•</span><span className="animate-bounce delay-100">•</span><span className="animate-bounce delay-200">•</span>
                              </div>
                            </div>
                          )}
                          <div ref={chatBottomRef} />
                       </div>
                       
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                         <button onClick={() => executeAiQuery("Is this rate good?")} className="shrink-0 text-xs bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">Is this rate good?</button>
                         <button onClick={() => executeAiQuery("How to lower payment?")} className="shrink-0 text-xs bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">Lower payment?</button>
                         <button onClick={() => executeAiQuery("15yr vs 30yr?")} className="shrink-0 text-xs bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">15yr vs 30yr?</button>
                       </div>

                       <div className="relative mt-2">
                         <Input 
                           value={chatInput} 
                           onChange={e => setChatInput(e.target.value)}
                           onKeyPress={e => e.key === 'Enter' && executeAiQuery(chatInput)}
                           placeholder="Ask about your mortgage..." 
                           className="pr-10 bg-white border-amber-200 focus-visible:ring-amber-500 rounded-xl shadow-sm"
                         />
                         <button 
                           onClick={() => executeAiQuery(chatInput)}
                           className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                         >
                           <Send className="w-4 h-4" />
                         </button>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              {/* Schedule Table */}
              <Card className="shadow-sm border-slate-200 bg-white">
                 <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Amortization Schedule</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-500">Show first:</Label>
                      <Select value={scheduleVisibility.toString()} onValueChange={v => v && setScheduleVisibility(Number(v))}>
                         <SelectTrigger className="h-8 text-xs w-[110px]"><SelectValue/></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="12">12 Months</SelectItem>
                           <SelectItem value="24">24 Months</SelectItem>
                           <SelectItem value="60">5 Years</SelectItem>
                           <SelectItem value="0">All Months</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold text-right">Payment</th>
                            <th className="px-4 py-3 font-semibold text-right">Principal</th>
                            <th className="px-4 py-3 font-semibold text-right">Interest</th>
                            <th className="px-4 py-3 font-semibold text-right">Extra</th>
                            <th className="px-4 py-3 font-semibold text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {metrics.schedule.slice(0, scheduleVisibility === 0 ? undefined : scheduleVisibility).map((row, i) => (
                             <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-4 py-2.5 font-medium text-slate-700">{row.date}</td>
                               <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{formatCur(row.payment)}</td>
                               <td className="px-4 py-2.5 text-right text-slate-600">{formatCur(row.principal)}</td>
                               <td className="px-4 py-2.5 text-right text-rose-500">{formatCur(row.interest)}</td>
                               <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{row.extraPayment > 0 ? "+" + formatCur(row.extraPayment) : "—"}</td>
                               <td className="px-4 py-2.5 text-right font-medium text-indigo-600">{formatCur(row.remainingBalance)}</td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                 </CardContent>
              </Card>

           </div>
        </div>
      </div>
    </div>
  );
}
