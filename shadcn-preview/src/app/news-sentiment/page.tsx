"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Search, Info, TrendingUp, TrendingDown, Minus, ExternalLink, Bot, Send, Newspaper, Flame } from "lucide-react";

type Article = {
  id: string;
  source: string;
  title: string;
  url: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
};

type ChatMessage = {
  role: "user" | "bot";
  content: string;
};

const SAMPLE_ARTICLES: Article[] = [
  { id: '1', source: 'Financial Times', title: 'NVIDIA hits new highs as AI demand surges globally', url: '#', date: '2 hours ago', sentiment: 'positive', score: 0.92 },
  { id: '2', source: 'Wall Street Journal', title: 'Inflation data remains sticky, delaying rate cuts', url: '#', date: '4 hours ago', sentiment: 'negative', score: -0.65 },
  { id: '3', source: 'Bloomberg', title: 'Tech stocks trend sideways amidst cautious earnings reports', url: '#', date: '5 hours ago', sentiment: 'neutral', score: 0.05 },
  { id: '4', source: 'Reuters', title: 'Federal Reserve chair signals cautious optimism on economy', url: '#', date: '6 hours ago', sentiment: 'positive', score: 0.45 },
  { id: '5', source: 'CNBC', title: 'Retail sector struggles as consumer spending slows in Q1', url: '#', date: '7 hours ago', sentiment: 'negative', score: -0.78 },
];

