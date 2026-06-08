import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CounterEntry } from './counter.entity';
import { Repository } from 'typeorm';
import { DEFAULT_LIMIT, getDateString, TAP_COUNTER_MAX } from './counter.utils';

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
      let limit = DEFAULT_LIMIT;

      // Try to get the last day saved
      const lastEntry = await this.counterRepository.findOne({
        where: {},
        order: { id: 'DESC' },
      });

      if (lastEntry) {
        const sum = lastEntry.god + lastEntry.dog;
        const limitCandidate = this.calculateLimitCandidate(sum);

        limit = limitCandidate < DEFAULT_LIMIT ? DEFAULT_LIMIT : limitCandidate;
      }

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

  /**
   * This function return a number with 2 sig digits, divisible by 12
   * and with a division result that also have 2 sig digits.
   * @param sum
   * @private
   */
  private calculateLimitCandidate(sum: number): number {
    if (sum <= 0) return 0;

    let bestL = 0;
    let minDiff = Infinity;

    // We look for M such that M has max 2 sig digits AND L = M * 12 has max 2 sig digits
    // M = digits * 10^exp
    for (let exp = -1; exp <= 6; exp++) {
      const factor = Math.pow(10, exp);

      for (let digits = 1; digits <= 99; digits++) {
        const M = digits * factor;
        const L = M * 12;

        if (Number.isInteger(L) && this.hasMaxTwoSignificantDigits(L)) {
          const diff = Math.abs(L - sum);
          if (diff < minDiff) {
            minDiff = diff;
            bestL = L;
          } else if (diff === minDiff && L > bestL) {
            bestL = L;
          }
        }
      }
    }

    return bestL;
  }

  private hasMaxTwoSignificantDigits(n: number): boolean {
    if (n === 0) return true;
    const s = Math.abs(n).toString().replace(/0+$/, '');
    return s.length <= 2;
  }
}
