import { createRouteHandler } from '@/lib/api/routeHandler';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

const handler = createRouteHandler('user_companion_types', 'companionTypes');

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;