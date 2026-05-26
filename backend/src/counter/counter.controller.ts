import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { CounterService } from './counter.service';
import { CounterGateway } from './counter.gateway';

class UpdateCounterDto {
  god!: number;
  dog!: number;
}

@Controller('api/counter')
export class CounterController {
  constructor(
    private readonly counterService: CounterService,
    private readonly counterGateway: CounterGateway,
  ) {}

  @Get('today')
  async getToday() {
    const entry = await this.counterService.getToday();
    return (
      entry ?? {
        date: new Date().toISOString().split('T')[0],
        dog: 0,
        god: 0,
        limit: 100,
      }
    );
  }

  @Get('all')
  async getAll() {
    return this.counterService.getAll();
  }

  @Post()
  @HttpCode(200)
  async update(@Body() dto: UpdateCounterDto) {
    const entry = await this.counterService.upsertToday(dto.god, dto.dog);
    this.counterGateway.emitCounterUpdated(entry);
    return entry;
  }
}
