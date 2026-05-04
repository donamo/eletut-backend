import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { printSchema } from 'graphql';
import * as YAML from 'yaml';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const outputDir = join(process.cwd(), 'docs', 'generated');

async function generate() {
  process.env.SESSION_SECRET ??= 'docs-generation-secret';
  process.env.DATABASE_URL ??=
    'postgresql://postgres:postgres@127.0.0.1:5432/eletut_docs';
  process.env.GOOGLE_CLIENT_ID ??= 'docs-client-id';
  process.env.GOOGLE_CLIENT_SECRET ??= 'docs-client-secret';
  process.env.GOOGLE_CALLBACK_URL ??=
    'http://localhost:3000/auth/callback/google';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue({
      $connect: async () => undefined,
      $disconnect: async () => undefined,
    })
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const gqlSchemaHost = app.get(GraphQLSchemaHost);
  const graphqlSchema = printSchema(gqlSchemaHost.schema);

  const openApiConfig = new DocumentBuilder()
    .setTitle('Eletut Backend API')
    .setDescription('REST API for the Eletvonal MVP backend.')
    .setVersion('0.1.0')
    .addCookieAuth('connect.sid', { type: 'apiKey' }, 'connect.sid')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
  if (
    openApiDocument.components?.schemas &&
    Object.keys(openApiDocument.components.schemas).length === 0
  ) {
    delete openApiDocument.components.schemas;
  }

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'schema.graphql'), graphqlSchema),
    writeFile(join(outputDir, 'openapi.yaml'), YAML.stringify(openApiDocument)),
  ]);

  await app.close();
}

generate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
