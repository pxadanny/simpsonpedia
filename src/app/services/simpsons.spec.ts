import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Simpsons } from './simpsons';

describe('Simpsons', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
  });

  it('can be injected with HttpClient configured', () => {
    expect(TestBed.inject(Simpsons)).toBeTruthy();
  });
});
