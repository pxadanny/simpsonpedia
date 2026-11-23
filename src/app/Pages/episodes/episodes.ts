import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Simpsons } from '../../services/simpsons';
import { Episode } from '../../models/episode';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-episodes',
  imports: [CommonModule, RouterLink, Spinner],
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
    private readonly simpsonsService: Simpsons,
    private readonly cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 100;

    if (scrollPosition >= threshold && !this.loading && this.nextUrl && !this.isFetching) {
      this.isFetching = true;
      this.loadEpisodes(this.nextUrl);
    }
  }

  ngOnInit(): void {
    this.loadEpisodes();
  }

  loadEpisodes(url?: string): void {
    this.loading = true;

    this.simpsonsService.getEpisodes(url).subscribe({
      next: (data) => {
        this.episodes = [...this.episodes, ...data.results];
        this.nextUrl = data.next;
        this.loading = false;
        this.isFetching = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.isFetching = false;
        this.cdr.markForCheck();
      },
    });
  }

  imageUrl(path: string | null | undefined): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
