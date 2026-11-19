/**
 * Logger mínimo, estructurado como JSON (ideal para CloudWatch Logs Insights, que
 * indexa automáticamente logs en formato JSON de una línea). Deliberadamente no se
 * trae una dependencia como pino/winston: en una única función Lambda detrás de
 * API Gateway, el beneficio marginal de esas librerías no compensa el peso extra
 * en el bundle ni el tiempo de cold start.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogFields {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, fields?: LogFields): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => log('debug', message, fields),
  info: (message: string, fields?: LogFields) => log('info', message, fields),
  warn: (message: string, fields?: LogFields) => log('warn', message, fields),
  error: (message: string, fields?: LogFields) => log('error', message, fields),
};
