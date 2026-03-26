import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resolveViolationAction } from "@/app/actions/authority-actions";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function InvestigationPage({ params }) {
  const { id } = await params;
  const violation = await prisma.report.findUnique({ where: { id } });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-1">
            Evidence Verification
          </p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Case #{id.slice(-6).toUpperCase()}
          </h2>
        </div>
        <form action={resolveViolationAction}>
          <input type="hidden" name="id" value={id} />
          <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-6 rounded-2xl shadow-lg">
            MARK AS RESOLVED
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
          <img
            src={violation.imageUrl}
            className="w-full h-full object-cover"
            alt="Evidence"
          />
        </div>
        <Card className="rounded-[2rem] border-none shadow-xl p-8 space-y-6 bg-white">
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Description
            </h4>
            <p className="text-slate-700 font-bold leading-relaxed italic">
              &quot;{violation.description}&quot;
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Location
            </h4>
            <p className="text-slate-900 font-black text-xl">
              {violation.location}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
