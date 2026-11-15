import { neon } from '@neondatabase/serverless';

// Helper function to connect to Neon Postgres using the DATABASE_URL environment variable.
// Uses pooled DATABASE_URL for application traffic, falling back to loading .env.local or .env in local runs.
export function getDb() {
  if (!process.env.DATABASE_URL && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile('.env.local');
    } catch {
      // Ignore if .env.local does not exist
    }
    try {
      process.loadEnvFile('.env');
    } catch {
      // Ignore if .env does not exist
    }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  return neon(process.env.DATABASE_URL);
}

