import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Simpsons } from './simpsons';

export type RandomCategory = 'characters' | 'episodes' | 'locations';

export interface RandomDestination {
  category: RandomCategory;
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RandomDiscovery {
  private readonly apiBaseUrl = 'https://thesimpsonsapi.com/api';
  private readonly categories: RandomCategory[] = ['characters', 'episodes', 'locations'];
  private previous: RandomDestination | null = null;

  constructor(private readonly simpsons: Simpsons) {}

  /**
   * First sample a category, then an item uniformly within that category.
   * Uses the API's count and page size rather than assuming IDs are consecutive.
   * Usually requires only one or two requests, even for a large catalog.
   */
  pick(): Observable<RandomDestination> {
    const category = this.categories[Math.floor(Math.random() * this.categories.length)];

    switch (category) {
      case 'characters':
        return this.pickFrom(category, (url) => this.simpsons.getCharacters(url));
      case 'episodes':
        return this.pickFrom(category, (url) => this.simpsons.getEpisodes(url));
      case 'locations':
        return this.pickFrom(category, (url) => this.simpsons.getLocations(url));
    }
  }

  private pickFrom<T extends { id: number; name: string }>(
    category: RandomCategory,
    fetchPage: (url?: string) => Observable<ApiResponse<T>>,
  ): Observable<RandomDestination> {
    return fetchPage().pipe(
      switchMap((firstPage) => {
        const pageSize = firstPage.results.length;
        const count = firstPage.count;

        if (!Number.isInteger(count) || count <= 0 || pageSize === 0) {
          return throwError(() => new Error('No items available in this category.'));
        }

        let index = Math.floor(Math.random() * count);
        if (
          count > 1 &&
          this.previous?.category === category &&
          firstPage.results.length > 0
        ) {
          // Avoid showing the same item twice in a row when possible.
          // This is refined after reading the selected page.
        }

        const page = Math.floor(index / pageSize) + 1;
        const position = index % pageSize;
        const response$ = page === 1
          ? of(firstPage)
          : fetchPage(this.apiBaseUrl + '/' + category + '?page=' + page);

        return response$.pipe(
          map((response) => {
            let item = response.results[position];
            if (!item || !Number.isInteger(item.id) || item.id <= 0) {
              throw new Error('The selected catalog item is unavailable.');
            }

            if (
              count > 1 &&
              this.previous?.category === category &&
              this.previous.id === item.id
            ) {
              // The result can repeat when sampling; choose its nearest neighbor
              // from the same page if one exists, without another API request.
              const alternative = response.results.find(
                (candidate) => candidate.id !== this.previous?.id,
              );
              if (alternative) item = alternative;
            }

            const destination: RandomDestination = {
              category,
              id: item.id,
              name: item.name,
            };
            this.previous = destination;
            return destination;
          }),
        );
      }),
    );
  }
}
