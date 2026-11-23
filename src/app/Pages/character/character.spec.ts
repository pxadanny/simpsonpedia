import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Character } from './character';
import { Simpsons } from '../../services/simpsons';
import { Characterid } from '../../models/characterid';

describe('Character detail', () => {
  const homer: Characterid = {
    id: 1,
    name: 'Homer Simpson',
    age: 39,
    birthdate: 'May 12',
    description: 'A resident of Springfield.',
    occupation: 'Safety inspector',
    portrait_path: '/homer.png',
    gender: 'Male',
    status: 'Alive',
    phrases: ["D'oh!"],
    first_appearance_ep_id: null,
    first_appearance_sh_id: null,
    first_appearance_ep: null,
    first_appearance_sh: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Character],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Simpsons, useValue: { getCharacterById: () => of(homer) } },
      ],
    }).compileComponents();
  });

  it('renders a character and does not duplicate first appearances', async () => {
    const fixture = TestBed.createComponent(Character);
    fixture.detectChanges();
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toContain('Homer Simpson');
    expect(element.querySelectorAll('#appearances-title').length).toBe(1);
    expect(element.textContent).toContain("D'oh!");
  });

  it('shows an error message if the character cannot be loaded', async () => {
    TestBed.overrideProvider(Simpsons, {
      useValue: { getCharacterById: () => throwError(() => new Error('Network error')) },
    });
    const fixture = TestBed.createComponent(Character);
    fixture.detectChanges();
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Something went wrong');
    expect(element.querySelector('h1')?.textContent).toContain("D'oh!");
  });
});
