import { Routes } from '@angular/router';
import { Characters } from './Pages/characters/characters';
import { Character } from './Pages/character/character';
import { Episodes } from './Pages/episodes/episodes';
import { Episode } from './Pages/episode/episode';
import { Locations } from './Pages/locations/locations';
import { Location } from './Pages/location/location';

export const routes: Routes = [
    {path: 'characters' , component: Characters},
    {path: 'characters/:id', component: Character},
    {path: 'episodes', component: Episodes},
    {path: 'episodes/:id', component: Episode},
    {path: 'locations', component: Locations},
    {path: 'locations/:id', component: Location},
    { path: '**', redirectTo: 'characters', pathMatch: 'full' }

];
