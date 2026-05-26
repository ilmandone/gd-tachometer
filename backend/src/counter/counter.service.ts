import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CounterEntry } from './counter.entity';
import { Repository } from 'typeorm';

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
      await this.counterRepository.save(
        this.counterRepository.create({ date: today, god: 0, dog: 0 }),
      );
    }
  }

  async upsertToday(god: number, dog: number): Promise<CounterEntry> {
    const today = this.getTodayString();
    let entry = await this.counterRepository.findOne({
      where: { date: today },
    });

    if (entry) {
      entry.god = god;
      entry.dog = dog;
    } else {
      entry = this.counterRepository.create({ date: today, god, dog });
    }

    return this.counterRepository.save(entry);
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
