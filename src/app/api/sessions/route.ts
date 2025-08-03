import { createRouteHandler } from '@/lib/api/routeHandler';

const handler = createRouteHandler('sessions', 'sessions');

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;