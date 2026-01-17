import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectRotation, ProjectInfo } from '../../services/project-rotation';
import { TaskManager } from '../../projects/task-manager/task-manager';
import { WeatherDashboard } from '../../projects/weather-dashboard/weather-dashboard';
import { QuizApp } from '../../projects/quiz-app/quiz-app';
import { ColorPaletteGenerator } from '../../projects/color-palette-generator/color-palette-generator';
import { TimerApp } from '../../projects/timer-app/timer-app';
import { NotesApp } from '../../projects/notes-app/notes-app';
import { CalculatorApp } from '../../projects/calculator-app/calculator-app';

@Component({
  selector: 'app-project-selector',
  imports: [
    CommonModule,
    TaskManager,
    WeatherDashboard,
    QuizApp,
    ColorPaletteGenerator,
    TimerApp,
    NotesApp,
    CalculatorApp
  ],
  templateUrl: './project-selector.html',
  styleUrl: './project-selector.css',
})
export class ProjectSelector implements OnInit {
  todayProject!: ProjectInfo;
  allProjects: ProjectInfo[] = [];
  selectedProjectIndex!: number;
  showAllProjects = false;

  constructor(private projectRotation: ProjectRotation) {}

  ngOnInit() {
    this.todayProject = this.projectRotation.getTodayProject();
    this.allProjects = this.projectRotation.getAllProjects();
    this.selectedProjectIndex = this.allProjects.findIndex(p => p.id === this.todayProject.id);
  }

  selectProject(index: number) {
    this.selectedProjectIndex = index;
    this.showAllProjects = false;
  }

  get selectedProject() {
    return this.allProjects[this.selectedProjectIndex];
  }

  toggleProjectList() {
    this.showAllProjects = !this.showAllProjects;
  }
}

