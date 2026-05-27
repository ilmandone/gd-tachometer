import { Component, effect, signal } from '@angular/core';
import {Button} from "../button/button";
import { filter } from 'rxjs/internal/operators/filter';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { Subscription } from 'rxjs/internal/Subscription';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-disclaimer',
  imports: [Button, Modal],
  templateUrl: './disclaimer.html',
  styleUrl: './disclaimer.scss',
})
export class Disclaimer {
  protected readonly showDisclaimer = signal<boolean>(false);

}
