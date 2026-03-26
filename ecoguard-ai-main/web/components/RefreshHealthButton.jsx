"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { refreshHealthInsightAction } from "@/app/actions/health-actions";
import { useRouter } from "next/navigation";

export default function RefreshHealthButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const res = await refreshHealthInsightAction();
            if (res.success) {
                router.refresh(); // Refresh the page data
            }
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl px-4 py-2 flex items-center gap-2 transition-all font-black uppercase tracking-widest text-[10px]"
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <RefreshCw className="w-3.5 h-3.5" />
            )}
            {loading ? "Syncing..." : "Sync Neural Report"}
        </Button>
    );
}
