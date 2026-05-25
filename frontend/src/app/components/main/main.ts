import { Component, computed, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { Tachometer } from '../tachometer/tachometer';
import { NgOptimizedImage } from '@angular/common';
import { Button } from '../button/button';
import { CounterService } from '../../services/counter.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { ValueType } from './main.utils';

@Component({
  selector: 'app-main',
  imports: [Tachometer, NgOptimizedImage, Button],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  private readonly INTERACTION_DEBOUNCE = 600;

  private _counterService = inject(CounterService);
  private _destroyRef = inject(DestroyRef);

  private _lastValue: ValueType = 'god';
  private _newValue: Record<ValueType, number> = {
    god: 0,
    dog: 0,
  };
  private _optimistic = signal<number>(0);
  private _todayData = toSignal(this._counterService.getToday());

  private _flush$ = new Subject<void>();
  private _flushSub = this._flush$
    .pipe(
      debounceTime(this.INTERACTION_DEBOUNCE),
      switchMap(() => {
        const { god, dog } = this._newValue;
        this._newValue = { god: 0, dog: 0 };
        return this._counterService.update(god, dog);
      }),
    )
    .subscribe({
      /*next: (entry) => {
        this._optimistic.set(0);
        // TODO: Need to refresh the data from backend - websocket ?
      },*/
      error: (err) => console.error('Errore durante il flush:', err),
    });

  current = computed(() => {
    const todayData = this._todayData();
    const base = todayData ? todayData.god + todayData.dog : 0;
    return base + this._optimistic();
  });

  day = computed(() => this._todayData()?.date ?? '01/01/1970');
  max = computed(() => this._todayData()?.limit ?? 100);

  constructor() {
    this._destroyRef.onDestroy(() => {
      this._flushSub?.unsubscribe();
    });
  }

  protected update(value?: ValueType) {
    const newValue = value ?? (this._lastValue === 'god' ? 'dog' : 'god');

    // TODO UPDATE THE ICON BY THE NEW VALUE

    this._lastValue = newValue;
    this._update(newValue);
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
    this._newValue[value] += 1;
    this._optimistic.update((v) => v + 1);
    this._flush$.next();
  }

  //#endregion
}
