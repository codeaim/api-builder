import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';

export type Filter<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
> = (
  handler: (event: REQUEST) => Promise<RESPONSE>,
) => (event: REQUEST) => Promise<RESPONSE>;

export function filters<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(
  handler: (event: REQUEST) => Promise<RESPONSE>,
  ...filters: Filter<REQUEST, RESPONSE>[]
): (event: REQUEST) => Promise<RESPONSE> {
  const combinedFilters = filters.reduce(
    (prev, filter) => (handler) => filter(prev(handler)),
  );
  return combinedFilters(handler);
}
