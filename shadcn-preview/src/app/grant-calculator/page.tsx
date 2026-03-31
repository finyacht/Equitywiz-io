"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend, ReferenceLine } from "recharts";
import { ChevronDown, ChevronUp, Info, HelpCircle } from "lucide-react";
import Link from "next/link";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number) {
  return value.toFixed(1) + '%';
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
  });
}

function calculateOptionsValue(sharePrice: number, strikePrice: number, numOptions: number, taxRate: number) {
  const intrinsicValue = Math.max(0, sharePrice - strikePrice);
  const grossValue = intrinsicValue * numOptions;
  const taxes = grossValue * (taxRate / 100);
  const netValue = grossValue - taxes;
  return { grossValue, netValue, taxes, intrinsicValue, inTheMoney: sharePrice > strikePrice };
}

function calculateRSUsValue(sharePrice: number, numUnits: number, taxRate: number) {
  const grossValue = sharePrice * numUnits;
  const taxes = grossValue * (taxRate / 100);
  const netValue = grossValue - taxes;
  return { grossValue, netValue, taxes };
}

function findBreakpoint(strikePrice: number, numOptions: number, numRSUs: number) {
  if (numOptions === numRSUs || numOptions <= numRSUs) return null;
  const breakpoint = (strikePrice * numOptions) / (numOptions - numRSUs);
  return breakpoint > 0 ? breakpoint : null;
}

