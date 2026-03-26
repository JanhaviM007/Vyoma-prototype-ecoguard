import { UserButton } from "@clerk/nextjs";
import { Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ReportModal from "@/components/ReportModal";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import TranslateWidget from "@/components/TranslateWidget";

export default function CitizenLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]" suppressHydrationWarning>
      {/* STICKY NAVBAR */}
      <nav className="flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-gray-200 p-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href={"/citizen"}>
            <div className="font-extrabold text-2xl tracking-tighter text-green-700">
              ECOGUARD
            </div></Link>
          <Badge
            variant="outline"
            className="hidden md:flex gap-1 bg-white/50 border-gray-200 text-gray-600"
          >
            <MapPin className="w-3 h-3" /> Pune
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/citizen/risk">
            <Button variant="ghost" className="text-sm font-medium">
              Risk Analysis
            </Button>
          </Link>
          <Link href="/citizen/health">
            <Button variant="ghost" className="text-sm font-medium">
              Health Insights
            </Button>
          </Link>
          <Link href="/citizen/community">
            <Button variant="ghost" className="text-sm font-medium">
              Community Hub
            </Button>
          </Link>
          <Link href="/citizen/reports">
            <Button className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold px-6">
              Report
            </Button>
          </Link>
          <ThemeToggle />
          <TranslateWidget />

          <NotificationBell />
          <div className="border-l pl-4 ml-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="p-6 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}
