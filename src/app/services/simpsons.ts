  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  import { Character } from '../models/character';
  import { ApiResponse } from '../models/api-response';
  import { Episode } from '../models/episode';
  import { Location } from '../models/location';
import { Characterid } from '../models/characterid';
  @Injectable({
    providedIn: 'root',
  })
  export class Simpsons {
    private apiUrl = 'https://thesimpsonsapi.com/api';

    constructor(private http: HttpClient) {}

    getCharacters(url?: string) {
  return this.http.get<ApiResponse<Character>>(
    url ? url : `${this.apiUrl}/characters`
  );
}

getEpisodes(url?: string) {
  return this.http.get<ApiResponse<Episode>>(
    url ? url : `${this.apiUrl}/episodes`
  );
}

getLocations(url?: string) {
  return this.http.get<ApiResponse<Location>>(
    url ? url : `${this.apiUrl}/locations`
  );
}

getCharacterById(id: number) {
  return this.http.get<Characterid>(`${this.apiUrl}/characters/${id}`);
}

getEpisodeById(id: number) {
  return this.http.get<Episode>(`${this.apiUrl}/episodes/${id}`);
}

getLocationById(id: number) {
  return this.http.get<Location>(`${this.apiUrl}/locations/${id}`);
  }
}
