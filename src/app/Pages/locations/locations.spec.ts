import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Locations } from './locations';
import { Simpsons } from '../../services/simpsons';

describe('Locations catalog', () => {
  const data = {
    count: 1, pages: 1, prev: null, next: null,
    results: [{
      id: 5, name: 'Kwik-E-Mart', image_path: '/store.png',
      town: 'Springfield', use: 'Convenience store',
    }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Locations],
      providers: [
        provideRouter([]),
        { provide: Simpsons, useValue: { getLocations: () => of(data) } },
      ],
    }).compileComponents();
  });

  it('renders a location card linking to its profile', async () => {
    const fixture = TestBed.createComponent(Locations);
    fixture.detectChanges();
    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    const link = page.querySelector('a[aria-label="View location: Kwik-E-Mart"]');
    expect(link?.getAttribute('href')).toBe('/locations/5');
    expect(page.textContent).toContain('Convenience store');
    expect(page.textContent).toContain('Springfield');
  });

  it('offers retry when the API fails', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getLocations: () => throwError(() => new Error('Offline')) },
    });
    const fixture = TestBed.createComponent(Locations);
    fixture.detectChanges();
    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('We could not load the locations');
    expect(page.textContent).toContain('Try again');
  });
});
