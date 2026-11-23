import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Simpsons } from '../../services/simpsons';
import { Character } from '../../models/character';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-characters',
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
})
export class Characters implements OnInit {
  showScrollTop = false;
  loading = true;
  isFetching = false;
  errorMessage: string | null = null;
  characters: Character[] = [];
  nextUrl: string | null = null;
  failedImages = new Set<number>();

  constructor(
    private readonly simpsonsService: Simpsons,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 240;

    if (scrollPosition >= threshold && this.nextUrl && !this.isFetching) {
      this.loadCharacters(this.nextUrl);
    }
  }

  loadCharacters(url?: string): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.loading = this.characters.length === 0;
    this.errorMessage = null;

    this.simpsonsService.getCharacters(url).subscribe({
      next: (data) => {
        this.characters = [...this.characters, ...data.results];
        this.nextUrl = data.next;
        this.loading = false;
        this.isFetching = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'We could not load the characters. Please try again.';
        this.loading = false;
        this.isFetching = false;
        this.cdr.markForCheck();
      },
    });
  }

  markImageFailed(id: number): void {
    this.failedImages.add(id);
    this.cdr.markForCheck();
  }

  imageUrl(path: string | null | undefined): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }

  trackById(_index: number, character: Character): number {
    return character.id;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
