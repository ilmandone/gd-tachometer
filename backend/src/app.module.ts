import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { CounterEntry } from './counter/counter.entity';
import { CounterModule } from './counter/counter.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import './envConfig';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: +(process.env.POSTGRES_PORT || 5432),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'gddb',
      entities: [CounterEntry],
      synchronize: true, // solo per sviluppo
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    CounterModule,
  ],
})
export class AppModule {}
