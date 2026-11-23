import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  query = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly router: Router) {}

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
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  private syncQuery(): void {
    const tree = this.router.parseUrl(this.router.url);
    this.query = tree.root.children['primary']?.segments[0]?.path === 'search'
      ? (tree.queryParams['q'] || '')
      : '';
  }
}
