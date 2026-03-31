"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { Briefcase, Landmark, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";

interface Grant {
  date: string;
  type: "Stock Options" | "RSUs" | "Share Grants";
  granted: number;
  vested: number;
  delivered: number;
  active: boolean;
}

const STC_RATE = 0.20; // 20% of delivered sold to cover
const WTC_RATE = 0.10; // 10% of delivered withheld to cover

const INITIAL_GRANTS: Grant[] = [
  { date: '2021-03', type: 'Stock Options', granted: 3000, vested: 2200, delivered: 2000, active: true },
  { date: '2022-07', type: 'RSUs',          granted: 2500, vested: 1500, delivered: 1400, active: true },
  { date: '2023-02', type: 'RSUs',          granted: 1200, vested:  600, delivered:  400, active: true },
  { date: '2020-10', type: 'Share Grants',  granted: 1500, vested: 1500, delivered: 1500, active: false },
  { date: '2019-06', type: 'Stock Options', granted: 1000, vested: 1000, delivered:  800, active: false }
];

export default function GrantLifecycleCalculatorPage() {
  const [grants, setGrants] = useState<Grant[]>(INITIAL_GRANTS);
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [sharePrice, setSharePrice] = useState<number>(50);

  const filteredGrants = useMemo(() => {
    return filter === "active" ? grants.filter(g => g.active) : grants;
  }, [grants, filter]);

  const totalsByType = useMemo(() => {
    const agg: Record<string, { granted: number; vested: number; delivered: number }> = {};
    filteredGrants.forEach(g => {
      if (!agg[g.type]) agg[g.type] = { granted: 0, vested: 0, delivered: 0 };
      agg[g.type].granted += g.granted;
      agg[g.type].vested += g.vested;
      agg[g.type].delivered += g.delivered;
    });
    return agg;
  }, [filteredGrants]);

  const totalDeliveredValue = useMemo(() => {
    return filteredGrants.reduce((sum, g) => sum + g.delivered * sharePrice, 0);
  }, [filteredGrants, sharePrice]);

  const chartData = useMemo(() => {
    const years = filteredGrants.map(g => parseInt(g.date.split('-')[0], 10));
    if (years.length === 0) return [];
    
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years, new Date().getFullYear() + 2);
    
    let cumVested = 0;
    let cumDelivered = 0;
    
    const data = [];
    for (let y = minYear; y <= maxYear; y++) {
      let yrVested = 0;
      let yrDelivered = 0;
      let yrGranted = 0;
      
      filteredGrants.forEach(g => {
        const gYear = parseInt(g.date.split('-')[0], 10);
        if (gYear === y) {
          yrGranted += g.granted;
          yrVested += g.vested;
          yrDelivered += g.delivered;
        }
      });
      
      cumVested += yrVested;
      cumDelivered += yrDelivered;
      
      data.push({
        year: y.toString(),
        vested: cumVested * sharePrice,
        delivered: cumDelivered * sharePrice,
        isFuture: y > new Date().getFullYear()
      });
    }
    return data;
  }, [filteredGrants, sharePrice]);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const toggleRow = (type: string) => {
    setExpandedRows(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md flex items-center justify-center shrink-0">
             <Briefcase className="text-white w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Portfolio Timeline</h1>
            <p className="text-slate-500 text-sm md:text-base">Track and analyze your multi-grant equity portfolio over time, including vesting, deliveries, and tax-cover modeling.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 border border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <Label>Filter Grants</Label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setFilter('all')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      All Grants
                    </button>
                    <button 
                      onClick={() => setFilter('active')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Active Only
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharePrice">Modeled Share Price ($)</Label>
                  <Input 
                    id="sharePrice"
                    type="number"
                    value={sharePrice}
                    onChange={(e) => setSharePrice(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#0a5264] to-[#084552] border-0 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <CardContent className="p-8 h-full flex flex-col justify-center">
              <div className="text-emerald-100 font-medium tracking-wide uppercase text-sm mb-2">Total Value Delivered</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight">{formatCurrency(totalDeliveredValue)}</div>
              <div className="mt-4 text-emerald-100/70 text-sm">
                Based on a share price of ${sharePrice.toFixed(2)} across {filteredGrants.length} grants.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Table */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-white/50 pb-4">
            <CardTitle className="text-xl text-slate-800">Grant Breakdown by Type</CardTitle>
            <CardDescription className="text-slate-500">A detailed breakdown of your equity tranches, including Sell-to-Cover (STC) and Withhold-to-Cover (WTC) modeling projections.</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-4 w-10"></th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Granted</th>
                  <th className="px-4 py-4 text-right">Vested</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-right">STC Units</th>
                  <th className="px-4 py-4 text-right">STC Value</th>
                  <th className="px-4 py-4 text-right">WTC Units</th>
                  <th className="px-4 py-4 text-right">WTC Value</th>
                  <th className="px-4 py-4 text-right text-[#0a5264]">Delivered Units</th>
                  <th className="px-4 py-4 text-right text-[#0a5264]">Delivered Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {Object.keys(totalsByType).map(type => {
                  const t = totalsByType[type];
                  const typeGrants = filteredGrants.filter(g => g.type === type);
                  const isExpanded = expandedRows[type];

                  const gStcUnits = t.delivered * STC_RATE;
                  const gStcValue = gStcUnits * sharePrice;
                  const gWtcUnits = t.delivered * WTC_RATE;
                  const gWtcValue = gWtcUnits * sharePrice;
                  const gDelivValue = t.delivered * sharePrice;

                  return (
                    <React.Fragment key={type}>
                      <tr className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => toggleRow(type)}>
                        <td className="px-5 py-4 text-slate-400 group-hover:text-slate-600">
                          {isExpanded ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-800">{type}</td>
                        <td className="px-4 py-4 text-right font-medium">{t.granted.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-emerald-600 font-medium">{t.vested.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center"><Badge variant="outline" className="bg-slate-100">{typeGrants.length} Grants</Badge></td>
                        <td className="px-4 py-4 text-right text-slate-500">{gStcUnits.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                        <td className="px-4 py-4 text-right text-slate-500">{formatCurrency(gStcValue)}</td>
                        <td className="px-4 py-4 text-right text-slate-500">{gWtcUnits.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                        <td className="px-4 py-4 text-right text-slate-500">{formatCurrency(gWtcValue)}</td>
                        <td className="px-4 py-4 text-right font-bold text-[#0a5264]">{t.delivered.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-bold text-[#0a5264]">{formatCurrency(gDelivValue)}</td>
                      </tr>
                      {isExpanded && typeGrants.map((g, idx) => {
                        const stcUnits = g.delivered * STC_RATE;
                        const stcValue = stcUnits * sharePrice;
                        const wtcUnits = g.delivered * WTC_RATE;
                        const wtcValue = wtcUnits * sharePrice;
                        const delivValue = g.delivered * sharePrice;
                        
                        return (
                          <tr key={`${type}-${idx}`} className="bg-slate-50/50 text-slate-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                            <td className="px-5 py-3 border-l-4 border-[#0a5264]/20"></td>
                            <td className="px-4 py-3 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                              Grant {g.date}
                            </td>
                            <td className="px-4 py-3 text-right">{g.granted.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{g.vested.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              {g.active ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium border-emerald-200">Active</Badge> : <Badge variant="outline" className="text-slate-400">Archived</Badge>}
                            </td>
                            <td className="px-4 py-3 text-right text-xs opacity-80">{stcUnits.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                            <td className="px-4 py-3 text-right text-xs opacity-80">{formatCurrency(stcValue)}</td>
                            <td className="px-4 py-3 text-right text-xs opacity-80">{wtcUnits.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                            <td className="px-4 py-3 text-right text-xs opacity-80">{formatCurrency(wtcValue)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-[#0a5264]/80">{g.delivered.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-semibold text-[#0a5264]/80">{formatCurrency(delivValue)}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Portfolio Journey Chart */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="bg-white/50 pb-2">
            <CardTitle className="text-xl text-slate-800">Portfolio Journey (Past • Present • Future)</CardTitle>
            <CardDescription className="text-slate-500">Cumulative delivered and vested value trajectory based on modeled share price.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a5264" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0a5264" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fill: "#64748b", fontSize: 13 }} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(val) => `$${val / 1000}k`} 
                    tick={{ fill: "#64748b", fontSize: 13 }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), undefined]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.98)' }}
                  />
                  
                  {/* Current Year Reference Line */}
                  <ReferenceLine x={new Date().getFullYear().toString()} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 12 }} />

                  <Area 
                    type="monotone" 
                    dataKey="vested" 
                    name="Cumulative Vested"
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVested)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="delivered" 
                    name="Cumulative Delivered"
                    stroke="#0a5264" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorDelivered)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Event Timeline (CSS-based structural representation of lanes) */}
            <div className="mt-8 border-t border-slate-100 pt-8">
               <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Vest & Event Density</h4>
               <div className="space-y-4">
                 {Object.keys(totalsByType).map((type, i) => (
                   <div key={type} className="flex items-center gap-4">
                     <div className="w-32 text-sm font-bold text-slate-700 shrink-0">{type}</div>
                     <div className="flex-1 h-12 border border-dashed border-slate-200 rounded-xl bg-gradient-to-b from-slate-50/50 to-white flex relative items-center px-4 overflow-hidden">
                       
                       {/* Sample Random Timeline Markers for visual effect relative to years */}
                       {Array.from({length: Math.max(3, chartData.length)}).map((_, idx) => {
                         const leftPattern = [10, 25, 45, 60, 75, 85, 95];
                         const intensity = [
                            'bg-[#0a5264] w-2 h-2', 
                            'bg-[#10b981] w-2.5 h-2.5', 
                            'bg-slate-400 w-1.5 h-1.5 shadow-sm'
                         ];
                         
                         const l = leftPattern[(idx + i * 2) % leftPattern.length];
                         const c = intensity[(idx + i) % intensity.length];
                         
                         return (
                           <div 
                             key={idx} 
                             className={`absolute rounded-full ${c}`} 
                             style={{ left: `${l + (Math.random() * 5)}%` }}
                           />
                         );
                       })}

                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="flex justify-center mt-6 gap-6 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></div> Grant Issued</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div> Vested</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#0a5264]"></div> Delivered</div>
               </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
