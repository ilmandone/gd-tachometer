import { Component } from '@angular/core';

@Component({
  selector: 'button [app]',
  imports: [],
  template: `    
      <ng-content></ng-content>    
  `,
  styleUrl: './button.scss'
})
export class Button {}
