# Despliegue a AWS

El proyecto está completo y listo para desplegar (`serverless.yml` configurado
para `provider: aws`, runtime `nodejs20.x`, bundling vía `serverless-esbuild`).
**No se ejecuta un `serverless deploy` real** porque la máquina de
desarrollo usada no tiene AWS CLI ni credenciales configuradas. Cumple con los requisitos planteados en el reto técnico.

## Prerrequisitos

1. Cuenta de AWS con permisos para crear: Lambda, API Gateway (HTTP API), IAM
   Role, CloudFormation Stack, S3 (bucket de despliegue de Serverless Framework),
   y, si se usa SSM para secretos, Systems Manager Parameter Store.
2. AWS CLI configurado (`aws configure`) o variables `AWS_ACCESS_KEY_ID` /
   `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` en el entorno.
3. Una instancia MySQL accesible desde AWS (RDS MySQL 8.x recomendado), en la
   misma VPC que la función Lambda si se usa un security group restrictivo.

## Variables de entorno / secretos

`serverless.yml` referencia hoy `${env:DB_HOST}`, `${env:DB_PASSWORD}`, etc. como
variables de entorno planas (apropiado para este take-home). Para un deploy real
se recomienda reemplazarlas por referencias a **SSM Parameter Store**, p. ej.:

```yaml
environment:
  DB_HOST: ${ssm:/sinapsis/${sls:stage}/db-host}
  DB_PASSWORD: ${ssm:/sinapsis/${sls:stage}/db-password~true} # ~true = SecureString
```

Y cargar los parámetros antes del deploy:

```powershell
aws ssm put-parameter --name /sinapsis/dev/db-host --type String --value "mi-rds-endpoint.rds.amazonaws.com"
aws ssm put-parameter --name /sinapsis/dev/db-password --type SecureString --value "********"
```

## Pasos de deploy

```powershell
npm install
npm run migrate     # correr las migraciones contra la BD de destino (RDS), vía túnel/bastión si la VPC es privada
npm run seed         # opcional: solo si se quiere cargar el seed de ejemplo en ese entorno
npx serverless deploy --stage dev --region us-east-1
```

Esto crea el stack de CloudFormation con la función `api` y la integración HTTP
API catch-all. Al finalizar, Serverless Framework imprime la URL base (algo como
`https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com`).

Verificación post-deploy:

```powershell
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/v1/health
```

Actualizar `docs/postman/postman_environment.json` (o crear un environment
nuevo) con esa URL como `baseUrl` para correr la colección de Postman contra el
entorno real.

## Conexión a RDS desde Lambda

- Si RDS está en una VPC privada, la función Lambda debe configurarse con `vpc:`
  en `serverless.yml` (subnets privadas + security group que permita el puerto
  3306 desde el security group de la Lambda).
- Para producción a mayor escala, se recomienda colocar **RDS Proxy** delante de
  MySQL: evita el agotamiento de conexiones cuando hay muchos contenedores Lambda
  concurrentes, cada uno con su propio pool (ver `docs/ARCHITECTURE.md`, sección
  "Conexión MySQL en Lambda").

## Rollback

```powershell
npx serverless rollback --timestamp <timestamp-del-deploy-anterior> --stage dev
# o, para eliminar el stack completo:
npx serverless remove --stage dev
```

## CI/CD (sugerido, no implementado en esta entrega)

`.github/workflows/ci.yml` ya corre lint + typecheck + test en cada push/PR. Un
siguiente paso natural sería añadir un job de deploy automático a un stage `dev`
en merges a `main`, usando `aws-actions/configure-aws-credentials` con un rol de
OIDC (sin credenciales de larga duración en GitHub Secrets).
