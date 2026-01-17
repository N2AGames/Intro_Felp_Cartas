import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-palette-generator',
  imports: [CommonModule],
  templateUrl: './color-palette-generator.html',
  styleUrl: './color-palette-generator.css',
})
export class ColorPaletteGenerator {
  colors: string[] = [];
  copiedIndex: number | null = null;

  constructor() {
    this.generatePalette();
  }

  generatePalette() {
    this.colors = [];
    for (let i = 0; i < 5; i++) {
      this.colors.push(this.generateRandomColor());
    }
  }

  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  copyToClipboard(color: string, index: number) {
    navigator.clipboard.writeText(color).then(() => {
      this.copiedIndex = index;
      setTimeout(() => {
        this.copiedIndex = null;
      }, 2000);
    });
  }
}
