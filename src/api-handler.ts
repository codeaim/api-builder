import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';

export interface ApiHandler<
  REQUEST extends APIGatewayProxyEvent = APIGatewayProxyEvent,
  RESPONSE extends APIGatewayProxyResult = APIGatewayProxyResult,
> {
  handler: (event: REQUEST) => Promise<RESPONSE>;
}
