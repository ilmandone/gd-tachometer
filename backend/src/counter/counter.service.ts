import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CounterEntry } from './counter.entity';
import { Repository } from 'typeorm';
import { DEFAULT_LIMIT } from './counter.utils';

@Injectable()
export class CounterService {
  constructor(
    @InjectRepository(CounterEntry)
    private readonly counterRepository: Repository<CounterEntry>,
  ) {}

  async getToday(): Promise<CounterEntry | null> {
    const today = this.getTodayString();
    return this.counterRepository.findOne({ where: { date: today } });
  }

  async getAll(): Promise<CounterEntry[]> {
    return this.counterRepository.find({ order: { date: 'ASC' } });
  }

  async initToday(): Promise<void> {
    const today = this.getTodayString();
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
    const today = this.getTodayString();
    let entry = await this.counterRepository.findOne({
      where: { date: today },
    });

    if (entry) {
      entry.god += god;
      entry.dog += dog;
    } else {
      entry = this.counterRepository.create({ date: today, god, dog });
    }

    return this.counterRepository.save(entry);
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
