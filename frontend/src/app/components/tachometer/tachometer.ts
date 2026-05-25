import { NgOptimizedImage, NgStyle } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-tachometer',
  imports: [NgOptimizedImage, NgStyle],
  templateUrl: './tachometer.html',
  styleUrl: './tachometer.scss',
})
export class Tachometer {
  current = input.required<number>();
  max = input.required<number>();

  rotation = computed(() => {
    const current = this.current();
    const max = this.max();

    if(current && max) {
      const ratio = current / max;      
      return Math.round(ratio * 216);
    }
    
    return 0;
  });
}
