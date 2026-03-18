  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  import { Character } from '../models/character';
  import { ApiResponse } from '../models/api-response';
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
  }
