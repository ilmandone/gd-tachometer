import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounterEntry } from './counter.entity';
import { CounterService } from './counter.service';
import { CounterController } from './counter.controller';
import { CounterScheduler } from './counter.scheduler';
import { CounterGateway } from './counter.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([CounterEntry])],
  providers: [CounterService, CounterScheduler, CounterGateway],
  controllers: [CounterController],
})
export class CounterModule {}
