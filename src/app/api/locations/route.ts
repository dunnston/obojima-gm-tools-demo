import { createRouteHandler } from '@/lib/api/routeHandler';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

const handler = createRouteHandler('locations', 'locations');

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;
