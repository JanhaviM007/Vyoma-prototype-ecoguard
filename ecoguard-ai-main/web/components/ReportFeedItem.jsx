"use client";

import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { MessageSquare, MapPin, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ReportFeedItem({ report }) {
    console.log("Image URL:", report.imageUrl);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/citizen/reports/${report.id}`}>
                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-[2rem] overflow-hidden group">
                    <div className="flex flex-col md:flex-row">
                        {/* Image Preview */}
                        <div className="relative w-full md:w-48 h-48 bg-slate-100 overflow-hidden">
                            <img
                                src={report.imageUrl}
                                alt={report.type}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {report.isVerified && (
                                <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg">
                                    <ShieldCheck size={14} />
                                </div>
                            )}
                        </div>


                        {/* Content Preview */}
                        <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none mb-1 italic">
                                            {report.type}
                                        </h3>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <MapPin size={10} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {report.location || "Pune City"}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className={`border-none px-3 py-1 rounded-full font-black text-[9px] ${report.status === "RESOLVED" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                        }`}>
                                        {report.status}
                                    </Badge>
                                </div>

                                <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                    {report.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <MessageSquare size={14} />
                                        <span className="text-[10px] font-black">{report._count?.comments || 0} DISCUSSIONS</span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        {new Date(report.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                                <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}
