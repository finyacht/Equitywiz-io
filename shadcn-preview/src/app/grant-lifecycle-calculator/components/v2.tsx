"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GrantLifecycleV2() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        <CardContent className="p-10 text-center space-y-6">
          <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 mb-2">Version 2 (Deprecating)</Badge>
          <h2 className="text-3xl font-black">Lifecycle V2 Model</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
            The V2 modeling standard has been officially merged into the more comprehensive V3 framework. 
            All past data tracked in the legacy V2 HTML system is fully compatible with Portfolio Timeline V3.
          </p>
          <div className="pt-4">
             <div className="inline-flex items-center justify-center p-1 rounded-full bg-white/10 border border-white/20 gap-2 px-6 py-3 font-semibold text-white">
                Please use Version 3 for new models.
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
