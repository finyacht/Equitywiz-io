"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, addMonths, startOfMonth } from "date-fns";

type GrantState = {
  units: number;
  grantDate: string;
  vestStart: string;
  cliffMonths: number;
  totalMonths: number;
  frequency: "monthly" | "quarterly" | "yearly" | "immediate";
  strike?: number;
};

export default function GrantLifecycleV1() {
  const [global, setGlobal] = useState({
    priceMode: "growth",
    startPrice: 20,
    annualGrowth: 10,
  });

  const [opt, setOpt] = useState<GrantState>({
    units: 1200, grantDate: new Date().toISOString().split('T')[0], vestStart: new Date().toISOString().split('T')[0],
    cliffMonths: 12, totalMonths: 48, frequency: "monthly", strike: 5
  });

  const [rsu, setRsu] = useState<GrantState>({
    units: 800, grantDate: new Date().toISOString().split('T')[0], vestStart: new Date().toISOString().split('T')[0],
    cliffMonths: 12, totalMonths: 48, frequency: "monthly"
  });

  const [shares, setShares] = useState<GrantState>({
    units: 500, grantDate: new Date().toISOString().split('T')[0], vestStart: new Date().toISOString().split('T')[0],
    cliffMonths: 0, totalMonths: 0, frequency: "immediate"
  });

  const getPriceAtDate = (date: Date) => {
    if (global.priceMode === 'constant') return global.startPrice;
    const today = new Date();
    const yearsDiff = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return global.startPrice * Math.pow(1 + global.annualGrowth / 100, yearsDiff);
  };

  const generateSchedule = (g: GrantState) => {
    if (!g.units || (g.frequency !== 'immediate' && g.totalMonths === 0 && !g.vestStart)) return [];
    if (g.totalMonths === 0 || g.frequency === 'immediate') {
      return [{ date: new Date(g.vestStart || g.grantDate || new Date()), units: g.units }];
    }
    
    let periods = [];
    let d = new Date(g.vestStart);
    let step = g.frequency === 'yearly' ? 12 : g.frequency === 'quarterly' ? 3 : 1;
    let currentMonth = g.cliffMonths;
    
    if (g.cliffMonths > 0) {
      periods.push(addMonths(d, g.cliffMonths));
      currentMonth += step;
    }
    
    while (currentMonth <= g.totalMonths) {
      periods.push(addMonths(d, currentMonth));
      currentMonth += step;
    }
    
    const scale = periods.map(p => {
      const diff = (p.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
      if (Math.abs(diff - g.cliffMonths) < 1) return g.cliffMonths;
      return step;
    });
    
    const totalScale = scale.reduce((a, b) => a + b, 0);
    let remaining = g.units;
    return periods.map((p, i) => {
      const isLast = i === periods.length - 1;
      const amt = isLast ? remaining : Math.round((scale[i] / totalScale) * g.units);
      remaining -= amt;
      return { date: p, units: amt };
    });
  };

  const optSchedule = useMemo(() => generateSchedule(opt), [opt]);
  const rsuSchedule = useMemo(() => generateSchedule(rsu), [rsu]);
  const shrSchedule = useMemo(() => generateSchedule(shares), [shares]);

  const chartData = useMemo(() => {
    const dates = new Set<number>();
    [optSchedule, rsuSchedule, shrSchedule].flat().forEach(r => dates.add(startOfMonth(r.date).getTime()));
    const sortedDates = Array.from(dates).sort((a, b) => a - b).map(t => new Date(t));
    
    if (sortedDates.length === 0) return [];
    
    return sortedDates.map(d => {
      const price = getPriceAtDate(d);
      
      const optVested = optSchedule.filter(r => r.date <= d).reduce((sum, r) => sum + r.units, 0);
      const optVal = Math.max(0, price - (opt.strike || 0)) * optVested;
      
      const rsuVested = rsuSchedule.filter(r => r.date <= d).reduce((sum, r) => sum + r.units, 0);
      const rsuVal = price * rsuVested;
      
      const shrVested = shrSchedule.filter(r => r.date <= d).reduce((sum, r) => sum + r.units, 0);
      const shrVal = price * shrVested;
      
      return {
        date: format(d, 'MMM yyyy'),
        timestamp: d.getTime(),
        Options: optVal,
        RSUs: rsuVal,
        Shares: shrVal,
        Total: optVal + rsuVal + shrVal
      };
    });
  }, [optSchedule, rsuSchedule, shrSchedule, global]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const totals = {
    optVested: optSchedule.reduce((a, b) => a + b.units, 0),
    rsuVested: rsuSchedule.reduce((a, b) => a + b.units, 0),
    shrVested: shrSchedule.reduce((a, b) => a + b.units, 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Quick Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0a5264] text-white border-0 shadow-md">
          <CardContent className="p-5 flex flex-col justify-center">
             <div className="text-emerald-100/80 text-sm font-semibold uppercase tracking-wider mb-1">Total Vested Units</div>
             <div className="text-3xl font-bold">{ (totals.optVested + totals.rsuVested + totals.shrVested).toLocaleString() }</div>
          </CardContent>
        </Card>
        <Card className="bg-white border hover:border-[#0a5264]/30 transition-colors shadow-sm">
           <CardContent className="p-5">
             <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Current FMV Projection</div>
             <div className="text-3xl font-bold text-slate-800">{formatCurrency(getPriceAtDate(new Date()))}</div>
           </CardContent>
        </Card>
        <Card className="bg-white border hover:border-[#0a5264]/30 transition-colors shadow-sm">
           <CardContent className="p-5">
             <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Realizable Value (Today)</div>
             <div className="text-3xl font-bold text-emerald-600">
                { chartData.length > 0 ? formatCurrency(chartData[0].Total) : "$0" }
             </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          {/* Global Assumptions */}
          <Card className="shadow-sm border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-3"><CardTitle className="text-lg text-slate-800">Global Valuation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Price Model</Label>
                <Select value={global.priceMode} onValueChange={(v) => setGlobal({...global, priceMode: v || "growth"})}>
                  <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="constant">Constant Price</SelectItem>
                    <SelectItem value="growth">Annual Growth (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start FMV ($)</Label>
                  <Input type="number" value={global.startPrice} onChange={e => setGlobal({...global, startPrice: Number(e.target.value)})} className="bg-white"/>
                </div>
                <div className="space-y-2">
                  <Label>Annual Growth (%)</Label>
                  <Input type="number" value={global.annualGrowth} disabled={global.priceMode === 'constant'} onChange={e => setGlobal({...global, annualGrowth: Number(e.target.value)})} className="bg-white"/>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Option Inputs */}
          <Card className="shadow-sm border-slate-200 border-l-4 border-l-blue-400">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex justify-between">Options Grant <Badge variant="secondary" className="bg-blue-100 text-blue-700">ISO/NSO</Badge></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Units</Label><Input type="number" value={opt.units} onChange={e=>setOpt({...opt, units: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Strike Price</Label><Input type="number" value={opt.strike} onChange={e=>setOpt({...opt, strike: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Total Months</Label><Input type="number" value={opt.totalMonths} onChange={e=>setOpt({...opt, totalMonths: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Cliff Months</Label><Input type="number" value={opt.cliffMonths} onChange={e=>setOpt({...opt, cliffMonths: Number(e.target.value)})} /></div>
              </div>
            </CardContent>
          </Card>
          
          {/* RSU Inputs */}
          <Card className="shadow-sm border-slate-200 border-l-4 border-l-emerald-400">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex justify-between">RSU Grant <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Time-based</Badge></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Units</Label><Input type="number" value={rsu.units} onChange={e=>setRsu({...rsu, units: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Frequency</Label>
                  <Select value={rsu.frequency} onValueChange={(v: string | null) => setRsu({...rsu, frequency: (v as any) || "monthly"})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Total Months</Label><Input type="number" value={rsu.totalMonths} onChange={e=>setRsu({...rsu, totalMonths: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Cliff Months</Label><Input type="number" value={rsu.cliffMonths} onChange={e=>setRsu({...rsu, cliffMonths: Number(e.target.value)})} /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">Portfolio Value Projection (V1)</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 13 }} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: "#64748b", fontSize: 13 }} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="Options" stackId="1" stroke="#3b82f6" fillOpacity={0.5} fill="#3b82f6" />
                    <Area type="monotone" dataKey="RSUs" stackId="1" stroke="#10b981" fillOpacity={0.5} fill="#10b981" />
                    <Area type="monotone" dataKey="Shares" stackId="1" stroke="#8b5cf6" fillOpacity={0.5} fill="#8b5cf6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardHeader><CardTitle className="text-lg">Generated Vesting Schedule (Aggregated)</CardTitle></CardHeader>
            <CardContent>
               <div className="max-h-64 overflow-y-auto">
                 <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 sticky top-0 text-slate-600 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right text-blue-600">Options Vested</th>
                      <th className="px-4 py-3 text-right text-emerald-600">RSUs Vested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.from(new Set([...optSchedule.map(s=>s.date.toISOString()), ...rsuSchedule.map(s=>s.date.toISOString())]))
                      .sort()
                      .map((dateStr, i) => {
                         const d = new Date(dateStr);
                         const oVested = optSchedule.find(s => s.date.getTime() === d.getTime())?.units || 0;
                         const rVested = rsuSchedule.find(s => s.date.getTime() === d.getTime())?.units || 0;
                         return (
                           <tr key={i} className="hover:bg-slate-50">
                             <td className="px-4 py-3">{format(d, 'MMM dd, yyyy')}</td>
                             <td className="px-4 py-3 text-right font-medium text-slate-700">{oVested}</td>
                             <td className="px-4 py-3 text-right font-medium text-slate-700">{rVested}</td>
                           </tr>
                         )
                      })}
                  </tbody>
                </table>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
