import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounterEntry } from './counter.entity';
import { CounterService } from './counter.service';
import { CounterController } from './counter.controller';
import { CounterScheduler } from './counter.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([CounterEntry])],
  providers: [CounterService, CounterScheduler],
  controllers: [CounterController],
})
export class CounterModule {}
