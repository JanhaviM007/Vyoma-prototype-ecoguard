import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        // We use DIRECT_URL (Port 5432) for CLI commands like db push
        url: env("DIRECT_URL"),
    },
});