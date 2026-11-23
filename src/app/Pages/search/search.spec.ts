import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Search } from './search';
import { SearchIndex, SearchIndexSnapshot } from '../../services/search-index';

describe('Global search results', () => {
  const routeParams = new BehaviorSubject(convertToParamMap({ q: 'homer' }));
  const snapshot: SearchIndexSnapshot = {
    loadedPages: 1,
    totalPages: 1,
    hasErrors: false,
    items: [
      { type: 'characters', id: 1, name: 'Homer Simpson', subtitle: 'Safety inspector', imagePath: null },
      { type: 'episodes', id: 2, name: 'Homer at the Bat', subtitle: 'Season 3', imagePath: null },
      { type: 'locations', id: 3, name: 'Kwik-E-Mart', subtitle: 'Springfield', imagePath: null },
    ],
  };

  beforeEach(async () => {
    routeParams.next(convertToParamMap({ q: 'homer' }));
    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: routeParams.asObservable() } },
        { provide: SearchIndex, useValue: { getIndex: () => of(snapshot) } },
      ],
    }).compileComponents();
  });

  it('finds characters and episodes matching the term and reuses cached results', async () => {
    const fixture = TestBed.createComponent(Search);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.matches.map((item) => item.name)).toEqual(['Homer at the Bat', 'Homer Simpson']);
    expect(component.matches).toBe(component.matches);
    expect(component.count('characters')).toBe(1);
    expect(component.count('episodes')).toBe(1);
    expect(component.count('locations')).toBe(0);
  });

  it('updates results when the URL query changes', async () => {
    const fixture = TestBed.createComponent(Search);
    fixture.detectChanges();
    await fixture.whenStable();

    routeParams.next(convertToParamMap({ q: 'springfield' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.matches.map((item) => item.name)).toEqual(['Kwik-E-Mart']);

    routeParams.next(convertToParamMap({ q: '' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.matches).toEqual([]);
  });
});
