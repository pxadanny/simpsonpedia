import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RandomDiscovery } from './random-discovery';
import { Simpsons } from './simpsons';

describe('RandomDiscovery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses pagination rather than assuming item IDs are consecutive', async () => {
    const page1 = Array.from({ length: 20 }, (_, index) => ({
      id: index + 10,
      name: 'Character ' + (index + 10),
    }));
    const page2 = Array.from({ length: 20 }, (_, index) => ({
      id: index + 100,
      name: 'Character ' + (index + 100),
    }));

    const getCharacters = vi.fn((url?: string) =>
      of({
        count: 40, pages: 2,
        next: url ? null : 'https://example.com/?page=2',
        prev: null,
        results: url ? page2 : page1,
      }),
    );
    const simpsons = {
      getCharacters,
      getEpisodes: vi.fn(),
      getLocations: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [RandomDiscovery, { provide: Simpsons, useValue: simpsons }],
    });

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)      // characters category
      .mockReturnValueOnce(0.625); // index 25 -> page 2, position 5

    const destination = await firstValueFrom(TestBed.inject(RandomDiscovery).pick());

    expect(destination).toEqual({ category: 'characters', id: 105, name: 'Character 105' });
    expect(getCharacters).toHaveBeenCalledTimes(2);
    expect(getCharacters.mock.calls[1][0]).toContain('characters?page=2');
  });

  it('selects directly from page one when possible', async () => {
    const getLocations = vi.fn(() => of({
      count: 2, pages: 1, prev: null, next: null,
      results: [{ id: 9, name: 'Kwik-E-Mart' }, { id: 27, name: 'Springfield Elementary' }],
    }));

    TestBed.configureTestingModule({
      providers: [RandomDiscovery, {
        provide: Simpsons, useValue: {
          getCharacters: vi.fn(),
          getEpisodes: vi.fn(),
          getLocations,
        },
      }],
    });

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValueOnce(0.75);

    const destination = await firstValueFrom(TestBed.inject(RandomDiscovery).pick());
    expect(destination).toEqual({ category: 'locations', id: 27, name: 'Springfield Elementary' });
    expect(getLocations).toHaveBeenCalledTimes(1);
  });

  it('reports an empty catalog rather than navigating to an invalid ID', async () => {
    TestBed.configureTestingModule({
      providers: [RandomDiscovery, {
        provide: Simpsons, useValue: {
          getCharacters: () => of({ count: 0, pages: 0, next: null, prev: null, results: [] }),
          getEpisodes: vi.fn(),
          getLocations: vi.fn(),
        },
      }],
    });

    vi.spyOn(Math, 'random').mockReturnValue(0);

    await expect(firstValueFrom(TestBed.inject(RandomDiscovery).pick())).rejects.toThrow('No items');
  });

  it('propagates API errors to the caller', async () => {
    TestBed.configureTestingModule({
      providers: [RandomDiscovery, {
        provide: Simpsons, useValue: {
          getCharacters: () => throwError(() => new Error('Unavailable')),
          getEpisodes: vi.fn(),
          getLocations: vi.fn(),
        },
      }],
    });

    vi.spyOn(Math, 'random').mockReturnValue(0);

    await expect(firstValueFrom(TestBed.inject(RandomDiscovery).pick())).rejects.toThrow('Unavailable');
  });
});
