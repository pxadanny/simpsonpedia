import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { Simpsons } from '../../services/simpsons';
import { Location as LocationModel } from '../../models/location';
import { Spinner } from '../../Components/spinner/spinner';

@Component({
  selector: 'app-location',
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './location.html',
  styleUrl: './location.css',
})
export class Location implements OnInit {
  location: LocationModel | null = null;
  loading = true;
  errorMessage: string | null = null;
  imageFailed = false;
  episodeImageFailed = false;
  shortImageFailed = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly simpsonsService: Simpsons,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      distinctUntilChanged(),
      tap(() => {
        this.location = null;
        this.loading = true;
        this.errorMessage = null;
        this.imageFailed = false;
        this.episodeImageFailed = false;
        this.shortImageFailed = false;
        this.cdr.markForCheck();
      }),
      switchMap((id) => {
        if (!Number.isInteger(id) || id <= 0) {
          this.errorMessage = 'We could not find that location.';
          return of(null);
        }

        return this.simpsonsService.getLocationById(id).pipe(
          catchError(() => {
            this.errorMessage = 'Something went wrong while loading this location. Please try again later.';
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((location) => {
      this.location = location;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  imageUrl(path: string | null | undefined): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }
}
