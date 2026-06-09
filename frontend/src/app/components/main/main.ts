import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, switchMap, tap } from 'rxjs';
import { CounterEntry, CounterService } from '../../services/counter.service';
import { SocketService } from '../../services/socket.service';
import { Info } from '../info/info';
import { Tachometer } from '../tachometer/tachometer';
import { INTERACTION_DEBOUNCE, TAP_COUNTER_MAX, ValueData, ValueType } from './main.utils';

@Component({
  selector: 'app-main',
  imports: [Tachometer, Info],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {

  private readonly _counterService = inject(CounterService);
  private readonly _socketService = inject(SocketService);

  private _lastValue: ValueType = 'god';
  private _currentValue: ValueData = { god: 0, dog: 0 };

  private readonly _optimistic = signal(0);
  private readonly _serverData = signal<CounterEntry | undefined>(undefined);
  private readonly _tapCounter = signal<number>(0);

  private readonly _sounds: Record<ValueType, HTMLAudioElement> = {
    god: this._createAudioElement('/sounds/god.mp3'),
    dog: this._createAudioElement('/sounds/dog.mp3'),
  };

  private readonly _alarmSound: HTMLAudioElement = this._createAudioElement('/sounds/alarm.mp3');

  private readonly _flush$ = new Subject<number>();

  readonly current = computed(() => {
    const server = this._serverData();
    return (server ? server.god + server.dog : 0) + this._optimistic();
  });

  readonly disabled = computed(() => this._tapCounter() > TAP_COUNTER_MAX - 1);
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

    effect(() => {
      const disabled = this.disabled()
      if(disabled) void this._alarmSound.play()
    })

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
        tap((amount) => {
          this._tapCounter.update((v) => v + amount);
        }),
        debounceTime(INTERACTION_DEBOUNCE),
        switchMap(() => {
          const payload = {
            ...this._currentValue,
          };
          this._reset();
          return this._counterService.update(payload.god, payload.dog);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        error: (err) => console.error('Flush error:', err),
      });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: Event) {
    const e = event as KeyboardEvent
    const key = e.key.toLowerCase()

    if(e.repeat || (key !== 'd' && key !== 'g')) return

    const capsLock = e.getModifierState('CapsLock');
    const isCapital = capsLock ? !e.shiftKey : e.shiftKey
    console.log(isCapital);

    this.update(key === 'd' ? 'dog' : 'god', isCapital ? 3 : 1);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: Event) {
    const e = event as KeyboardEvent;
    const key = e.key.toLowerCase();

    if (key !== 'd' && key !== 'g') return;

    this.pointerUp()
  }

  protected pointerUp() {
    this.godBright.set(false);
    this.dogBright.set(false);
  }

  protected update(value?: ValueType, amount = 1) {
    if (this.disabled()) return;

    const next = value ?? (this._lastValue === 'god' ? 'dog' : 'god');
    this._lastValue = next;
    this._currentValue[next] += amount;
    this._optimistic.update((v) => v + amount);

    this._bright[next].set(true);
    this._playSound(this._sounds[next]);

    this._flush$.next(amount);
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
    void audio.play();
  }

  private _reset() {
    this._currentValue = { god: 0, dog: 0 };
    this._tapCounter.set(0);
  }
}
