"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Download, Bot, BarChart4, Activity, ArrowRightLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import {
  ShareClass,
  Transaction,
  SummaryData,
  WaterfallStep,
  TransactionSummary,
  calculateDetailedWaterfall,
  calculateSummaryWaterfall,
  calculateTransactionSummary,
  exportToExcel
} from "./waterfall-math";

const DEFAULT_SHARE_CLASSES: ShareClass[] = [
  { id: 1, name: "Series A", type: "preferred", seniority: 1, liquidationPref: 1, prefType: "participating", cap: null },
  { id: 2, name: "Series B", type: "preferred", seniority: 2, liquidationPref: 1.5, prefType: "participating", cap: 3 },
  { id: 3, name: "Series C", type: "common", seniority: 3, liquidationPref: 1, prefType: "non-participating", cap: null }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 1, shareClass: "Series A", shares: 1000000, investment: 1000000, stakeholder: "Venture Capital Fund LP" },
  { id: 2, shareClass: "Series B", shares: 2000000, investment: 2000000, stakeholder: "Growth Equity Partners" },
  { id: 3, shareClass: "Series C", shares: 750000, investment: 0, stakeholder: "John Smith (Founder)" },
  { id: 4, shareClass: "Series C", shares: 200000, investment: 0, stakeholder: "Jane Doe (Employee)" },
  { id: 5, shareClass: "Series C", shares: 300000, investment: 0, stakeholder: "Mike Johnson (CTO)" }
];

