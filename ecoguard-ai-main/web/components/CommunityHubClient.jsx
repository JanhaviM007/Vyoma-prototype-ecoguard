"use client";

import { MessageSquare, Users, TrendingUp, Search } from "lucide-react";
import ReportFeedItem from "./ReportFeedItem";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";

export default function CommunityHubClient({ initialReports }) {
    const [search, setSearch] = useState("");

    const filteredReports = initialReports.filter(r =>
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 max-w-6xl mx-auto py-6">
            {/* Hero Section */}
            <header className="text-center space-y-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
                    Public Plaza
                </h1>
                <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
                    Pune's collective environmental intelligence. Join discussions, stay alert, and protect our city together.
                </p>
            </header>

            {/* Stats & Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <Input
                        placeholder="Search reports by type, location, or description..."
                        className="w-full pl-16 h-16 rounded-[2rem] border-none shadow-xl bg-white text-lg font-bold placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="bg-white rounded-[2rem] shadow-xl p-6 flex items-center justify-between border-b-4 border-blue-500">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Citizens</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">1,204+</p>
                    </div>
                    <Users className="text-blue-500" size={28} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Recent Activity
                        </h2>
                        <div className="flex gap-2">
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] px-3">ALL</Badge>
                            <Badge variant="ghost" className="text-slate-300 font-black text-[9px] px-3">VERIFIED</Badge>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filteredReports.map((report) => (
                            <ReportFeedItem key={report.id} report={report} />
                        ))}
                        {filteredReports.length === 0 && (
                            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-bold italic">No matching reports found. Try a different search!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Insights & Hotspots */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <MessageSquare size={80} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-4 italic">Social Pulse</h3>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed mb-6">
                            Participate in ongoing discussions to provide live ground-truth data for our AI models.
                        </p>
                        <div className="space-y-4">
                            <PulseItem label="Hadapsar Flood Alert" count="24 Active" />
                            <PulseItem label="Viman Nagar Smoke" count="12 New" />
                            <PulseItem label="Kothrud Heat Index" count="5 Ongoing" />
                        </div>
                    </Card>

                    <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
                        <h4 className="text-blue-600 font-black uppercase text-xs tracking-widest mb-4">Official Guideline</h4>
                        <p className="text-blue-900 text-lg font-black tracking-tight leading-snug">
                            Every comment adds context. Help authorities verify risks 25% faster by sharing photos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ children, className }) {
    return <div className={`card ${className}`}>{children}</div>;
}

function PulseItem({ label, count }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
            <span className="text-xs font-bold text-slate-200">{label}</span>
            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[8px] font-black">{count}</Badge>
        </div>
    );
}
