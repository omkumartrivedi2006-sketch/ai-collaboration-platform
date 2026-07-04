import dotenv from 'dotenv';
import path from 'path';

// Ensure variables are parsed from environment configuration files
dotenv.config({ path: path.join(__dirname, '../../.env') });

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET'
];

export function validateEnvironment(): void {
  const missing: string[] = [];

  for (const envName of REQUIRED_ENV) {
    if (!process.env[envName]) {
      missing.push(envName);
    }
  }

  if (missing.length > 0) {
    console.error('CRITICAL STARTUP FAILURE: The following environment variables are missing:');
    for (const item of missing) {
      console.error(` - ${item}`);
    }
    process.exit(1);
  }
}
