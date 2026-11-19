import serverlessHttp from 'serverless-http';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';

import { createApp } from './app';
import { buildMysqlAdapters, buildUseCases } from '../../../configuration';
import { getKnex } from '../../output/persistence/database/knex';

// Construcción a nivel de módulo (fuera del handler): se ejecuta una sola vez por
// cold start y se reutiliza en cada invocación "warm" del mismo contenedor Lambda,
// incluyendo el pool de conexiones MySQL que mantiene getKnex() (ver knex.ts).
const useCases = buildUseCases(buildMysqlAdapters(getKnex()));
const app = createApp(useCases);
const serverlessHandler = serverlessHttp(app);

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
  // Permite que Lambda "congele" el contenedor con el pool de Knex abierto en vez
  // de esperar a que el event loop quede vacío (lo que forzaría a cerrar handles
  // como la conexión MySQL en cada invocación). Ver docs/ARCHITECTURE.md.
  context.callbackWaitsForEmptyEventLoop = false;

  return serverlessHandler(event, context) as Promise<APIGatewayProxyStructuredResultV2>;
};
