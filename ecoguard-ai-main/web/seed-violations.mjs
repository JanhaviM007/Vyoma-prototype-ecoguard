import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = "postgresql://postgres.ftpiowpbvtsvxqilftob:KlLvVMtyWplwdkCz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log("Seeding Violations...");

        // 1. Flood/Drain (Blue)
        await prisma.report.create({
            data: {
                type: "Clogged Drain",
                description: "Severe blockage causing overflow",
                location: "18.5204, 73.8567", // Center of Pune
                imageUrl: "https://placehold.co/600x400",
                status: "PENDING",
                authorId: "user_2szOzdQ8...", // Placeholder, might fail if foreign key constraint exists.
                // Wait, authorId is required and must exist in Profile.
                // I need to find a valid user ID first.
            }
        });

        console.log("Seeded!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

// Check for existing user first
async function seed() {
    try {
        const user = await prisma.profile.findFirst();
        if (!user) {
            console.error("No user profile found to attach reports to!");
            return;
        }

        console.log(`Using user: ${user.clerkId}`);

        const reports = [
            { type: "Clogged Drain", loc: "18.5204, 73.8567", desc: "Test Flood Risk" },
            { type: "Industrial Smoke", loc: "18.5250, 73.8600", desc: "Test Air Risk" },
            { type: "Garbage Dump", loc: "18.5150, 73.8500", desc: "Test Other Risk" },
        ];

        for (const r of reports) {
            await prisma.report.create({
                data: {
                    type: r.type,
                    description: r.desc,
                    location: r.loc,
                    imageUrl: "https://placehold.co/600x400",
                    status: "PENDING",
                    authorId: user.clerkId
                }
            });
            console.log(`Created ${r.type} at ${r.loc}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
