import { Component, input } from '@angular/core';
import { buttonType } from './button.types';

@Component({
  selector: 'button [app]',
  imports: [],
  template: `    
      <ng-content></ng-content>    
  `,
  styleUrl: './button.scss',
  host: {
    '[class]': "variant()",
  },
})
export class Button {
  variant = input<buttonType>('primary');
}
