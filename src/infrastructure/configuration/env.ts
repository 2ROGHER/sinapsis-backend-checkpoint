import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Busca hacia arriba desde `startDir` hasta encontrar un `package.json`
 * (= raíz del proyecto). No se puede asumir una cantidad fija de niveles
 * relativos (`../../../.env`) porque este módulo se ejecuta desde profundidades
 * de carpeta distintas según el contexto: directo vía ts-node
 * (`src/infrastructure/configuration/`), bundleado por esbuild
 * (`.esbuild/.build/src/infrastructure/adapter/input/web/`), o dentro del zip de
 * Lambda (`src/infrastructure/adapter/input/web/`). Buscar el `package.json` más cercano es
 * correcto en los tres casos sin tener que conocer la profundidad de antemano.
 */
function findProjectRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      // Llegamos a la raíz del filesystem sin encontrar package.json (p. ej.
      // dentro del zip de una Lambda real desplegada, donde no hay `.env` de
      // todos modos). Se usa startDir como último recurso; dotenv.config()
      // simplemente no encuentra el archivo y no hace nada (no lanza error).
      return startDir;
    }
    dir = parent;
  }
}

// No se usa `dotenv/config` (que resuelve `.env` relativo a `process.cwd()`):
// el CLI de Knex hace `process.chdir()` a la carpeta del knexfile antes de
// requerir este módulo, así que depender del cwd actual rompe
// `npm run migrate`/`npm run seed` aunque `.env` sí exista en la raíz.
//
// `override: true` es necesario para `serverless-offline`: resuelve
// `${env:DB_HOST, ''}` de serverless.yml con el entorno del shell que lanzó
// el proceso (que no tiene estas variables exportadas) y, antes de invocar el
// handler, inyecta ese resultado — una cadena vacía, pero presente — en
// `process.env`. dotenv, por defecto, nunca sobreescribe una variable que ya
// existe en `process.env` aunque esté vacía, así que sin `override: true` el
// valor real de `.env` nunca ganaba.
dotenv.config({ path: path.join(findProjectRoot(__dirname), '.env'), override: true });

/**
 * Valida process.env una sola vez, al cargar el módulo (cold start de Lambda / arranque
 * del proceso local), para fallar rápido y explícito si falta una variable requerida en
 * vez de descubrirlo a mitad de una query SQL con un error críptico.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  STAGE: z.string().default('dev'),

  DB_HOST: z.string().min(1, 'DB_HOST es requerido'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1, 'DB_USER es requerido'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1, 'DB_NAME es requerido'),

  DB_POOL_MIN: z.coerce.number().int().min(0).default(0),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(2),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const detalle = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuración de entorno inválida: ${detalle}`);
  }
  return parsed.data;
}

export const env: Env = loadEnv();
