export const CINEMAS = [
  { id: 'c1', name: 'CineBook Grand IMAX 70mm', short: 'Lincoln Center', area: 'Upper West Side, NY', tag: 'FLAGSHIP SCREEN', distance: '1.2 miles away', city: 'New York', amenities: ['Laser 4K', 'Luxury Recliners', 'Dolby Atmos'] },
  { id: 'c2', name: 'CineBook Royal Dolby Cinema', short: 'Times Square', area: 'Theater District, NY', tag: 'DOLBY CERTIFIED', distance: '2.4 miles away', city: 'New York', amenities: ['Dolby Atmos 128ch', 'Heated Recliners'] },
  { id: 'c3', name: 'CineBook Downtown Luxe Cinema', short: 'Downtown', area: 'SoHo, NY', tag: 'BOUTIQUE LOUNGE', distance: '3.1 miles away', city: 'New York', amenities: ['In-Seat Dining', 'Chaise Lounges'] },
];

/** profile → which seat-map layout the hall uses (see data/seats.js) */
export const AUDITORIUMS = [
  { id: 'a1', cinemaId: 'c1', name: 'Auditorium 1', spec: 'IMAX 70mm Dual Laser', format: 'IMAX 70MM', profile: 'grand', basePrice: 24.5 },
  { id: 'a2', cinemaId: 'c1', name: 'Auditorium 2', spec: 'IMAX 70mm Reel Platter', format: 'IMAX 70MM', profile: 'grand', basePrice: 25.5 },
  { id: 'a3', cinemaId: 'c2', name: 'Auditorium 4', spec: 'Dolby Vision Dual HDR', format: 'DOLBY CINEMA', profile: 'grand', basePrice: 21 },
  { id: 'a4', cinemaId: 'c2', name: 'Auditorium 3', spec: 'Dolby Atmos VIP Lounge', format: 'VIP LOUNGE', profile: 'boutique', basePrice: 30 },
  { id: 'a5', cinemaId: 'c3', name: 'Screen 2', spec: '4K Laser Standard', format: 'LASER 4K', profile: 'boutique', basePrice: 18.5 },
  { id: 'a6', cinemaId: 'c3', name: 'Lounge 3', spec: 'Chaise Lounge Laser', format: 'LASER 4K', profile: 'grand', basePrice: 19.5 },
];

export const FORMATS = ['IMAX 70MM', 'DOLBY CINEMA', 'LASER 4K', 'VIP LOUNGE', '3D', '4DX'];
