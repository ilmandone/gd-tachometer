import { Component, signal } from '@angular/core';
import { CounterService } from './services/counter.service';
import { Main } from './components/main/main';

@Component({
  selector: 'app-root',
  imports: [Main],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
