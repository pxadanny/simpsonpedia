import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import {
  SearchCategory,
  SearchIndex,
  SearchIndexSnapshot,
  SearchItem,
} from '../../services/search-index';

type SearchFilter = SearchCategory | 'all';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  query = '';
  activeFilter: SearchFilter = 'all';
  visibleCount = 24;
  snapshot: SearchIndexSnapshot = {
    items: [], loadedPages: 0, totalPages: 1, hasErrors: false,
  };

  private readonly destroyRef = inject(DestroyRef);
  private matchCache: { query: string; items: SearchItem[]; result: SearchItem[] } | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly searchIndex: SearchIndex,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map((params) => (params.get('q') || '').trim()),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((query) => {
      this.query = query;
      this.activeFilter = 'all';
      this.visibleCount = 24;
      this.cdr.markForCheck();
    });

    this.searchIndex.getIndex().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((snapshot) => {
      this.snapshot = snapshot;
      this.cdr.markForCheck();
    });
  }

  get isIndexing(): boolean {
    return this.snapshot.loadedPages < this.snapshot.totalPages;
  }

  get matches(): SearchItem[] {
    const needle = this.normalize(this.query);
    if (needle.length < 2) return [];

    // Angular can evaluate template getters repeatedly during change detection.
    // Re-filter and re-sort only when the term or indexed items change.
    if (this.matchCache?.query === needle && this.matchCache.items === this.snapshot.items) {
      return this.matchCache.result;
    }

    const results = this.snapshot.items.filter((item) => {
      const name = this.normalize(item.name);
      const subtitle = this.normalize(item.subtitle);
      return name.includes(needle) || subtitle.includes(needle);
    }).sort((a, b) => {
      const aName = this.normalize(a.name);
      const bName = this.normalize(b.name);
      const aRank = aName === needle ? 0 : aName.startsWith(needle) ? 1 : aName.includes(needle) ? 2 : 3;
      const bRank = bName === needle ? 0 : bName.startsWith(needle) ? 1 : bName.includes(needle) ? 2 : 3;
      return aRank - bRank || aName.localeCompare(bName);
    });

    this.matchCache = { query: needle, items: this.snapshot.items, result: results };
    return results;
  }

  get filteredMatches(): SearchItem[] {
    const allMatches = this.matches;
    return this.activeFilter === 'all'
      ? allMatches
      : allMatches.filter((item) => item.type === this.activeFilter);
  }

  get visibleMatches(): SearchItem[] {
    return this.filteredMatches.slice(0, this.visibleCount);
  }

  count(type: SearchFilter): number {
    return type === 'all'
      ? this.matches.length
      : this.matches.filter((item) => item.type === type).length;
  }

  setFilter(type: SearchFilter): void {
    this.activeFilter = type;
    this.visibleCount = 24;
  }

  showMore(): void {
    this.visibleCount += 24;
  }

  imageUrl(path: string | null): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }

  trackItem(_index: number, item: SearchItem): string {
    return item.type + ':' + item.id;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
