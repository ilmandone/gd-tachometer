import { Component, computed, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, switchMap, tap } from 'rxjs';
import { CounterEntry, CounterService } from '../../services/counter.service';
import { SocketService } from '../../services/socket.service';
import { Info } from '../info/info';
import { Tachometer } from '../tachometer/tachometer';
import { ValueData, ValueType } from './main.utils';

@Component({
  selector: 'app-main',
  imports: [Tachometer, Info],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  private readonly INTERACTION_DEBOUNCE = 400;
  private readonly TAP_COUNTER_MAX = 10;
  private readonly _counterService = inject(CounterService);
  private readonly _socketService = inject(SocketService);

  private _lastValue: ValueType = 'god';
  private _tapCounter = 0;
  private _currentValue: ValueData = { god: 0, dog: 0 };

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
  readonly disabled = signal(false);

  // Must be declared after godBright/dogBright (field initializer order)
  private readonly _bright: Record<ValueType, WritableSignal<boolean>> = {
    god: this.godBright,
    dog: this.dogBright,
  };

  constructor() {
    this._counterService
      .getToday()
      .pipe(takeUntilDestroyed())
      .subscribe((entry) => this._serverData.set(entry));

    this._socketService
      .on<CounterEntry>('counter:updated')
      .pipe(takeUntilDestroyed())
      .subscribe((entry) => {
        this._serverData.set(entry);
        this._optimistic.set(0);
        this._currentValue = { god: 0, dog: 0 };
      });

    this._flush$
      .pipe(
        tap(() => {
          this._tapCounter += 1
          if(this._tapCounter > this.TAP_COUNTER_MAX) this.disabled.set(true)
        }),
        debounceTime(this.INTERACTION_DEBOUNCE),
        switchMap(() => {
          const payload = {
            ...this._currentValue
          };
          this._reset()
          return this._counterService.update(payload.god, payload.dog);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        error: (err) => console.error('Flush error:', err),
      });
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

  @HostListener('window:keyup.d')
  @HostListener('window:keyup.g')
  onKeyUp() {
    this.godBright.set(false);
    this.dogBright.set(false);
  }

  protected update(value?: ValueType, amount = 1) {
    if(this.disabled()) return

    const next = value ?? (this._lastValue === 'god' ? 'dog' : 'god');
    this._lastValue = next;
    this._currentValue[next] += 1;
    this._optimistic.update((v) => v + amount);

    this._bright[next].set(true);
    this._playSound(this._sounds[next]);

    this._flush$.next();
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

  private _reset () {
    this._currentValue = { god: 0, dog: 0 };
    this._tapCounter = 0;
    this.disabled.set(false)
  }
}
