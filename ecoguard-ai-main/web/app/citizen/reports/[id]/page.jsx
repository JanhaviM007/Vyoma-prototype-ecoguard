import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Shield,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
  Activity
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentSection from "@/components/CommentSection";

export default async function ReportDetailsPage({ params }) {
  const { id } = await params;
  const { userId } = await auth();

  const report = await prisma.report.findUnique({
    where: { id: id },
  });

  if (!report) {
    return notFound();
  }

  const statusSteps = [
    { label: "PENDING", title: "Report Received" },
    { label: "VERIFIED", title: "AI/Official Verification" },
    { label: "IN_PROGRESS", title: "Action Initiated" },
    { label: "RESOLVED", title: "Issue Fixed" }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.label === report.status);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 bg-slate-50/30 min-h-screen">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/citizen/reports">
          <Button
            variant="ghost"
            className="group gap-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase text-[10px] tracking-widest">Back to All Reports</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">
            SECURE RECORD #{report.id.slice(-8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8">
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Resolution Timeline</h4>
          <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1.5 rounded-full font-black text-[10px]">
            {report.status}
          </Badge>
        </div>
        <div className="relative flex justify-between items-start pt-4 px-4">
          <div className="absolute top-[42px] left-10 right-10 h-1 bg-slate-100 -z-0" />
          {statusSteps.map((step, i) => {
            const isCompleted = i < currentStepIndex || report.status === "RESOLVED";
            const isActive = i === currentStepIndex && report.status !== "RESOLVED";

            return (
              <div key={i} className="flex flex-col items-center gap-4 relative z-10 w-32 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-lg ${isCompleted ? "bg-emerald-500 border-emerald-100 text-white" :
                  isActive ? "bg-blue-600 border-blue-100 text-white animate-pulse" :
                    "bg-white border-slate-50 text-slate-300"
                  }`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : isActive ? <Activity size={20} /> : <Circle size={20} />}
                </div>
                <div className="space-y-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted || isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                    {step.label}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 leading-tight">{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Main Content */}
          <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-[3rem]">
            <div className="relative h-[500px] w-full bg-slate-100 border-b overflow-hidden">
              {/* Using standard img for maximum reliability with external Supabase URLs */}
              <img
                src={report.imageUrl}
                alt="Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none py-2 px-4 rounded-xl font-black uppercase text-[10px]">
                  EVIDENCE LOG
                </Badge>
              </div>
            </div>
            <CardContent className="p-10">
              <div className="space-y-6">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                  {report.type}
                </h1>
                <p className="text-slate-600 leading-relaxed text-xl font-medium">
                  {report.description}
                </p>
              </div>

              {/* Resolution Notes Feature */}
              {report.resolutionNotes && (
                <div className="mt-10 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={64} className="text-emerald-900" />
                  </div>
                  <h4 className="text-emerald-900 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={16} /> Official Resolution Notes
                  </h4>
                  <p className="text-emerald-800 font-bold leading-relaxed relative z-10">
                    {report.resolutionNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comment Hub Integration */}
          <CommentSection reportId={report.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-slate-50 p-6">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Incident Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <DetailItem icon={<MapPin className="text-red-500" />} label="Location" value={report.location || "Pune, Maharashtra"} />
              <DetailItem icon={<Calendar className="text-blue-500" />} label="Date Reported" value={new Date(report.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long" })} />
              <DetailItem icon={<Clock className="text-orange-500" />} label="Time Logged" value={new Date(report.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
            </CardContent>
          </Card>

          <Card className={`p-8 border-none shadow-xl rounded-[2.5rem] relative overflow-hidden group ${report.status === "PENDING" ? "bg-blue-600" : "bg-emerald-600"
            }`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-white">
              {report.status === "PENDING" ? <AlertCircle size={48} /> : <CheckCircle2 size={48} />}
            </div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-2 opacity-60">Citizen Guidance</h4>
            <p className="text-white text-lg font-black tracking-tight leading-snug">
              {report.status === "PENDING"
                ? "Your report is in the priority queue. Authorities are matching this with city intelligence."
                : "Resolution verified. Citizen participation successfully mitigated environmental risk."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-slate-800 text-sm">{value}</p>
      </div>
    </div>
  );
}
