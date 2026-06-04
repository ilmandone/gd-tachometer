import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';

const GAUGE_ARC_DEG = 216;
const LEFT_MARK_RATIO = 90 / GAUGE_ARC_DEG;
const TOP_MARK_RATIO = 180 / GAUGE_ARC_DEG;

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
    return this.current() > this.max()
  });

  readonly rotation = computed(() => {
    if (this.disabled()) return 0;
    const max = this.max();
    if (max <= 0) return 0;
    return Math.round((this.current() / max) * GAUGE_ARC_DEG);
  });

  readonly values = computed(() => {
    const max = this.max();
    if (max <= 0) return [0, 42, 84, 100];
    const tick = max / 10;
    return [
      0,
      Math.floor(tick * LEFT_MARK_RATIO),
      Math.floor(tick * TOP_MARK_RATIO),
      Math.floor(tick),
    ];
  });
}
