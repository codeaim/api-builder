import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';

export interface ApiHandler<
  REQUEST extends APIGatewayProxyEvent = APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult = APIGatewayProxyResult,
> {
  handle: (event: REQUEST) => Promise<RESPONSE>;
}
