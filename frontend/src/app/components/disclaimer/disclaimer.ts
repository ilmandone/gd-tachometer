import { Component, effect, signal } from '@angular/core';
import {Button} from "../button/button";
import { filter } from 'rxjs/internal/operators/filter';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-disclaimer',
  imports: [Button],
  templateUrl: './disclaimer.html',
  styleUrl: './disclaimer.scss',
})
export class Disclaimer {

  private readonly escKeyEvent = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    filter(event => event.key === 'Escape')
  );

  private escKeySubscription!: Subscription ;
  protected readonly showDisclaimer = signal<boolean>(false);

  constructor() {
    effect(() => {
      const sd = this.showDisclaimer();
      if (sd) 
        this.escKeySubscription = this.escKeyEvent.subscribe(() => this.showDisclaimer.set(false));
      else 
        this.escKeySubscription?.unsubscribe();
      
    })
  }
}
