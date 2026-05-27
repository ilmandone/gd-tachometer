import { Component, signal } from '@angular/core';
import { Button } from '../button/button';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-history',
  imports: [Button, Modal],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  showHistory = signal(false);
}
