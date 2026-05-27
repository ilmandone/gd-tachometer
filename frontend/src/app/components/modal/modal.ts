import { Component, effect, model } from '@angular/core';
import { Button } from '../button/button';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { filter } from 'rxjs/internal/operators/filter';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-modal',
  imports: [Button],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  host: {
    '[class.show]': 'show()',
  },
})
export class Modal {
  private readonly escKeyEvent = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    filter((event) => event.key === 'Escape'),
  );
  private escKeySubscription!: Subscription ;
  show = model<boolean>(false);
  
  constructor() {
    effect(() => {
      const sd = this.show();
      if (sd)
        this.escKeySubscription = this.escKeyEvent.subscribe(() => this.show.set(false));
      else this.escKeySubscription?.unsubscribe();
    });
  }
}
