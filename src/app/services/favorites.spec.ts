import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites';

describe('FavoritesService', () => {
  beforeEach(() => {
    localStorage.removeItem('simpsonpedia:favorites:v1');
    TestBed.configureTestingModule({ providers: [FavoritesService] });
  });

  afterEach(() => {
    localStorage.removeItem('simpsonpedia:favorites:v1');
  });

  it('saves and removes a favorite and updates its reactive state', () => {
    const service = TestBed.inject(FavoritesService);
    const sample = {
      type: 'characters' as const,
      id: 42,
      name: 'Homer Simpson',
      subtitle: 'Nuclear safety inspector',
      imagePath: '/homer.webp',
    };
    expect(service.has(sample.type, sample.id)).toBe(false);
    expect(service.toggle(sample)).toBe(true);
    expect(service.has(sample.type, sample.id)).toBe(true);
    expect(service.toggle(sample)).toBe(true);
    expect(service.items()).toEqual([]);
  });

  it('persists across service instances and separates IDs by category', () => {
    const first = TestBed.inject(FavoritesService);
    first.toggle({ type: 'characters', id: 1, name: 'Marge', subtitle: 'Character', imagePath: null });
    first.toggle({ type: 'episodes', id: 1, name: 'Pilot', subtitle: 'Episode', imagePath: null });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [FavoritesService] });
    const second = TestBed.inject(FavoritesService);

    expect(second.items().length).toBe(2);
    expect(second.has('characters', 1)).toBe(true);
    expect(second.has('episodes', 1)).toBe(true);
    expect(second.remove('characters', 1)).toBe(true);
    expect(second.has('episodes', 1)).toBe(true);
  });

  it('ignores invalid stored entries', () => {
    localStorage.setItem('simpsonpedia:favorites:v1', JSON.stringify([
      { type: 'characters', id: -5, name: 'Bad', subtitle: '', imagePath: null },
      { type: 'locations', id: 7, name: 'Kwik-E-Mart', subtitle: 'Springfield', imagePath: null },
    ]));

    const service = TestBed.inject(FavoritesService);
    expect(service.items().map((item) => item.name)).toEqual(['Kwik-E-Mart']);
  });
});
