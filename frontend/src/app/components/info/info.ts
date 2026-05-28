import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-info',
  imports: [NgOptimizedImage, Button],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {
  day = input.required<string>();
  current = input.required<number >();
  godIsBright = input.required<boolean>();
  dogIsBright = input.required<boolean>();

  keydown = output<void>();
  keyup = output<void>();

}
