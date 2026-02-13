import { NextResponse } from 'next/server';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

/**
 * Health check endpoint for monitoring application status.
 * Returns basic health information and optionally tests database connectivity.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    const health: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      timestamp: string;
      version: string;
      environment: string;
      uptime: number;
      checks: Record<string, string>;
      responseTime?: number;
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.4',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime ? process.uptime() : 0,
      checks: {}
    };

    // Check database connectivity (only in non-demo mode)
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      try {
        // Dynamic import to avoid bundling issues
        const dbModule = await import('@/lib/db');
        const db = dbModule.default;

        // Simple query to verify database is working
        const result = db.prepare('SELECT 1 as healthy').get() as { healthy: number } | undefined;

        if (result?.healthy === 1) {
          health.checks.database = 'connected';
        } else {
          health.checks.database = 'error';
          health.status = 'degraded';
        }
      } catch (dbError) {
        health.checks.database = 'unavailable';
        health.status = 'degraded';
      }
    } else {
      health.checks.database = 'demo_mode';
    }

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: Date.now() - startTime
      },
      { status: 503 }
    );
  }
}
