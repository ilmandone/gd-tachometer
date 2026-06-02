import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CounterService } from './counter.service';

@Injectable()
export class CounterScheduler implements OnModuleInit {
  constructor(private readonly counterService: CounterService) {}

  async onModuleInit() {
    await this.counterService.initToday();
  }

  @Cron('1 0 * * *', {
    timeZone:
      process.env.COUNTER_TZ ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  async handleDailyInit() {
    await this.counterService.initToday();
  }
}
