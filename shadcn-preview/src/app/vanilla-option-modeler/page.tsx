"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ReferenceLine, ReferenceArea } from 'recharts';

export default function VanillaOptionModelerPage() {
  // Option Inputs
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [strikePrice, setStrikePrice] = useState<number>(95);
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [optionPrice, setOptionPrice] = useState<number>(5);
  const [numOptions, setNumOptions] = useState<number>(100);
  
  const [minPrice, setMinPrice] = useState<number>(40);
  const [maxPrice, setMaxPrice] = useState<number>(150);

  const [showFormula, setShowFormula] = useState(false);

  const formatCurrency = (amount: number, showCents = true) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    }).format(amount || 0);
  };

  // State calculations
  const optionStatus = useMemo(() => {
     if (optionType === 'call') {
         if (currentPrice > strikePrice) return 'In-the-Money';
         if (currentPrice < strikePrice) return 'Out-of-the-Money';
         return 'At-the-Money';
     } else {
         if (currentPrice < strikePrice) return 'In-the-Money';
         if (currentPrice > strikePrice) return 'Out-of-the-Money';
         return 'At-the-Money';
     }
  }, [optionType, currentPrice, strikePrice]);

  const intrinsicValue = useMemo(() => {
     if (optionStatus === 'In-the-Money') {
         return optionType === 'call' ? (currentPrice - strikePrice) : (strikePrice - currentPrice);
     }
     return 0;
  }, [optionStatus, optionType, currentPrice, strikePrice]);

  const totalValue = intrinsicValue * numOptions;
  const optionCost = optionPrice * numOptions;
  const netGain = totalValue - optionCost;

  // Chart Data Calculations
  const chartData = useMemo(() => {
      const points = [];
      const steps = 50;
      const stepSize = (maxPrice - minPrice) / steps;
      
      for (let i = 0; i <= steps; i++) {
          const priceStr = (minPrice + (stepSize * i)).toFixed(2);
          const price = parseFloat(priceStr);
          
          let value = 0;
          if (optionType === 'call') {
              value = Math.max(0, price - strikePrice);
          } else {
              value = Math.max(0, strikePrice - price);
          }
          
          points.push({
              price,
              marketPriceVis: price, // Just for tooltip/rendering line
              intrinsicValue: value,
              totalOptionValue: value * numOptions,
              netGainLoss: (value * numOptions) - optionCost
          });
      }
      return points;
  }, [minPrice, maxPrice, optionType, strikePrice, numOptions, optionCost]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const tG = data.netGainLoss;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg text-sm text-slate-800">
          <p className="font-bold mb-1 border-b border-slate-100 pb-1">Market Price: {formatCurrency(data.price)}</p>
          <p className="font-medium text-slate-600">Total Value: <span className="text-slate-900 font-bold">{formatCurrency(data.totalOptionValue)}</span></p>
          <p className="font-medium">Net Gain/Loss: <span className={`font-bold ${tG >= 0 ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>{tG >= 0 ? '+' : ''}{formatCurrency(tG)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-5 py-6 space-y-6 text-slate-800 font-sans min-h-screen bg-[#f9f9f9]">
      
      {/* Navigation */}
      <div className="flex items-center bg-[#2ecc71] text-white px-5 py-3 rounded-lg shadow-md border-none text-[0.95rem] font-medium w-full">
         <Link href="/" className="flex items-center text-white hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px] mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
         </Link>
         <span className="mx-auto font-bold tracking-wide uppercase">VANILLA OPTION MODELER</span>
      </div>

      {/* Header Container */}
      <div className="bg-slate-100 rounded-lg p-6 flex flex-col items-start w-full">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] rounded-xl flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
               <div className="absolute w-[20px] h-[20px] bg-white opacity-90 top-2 left-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%)" }}></div>
               <div className="absolute w-[10px] h-[10px] bg-white opacity-70 bottom-2 right-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 80% 100%, 80% 80%, 0 80%)" }}></div>
           </div>
           <div>
               <h1 className="text-2xl font-bold text-slate-900 m-0">Vanilla Option Modeler</h1>
               <p className="text-sm text-slate-600 mb-1">Option Value Calculator</p>
               <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                   by Amal Ganatra 
                   <a href="https://www.linkedin.com/in/amalganatra/" target="_blank" rel="noopener noreferrer" className="text-[#2ecc71] hover:text-[#27ae60]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                   </a>
               </span>
           </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
           A financial modeling tool that helps you analyze vanilla options by calculating their value at different price points. This calculator helps you understand whether options are in-the-money or out-of-the-money, and visualizes the total value, number of options, and net gain after paying the exercise price.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 space-y-5">
                <div>
                    <Label className="text-slate-700 font-medium mb-1.5 block">Option Type</Label>
                    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-shadow" 
                            value={optionType} onChange={(e) => setOptionType(e.target.value as "call" | "put")}>
                        <option value="call">Call Option</option>
                        <option value="put">Put Option</option>
                    </select>
                </div>

                <div>
                    <Label className="text-slate-700 font-medium mb-1.5 block">Strike Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={strikePrice} onChange={(e) => setStrikePrice(Number(e.target.value) || 0)} className="h-10 border-slate-300 focus-visible:ring-[#2ecc71]" />
                </div>

                <div>
                    <Label className="text-slate-700 font-medium mb-1.5 block">Current Stock Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value) || 0)} className="h-10 border-slate-300 focus-visible:ring-[#2ecc71]" />
                </div>

                <div>
                    <Label className="text-slate-700 font-medium mb-1.5 block">Option Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={optionPrice} onChange={(e) => setOptionPrice(Number(e.target.value) || 0)} className="h-10 border-slate-300 focus-visible:ring-[#2ecc71]" />
                </div>

                <div>
                    <Label className="text-slate-700 font-medium mb-1.5 block">Number of Options</Label>
                    <Input type="number" min="1" step="1" value={numOptions} onChange={(e) => setNumOptions(Number(e.target.value) || 0)} className="h-10 border-slate-300 focus-visible:ring-[#2ecc71]" />
                </div>

                <div>
                    <Label className="text-slate-700 font-medium mb-1.5 block">Price Range ($)</Label>
                    <div className="flex items-center gap-3">
                        <Input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value) || 0)} className="h-10 border-slate-300 focus-visible:ring-[#2ecc71] flex-1" />
                        <span className="text-slate-500 font-medium text-sm">to</span>
                        <Input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value) || 0)} className="h-10 border-slate-300 focus-visible:ring-[#2ecc71] flex-1" />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 h-full min-h-[500px] flex flex-col">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{`$${strikePrice} ${optionType.charAt(0).toUpperCase() + optionType.slice(1)} Option`}</h3>
                <div className="flex-1 min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                            <XAxis 
                                dataKey="price" 
                                type="number" 
                                domain={[minPrice, maxPrice]} 
                                tickFormatter={(val) => `$${val}`} 
                                label={{ value: 'Stock Price ($)', position: 'insideBottom', offset: -10 }} 
                                axisLine={{ stroke: '#e9ecef' }}
                                tickLine={false}
                                tick={{ fill: '#6c757d', fontSize: 13 }}
                            />
                            <YAxis 
                                tickFormatter={(val) => `$${val}`} 
                                label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', offset: 0 }} 
                                axisLine={{ stroke: '#e9ecef' }}
                                tickLine={false}
                                tick={{ fill: '#6c757d', fontSize: 13 }}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            
                            {/* ITM/OTM Areas */}
                            {optionType === 'call' ? (
                                <>
                                    <ReferenceArea x1={strikePrice} x2={maxPrice} fill="rgba(46, 204, 113, 0.15)" strokeOpacity={0} />
                                    <ReferenceArea x1={minPrice} x2={strikePrice} fill="rgba(231, 76, 60, 0.15)" strokeOpacity={0} />
                                </>
                            ) : (
                                <>
                                    <ReferenceArea x1={minPrice} x2={strikePrice} fill="rgba(46, 204, 113, 0.15)" strokeOpacity={0} />
                                    <ReferenceArea x1={strikePrice} x2={maxPrice} fill="rgba(231, 76, 60, 0.15)" strokeOpacity={0} />
                                </>
                            )}
                            
                            <ReferenceLine x={strikePrice} stroke="#34495e" strokeDasharray="5 5" strokeWidth={2} label={{ value: "Strike Price", position: optionType === 'call' ? "insideTopLeft" : "insideTopRight", fill: "#34495e", fontSize: 12, offset: 10 }} />
                            
                            <Line type="linear" dataKey="marketPriceVis" name="Market Price" stroke="#3498db" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Custom Legend / Area Indication below chart */}
                <div className="flex justify-center items-center gap-6 mt-2 pt-4 border-t border-slate-100">
                     <div className="flex items-center text-sm text-slate-600 font-medium">
                         <div className="w-4 h-4 rounded bg-[#3498db] mr-2"></div>
                         Market Price
                     </div>
                     <div className="flex items-center text-sm text-slate-600 font-medium">
                         <div className="w-10 h-0 border-t-2 border-dashed border-[#34495e] mr-2"></div>
                         Strike Price
                     </div>
                     <div className="flex items-center text-sm text-slate-600 font-medium">
                         <div className="w-4 h-4 rounded bg-emerald-100 mr-2 border border-emerald-200"></div>
                         In-the-Money
                     </div>
                     <div className="flex items-center text-sm text-slate-600 font-medium">
                         <div className="w-4 h-4 rounded bg-red-100 mr-2 border border-red-200"></div>
                         Out-of-the-Money
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center transform transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-center items-center">
                  <div className="text-slate-500 font-medium text-[1.1rem] mb-2 flex items-center justify-center gap-1 group relative cursor-help">
                      Option Status
                      <div className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold">?</div>
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs p-2 rounded w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Indicates whether the option is in-the-money (profitable to exercise), out-of-the-money (not profitable to exercise), or at-the-money (break-even).
                      </div>
                  </div>
                  <div className={`text-3xl font-bold mt-2 ${optionStatus === 'In-the-Money' ? 'text-[#2ecc71]' : optionStatus === 'Out-of-the-Money' ? 'text-[#e74c3c]' : 'text-[#f1c40f]'}`}>
                      {optionStatus}
                  </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center transform transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-center items-center">
                  <div className="text-slate-500 font-medium text-[1.1rem] mb-2 flex items-center justify-center gap-1 group relative cursor-help">
                      Total Value
                      <div className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold">?</div>
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs p-2 rounded w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          The total value of all options at the current market price, calculated as the intrinsic value multiplied by the number of options.
                      </div>
                  </div>
                  <div className="text-3xl font-bold mt-2 text-slate-800">
                      {formatCurrency(totalValue)}
                  </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center transform transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-center items-center relative">
                  <div className="text-slate-500 font-medium text-[1.1rem] mb-2 flex items-center justify-center gap-1 group relative cursor-help">
                      Net Gain/Loss
                      <div className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold">?</div>
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs p-2 rounded w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          The total profit or loss after accounting for the option purchase cost. Calculated as (Total Value - Option Cost). Positive values represent profit, negative values represent loss.
                      </div>
                  </div>
                  <div className={`text-3xl font-bold mt-2 ${netGain > 0 ? 'text-[#2ecc71]' : netGain < 0 ? 'text-[#e74c3c]' : 'text-slate-800'}`}>
                      {netGain > 0 ? '+' : ''}{formatCurrency(netGain)}
                  </div>
                  
                  <button 
                      onClick={() => setShowFormula(!showFormula)} 
                      className="mt-4 inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 transition-all shadow-sm"
                  >
                      {showFormula ? 'Hide Formula' : 'Show Formula'}
                      {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
              </div>

          </div>

          {/* Math Explanation Area */}
          {showFormula && (
              <div className="bg-slate-50 rounded-lg p-5 border-l-4 border-blue-500 animate-in fade-in slide-in-from-top-4 duration-300">
                  <p className="text-slate-700 mb-4 font-medium">The net gain/loss is calculated as:</p>
                  
                  <div className="bg-white rounded-md p-4 border border-slate-200 space-y-3 font-medium text-slate-800 shadow-sm text-sm sm:text-base">
                      <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0">1</span>
                          <span>Net Gain/Loss = </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">Intrinsic Value</span>
                          <span>×</span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">Number of Options</span>
                          <span>-</span>
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">Option Cost</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0">2</span>
                          <span>= </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">{formatCurrency(intrinsicValue)}</span>
                          <span>×</span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">{numOptions}</span>
                          <span>-</span>
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{formatCurrency(optionCost)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0">3</span>
                          <span>= </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">{formatCurrency(totalValue)}</span>
                          <span>-</span>
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{formatCurrency(optionCost)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0">4</span>
                          <span>= </span>
                          <span className={`px-2 py-0.5 rounded font-bold border ${netGain >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                             {netGain >= 0 ? '+' : ''}{formatCurrency(netGain)}
                          </span>
                      </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-700">
                      <p className="font-medium">Where:</p>
                      <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
                          <li>
                              <span className="px-1.5 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100 mr-1">Intrinsic Value</span> 
                              = 
                              {optionType === 'call' 
                                ? (currentPrice > strikePrice ? ` Market Price - Strike Price = ${formatCurrency(currentPrice)} - ${formatCurrency(strikePrice)} = ${formatCurrency(intrinsicValue)}` : ' Market Price < Strike Price, so $0.00') 
                                : (currentPrice < strikePrice ? ` Strike Price - Market Price = ${formatCurrency(strikePrice)} - ${formatCurrency(currentPrice)} = ${formatCurrency(intrinsicValue)}` : ' Strike Price < Market Price, so $0.00')}
                          </li>
                          <li>
                              <span className="px-1.5 py-0.5 text-xs rounded bg-red-50 text-red-600 border border-red-100 mr-1">Option Cost</span> 
                              = Option Price × Number of Options = {formatCurrency(optionPrice)} × {numOptions} = {formatCurrency(optionCost)}
                          </li>
                          <li>A negative result represents a loss on your investment. This represents your actual profit or loss, factoring in what you paid for the options.</li>
                      </ul>
                  </div>
              </div>
          )}
      </div>

    </div>
  );
}
