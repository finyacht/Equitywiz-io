"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Calculator, HelpCircle } from "lucide-react";

export default function ESPPCalculatorPage() {
  const [salary, setSalary] = useState(120000);
  const [contributionRate, setContributionRate] = useState(10);
  const [purchasePeriod, setPurchasePeriod] = useState(6);
  const [discount, setDiscount] = useState(15);
  const [offeringPeriod, setOfferingPeriod] = useState(24);
  const [currentSalePrice, setCurrentSalePrice] = useState(240);
  const [lookbackEnabled, setLookbackEnabled] = useState(true);
  
  const [grantPrice, setGrantPrice] = useState(100);
  
  // Manage dynamic purchase prices based on offering / purchase periods
  const numberOfPurchases = Math.max(1, Math.floor(offeringPeriod / purchasePeriod));
  const [purchasePrices, setPurchasePrices] = useState<number[]>(
    Array.from({ length: 10 }).map((_, i) => 150 + i * 10)
  );

  const updatePurchasePrice = (index: number, val: number) => {
    const newArr = [...purchasePrices];
    newArr[index] = val;
    setPurchasePrices(newArr);
  };

  const [ordinaryTaxRate, setOrdinaryTaxRate] = useState(25);
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState(15);

  const metrics = useMemo(() => {
    let totalContribution = 0;
    let totalSharesPurchased = 0;
    let lookbackAdvantage = 0;
    
    let totalDiscountAmount = 0;
    let totalAppreciationAmount = 0;
    
    const monthlyContribution = (salary * (contributionRate / 100)) / 12;
    const periodContribution = monthlyContribution * purchasePeriod;
    
    const chartData = [];

    for (let i = 0; i < numberOfPurchases; i++) {
       const periodPrice = purchasePrices[i] || 150;
       
       const lowerPriceWithLookback = Math.min(grantPrice, periodPrice);
       const purchasePriceWithLookback = lowerPriceWithLookback * (1 - discount / 100);
       
       const purchasePriceWithoutLookback = periodPrice * (1 - discount / 100);
       
       const actualPurchasePrice = lookbackEnabled ? purchasePriceWithLookback : purchasePriceWithoutLookback;
       const shares = periodContribution / actualPurchasePrice;
       
       totalContribution += periodContribution;
       totalSharesPurchased += shares;
       
       const sharesWithoutLookback = periodContribution / purchasePriceWithoutLookback;
       if (lookbackEnabled) {
         const savings = (shares * currentSalePrice) - (sharesWithoutLookback * currentSalePrice);
         lookbackAdvantage += savings;
       }
       
       const lowerP = lookbackEnabled ? lowerPriceWithLookback : periodPrice;
       totalDiscountAmount += shares * (lowerP - actualPurchasePrice);
       totalAppreciationAmount += shares * Math.max(0, currentSalePrice - lowerP);
       
       chartData.push({
         name: `Month ${(i + 1) * purchasePeriod}`,
         Investment: periodContribution,
         Profit: (shares * currentSalePrice) - periodContribution
       });
    }

    const totalCurrentValue = totalSharesPurchased * currentSalePrice;
    const totalProfit = totalCurrentValue - totalContribution;
    const avgPricePerShare = totalSharesPurchased > 0 ? totalContribution / totalSharesPurchased : 0;
    const roi = totalContribution > 0 ? (totalProfit / totalContribution) * 100 : 0;
    
    const qualifyingTax = (totalDiscountAmount * (ordinaryTaxRate / 100)) + (totalAppreciationAmount * (capitalGainsTaxRate / 100));
    const disqualifyingTax = Math.max(0, totalCurrentValue - totalContribution) * (ordinaryTaxRate / 100);
    
    const annualContribution = monthlyContribution * 12;
    const remainingLimit = Math.max(0, 25000 - annualContribution);

    return {
      totalContribution, totalSharesPurchased, avgPricePerShare, totalCurrentValue, 
      totalProfit, roi, lookbackAdvantage, remainingLimit,
      qualifyingTax, disqualifyingTax, chartData
    };
  }, [
    salary, contributionRate, purchasePeriod, discount, offeringPeriod, currentSalePrice, 
    lookbackEnabled, grantPrice, purchasePrices, ordinaryTaxRate, capitalGainsTaxRate, numberOfPurchases
  ]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md flex items-center justify-center shrink-0">
             <Calculator className="text-white w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">ESPP Return Calculator</h1>
            <p className="text-slate-500 text-sm md:text-base">Calculate potential returns from your Employee Stock Purchase Plan with detailed tax modeling.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs Column */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-lg">Employee Info</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Annual Salary ($)</Label>
                  <Input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Contribution Rate (%)</Label>
                  <Input type="number" value={contributionRate} onChange={(e) => setContributionRate(Number(e.target.value))} max={15} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-lg">Plan Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Purchase Period</Label>
                    <Select value={purchasePeriod.toString()} onValueChange={v => setPurchasePeriod(Number(v))}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Offering Period</Label>
                    <Select value={offeringPeriod.toString()} onValueChange={v => setOfferingPeriod(Number(v))}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Salable Price</Label>
                    <Input type="number" value={currentSalePrice} onChange={e => setCurrentSalePrice(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    Enable Lookback Provision <HelpCircle className="w-4 h-4 text-slate-400" />
                  </Label>
                  <Switch checked={lookbackEnabled} onCheckedChange={setLookbackEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 border-l-4 border-l-[#0a5264]">
               <CardHeader className="pb-3 border-b border-slate-100"><CardTitle className="text-lg">Stock Prices Over Time</CardTitle></CardHeader>
               <CardContent className="space-y-4 pt-4">
                 {lookbackEnabled && (
                   <div className="space-y-2 pb-4 border-b border-slate-100">
                     <Label className="text-[#0a5264] font-bold">Grant Date Price</Label>
                     <Input type="number" value={grantPrice} onChange={e => setGrantPrice(Number(e.target.value))} className="bg-slate-50"/>
                   </div>
                 )}
                 <div className="space-y-3">
                   {Array.from({length: numberOfPurchases}).map((_, i) => (
                     <div key={i} className="flex items-center justify-between gap-4">
                       <Label className="w-24 shrink-0 text-slate-600">Month {(i+1) * purchasePeriod}</Label>
                       <Input 
                         type="number" 
                         value={purchasePrices[i]} 
                         onChange={e => updatePurchasePrice(i, Number(e.target.value))}
                       />
                     </div>
                   ))}
                 </div>
               </CardContent>
            </Card>
            
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <CardContent className="p-5">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Contribution</div>
                   <div className="text-2xl font-black text-slate-800">{formatCurrency(metrics.totalContribution)}</div>
                 </CardContent>
               </Card>
               <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <CardContent className="p-5">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Value</div>
                   <div className="text-2xl font-black text-[#0a5264]">{formatCurrency(metrics.totalCurrentValue)}</div>
                 </CardContent>
               </Card>
               <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <CardContent className="p-5">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Profit</div>
                   <div className="text-2xl font-black text-emerald-600">+{formatCurrency(metrics.totalProfit)}</div>
                 </CardContent>
               </Card>
               <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <CardContent className="p-5">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Shares Acquired</div>
                   <div className="text-2xl font-black text-slate-800">{metrics.totalSharesPurchased.toFixed(1)}</div>
                 </CardContent>
               </Card>
               <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <CardContent className="p-5">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total ROI</div>
                   <div className="text-2xl font-black text-emerald-600">{metrics.roi.toFixed(1)}%</div>
                 </CardContent>
               </Card>
               {lookbackEnabled && (
                 <Card className="border-0 bg-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-5">
                     <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Lookback Advantage</div>
                     <div className="text-2xl font-black text-emerald-700">+{formatCurrency(metrics.lookbackAdvantage)}</div>
                   </CardContent>
                 </Card>
               )}
            </div>

            {/* Bar Chart representing Multi-period value accumulation */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Purchase Periods Analysis</CardTitle>
                <CardDescription>Breakdown of Investment vs Generated Profit across each offering tranche.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: "#64748b", fontSize: 13 }} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px' }} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Bar dataKey="Investment" stackId="a" fill="#94a3b8" radius={[0, 0, 4, 4]} barSize={40} />
                      <Bar dataKey="Profit" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tax Analysis Panel */}
             <Card className="shadow-sm border-slate-200">
               <CardHeader className="border-b border-slate-100 bg-slate-50">
                 <CardTitle className="text-lg">Disposition Tax Scenarios</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y md:divide-y-0 divide-slate-100">
                    <div className="p-6">
                       <h4 className="font-bold text-slate-800 mb-2">Qualifying Disposition</h4>
                       <p className="text-sm text-slate-500 mb-4 h-10">Hold 2+ years from grant, 1+ year from purchase. Favorable tax treatment.</p>
                       <div className="text-3xl font-black text-rose-500 mb-2">{formatCurrency(metrics.qualifyingTax)} <span className="text-sm text-slate-400 font-normal">tax</span></div>
                    </div>
                    <div className="p-6">
                       <h4 className="font-bold text-slate-800 mb-2">Disqualifying Disposition</h4>
                       <p className="text-sm text-slate-500 mb-4 h-10">Sell before holding requirements. Gains taxed entirely as standard income.</p>
                       <div className="text-3xl font-black text-rose-500 mb-2">{formatCurrency(metrics.disqualifyingTax)} <span className="text-sm text-slate-400 font-normal">tax</span></div>
                    </div>
                 </div>
                 
                 <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <div className="flex gap-4">
                       <div className="space-y-1">
                          <Label className="text-xs">Ordinary Tax Rate (%)</Label>
                          <Input type="number" value={ordinaryTaxRate} onChange={e => setOrdinaryTaxRate(Number(e.target.value))} className="bg-white" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-xs">Capital Gains Tax Rate (%)</Label>
                          <Input type="number" value={capitalGainsTaxRate} onChange={e => setCapitalGainsTaxRate(Number(e.target.value))} className="bg-white" />
                       </div>
                    </div>
                 </div>
               </CardContent>
             </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
