import { Component } from '@angular/core';
import { Disclaimer } from '../disclaimer/disclaimer';

@Component({
  selector: 'footer [app]',
  imports: [Disclaimer],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
