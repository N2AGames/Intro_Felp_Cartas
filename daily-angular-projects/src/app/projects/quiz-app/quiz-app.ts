import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-quiz-app',
  imports: [CommonModule],
  templateUrl: './quiz-app.html',
  styleUrl: './quiz-app.css',
})
export class QuizApp {
  questions: Question[] = [
    {
      question: '¿Cuál es la capital de Francia?',
      options: ['Londres', 'París', 'Berlín', 'Madrid'],
      correctAnswer: 1
    },
    {
      question: '¿En qué año llegó el hombre a la Luna?',
      options: ['1965', '1969', '1972', '1975'],
      correctAnswer: 1
    },
    {
      question: '¿Cuál es el planeta más grande del sistema solar?',
      options: ['Saturno', 'Neptuno', 'Júpiter', 'Urano'],
      correctAnswer: 2
    },
    {
      question: '¿Quién pintó la Mona Lisa?',
      options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Miguel Ángel'],
      correctAnswer: 2
    },
    {
      question: '¿Cuál es el océano más grande?',
      options: ['Atlántico', 'Índico', 'Ártico', 'Pacífico'],
      correctAnswer: 3
    }
  ];

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  showResult = false;
  score = 0;
  answeredQuestions = 0;

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(index: number) {
    if (this.selectedAnswer === null) {
      this.selectedAnswer = index;
      if (index === this.currentQuestion.correctAnswer) {
        this.score++;
      }
      this.answeredQuestions++;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    } else {
      this.showResult = true;
    }
  }

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.showResult = false;
    this.score = 0;
    this.answeredQuestions = 0;
  }

  isCorrectAnswer(index: number): boolean {
    return this.selectedAnswer !== null && index === this.currentQuestion.correctAnswer;
  }

  isWrongAnswer(index: number): boolean {
    return this.selectedAnswer !== null && index === this.selectedAnswer && index !== this.currentQuestion.correctAnswer;
  }
}
