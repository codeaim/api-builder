import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { HttpMethod } from './http-method';

export type Handler<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
> = (event: REQUEST) => Promise<RESPONSE>;

export type HttpHandler<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
> = {
  httpMethod: HttpMethod;
  handler: Handler<REQUEST, RESPONSE>;
};

export type Route<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
> = {
  resource: string;
  httpHandlers: HttpHandler<REQUEST, RESPONSE>[];
  routes: Route<REQUEST, RESPONSE>[];
};

function isRoute<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(
  child: HttpHandler<REQUEST, RESPONSE> | Route<REQUEST, RESPONSE>,
): child is Route<REQUEST, RESPONSE> {
  return (child as Route<REQUEST, RESPONSE>).resource !== undefined;
}

function isHttpHandler<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(
  child: HttpHandler<REQUEST, RESPONSE> | Route<REQUEST, RESPONSE>,
): child is HttpHandler<REQUEST, RESPONSE> {
  return (child as Route<REQUEST, RESPONSE>).resource === undefined;
}

export function route<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(
  resource: string,
  ...nested: (HttpHandler<REQUEST, RESPONSE> | Route<REQUEST, RESPONSE>)[]
): Route<REQUEST, RESPONSE> {
  const httpHandlers = nested.filter(isHttpHandler);
  const routes = nested.filter(isRoute);
  return {
    resource,
    httpHandlers,
    routes,
  };
}

export function bind<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(
  httpMethod: HttpMethod,
  handler: Handler<REQUEST, RESPONSE>,
): HttpHandler<REQUEST, RESPONSE> {
  return {
    httpMethod,
    handler,
  };
}

export function routes<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(...routes: Route<REQUEST, RESPONSE>[]): Handler<REQUEST, RESPONSE> {
  const response = async (event: REQUEST) => {
    const flattenRoutes = (
      previous: Route<REQUEST, RESPONSE>,
      current: Route<REQUEST, RESPONSE>,
    ) => ({
      ...previous,
      [current.resource]: [
        ...current.httpHandlers,
        ...(previous[current.resource] ? previous[current.resource] : []),
      ],
      ...current.routes
        .map((nestedRoute: Route<REQUEST, RESPONSE>) => ({
          ...nestedRoute,
          resource: `${current.resource}${nestedRoute.resource}`,
        }))
        .reduce(flattenRoutes, {}),
    });
    const flattedRoutes = routes.reduce(flattenRoutes, {}) as {
      [resource: string]: HttpHandler<REQUEST, RESPONSE>[];
    };
    const httpHandlers = flattedRoutes[event.resource];
    const httpHandler = httpHandlers.find(
      ({ httpMethod }) => httpMethod === event.httpMethod,
    );
    return httpHandler
      ? httpHandler.handler(event)
      : {
          statusCode: 404,
          body: JSON.stringify({ message: 'Not found' }),
        };
  };
  return response as any;
}
