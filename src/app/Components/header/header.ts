import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RandomDiscovery } from '../../services/random-discovery';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  query = '';
  randomLoading = false;
  randomError: string | null = null;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    private readonly randomDiscovery: RandomDiscovery,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.syncQuery();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.syncQuery());
  }

  submitSearch(): void {
    const query = this.query.trim();
    if (query.length < 2) return;
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  discoverRandom(): void {
    if (this.randomLoading) return;
    this.randomLoading = true;
    this.randomError = null;

    this.randomDiscovery.pick().pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (destination) => {
        void this.router.navigate(['/', destination.category, destination.id])
          .then((navigated) => {
            this.randomLoading = false;
            if (!navigated) this.randomError = 'Could not open that page. Please try again.';
            this.cdr.markForCheck();
          })
          .catch(() => this.showRandomError());
      },
      error: () => this.showRandomError(),
    });
  }

  clearRandomError(): void {
    this.randomError = null;
  }

  private showRandomError(): void {
    this.randomLoading = false;
    this.randomError = 'D’oh! Could not find a random discovery. Please try again.';
    this.cdr.markForCheck();
  }

  private syncQuery(): void {
    const tree = this.router.parseUrl(this.router.url);
    this.query = tree.root.children['primary']?.segments[0]?.path === 'search'
      ? (tree.queryParams['q'] || '')
      : '';
  }
}
