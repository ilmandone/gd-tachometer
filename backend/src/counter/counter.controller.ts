import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { CounterService } from './counter.service';

class UpdateCounterDto {
  god!: number;
  dog!: number;
}

@Controller('api/counter')
export class CounterController {
  constructor(private readonly counterService: CounterService) {}

  // GET /api/counter/today
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

  // GET /api/counter/all
  @Get('all')
  async getAll() {
    return this.counterService.getAll();
  }

  // POST /api/counter
  @Post()
  @HttpCode(200)
  async update(@Body() dto: UpdateCounterDto) {
    return this.counterService.upsertToday(dto.god, dto.dog);
  }
}
