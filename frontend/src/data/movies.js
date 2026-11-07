import { POSTERS, BACKDROPS, CAST_PHOTOS } from './images.js';

const m = (slug, o) => ({
  id: `mv-${slug}`, slug, poster: POSTERS[slug] || null, backdrop: BACKDROPS[slug] || POSTERS[slug] || null,
  language: 'English', status: 'now_showing', featured: false, ...o,
});

/** Seed catalogue. Mutations from the admin console are persisted by movieService. */
export const SEED_MOVIES = [
  m('dune-part-two', {
    title: 'Dune: Part Two', genres: ['Sci-Fi', 'Adventure', 'Epic Drama'], rating: 'PG-13', score: 8.9, votes: '142k', rt: 93, runtime: 166,
    formats: ['IMAX 70MM', 'DOLBY CINEMA', 'LASER 4K'], badge: 'IMAX 70MM', releaseDate: '2024-03-01', director: 'Denis Villeneuve', featured: true, popularity: 100,
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee across the vast, inhospitable desert planet of Arrakis. As the war for the spice intensifies, Paul must decide how far he is willing to go.',
    cast: [{ name: 'Denis Villeneuve', role: 'Director' }, { name: 'Timothée Chalamet', role: 'Paul Atreides' }, { name: 'Zendaya', role: 'Chani' }, { name: 'Rebecca Ferguson', role: 'Lady Jessica' }, { name: 'Javier Bardem', role: 'Stilgar' }],
    trailer: '3m 12s', filmedFor: 'Filmed for IMAX Digital 1.43:1', sound: 'Atmos',
  }),
  m('oppenheimer', {
    title: 'Oppenheimer', genres: ['Biography', 'Drama', 'History'], rating: 'R', score: 8.9, votes: '710k', rt: 93, runtime: 180,
    formats: ['IMAX 70MM', 'DOLBY CINEMA'], badge: 'DOLBY CINEMA', releaseDate: '2023-07-21', director: 'Christopher Nolan', popularity: 96,
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A tense portrait of genius, ambition and the moral weight of a world-changing invention.',
    cast: [{ name: 'Christopher Nolan', role: 'Director' }, { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' }, { name: 'Emily Blunt', role: 'Kitty Oppenheimer' }, { name: 'Robert Downey Jr.', role: 'Lewis Strauss' }, { name: 'Matt Damon', role: 'Leslie Groves' }],
    trailer: '3m 01s', sound: 'Atmos',
  }),
  m('interstellar', {
    title: 'Interstellar: 10th Anniv.', genres: ['Sci-Fi', 'Mystery', 'Drama'], rating: 'PG-13', score: 9.3, votes: '2.1M', rt: 73, runtime: 169,
    formats: ['IMAX 70MM', 'DOLBY CINEMA'], badge: 'DOLBY CINEMA', releaseDate: '2014-11-07', director: 'Christopher Nolan', popularity: 92,
    synopsis: 'When Earth becomes uninhabitable, a former pilot leads a team of explorers through a wormhole near Saturn in search of a new home for humanity. Restored and remastered for its tenth anniversary run.',
    cast: [{ name: 'Christopher Nolan', role: 'Director' }, { name: 'Matthew McConaughey', role: 'Cooper' }, { name: 'Anne Hathaway', role: 'Brand' }, { name: 'Jessica Chastain', role: 'Murph' }, { name: 'Michael Caine', role: 'Professor Brand' }],
    trailer: '2m 45s', sound: 'Atmos',
  }),
  m('cyber-runner', {
    title: 'Cyber Runner: Neo Tokyo', genres: ['Cyberpunk', 'Action', 'Sci-Fi'], rating: 'R', score: 8.4, votes: '88k', rt: 88, runtime: 134,
    formats: ['IMAX 70MM', '3D'], badge: 'IMAX 3D', releaseDate: '2026-09-18', director: 'Kenji Aoki', popularity: 88,
    synopsis: 'A synthetic assassin wakes with a memory that is not hers and a city that wants her erased. Neon-drenched, relentless, and built for the biggest screen in the building.',
    cast: [{ name: 'Kenji Aoki', role: 'Director' }, { name: 'Mei Tanaka', role: 'Rin-7' }, { name: 'Oscar Duarte', role: 'Detective Vale' }, { name: 'Priya Nair', role: 'Dr. Okonkwo' }],
    trailer: '2m 20s', sound: 'Atmos',
  }),
  m('the-venice-haunting', {
    title: 'The Venice Haunting', genres: ['Psychological', 'Thriller', 'Horror'], rating: 'R', score: 8.1, votes: '54k', rt: 81, runtime: 118,
    formats: ['LASER 4K', 'VIP LOUNGE'], badge: 'LASER VIP', releaseDate: '2026-10-02', director: 'Elena Marchetti', popularity: 70,
    synopsis: 'A restorer arriving in a flooded palazzo finds that the frescoes she is cleaning keep changing overnight. Chilling psychological suspense set among the canals of Venice.',
    cast: [{ name: 'Elena Marchetti', role: 'Director' }, { name: 'Lucia Ferrante', role: 'Anna' }, { name: 'Tom Hallett', role: 'Conservator Reid' }],
    trailer: '2m 05s', sound: 'Stereo',
  }),
  m('civil-war', {
    title: 'Civil War', genres: ['Action', 'Thriller', 'War'], rating: 'R', score: 7.6, votes: '210k', rt: 82, runtime: 109,
    formats: ['IMAX 70MM', 'LASER 4K'], badge: 'IMAX', releaseDate: '2024-04-12', director: 'Alex Garland', popularity: 78,
    synopsis: 'In a near-future fractured America, a team of journalists races across the country to reach Washington D.C. before the capital falls. A harrowing, immersive look at war through the lens of the press.',
    cast: [{ name: 'Alex Garland', role: 'Director' }, { name: 'Kirsten Dunst', role: 'Lee' }, { name: 'Wagner Moura', role: 'Joel' }, { name: 'Cailee Spaeny', role: 'Jessie' }],
    trailer: '2m 34s', sound: 'Atmos',
  }),
  m('challengers', {
    title: 'Challengers', genres: ['Drama', 'Romance', 'Sport'], rating: 'R', score: 7.8, votes: '165k', rt: 87, runtime: 131,
    formats: ['DOLBY CINEMA', 'LASER 4K'], badge: 'DOLBY AUDIO', releaseDate: '2024-04-26', director: 'Luca Guadagnino', popularity: 64,
    synopsis: 'Tashi, a former tennis prodigy turned coach, has transformed her husband into a champion. To jolt him out of a losing streak she enters him in a Challenger event, where he must face his former best friend and her ex-lover.',
    cast: [{ name: 'Luca Guadagnino', role: 'Director' }, { name: 'Zendaya', role: 'Tashi Duncan' }, { name: 'Mike Faist', role: 'Art Donaldson' }, { name: "Josh O'Connor", role: 'Patrick Zweig' }],
    trailer: '2m 28s', sound: 'Atmos',
  }),
  m('kingdom-of-the-planet-of-the-apes', {
    title: 'Kingdom of the Planet of the Apes', genres: ['Action', 'Sci-Fi', 'Adventure'], rating: 'PG-13', score: 7.3, votes: '120k', rt: 80, runtime: 145,
    formats: ['IMAX 70MM', '3D'], badge: 'IMAX 3D', releaseDate: '2024-05-10', director: 'Wes Ball', popularity: 66, status: 'now_showing',
    synopsis: 'Generations after Caesar’s reign, apes are the dominant species and humans have been reduced to living in the shadows. As a tyrannical ape leader builds his empire, a young ape embarks on a harrowing journey that will make him question everything he has been taught about the past.',
    cast: [{ name: 'Wes Ball', role: 'Director' }, { name: 'Owen Teague', role: 'Noa' }, { name: 'Freya Allan', role: 'Mae' }, { name: 'Kevin Durand', role: 'Proximus Caesar' }],
    trailer: '2m 50s', sound: 'Atmos',
  }),
  m('furiosa', {
    title: 'Furiosa: A Mad Max Saga', genres: ['Action', 'Post-Apocalyptic', 'Sci-Fi'], rating: 'R', score: 7.9, votes: '140k', rt: 90, runtime: 148,
    formats: ['4DX', 'DOLBY CINEMA', 'LASER 4K'], badge: '4DX EXTREME', releaseDate: '2024-05-24', director: 'George Miller', popularity: 82, status: 'advance_booking',
    synopsis: 'As the world falls, young Furiosa is snatched from the Green Place of Many Mothers and falls into the hands of a great Biker Horde led by the Warlord Dementus. Sweeping through the Wasteland they come across the Citadel presided over by The Immortan Joe.',
    cast: [{ name: 'George Miller', role: 'Director' }, { name: 'Anya Taylor-Joy', role: 'Furiosa' }, { name: 'Chris Hemsworth', role: 'Dementus' }, { name: 'Tom Burke', role: 'Praetorian Jack' }],
    trailer: '3m 05s', sound: 'Atmos',
  }),
  m('inside-out-2', {
    title: 'Inside Out 2', genres: ['Animation', 'Comedy', 'Family'], rating: 'PG', score: 8.1, votes: '230k', rt: 91, runtime: 96,
    formats: ['LASER 4K', '3D'], badge: 'STANDARD 2D', releaseDate: '2024-06-14', director: 'Kelsey Mann', popularity: 74, status: 'now_showing',
    synopsis: 'Riley enters adolescence just as a new wave of emotions — Anxiety, Envy, Ennui and Embarrassment — arrives at headquarters and takes over the console, forcing Joy and the original crew to fight for Riley’s sense of self.',
    cast: [{ name: 'Kelsey Mann', role: 'Director' }, { name: 'Amy Poehler', role: 'Joy' }, { name: 'Maya Hawke', role: 'Anxiety' }, { name: 'Phyllis Smith', role: 'Sadness' }],
    trailer: '2m 10s', sound: 'Stereo',
  }),
  m('beyond-the-spider-verse', {
    title: 'Beyond the Spider-Verse', genres: ['Animation', 'Action', 'Sci-Fi'], rating: 'PG', score: 8.7, votes: '98k', rt: 95, runtime: 140,
    formats: ['3D', 'DOLBY CINEMA'], badge: '3D REAL-D', releaseDate: '2026-10-09', director: 'Joaquim Dos Santos', popularity: 86, status: 'now_showing',
    synopsis: 'Miles Morales is back and swinging into the final chapter of the Spider-Verse saga, racing to rescue those he loves across a multiverse that is running out of time.',
    cast: [{ name: 'Joaquim Dos Santos', role: 'Director' }, { name: 'Shameik Moore', role: 'Miles Morales' }, { name: 'Hailee Steinfeld', role: 'Gwen Stacy' }],
    trailer: '2m 00s', sound: 'Atmos',
  }),
  m('blade-runner-2049', {
    title: 'Blade Runner 2049', genres: ['Sci-Fi', 'Mystery', 'Thriller'], rating: 'R', score: 8.0, votes: '600k', rt: 88, runtime: 164,
    formats: ['DOLBY CINEMA', 'IMAX 70MM'], badge: 'DOLBY VISION', releaseDate: '2017-10-06', director: 'Denis Villeneuve', popularity: 58, status: 'now_showing',
    synopsis: 'Young Blade Runner K’s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who’s been missing for thirty years.',
    cast: [{ name: 'Denis Villeneuve', role: 'Director' }, { name: 'Ryan Gosling', role: 'K' }, { name: 'Harrison Ford', role: 'Rick Deckard' }, { name: 'Ana de Armas', role: 'Joi' }],
    trailer: '2m 40s', sound: 'Atmos',
  }),
  m('joker-folie-a-deux', {
    title: 'Joker: Folie à Deux', genres: ['Crime', 'Drama', 'Musical'], rating: 'R', score: 6.8, votes: '92k', rt: 33, runtime: 138,
    formats: ['IMAX 70MM', 'LASER 4K'], badge: 'LATE NIGHT', releaseDate: '2024-10-04', director: 'Todd Phillips', popularity: 52, status: 'now_showing',
    synopsis: 'Arthur Fleck is institutionalized at Arkham awaiting trial for his crimes as Joker. While struggling with his dual identity, Arthur not only stumbles upon true love, but also finds the music that has always been inside him.',
    cast: [{ name: 'Todd Phillips', role: 'Director' }, { name: 'Joaquin Phoenix', role: 'Arthur Fleck' }, { name: 'Lady Gaga', role: 'Harleen Quinzel' }],
    trailer: '2m 35s', sound: 'Atmos',
  }),
  m('gladiator-ii', {
    title: 'Gladiator II', genres: ['Historical Epic', 'Action'], rating: 'R', score: 0, votes: '—', rt: 0, runtime: 148, anticipation: 98,
    formats: ['IMAX 70MM', 'DOLBY CINEMA'], badge: 'IMAX', releaseDate: '2026-11-15', director: 'Ridley Scott', popularity: 90, status: 'coming_soon',
    synopsis: 'Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by the tyrannical emperors who now lead Rome with an iron fist.',
    cast: [{ name: 'Ridley Scott', role: 'Director' }, { name: 'Paul Mescal', role: 'Lucius' }, { name: 'Denzel Washington', role: 'Macrinus' }],
    trailer: '2m 15s', sound: 'Atmos',
  }),
  m('nosferatu-the-nocturne', {
    title: 'Nosferatu: The Nocturne', genres: ['Dark Fantasy', 'Gothic Horror'], rating: 'R', score: 0, votes: '—', rt: 0, runtime: 132, anticipation: 95,
    formats: ['DOLBY CINEMA', 'LASER 4K'], badge: 'DOLBY CINEMA', releaseDate: '2026-12-20', director: 'Robert Eggers', popularity: 80, status: 'coming_soon',
    synopsis: 'Robert Eggers brings a gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her.',
    cast: [{ name: 'Robert Eggers', role: 'Director' }, { name: 'Lily-Rose Depp', role: 'Ellen' }, { name: 'Bill Skarsgård', role: 'Count Orlok' }],
    trailer: '1m 58s', sound: 'Atmos',
  }),
  m('sub-terra', {
    title: 'Sub-Terra: Project Mariana', genres: ['Sci-Fi', 'Thriller'], rating: 'PG-13', score: 0, votes: '—', rt: 0, runtime: 126, anticipation: 91,
    formats: ['IMAX 70MM', '3D'], badge: 'REAL-D 3D', releaseDate: '2027-01-10', director: 'Hana Okafor', popularity: 61, status: 'coming_soon',
    synopsis: 'Deep beneath the oceanic trench, a covert scientific detachment unearths a discovery that cannot go back where it came from.',
    cast: [{ name: 'Hana Okafor', role: 'Director' }, { name: 'Idris Vega', role: 'Cmdr. Hale' }, { name: 'Sora Lindgren', role: 'Dr. Mariner' }],
    trailer: '1m 45s', sound: 'Atmos',
  }),
];

export const GENRES = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Cyberpunk', 'Drama', 'Family', 'Horror', 'Mystery', 'Post-Apocalyptic', 'Psychological', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War'];
export const LANGUAGES = ['English', 'Spanish', 'French', 'Japanese', 'Hindi', 'Korean'];
export const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
export const MOVIE_STATUS = {
  now_showing: { label: 'Now Showing', tone: 'green' },
  advance_booking: { label: 'Advance Booking', tone: 'red' },
  coming_soon: { label: 'Coming Soon', tone: 'amber' },
  archived: { label: 'Archived', tone: 'slate' },
};
export const CAST_PHOTO = CAST_PHOTOS;
