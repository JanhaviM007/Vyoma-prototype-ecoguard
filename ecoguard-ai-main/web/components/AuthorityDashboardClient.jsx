"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { AlertCircle, Megaphone, Zap, ShieldCheck, MapPin, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { getLatestReportsAction } from "@/app/actions/authority-actions";

const AnalyticsCharts = dynamic(() => import("@/components/AnalyticsCharts"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-[2rem]" />
});
const ReportManagementModal = dynamic(() => import("@/components/ReportManagementModal"), { ssr: false });
const BroadcastAlertModal = dynamic(() => import("@/components/BroadcastAlertModal"), { ssr: false });

const Heatmap = dynamic(() => import("@/components/Heatmap"), { ssr: false });

export default function AuthorityDashboardClient({
    stats: initialStats,
    recentReports: initialReports,
    heatmapData: initialHeatmap,
    analytics,
    aqi,
    weather
}) {
    const [reports, setReports] = useState(initialReports);
    const [heatmap, setHeatmap] = useState(initialHeatmap);
    const [stats, setStats] = useState(initialStats);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Polling Logic for Real-time Updates
    useEffect(() => {
        const poll = async () => {
            setIsUpdating(true);
            try {
                const latest = await getLatestReportsAction();
                setReports(latest);

                // Update Heatmap Data
                setHeatmap(latest.map(r => ({
                    ...r,
                    intensity: r.isVerified ? 1 : 0.6
                })));

                // Update Stats (Simplified Client side count for immediate feedback)
                setStats({
                    total: latest.length,
                    pending: latest.filter(r => r.status === "PENDING" || r.status === "VERIFIED").length,
                    inProgress: latest.filter(r => r.status === "IN_PROGRESS").length,
                    resolved: latest.filter(r => r.status === "RESOLVED").length
                });

            } catch (err) {
                console.error("Polling failed", err);
            } finally {
                setIsUpdating(false);
            }
        };

        const interval = setInterval(poll, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    // Simple Resource Allocation Logic: Group verified reports by location density
    const getTopPriorities = () => {
        const locations = reports
            .filter(r => (r.isVerified || r.status === "VERIFIED") && r.status !== "RESOLVED")
            .reduce((acc, curr) => {
                acc[curr.location] = (acc[curr.location] || 0) + 1;
                return acc;
            }, {});

        return Object.entries(locations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([loc, count]) => ({ loc, urgency: count > 2 ? 'CRITICAL' : 'MODERATE', count }));
    };

    const priorities = getTopPriorities();

    return (
        <div className="p-10 space-y-10 bg-slate-50/30 min-h-screen">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Command Center
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Ecoguard Neural Authority Interface
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => setAlertModalOpen(true)}
                        className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] px-6 h-12 shadow-lg shadow-red-100"
                    >
                        <Megaphone className="mr-2" size={16} />
                        Broadcast Alert
                    </Button>
                    <div className="bg-white border border-slate-100 px-6 py-2 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-slate-400">Outdoor Temp</span>
                            <span className="font-black text-slate-900">{weather.temp}°C</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-100 pl-4">
                            <span className="text-[8px] font-black uppercase text-slate-400">AQI Status</span>
                            <span className={`font-black ${aqi.val > 100 ? 'text-red-500' : 'text-green-500'}`}>
                                {aqi.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-8">
                <KPICard title="Total Incidents" value={stats.total} icon={<ShieldCheck size={16} />} />
                <KPICard
                    title="Awaiting Verification"
                    value={stats.pending}
                    color="text-red-600"
                    icon={<AlertCircle size={16} />}
                />
                <KPICard
                    title="Active Response"
                    value={stats.inProgress || 0}
                    color="text-blue-600"
                    icon={<Activity size={16} />}
                />
                <KPICard
                    title="Resolved Cases"
                    value={stats.resolved}
                    color="text-green-600"
                    icon={<Zap size={16} />}
                />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Visual Data Layer */}
                <div className="col-span-8 space-y-8">
                    <Card className="rounded-[3rem] border-none shadow-2xl h-[500px] bg-slate-900 relative overflow-hidden group">
                        <Heatmap data={heatmap} />
                        <div className="absolute top-6 left-6 z-10 flex gap-2">
                            <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none py-2 px-4 rounded-xl font-black uppercase text-[10px]">
                                Live Hazard Heatmap
                            </Badge>
                            {isUpdating && (
                                <Badge className="bg-emerald-500/80 backdrop-blur-md text-white border-none py-2 px-4 rounded-xl font-black uppercase text-[10px] animate-pulse">
                                    <Activity className="mr-1" size={10} /> Updating...
                                </Badge>
                            )}
                        </div>
                        <div className="absolute bottom-10 left-10 text-white z-10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                                Latest Reported Incident
                            </p>
                            <p className="text-3xl font-black tracking-tighter">
                                {reports[0]?.type || "No Recent Reports"}
                            </p>
                            <p className="text-xs font-bold opacity-70 mt-1 flex items-center gap-1">
                                <MapPin size={12} /> {reports[0]?.location || "--"}
                            </p>
                        </div>
                    </Card>

                    {/* Analytics Row */}
                    <div className="h-[300px]">
                        <AnalyticsCharts trends={analytics.trends} distribution={analytics.distribution} />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="col-span-4 space-y-8">
                    {/* Resource Allocation */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">
                                Resource Allocation
                            </h4>
                            <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] px-2">AI Optimized</Badge>
                        </div>
                        <div className="space-y-4">
                            {priorities.length > 0 ? priorities.map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-900 truncate max-w-[150px]">{p.loc}</p>
                                        <p className="text-[9px] font-bold text-slate-400 capitalize">{p.count} Active Reports</p>
                                    </div>
                                    <Badge className={`${p.urgency === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'} border-none text-[8px] px-2 font-black`}>
                                        {p.urgency}
                                    </Badge>
                                </div>
                            )) : (
                                <p className="text-xs font-bold text-slate-400 text-center py-4 italic">Stable environment detected.</p>
                            )}
                        </div>
                    </Card>

                    {/* Review Queue */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 flex flex-col h-[550px]">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">
                                Review Queue
                            </h4>
                            <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Live</span>
                        </div>
                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                            {reports.length > 0 ? (
                                reports.slice(0, 10).map((report) => (
                                    <div
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="cursor-pointer group"
                                    >
                                        <PredictItem
                                            icon={<AlertCircle className={`text-${report.isVerified ? 'red' : 'orange'}-500 group-hover:scale-110 transition-transform`} />}
                                            title={report.type}
                                            prob={report.isVerified ? "Verified" : `${Math.round(report.confidenceScore)}%`}
                                            desc={report.location || "Location Unknown"}
                                            status={report.status}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs font-bold text-slate-400">No active reports</p>
                            )}
                        </div>
                        <Button variant="ghost" className="mt-6 w-full rounded-xl text-slate-400 font-black uppercase text-[10px] hover:bg-slate-50">
                            View All Violations
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <ReportManagementModal
                report={selectedReport}
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
            />
            <BroadcastAlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setAlertModalOpen(false)}
            />
        </div>
    );
}

function KPICard({ title, value, color = "text-slate-900", icon }) {
    return (
        <Card className="border-none shadow-lg rounded-[2.5rem] p-8 bg-white transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">
                {title}
            </p>
            <p className={`text-4xl font-black ${color} tracking-tighter relative z-10 uppercase`}>{value}</p>
        </Card>
    );
}

function PredictItem({ icon, title, prob, desc, status }) {
    return (
        <div className="flex gap-4 p-3 hover:bg-slate-50/80 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <div className={`p-3 rounded-2xl ${status === 'RESOLVED' ? 'bg-green-50' : 'bg-slate-50'}`}>
                {status === 'RESOLVED' ? <Zap className="text-green-500" size={16} /> : icon}
            </div>
            <div className="space-y-1 overflow-hidden flex-1">
                <div className="flex justify-between items-center gap-2">
                    <span className={`text-sm font-black truncate ${status === 'RESOLVED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {title}
                    </span>
                    <span className={`text-[9px] font-black shrink-0 px-2 py-0.5 rounded-full ${prob === 'Verified' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {prob}
                    </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-normal truncate">
                    {desc}
                </p>
            </div>
        </div>
    );
}
