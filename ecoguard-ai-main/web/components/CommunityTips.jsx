"use client";

import { motion } from "framer-motion";
import { Lightbulb, Wind, Droplets, Thermometer, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function CommunityTips({ riskAnalysis }) {
    const tips = [
        {
            id: 1,
            type: "FLOOD",
            icon: <Droplets className="text-blue-500" />,
            title: "Clogged Drains",
            text: "Reports of clogged drains in Hadapsar are rising. Avoid parking in low-lying areas today.",
            active: riskAnalysis.flood.score > 40
        },
        {
            id: 2,
            type: "AIR",
            icon: <Wind className="text-emerald-500" />,
            title: "Mask Protocol",
            text: "PM2.5 levels are peaking near industrial zones. N95 masks recommended for morning joggers.",
            active: riskAnalysis.health.score > 50
        },
        {
            id: 3,
            type: "HEAT",
            icon: <Thermometer className="text-orange-500" />,
            title: "Hydration Alert",
            text: "Extreme UV predicted for 2PM. Municipal water kiosks are now open near Swargate.",
            active: riskAnalysis.health.score > 30 && riskAnalysis.health.level === "MODERATE"
        },
        {
            id: 4,
            type: "GENERAL",
            icon: <ShieldAlert className="text-red-500" />,
            title: "Verified Community",
            text: "Your reports are helping authorities prioritize 12 critical zones today. Keep reporting!",
            active: true
        }
    ];

    const activeTips = tips.filter(t => t.active);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <Lightbulb className="text-amber-600 w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Safety & Community Tips</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTips.map((tip, i) => (
                    <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6 flex gap-4">
                                <div className="mt-1 transition-transform group-hover:scale-110 duration-300">
                                    {tip.icon}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tighter">{tip.title}</h4>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{tip.text}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
