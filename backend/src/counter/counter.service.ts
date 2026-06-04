import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CounterEntry } from './counter.entity';
import { Repository } from 'typeorm';
import { DEFAULT_LIMIT, TAP_COUNTER_MAX, getDateString } from './counter.utils';

@Injectable()
export class CounterService {
  constructor(
    @InjectRepository(CounterEntry)
    private readonly counterRepository: Repository<CounterEntry>,
  ) {}

  async getToday(): Promise<CounterEntry | null> {
    const today = getDateString(process.env.COUNTER_TZ);
    return this.counterRepository.findOne({ where: { date: today } });
  }

  async getAll(): Promise<CounterEntry[]> {
    return this.counterRepository.find({ order: { date: 'ASC' } });
  }

  async initToday(): Promise<void> {
    const today = getDateString(process.env.COUNTER_TZ);
    const exists = await this.counterRepository.findOne({
      where: { date: today },
    });
    if (!exists) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayString = yesterday.toISOString().split('T')[0];
      const yesterdayEntry = await this.counterRepository.findOne({
        where: { date: yesterdayString },
      });

      const limitCandidate = yesterdayEntry
        ? yesterdayEntry.god + yesterdayEntry.dog
        : 0;

      const limit =
        limitCandidate < DEFAULT_LIMIT ? DEFAULT_LIMIT : limitCandidate;

      await this.counterRepository.save(
        this.counterRepository.create({ date: today, god: 0, dog: 0, limit }),
      );
    }
  }

  async upsertToday(god: number, dog: number): Promise<CounterEntry> {
    const today = getDateString(process.env.COUNTER_TZ);
    let entry = await this.counterRepository.findOne({
      where: { date: today },
    });

    if (entry) {
      const limit = process.env.MAX_DOGS_AND_DOGS
        ? Number(process.env.MAX_DOGS_AND_DOGS)
        : TAP_COUNTER_MAX;

      if (god + dog < limit) {
        entry.god += god;
        entry.dog += dog;
      }
    } else {
      entry = this.counterRepository.create({ date: today, god, dog });
    }

    return this.counterRepository.save(entry);
  }
}
