"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";
import GrantLifecycleV3 from "./components/v3";
import GrantLifecycleV2 from "./components/v2";
import GrantLifecycleV1 from "./components/v1";

export default function GrantLifecycleCalculatorTabsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md flex items-center justify-center shrink-0">
             <Briefcase className="text-white w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Grant Lifecycle Calculator</h1>
            <p className="text-slate-500 text-sm md:text-base">Track and analyze your multi-grant equity portfolio over time across different lifecycle models.</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="v3" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 h-12">
            <TabsTrigger value="v1" className="text-sm">Version 1</TabsTrigger>
            <TabsTrigger value="v2" className="text-sm">Version 2</TabsTrigger>
            <TabsTrigger value="v3" className="text-sm font-semibold">Version 3</TabsTrigger>
          </TabsList>
          
          <TabsContent value="v1" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
             <GrantLifecycleV1 />
          </TabsContent>
          
          <TabsContent value="v2" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
             <GrantLifecycleV2 />
          </TabsContent>
          
          <TabsContent value="v3">
             <GrantLifecycleV3 />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}
