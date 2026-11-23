import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Episode } from './episode';
import { Simpsons } from '../../services/simpsons';
import { Episode as EpisodeModel } from '../../models/episode';

describe('Episode detail', () => {
  const premiere: EpisodeModel = {
    id: 1,
    name: 'Simpsons Roasting on an Open Fire',
    season: 1,
    episode_number: 1,
    airdate: '1989-12-17',
    image_path: '/episode/1.webp',
    synopsis: 'Homer gets a job as a mall Santa.',
    description: 'The series premiere.',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Episode],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Simpsons, useValue: { getEpisodeById: () => of(premiere) } },
      ],
    }).compileComponents();
  });

  it('shows episode metadata, synopsis and description', async () => {
    const fixture = TestBed.createComponent(Episode);
    fixture.detectChanges();
    await fixture.whenStable();

    const content: HTMLElement = fixture.nativeElement;
    expect(content.querySelector('h1')?.textContent).toContain('Simpsons Roasting on an Open Fire');
    expect(content.textContent).toContain('December 17, 1989');
    expect(content.textContent).toContain('Homer gets a job as a mall Santa.');
    expect(content.textContent).toContain('The series premiere.');
  });

  it('handles a failed request without rendering missing data', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getEpisodeById: () => throwError(() => new Error('Network error')) },
    });
    const fixture = TestBed.createComponent(Episode);
    fixture.detectChanges();
    await fixture.whenStable();

    const content: HTMLElement = fixture.nativeElement;
    expect(content.textContent).toContain('Something went wrong');
    expect(content.querySelector('h1')?.textContent).toContain("D'oh!");
  });

  it('handles missing optional fields', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getEpisodeById: () => of({ ...premiere, airdate: null, image_path: null, synopsis: null, description: null }) },
    });
    const fixture = TestBed.createComponent(Episode);
    fixture.detectChanges();
    await fixture.whenStable();

    const content: HTMLElement = fixture.nativeElement;
    expect(content.textContent).toContain('Not available');
    expect(content.textContent).toContain('Episode image unavailable');
    expect(content.textContent).toContain('The synopsis for this episode is not available yet.');
  });
});
