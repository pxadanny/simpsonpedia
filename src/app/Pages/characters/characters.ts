import { Component, OnInit, ChangeDetectorRef, HostListener,   } from '@angular/core';
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

 
showScrollTop = false;
  loading = true;
  isFetching = false;
  characters: Character[] = [];
  nextUrl: string | null = null;

  constructor(
    private simpsonsService: Simpsons,
    private cdr: ChangeDetectorRef // 🔥 AGREGADO
  ) {}

  @HostListener('window:scroll', [])
onScroll(): void {
  const scrollY = window.scrollY;

  this.showScrollTop = scrollY > 300;
  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 100; // margen

  if (scrollPosition >= threshold && !this.loading && this.nextUrl && !this.isFetching) {
    this.isFetching = true;
    this.loadCharacters(this.nextUrl);
  }
}
  ngOnInit() {
    this.loadCharacters();
  }

  loadCharacters( url?: string) {
    this.loading = true;

    this.simpsonsService.getCharacters(url).subscribe({
      next: (data) => {
        console.log("API RESPONSE:", data);

        this.characters = [...this.characters, ...data.results];
        this.loading = false;
        this.nextUrl = data.next;
        this.isFetching = false;

        this.cdr.detectChanges(); // 🔥 CLAVE
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.isFetching = false;

        this.cdr.detectChanges(); // 🔥 también aquí
      }
    });
  }
scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
  

}