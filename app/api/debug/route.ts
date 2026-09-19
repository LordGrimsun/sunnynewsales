import { NextResponse } from 'next/server';
import { getDb } from '@/lib/data';
import { allConnectorStatuses } from '@/lib/connectors';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      HAS_GEMINI_KEY: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    },
  };

  try {
    const db = getDb();
    diagnostics.db = {
      agents: db.agents.all().length,
      departments: db.departments.all().length,
      leadMagnets: db.leadMagnets.all().length,
    };
  } catch (err: unknown) {
    const e = err as Error;
    diagnostics.dbError = { message: e.message, stack: e.stack };
  }

  try {
    const connectors = await allConnectorStatuses();
    diagnostics.connectors = connectors.map((c) => ({ id: c.id, state: c.state }));
  } catch (err: unknown) {
    const e = err as Error;
    diagnostics.connectorsError = { message: e.message, stack: e.stack };
  }

  return NextResponse.json(diagnostics);
}
