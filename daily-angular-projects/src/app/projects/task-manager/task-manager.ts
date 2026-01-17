import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-task-manager',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.css',
})
export class TaskManager {
  tasks: Task[] = [];
  newTaskTitle: string = '';
  newTaskPriority: 'low' | 'medium' | 'high' = 'medium';
  filter: 'all' | 'active' | 'completed' = 'all';

  addTask() {
    if (this.newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: this.newTaskTitle.trim(),
        completed: false,
        priority: this.newTaskPriority
      };
      this.tasks.push(newTask);
      this.newTaskTitle = '';
      this.newTaskPriority = 'medium';
    }
  }

  toggleTask(task: Task) {
    task.completed = !task.completed;
  }

  deleteTask(id: number) {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }

  get filteredTasks() {
    if (this.filter === 'active') {
      return this.tasks.filter(task => !task.completed);
    } else if (this.filter === 'completed') {
      return this.tasks.filter(task => task.completed);
    }
    return this.tasks;
  }

  get activeCount() {
    return this.tasks.filter(task => !task.completed).length;
  }
}
