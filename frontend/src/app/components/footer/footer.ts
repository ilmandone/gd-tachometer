import { Component } from '@angular/core';
import { Disclaimer } from '../disclaimer/disclaimer';
import { History } from '../history/history';

@Component({
  selector: 'footer [app]',
  imports: [Disclaimer, History],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
