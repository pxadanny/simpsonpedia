import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Nav } from './nav';

describe('Nav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders four navigable sections', () => {
    const fixture = TestBed.createComponent(Nav);
    fixture.detectChanges();

    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/characters', '/episodes', '/locations', '/favorites',
    ]);
  });
});