export default function GrantCalculatorPage() {
  // Step 1: Initial Inputs
  const [totalGrant, setTotalGrant] = useState(1500000);
  const [valueDelivered, setValueDelivered] = useState(3000000);
  const [splitPercent, setSplitPercent] = useState(50); // Options %, RSUs = 100 - Options %

  // Step 2: Growth Parameters
  const [strikePrice, setStrikePrice] = useState(200);
  const [currentSharePrice, setCurrentSharePrice] = useState(500);
  const [appreciation, setAppreciation] = useState(50);
  const [taxRate, setTaxRate] = useState(35);
  
  const [formulaExpanded, setFormulaExpanded] = useState(false);

  // Step 3: Vesting Schedule
  const [vestingStartDate, setVestingStartDate] = useState(() => {
    const d = new Date("2022-06-24");
    return d.toISOString().split('T')[0];
  });
  const [vestingPeriod, setVestingPeriod] = useState(4);
  const [cliffPeriod, setCliffPeriod] = useState(1);
  const [vestingFrequency, setVestingFrequency] = useState("annual");
  
  const [optionsPage, setOptionsPage] = useState(1);
  const [rsusPage, setRsusPage] = useState(1);
  const itemsPerPage = 10;

  // Step 4: Departure Planning
  const [planningToLeave, setPlanningToLeave] = useState(false);
  const [departureDate, setDepartureDate] = useState("2025-12-31");

  // Derived Values Step 1
  const optionsBudget = totalGrant * (splitPercent / 100);
  const rsusBudget = totalGrant * ((100 - splitPercent) / 100);

  // Derived Values Step 2
  const numOptions = strikePrice > 0 ? Math.floor(optionsBudget / strikePrice) : 0;
  const numRSUs = currentSharePrice > 0 ? Math.floor(rsusBudget / currentSharePrice) : 0;
  const targetPrice = currentSharePrice * (1 + appreciation / 100);
  const breakpoint = findBreakpoint(strikePrice, numOptions, numRSUs);

  const optionsTargetVal = calculateOptionsValue(targetPrice, strikePrice, numOptions, taxRate);
  const rsusTargetVal = calculateRSUsValue(targetPrice, numRSUs, taxRate);
  
  const totalTaxes = optionsTargetVal.taxes + rsusTargetVal.taxes;
  const totalGainsDelivered = valueDelivered + optionsTargetVal.netValue + rsusTargetVal.netValue;
  const betterChoice = optionsTargetVal.netValue > rsusTargetVal.netValue ? 'Options' : 'RSUs';

  // Vesting Generation
  const generateVestingSchedule = (totalQuantity: number, isDepartureCalc = false) => {
    const schedule: any[] = [];
    if (totalQuantity <= 0 || vestingPeriod <= 0) return schedule;
    
    const startDate = new Date(vestingStartDate);
    let currentDate = new Date(startDate);
    const actualCliff = Math.min(cliffPeriod, vestingPeriod);
    
    const monthsPerInterval = vestingFrequency === 'annual' ? 12 : vestingFrequency === 'quarterly' ? 3 : 1;
    const totalIntervals = Math.floor((vestingPeriod * 12) / monthsPerInterval);
    
    const cliffIntervals = Math.floor((actualCliff * 12) / monthsPerInterval);
    const cliffQuantity = cliffIntervals > 0 ? Math.floor((totalQuantity * actualCliff) / vestingPeriod) : 0;
    const remainingQuantity = totalQuantity - cliffQuantity;
    const regularIntervals = totalIntervals - cliffIntervals;
    const regularQuantityPerInterval = regularIntervals > 0 ? Math.floor(remainingQuantity / regularIntervals) : 0;
    
    let cumulativeQuantity = 0;
    let intervalCounter = 0;
    const today = new Date();
    const leaveDate = isDepartureCalc && departureDate ? new Date(departureDate) : null;
    
    if (cliffQuantity > 0) {
        currentDate.setMonth(currentDate.getMonth() + (actualCliff * 12));
        const vDate = new Date(currentDate);
        let status = vDate <= today ? 'Vested' : 'Unvested';
        if (isDepartureCalc && leaveDate) {
          if (vDate <= today && vDate <= leaveDate) status = 'Vested';
          else if (vDate > leaveDate) status = 'Forfeited';
          else status = 'Unvested';
        }
        
        cumulativeQuantity += cliffQuantity;
        schedule.push({
            tranche: ++intervalCounter,
            date: vDate,
            type: 'Cliff',
            quantity: cliffQuantity,
            cumulative: cumulativeQuantity,
            percentage: (cumulativeQuantity / totalQuantity) * 100,
            status
        });
    }
    
    for (let i = 0; i < regularIntervals; i++) {
        currentDate.setMonth(currentDate.getMonth() + monthsPerInterval);
        const vDate = new Date(currentDate);
        let status = vDate <= today ? 'Vested' : 'Unvested';
        if (isDepartureCalc && leaveDate) {
          if (vDate <= today && vDate <= leaveDate) status = 'Vested';
          else if (vDate > leaveDate) status = 'Forfeited';
          else status = 'Unvested';
        }

        const quantity = i === regularIntervals - 1 ? totalQuantity - cumulativeQuantity : regularQuantityPerInterval;
            
        if (quantity > 0) {
            cumulativeQuantity += quantity;
            schedule.push({
                tranche: ++intervalCounter,
                date: vDate,
                type: 'Regular',
                quantity,
                cumulative: cumulativeQuantity,
                percentage: (cumulativeQuantity / totalQuantity) * 100,
                status
            });
        }
    }
    
    return schedule;
  };

  const optionsVestingData = useMemo(() => generateVestingSchedule(numOptions), [numOptions, vestingPeriod, cliffPeriod, vestingFrequency, vestingStartDate]);
  const rsusVestingData = useMemo(() => generateVestingSchedule(numRSUs), [numRSUs, vestingPeriod, cliffPeriod, vestingFrequency, vestingStartDate]);
  
  const optionsDepartureData = useMemo(() => planningToLeave ? generateVestingSchedule(numOptions, true) : [], [planningToLeave, numOptions, vestingPeriod, cliffPeriod, vestingFrequency, vestingStartDate, departureDate]);
  const rsusDepartureData = useMemo(() => planningToLeave ? generateVestingSchedule(numRSUs, true) : [], [planningToLeave, numRSUs, vestingPeriod, cliffPeriod, vestingFrequency, vestingStartDate, departureDate]);

  // Departure Totals
  const calculateTotals = (data: any[]) => {
    let vested = 0, unvested = 0, forfeited = 0;
    data.forEach(entry => {
      if (entry.status === 'Vested') vested += entry.quantity;
      else if (entry.status === 'Unvested') unvested += entry.quantity;
      else if (entry.status === 'Forfeited') forfeited += entry.quantity;
    });
    return { vested, unvested, forfeited, retained: vested + unvested }; // In HTML, Retained = Vested + Unvested
  };

  const optionsDepartureTotals = calculateTotals(optionsDepartureData);
  const rsusDepartureTotals = calculateTotals(rsusDepartureData);

  // Scenario Comparison (Normal vs Departure)
  const departureOptionsVal = useMemo(() => {
    return optionsDepartureData.reduce((acc, entry) => {
      if (entry.status !== 'Forfeited') {
        return acc + calculateOptionsValue(targetPrice, strikePrice, entry.quantity, taxRate).netValue;
      }
      return acc;
    }, 0);
  }, [optionsDepartureData, targetPrice, strikePrice, taxRate]);

  const departureRsusVal = useMemo(() => {
    return rsusDepartureData.reduce((acc, entry) => {
      if (entry.status !== 'Forfeited') {
        return acc + calculateRSUsValue(targetPrice, entry.quantity, taxRate).netValue;
      }
      return acc;
    }, 0);
  }, [rsusDepartureData, targetPrice, taxRate]);

  const normalTotal = optionsTargetVal.netValue + rsusTargetVal.netValue;
  const departureTotal = departureOptionsVal + departureRsusVal;
  const valueLoss = normalTotal - departureTotal;
  const valueLossPercent = normalTotal > 0 ? (valueLoss / normalTotal) * 100 : 0;


  // Charts Data
  const chartData = useMemo(() => {
    const minP = Math.max(1, Math.min(currentSharePrice, strikePrice) * 0.5);
    const maxP = Math.max(currentSharePrice, strikePrice, targetPrice) * 1.5;
    const data = [];
    const optInvestment = numOptions * strikePrice;
    const rsuInvestment = numRSUs * currentSharePrice;

    for (let i = 0; i <= 30; i++) {
      const price = minP + (maxP - minP) * (i / 30);
      const oVal = calculateOptionsValue(price, strikePrice, numOptions, taxRate);
      const rVal = calculateRSUsValue(price, numRSUs, taxRate);
      
      let oROI = 0;
      if (optInvestment > 0) oROI = ((oVal.netValue - optInvestment) / optInvestment) * 100;

      let rROI = 0;
      if (rsuInvestment > 0) rROI = ((rVal.netValue - rsuInvestment) / rsuInvestment) * 100;

      data.push({
        price,
        optionsNetValue: oVal.netValue,
        rsusNetValue: rVal.netValue,
        optionsROI: oROI,
        rsusROI: rROI,
        isOtm: price < strikePrice
      });
    }
    return data;
  }, [currentSharePrice, strikePrice, targetPrice, numOptions, numRSUs, taxRate]);

  const CustomROITooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-black/90 text-white p-3 rounded-md shadow-lg text-sm border border-white/10">
          <p className="font-semibold mb-2 text-[15px]">Share Price: {formatCurrency(p.price)}</p>
          <div className="space-y-4">
            <div className="border-l-2 border-[#0a5264] pl-2">
              <p className="text-[#8cd2e6] font-medium mb-1">Options ROI: {formatPercent(p.optionsROI)}</p>
              {p.isOtm ? (
                 <div className="text-gray-300 text-xs space-y-1">
                   <p>📉 Negative ROI because:</p>
                   <p>• Share price ({formatCurrency(p.price)}) &lt; Strike ({formatCurrency(strikePrice)})</p>
                   <p>• Options are worthless</p>
                 </div>
              ) : (
                 <div className="text-gray-300 text-xs space-y-1">
                   <p>📈 Positive ROI calculation:</p>
                   <p>• Intrinsic value: {formatCurrency(p.price - strikePrice)}</p>
                 </div>
              )}
            </div>
            <div className="border-l-2 border-[#4a9eff] pl-2">
              <p className="text-[#4a9eff] font-medium mb-1">RSUs ROI: {formatPercent(p.rsusROI)}</p>
              <div className="text-gray-300 text-xs">
                {p.price < currentSharePrice ? '📉 Stock declined' : '📈 Stock appreciated'}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomValueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-black/90 text-white p-3 rounded-md shadow-lg text-sm border border-white/10">
          <p className="font-semibold mb-1">Share Price: {formatCurrency(p.price)}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} style={{ color: entry.color }}>
               {entry.name}: {formatCurrency(entry.value)}
             </p>
          ))}
        </div>
      );
    }
    return null;
  }

  // Helper component for Tables
  const VestingTable = ({ data, page, setPage }: { data: any[], page: number, setPage: (p: number) => void }) => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Tranche</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cumulative</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Value at Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, i) => (
                <TableRow key={i} className={row.status === 'Forfeited' ? 'opacity-60' : ''}>
                  <TableCell>{row.tranche}</TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Vested' ? 'bg-[#d1e7dd] text-[#0f5132]' : 
                      row.status === 'Forfeited' ? 'bg-[#f8d7da] text-[#842029]' : 'bg-[#fff3cd] text-[#664d03]'
                    }`}>{row.status}</span>
                  </TableCell>
                  <TableCell>{formatNumber(row.quantity)}</TableCell>
                  <TableCell>{formatNumber(row.cumulative)}</TableCell>
                  <TableCell>{row.percentage.toFixed(1)}%</TableCell>
                  <TableCell>{row.status === 'Forfeited' ? '$0' : formatCurrency(row.status === 'Vested' || row.status === 'Unvested' ? calculateOptionsValue(targetPrice, strikePrice, row.quantity, taxRate).netValue : 0)}</TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-slate-500">No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              Equity-Wiz
            </Link>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-slate-600">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Grant Budget Calculator</h1>
          <p className="text-lg text-slate-600">
            Design your ideal equity compensation package by splitting your grant budget between Stock Options and RSUs. See how different scenarios impact your future value and taxes.
          </p>
        </div>

        {/* Step 1 */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 flex items-center gap-4 border-b border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-semibold text-slate-800">Set Your Grant Budget & Split</h2>
          </div>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="totalGrant" className="text-base text-slate-700">Total amount to invest in equity</Label>
                <Input
                  id="totalGrant"
                  type="number"
                  value={totalGrant}
                  onChange={(e) => setTotalGrant(Number(e.target.value))}
                  className="text-lg h-12 border-slate-300 font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="valueDelivered" className="text-base text-slate-700 flex items-center gap-2">
                  Value Delivered
                  <Info className="w-4 h-4 text-slate-400" />
                </Label>
                <Input
                  id="valueDelivered"
                  type="number"
                  value={valueDelivered}
                  onChange={(e) => setValueDelivered(Number(e.target.value))}
                  className="text-lg h-12 border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#e5e5e7] rounded-xl p-6 md:p-8">
              <div className="flex justify-between text-lg font-medium mb-8">
                <span className="text-[#0a5264]">Options: {splitPercent}%</span>
                <span className="text-[#4a9eff]">RSUs: {100 - splitPercent}%</span>
              </div>
              <Slider
                value={[splitPercent]}
                onValueChange={(val) => setSplitPercent(Array.isArray(val) ? val[0] : (val as unknown as number))}
                max={100}
                step={1}
                className="mb-8"
              />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#0a5264] mb-1">{formatCurrency(optionsBudget)}</div>
                  <div className="text-sm text-slate-500 uppercase font-medium tracking-wider">Options Budget</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#4a9eff] mb-1">{formatCurrency(rsusBudget)}</div>
                  <div className="text-sm text-slate-500 uppercase font-medium tracking-wider">RSUs Budget</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 flex items-center gap-4 border-b border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-semibold text-slate-800">Calculate Equity Quantities & Growth Parameters</h2>
          </div>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="strikePrice">Option Strike Price</Label>
                <Input id="strikePrice" type="number" value={strikePrice} onChange={(e) => setStrikePrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentSharePrice">Current Share Price</Label>
                <Input id="currentSharePrice" type="number" value={currentSharePrice} onChange={(e) => setCurrentSharePrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appreciation">Share Price Apprec. (%)</Label>
                <Input id="appreciation" type="number" value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value))} />
                <div className="text-xs text-green-600 font-semibold mt-1">Target: {formatCurrency(targetPrice)}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Total Tax Rate (%)</Label>
                <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
            </div>

            <div className="bg-[#e8f3ff] text-[#0a5264] p-4 rounded-lg flex items-center gap-3">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm"><strong>Note:</strong> For Options, you pay the strike price per option. For RSUs, you pay the current share price per unit.</p>
            </div>

            <div className="bg-[#f8f9fa] rounded-xl p-6 border border-slate-200 text-center">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-[#0a5264] mb-2">{formatNumber(numOptions)}</div>
                  <div className="text-slate-600 font-medium">Stock Options</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-[#4a9eff] mb-2">{formatNumber(numRSUs)}</div>
                  <div className="text-slate-600 font-medium">RSUs</div>
                </div>
              </div>
            </div>

            {/* Formula Collapsible */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
               <button 
                 onClick={() => setFormulaExpanded(!formulaExpanded)}
                 className="w-full bg-slate-50 px-4 py-3 flex items-center justify-between font-medium text-slate-700 hover:bg-slate-100 transition-colors"
               >
                 <span className="flex items-center gap-2">📊 How we calculate quantities</span>
                 {formulaExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
               </button>
               {formulaExpanded && (
                 <div className="p-4 bg-white space-y-3 font-mono text-sm text-slate-700">
                   <div className="bg-slate-50 p-2 border-l-4 border-[#0a5264]">Number of Options = Options Budget ÷ Strike Price</div>
                   <div className="bg-slate-50 p-2 border-l-4 border-[#4a9eff]">Number of RSUs = RSUs Budget ÷ Current Share Price</div>
                   <div className="bg-slate-50 p-2 border-l-4 border-green-500">Target Price = Current Price × (1 + Appreciation %)</div>
                 </div>
               )}
            </div>

          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 flex items-center gap-4 border-b border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
            <h2 className="text-xl font-semibold text-slate-800">Vesting Schedule Analysis</h2>
          </div>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
              <h4 className="font-semibold text-slate-800 text-lg">Configure Vesting Schedule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Vesting Start Date</Label>
                  <Input type="date" value={vestingStartDate} onChange={(e) => setVestingStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Total Vesting Period (Years)</Label>
                  <Input type="number" step="0.5" min="1" max="10" value={vestingPeriod} onChange={(e) => setVestingPeriod(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Cliff Period (Years)</Label>
                  <Input type="number" step="0.25" min="0" max="5" value={cliffPeriod} onChange={(e) => setCliffPeriod(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Vesting Frequency</Label>
                  <Select value={vestingFrequency} onValueChange={(val) => setVestingFrequency(val || "annual")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#0a5264]">Options Vesting</h3>
                <VestingTable data={optionsVestingData} page={optionsPage} setPage={setOptionsPage} />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#4a9eff]">RSUs Vesting</h3>
                <VestingTable data={rsusVestingData} page={rsusPage} setPage={setRsusPage} />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 flex items-center gap-4 border-b border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
            <h2 className="text-xl font-semibold text-slate-800">Departure Planning</h2>
          </div>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
               <div>
                 <h4 className="font-semibold text-slate-800">Employment Status Planning</h4>
                 <p className="text-sm text-slate-500">Toggle to analyze the impact of leaving the organization</p>
               </div>
               <div className="flex items-center gap-3">
                 <Label className="text-base font-medium cursor-pointer">Are you planning to leave?</Label>
                 <Switch checked={planningToLeave} onCheckedChange={setPlanningToLeave} />
               </div>
            </div>

            {planningToLeave && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                <div className="max-w-xs space-y-2">
                  <Label>Expected Departure Date</Label>
                  <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Impact Analysis</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-[#34C759] mb-1">{formatNumber(optionsDepartureTotals.retained)}</div>
                        <div className="text-sm text-slate-500 font-medium">Options Retained</div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-[#34C759] mb-1">{formatNumber(rsusDepartureTotals.retained)}</div>
                        <div className="text-sm text-slate-500 font-medium">RSUs Retained</div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-[#ff3b30] mb-1">{formatNumber(optionsDepartureTotals.forfeited)}</div>
                        <div className="text-sm text-slate-500 font-medium">Options Forfeited</div>
                     </div>
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-bold text-[#ff3b30] mb-1">{formatNumber(rsusDepartureTotals.forfeited)}</div>
                        <div className="text-sm text-slate-500 font-medium">RSUs Forfeited</div>
                     </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#0a5264]">Options Vesting (With Departure)</h3>
                    <VestingTable data={optionsDepartureData} page={1} setPage={()=>{}} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#4a9eff]">RSUs Vesting (With Departure)</h3>
                    <VestingTable data={rsusDepartureData} page={1} setPage={()=>{}} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 5 */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 flex items-center gap-4 border-b border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">5</div>
            <h2 className="text-xl font-semibold text-slate-800">Breakpoint Analysis</h2>
          </div>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="text-center p-8 bg-[#f8f9fa] rounded-xl border border-slate-200">
               <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">
                 {breakpoint ? formatCurrency(breakpoint) : 'N/A'}
               </div>
               <div className="text-lg font-medium text-slate-600 mb-4 tracking-wide uppercase">Breakpoint Share Price</div>
               <p className="text-slate-500 max-w-2xl mx-auto">At this price, Options and RSUs provide equal net value after taxes. Above this price, Options are generally better. Below this price, RSUs are generally better.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Return on Investment Analysis</h3>
              <div className="h-[400px] w-full border border-slate-200 rounded-xl p-4 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="price" 
                      tickFormatter={(val) => '$' + val}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      tickFormatter={(val) => val + '%'}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                      tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip content={<CustomROITooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    
                    <Line type="monotone" dataKey="optionsROI" name="Options ROI" stroke="#0a5264" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="rsusROI" name="RSUs ROI" stroke="#4a9eff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    
                    {breakpoint && breakpoint > Math.max(1, Math.min(currentSharePrice, strikePrice) * 0.5) && breakpoint < Math.max(currentSharePrice, strikePrice, targetPrice) * 1.5 && (
                      <ReferenceDot 
                        x={breakpoint} 
                        y={chartData.find((d: any) => Math.abs(d.price - breakpoint) < 5)?.optionsROI || 0} 
                        r={8} 
                        fill="#FF3B30" 
                        stroke="white" 
                        strokeWidth={3} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Net Value Comparison Over Share Price Range</h3>
              <div className="h-[400px] w-full border border-slate-200 rounded-xl p-4 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="price" 
                      tickFormatter={(val) => '$' + val}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      tickFormatter={(val) => '$' + (val / 1000) + 'k'}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                      tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip content={<CustomValueTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    
                    <Line type="monotone" dataKey="optionsNetValue" name="Options Net Value" stroke="#0a5264" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="rsusNetValue" name="RSUs Net Value" stroke="#4a9eff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {planningToLeave && (
              <div className="space-y-4 bg-slate-50 p-6 md:p-8 rounded-xl border border-slate-200 mt-8">
                 <h4 className="text-lg font-bold">Scenario Comparison</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border-2 border-[#34C759] rounded-xl p-6">
                      <h5 className="text-[#34C759] font-semibold text-center mb-6">Normal Vesting Scenario</h5>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                           <div className="text-2xl font-bold text-[#0a5264]">{formatCurrency(optionsTargetVal.netValue)}</div>
                           <div className="text-xs text-slate-500 uppercase mt-1">Options Value</div>
                        </div>
                        <div>
                           <div className="text-2xl font-bold text-[#4a9eff]">{formatCurrency(rsusTargetVal.netValue)}</div>
                           <div className="text-xs text-slate-500 uppercase mt-1">RSUs Value</div>
                        </div>
                        <div className="col-span-2 mt-4 pt-4 border-t border-slate-100">
                           <div className="text-3xl font-bold text-[#34C759]">{formatCurrency(normalTotal)}</div>
                           <div className="text-xs text-slate-500 uppercase mt-1">Total Value</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border-2 border-[#ff3b30] rounded-xl p-6">
                      <h5 className="text-[#ff3b30] font-semibold text-center mb-6">With Departure Scenario</h5>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                           <div className="text-2xl font-bold text-[#0a5264]">{formatCurrency(departureOptionsVal)}</div>
                           <div className="text-xs text-slate-500 uppercase mt-1">Options Value</div>
                        </div>
                        <div>
                           <div className="text-2xl font-bold text-[#4a9eff]">{formatCurrency(departureRsusVal)}</div>
                           <div className="text-xs text-slate-500 uppercase mt-1">RSUs Value</div>
                        </div>
                        <div className="col-span-2 mt-4 pt-4 border-t border-slate-100">
                           <div className="text-3xl font-bold text-[#ff3b30]">{formatCurrency(departureTotal)}</div>
                           <div className="text-xs text-slate-500 uppercase mt-1">Total Value</div>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="bg-[#fff3cd] border text-center border-[#ffe69c] p-6 rounded-xl text-[#664d03]">
                    <h5 className="font-semibold mb-2 text-lg">Impact of Early Departure</h5>
                    <div className="text-4xl font-bold text-[#dc3545] mb-2">-{formatCurrency(valueLoss)}</div>
                    <div className="text-[#856404] font-medium">{valueLossPercent.toFixed(1)}% value loss</div>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-[#0a5264] text-xl font-bold mb-1">{formatCurrency(optionsTargetVal.netValue)}</div>
                  <div className="text-xs font-semibold text-slate-500">Options Value at Target</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-[#4a9eff] text-xl font-bold mb-1">{formatCurrency(rsusTargetVal.netValue)}</div>
                  <div className="text-xs font-semibold text-slate-500">RSUs Value at Target</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className={`text-xl font-bold mb-1 ${betterChoice === 'Options' ? 'text-[#0a5264]' : 'text-[#4a9eff]'}`}>{betterChoice}</div>
                  <div className="text-xs font-semibold text-slate-500">Better Choice</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="text-[#FF3B30] text-xl font-bold mb-1">{formatCurrency(totalTaxes)}</div>
                  <div className="text-xs font-semibold text-slate-500">Total Tax Impact</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                  <div className="text-[#0a5264] text-xl font-bold mb-1">{formatCurrency(totalGainsDelivered)}</div>
                  <div className="text-xs font-semibold text-slate-500">Total Gains Delivered</div>
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
