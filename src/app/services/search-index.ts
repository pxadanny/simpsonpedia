import { Injectable } from '@angular/core';
import { EMPTY, Observable, combineLatest, concat, from, of } from 'rxjs';
import { catchError, map, mergeMap, scan, shareReplay, switchMap } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { Simpsons } from './simpsons';

export type SearchCategory = 'characters' | 'episodes' | 'locations';

export interface SearchItem {
  type: SearchCategory;
  id: number;
  name: string;
  subtitle: string;
  imagePath: string | null;
}

export interface SearchIndexSnapshot {
  items: SearchItem[];
  loadedPages: number;
  totalPages: number;
  hasErrors: boolean;
}

interface SearchSegment extends SearchIndexSnapshot {
  type: SearchCategory;
}

@Injectable({ providedIn: 'root' })
export class SearchIndex {
  private index$?: Observable<SearchIndexSnapshot>;
  private readonly baseUrl = 'https://thesimpsonsapi.com/api';

  constructor(private readonly simpsons: Simpsons) {}

  // The API supports paginated lists, not server-side name filtering.
  // Build one incremental index on demand and cache it for this app session.
  getIndex(): Observable<SearchIndexSnapshot> {
    if (!this.index$) {
      this.index$ = combineLatest([
        this.load(
          'characters',
          () => this.simpsons.getCharacters(),
          (page) => this.simpsons.getCharacters(this.pageUrl('characters', page)),
          (character) => ({
            type: 'characters' as const,
            id: character.id,
            name: character.name,
            subtitle: character.occupation || 'Character',
            imagePath: character.portrait_path || null,
          }),
        ),
        this.load(
          'episodes',
          () => this.simpsons.getEpisodes(),
          (page) => this.simpsons.getEpisodes(this.pageUrl('episodes', page)),
          (episode) => ({
            type: 'episodes' as const,
            id: episode.id,
            name: episode.name,
            subtitle: 'Season ' + episode.season + ' · Episode #' + episode.episode_number,
            imagePath: episode.image_path || null,
          }),
        ),
        this.load(
          'locations',
          () => this.simpsons.getLocations(),
          (page) => this.simpsons.getLocations(this.pageUrl('locations', page)),
          (place) => ({
            type: 'locations' as const,
            id: place.id,
            name: place.name,
            subtitle: [place.town, place.use].filter(Boolean).join(' · ') || 'Location',
            imagePath: place.image_path || null,
          }),
        ),
      ]).pipe(
        map((segments) => ({
          items: segments.flatMap((segment) => segment.items),
          loadedPages: segments.reduce((sum, segment) => sum + segment.loadedPages, 0),
          totalPages: segments.reduce((sum, segment) => sum + segment.totalPages, 0),
          hasErrors: segments.some((segment) => segment.hasErrors),
        })),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.index$;
  }

  private pageUrl(category: SearchCategory, page: number): string {
    return this.baseUrl + '/' + category + '?page=' + page;
  }

  private load<T extends { id: number; name: string }>(
    type: SearchCategory,
    first: () => Observable<ApiResponse<T>>,
    fetchPage: (page: number) => Observable<ApiResponse<T>>,
    convert: (item: T) => SearchItem,
  ): Observable<SearchSegment> {
    return first().pipe(
      switchMap((response) => {
        const totalPages = Math.max(1, response.pages || 1);
        const starting: SearchSegment = {
          type,
          items: [],
          loadedPages: 0,
          totalPages,
          hasErrors: false,
        };

        const initialPage = of({
          items: response.results.map(convert),
          failed: false,
        });

        const remainingPages = totalPages > 1
          ? from(Array.from({ length: totalPages - 1 }, (_, i) => i + 2)).pipe(
              // Cap simultaneous requests per category to avoid API overload.
              mergeMap(
                (page) => fetchPage(page).pipe(
                  map((result) => ({ items: result.results.map(convert), failed: false })),
                  catchError(() => of({ items: [] as SearchItem[], failed: true })),
                ),
                2,
              ),
            )
          : EMPTY;

        return concat(initialPage, remainingPages).pipe(
          scan((acc, page) => ({
            ...acc,
            items: [...acc.items, ...page.items],
            loadedPages: acc.loadedPages + 1,
            hasErrors: acc.hasErrors || page.failed,
          }), starting),
        );
      }),
      catchError(() => of({
        type, items: [], loadedPages: 1, totalPages: 1, hasErrors: true,
      })),
    );
  }
}
