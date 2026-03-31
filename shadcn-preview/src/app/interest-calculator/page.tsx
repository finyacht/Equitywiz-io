"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

export default function InterestCalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState<number>(1000);
  
  const [hasDeposits, setHasDeposits] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositFrequency, setDepositFrequency] = useState<string>("monthly");
  
  const [isCompound, setIsCompound] = useState<boolean>(true);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [compoundFrequency, setCompoundFrequency] = useState<string>("yearly");
  
  const [timeUnit, setTimeUnit] = useState<"years" | "months" | "days">("years");
  const [timeValue, setTimeValue] = useState<number>(10);

  // Results State
  const [chartData, setChartData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    finalBalance: 0,
    totalInterest: 0,
    totalDeposits: 0
  });

  const formatCurrency = (val: number, showCents = true) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    }).format(val || 0);
  };

  useEffect(() => {
    const rate = Number(interestRate) / 100;
    let years = Number(timeValue);
    
    if (timeUnit === 'months') years = years / 12;
    else if (timeUnit === 'days') years = years / 365;

    const initial = Number(initialInvestment);
    const depositAmt = hasDeposits ? Number(depositAmount) : 0;
    
    let compoundsPerYear = 1;
    if (isCompound) {
        switch (compoundFrequency) {
            case 'daily': compoundsPerYear = 365; break;
            case 'monthly': compoundsPerYear = 12; break;
            case 'quarterly': compoundsPerYear = 4; break;
            case 'yearly': compoundsPerYear = 1; break;
        }
    }
    
    let depositsPerYear = 0;
    if (hasDeposits) {
        switch (depositFrequency) {
            case 'monthly': depositsPerYear = 12; break;
            case 'quarterly': depositsPerYear = 4; break;
            case 'yearly': depositsPerYear = 1; break;
        }
    }
    
    const wholeYears = Math.floor(years);
    const fraction = years - wholeYears;
    const periods = wholeYears + (fraction > 0 ? 1 : 0);
    
    const results = [];
    let balance = initial;
    let totalDeposits = 0;
    let totalInterest = 0;

    for (let year = 1; year <= periods; year++) {
        const isPartialYear = (year === periods && fraction > 0);
        const yearFraction = isPartialYear ? fraction : 1;
        
        const startBalance = balance;
        let yearlyDeposit = 0;
        let yearlyInterest = 0;
        
        if (isCompound) {
            if (hasDeposits) {
                const actualDepositsThisYear = isPartialYear 
                    ? Math.ceil(depositsPerYear * yearFraction)
                    : depositsPerYear;
                
                for (let i = 0; i < actualDepositsThisYear; i++) {
                    balance += depositAmt;
                    yearlyDeposit += depositAmt;
                    
                    const periodsAfterDeposit = isPartialYear && i === actualDepositsThisYear - 1
                        ? (compoundsPerYear / depositsPerYear) * (yearFraction - i/depositsPerYear)
                        : compoundsPerYear / depositsPerYear;
                        
                    for (let j = 0; j < periodsAfterDeposit; j++) {
                        const periodInterest = balance * (rate / compoundsPerYear);
                        balance += periodInterest;
                        yearlyInterest += periodInterest;
                    }
                }
            } else {
                const actualCompoundsThisYear = isPartialYear 
                    ? Math.ceil(compoundsPerYear * yearFraction) 
                    : compoundsPerYear;
                    
                for (let i = 0; i < actualCompoundsThisYear; i++) {
                    const periodInterest = balance * (rate / compoundsPerYear);
                    balance += periodInterest;
                    yearlyInterest += periodInterest;
                }
            }
        } else {
            yearlyInterest = startBalance * rate * yearFraction;
            balance += yearlyInterest;
            
            if (hasDeposits) {
                const actualDepositsThisYear = isPartialYear 
                    ? Math.ceil(depositsPerYear * yearFraction)
                    : depositsPerYear;
                    
                yearlyDeposit = depositAmt * actualDepositsThisYear;
                balance += yearlyDeposit;
            }
        }
        
        totalDeposits += yearlyDeposit;
        totalInterest += yearlyInterest;
        
        results.push({
            year,
            label: isPartialYear ? `Year ${Math.floor(year - 1) + 1}*` : `Year ${year}`,
            startBalance,
            yearlyDeposit,
            yearlyInterest,
            endBalance: balance,
            cumulativeInterest: totalInterest,
            cumulativeDeposits: totalDeposits,
            isPartialYear
        });
    }
    
    setTableData(results);
    setChartData(results.map(d => ({
        name: d.label,
        InitialInvestment: initial,
        Deposits: d.cumulativeDeposits,
        Interest: d.cumulativeInterest,
        Total: d.endBalance
    })));
    setSummary({
      finalBalance: balance,
      totalInterest: totalInterest,
      totalDeposits: totalDeposits
    });

  }, [initialInvestment, hasDeposits, depositAmount, depositFrequency, isCompound, interestRate, compoundFrequency, timeUnit, timeValue]);

  return (
    <div className="max-w-[1200px] mx-auto w-full px-5 py-6 space-y-6 text-slate-800 font-sans min-h-screen bg-[#f9f9f9]">
      
      {/* Navigation */}
      <div className="flex items-center bg-[#0ea5e9] text-white px-5 py-3 rounded-lg shadow-md border-none text-[0.95rem] font-medium w-full">
         <Link href="/" className="flex items-center text-white hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px] mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
         </Link>
         <span className="mx-auto font-bold tracking-wide uppercase">Interest Rate Calculator</span>
      </div>

      {/* Header Container */}
      <div className="bg-slate-100 rounded-lg p-6 flex flex-col items-start w-full">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
               <div className="absolute w-[20px] h-[20px] bg-white opacity-90 top-2 left-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%)" }}></div>
               <div className="absolute w-[10px] h-[10px] bg-white opacity-70 bottom-2 right-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 80% 100%, 80% 80%, 0 80%)" }}></div>
           </div>
           <div>
               <h1 className="text-2xl font-bold text-slate-900 m-0">Interest Rate Calculator</h1>
               <p className="text-sm text-slate-600 mb-1">Simple & Compound Interest Modeler</p>
               <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                   by Amal Ganatra 
                   <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="text-[#0ea5e9] hover:text-[#0284c7]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                   </a>
               </span>
           </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
           Calculate how your investments grow over time with this interactive interest calculator. Compare simple and compound interest with various compounding frequencies, and visualize the impact of regular deposits on your investment growth.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Settings */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-6 border border-slate-100 flex flex-col gap-6">
            
            {/* Investment Details */}
            <div>
               <h3 className="text-[1.05rem] font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-12 after:bg-gradient-to-r after:from-[#0ea5e9] after:to-[#f97316]">
                  Investment Details
               </h3>
               <div className="space-y-4">
                  <div>
                     <Label className="text-slate-600 mb-2 block font-medium">Initial Investment ($)</Label>
                     <Input type="number" min="0" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="bg-white border-slate-300 focus-visible:ring-[#0ea5e9]" />
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={hasDeposits} onChange={(e) => setHasDeposits(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0ea5e9] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                     </label>
                     <span className="text-sm font-medium text-slate-700">Add Regular Deposits</span>
                  </div>

                  {hasDeposits && (
                     <div className="pt-2 space-y-4 animate-in fade-in zoom-in-95">
                        <div>
                           <Label className="text-slate-600 mb-2 block font-medium">Deposit Amount ($)</Label>
                           <Input type="number" min="0" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} className="bg-white border-slate-300 focus-visible:ring-[#0ea5e9]" />
                        </div>
                        <div>
                           <Label className="text-slate-600 mb-2 block font-medium">Deposit Frequency</Label>
                           <select 
                               className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                               value={depositFrequency} 
                               onChange={(e) => setDepositFrequency(e.target.value)}
                           >
                               <option value="monthly">Monthly</option>
                               <option value="quarterly">Quarterly</option>
                               <option value="yearly">Yearly</option>
                           </select>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Interest Details */}
            <div>
               <h3 className="text-[1.05rem] font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 mt-2 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-12 after:bg-gradient-to-r after:from-[#0ea5e9] after:to-[#f97316]">
                  Interest Details
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isCompound} onChange={(e) => setIsCompound(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0ea5e9] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                     </label>
                     <span className="text-sm font-medium text-slate-700">Compound Interest</span>
                  </div>
                  
                  <div>
                     <Label className="text-slate-600 mb-2 block font-medium">Annual Interest Rate (%)</Label>
                     <div className="space-y-4 pt-1">
                        <Input type="number" min="0" max="30" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="bg-white border-slate-300 focus-visible:ring-[#0ea5e9] w-full" />
                        <div className="relative pt-2 pb-6">
                            <input type="range" className="w-full accent-[#f97316] outline-none" min="0" max="30" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-[#0ea5e9] to-[#f97316] text-white px-2 py-0.5 rounded text-xs font-bold shadow-md">
                                {interestRate}%
                            </div>
                        </div>
                     </div>
                  </div>

                  {isCompound && (
                     <div className="animate-in fade-in zoom-in-95">
                        <Label className="text-slate-600 mb-2 block font-medium">Compounding Frequency</Label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                            value={compoundFrequency} 
                            onChange={(e) => setCompoundFrequency(e.target.value)}
                        >
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                     </div>
                  )}
               </div>
            </div>

            {/* Time Period Settings */}
            <div>
               <h3 className="text-[1.05rem] font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 mt-2 relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-12 after:bg-gradient-to-r after:from-[#0ea5e9] after:to-[#f97316]">
                  Time Period
               </h3>
               <div className="space-y-4">
                  <div className="bg-slate-100 p-1 rounded-lg flex items-center justify-between shadow-inner max-w-[250px]">
                     <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${timeUnit === 'years' ? 'bg-white shadow text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-800'}`} onClick={() => setTimeUnit('years')}>Years</button>
                     <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${timeUnit === 'months' ? 'bg-white shadow text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-800'}`} onClick={() => setTimeUnit('months')}>Months</button>
                     <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${timeUnit === 'days' ? 'bg-white shadow text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-800'}`} onClick={() => setTimeUnit('days')}>Days</button>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                      <Input type="number" min="1" max={timeUnit === 'days' ? 3650 : (timeUnit === 'months' ? 120 : 50)} value={timeValue} onChange={(e) => setTimeValue(Number(e.target.value))} className="bg-white border-slate-300 focus-visible:ring-[#0ea5e9] w-full" />
                      <div className="relative pt-2 pb-6">
                            <input type="range" className="w-full accent-[#f97316]" min="1" max={timeUnit === 'days' ? 3650 : (timeUnit === 'months' ? 120 : 50)} step={timeUnit === 'days' ? 5 : 1} value={timeValue} onChange={(e) => setTimeValue(Number(e.target.value))} />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-[#0ea5e9] to-[#f97316] text-white px-2 py-0.5 rounded text-xs font-bold shadow-md whitespace-nowrap">
                                {timeValue} {timeUnit}
                            </div>
                      </div>
                  </div>
               </div>
            </div>

        </div>

        {/* Results Graph & Table */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: '#f1f5f9' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="InitialInvestment" name="Initial Investment" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                            {hasDeposits && <Bar dataKey="Deposits" name="Deposits" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />}
                            <Bar dataKey="Interest" name="Interest" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-100 p-4 rounded-lg text-center">
                        <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Initial Investment</div>
                        <div className="text-xl font-bold text-slate-800">{formatCurrency(initialInvestment)}</div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg text-center">
                        <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Final Balance</div>
                        <div className="text-xl font-bold text-[#0ea5e9]">{formatCurrency(summary.finalBalance)}</div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg text-center">
                        <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Total Interest</div>
                        <div className="text-xl font-bold text-emerald-600">{formatCurrency(summary.totalInterest)}</div>
                    </div>
                    {hasDeposits && (
                        <div className="bg-slate-100 p-4 rounded-lg text-center">
                            <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Total Deposits</div>
                            <div className="text-xl font-bold text-pink-600">{formatCurrency(summary.totalDeposits)}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Yearly Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b-2 border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Year</th>
                                <th className="px-4 py-3">Starting Balance</th>
                                {hasDeposits && <th className="px-4 py-3">Deposits</th>}
                                <th className="px-4 py-3">Interest</th>
                                <th className="px-4 py-3 text-right">Ending Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tableData.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-600 font-medium">{row.label}</td>
                                    <td className="px-4 py-3 text-slate-800">{formatCurrency(row.startBalance)}</td>
                                    {hasDeposits && <td className="px-4 py-3 text-pink-600">{formatCurrency(row.yearlyDeposit)}</td>}
                                    <td className="px-4 py-3 text-emerald-600">+{formatCurrency(row.yearlyInterest)}</td>
                                    <td className="px-4 py-3 text-slate-800 font-bold text-right">{formatCurrency(row.endBalance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {tableData.some(row => row.isPartialYear) && (
                    <div className="mt-3 text-xs text-slate-400 italic font-medium px-2">
                        * Partial year calculation
                    </div>
                )}
            </div>
            
            <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-[#0ea5e9] text-sm text-slate-600 leading-relaxed shadow-sm">
                <strong>Disclaimer:</strong> The Interest Rate Calculator is provided for educational and illustrative purposes only. It does not constitute financial advice. Interest rates, inflation, and other economic factors can vary over time. Please consult a qualified financial advisor before making investment decisions.
            </div>
        </div>
      </div>
    </div>
  );
}
