import { createRouteHandler } from '@/lib/api/routeHandler';

const handler = createRouteHandler('downtime_activities', 'activities');

export const GET = handler.GET;
export const POST = handler.POST;
export const DELETE = handler.DELETE;