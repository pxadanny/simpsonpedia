import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';
import { SearchIndex } from './search-index';
import { Simpsons } from './simpsons';

describe('SearchIndex', () => {
  const response = <T>(results: T[], pages: number) => ({
    count: results.length * pages,
    pages,
    next: pages > 1 ? '?page=2' : null,
    prev: null,
    results,
  });

  const simpsons = {
    getCharacters: (url?: string) => of(response(
      [{ id: url ? 2 : 1, name: url ? 'Marge Simpson' : 'Homer Simpson', occupation: 'Springfield', portrait_path: null }],
      2,
    )),
    getEpisodes: () => of(response(
      [{ id: 1, name: 'Pilot', season: 1, episode_number: 1, image_path: null }],
      1,
    )),
    getLocations: () => of(response(
      [{ id: 1, name: 'Kwik-E-Mart', town: 'Springfield', use: 'Store', image_path: null }],
      1,
    )),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchIndex, { provide: Simpsons, useValue: simpsons }],
    });
  });

  it('indexes paginated characters alongside episodes and locations', async () => {
    const index = TestBed.inject(SearchIndex);
    const result = await lastValueFrom(index.getIndex());

    expect(result.items.map((item) => item.name)).toEqual([
      'Homer Simpson', 'Marge Simpson', 'Pilot', 'Kwik-E-Mart',
    ]);
    expect(result.loadedPages).toBe(4);
    expect(result.totalPages).toBe(4);
    expect(result.hasErrors).toBe(false);
  });

  it('reuses a cached catalog instead of requesting pages again', async () => {
    const index = TestBed.inject(SearchIndex);
    const first = await lastValueFrom(index.getIndex());
    const second = await lastValueFrom(index.getIndex());

    expect(first.items).toEqual(second.items);
    expect(first.items.length).toBe(4);
  });
});
