import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timer-app',
  imports: [CommonModule, FormsModule],
  templateUrl: './timer-app.html',
  styleUrl: './timer-app.css',
})
export class TimerApp implements OnDestroy {
  mode: 'stopwatch' | 'countdown' = 'stopwatch';
  
  stopwatchTime = 0;
  stopwatchRunning = false;
  stopwatchInterval: ReturnType<typeof setInterval> | null = null;

  countdownMinutes = 1;
  countdownSeconds = 0;
  countdownTime = 60;
  countdownRunning = false;
  countdownInterval: ReturnType<typeof setInterval> | null = null;

  get stopwatchDisplay(): string {
    const minutes = Math.floor(this.stopwatchTime / 60);
    const seconds = this.stopwatchTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get countdownDisplay(): string {
    const minutes = Math.floor(this.countdownTime / 60);
    const seconds = this.countdownTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startStopwatch() {
    if (!this.stopwatchRunning) {
      this.stopwatchRunning = true;
      this.stopwatchInterval = setInterval(() => {
        this.stopwatchTime++;
      }, 1000);
    }
  }

  stopStopwatch() {
    this.stopwatchRunning = false;
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
    }
  }

  resetStopwatch() {
    this.stopStopwatch();
    this.stopwatchTime = 0;
  }

  startCountdown() {
    if (!this.countdownRunning) {
      if (this.countdownTime === 0) {
        this.countdownTime = this.countdownMinutes * 60 + this.countdownSeconds;
      }
      
      this.countdownRunning = true;
      this.countdownInterval = setInterval(() => {
        if (this.countdownTime > 0) {
          this.countdownTime--;
        } else {
          this.stopCountdown();
        }
      }, 1000);
    }
  }

  stopCountdown() {
    this.countdownRunning = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  resetCountdown() {
    this.stopCountdown();
    this.countdownTime = this.countdownMinutes * 60 + this.countdownSeconds;
  }

  setCountdownTime() {
    this.countdownTime = this.countdownMinutes * 60 + this.countdownSeconds;
  }

  ngOnDestroy() {
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
