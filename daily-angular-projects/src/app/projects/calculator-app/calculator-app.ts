import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator-app',
  imports: [CommonModule],
  templateUrl: './calculator-app.html',
  styleUrl: './calculator-app.css',
})
export class CalculatorApp {
  display = '0';
  currentValue = '0';
  operator: string | null = null;
  previousValue: string | null = null;
  waitingForOperand = false;

  inputDigit(digit: string) {
    if (this.waitingForOperand) {
      this.display = digit;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === '0' ? digit : this.display + digit;
    }
    this.currentValue = this.display;
  }

  inputDecimal() {
    if (this.waitingForOperand) {
      this.display = '0.';
      this.waitingForOperand = false;
    } else if (this.display.indexOf('.') === -1) {
      this.display += '.';
    }
    this.currentValue = this.display;
  }

  clear() {
    this.display = '0';
    this.currentValue = '0';
    this.operator = null;
    this.previousValue = null;
    this.waitingForOperand = false;
  }

  performOperation(nextOperator: string) {
    const inputValue = parseFloat(this.currentValue);

    if (this.previousValue === null) {
      this.previousValue = this.currentValue;
    } else if (this.operator) {
      const currentVal = parseFloat(this.currentValue);
      const previousVal = parseFloat(this.previousValue);
      let result = 0;

      switch (this.operator) {
        case '+':
          result = previousVal + currentVal;
          break;
        case '-':
          result = previousVal - currentVal;
          break;
        case '*':
          result = previousVal * currentVal;
          break;
        case '/':
          result = previousVal / currentVal;
          break;
      }

      this.display = String(result);
      this.currentValue = String(result);
      this.previousValue = String(result);
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
  }

  calculate() {
    if (this.operator && this.previousValue !== null) {
      this.performOperation('=');
      this.operator = null;
      this.previousValue = null;
    }
  }
}
