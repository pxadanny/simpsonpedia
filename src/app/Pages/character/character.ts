import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { Simpsons } from '../../services/simpsons';
import { Characterid } from '../../models/characterid';
import { Spinner } from '../../Components/spinner/spinner';
import { FavoritesService } from '../../services/favorites';

@Component({
  selector: 'app-character',
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './character.html',
  styleUrl: './character.css',
})
export class Character implements OnInit {
  character: Characterid | null = null;
  loading = true;
  errorMessage: string | null = null;
  portraitFailed = false;

  readonly favorites = inject(FavoritesService);
  favoriteError = false;
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
        this.character = null;
        this.loading = true;
        this.errorMessage = null;
        this.portraitFailed = false;
        this.cdr.markForCheck();
      }),
      switchMap((id) => {
        if (!Number.isInteger(id) || id <= 0) {
          this.errorMessage = 'We could not find that character.';
          return of(null);
        }

        return this.simpsonsService.getCharacterById(id).pipe(
          catchError(() => {
            this.errorMessage = 'Something went wrong while loading this character. Please try again later.';
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((character) => {
      this.character = character;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  toggleFavorite(person: Characterid): void {
    this.favoriteError = !this.favorites.toggle({
      type: 'characters',
      id: person.id,
      name: person.name,
      subtitle: person.occupation || 'Character',
      imagePath: person.portrait_path || null,
    });
  }

  imageUrl(path?: string | null): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }
}
