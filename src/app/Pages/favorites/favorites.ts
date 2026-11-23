import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteEntry, FavoriteType, FavoritesService } from '../../services/favorites';

type FavoriteFilter = FavoriteType | 'all';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  readonly favorites = inject(FavoritesService);
  activeFilter: FavoriteFilter = 'all';
  errorMessage = '';

  get visible(): FavoriteEntry[] {
    const entries = this.favorites.items();
    return this.activeFilter === 'all'
      ? entries
      : entries.filter((entry) => entry.type === this.activeFilter);
  }

  count(type: FavoriteFilter): number {
    return type === 'all'
      ? this.favorites.items().length
      : this.favorites.items().filter((entry) => entry.type === type).length;
  }

  setFilter(filter: FavoriteFilter): void {
    this.activeFilter = filter;
  }

  remove(entry: FavoriteEntry): void {
    this.errorMessage = this.favorites.remove(entry.type, entry.id)
      ? ''
      : 'Favorites could not be updated. Check your browser storage settings.';
  }

  imageUrl(path: string | null): string {
    return path ? 'https://cdn.thesimpsonsapi.com/500' + path : '';
  }

  trackEntry(_index: number, entry: FavoriteEntry): string {
    return entry.type + ':' + entry.id;
  }
}
