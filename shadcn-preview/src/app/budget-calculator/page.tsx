"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { ArrowRight } from "lucide-react";

export default function BudgetCalculatorPage() {
  // Budget Inputs
  const [netSalary, setNetSalary] = useState<number>(5000);
  const [budgetRule, setBudgetRule] = useState<"50-30-20" | "60-20-20" | "custom">("50-30-20");
  const [needs, setNeeds] = useState<number>(2500);
  const [wants, setWants] = useState<number>(1500);
  const [savings, setSavings] = useState<number>(1000);

  // Investment Inputs
  const [stocksPercentage, setStocksPercentage] = useState<number>(40);
  const [bankPercentage, setBankPercentage] = useState<number>(60);
  
  const [stocksReturn, setStocksReturn] = useState<number>(15);
  const [stocksGrowthPattern, setStocksGrowthPattern] = useState<string>("reinvest");
  const [stocksCompounding, setStocksCompounding] = useState<string>("monthly");
  const [stocksRedeem, setStocksRedeem] = useState<string>("yearly");

  const [bankInterest, setBankInterest] = useState<number>(7);
  const [bankInterestType, setBankInterestType] = useState<string>("compound");
  const [bankCompounding, setBankCompounding] = useState<string>("monthly");
  const [bankRedeem, setBankRedeem] = useState<string>("yearly");

  // Projection Inputs
  const [projectionYears, setProjectionYears] = useState<number>(3);
  const [currentView, setCurrentView] = useState<"monthly" | "yearly" | "projection">("monthly");

  // Output State
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [totalGrowth, setTotalGrowth] = useState<number>(0);
  const [stocksGrowthAmount, setStocksGrowthAmount] = useState<number>(0);
  const [bankGrowthAmount, setBankGrowthAmount] = useState<number>(0);
  const [endBalance, setEndBalance] = useState<number>(0);

  const formatCurrency = (amount: number, showCents = false) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    }).format(amount || 0);
  };

  // Handle Budget Rule Changes
  useEffect(() => {
     if (budgetRule === "50-30-20") {
         setNeeds(Math.round(netSalary * 0.5));
         setWants(Math.round(netSalary * 0.3));
         setSavings(Math.round(netSalary * 0.2));
     } else if (budgetRule === "60-20-20") {
         setNeeds(Math.round(netSalary * 0.6));
         setWants(Math.round(netSalary * 0.2));
         setSavings(Math.round(netSalary * 0.2));
     }
  }, [budgetRule, netSalary]);

  // Handle Stock/Bank Sliders link
  const handleStocksChange = (val: number) => {
      setStocksPercentage(val);
      setBankPercentage(100 - val);
  };
  const handleBankChange = (val: number) => {
      setBankPercentage(val);
      setStocksPercentage(100 - val);
  };

  // Complex Calculation Logic
  useEffect(() => {
    const monthlySavings = Number(savings) || 0;
    const stocksPerc = Number(stocksPercentage) || 0;
    const stocksRt = Number(stocksReturn) || 0;
    const bankPerc = Number(bankPercentage) || 0;
    const bankInt = Number(bankInterest) || 0;
    const years = Number(projectionYears) || 3;

    const stocksMonthly = monthlySavings * (stocksPerc / 100);
    const bankMonthly = monthlySavings * (bankPerc / 100);

    let balance = 0;
    let stocksBalance = 0;
    let bankBalance = 0;
    let data = [];

    let stocksCompoundFactor = 0;
    let bankCompoundFactor = 0;

    // Stock Rates
    if (stocksGrowthPattern === 'reinvest' || stocksGrowthPattern === 'monthly' || stocksGrowthPattern === 'maturity') {
        stocksCompoundFactor = Math.pow(1 + (stocksRt/100), 1/12) - 1;
    } else {
        stocksCompoundFactor = stocksRt/100;
    }

    // Bank Rates
    if (bankInterestType === 'simple') {
        bankCompoundFactor = bankInt / 100 / 12;
    } else {
        if (bankCompounding === 'monthly') {
            bankCompoundFactor = Math.pow(1 + (bankInt/100), 1/12) - 1;
        } else if (bankCompounding === 'quarterly') {
            bankCompoundFactor = Math.pow(1 + (bankInt/100), 1/4) - 1;
        } else {
            bankCompoundFactor = bankInt / 100;
        }
    }

    let stocksMaturityBalance = 0;
    let bankMaturityBalance = 0;
    let bankAccumulatedGrowth = 0;

    for (let year = 1; year <= years; year++) {
        const startingBalance = balance;
        const yearStartStocksBalance = stocksBalance;
        const yearStartBankBalance = bankBalance;
        
        let yearlyStocksGrowth = 0;
        let yearlyBankGrowth = 0;
        let bankSimpleInterestForYear = 0;

        for (let month = 1; month <= 12; month++) {
            // STOCKS
            if (stocksPerc > 0) {
                stocksBalance += stocksMonthly;
                if (stocksGrowthPattern === 'maturity') stocksMaturityBalance += stocksMonthly;

                if (stocksGrowthPattern === 'reinvest') {
                    let monthlyGrowth = stocksBalance * stocksCompoundFactor;
                    stocksBalance += monthlyGrowth;
                    yearlyStocksGrowth += monthlyGrowth;
                } else if (stocksGrowthPattern === 'monthly') {
                    let monthlyGrowth = stocksBalance * stocksCompoundFactor;
                    yearlyStocksGrowth += monthlyGrowth;
                } else if (stocksGrowthPattern === 'yearly' && month === 12) {
                    let yearlyGrowth = stocksBalance * stocksCompoundFactor;
                    yearlyStocksGrowth = yearlyGrowth;
                } else if (stocksGrowthPattern === 'maturity') {
                    stocksMaturityBalance *= (1 + stocksCompoundFactor);
                    if (year === years && month === 12) {
                        yearlyStocksGrowth = stocksMaturityBalance - (stocksMonthly * 12 * year);
                    }
                }
            } else {
                stocksBalance += stocksMonthly;
                if (stocksGrowthPattern === 'maturity') stocksMaturityBalance += stocksMonthly;
            }

            // BANK
            if (bankPerc > 0) {
                bankBalance += bankMonthly;
                if (bankRedeem === 'maturity') bankMaturityBalance += bankMonthly;

                if (bankInterestType === 'simple') {
                    const monthsRemaining = 13 - month;
                    const thisMonthInterest = bankMonthly * (bankInt / 100) * (monthsRemaining / 12);
                    bankSimpleInterestForYear += thisMonthInterest;

                    if (bankRedeem === 'monthly') {
                        const monthlySimpleInterest = bankBalance * (bankInt / 100) / 12;
                        yearlyBankGrowth += monthlySimpleInterest;
                        bankAccumulatedGrowth += monthlySimpleInterest;
                        if (month === 12) {
                            bankBalance += bankAccumulatedGrowth;
                            bankAccumulatedGrowth = 0;
                        }
                    } else if (bankRedeem === 'yearly' && month === 12) {
                        bankBalance += bankSimpleInterestForYear;
                        yearlyBankGrowth += bankSimpleInterestForYear;
                    } else if (bankRedeem === 'maturity') {
                        if (month === 12) {
                            bankAccumulatedGrowth += bankSimpleInterestForYear;
                            yearlyBankGrowth += bankSimpleInterestForYear;
                        }
                    }
                } else {
                    // COMPOUND
                    if (bankCompounding === 'monthly' || 
                       (bankCompounding === 'quarterly' && month % 3 === 0) ||
                       (bankCompounding === 'yearly' && month === 12)) {
                        
                        let monthlyInterest = bankBalance * bankCompoundFactor;
                        yearlyBankGrowth += monthlyInterest;

                        if (bankRedeem === 'maturity') {
                             if (bankCompounding === 'monthly') bankMaturityBalance *= (1 + bankCompoundFactor);
                             else if (bankCompounding === 'quarterly' && month % 3 === 0) bankMaturityBalance *= (1 + bankCompoundFactor);
                             else if (bankCompounding === 'yearly' && month === 12) bankMaturityBalance *= (1 + bankCompoundFactor);
                             
                             bankAccumulatedGrowth += monthlyInterest;
                        } else if (bankRedeem === 'monthly') {
                             bankAccumulatedGrowth += monthlyInterest;
                             if (month === 12) {
                                 bankBalance += bankAccumulatedGrowth;
                                 bankAccumulatedGrowth = 0;
                             }
                        } else if (bankRedeem === 'yearly' && month === 12) {
                             bankBalance += monthlyInterest + bankAccumulatedGrowth;
                             bankAccumulatedGrowth = 0;
                        } else {
                             bankAccumulatedGrowth += monthlyInterest;
                        }
                    }
                }
            } else {
                bankBalance += bankMonthly;
                if (bankRedeem === 'maturity') bankMaturityBalance += bankMonthly;
            }

            if (stocksGrowthPattern === 'maturity' && bankRedeem === 'maturity') {
                balance = stocksMaturityBalance + bankMaturityBalance;
            } else if (stocksGrowthPattern === 'maturity') {
                balance = stocksMaturityBalance + bankBalance;
            } else if (bankRedeem === 'maturity') {
                balance = stocksBalance + bankMaturityBalance;
            } else {
                balance = stocksBalance + bankBalance;
            }
        } // End month loop

        let sGrowth = 0;
        if (stocksGrowthPattern === 'maturity') {
            sGrowth = year === years ? (stocksMaturityBalance - (stocksMonthly * 12 * year)) : 0;
        } else if (stocksGrowthPattern === 'reinvest') {
            sGrowth = stocksBalance - yearStartStocksBalance - (stocksMonthly * 12);
        } else {
            sGrowth = yearlyStocksGrowth;
        }

        let bGrowth = 0;
        if (bankRedeem === 'maturity') {
            if (year === years) bankMaturityBalance += bankAccumulatedGrowth;
            bGrowth = bankMaturityBalance - (bankMonthly * 12 * year);
        } else if (bankInterestType === 'simple' && bankRedeem === 'yearly') {
            bGrowth = bankSimpleInterestForYear;
        } else {
            bGrowth = bankBalance - yearStartBankBalance - (bankMonthly * 12);
        }

        data.push({
            year,
            startingBalance,
            monthlySavings: monthlySavings * 12,
            growth: sGrowth + bGrowth,
            stocksGrowth: sGrowth,
            bankGrowth: bGrowth,
            endingBalance: balance
        });
    }

    setYearlyData(data);

    // Summary logic
    let multiplier = 1;
    if (currentView === 'yearly') multiplier = 12;
    if (currentView === 'projection') multiplier = 12 * years;

    const baseSavings = monthlySavings * multiplier;
    let tGrowth = 0;
    
    if (data.length > 0) {
        if (currentView === 'monthly') {
            tGrowth = data[0].growth / 12;
        } else if (currentView === 'yearly') {
            tGrowth = data[0].growth;
        } else {
            tGrowth = data[data.length - 1].endingBalance - baseSavings;
        }
    }
    
    // Growth breakdown approximation for summary
    let stkGrowth = 0;
    let bkGrowth = 0;
    const stocksWeighted = (stocksPerc * stocksRt) / 100;
    const bankWeighted = (bankPerc * bankInt) / 100;
    const totalWeighted = stocksWeighted + bankWeighted;

    if (totalWeighted > 0) {
        stkGrowth = tGrowth * (stocksWeighted / totalWeighted);
        bkGrowth = tGrowth * (bankWeighted / totalWeighted);
    } else {
        if (stocksPerc === 100) stkGrowth = tGrowth;
        if (bankPerc === 100) bkGrowth = tGrowth;
    }

    setTotalGrowth(tGrowth);
    setStocksGrowthAmount(stkGrowth);
    setBankGrowthAmount(bkGrowth);
    setEndBalance(baseSavings + tGrowth);

  }, [savings, stocksPercentage, bankPercentage, stocksReturn, bankInterest, stocksGrowthPattern, bankInterestType, bankCompounding, bankRedeem, stocksCompounding, stocksRedeem, projectionYears, currentView]);


  const needsPercentage = (needs / netSalary) * 100 || 0;
  const wantsPercentage = (wants / netSalary) * 100 || 0;
  const savingsPercentage = (savings / netSalary) * 100 || 0;
  const totalPercentage = needsPercentage + wantsPercentage + savingsPercentage;

  const budgetData = [
      { name: 'Needs', value: needs, fill: '#4F46E5' },
      { name: 'Wants', value: wants, fill: '#EC4899' },
      { name: 'Savings', value: savings, fill: '#10B981' }
  ];

  const investmentData = [
      { name: 'Stocks', value: savings * (stocksPercentage/100) * (currentView === 'monthly' ? 1 : currentView === 'yearly' ? 12 : 12 * projectionYears), fill: '#F59E0B' },
      { name: 'Savings Bank', value: savings * (bankPercentage/100) * (currentView === 'monthly' ? 1 : currentView === 'yearly' ? 12 : 12 * projectionYears), fill: '#3B82F6' }
  ];

  return (
    <div className="max-w-[1200px] mx-auto w-full px-5 py-6 space-y-6 text-slate-800 font-sans min-h-screen bg-[#f9f9f9]">
      
      {/* Navigation */}
      <div className="flex items-center bg-[#8B5CF6] text-white px-5 py-3 rounded-lg shadow-md border-none text-[0.95rem] font-medium w-full">
         <Link href="/" className="flex items-center text-white hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px] mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
         </Link>
         <span className="mx-auto font-bold tracking-wide uppercase">BUDGET & FINANCES MODELER</span>
      </div>

      {/* Header Container */}
      <div className="bg-slate-100 rounded-lg p-6 flex flex-col items-start w-full">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
               <div className="absolute w-[20px] h-[20px] bg-white opacity-90 top-2 left-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%)" }}></div>
               <div className="absolute w-[10px] h-[10px] bg-white opacity-70 bottom-2 right-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 80% 100%, 80% 80%, 0 80%)" }}></div>
           </div>
           <div>
               <h1 className="text-2xl font-bold text-slate-900 m-0">Budget & Finances Modeler</h1>
               <p className="text-sm text-slate-600 mb-1">Monthly Planning & Long-term Growth</p>
               <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                   by Amal Ganatra 
                   <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="text-[#8B5CF6] hover:text-[#7C3AED]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                   </a>
               </span>
           </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
           Plan your monthly budget using popular rules like 50/30/20, then allocate your savings between stocks and a savings bank. Visualize how your allocation strategy affects your long-term wealth growth over time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-4">
            
            {/* Step 1: Budget */}
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-[#8B5CF6] overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">1</div>
                    <h2 className="font-bold text-slate-800 m-0">Monthly Budget</h2>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <Label className="text-slate-700 font-medium mb-1 block">Monthly Net Salary ($)</Label>
                        <Input type="number" min="0" value={netSalary} onChange={(e) => setNetSalary(Number(e.target.value) || 0)} className="bg-white" />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setBudgetRule('50-30-20')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${budgetRule === '50-30-20' ? 'bg-[#8B5CF6] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>50-30-20</button>
                        <button onClick={() => setBudgetRule('60-20-20')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${budgetRule === '60-20-20' ? 'bg-[#8B5CF6] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>60-20-20</button>
                        <button onClick={() => setBudgetRule('custom')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${budgetRule === 'custom' ? 'bg-[#8B5CF6] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Custom</button>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex justify-between text-sm mb-1 font-medium">
                            <span>Total Allocation:</span>
                            <span className={totalPercentage > 100 ? "text-red-500" : "text-emerald-500"}>{totalPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className={`h-full ${totalPercentage > 100 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(totalPercentage, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-800">Needs</span>
                                <span className="text-sm font-medium text-slate-500">{needsPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-indigo-600 font-bold">$</span>
                                <Input type="number" value={needs} onChange={(e) => { setNeeds(Number(e.target.value)); setBudgetRule('custom'); }} className="h-9" />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-800">Wants</span>
                                <span className="text-sm font-medium text-slate-500">{wantsPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-pink-500 font-bold">$</span>
                                <Input type="number" value={wants} onChange={(e) => { setWants(Number(e.target.value)); setBudgetRule('custom'); }} className="h-9" />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-800">Savings</span>
                                <span className="text-sm font-medium text-slate-500">{savingsPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">$</span>
                                <Input type="number" value={savings} onChange={(e) => { setSavings(Number(e.target.value)); setBudgetRule('custom'); }} className="h-9 border-emerald-200 focus-visible:ring-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: Investment Strategy */}
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-[#8B5CF6] overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">2</div>
                    <h2 className="font-bold text-slate-800 m-0">Investment Strategy</h2>
                </div>
                <div className="p-4 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Label className="font-semibold text-amber-500">Stocks / Mutual Funds</Label>
                            <span className="font-bold text-amber-500">{stocksPercentage}%</span>
                        </div>
                        <input type="range" className="w-full accent-amber-500" min="0" max="100" value={stocksPercentage} onChange={(e) => handleStocksChange(Number(e.target.value))} />
                        <div className="text-sm font-medium text-slate-500 mt-1">Amount: {formatCurrency(savings * (stocksPercentage/100))}</div>
                        
                        <div className="mt-3 flex items-center justify-between gap-2">
                            <Label className="text-sm text-slate-600">Annual Return</Label>
                            <div className="flex items-center gap-1">
                                <Input type="number" value={stocksReturn} onChange={(e) => setStocksReturn(Number(e.target.value))} className="w-20 h-8 text-right pr-1" />
                                <span className="text-slate-500 font-medium">%</span>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <Label className="text-sm text-slate-600">Growth</Label>
                            <select className="h-8 rounded-md border border-slate-300 text-sm px-2 w-[120px]" value={stocksGrowthPattern} onChange={(e) => setStocksGrowthPattern(e.target.value)}>
                                <option value="reinvest">Reinvest</option>
                                <option value="monthly">Redeem Monthly</option>
                                <option value="yearly">Redeem Yearly</option>
                                <option value="maturity">At Maturity</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                        <div className="flex justify-between items-center mb-1">
                            <Label className="font-semibold text-blue-500">Savings Bank</Label>
                            <span className="font-bold text-blue-500">{bankPercentage}%</span>
                        </div>
                        <input type="range" className="w-full accent-blue-500" min="0" max="100" value={bankPercentage} onChange={(e) => handleBankChange(Number(e.target.value))} />
                        <div className="text-sm font-medium text-slate-500 mt-1">Amount: {formatCurrency(savings * (bankPercentage/100))}</div>
                        
                        <div className="mt-3 flex items-center justify-between gap-2">
                            <Label className="text-sm text-slate-600">Interest Rate</Label>
                            <div className="flex items-center gap-1">
                                <Input type="number" value={bankInterest} onChange={(e) => setBankInterest(Number(e.target.value))} className="w-20 h-8 text-right pr-1" />
                                <span className="text-slate-500 font-medium">%</span>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <Label className="text-sm text-slate-600">Type</Label>
                            <select className="h-8 rounded-md border border-slate-300 text-sm px-2 w-[120px]" value={bankInterestType} onChange={(e) => setBankInterestType(e.target.value)}>
                                <option value="compound">Compound</option>
                                <option value="simple">Simple</option>
                            </select>
                        </div>
                        {bankInterestType === 'compound' && (
                            <div className="mt-2 flex items-center justify-between gap-2">
                                <Label className="text-sm text-slate-600">Compounding</Label>
                                <select className="h-8 rounded-md border border-slate-300 text-sm px-2 w-[120px]" value={bankCompounding} onChange={(e) => setBankCompounding(e.target.value)}>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <Label className="text-sm text-slate-600">Redeem</Label>
                            <select className="h-8 rounded-md border border-slate-300 text-sm px-2 w-[120px]" value={bankRedeem} onChange={(e) => setBankRedeem(e.target.value)}>
                                <option value="yearly">Yearly</option>
                                <option value="monthly">Monthly</option>
                                <option value="maturity">At Maturity</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>

        {/* Right Column: Results & Projections */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Charts View Options & Summary Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
                <div className="flex justify-center gap-2 border-b border-slate-100 pb-5 mb-5">
                    <button onClick={() => setCurrentView('monthly')} className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${currentView === 'monthly' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#8B5CF6] hover:text-[#8B5CF6]'}`}>Monthly View</button>
                    <button onClick={() => setCurrentView('yearly')} className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${currentView === 'yearly' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#8B5CF6] hover:text-[#8B5CF6]'}`}>Yearly View</button>
                    <button onClick={() => setCurrentView('projection')} className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${currentView === 'projection' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#8B5CF6] hover:text-[#8B5CF6]'}`}>Projection View</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
                        <div className="text-sm font-medium text-slate-500 tracking-wide uppercase">{currentView === 'projection' ? `${projectionYears}-Year` : currentView === 'yearly' ? 'Annual' : 'Monthly'} Savings</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(savings * (currentView === 'monthly' ? 1 : currentView === 'yearly' ? 12 : 12 * projectionYears))}</div>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
                        <div className="text-sm font-medium text-slate-500 tracking-wide uppercase">Investment Growth</div>
                        <div className="text-2xl font-bold text-[#8B5CF6] mt-1">{formatCurrency(totalGrowth)}</div>
                        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 flex flex-col gap-1">
                            <div className="flex justify-between"><span className="text-amber-600 font-medium">Stocks</span> <span>{formatCurrency(stocksGrowthAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-blue-600 font-medium">Bank</span> <span>{formatCurrency(bankGrowthAmount)}</span></div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                        <div className="text-sm font-medium text-slate-500 tracking-wide uppercase">End Balance</div>
                        <div className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(endBalance)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-[320px]">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shrink-0 flex flex-col">
                        <h4 className="text-center font-bold text-slate-700 mb-3 text-sm tracking-wide">BUDGET ALLOCATION</h4>
                        <div className="flex-1 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={budgetData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" stroke="none">
                                  {budgetData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                                <RechartsLegend verticalAlign="bottom" iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shrink-0 flex flex-col">
                        <h4 className="text-center font-bold text-slate-700 mb-3 text-sm tracking-wide">INVESTMENT STRATEGY</h4>
                        <div className="flex-1 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={investmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" stroke="none">
                                  {investmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                                <RechartsLegend verticalAlign="bottom" iconType="circle" />
                              </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projection Controls & Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 overflow-hidden">
                <div className="flex items-center gap-3 mb-5">
                    <Label className="font-bold text-slate-800">Project for</Label>
                    <select className="h-9 rounded-md border border-slate-300 text-sm px-3 bg-slate-50 font-medium" value={projectionYears} onChange={(e) => setProjectionYears(Number(e.target.value))}>
                        <option value="3">3 years</option>
                        <option value="5">5 years</option>
                        <option value="10">10 years</option>
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    {currentView === 'monthly' ? (
                       <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 rounded-tl-lg">Month</th>
                                    <th className="px-3 py-3">Start Balance</th>
                                    <th className="px-3 py-3">Savings</th>
                                    <th className="px-3 py-3">Growth</th>
                                    <th className="px-3 py-3 text-right rounded-tr-lg">End Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {yearlyData.map((yData, yIdx) => {
                                    // Expand yearly into monthly approximated visually
                                    const mSavings = savings;
                                    const mGrowth = yData.growth / 12;
                                    let running = yIdx === 0 ? 0 : yearlyData[yIdx-1].endingBalance;
                                    const rows = [];
                                    for(let m=1; m<=12; m++) {
                                        const stepStart = running;
                                        running += mSavings + mGrowth;
                                        rows.push(
                                            <tr key={`${yIdx}-${m}`} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 py-2 font-medium text-slate-600">{((yIdx) * 12) + m}</td>
                                                <td className="px-3 py-2 text-slate-700">{formatCurrency(stepStart)}</td>
                                                <td className="px-3 py-2 text-emerald-600">+{formatCurrency(mSavings)}</td>
                                                <td className="px-3 py-2 text-[#8B5CF6]">+{formatCurrency(mGrowth)}</td>
                                                <td className="px-3 py-2 text-right font-bold text-slate-800">{formatCurrency(running)}</td>
                                            </tr>
                                        );
                                    }
                                    return rows;
                                })}
                            </tbody>
                       </table>
                    ) : (
                       <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Year</th>
                                    <th className="px-4 py-3">Start Balance</th>
                                    <th className="px-4 py-3">Savings</th>
                                    <th className="px-4 py-3">Growth</th>
                                    <th className="px-4 py-3 text-right rounded-tr-lg">End Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {yearlyData.map((data, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-600">{data.year}</td>
                                        <td className="px-4 py-3 text-slate-700">{formatCurrency(data.startingBalance)}</td>
                                        <td className="px-4 py-3 text-emerald-600">+{formatCurrency(data.monthlySavings)}</td>
                                        <td className="px-4 py-3 text-[#8B5CF6] group relative cursor-pointer">
                                            +{formatCurrency(data.growth)}
                                            {/* Minimal Tooltip for detail breakdown */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bg-slate-800 text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-4 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                                Stocks: {formatCurrency(data.stocksGrowth)} | Bank: {formatCurrency(data.bankGrowth)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(data.endingBalance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                       </table>
                    )}
                </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-[#8B5CF6] text-sm text-slate-600 leading-relaxed shadow-sm">
                <strong>Disclaimer:</strong> The Budget & Finances Modeler is provided for educational and illustrative purposes only. It does not constitute financial advice. Investment returns, inflation, and other economic factors can vary over time. Please consult a qualified financial advisor before making investment decisions.
            </div>

        </div>

      </div>
    </div>
  );
}
