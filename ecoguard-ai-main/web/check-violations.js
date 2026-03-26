const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const violations = await prisma.report.findMany({
        where: { status: "PENDING" },
        select: { id: true, type: true, location: true, status: true }
    });

    console.log("Total Pending Violations:", violations.length);
    violations.forEach(v => {
        console.log(`- [${v.id}] ${v.type}: Location='${v.location}'`);
        // Check if location is parsable
        const parts = v.location?.split(",").map((s) => parseFloat(s.trim()));
        const valid = parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
        console.log(`  -> Valid Coords? ${valid ? "YES" : "NO"} (${parts})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
