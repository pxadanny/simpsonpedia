import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type FavoriteType = 'characters' | 'episodes' | 'locations';

export interface FavoriteInput {
  type: FavoriteType;
  id: number;
  name: string;
  subtitle: string;
  imagePath: string | null;
}

export interface FavoriteEntry extends FavoriteInput {
  addedAt: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'simpsonpedia:favorites:v1';

  readonly items = signal<FavoriteEntry[]>(this.readStorage());

  has(type: FavoriteType, id: number): boolean {
    return this.items().some((entry) => entry.type === type && entry.id === id);
  }

  toggle(input: FavoriteInput): boolean {
    if (!this.isValid(input)) return false;
    const entries = this.items();
    const exists = this.has(input.type, input.id);
    const updated = exists
      ? entries.filter((entry) => !(entry.type === input.type && entry.id === input.id))
      : [{ ...input, addedAt: Date.now() }, ...entries];
    return this.persist(updated);
  }

  remove(type: FavoriteType, id: number): boolean {
    return this.persist(this.items().filter((entry) => !(entry.type === type && entry.id === id)));
  }

  private persist(entries: FavoriteEntry[]): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
      this.items.set(entries);
      return true;
    } catch {
      return false;
    }
  }

  private readStorage(): FavoriteEntry[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const result: FavoriteEntry[] = [];
      const seen = new Set<string>();
      for (const value of parsed.slice(0, 500)) {
        if (!this.isValid(value)) continue;
        const entry = value as FavoriteInput & { addedAt?: unknown };
        const key = entry.type + ':' + entry.id;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          type: entry.type,
          id: entry.id,
          name: entry.name,
          subtitle: entry.subtitle,
          imagePath: entry.imagePath,
          addedAt: typeof entry.addedAt === 'number' && Number.isFinite(entry.addedAt)
            ? entry.addedAt : 0,
        });
      }
      return result;
    } catch {
      return [];
    }
  }

  private isValid(value: unknown): value is FavoriteInput {
    if (!value || typeof value !== 'object') return false;
    const item = value as Record<string, unknown>;
    return (item['type'] === 'characters' || item['type'] === 'episodes' || item['type'] === 'locations')
      && typeof item['id'] === 'number'
      && Number.isInteger(item['id'])
      && item['id'] > 0
      && typeof item['name'] === 'string'
      && item['name'].trim().length > 0
      && typeof item['subtitle'] === 'string'
      && (item['imagePath'] === null ||
        (typeof item['imagePath'] === 'string' && item['imagePath'].startsWith('/')));
  }
}
