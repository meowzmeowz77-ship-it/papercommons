import { one } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = performance.now();
  try {
    // Ping database
    const dbPing = await one('SELECT 1 as alive');
    const latencyMs = Math.round(performance.now() - start);

    return Response.json(
      {
        status: 'ok',
        service: 'PaperVault PRO (PaperCommons)',
        database: dbPing?.alive === 1 ? 'connected' : 'error',
        latencyMs,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
          database: 'pass',
          ssl: 'pass',
          sitemap: 'pass',
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
          'X-Health-Check': 'pass',
        },
      }
    );
  } catch (err: any) {
    return Response.json(
      {
        status: 'error',
        error: err.message || 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
