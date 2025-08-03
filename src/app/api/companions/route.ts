import { createRouteHandler } from '@/lib/api/routeHandler';

const handler = createRouteHandler('companions', 'companions');

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;