export default function WaterfallAnalysisPage() {
  const [shareClasses, setShareClasses] = useState<ShareClass[]>([...DEFAULT_SHARE_CLASSES]);
  const [transactions, setTransactions] = useState<Transaction[]>([...DEFAULT_TRANSACTIONS]);
  const [exitAmount, setExitAmount] = useState<number>(10000000);
  const [distributionMethod, setDistributionMethod] = useState<"standard" | "residual">("standard");
  const [summaryView, setSummaryView] = useState<"shareClass" | "transaction">("shareClass");
  
  const [waterfallSteps, setWaterfallSteps] = useState<WaterfallStep[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary[]>([]);
  const [exitSensitivityData, setExitSensitivityData] = useState<any[]>([]);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

  const sankeyRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    updateCalculations();
  }, [shareClasses, transactions, exitAmount, distributionMethod]);

  const updateCalculations = () => {
    const steps = calculateDetailedWaterfall(exitAmount, shareClasses, transactions, distributionMethod);
    const summary = calculateSummaryWaterfall(steps, exitAmount);
    const txSummary = calculateTransactionSummary(summary, transactions, exitAmount);
    
    setWaterfallSteps(steps);
    setSummaryData(summary);
    setTransactionSummary(txSummary);

    // Calculate Exit Value Sensitivity
    const maxExit = exitAmount * 2;
    const numPoints = 20;
    const exitValues = Array.from({length: numPoints + 1}, (_, i) => (maxExit * i) / numPoints);
    
    const activeShareClasses = Array.from(new Set(
      shareClasses
          .filter(sc => transactions.some(tx => tx.shareClass === sc.name))
          .map(sc => sc.name)
    ));

    const sensitivityData = exitValues.map(val => {
      const tempSteps = calculateDetailedWaterfall(val, shareClasses, transactions, distributionMethod);
      const tempSummary = calculateSummaryWaterfall(tempSteps, val);
      
      const point: any = { exitValue: val };
      activeShareClasses.forEach(className => {
        const shareData = tempSummary.find(d => d.name === className);
        point[className] = shareData ? shareData.payout : 0;
      });
      return point;
    });

    setExitSensitivityData(sensitivityData);
  };

  useEffect(() => {
    if (summaryData.length > 0 && sankeyRef.current) {
      drawSankey();
    }
  }, [summaryData, waterfallSteps]);

  const handleExport = () => {
    exportToExcel(summaryData, transactionSummary, waterfallSteps, transactions, shareClasses, exitAmount);
  };

  const handleAIAnalysis = async () => {
    setShowAiModal(true);
    setAiAnalyzing(true);
    setAiResponse("");

    try {
      const aggregates: any = {};
      transactions.forEach(tx => {
        const cls = tx.shareClass;
        if (!aggregates[cls]) aggregates[cls] = { investment: 0, shares: 0 };
        aggregates[cls].investment += tx.investment;
        aggregates[cls].shares += tx.shares;
      });
      const totalShares = Object.values(aggregates).reduce((sum: number, v: any) => sum + v.shares, 0) as number;

      let contextText = `Analyze this waterfall distribution for a $${exitAmount.toLocaleString()} exit:\n\nSHARE CLASSES:\n`;
      shareClasses.forEach(sc => {
        const agg = aggregates[sc.name] || { shares: 0, investment: 0 };
        const ownership = totalShares > 0 ? ((agg.shares / totalShares) * 100).toFixed(2) : 0;
        contextText += `- ${sc.name}: ${sc.type}, ${ownership}% ownership, $${(agg.investment || 0).toLocaleString()} investment`;
        if (sc.type === 'preferred') {
            contextText += `, ${sc.liquidationPref}x LP, ${sc.prefType}`;
            if (sc.cap) contextText += `, ${sc.cap}x cap`;
        }
        contextText += "\n";
      });

      contextText += "\nWATERFALL DISTRIBUTION STEPS:\n";
      waterfallSteps.forEach((step, i) => {
          if (i === 0) {
              contextText += `- Total Exit Proceeds: $${step.value.toLocaleString()}\n`;
          } else {
              const amount = Math.abs(step.value);
              contextText += `- ${step.name}: $${amount.toLocaleString()}\n`;
          }
      });

      contextText += "\nFINAL DISTRIBUTION SUMMARY:\n";
      summaryData.forEach(entry => {
          const agg = aggregates[entry.name] || { investment: 0 };
          const roi = agg.investment > 0 ? ((entry.payout / agg.investment) * 100).toFixed(1) : 'N/A';
          contextText += `- ${entry.name}: $${entry.payout.toLocaleString()} (${entry.percentage}%), ROI: ${roi}%\n`;
      });

      const prompt = `You are a financial expert specializing in venture capital and startup equity. Please analyze the following waterfall distribution and explain:
1. **Step-by-step breakdown**: Walk through each step of the distribution process, explaining why each amount was calculated that way.
2. **Key observations**: What are the important insights about this distribution? Who benefits most? Are there any caps that affected the outcome?
3. **Investor returns**: Analyze the returns for each share class relative to their investment.
4. **Simple explanation**: Provide a brief "plain English" summary that a non-expert could understand.

Please be specific with the actual numbers from this scenario. Use clear formatting with bullet points and headers.

${contextText}`;

      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const data = await res.json();
      setAiResponse(data.response || data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis.');
    } catch (error: any) {
      setAiResponse(`Error analyzing waterfall: ${error.message}`);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const drawSankey = () => {
    // simplified d3 sankey mapping for React
    const container = sankeyRef.current?.parentElement;
    if (!container || !sankeyRef.current) return;
    
    d3.select(sankeyRef.current).selectAll("*").remove();
    
    const width = container.clientWidth;
    const height = 400;
    
    const svg = d3.select(sankeyRef.current)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height)
        .style("font-family", "system-ui, sans-serif");

    // Build Sankey Nodes and Links dynamically from transactions and summary
    const nodes: any[] = [];
    const links: any[] = [];
    let nodeIndex = 0;

    nodes.push({ name: "Exit Amount", id: nodeIndex++ });
    const exitNodeId = 0;

    const shareClassNodes: Record<string, number> = {};
    shareClasses.forEach(sc => {
      shareClassNodes[sc.name] = nodeIndex;
      nodes.push({ name: sc.name, id: nodeIndex++ });
    });

    const txNodes: Record<number, number> = {};
    transactions.forEach(tx => {
      txNodes[tx.id] = nodeIndex;
      const shName = tx.stakeholder ? tx.stakeholder.split(' ')[0] : 'Unknown';
      nodes.push({ name: shName, id: nodeIndex++ });
    });

    // Links: Exit -> Share Classes
    shareClasses.forEach(sc => {
      const summary = summaryData.find(s => s.name === sc.name);
      if (summary && summary.payout > 0) {
        links.push({ source: exitNodeId, target: shareClassNodes[sc.name], value: Math.max(1, summary.payout) });
      }
    });

    // Links: Share Classes -> Transactions
    transactions.forEach(tx => {
      const summary = transactionSummary.find(ts => ts.id === tx.id);
      if (summary && summary.payout > 0) {
        links.push({ source: shareClassNodes[tx.shareClass], target: txNodes[tx.id], value: Math.max(1, summary.payout) });
      }
    });

    if (links.length === 0) return;

    try {
      const sankeyGen = sankey()
        .nodeWidth(15)
        .nodePadding(15)
        .extent([[10, 10], [width - 10, height - 20]]);

      const { nodes: graphNodes, links: graphLinks } = sankeyGen({
        nodes: nodes.map(d => Object.assign({}, d)),
        links: links.map(d => Object.assign({}, d))
      });

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.4)
        .selectAll("g")
        .data(graphLinks)
        .join("g")
        .style("mix-blend-mode", "multiply");

      link.append("path")
        .attr("d", sankeyLinkHorizontal() as any)
        .attr("stroke", (d: any) => color(String(Math.max(0, d.source.index))))
        .attr("stroke-width", (d: any) => Math.max(1, d.width));

      const node = svg.append("g")
        .selectAll("rect")
        .data(graphNodes)
        .join("rect")
        .attr("x", (d: any) => d.x0)
        .attr("y", (d: any) => d.y0)
        .attr("height", (d: any) => d.y1 - d.y0)
        .attr("width", (d: any) => d.x1 - d.x0)
        .attr("fill", (d: any) => color(String(Math.max(0, d.index))))
        .attr("stroke", "#000");

      svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(graphNodes)
        .join("text")
        .attr("x", (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", (d: any) => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "start" : "end")
        .text((d: any) => d.name);
    } catch (e) {
      console.error("D3 Sankey render error:", e);
    }
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const addShareClass = () => {
    const newId = shareClasses.length > 0 ? Math.max(...shareClasses.map(sc => sc.id)) + 1 : 1;
    setShareClasses([...shareClasses, {
      id: newId, name: `New Class ${newId}`, type: "preferred", seniority: 1, liquidationPref: 1, prefType: "participating", cap: null
    }]);
  };

  const addTransaction = () => {
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    setTransactions([...transactions, {
      id: newId, shareClass: shareClasses[0]?.name || "", shares: 0, investment: 0, stakeholder: "New Stakeholder"
    }]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md flex items-center justify-center shrink-0">
               <ArrowRightLeft className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Waterfall Analysis Tool</h1>
              <p className="text-slate-500 text-sm md:text-base">Advanced exit distribution modeling.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 w-full md:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Exit Amount ($)</label>
              <Input 
                type="number" 
                value={exitAmount === 0 ? "" : exitAmount} 
                onChange={(e) => setExitAmount(Number(e.target.value) || 0)} 
                className="w-36 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Method</label>
              <Select value={distributionMethod} onValueChange={(v: "standard"|"residual"|null) => { if(v) setDistributionMethod(v); }}>
                <SelectTrigger className="w-40 font-semibold"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="residual">Residual Common</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Share Classes */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Share Classes</CardTitle>
              <Button size="sm" variant="outline" onClick={addShareClass}><Plus className="w-4 h-4 mr-1"/> Add</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Seniority</th>
                      <th className="px-4 py-3 font-medium">Liquidation Pref</th>
                      <th className="px-4 py-3 font-medium">Participating</th>
                      <th className="px-4 py-3 font-medium">Cap (x)</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shareClasses.map((sc, i) => (
                      <tr key={sc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <Input className="h-8 w-28" value={sc.name} onChange={(e) => {
                            const newSc = [...shareClasses];
                            newSc[i].name = e.target.value;
                            setShareClasses(newSc);
                          }}/>
                        </td>
                        <td className="px-4 py-2">
                          <Select value={sc.type} onValueChange={(v: "preferred"|"common"|null) => {
                            if (!v) return;
                            const newSc = [...shareClasses];
                            newSc[i].type = v;
                            setShareClasses(newSc);
                          }}>
                            <SelectTrigger className="h-8 w-28"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="preferred">Preferred</SelectItem><SelectItem value="common">Common</SelectItem></SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2"><Input type="number" className="h-8 w-16 text-center" value={sc.seniority} onChange={(e) => { const n = [...shareClasses]; n[i].seniority = Number(e.target.value); setShareClasses(n); }}/></td>
                        <td className="px-4 py-2">
                          {sc.type === 'preferred' && <Input type="number" step="0.5" className="h-8 w-16 text-center" value={sc.liquidationPref} onChange={(e) => { const n = [...shareClasses]; n[i].liquidationPref = Number(e.target.value); setShareClasses(n); }}/>}
                        </td>
                        <td className="px-4 py-2">
                          {sc.type === 'preferred' && (
                            <Select value={sc.prefType} onValueChange={(v: "participating"|"non-participating"|null) => {
                              if (!v) return;
                              const newSc = [...shareClasses];
                              newSc[i].prefType = v;
                              setShareClasses(newSc);
                            }}>
                              <SelectTrigger className="h-8 w-32"><SelectValue/></SelectTrigger>
                              <SelectContent><SelectItem value="participating">Yes</SelectItem><SelectItem value="non-participating">No</SelectItem></SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {sc.type === 'preferred' && sc.prefType === 'participating' && (
                            <Input type="number" placeholder="No cap" className="h-8 w-20 text-center" value={sc.cap || ""} onChange={(e) => { const n = [...shareClasses]; n[i].cap = e.target.value ? Number(e.target.value) : null; setShareClasses(n); }}/>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => setShareClasses(shareClasses.filter(c => c.id !== sc.id))}>
                          <Trash2 className="w-4 h-4 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Share Transactions</CardTitle>
              <Button size="sm" variant="outline" onClick={addTransaction}><Plus className="w-4 h-4 mr-1"/> Add</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Share Class</th>
                      <th className="px-4 py-3 font-medium">Stakeholder</th>
                      <th className="px-4 py-3 font-medium">Shares</th>
                      <th className="px-4 py-3 font-medium">Investment ($)</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx, i) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <Select value={tx.shareClass} onValueChange={(v) => {
                            if (!v) return;
                            const newTx = [...transactions];
                            newTx[i].shareClass = v;
                            setTransactions(newTx);
                          }}>
                            <SelectTrigger className="h-8 w-32"><SelectValue/></SelectTrigger>
                            <SelectContent>
                              {shareClasses.map(sc => <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2"><Input className="h-8 w-40" value={tx.stakeholder} onChange={(e) => { const n = [...transactions]; n[i].stakeholder = e.target.value; setTransactions(n); }}/></td>
                        <td className="px-4 py-2"><Input type="number" className="h-8 w-24 text-right" value={tx.shares} onChange={(e) => { const n = [...transactions]; n[i].shares = Number(e.target.value); setTransactions(n); }}/></td>
                        <td className="px-4 py-2"><Input type="number" className="h-8 w-28 text-right" value={tx.investment} onChange={(e) => { const n = [...transactions]; n[i].investment = Number(e.target.value); setTransactions(n); }}/></td>
                        <td className="px-4 py-2 text-right text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))}>
                          <Trash2 className="w-4 h-4 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-8">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${summaryView === 'shareClass' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`} onClick={() => setSummaryView('shareClass')}>By Share Class</button>
            <button className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${summaryView === 'transaction' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`} onClick={() => setSummaryView('transaction')}>By Transaction</button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export XLSX
            </Button>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md border-0" onClick={handleAIAnalysis}>
              <Bot className="w-4 h-4 mr-2" /> Analyze with AI
            </Button>
          </div>
        </div>

        {/* Summary Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg">Distribution Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">{summaryView === 'shareClass' ? 'Share Class' : 'Stakeholder'}</th>
                    {summaryView === 'transaction' && <th className="px-6 py-4 font-medium">Class</th>}
                    <th className="px-6 py-4 font-medium text-right">Amount ($)</th>
                    <th className="px-6 py-4 font-medium text-right">% of Exit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(summaryView === 'shareClass' ? summaryData : transactionSummary).map((item: any, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                      {summaryView === 'transaction' && <td className="px-6 py-4 text-slate-600"><Badge variant="outline">{item.shareClass}</Badge></td>}
                      <td className="px-6 py-4 text-right font-semibold text-emerald-700">{formatCurrency(item.payout)}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td className="px-6 py-4 text-slate-900">Total</td>
                    {summaryView === 'transaction' && <td></td>}
                    <td className="px-6 py-4 text-right text-emerald-700">{formatCurrency(exitAmount)}</td>
                    <td className="px-6 py-4 text-right text-slate-900">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><BarChart4 className="w-5 h-5 mr-2 text-indigo-500"/> Distribution Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v >= 1000000 ? (v/1000000).toFixed(1) + 'm' : v/1000 + 'k'}`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="components.Liquidation Preference" name="Liquidation Preference" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="components.Participation" name="Participation" stackId="a" fill="#10b981" />
                    <Bar dataKey="components.Common Distribution" name="Common Distribution" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Activity className="w-5 h-5 mr-2 text-rose-500"/> Sensitivity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exitSensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="exitValue" tickFormatter={(v) => `$${v >= 1000000 ? (v/1000000).toFixed(1) + 'm' : v/1000 + 'k'}`} />
                    <YAxis tickFormatter={(v) => `$${v >= 1000000 ? (v/1000000).toFixed(1) + 'm' : v/1000 + 'k'}`} />
                    <Tooltip labelFormatter={(v) => `Exit: ${formatCurrency(Number(v))}`} formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    {Array.from(new Set(shareClasses.map(s => s.name))).map((name, i) => (
                      <Line key={name} type="monotone" dataKey={name} stroke={`hsl(${i * 137.5}, 70%, 50%)`} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sankey Flow Diagram */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg">Distribution Flow Mapping</CardTitle>
            <CardDescription>Visualizing funds from Exit to Share Classes to individual Stakeholders.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto bg-white">
            <div className="w-full min-w-[700px] h-[400px]">
              <svg ref={sankeyRef}></svg>
            </div>
          </CardContent>
        </Card>

        {/* AI Modal */}
        {showAiModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-bold flex items-center text-slate-800"><Bot className="w-6 h-6 mr-2 text-violet-600"/> Yikes AI Analysis</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAiModal(false)} className="rounded-full h-8 w-8 p-0 hover:bg-slate-200">✕</Button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 text-slate-700 bg-white">
                {aiAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="font-medium text-slate-500 animate-pulse">Analyzing cap table waterfall...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}}></div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
