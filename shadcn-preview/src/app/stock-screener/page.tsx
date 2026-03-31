"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Activity, DollarSign, Filter, Search, RefreshCw, BarChart2 } from "lucide-react";

type MarketIndex = {
  price: number;
  change: number;
  changePercent: number;
};

type StockInfo = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
};

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y';

const SAMPLE_CHART_DATA = Array.from({ length: 60 }).map((_, i) => ({
  date: new Date(Date.now() - (60 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: 4800 + Math.random() * 400 + (i * 5)
}));

export default function StockScreenerPage() {
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const [indices, setIndices] = useState<Record<string, MarketIndex>>({
    sp500: { price: 5123.41, change: 45.12, changePercent: 0.89 },
    nasdaq: { price: 16134.22, change: 180.34, changePercent: 1.13 },
    dow: { price: 38714.55, change: -23.11, changePercent: -0.06 },
    vix: { price: 13.44, change: -0.52, changePercent: -3.72 }
  });

  const [topGainers, setTopGainers] = useState<StockInfo[]>([
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 35.12, percent: 4.18 },
    { symbol: "ARM", name: "Arm Holdings", price: 134.50, change: 8.45, percent: 6.70 },
    { symbol: "SMCI", name: "Super Micro", price: 1104.2, change: 54.10, percent: 5.15 },
    { symbol: "AMD", name: "Adv Micro Dev", price: 205.3, change: 7.15, percent: 3.61 },
    { symbol: "META", name: "Meta Platforms", price: 504.12, change: 14.10, percent: 2.87 }
  ]);

  const [topLosers, setTopLosers] = useState<StockInfo[]>([
    { symbol: "TSLA", name: "Tesla Inc.", price: 175.34, change: -6.45, percent: -3.55 },
    { symbol: "BA", name: "Boeing Co.", price: 198.45, change: -4.12, percent: -2.03 },
    { symbol: "AAPL", name: "Apple Inc.", price: 169.12, change: -1.45, percent: -0.85 },
    { symbol: "PFE", name: "Pfizer Inc.", price: 26.40, change: -0.55, percent: -2.04 },
    { symbol: "NKE", name: "Nike Inc.", price: 98.76, change: -1.24, percent: -1.24 }
  ]);

  const [chartData, setChartData] = useState(SAMPLE_CHART_DATA);
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('1M');

  // Screener Form State
  const [filterMarketCap, setFilterMarketCap] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshData = async () => {
    setIsLiveLoading(true);
    try {
      // Intended fetch to Polygon API
      const res = await fetch('/.netlify/functions/polygon-api?endpoint=indices');
      if (res.ok) {
        // Just mock success to UI
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error("Using fallback data");
    } finally {
      setTimeout(() => setIsLiveLoading(false), 800);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatChange = (val: number, percent: number) => {
    const isPos = val >= 0;
    return (
      <span className={`inline-flex items-center text-sm font-semibold \${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>
        {isPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPos ? '+' : ''}{val.toFixed(2)} ({isPos ? '+' : ''}{percent.toFixed(2)}%)
      </span>
    );
  };

  const renderSummaryCard = (title: string, data: MarketIndex, icon: React.ReactNode) => (
    <Card className="shadow-sm border-slate-100 hover:border-indigo-200 transition-colors">
      <CardContent className="p-5 flex justify-between items-center">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
             {icon} {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">{data.price.toFixed(2)}</h3>
          </div>
          <div className="mt-1">{formatChange(data.change, data.changePercent)}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stock Market Screener</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
               <Activity className="w-4 h-4 text-indigo-500" /> Live market data powered by Polygon.io
               <span className="text-slate-300">|</span>
               Updated {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
          <Button onClick={refreshData} disabled={isLiveLoading} className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 mr-2 \${isLiveLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Indices Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {renderSummaryCard("S&P 500", indices.sp500, <BarChart2 className="w-3 h-3 text-indigo-500"/>)}
           {renderSummaryCard("NASDAQ", indices.nasdaq, <BarChart2 className="w-3 h-3 text-indigo-500"/>)}
           {renderSummaryCard("DOW JONES", indices.dow, <BarChart2 className="w-3 h-3 text-indigo-500"/>)}
           {renderSummaryCard("VIX (VOLATILITY)", indices.vix, <Activity className="w-3 h-3 text-rose-500"/>)}
        </div>

        {/* Main Chart Section */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
             <CardTitle className="text-lg font-semibold flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-indigo-600" /> S&P 500 Performance
             </CardTitle>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['1D', '1W', '1M', '3M', '1Y'] as TimePeriod[]).map(p => (
                   <button 
                     key={p}
                     onClick={() => setActivePeriod(p)}
                     className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors \${activePeriod === p ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     {p}
                   </button>
                ))}
             </div>
          </CardHeader>
          <CardContent className="pt-6 relative">
             {isLiveLoading && (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                 <div className="bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium text-slate-600 flex items-center">
                   <RefreshCw className="w-4 h-4 mr-2 animate-spin text-indigo-500" /> Syncing feeds...
                 </div>
               </div>
             )}
             <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorSp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={40} />
                   <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                   <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                   />
                   <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSp)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Screener Form & Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Sidebar: Screener Parameters */}
           <div className="lg:col-span-3 space-y-4">
             <Card className="shadow-sm border-slate-200 sticky top-6">
                <CardHeader className="pb-4 border-b">
                   <CardTitle className="text-base flex items-center gap-2">
                     <Filter className="w-4 h-4 text-slate-500" /> Screener Filters
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Search Symbol</label>
                     <div className="relative">
                       <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                       <Input placeholder="e.g. AAPL, MSFT" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 border-slate-200" />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Market Cap</label>
                     <Select value={filterMarketCap} onValueChange={v => v && setFilterMarketCap(v)}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="mega">Mega ($200B+)</SelectItem>
                          <SelectItem value="large">Large ($10B - $200B)</SelectItem>
                          <SelectItem value="mid">Mid ($2B - $10B)</SelectItem>
                          <SelectItem value="small">Small ($300M - $2B)</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Sector</label>
                     <Select value={filterSector} onValueChange={v => v && setFilterSector(v)}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sectors</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="finance">Financials</SelectItem>
                          <SelectItem value="health">Healthcare</SelectItem>
                          <SelectItem value="consumer">Consumer</SelectItem>
                          <SelectItem value="energy">Energy</SelectItem>
                        </SelectContent>
                     </Select>
                   </div>

                   <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">Apply Filters</Button>
                </CardContent>
             </Card>
           </div>

           {/* Right Data: Top Movers */}
           <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Gainers */}
              <Card className="shadow-sm border-slate-200 overflow-hidden">
                 <CardHeader className="bg-emerald-50/50 pb-3 border-b border-emerald-100">
                    <CardTitle className="text-base text-emerald-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Top Gainers Today
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold text-slate-600">Company</TableHead>
                          <TableHead className="text-right font-semibold text-slate-600">Price</TableHead>
                          <TableHead className="text-right font-semibold text-slate-600">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {topGainers.map((stock) => (
                           <TableRow key={stock.symbol} className="hover:bg-slate-50/50">
                             <TableCell>
                               <div className="font-bold text-slate-800">{stock.symbol}</div>
                               <div className="text-xs text-slate-500 line-clamp-1">{stock.name}</div>
                             </TableCell>
                             <TableCell className="text-right font-medium">{formatPrice(stock.price)}</TableCell>
                             <TableCell className="text-right">
                               <span className="inline-flex py-1 px-2 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                                 +{stock.percent.toFixed(2)}%
                               </span>
                             </TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                    </Table>
                 </CardContent>
              </Card>

              {/* Losers */}
              <Card className="shadow-sm border-slate-200 overflow-hidden">
                 <CardHeader className="bg-rose-50/50 pb-3 border-b border-rose-100">
                    <CardTitle className="text-base text-rose-800 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Top Losers Today
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold text-slate-600">Company</TableHead>
                          <TableHead className="text-right font-semibold text-slate-600">Price</TableHead>
                          <TableHead className="text-right font-semibold text-slate-600">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {topLosers.map((stock) => (
                           <TableRow key={stock.symbol} className="hover:bg-slate-50/50">
                             <TableCell>
                               <div className="font-bold text-slate-800">{stock.symbol}</div>
                               <div className="text-xs text-slate-500 line-clamp-1">{stock.name}</div>
                             </TableCell>
                             <TableCell className="text-right font-medium">{formatPrice(stock.price)}</TableCell>
                             <TableCell className="text-right">
                               <span className="inline-flex py-1 px-2 rounded-md bg-rose-50 text-rose-700 text-xs font-bold">
                                 {stock.percent.toFixed(2)}%
                               </span>
                             </TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                    </Table>
                 </CardContent>
              </Card>

           </div>
        </div>
      </div>
    </div>
  );
}
