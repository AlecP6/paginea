import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    checks: {
      database: 'unknown',
      jwtSecret: 'unknown',
      env: 'unknown',
    },
    errors: [] as string[],
  };

  // Vérifier DATABASE_URL
  if (!process.env.DATABASE_URL) {
    checks.errors.push('DATABASE_URL is not set');
    checks.checks.env = 'missing';
  } else {
    checks.checks.env = 'ok';
  }

  // Vérifier JWT_SECRET
  if (!process.env.JWT_SECRET) {
    checks.errors.push('JWT_SECRET is not set');
    checks.checks.jwtSecret = 'missing';
  } else {
    checks.checks.jwtSecret = 'ok';
  }

  // Tester la connexion à la base de données
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'connected';
  } catch (error: any) {
    checks.checks.database = 'error';
    checks.errors.push(`Database error: ${error.message}`);
    checks.status = 'error';
  }

  if (checks.errors.length > 0) {
    checks.status = 'error';
  }

  return NextResponse.json(checks, { 
    status: checks.status === 'ok' ? 200 : 500 
  });
}

