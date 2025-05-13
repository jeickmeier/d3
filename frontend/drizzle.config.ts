import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    console.log('🔴 Cannot find database url');
  }

export default defineConfig({
  dialect: "postgresql", 
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  extensionsFilters: ["postgis"],
  schemaFilter: ["ai"],
  tablesFilter: ["*"],
  schema: "./db/schema.ts",
  out: "./db/drizzle",
});