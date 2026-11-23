import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Simpsons } from '../../services/simpsons';
import { Location } from '../../models/location';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit {
  showScrollTop = false;
  loading = true;
  isFetching = false;
  errorMessage: string | null = null;
  locations: Location[] = [];
  nextUrl: string | null = null;
  failedImages = new Set<number>();

  constructor(
    private readonly simpsonsService: Simpsons,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > 300;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 240;

    if (scrollPosition >= threshold && this.nextUrl && !this.isFetching) {
      this.loadLocations(this.nextUrl);
    }
  }

  loadLocations(url?: string): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.loading = this.locations.length === 0;
    this.errorMessage = null;

    this.simpsonsService.getLocations(url).subscribe({
      next: (data) => {
        this.locations = [...this.locations, ...data.results];
        this.nextUrl = data.next;
        this.loading = false;
        this.isFetching = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'We could not load the locations. Please try again.';
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

  trackById(_index: number, location: Location): number {
    return location.id;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
