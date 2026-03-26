import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { syncUserToDatabase } from "@/lib/sync-user";
import {
  LayoutDashboard,
  Map as MapIcon,
  ShieldAlert,
  BrainCircuit,
  BarChart3,
  Settings,
} from "lucide-react";
import TranslateWidget from "@/components/TranslateWidget";

export default async function AuthorityLayout({ children }) {
  const profile = await syncUserToDatabase();

  if (!profile || profile.role !== "AUTHORITY") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar based on Wireframe */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 mb-4">
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">
            CITY GUARD AI
          </h1>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          <SidebarLink
            href="/authority"
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active
          />
          <SidebarLink
            href="/authority/live-map"
            icon={<MapIcon size={20} />}
            label="Live Map"
          />
          <SidebarLink
            href="/authority/violations"
            icon={<ShieldAlert size={20} />}
            label="Violations"
          />
          <SidebarLink
            href="/authority/predictions"
            icon={<BrainCircuit size={20} />}
            label="AI Predictions"
          />
          <SidebarLink
            href="/authority/analytics"
            icon={<BarChart3 size={20} />}
            label="Analytics"
          />
        </nav>

        <div className="px-6 py-4 border-t border-slate-100">
          <TranslateWidget />
        </div>

        <div className="p-8 border-t border-slate-100 space-y-6">
          <SidebarLink
            href="/authority/settings"
            icon={<Settings size={20} />}
            label="Settings"
          />
          <div className="flex items-center gap-3 pl-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">
                Vedant Kolte
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                City Administrator
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">{children}</main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
        ? "bg-slate-100 text-slate-900"
        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        }`}
    >
      {icon} {label}
    </Link>
  );
}
