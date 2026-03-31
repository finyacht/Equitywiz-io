"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ReferenceLine } from 'recharts';

export default function NetflixOptionsModelerPage() {
  const [initialInvestment, setInitialInvestment] = useState<number>(1000);
  const [currentStockPrice, setCurrentStockPrice] = useState<number>(500);
  const [exercisePrice, setExercisePrice] = useState<number>(500);
  const [optionCost, setOptionCost] = useState<number>(200);

  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [annualGrowthRate, setAnnualGrowthRate] = useState<number>(10);
  const [yearsToProject, setYearsToProject] = useState<number>(10);
  const [taxRate, setTaxRate] = useState<number>(33);

  const formatCurrency = (amount: number, showCents = true) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    }).format(amount || 0);
  };

  // Calculations
  const shareCount = Math.floor(initialInvestment / (currentStockPrice || 1));
  const optionCount = Math.floor(initialInvestment / (optionCost || 1));
  const breakEvenPrice = exercisePrice + optionCost;

  const outperformPrice = useMemo(() => {
    if (optionCount <= shareCount) return Infinity;
    return exercisePrice + (initialInvestment / (optionCount - shareCount));
  }, [optionCount, shareCount, exercisePrice, initialInvestment]);

  // Chart 1 & 2 Data: Value and Return Comparison
  const comparisonData = useMemo(() => {
    const minPrice = currentStockPrice * 0.4;
    const maxPrice = currentStockPrice * 2.4;
    const step = (maxPrice - minPrice) / 20;
    
    const data = [];
    
    for (let price = minPrice; price <= maxPrice; price += step) {
        // Stock Path
        const stockValue = shareCount * price;
        const stockReturn = initialInvestment > 0 ? ((stockValue - initialInvestment) / initialInvestment) * 100 : 0;
        
        // Option Path
        const intrinsicValue = Math.max(0, price - exercisePrice);
        const optionValue = optionCount * intrinsicValue;
        const optionReturn = initialInvestment > 0 ? ((optionValue - initialInvestment) / initialInvestment) * 100 : 0;

        data.push({
            price: Number(price.toFixed(2)),
            stockValue: Number(stockValue.toFixed(2)),
            optionValue: Number(optionValue.toFixed(2)),
            stockReturn: Number(stockReturn.toFixed(2)),
            optionReturn: Number(optionReturn.toFixed(2)),
            initialAmount: initialInvestment,
            zeroReturn: 0
        });
    }
    return data;
  }, [currentStockPrice, shareCount, optionCount, exercisePrice, initialInvestment]);

  // Chart 3 Data: Time Projection
  const timeData = useMemo(() => {
    if (!showTaxSettings) return [];
    
    const data = [];
    for (let year = 0; year <= yearsToProject; year++) {
        const projectedPrice = currentStockPrice * Math.pow(1 + (annualGrowthRate / 100), year);
        
        const stockValue = shareCount * projectedPrice;
        const optionValue = optionCount * Math.max(0, projectedPrice - exercisePrice);
        
        const stockGain = stockValue - initialInvestment;
        const optionGain = optionValue - initialInvestment;
        
        const stockTax = Math.max(0, stockGain * (taxRate / 100));
        const optionTax = Math.max(0, optionGain * (taxRate / 100));
        
        data.push({
            year,
            stockAfterTax: Number((stockValue - stockTax).toFixed(2)),
            optionAfterTax: Number((optionValue - optionTax).toFixed(2)),
            initialAmount: initialInvestment
        });
    }
    return data;
  }, [currentStockPrice, annualGrowthRate, yearsToProject, shareCount, optionCount, exercisePrice, initialInvestment, taxRate, showTaxSettings]);

  // FAQ Expandable logic
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const CustomValueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg text-sm text-slate-800">
          <p className="font-bold mb-1 border-b border-slate-100 pb-1">NFLX Price: {formatCurrency(label)}</p>
          {payload.map((entry: any, index: number) => {
              if (entry.dataKey === 'initialAmount') return null;
              return (
                <p key={index} className="font-medium" style={{ color: entry.color }}>
                   {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
                   {entry.dataKey === 'stockValue' && <span className="text-xs text-slate-500 ml-1">({shareCount} shares)</span>}
                   {entry.dataKey === 'optionValue' && <span className="text-xs text-slate-500 ml-1">({optionCount} options)</span>}
                </p>
              )
          })}
        </div>
      );
    }
    return null;
  };

  const CustomReturnTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg text-sm text-slate-800">
          <p className="font-bold mb-1 border-b border-slate-100 pb-1">NFLX Price: {formatCurrency(label)}</p>
          {payload.map((entry: any, index: number) => {
              if (entry.dataKey === 'zeroReturn') return null;
              return (
                <p key={index} className="font-medium" style={{ color: entry.color }}>
                   {entry.name}: <span className="font-bold">{entry.value}%</span>
                </p>
              )
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-5 py-6 space-y-8 text-slate-800 font-sans min-h-screen bg-[#f9f9f9]" style={{ "--primary": "#e50914" } as React.CSSProperties}>
      
      {/* Navigation */}
      <div className="flex items-center bg-[#e50914] text-white px-5 py-3 rounded-lg shadow-md border-none text-[0.95rem] font-medium w-full">
         <Link href="/" className="flex items-center text-white hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px] mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
         </Link>
         <span className="mx-auto font-bold tracking-wide uppercase">NETFLIX SUPPLEMENTAL OPTION MODELER</span>
      </div>

      {/* Header Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-start w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#e50914]"></div>
        <div className="flex items-center gap-4 mb-4">
           <div>
               <h1 className="text-3xl font-bold text-slate-900 m-0">Netflix Supplemental Stock Option Plan Modeler</h1>
               <p className="text-[1.1rem] text-slate-600 mb-2 mt-1">Stock Option Value Calculator</p>
               <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                   by Amal Ganatra 
                   <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="text-[#e50914] hover:text-[#b20710]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                   </a>
               </span>
           </div>
        </div>
        <p className="text-[1rem] text-slate-700 leading-relaxed max-w-4xl">
           This calculator helps Netflix employees compare the value of purchasing Netflix stock versus stock options under the Supplemental Allocation plan. Enter your parameters below to visualize potential outcomes.
        </p>
        <div className="bg-[#fde7e9] rounded-lg p-4 mt-6 border-l-4 border-[#e50914] text-[0.95rem] text-slate-800">
            <strong>How Netflix Supplemental Stock Options Work:</strong> Employees can choose to forego a portion of their salary to purchase stock options. These options have an exercise price typically equal to the stock price at the time they are granted and last for 10 years.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Input Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5 group relative">
                <Label className="text-slate-700 font-medium flex items-center justify-between">
                    Initial Investment ($)
                    <div className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] cursor-help">?</div>
                </Label>
                <Input type="number" min="100" step="100" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914] bg-slate-50 focus:bg-white transition-colors text-lg font-medium" />
            </div>
            <div className="space-y-1.5 group relative">
                <Label className="text-slate-700 font-medium flex items-center justify-between">
                    Current NFLX Stock Price ($)
                    <div className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] cursor-help">?</div>
                </Label>
                <Input type="number" min="1" step="1" value={currentStockPrice} onChange={(e) => setCurrentStockPrice(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914] bg-slate-50 focus:bg-white transition-colors text-lg font-medium" />
            </div>
            <div className="space-y-1.5 group relative">
                <Label className="text-slate-700 font-medium flex items-center justify-between">
                    Option Exercise Price ($)
                    <div className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] cursor-help">?</div>
                </Label>
                <Input type="number" min="1" step="1" value={exercisePrice} onChange={(e) => setExercisePrice(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914] bg-slate-50 focus:bg-white transition-colors text-lg font-medium" />
            </div>
            <div className="space-y-1.5 group relative">
                <Label className="text-slate-700 font-medium flex items-center justify-between">
                    Cost Per Option ($)
                    <div className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px] cursor-help">?</div>
                </Label>
                <Input type="number" min="1" step="1" value={optionCost} onChange={(e) => setOptionCost(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914] bg-slate-50 focus:bg-white transition-colors text-lg font-medium" />
            </div>
        </div>

        <div className="mt-8">
            <button 
                onClick={() => setShowTaxSettings(!showTaxSettings)} 
                className="mx-auto block bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2 rounded-lg transition-colors border border-slate-200"
            >
                {showTaxSettings ? '− Hide Tax & Projection Settings' : '+ Show Tax & Projection Settings'}
            </button>
            
            {showTaxSettings && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-center font-semibold text-slate-700 mb-6">Tax & Projection Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-medium">Projected Annual Growth Rate (%)</Label>
                            <Input type="number" min="0" step="1" value={annualGrowthRate} onChange={(e) => setAnnualGrowthRate(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-medium">Years to Project</Label>
                            <Input type="number" min="1" step="1" value={yearsToProject} onChange={(e) => setYearsToProject(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-medium">Capital Gains Tax Rate (%)</Label>
                            <Input type="number" min="0" step="1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} className="h-11 border-slate-300 focus-visible:ring-[#e50914]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Analysis Results</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center group cursor-help transition-all hover:bg-white hover:shadow-md hover:border-[#e50914]/30 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#e50914] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                  <div className="text-[0.95rem] font-medium text-slate-600 mb-2">Shares You Can Buy</div>
                  <div className="text-[1.8rem] font-bold text-[#e50914]">{shareCount}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center group cursor-help transition-all hover:bg-white hover:shadow-md hover:border-[#e50914]/30 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#e50914] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                  <div className="text-[0.95rem] font-medium text-slate-600 mb-2">Options You Can Buy</div>
                  <div className="text-[1.8rem] font-bold text-[#e50914]">{optionCount}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center group cursor-help transition-all hover:bg-white hover:shadow-md hover:border-[#e50914]/30 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#e50914] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                  <div className="text-[0.95rem] font-medium text-slate-600 mb-2">Option Break-Even Price</div>
                  <div className="text-[1.8rem] font-bold text-[#e50914]">{formatCurrency(breakEvenPrice)}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center group cursor-help transition-all hover:bg-white hover:shadow-md hover:border-[#e50914]/30 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#e50914] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                  <div className="text-[0.95rem] font-medium text-slate-600 mb-2">Options Outperform at</div>
                  <div className="text-[1.8rem] font-bold text-[#e50914]">{isFinite(outperformPrice) ? formatCurrency(outperformPrice) : 'N/A'}</div>
              </div>
          </div>

          <div className="bg-[#fde7e9] rounded-lg p-5 mt-8 border-l-4 border-[#e50914]">
              <h3 className="text-lg font-bold text-slate-800 mb-3">How These Results Are Calculated:</h3>
              <ul className="space-y-3 text-[0.95rem] text-slate-700 pl-2">
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span><strong>Shares You Can Buy</strong> = Initial Investment ÷ Current Stock Price</span>
                      <em className="text-slate-500 sm:ml-auto">Example: {formatCurrency(initialInvestment)} ÷ {formatCurrency(currentStockPrice)} = {shareCount} shares</em>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span><strong>Options You Can Buy</strong> = Initial Investment ÷ Cost Per Option</span>
                      <em className="text-slate-500 sm:ml-auto">Example: {formatCurrency(initialInvestment)} ÷ {formatCurrency(optionCost)} = {optionCount} options</em>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span><strong>Option Break-Even Price</strong> = Exercise Price + Cost Per Option</span>
                      <em className="text-slate-500 sm:ml-auto">Example: {formatCurrency(exercisePrice)} + {formatCurrency(optionCost)} = {formatCurrency(breakEvenPrice)}</em>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span><strong>Options Outperform At</strong> = Exercise Price + [Initial Investment ÷ (Options Count - Shares Count)]</span>
                      <em className="text-slate-500 sm:ml-auto">Example: {formatCurrency(exercisePrice)} + [{formatCurrency(initialInvestment)} ÷ ({optionCount} - {shareCount})] = {isFinite(outperformPrice) ? formatCurrency(outperformPrice) : 'N/A'}</em>
                  </li>
              </ul>
          </div>
      </div>

      {/* Charts Array */}

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-[#e50914] p-8 transition-transform hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] duration-300">
          <h3 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200">Value Comparison: Stock vs Options</h3>
          <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                          dataKey="price" 
                          tickFormatter={(val) => `$${val}`} 
                          label={{ value: 'NFLX Stock Price', position: 'insideBottom', offset: -10 }} 
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                      />
                      <YAxis 
                          tickFormatter={(val) => `$${val}`} 
                          label={{ value: 'Value ($)', angle: -90, position: 'insideLeft', offset: 0 }} 
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                      />
                      <RechartsTooltip content={<CustomValueTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      
                      <Line type="monotone" dataKey="stockValue" name="Stock Value" stroke="#3e95cd" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="optionValue" name="Option Value" stroke="#e50914" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="initialAmount" name="Initial Investment" stroke="#000000" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">This chart shows how the value of your stock and option investments change at different Netflix stock prices.</p>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-[#e50914] p-8 transition-transform hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] duration-300">
          <h3 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200">Rate of Return: Stock vs Options</h3>
          <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                          dataKey="price" 
                          tickFormatter={(val) => `$${val}`} 
                          label={{ value: 'NFLX Stock Price', position: 'insideBottom', offset: -10 }} 
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                      />
                      <YAxis 
                          tickFormatter={(val) => `${val}%`} 
                          label={{ value: 'Rate of Return (%)', angle: -90, position: 'insideLeft', offset: 0 }} 
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                      />
                      <RechartsTooltip content={<CustomReturnTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      
                      <Line type="monotone" dataKey="stockReturn" name="Stock Rate of Return" stroke="#3e95cd" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="optionReturn" name="Options Rate of Return" stroke="#e50914" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="zeroReturn" name="Break-even (0%)" stroke="#000000" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">This chart shows the percentage return on your investment for both stock and options at different Netflix stock prices. For options, returns are calculated based on the intrinsic value (stock price minus exercise price) multiplied by the number of options owned.</p>
      </div>

      {showTaxSettings && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-t-4 border-[#e50914] p-8 transition-transform hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] duration-300 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200">After-Tax Value Over Time</h3>
              <div className="h-[350px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis 
                              dataKey="year" 
                              label={{ value: 'Years', position: 'insideBottom', offset: -10 }} 
                              tick={{ fill: '#64748b', fontSize: 12 }}
                              axisLine={{ stroke: '#cbd5e1' }}
                              tickLine={false}
                          />
                          <YAxis 
                              tickFormatter={(val) => `$${val}`} 
                              label={{ value: 'After-Tax Value ($)', angle: -90, position: 'insideLeft', offset: 0 }} 
                              tick={{ fill: '#64748b', fontSize: 12 }}
                              axisLine={{ stroke: '#cbd5e1' }}
                              tickLine={false}
                          />
                          <RechartsTooltip content={<CustomValueTooltip />} />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          
                          <Line type="monotone" dataKey="stockAfterTax" name="Stock After-Tax Value" stroke="#3e95cd" strokeWidth={3} dot={true} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="optionAfterTax" name="Options After-Tax Value" stroke="#e50914" strokeWidth={3} dot={true} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="initialAmount" name="Initial Investment" stroke="#000000" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">This chart projects the after-tax value of your stock and option investments over time, assuming the specified annual growth rate.</p>
          </div>
      )}

      {/* Accordion Explanations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Understanding Netflix Supplemental Stock Options</h2>
          
          <div className="space-y-4">
              {[
                  {
                      title: "How do Netflix supplemental stock options work?",
                      content: "Netflix offers a unique Supplemental Allocation plan where employees can choose to forego a portion of their salary to purchase stock options. The cost per option is typically less than the current stock price, allowing you to control more shares with the same investment.\n\nThese options have an exercise price typically equal to the stock price at the time they are granted and last for 10 years, even if you leave Netflix."
                  },
                  {
                      title: "When do options become valuable?",
                      content: "Options only have value when the stock price rises above the exercise price. Because you're paying for the options upfront, the stock price needs to rise enough to cover your cost per option to break even.\n\nThe stock price needs to rise beyond the break-even point before options outperform the alternative of buying stock directly."
                  },
                  {
                      title: "What are the risks?",
                      content: "Options are riskier than stock. If the stock price doesn't rise above the exercise price, your options will have zero value, and you'll lose your entire investment.\n\nWith stock, even if the price decreases, you still own something of value. Options require significant stock price appreciation to be worthwhile."
                  },
                  {
                      title: "Tax considerations",
                      content: "When you exercise options and sell the resulting shares, you'll generally pay capital gains tax on the profit. The tax treatment can be complex and may depend on your holding period and other factors.\n\nThis calculator provides a simplified after-tax analysis, but you should consult a tax professional for specific advice."
                  }
              ].map((faq, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button 
                          onClick={() => setOpenFaq(openFaq === index ? null : index)}
                          className={`w-full text-left px-5 py-4 font-semibold flex items-center justify-between transition-colors ${openFaq === index ? 'bg-[#fde7e9] text-[#b20710]' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
                      >
                          {faq.title}
                          {openFaq === index ? <Minus className="w-5 h-5 text-[#e50914]" /> : <Plus className="w-5 h-5 text-slate-400" />}
                      </button>
                      {openFaq === index && (
                          <div className="px-5 py-4 bg-white whitespace-pre-line text-slate-600 leading-relaxed text-[0.95rem]">
                              {faq.content}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
}
