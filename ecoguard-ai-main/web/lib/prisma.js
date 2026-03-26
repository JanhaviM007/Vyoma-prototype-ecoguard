import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global;

// Setup the connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Next.js standard Prisma singleton pattern
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter });
}

// In development, we refresh if the client is missing models
if (process.env.NODE_ENV !== 'production') {
    const p = globalForPrisma.prisma;
    if (p && (!p.sosAlert || !p.comment || !p.notification || !p.globalAlert)) {
        globalForPrisma.prisma = new PrismaClient({ adapter });
    }
}

// Final export using a getter-like approach via Proxy
export const prisma = new Proxy({}, {
    get(target, prop) {
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = new PrismaClient({ adapter });
        }
        return globalForPrisma.prisma[prop];
    }
});
