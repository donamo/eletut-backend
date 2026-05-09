import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthModule } from './auth/auth.module';
import { EgoStatesModule } from './ego-states/ego-states.module';
import { LabelsModule } from './labels/labels.module';
import { LifeEventsModule } from './life-events/life-events.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      sortSchema: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EgoStatesModule,
    LabelsModule,
    LifeEventsModule,
  ],
})
export class AppModule {}
