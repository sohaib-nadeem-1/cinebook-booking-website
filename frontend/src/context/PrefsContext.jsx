import { createContext, useContext, useMemo, useState } from 'react';
import { store } from '../utils/storage.js';
import { CINEMAS } from '../data/cinemas.js';

const Ctx = createContext(null);
export function PrefsProvider({ children }) {
  const [cinemaId, setCinema] = useState(() => store.get('prefCinema', 'c1'));
  const value = useMemo(() => ({
    cinemaId, cinema: CINEMAS.find((c) => c.id === cinemaId) || CINEMAS[0],
    setCinema: (id) => { setCinema(id); store.set('prefCinema', id); },
  }), [cinemaId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const usePrefs = () => useContext(Ctx);
