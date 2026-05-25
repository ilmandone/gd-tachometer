import { Component, computed, input, signal } from '@angular/core';
import { Tachometer } from '../tachometer/tachometer';
import { NgOptimizedImage } from '@angular/common';
import { Button } from '../button/button';
import { CounterService } from '../../services/counter.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main',
  imports: [Tachometer, NgOptimizedImage, Button],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  private _counterService = new CounterService();

  private _today = toSignal(this._counterService.getToday());

  current = computed(() => {
    const today = this._today();
    return today ? today.god + today.dog : 0;
  });

  day = computed(() => this._today()?.date ?? '01/01/1970');
  max = computed(() => this._today()?.limit ?? 100);
}
