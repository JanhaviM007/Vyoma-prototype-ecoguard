"use client";

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, AlertCircle, Info, Send } from "lucide-react";
import { broadcastAlertAction } from "@/app/actions/authority-actions";

export default function BroadcastAlertModal({ isOpen, onClose }) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO");
    const [loading, setLoading] = useState(false);

    const handleBroadcast = async () => {
        if (!title || !message) return;
        setLoading(true);
        await broadcastAlertAction(title, message, type);
        setLoading(false);
        setTitle("");
        setMessage("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-8">
                <DialogHeader>
                    <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Megaphone className="text-red-600" size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                        Broadcast Alert
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Send a real-time emergency broadcast to all registered citizens.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 my-6">
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                        {['INFO', 'WARNING', 'CRITICAL'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${type === t
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Alert Title</label>
                            <Input
                                placeholder="e.g., Heavy Rainfall Warning"
                                className="rounded-2xl border-slate-100 h-12 focus:ring-slate-900"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Description</label>
                            <Textarea
                                placeholder="Describe the situation and necessary precautions..."
                                className="rounded-2xl border-slate-100 min-h-[120px] focus:ring-slate-900"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        className="rounded-2xl font-black uppercase text-[10px]"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="rounded-2xl bg-red-600 h-12 px-8 font-black uppercase text-[10px] shadow-lg shadow-red-100 hover:bg-red-700"
                        onClick={handleBroadcast}
                        disabled={loading || !title || !message}
                    >
                        <Send className="mr-2" size={14} />
                        {loading ? 'Broadcasting...' : 'Broadcast Now'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
