import { Component, computed, HostListener, input, signal } from '@angular/core';
import { Tachometer } from '../tachometer/tachometer';
import { NgOptimizedImage } from '@angular/common';
import { Button } from '../button/button';
import { CounterService } from '../../services/counter.service';
import { toSignal } from '@angular/core/rxjs-interop';

type ValueType = 'dog' | 'god'

@Component({
  selector: 'app-main',
  imports: [Tachometer, NgOptimizedImage, Button],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  private _counterService = new CounterService();

  private _lastValue: ValueType = 'god';
  private _today = toSignal(this._counterService.getToday());
  private _newValue: Record<ValueType, number> = {
    god: 0,
    dog: 0,
  }

  current = computed(() => {
    const today = this._today();
    return today ? today.god + today.dog : 0;
  });

  day = computed(() => this._today()?.date ?? '01/01/1970');
  max = computed(() => this._today()?.limit ?? 100);

  // Update the dog or god looking to the last value

  protected update(value?: ValueType) {
    const newValue = value ?? (this._lastValue === 'god' ? 'dog' : 'god');

    // TODO UPDATE THE ICON BY THE NEW VALUE

    this._lastValue = newValue
    this._update(newValue)
  }

  @HostListener('window:keydown.enter')
  onEnter() {
    this.update();
  }

  @HostListener('window:keydown.d')
  onD() {
    this.update('dog');
  }

  @HostListener('window:keydown.c')
  onC() {
    this.update('god');
  }

  //#region Privates

  private _update(value: ValueType): void {
    this._newValue[value] += 1
  }

  //#endregion
}
