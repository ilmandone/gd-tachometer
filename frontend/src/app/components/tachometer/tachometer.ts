import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, Signal } from '@angular/core';

const GAUGE_ARC_DEG = 216;

@Component({
  selector: 'app-tachometer',
  imports: [NgOptimizedImage],
  templateUrl: './tachometer.html',
  styleUrl: './tachometer.scss',
})
export class Tachometer {
  readonly current = input.required<number>();
  readonly max = input.required<number>();
  readonly disabled = input.required<boolean>();

  readonly overRpm = computed(() => {
    if (this.disabled()) return false;
    return this.current() > this.max();
  });

  readonly rotation = computed(() => {
    if (this.disabled()) return 0;
    const max = this.max();
    if (max <= 0) return 0;
    return Math.round((this.current() / max) * GAUGE_ARC_DEG);
  });

  readonly data: Signal<{
    ticks: number[];
    divider: number;
  }> = computed(() => {
    const max = this.max();

    if (max <= 0)
      return {
        ticks: [0, 42, 84, 100],
        divider: 1,
      };

    const tick = max / 12;

    const amountOfZeroDigits = Math.abs(tick).toString().replace(/[1-9]/g, '').length;
    const divider = 10 ** amountOfZeroDigits;

    return {
      ticks: [
        0,
        Math.floor((tick * 5) / divider),
        Math.floor((tick * 10) / divider),
        max / divider,
      ],
      divider,
    };
  });
}
