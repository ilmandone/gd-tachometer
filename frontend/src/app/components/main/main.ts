import { Component, computed, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { Tachometer } from '../tachometer/tachometer';
import { NgOptimizedImage } from '@angular/common';
import { Button } from '../button/button';
import { CounterEntry, CounterService } from '../../services/counter.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { ValueType } from './main.utils';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-main',
  imports: [Tachometer, NgOptimizedImage, Button],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  private readonly INTERACTION_DEBOUNCE = 600;
  private readonly _counterService = inject(CounterService);
  private readonly _socketService = inject(SocketService);

  private _lastValue: ValueType = 'god';
  private _newValue: Record<ValueType, number> = { god: 0, dog: 0 };
  private readonly _optimistic = signal(0);
  private readonly _serverData = signal<CounterEntry | undefined>(undefined);

  private readonly _sounds: Record<ValueType, HTMLAudioElement> = {
    god: this._createAudioElement('/sounds/god.mp3'),
    dog: this._createAudioElement('/sounds/dog.mp3'),
  };

  private readonly _flush$ = new Subject<void>();

  readonly current = computed(() => {
    const server = this._serverData();
    return (server ? server.god + server.dog : 0) + this._optimistic();
  });
  readonly day = computed(() => this._serverData()?.date ?? '');
  readonly max = computed(() => this._serverData()?.limit ?? 100);

  readonly godBright = signal(false);
  readonly dogBright = signal(false);

  // Must be declared after godBright/dogBright (field initializer order)
  private readonly _bright: Record<ValueType, WritableSignal<boolean>> = {
    god: this.godBright,
    dog: this.dogBright,
  };

  constructor() {
    this._counterService.getToday()
      .pipe(takeUntilDestroyed())
      .subscribe((entry) => this._serverData.set(entry));

    this._socketService.on<CounterEntry>('counter:updated')
      .pipe(takeUntilDestroyed())
      .subscribe((entry) => {
        this._serverData.set(entry);
        this._optimistic.set(0);
        this._newValue = { god: 0, dog: 0 };
      });

    this._flush$
      .pipe(
        debounceTime(this.INTERACTION_DEBOUNCE),
        switchMap(() => {
          const server = this._serverData();
          const payload = {
            god: (server?.god ?? 0) + this._newValue.god,
            dog: (server?.dog ?? 0) + this._newValue.dog,
          };
          this._newValue = { god: 0, dog: 0 };
          return this._counterService.update(payload.god, payload.dog);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        error: (err) => console.error('Flush error:', err),
      });
  }

  @HostListener('window:keydown.enter', ['$event'])
  onKeyEnter(event: Event) {
    if ((event as KeyboardEvent).repeat) return;
    this.update();
  }

  @HostListener('window:keydown.d', ['$event'])
  onKeyD(event: Event) {
    if ((event as KeyboardEvent).repeat) return;
    this.update('dog');
  }

  @HostListener('window:keydown.g', ['$event'])
  onKeyG(event: Event) {
    if ((event as KeyboardEvent).repeat) return;
    this.update('god');
  }

  @HostListener('window:mouseup')
  @HostListener('window:keyup.enter')
  @HostListener('window:keyup.d')
  @HostListener('window:keyup.g')
  onKeyUp() {
    this.godBright.set(false);
    this.dogBright.set(false);
  }

  protected update(value?: ValueType) {
    const next = value ?? (this._lastValue === 'god' ? 'dog' : 'god');
    this._lastValue = next;
    this._newValue[next] += 1;
    this._optimistic.update((v) => v + 1);
    this._flush$.next();
    this._playSound(this._sounds[next]);
    this._bright[next].set(true);
  }

  private _createAudioElement(src: string): HTMLAudioElement {
    const audio = new Audio();
    const source = document.createElement('source');
    source.src = src;
    source.type = 'audio/mpeg';
    audio.appendChild(source);
    audio.load();
    return audio;
  }

  private _playSound(audio: HTMLAudioElement): void {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }
}
