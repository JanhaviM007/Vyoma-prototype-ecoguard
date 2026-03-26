"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle2, Loader2, MapPin, Sparkles, Send, X, Badge } from "lucide-react";
import { analyzeImageAction } from "@/app/actions/analyze-image";
import { uploadReportAction } from "@/app/actions/report-actions";

export default function NewReportPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [fields, setFields] = useState({ title: "", type: "", location: "", description: "" });
  const timerRef = useRef(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFields(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setFields(prev => ({ ...prev, location: data.display_name.split(',').slice(0, 3).join(',') }));
        } catch (e) { }
      });
    }
  }, []);

  const triggerAIAnalysis = async (file) => {
    if (!file) return;
    setIsAnalyzing(true);
    setTimeLeft(10);
    timerRef.current = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      const aiResponse = await analyzeImageAction(base64);
      if (aiResponse) {
        setFields(prev => ({
          ...prev,
          title: aiResponse.title || "",
          type: aiResponse.type || "",
          description: aiResponse.description || ""
        }));
      }
      setIsAnalyzing(false);
      clearInterval(timerRef.current);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      triggerAIAnalysis(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 font-sans">
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-[#0A0A0A] text-white py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 pointer-events-none" />
          <CardTitle className="text-4xl font-black italic uppercase tracking-tighter">New Evidence</CardTitle>
          <Badge className="mt-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-widest text-[9px]">
            Secure Authority Channel
          </Badge>
        </CardHeader>

        <CardContent className="p-8 md:p-12 space-y-8">

          {/* FORM START */}
          <form
            action={uploadReportAction}
            className="space-y-6"
          >

            {/* PHOTO BOX (MOVED INSIDE FORM) */}
            <div className="relative group">
              <input
                type="file"
                name="image"
                id="img-up"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                required
              />

              <label
                htmlFor="img-up"
                className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-10 transition-all cursor-pointer ${imagePreview
                  ? "border-emerald-500 bg-emerald-50/30"
                  : "border-slate-200 bg-slate-50 hover:border-emerald-400"
                  }`}
              >
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
                        {timeLeft}s
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 animate-pulse tracking-widest">
                      AI Neural Analysis...
                    </span>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Camera className="w-12 h-12" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Capture Incident Evidence
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* INCIDENT INTELLIGENCE */}
            <div className="flex justify-between items-center mb-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Incident Intelligence
              </Label>
              <Button
                type="button"
                onClick={() => {
                  const input = document.getElementById("img-up");
                  if (input?.files?.[0]) {
                    triggerAIAnalysis(input.files[0]);
                  }
                }}
                className="h-7 px-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Sparkles className="w-3 h-3 mr-1" /> Magic Fill
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input name="title" value={fields.title} onChange={e => setFields({ ...fields, title: e.target.value })} placeholder="Incident Title" />
              <Input name="type" value={fields.type} onChange={e => setFields({ ...fields, type: e.target.value })} placeholder="Category" />
            </div>

            <Input name="location" value={fields.location} onChange={e => setFields({ ...fields, location: e.target.value })} />

            <Textarea name="description" value={fields.description} onChange={e => setFields({ ...fields, description: e.target.value })} rows={4} />

            <div className="flex gap-4 pt-6 border-t border-slate-50">
              <Button type="button" variant="outline" className="flex-1" onClick={() => window.history.back()}>
                Dismiss
              </Button>
              <Button type="submit" disabled={isAnalyzing} className="flex-[2]">
                Broadcast Report <Send className="ml-2 w-3 h-3" />
              </Button>
            </div>

          </form>
          {/* FORM END */}

        </CardContent>
      </Card>
    </div>
  );
}