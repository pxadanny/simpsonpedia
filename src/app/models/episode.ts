export interface Episode {
  id: number;
  name: string;
  season: number;
  /** Overall episode number in the series (not the number within a season). */
  episode_number: number;
  /** Original airdate from The Simpsons API. */
  airdate: string | null;
  image_path: string | null;
  synopsis: string | null;
  /** Detail endpoint may supply an additional description. */
  description?: string | null;
}
