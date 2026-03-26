"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight,
  ArrowUpRight,
  Microscope,
  Database,
  BarChart,
  Target,
} from "lucide-react";
import { WorldMapDemo } from "@/components/World";

export default function EcoGuardFounderEdition() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-black min-h-screen" />;

  return (
    <div className="bg-[#020202] text-[#e5e7eb] min-h-screen selection:bg-emerald-500/30">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-black tracking-tighter italic">
          ECO<span className="text-emerald-500">GUARD</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Intelligence
          </a>
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Digital Twin
          </a>
          <a href="#" className="hover:text-emerald-400 transition-colors">
            Infrastructure
          </a>
        </div>
        <button className="px-5 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-all">
          Request Access
        </button>
        {/* <ThemeToggle /> */}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-[80px] font-black italic tracking-tighter leading-[0.9] uppercase mb-7">
            Own the <span className="text-emerald-500">Future</span> <br /> of{" "}
            Your City.
          </h1>

          <p className="max-w-xl mx-auto text-lg text-white/60 leading-relaxed font-medium ">
            We provide city governments with{" "}
            <span className="text-white">Decision Dominance</span>, turning
            environmental chaos into a high-fidelity forecast.
          </p>

          {/* <div className="flex flex-col md:flex-row justify-center gap-6 mb-16">
            <button className="group px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-4 transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <span className="font-black uppercase tracking-widest text-xs">
                Deploy Municipal Demo
              </span>
            </button>
          </div> */}

          <div>
            <WorldMapDemo />
          </div>
        </div>
      </section>

      {/* THE HARD TRUTH SECTION */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 leading-none">
              The <span className="text-white/20">Reactive</span> Trap
            </h2>
            <p className="text-white/50 text-xl leading-relaxed mb-10">
              Traditional governance is a post-mortem. You clean the river after
              the fish die. You fine the factory after the leak. By then, you&apos;ve
              already lost the trust of your citizens.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-[3rem] opacity-20" />
            <div className="relative bg-[#0A0A0A] border border-emerald-500/30 p-12 rounded-[3rem]">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 leading-none text-emerald-500">
                Predictive <br /> Sovereignty
              </h2>
              <p className="text-white text-xl leading-relaxed">
                If 5 chemical handling violations occur in Sector 7, our Neural
                Engine calculates an
                <span className="underline decoration-emerald-500 underline-offset-8 px-2 font-black italic">
                  85% Probability
                </span>
                of groundwater contamination. We tell you where to knock before
                the leak happens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-1">
            <FounderCard
              icon={<Globe />}
              title="Violation Correlation"
              desc="Deep-learning analysis of illegal dumping, air spikes, and zoning breaches to find invisible danger zones."
            />
            <FounderCard
              icon={<Microscope />}
              title="Predictive Scoring"
              desc="Every district gets a dynamic 'Environmental Health Score' that fluctuates based on real-time neural data."
            />
            <FounderCard
              icon={<Database />}
              title="Satellite Fusion"
              desc="Multispectral satellite integration cross-references local reports for 100% verification across the territory."
            />
          </div>
        </div>
      </section>

      {/* THE "RESULT" SECTION (REPLACED FORMULA) */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="p-16 border border-white/5 rounded-[4rem] relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.05),_transparent)]">
            <div className="relative z-10 text-center">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 mb-8">
                System Impact
              </h3>
              <p className="text-5xl font-black italic uppercase tracking-tighter mb-16">
                The Preemptive Advantage.
              </p>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="text-left bg-white/5 p-10 rounded-3xl border border-white/5">
                  <Target className="w-8 h-8 text-emerald-500 mb-6" />
                  <div className="text-5xl font-black italic text-white mb-2">
                    92%
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">
                    Detection Accuracy
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Our neural engine correctly identifies risk patterns weeks
                    before they escalate into municipal emergencies.
                  </p>
                </div>

                <div className="text-left bg-white/5 p-10 rounded-3xl border border-white/5">
                  <BarChart className="w-8 h-8 text-emerald-500 mb-6" />
                  <div className="text-5xl font-black italic text-white mb-2">
                    40%
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">
                    Cost Reduction
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    By optimizing inspector deployment, cities reduce emergency
                    response spending and ecological cleanup costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-end">
          <div>
            <div className="flex gap-12 mb-20 opacity-20 grayscale">
              <span className="font-black text-2xl">DEP</span>
              <span className="font-black text-2xl">WEF</span>
              <span className="font-black text-2xl">SMART_CITIES</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
              © 2026 ECOGUARD GLOBAL. ALL RIGHTS RESERVED.
            </div>
          </div>
          <div className="text-right">
            <blockquote className="text-3xl font-bold italic mb-8 leading-tight text-white">
              &quot;EcoGuard transformed our department from reactive to proactive.
              It&apos;s the standard for modern governance.&quot;
            </blockquote>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500">
              — Commissioner of Public Safety
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FounderCard({ icon, title, desc }) {
  return (
    <div className="p-12 border border-white/5 hover:bg-emerald-500/[0.02] transition-all group relative overflow-hidden">
      <div className="relative z-10">
        <div className="w-10 h-10 mb-8 text-emerald-500 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="text-xl font-black italic uppercase mb-4 tracking-tight group-hover:text-emerald-400">
          {title}
        </h4>
        <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
      </div>
    </div>
  );
}
