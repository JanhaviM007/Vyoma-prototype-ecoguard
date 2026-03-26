"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";
import { createSosAlertAction } from "@/app/actions/sos-actions";
import { Button } from "./ui/button";

export default function EmergencyButton() {
    const [isConfirming, setIsConfirming] = useState(false);
    const [status, setStatus] = useState("idle"); // idle, loading, sent

    const triggerSOS = async () => {
        setStatus("loading");
        try {
            // In a real app, we'd use browser geolocation here.
            // Defaulting to Pune for demonstration.
            await createSosAlertAction("Hadapsar, Pune (Live-Geo)");
            setStatus("sent");
            setTimeout(() => {
                setIsConfirming(false);
                setStatus("idle");
            }, 3000);
        } catch (err) {
            console.error(err);
            setStatus("idle");
        }
    };

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            <AnimatePresence>
                {isConfirming && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-6 bg-white border-2 border-red-500 p-6 rounded-[2.5rem] shadow-2xl w-64 text-center overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-100">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-red-500"
                            />
                        </div>

                        {status === "idle" ? (
                            <>
                                <h4 className="font-black text-red-600 uppercase text-xs tracking-widest mb-2">Emergency Hub</h4>
                                <p className="text-[10px] font-bold text-slate-400 mb-6 leading-relaxed">
                                    Click below to alert all city authorities. Misuse may result in a fine.
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsConfirming(false)}
                                        className="flex-1 rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:bg-slate-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={triggerSOS}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-200"
                                    >
                                        CONFIRM
                                    </Button>
                                </div>
                            </>
                        ) : status === "loading" ? (
                            <div className="py-4 space-y-4">
                                <Siren className="mx-auto text-red-500 animate-bounce" size={32} />
                                <p className="text-[10px] font-black text-red-600 uppercase animate-pulse">Broadcasting Signal...</p>
                            </div>
                        ) : (
                            <div className="py-4 space-y-4">
                                <ShieldCheck className="mx-auto text-emerald-500" size={32} />
                                <p className="text-[10px] font-black text-emerald-600 uppercase">Alert Dispatched</p>
                                <p className="text-[8px] font-bold text-slate-400">Response teams notified.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsConfirming(!isConfirming)}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isConfirming ? "bg-slate-900 border-4 border-red-500 rotate-45" : "bg-red-600 border-4 border-white"
                    }`}
            >
                <motion.div
                    animate={{ rotate: isConfirming ? 0 : [0, 10, -10, 0] }}
                    transition={{ repeat: isConfirming ? 0 : Infinity, duration: 2 }}
                >
                    <AlertTriangle className="text-white" size={32} />
                </motion.div>

                {!isConfirming && (
                    <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[8px] font-black px-2 py-1 rounded-full border border-red-100 animate-pulse">
                        SOS
                    </span>
                )}
            </motion.button>
        </div>
    );
}
