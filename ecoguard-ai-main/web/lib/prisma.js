import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global;

// Setup the connection pool with better error handling
let pool;
let adapter;

try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.warn("DATABASE_URL not set, Prisma client will skip adapter initialization");
    } else {
        pool = new pg.Pool({ 
            connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        adapter = new PrismaPg(pool);
    }
} catch (err) {
    console.error("Failed to initialize database pool:", err.message);
}

// Next.js standard Prisma singleton pattern
if (!globalForPrisma.prisma) {
    const clientOptions = {
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    };
    
    if (adapter) {
        clientOptions.adapter = adapter;
    }
    
    globalForPrisma.prisma = new PrismaClient(clientOptions);
}

// Export the prisma client
export const prisma = globalForPrisma.prisma;
