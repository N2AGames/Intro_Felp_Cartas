import { Component } from '@angular/core';
import { ProjectSelector } from './components/project-selector/project-selector';

@Component({
  selector: 'app-root',
  imports: [ProjectSelector],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Proyectos Angular Diarios';
}
