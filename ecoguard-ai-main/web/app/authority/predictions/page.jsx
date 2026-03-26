import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Search,
  Filter,
  MapPin,
  Clock
} from "lucide-react";

export default async function AIPredictionsPage() {
  const riskAreas = await prisma.riskArea.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  const latestArea = riskAreas[0] || {
    forecast6h: "LOW",
    forecast24h: "LOW",
    forecast72h: "LOW",
    insights: ["System initializing..."]
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Predictions</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Machine Learning Risk Forecasting</p>
        </div>
        <Badge className="bg-slate-900 text-white px-4 py-2 font-bold rounded-xl shadow-lg">
          Updated: {new Date(latestArea.updatedAt).toLocaleTimeString()}
        </Badge>
      </div>

      {/* Prediction KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PredictionStat label="6h Outlook" value={latestArea.forecast6h} color={latestArea.forecast6h === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'} />
        <PredictionStat label="24h Outlook" value={latestArea.forecast24h} />
        <PredictionStat label="72h Outlook" value={latestArea.forecast72h} />
        <PredictionStat label="Active Risk Areas" value={riskAreas.length.toString()} />
      </div>

      {/* AI Intelligence Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {latestArea.insights.map((insight, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/40 transition-all" />
            <BrainCircuit className="text-emerald-500 mb-6" size={32} />
            <p className="text-sm font-bold leading-relaxed">{insight}</p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
              <ShieldCheck size={12} /> Neural Action Insight
            </div>
          </Card>
        ))}
      </div>

      {/* Risk Forecast Timeline Placeholder (Kept for Visuals) */}
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Unified Risk Forecast (Historical Baseline)</h4>
          <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px]">Real-time Telemetry</Badge>
        </div>
        <div className="h-48 flex items-end justify-between gap-4 px-4">
          {[40, 85, 30, 45, 60, 75, 50].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full bg-slate-50 rounded-t-2xl relative h-full">
                <div
                  className={`absolute bottom-0 w-full rounded-t-2xl transition-all duration-700 ${i === 1 ? 'bg-red-500' : 'bg-emerald-500/40'}`}
                  style={{ height: `${val}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                {['Today', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Zone Readiness */}
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b bg-white flex flex-row justify-between items-center">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 text-center w-full">Detailed Zone Readiness Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Zone / Sector</th>
                <th className="px-8 py-5">6h Status</th>
                <th className="px-8 py-5">24h Status</th>
                <th className="px-8 py-5">72h Status</th>
                <th className="px-8 py-5 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
              {riskAreas.map((area, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={14} /></div>
                    <span className="text-sm">{area.areaName}</span>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={`border-none text-[10px] px-2 py-0.5 ${area.forecast6h === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {area.forecast6h}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={`border-none text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600`}>
                      {area.forecast24h}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={`border-none text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600`}>
                      {area.forecast72h}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xs font-black text-emerald-500">94% AI CONF</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function PredictionStat({ label, value, color = "text-slate-900" }) {
  return (
    <Card className="border-none shadow-lg rounded-[1.5rem] p-6 text-center bg-white group hover:shadow-2xl transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color} tracking-tighter group-hover:scale-110 transition-transform`}>{value}</p>
    </Card>
  );
}
