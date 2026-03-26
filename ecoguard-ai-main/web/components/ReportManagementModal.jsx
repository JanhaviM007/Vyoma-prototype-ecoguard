"use client";

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle, AlertTriangle, ShieldCheck, MapPin, Calendar, User,
    ArrowRight, MoreVertical
} from "lucide-react";
import { updateReportStatusAction, manualVerifyReportAction } from "@/app/actions/authority-actions";

export default function ReportManagementModal({ report, isOpen, onClose }) {
    const [notes, setNotes] = useState(report?.resolutionNotes || "");
    const [loading, setLoading] = useState(false);

    if (!report) return null;

    const handleUpdateStatus = async (status) => {
        setLoading(true);
        await updateReportStatusAction(report.id, status, notes);
        setLoading(false);
        onClose();
    };

    const handleManualVerify = async () => {
        setLoading(true);
        await manualVerifyReportAction(report.id);
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl p-8">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <Badge className={`${report.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} border-none px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4`}>
                            {report.isVerified ? 'AI Verified' : 'Pending AI Verification'}
                        </Badge>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</p>
                            <p className={`text-xl font-black ${report.confidenceScore > 70 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.round(report.confidenceScore)}%
                            </p>
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                        {report.type}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Submitted by {report.authorId.substring(0, 8)}... at {new Date(report.createdAt).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-8 my-6">
                    <div className="space-y-4">
                        <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={report.imageUrl} alt="Violation" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-xs font-bold truncate">{report.location}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Report Detail</h4>
                            <p className="text-xs font-bold text-slate-900 leading-relaxed italic border-l-4 border-slate-200 pl-3">
                                "{report.description}"
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Resolution Notes</h4>
                            <Textarea
                                placeholder="Enter site notes or deployment details..."
                                className="min-h-[100px] rounded-2xl border-slate-100 focus:ring-slate-900"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col gap-6">
                    <div className="w-full space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Update Resolution Stage</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatusButton
                                label="Pending"
                                active={report.status === "PENDING"}
                                onClick={() => handleUpdateStatus("PENDING")}
                                loading={loading}
                            />
                            <StatusButton
                                label="Verified"
                                active={report.status === "VERIFIED"}
                                onClick={() => handleUpdateStatus("VERIFIED")}
                                loading={loading}
                            />
                            <StatusButton
                                label="In Progress"
                                active={report.status === "IN_PROGRESS"}
                                onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                loading={loading}
                            />
                            <StatusButton
                                label="Resolved"
                                active={report.status === "RESOLVED"}
                                onClick={() => handleUpdateStatus("RESOLVED")}
                                loading={loading}
                                color="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-slate-50 w-full">
                        <Button
                            variant="ghost"
                            className="rounded-2xl text-red-500 font-black uppercase text-[10px] hover:bg-red-50"
                            onClick={() => handleUpdateStatus("CRITICAL")}
                            disabled={loading}
                        >
                            <AlertTriangle className="mr-2" size={14} />
                            Escalate to Critical
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-2xl border-slate-200 font-black uppercase text-[10px]"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StatusButton({ label, active, onClick, loading, color = "bg-slate-900 hover:bg-slate-800 shadow-slate-200" }) {
    return (
        <Button
            onClick={onClick}
            disabled={loading}
            className={`rounded-2xl h-12 font-black uppercase text-[9px] shadow-lg transition-all ${active
                    ? "ring-4 ring-blue-100 bg-blue-600 hover:bg-blue-700"
                    : color
                }`}
        >
            {label}
        </Button>
    );
}
