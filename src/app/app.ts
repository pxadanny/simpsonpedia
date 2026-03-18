import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './Components/nav/nav';
import { Header } from './Components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav,Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('simpsonpedia');
}
