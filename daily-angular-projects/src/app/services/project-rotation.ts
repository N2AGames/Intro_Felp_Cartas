import { Injectable } from '@angular/core';

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  component: any;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectRotation {
  private projects: ProjectInfo[] = [
    {
      id: 'task-manager',
      name: 'Gestor de Tareas',
      description: 'Una aplicación para gestionar tus tareas diarias con prioridades y estados.',
      component: null // Will be set dynamically
    },
    {
      id: 'weather-dashboard',
      name: 'Dashboard del Clima',
      description: 'Visualiza información meteorológica con gráficos y datos simulados.',
      component: null
    },
    {
      id: 'quiz-app',
      name: 'Aplicación de Quiz',
      description: 'Pon a prueba tus conocimientos con preguntas interactivas.',
      component: null
    },
    {
      id: 'color-palette-generator',
      name: 'Generador de Paletas de Colores',
      description: 'Crea y explora hermosas paletas de colores para tus proyectos.',
      component: null
    },
    {
      id: 'timer-app',
      name: 'Temporizador y Cronómetro',
      description: 'Una aplicación de temporizador con cronómetro y cuenta regresiva.',
      component: null
    },
    {
      id: 'notes-app',
      name: 'Bloc de Notas',
      description: 'Toma notas rápidas con formato y almacenamiento local.',
      component: null
    },
    {
      id: 'calculator-app',
      name: 'Calculadora',
      description: 'Una calculadora funcional con operaciones básicas y avanzadas.',
      component: null
    }
  ];

  getTodayProject(): ProjectInfo {
    const today = new Date();
    const dayOfYear = this.getDayOfYear(today);
    const projectIndex = dayOfYear % this.projects.length;
    return this.projects[projectIndex];
  }

  getAllProjects(): ProjectInfo[] {
    return this.projects;
  }

  getProjectByIndex(index: number): ProjectInfo {
    return this.projects[index % this.projects.length];
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
}
