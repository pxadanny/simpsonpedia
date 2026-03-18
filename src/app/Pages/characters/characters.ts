import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Simpsons } from '../../services/simpsons';
import { Character } from '../../models/character';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, Spinner],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
})
export class Characters implements OnInit {

  

  loading = true;
  characters: Character[] = [];
  nextUrl: string | null = null;
  prevUrl: string | null = null;

  constructor(
    private simpsonsService: Simpsons,
    private cdr: ChangeDetectorRef // 🔥 AGREGADO
  ) {}

  ngOnInit() {
    this.loadCharacters();
  }

  loadCharacters( url?: string) {
    this.loading = true;

    this.simpsonsService.getCharacters(url).subscribe({
      next: (data) => {
        console.log("API RESPONSE:", data);

        this.characters = [...data.results];
        this.loading = false;
        this.nextUrl = data.next;
        this.prevUrl = data.prev;

        this.cdr.detectChanges(); // 🔥 CLAVE
      },
      error: (err) => {
        console.error(err);
        this.loading = false;

        this.cdr.detectChanges(); // 🔥 también aquí
      }
    });
  }

  prevPage() {
    if (this.prevUrl) {
      this.loadCharacters(this.prevUrl);
    }
  }
  
  nextPage() {
    if (this.nextUrl) {
      this.loadCharacters(this.nextUrl);
    } }


}