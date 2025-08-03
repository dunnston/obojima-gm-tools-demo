import { createRouteHandler } from '@/lib/api/routeHandler';

const handler = createRouteHandler('user_ingredients', 'ingredients');

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;