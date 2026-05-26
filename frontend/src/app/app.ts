import { Component, signal } from '@angular/core';
import { Main } from './components/main/main';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Main, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
