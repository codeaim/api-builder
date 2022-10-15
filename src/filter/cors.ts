import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { Filter, Handler, HttpMethod } from '../index';

export function CorsFilter<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(origin: string): Filter<REQUEST, RESPONSE> {
  return (next: Handler<REQUEST, RESPONSE>): Handler<REQUEST, RESPONSE> =>
    async (event: REQUEST): Promise<RESPONSE> => {
      const result = await next(event);
      return {
        ...result,
        headers: {
          ...result.headers,
          'Access-Control-Allow-Origin': origin ?? '*',
          'Access-Control-Allow-Methods': Object.values(HttpMethod).join(),
          'Access-Control-Allow-Headers': '*',
        },
      };
    };
}
