import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Header } from './header';
import { RandomDiscovery } from '../../services/random-discovery';

describe('Header', () => {
  let router: Router;
  const pick = vi.fn();

  beforeEach(async () => {
    pick.mockReset();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: RandomDiscovery, useValue: { pick } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders an enabled Random button', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[title^="Discover a random"]') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain('Random');
  });

  it('navigates to the selected character detail', async () => {
    pick.mockReturnValue(of({ category: 'characters', id: 42, name: 'Homer Simpson' }));
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[title^="Discover a random"]') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(pick).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/', 'characters', 42]);
    expect(fixture.componentInstance.randomLoading).toBe(false);
  });

  it('shows a helpful error if the discovery fails', async () => {
    pick.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[title^="Discover a random"]') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('D’oh!');
    expect(button.disabled).toBe(false);
  });
});
