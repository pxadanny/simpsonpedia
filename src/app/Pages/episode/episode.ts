import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { Simpsons } from '../../services/simpsons';
import { Episode as EpisodeModel } from '../../models/episode';
import { Spinner } from '../../Components/spinner/spinner';
import { FavoritesService } from '../../services/favorites';

@Component({
  selector: 'app-episode',
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './episode.html',
  styleUrl: './episode.css',
})
export class Episode implements OnInit {
  episode: EpisodeModel | null = null;
  loading = true;
  errorMessage: string | null = null;
  imageFailed = false;

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
        this.episode = null;
        this.loading = true;
        this.errorMessage = null;
        this.imageFailed = false;
        this.cdr.markForCheck();
      }),
      switchMap((id) => {
        if (!Number.isInteger(id) || id <= 0) {
          this.errorMessage = 'We could not find that episode.';
          return of(null);
        }

        return this.simpsonsService.getEpisodeById(id).pipe(
          catchError(() => {
            this.errorMessage = 'Something went wrong while loading this episode. Please try again later.';
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((episode) => {
      this.episode = episode;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  toggleFavorite(entry: EpisodeModel): void {
    this.favoriteError = !this.favorites.toggle({
      type: 'episodes',
      id: entry.id,
      name: entry.name,
      subtitle: 'Season ' + entry.season + ' · Episode #' + entry.episode_number,
      imagePath: entry.image_path || null,
    });
  }

  imageUrl(path: string | null | undefined): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }
}
