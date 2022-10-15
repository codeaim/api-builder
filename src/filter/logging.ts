import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { Filter, Handler } from '../index';

export function LoggingFilter<
  REQUEST extends APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult,
>(logger: (msg: string) => void): Filter<REQUEST, RESPONSE> {
  return (next: Handler<REQUEST, RESPONSE>): Handler<REQUEST, RESPONSE> =>
    async (event: REQUEST): Promise<RESPONSE> => {
      logger(
        `${event.httpMethod} ${event.resource}` +
          (event.pathParameters
            ? ' ' + JSON.stringify(event.pathParameters)
            : ''),
      );
      const result = await next(event);
      logger(
        `${event.httpMethod} ${event.resource} -> Responded with ${result.statusCode}`,
      );
      return result;
    };
}
