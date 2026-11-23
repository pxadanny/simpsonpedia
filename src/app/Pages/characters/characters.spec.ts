import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Characters } from './characters';
import { Simpsons } from '../../services/simpsons';

describe('Characters catalog', () => {
  const data = {
    count: 1, pages: 1, prev: null, next: null,
    results: [{
      id: 1, name: 'Homer Simpson', age: 39, birthdate: 'May 12', gender: 'Male',
      occupation: 'Safety inspector', portrait_path: '/homer.png', phrases: [],
      status: 'Alive',
    }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Characters],
      providers: [
        provideRouter([]),
        { provide: Simpsons, useValue: { getCharacters: () => of(data) } },
      ],
    }).compileComponents();
  });

  it('renders an accessible character link and profile details', async () => {
    const fixture = TestBed.createComponent(Characters);
    fixture.detectChanges();
    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    const link = page.querySelector('a[aria-label="View character: Homer Simpson"]');
    expect(link?.getAttribute('href')).toBe('/characters/1');
    expect(page.textContent).toContain('Safety inspector');
  });

  it('shows a retry action when loading fails', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getCharacters: () => throwError(() => new Error('Offline')) },
    });
    const fixture = TestBed.createComponent(Characters);
    fixture.detectChanges();
    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('We could not load the characters');
    expect(page.querySelector('button')?.textContent).toContain('Try again');
  });
});
