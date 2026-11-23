import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Episodes } from './episodes';
import { Simpsons } from '../../services/simpsons';

describe('Episodes catalog', () => {
  const data = {
    count: 1, pages: 1, prev: null, next: null,
    results: [{
      id: 7, name: 'Lisa the Vegetarian', season: 7,
      episode_number: 133, airdate: '1995-10-15',
      image_path: '/episode.png', synopsis: 'Lisa changes her diet.',
    }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Episodes],
      providers: [
        provideRouter([]),
        { provide: Simpsons, useValue: { getEpisodes: () => of(data) } },
      ],
    }).compileComponents();
  });

  it('renders an episode card linking to its profile', async () => {
    const fixture = TestBed.createComponent(Episodes);
    fixture.detectChanges();
    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    const link = page.querySelector('a[aria-label="View episode: Lisa the Vegetarian"]');
    expect(link?.getAttribute('href')).toBe('/episodes/7');
    expect(page.textContent).toContain('Oct 15, 1995');
    expect(page.textContent).toContain('Lisa changes her diet.');
  });

  it('offers retry when the API fails', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getEpisodes: () => throwError(() => new Error('Offline')) },
    });
    const fixture = TestBed.createComponent(Episodes);
    fixture.detectChanges();
    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('We could not load the episodes');
    expect(page.textContent).toContain('Try again');
  });
});
