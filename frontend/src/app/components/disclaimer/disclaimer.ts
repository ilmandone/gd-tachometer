import { Component, signal } from '@angular/core';
import {Button} from "../button/button";

@Component({
  selector: 'app-disclaimer',
  imports: [Button],
  templateUrl: './disclaimer.html',
  styleUrl: './disclaimer.scss',
})
export class Disclaimer {

  protected readonly showDisclaimer = signal<boolean>(false);
}
