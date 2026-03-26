export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  Activity,
  AlertCircle,
  Wind,
  Clock,
  ChevronRight,
  HeartPulse,
  Sun,
  Eye,
  Thermometer,
  Droplets,
  AlertTriangle,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RefreshHealthButton from "@/components/RefreshHealthButton";

export default async function HealthDashboard() {
  const { userId } = await auth();

  // 1. Fetch User Profile
  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    include: { reports: true },
  });

  // 2. Fetch Latest 10 health insights for this user
  const insights = await prisma.healthInsight.findMany({
    where: { clerkId: userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const latest = insights[0];

  if (!profile?.hasSetupProfile) {
    return <SetupPlaceholder />;
  }

  // Data Integrity Check (if any new vectors are missing)
  const isDataOutdated = latest && (latest.uv === null || latest.pm25 === null || latest.recommendations === null || latest.visibility === null);

  // Parse structured recommendations
  let recommendations = {
    immediate: "Pending Sync",
    lifestyle: "Pending Sync",
    protectiveGear: "Pending Sync"
  };
  try {
    if (latest?.recommendations) {
      recommendations = JSON.parse(latest.recommendations);
    }
  } catch (e) {
    console.error("Failed to parse recommendations", e);
  }

  return (
    <div className="max-w-[1200px] mx-auto py-12 px-6 space-y-10">
      {/* 🟠 DATA VERSIONING ALERT */}
      {isDataOutdated && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 text-amber-800">
            <div className="p-3 bg-amber-100 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <p className="font-black uppercase text-xs tracking-widest mb-1">Update Synchronizer Required</p>
              <p className="text-sm font-medium opacity-80">Telemetry vectors (UV, PM2.5, Visibility) and AI recommendations need a fresh Neural Sync to populate.</p>
            </div>
          </div>
          <Link href="/citizen/health/setup">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-8 py-6 font-black uppercase tracking-widest text-xs">Initialize Neural Sync</Button>
          </Link>
        </div>
      )}

      {/* 🟢 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-none mb-4 px-3 py-1">Neural Health Sync Active</Badge>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Bio <span className="text-emerald-500">Intelligence</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2 max-w-md">
            Environmental correlation engine analyzed {insights.length} history points for <span className="text-white font-bold">{profile.email}</span>
          </p>
          {latest && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mt-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Last Neural Sync: {new Date(latest.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-end gap-3">
          <div className={`px-6 py-4 rounded-2xl flex items-center gap-3 border backdrop-blur-md ${latest?.riskLevel === 'CRITICAL' || latest?.riskLevel === 'HIGH'
            ? "bg-red-500/10 border-red-500/30 text-red-500"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
            }`}>
            {latest?.riskLevel === 'CRITICAL' ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Risk Status</div>
              <div className="text-lg font-black uppercase">{latest?.riskLevel || "STABLE"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshHealthButton />
            <Link href="/citizen/health/setup">
              <Button variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 rounded-xl px-6">
                Update Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 📋 LEFT: BIOMETRIC PROFILE */}
        <div className="lg:col-span-4 space-y-6">
          <CardWrapper title="Medical Profile" icon={<Activity className="text-emerald-500" />}>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Chronic Conditions</div>
                <div className="flex flex-wrap gap-2">
                  {profile.chronicConditions.map((c) => (
                    <Badge key={c} variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1">{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Active Symptoms</div>
                <div className="flex flex-wrap gap-2">
                  {profile.currentSymptoms.length > 0 ? (
                    profile.currentSymptoms.map((s) => (
                      <Badge key={s} className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50 font-bold px-3 py-1">{s}</Badge>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic">Clear systemic status</p>
                  )}
                </div>
              </div>
            </div>
          </CardWrapper>

          {/* 🧬 TELEMETRY GRID */}
          <div className="grid grid-cols-2 gap-4">
            <MiniStats icon={<Sun />} label="UV Index" val={latest?.uv || "0"} color="text-yellow-600" bg="bg-yellow-50" />
            <MiniStats icon={<Eye />} label="Vis" val={`${((latest?.visibility || 10000) / 1000).toFixed(1)}km`} color="text-blue-600" bg="bg-blue-50" />
            <MiniStats icon={<Wind />} label="PM2.5" val={latest?.pm25 || "0"} color="text-slate-600" bg="bg-slate-50" />
            <MiniStats icon={<Thermometer />} label="Temp" val={`${latest?.temperature}°`} color="text-orange-600" bg="bg-orange-50" />
          </div>
        </div>

        {/* 🧠 RIGHT: NEURAL INSIGHTS & METHODS */}
        <div className="lg:col-span-8 space-y-8">
          {/* STACKED INSIGHT CARD */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-amber-500 w-5 h-5" />
                <h2 className="font-black uppercase tracking-widest text-xs text-slate-800">Latest Neural Synthesis</h2>
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-tight italic">
                &quot;{latest?.insight || "Neural engine processing..."}&quot;
              </p>
            </div>

            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <RecommendationSection
                title="Immediate Action"
                text={recommendations.immediate}
                icon={<AlertCircle className="w-5 h-5 text-red-500" />}
              />
              <RecommendationSection
                title="Lifestyle Adapt"
                text={recommendations.lifestyle}
                icon={<Clock className="w-5 h-5 text-blue-500" />}
              />
              <RecommendationSection
                title="Bio-Protection"
                text={recommendations.protectiveGear}
                icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
              />
            </div>
          </div>

          {/* 🛠 INFORMATIONAL METHODS: HOW TO PROTECT */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Health Protection Framework</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <MethodCard
                title="High AQI Mitigation"
                steps={["N95 Respirator Required", "HEPA Filtration Sync", "Limit Morning Physicals", "Nebulation Ready (if Chronic)"]}
                icon={<Wind className="text-slate-400" />}
              />
              <MethodCard
                title="UV Exposure Protocol"
                steps={["Broad-spectrum SPF 50+", "Peak Hours: 11AM - 4PM", "Lens Protection Level 3", "Hydration +2L Intake"]}
                icon={<Sun className="text-yellow-400" />}
              />
            </div>
          </div>

          {/* 🕰 HISTORY */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Neural History</h3>
            <div className="space-y-2">
              {insights.slice(1).map(item => (
                <div key={item.id} className="p-4 bg-white border border-slate-50 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-slate-400 w-24">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 truncate max-w-[400px]">
                      {item.insight}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400">AQI {item.aqi}</Badge>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardWrapper({ title, children, icon }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function MiniStats({ icon, label, val, color, bg }) {
  return (
    <div className={`p-4 rounded-3xl ${bg} border border-transparent hover:border-white transition-all`}>
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">{label}</div>
      <div className={`text-xl font-black ${color}`}>{val}</div>
    </div>
  )
}

function RecommendationSection({ title, text, icon }) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
      </div>
      <p className="text-sm font-bold text-slate-700 leading-relaxed">{text}</p>
    </div>
  )
}

function MethodCard({ title, steps, icon }) {
  return (
    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-emerald-100 transition-all">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h4 className="font-bold text-slate-800">{title}</h4>
      </div>
      <ul className="space-y-2">
        {steps.map(step => (
          <li key={step} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SetupPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
        Neural Engine Offline
      </h2>
      <p className="text-slate-500 max-w-md mb-8 font-medium">
        We need your health profile to cross-reference environmental vectors in
        Pune and generate personalized insights.
      </p>
      <Link href="/citizen/health/setup">
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200">
          Initialize Sync <ChevronRight className="ml-2" />
        </Button>
      </Link>
    </div>
  );
}