import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = "postgresql://postgres.ftpiowpbvtsvxqilftob:KlLvVMtyWplwdkCz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log("Connecting to DB with Adapter...");
        const violations = await prisma.report.findMany({
            where: { status: "PENDING" },
            select: { id: true, type: true, location: true, status: true }
        });

        console.log("Total Pending Violations:", violations.length);
        violations.forEach(v => {
            console.log(`- [${v.id}] ${v.type}: Location='${v.location}'`);
            const parts = v.location?.split(",").map((s) => parseFloat(s.trim()));
            const valid = parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
            console.log(`  -> Valid Coords? ${valid ? "YES" : "NO"} (${parts})`);
        });
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
