import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
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
  errorMessage: string | null = null;
  episodes: Episode[] = [];
  nextUrl: string | null = null;
  failedImages = new Set<number>();

  constructor(
    private readonly simpsonsService: Simpsons,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEpisodes();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 240;

    if (scrollPosition >= threshold && this.nextUrl && !this.isFetching) {
      this.loadEpisodes(this.nextUrl);
    }
  }

  loadEpisodes(url?: string): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.loading = this.episodes.length === 0;
    this.errorMessage = null;

    this.simpsonsService.getEpisodes(url).subscribe({
      next: (data) => {
        this.episodes = [...this.episodes, ...data.results];
        this.nextUrl = data.next;
        this.loading = false;
        this.isFetching = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'We could not load the episodes. Please try again.';
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

  trackById(_index: number, episode: Episode): number {
    return episode.id;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
