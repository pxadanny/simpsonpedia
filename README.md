# Simpsonpedia 💛

**Explore Springfield — one character, episode, and location at a time.**

Simpsonpedia is a fan-made, responsive web app for exploring *The Simpsons*. Browse illustrated catalogs, open detailed profiles, search across the universe, discover something random, and keep a personal collection of favorites.

> **Status:** Active development · No public demo deployed yet.

## Features

- **Characters:** profiles, biography, famous quotes and first appearances when available.
- **Episodes:** cover artwork, season, episode number, original air date and synopsis.
- **Locations:** places around Springfield, with descriptions and appearances when available.
- **Global search:** search across all three categories, with category filters and loading progress.
- **Random:** jump to a randomly selected character, episode or location.
- **Favorites:** save and remove items in a browser-local collection.
- **Responsive:** designed for mobile, tablet and desktop, with accessible navigation and loading/error states.

## Technology

- Angular 21, TypeScript and Angular Router
- Tailwind CSS 4
- Font Awesome 7
- RxJS and Angular signals
- Vitest for unit tests
- [The Simpsons API](https://thesimpsonsapi.com/) for catalog content

## Run locally

Requirements: a supported Node.js version for Angular 21, and npm.

~~~bash
git clone https://github.com/pxadanny/simpsonpedia.git
cd simpsonpedia
npm install
npm start
~~~

Open **http://localhost:4200**.

To create a production build:

~~~bash
npm run build
~~~

To run unit tests:

~~~bash
npm test
~~~

## Pages

| Page | Route |
| --- | --- |
| Characters | \`/characters\` |
| Character profile | \`/characters/:id\` |
| Episodes | \`/episodes\` |
| Episode profile | \`/episodes/:id\` |
| Locations | \`/locations\` |
| Location profile | \`/locations/:id\` |
| Search | \`/search?q=Homer\` |
| Favorites | \`/favorites\` |

The home route redirects to the characters catalog.

## Project structure

~~~text
src/app/
├── Components/        # Shared header, navigation and loading indicator
├── Pages/             # Catalogs, profiles, search and favorites
├── models/            # API data interfaces
├── services/          # API, search, random discovery and favorites logic
└── app.routes.ts      # Application routes
~~~

## Data and privacy

- Catalog data comes from [The Simpsons API](https://thesimpsonsapi.com/).
- The API does not provide a server-side name search. Simpsonpedia builds a progressive index from its paginated lists and reuses it during the current app session. An initial search may take longer while the index loads.
- Favorites are saved in **localStorage** on the current browser only. They do not sync between browsers or devices, and no account is needed.
- The app depends on the availability of its third-party catalog API and image CDN.
- First-appearance details and other fields are displayed only when provided by the API.

## Project status and upcoming work

The catalog and core discovery flows are implemented. Before deployment, the project still needs a full production build, test run, responsive/browser QA and further image asset optimization.

## Attribution

Simpsonpedia is an independent fan project, **not affiliated with or endorsed by** the creators, owners or distributors of *The Simpsons*. All trademarks, character names and related artwork belong to their respective owners.
