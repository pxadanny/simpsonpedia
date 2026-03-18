import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Simpsons } from '../../services/simpsons';
import { Episode } from '../../models/episode';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-episodes',
  imports: [CommonModule, Spinner],
  templateUrl: './episodes.html',
  styleUrl: './episodes.css',
})
export class Episodes implements OnInit {
   
  showScrollTop = false;
    loading = true;
    isFetching = false;
    episodes: Episode[] = [];
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
      this.loadEpisodes(this.nextUrl);
    }
  }
    ngOnInit() {
      this.loadEpisodes();
    }
  
    loadEpisodes( url?: string) {
      this.loading = true;
  
      this.simpsonsService.getEpisodes(url).subscribe({
        next: (data) => {
          console.log("API RESPONSE:", data);
  
          this.episodes = [...this.episodes , ...data.results];
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
