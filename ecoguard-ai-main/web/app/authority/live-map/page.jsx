"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Drone, History, Layers, Maximize2, Activity } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function LiveMapPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Sample Pune coordinates for violations
  const violations = [
    { id: 1, pos: [18.5204, 73.8567], type: "Illegal Dumping", severity: "High" },
    { id: 2, pos: [18.5590, 73.7791], type: "Emission Spike", severity: "Critical" },
    { id: 3, pos: [18.4497, 73.8577], type: "Water Discharge", severity: "Medium" },
  ];

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100vh-80px)] space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-slate-900">Live Map Violations</h2>
        <Badge className="bg-white text-slate-900 border border-slate-200 px-4 py-2 font-bold rounded-xl shadow-sm">
          Today, 11-Feb
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6 h-full pb-10">
        {/* LARGE MAP SECTION */}
        <Card className="col-span-2 rounded-[2.5rem] border-none shadow-2xl overflow-hidden relative">
          <MapContainer center={[18.5204, 73.8567]} zoom={12} className="h-full w-full z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {violations.map((v) => (
              <Marker key={v.id} position={v.pos}>
                <Popup className="font-bold">
                  <div className="p-1">
                    <p className="text-red-600 font-black">{v.type}</p>
                    <p className="text-xs text-slate-500">Severity: {v.severity}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <ButtonIcon icon={<Maximize2 size={18} />} />
            <ButtonIcon icon={<Activity size={18} />} />
          </div>
        </Card>

        {/* SIDEBAR TOOLS */}
        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Camera/Drone Feeds */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-white">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Camera/Drone Feeds</CardTitle>
              <Drone size={16} className="text-blue-600" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <FeedItem label="Wakad Intersection" status="Live" icon={<Camera size={14} />} />
              <FeedItem label="Drone Unit #04 - Baner" status="Scanning" icon={<Drone size={14} />} />
            </CardContent>
          </Card>

          {/* Event Logs */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-white">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Event Logs</CardTitle>
              <History size={16} className="text-orange-500" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <LogEntry time="18:12" msg="AI detected smoke spike in Zone 7" />
                <LogEntry time="17:45" msg="User report #4021 verified" />
                <LogEntry time="17:30" msg="Patrol unit dispatched to Katraj" />
              </div>
            </CardContent>
          </Card>

          {/* Map Layers */}
          <Card className="rounded-[2rem] border-none shadow-xl bg-white">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Map Layers</CardTitle>
              <Layers size={16} className="text-purple-600" />
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-2">
              <LayerButton label="Heatmap" active />
              <LayerButton label="Traffic" />
              <LayerButton label="AQI Nodes" />
              <LayerButton label="CCTV" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Sub-components for visual consistency
function ButtonIcon({ icon }) {
  return <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50">{icon}</div>;
}

function FeedItem({ label, status, icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-slate-600">{icon}</div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
      </div>
      <Badge className="bg-green-100 text-green-700 border-none text-[10px] uppercase font-black">{status}</Badge>
    </div>
  );
}

function LogEntry({ time, msg }) {
  return (
    <div className="flex gap-3 items-start border-l-2 border-slate-100 pl-4 py-1">
      <span className="text-[10px] font-black text-blue-600 font-mono mt-1">{time}</span>
      <p className="text-[11px] font-bold text-slate-600 leading-tight">{msg}</p>
    </div>
  );
}

function LayerButton({ label, active }) {
  return (
    <div className={`p-2 rounded-xl text-[10px] font-black uppercase text-center cursor-pointer transition-all ${
      active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
    }`}>
      {label}
    </div>
  );
}