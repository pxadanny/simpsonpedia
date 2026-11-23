import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Location } from './location';
import { Simpsons } from '../../services/simpsons';
import { Location as LocationModel } from '../../models/location';

describe('Location detail', () => {
  const home: LocationModel = {
    id: 1,
    name: '742 Evergreen Terrace',
    image_path: '/location/1.webp',
    town: 'Springfield',
    use: 'Residential',
    description: "The Simpson family's house.",
    first_appearance_ep_id: null,
    first_appearance_sh_id: null,
    first_appearance_ep: null,
    first_appearance_sh: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Location],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Simpsons, useValue: { getLocationById: () => of(home) } },
      ],
    }).compileComponents();
  });

  it('shows the place name, town, use and description', async () => {
    const fixture = TestBed.createComponent(Location);
    fixture.detectChanges();
    await fixture.whenStable();

    const content: HTMLElement = fixture.nativeElement;
    expect(content.querySelector('h1')?.textContent).toContain('742 Evergreen Terrace');
    expect(content.textContent).toContain('Springfield');
    expect(content.textContent).toContain('Residential');
    expect(content.textContent).toContain("The Simpson family's house.");
    expect(content.textContent).toContain('First appearance information is not available');
  });

  it('handles an unavailable location safely', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getLocationById: () => throwError(() => new Error('Network error')) },
    });
    const fixture = TestBed.createComponent(Location);
    fixture.detectChanges();
    await fixture.whenStable();

    const content: HTMLElement = fixture.nativeElement;
    expect(content.textContent).toContain('Something went wrong');
    expect(content.querySelector('h1')?.textContent).toContain("D'oh!");
  });

  it('handles missing optional data and images', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getLocationById: () => of({ ...home, image_path: null, town: '', use: '', description: null }) },
    });
    const fixture = TestBed.createComponent(Location);
    fixture.detectChanges();
    await fixture.whenStable();

    const content: HTMLElement = fixture.nativeElement;
    expect(content.textContent).toContain('Location image unavailable');
    expect(content.textContent).toContain('Town not specified');
    expect(content.textContent).toContain('There is no description available');
  });
});
