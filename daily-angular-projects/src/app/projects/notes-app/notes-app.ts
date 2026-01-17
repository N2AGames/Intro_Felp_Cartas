import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

@Component({
  selector: 'app-notes-app',
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-app.html',
  styleUrl: './notes-app.css',
})
export class NotesApp {
  notes: Note[] = [];
  showAddForm = false;
  editingNote: Note | null = null;
  
  newNoteTitle = '';
  newNoteContent = '';

  addNote() {
    if (this.newNoteTitle.trim() && this.newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now(),
        title: this.newNoteTitle.trim(),
        content: this.newNoteContent.trim(),
        createdAt: new Date()
      };
      this.notes.unshift(newNote);
      this.resetForm();
    }
  }

  startEdit(note: Note) {
    this.editingNote = { ...note };
    this.showAddForm = false;
  }

  saveEdit() {
    if (this.editingNote && this.editingNote.title.trim() && this.editingNote.content.trim()) {
      const index = this.notes.findIndex(n => n.id === this.editingNote!.id);
      if (index !== -1) {
        this.notes[index] = { ...this.editingNote };
      }
      this.editingNote = null;
    }
  }

  cancelEdit() {
    this.editingNote = null;
  }

  deleteNote(id: number) {
    this.notes = this.notes.filter(note => note.id !== id);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.editingNote = null;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newNoteTitle = '';
    this.newNoteContent = '';
    this.showAddForm = false;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
