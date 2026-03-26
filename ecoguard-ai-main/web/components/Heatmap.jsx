"use client";
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ShieldCheck, Navigation } from "lucide-react";

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[10px] font-medium text-slate-600">{label}</span>
    </div>
  );
}

function RecenterControl() {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView([18.5204, 73.8567], 13)}
      className="absolute bottom-6 left-6 z-[1000] bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 hover:bg-slate-50 transition-all group"
      title="Recenter Map"
    >
      <Navigation className="w-5 h-5 text-slate-800 group-hover:scale-110 transition-transform" />
    </button>
  );
}

export default function Heatmap({ data = [] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getOptions = (type, isVerified) => {
    const t = type?.toLowerCase() || "";
    // AIR / INDUSTRIAL (RED)
    if (t.includes("smoke") || t.includes("fire") || t.includes("industrial") || t.includes("air") || t.includes("smog")) {
      return { color: '#dc2626', fillColor: '#ef4444', fillOpacity: isVerified ? 0.7 : 0.3, weight: 2 };
    }
    // WATER / FLOOD (BLUE)
    if (t.includes("drain") || t.includes("water") || t.includes("flood") || t.includes("canal")) {
      return { color: '#2563eb', fillColor: '#3b82f6', fillOpacity: isVerified ? 0.7 : 0.3, weight: 2 };
    }
    // WASTE / DUMPING (BROWN)
    if (t.includes("waste") || t.includes("dumping") || t.includes("trash") || t.includes("plastic")) {
      return { color: '#92400e', fillColor: '#d97706', fillOpacity: isVerified ? 0.7 : 0.3, weight: 2 };
    }
    // NOISE (PURPLE)
    if (t.includes("noise") || t.includes("sound") || t.includes("loud")) {
      return { color: '#7e22ce', fillColor: '#a855f7', fillOpacity: isVerified ? 0.7 : 0.3, weight: 2 };
    }
    // HEAT (DEEP ORANGE)
    if (t.includes("heat") || t.includes("temp") || t.includes("sun")) {
      return { color: '#c2410c', fillColor: '#f97316', fillOpacity: isVerified ? 0.7 : 0.3, weight: 2 };
    }

    return { color: '#64748b', fillColor: '#94a3b8', fillOpacity: isVerified ? 0.7 : 0.3, weight: 2 };
  };

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Initializing City Map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <RecenterControl />

        {/* Legend Overlay */}
        <div className="absolute top-6 right-6 z-[1000] bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/50 space-y-3 min-w-[140px]">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Map Legend</h4>
          <div className="space-y-2">
            <LegendItem color="#ef4444" label="Air / Industrial" />
            <LegendItem color="#3b82f6" label="Water / Flood" />
            <LegendItem color="#d97706" label="Waste / Dumping" />
            <LegendItem color="#a855f7" label="Noise Pollution" />
            <LegendItem color="#f97316" label="Extreme Heat" />
          </div>
        </div>

        {data.map((point, idx) => (
          <Circle
            key={point.id || idx}
            center={[point.lat, point.lon]}
            radius={250}
            pathOptions={getOptions(point.type, point.isVerified)}
          >
            <Popup className="rounded-2xl overflow-hidden">
              <div className="p-2 space-y-3 min-w-[200px]">
                <div className="flex justify-between items-start">
                  <Badge variant={point.isVerified ? "success" : "outline"} className={`text-[9px] font-black uppercase ${point.isVerified ? 'bg-green-50 text-green-700 border-none' : 'text-slate-500'}`}>
                    {point.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <span className="text-[9px] font-bold text-slate-400">
                    {new Date(point.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight m-0">
                    {point.type}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium m-0 mt-1 line-clamp-2">
                    {point.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {point.isVerified ? <ShieldCheck size={12} className="text-green-500" /> : <Clock size={12} className="text-orange-500" />}
                    <span className="text-[9px] font-black text-slate-700 uppercase">{point.status || 'REPORTED'}</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-900">
                    {Math.round(point.confidenceScore || 0)}% <span className="text-slate-400">match</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
