import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { BarChart3, PieChart as PieIcon } from "lucide-react";

export default async function AnalyticsPage() {
  // Aggregate data for the charts
  const typeStats = await prisma.report.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  const statusStats = await prisma.report.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-black text-slate-900">
        Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2rem] border-none shadow-xl p-8">
          <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieIcon size={16} className="text-blue-600" /> Violation Types
          </h4>
          <div className="space-y-4">
            {typeStats.map((stat) => (
              <div
                key={stat.type}
                className="flex justify-between items-center"
              >
                <span className="font-bold text-slate-600">{stat.type}</span>
                <span className="font-black text-slate-900">
                  {stat._count._all}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-xl p-8">
          <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-green-600" /> Resolution Funnel
          </h4>
          <div className="space-y-4">
            {statusStats.map((stat) => (
              <div
                key={stat.status}
                className="w-full bg-slate-50 rounded-xl p-4 flex justify-between"
              >
                <span className="font-bold text-slate-700">{stat.status}</span>
                <span className="font-black text-blue-600">
                  {stat._count._all}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