export default function NewsSentimentPage() {
  const [keyword, setKeyword] = useState("Technology");
  const [maxArticles, setMaxArticles] = useState(25);
  const [timeRange, setTimeRange] = useState("24h");
  
  const [isSearching, setIsSearching] = useState(false);
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "bot", content: "I'm your AI News Analyst. I've aggregated sentiment data for the articles provided. What would you like to know?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const runSentimentAnalysis = () => {
    setIsSearching(true);
    // Simulate API fetch delay
    setTimeout(() => {
      // Shuffle sentiment scores for demo
      const shuffled = [...SAMPLE_ARTICLES].map(a => ({
        ...a,
        sentiment: (Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative') as 'positive' | 'negative' | 'neutral',
        score: (Math.random() * 2) - 1,
        title: a.title.replace('NVIDIA', keyword || 'Market')
      }));
      setArticles(shuffled);
      setLastUpdated(new Date());
      setIsSearching(false);
    }, 1500);
  };

  const executeAiQuery = async (query: string) => {
    if (!query.trim() || isAiLoading) return;
    
    setChatHistory(prev => [...prev, { role: "user", content: query }]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const posCount = articles.filter(a => a.sentiment === 'positive').length;
      const negCount = articles.filter(a => a.sentiment === 'negative').length;
      const netBias = articles.reduce((acc, a) => acc + a.score, 0) / (articles.length || 1);
      
      const payload = {
        message: `CONTEXT: Tracking sentiment for "${keyword}". Scanned ${articles.length} latest articles. Metrics: ${posCount} Positive, ${negCount} Negative. Net Bias Stringency: ${(netBias * 10).toFixed(1)}.\n\nUSER QUESTION: ${query}`,
        history: chatHistory.map(h => ({ role: h.role === "bot" ? "assistant" : "user", content: h.content }))
      };
      
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.response) {
        setChatHistory(prev => [...prev, { role: "bot", content: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: "bot", content: "I'm currently unable to connect to the news sentiment NLP model. Please try again." }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "bot", content: "Network error. Please check your connection." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Derived KPIs
  const posCount = articles.filter(a => a.sentiment === 'positive').length;
  const negCount = articles.filter(a => a.sentiment === 'negative').length;
  const neuCount = articles.filter(a => a.sentiment === 'neutral').length;
  const total = articles.length || 1;
  const netSentimentScore = articles.reduce((acc, a) => acc + a.score, 0) / total;

  const chartData = [
    { name: 'Positive', count: posCount, fill: '#10b981' },
    { name: 'Neutral', count: neuCount, fill: '#94a3b8' },
    { name: 'Negative', count: negCount, fill: '#f43f5e' },
  ];

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (sentiment === 'negative') return <TrendingDown className="w-4 h-4 text-rose-600" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const getSentimentBg = (sentiment: string) => {
    if (sentiment === 'positive') return "bg-emerald-50 border-emerald-100 text-emerald-700";
    if (sentiment === 'negative') return "bg-rose-50 border-rose-100 text-rose-700";
    return "bg-slate-50 border-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm flex items-center justify-center shrink-0">
               <Newspaper className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">News Sentiment Tracker</h1>
              <p className="text-slate-500 text-sm max-w-lg">Track real-time market sentiment algorithms by scraping global news sources and quantifying emotional bias via AI NLP models.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
             <Flame className="w-4 h-4 text-orange-500" />
             Last sync: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Sidebar (Controls & Chart) */}
           <div className="lg:col-span-4 space-y-6">
              
              <Card className="shadow-sm border-slate-200">
                 <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                       <Search className="w-4 h-4 text-indigo-500" /> Sentiment Parameters
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Keywords / Topic</Label>
                      <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. Tesla, Interest Rates..." className="border-slate-200" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Time Range</Label>
                        <Select value={timeRange} onValueChange={v => v && setTimeRange(v)}>
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="24h">Last 24 Hours</SelectItem>
                             <SelectItem value="7d">Last 7 Days</SelectItem>
                             <SelectItem value="30d">Last 30 Days</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Max Articles</Label>
                        <Input type="number" min={5} max={100} value={maxArticles} onChange={e => setMaxArticles(Number(e.target.value))} />
                      </div>
                    </div>
                    
                    <Button onClick={runSentimentAnalysis} disabled={isSearching} className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold h-11 shadow-sm mt-4">
                      {isSearching ? <span className="animate-pulse">Scraping News...</span> : "Run NLP Analysis"}
                    </Button>
                 </CardContent>
              </Card>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                 <Card className="shadow-sm border-slate-200">
                   <CardContent className="p-4 text-center">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Scanned</p>
                     <p className="text-2xl font-black text-slate-800">{articles.length}</p>
                   </CardContent>
                 </Card>
                 <Card className="shadow-sm border-slate-200">
                   <CardContent className="p-4 text-center">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Net Bias</p>
                     <p className={`text-2xl font-black ${netSentimentScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {netSentimentScore > 0 ? '+' : ''}{(netSentimentScore * 10).toFixed(1)}
                     </p>
                   </CardContent>
                 </Card>
              </div>

              {/* Chart */}
              <Card className="shadow-sm border-slate-200">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sentiment Distribution</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-\${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Right Column (Articles & Chat) */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Articles List */}
              <Card className="shadow-sm border-slate-200 flex-1 overflow-hidden flex flex-col">
                 <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Live News Feed</CardTitle>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border shadow-sm">Showing top {articles.length}</span>
                 </CardHeader>
                 <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                    <div className="divide-y divide-slate-100">
                      {articles.map((article) => (
                        <div key={article.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{article.source}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <span className="text-xs text-slate-400">{article.date}</span>
                             </div>
                             <a href={article.url} className="text-[0.95rem] font-medium text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                               {article.title}
                             </a>
                          </div>
                          <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getSentimentBg(article.sentiment)}`}>
                             {getSentimentIcon(article.sentiment)}
                             <span className="text-xs font-bold capitalize">{article.sentiment}</span>
                             <span className="text-xs font-medium ml-1 opacity-70">({(article.score > 0 ? '+' : '')}{article.score.toFixed(2)})</span>
                          </div>
                        </div>
                      ))}
                      {articles.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                           No articles found. Try adjusting your parameters.
                        </div>
                      )}
                    </div>
                 </CardContent>
              </Card>

              {/* AI Insight Chat (Horizontal anchored to bottom) */}
              <Card className="shadow-sm border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white overflow-hidden shrink-0">
                 <div className="flex h-[240px]">
                    
                    {/* Chat Header Sidebar */}
                    <div className="w-[180px] bg-indigo-500 text-white p-5 flex flex-col justify-between hidden md:flex">
                       <div>
                         <div className="p-2 bg-indigo-400/30 w-fit rounded-lg mb-4"><Bot size={24} /></div>
                         <h3 className="font-bold text-lg leading-tight mb-2">AI Market Insight</h3>
                         <p className="text-indigo-100 text-xs">Analyze the signal through the noise utilizing NLP evaluation.</p>
                       </div>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col p-4 relative">
                       <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4 scrollbar-thin scrollbar-thumb-indigo-100">
                          {chatHistory.map((msg, idx) => (
                             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                                 {msg.content}
                               </div>
                             </div>
                          ))}
                          {isAiLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 border border-slate-100 text-slate-400 text-sm shadow-sm flex items-center gap-1">
                                <span className="animate-bounce">•</span><span className="animate-bounce delay-100">•</span><span className="animate-bounce delay-200">•</span>
                              </div>
                            </div>
                          )}
                          <div ref={chatBottomRef} />
                       </div>
                       
                       <div className="w-full relative mt-2 shrink-0">
                         <form onSubmit={(e) => { e.preventDefault(); executeAiQuery(chatInput); }} className="relative">
                           <Input 
                             value={chatInput} 
                             onChange={e => setChatInput(e.target.value)}
                             placeholder="Summarize the primary bearish arguments..." 
                             className="pr-12 bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl shadow-sm h-11"
                           />
                           <button 
                             type="submit"
                             disabled={isAiLoading || !chatInput.trim()}
                             className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 disabled:bg-indigo-400 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                           >
                             <Send className="w-4 h-4" />
                           </button>
                         </form>
                       </div>
                    </div>
                 </div>
              </Card>

           </div>
        </div>
      </div>
    </div>
  );
}
