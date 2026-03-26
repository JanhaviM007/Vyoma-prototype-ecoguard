import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AuthorityViolationsPage() {
  // Fetch dynamic data from Prisma
  const violations = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true }, // Connects to the Profile table
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
        Active Violations
      </h1>

      <div className="bg-white rounded-[2rem] border shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase pl-8">
                Type
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase">
                Location
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase">
                Status
              </TableHead>
              <TableHead className="text-right pr-8 font-black text-[10px] uppercase">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-bold pl-8">{v.type}</TableCell>
                <TableCell className="text-slate-500 font-medium">
                  {v.location}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      v.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {v.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Link href={`/authority/violations/${v.id}`}>
                    <Button
                      variant="ghost"
                      className="font-black text-blue-600"
                    >
                      INVESTIGATE
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
