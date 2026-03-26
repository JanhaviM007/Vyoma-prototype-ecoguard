"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, Filter, ChevronRight, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";
import EmergencyButton from "./EmergencyButton";
import CommunityTips from "./CommunityTips";

// Now ssr: false is allowed because this is a Client Component
const Heatmap = dynamic(() => import("@/components/Heatmap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function DashboardClient({ firstName, riskAnalysis, weather, aqi, heatmapData = [] }) {
  const [filter, setFilter] = useState("ALL");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  // Expanded Filter Data Logic
  const filteredHeatmap = heatmapData.filter((point) => {
    // Advanced Toggles
    if (showVerifiedOnly && !point.isVerified) return false;
    if (showCriticalOnly && point.status !== "CRITICAL") return false;

    const type = point.type?.toLowerCase() || "";
    const desc = point.description?.toLowerCase() || "";

    if (filter === "ALL") return true;

    if (filter === "WATER") {
      return type.includes("water") || type.includes("flood") || type.includes("drain") || desc.includes("canal");
    }
    if (filter === "AIR") {
      return type.includes("air") || type.includes("smoke") || type.includes("smog") || type.includes("industrial");
    }
    if (filter === "WASTE") {
      return type.includes("waste") || type.includes("dumping") || type.includes("trash") || type.includes("plastic") || desc.includes("debris");
    }
    if (filter === "NOISE") {
      return type.includes("noise") || type.includes("sound") || type.includes("loud");
    }
    if (filter === "HEAT") {
      return type.includes("heat") || type.includes("temp") || type.includes("sun");
    }

    return false;
  });

  // Safe defaults if data is missing during dev/loading
  const safeWeather = weather || { temp: "--", condition: "Unknown" };
  const safeAQI = aqi || { val: "--", status: "Unknown" };
  const safeRisk = riskAnalysis || {
    health: { score: 0, level: "LOW", isCritical: false },
    flood: { score: 0, level: "LOW", isCritical: false },
    insights: [],
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome Back, {firstName || "Citizen"}!
        </h1>
        <p className="text-slate-500 font-medium">
          {new Date().toDateString()} | {safeWeather.condition}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase">
              Live Environment & Risk Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-10">
            <div className="text-center">
              <div className="text-5xl font-black text-slate-800">{safeWeather.temp}°C</div>
              <Badge
                variant="secondary"
                className={`mt-2 ${safeAQI.val > 100 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
              >
                AQI : {safeAQI.val}
              </Badge>
            </div>

            {/* Dynamic Risk Insight */}
            <div className="flex-1 w-full bg-white/40 p-4 rounded-xl border border-white/60 flex items-center gap-4">
              <AlertTriangle className={`w-8 h-8 ${safeRisk.health.isCritical ? "text-red-500" : "text-amber-500"}`} />
              <div>
                <h4 className="font-bold text-slate-800">
                  Health Risk: <span className={safeRisk.health.isCritical ? "text-red-600" : "text-amber-600"}>{safeRisk.health.level}</span>
                </h4>
                <p className="text-slate-500 text-sm">
                  {safeRisk.insights[0] || "No critical alerts. Maintain standard precautions."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highest Risk Alert Card */}
        {(() => {
          const isHealthHigher = safeRisk.health.score > safeRisk.flood.score;
          const activeRisk = isHealthHigher ? safeRisk.health : safeRisk.flood;
          const title = isHealthHigher ? "HEALTH RISK" : "FLOOD RISK";

          // Theme logic: Critical is always Red. Otherwise Blue (Flood) or Amber (Health).
          let theme = "blue";
          if (isHealthHigher) theme = "amber";
          if (activeRisk.isCritical) theme = "red";

          return (
            <Card className={`bg-${theme}-50 border-${theme}-100 flex flex-col justify-center p-6 relative group overflow-hidden`}>
              <div className={`absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                <AlertTriangle size={120} className={`text-${theme}-600`} />
              </div>
              <div className={`text-${theme}-600 font-bold mb-3 flex items-center gap-2`}>
                <AlertTriangle className="w-5 h-5" /> {title}: {activeRisk.level}
              </div>
              <p className={`text-${theme}-900 text-xl font-semibold mb-6`}>
                Score: {activeRisk.score}/100
                <span className="block text-sm font-normal opacity-80 mt-1">Multipliers: Active Violations</span>
              </p>
              <Link href={isHealthHigher ? "/citizen/health" : "/citizen/risk"}>
                <button className={`absolute bottom-4 right-4 text-${theme}-700 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1`}>
                  Detailed Analysis <ChevronRight size={12} />
                </button>
              </Link>
            </Card>
          );
        })()}
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
        <div className="p-6 bg-white border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-2xl">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Live Hazard Pulse</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredHeatmap.length} Active Incidents Detected</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5 px-3 border-r border-slate-200 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Categories</span>
            </div>
            {["ALL", "WATER", "AIR", "WASTE", "NOISE", "HEAT"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={showVerifiedOnly}
                onChange={e => setShowVerifiedOnly(e.target.checked)}
              />
              <div className={`w-8 h-4 rounded-full relative transition-colors ${showVerifiedOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showVerifiedOnly ? 'left-4.5' : 'left-0.5'}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600 transition-colors">Verified Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={showCriticalOnly}
                onChange={e => setShowCriticalOnly(e.target.checked)}
              />
              <div className={`w-8 h-4 rounded-full relative transition-colors ${showCriticalOnly ? 'bg-red-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showCriticalOnly ? 'left-4.5' : 'left-0.5'}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-600 transition-colors">Critical Alerts</span>
            </label>
          </div>
        </div>
        <div className="h-[450px] w-full bg-slate-100 relative">
          <Heatmap data={filteredHeatmap} />
        </div>
      </Card>

      <CommunityTips riskAnalysis={safeRisk} />

      <EmergencyButton />
    </div>
  );
}
