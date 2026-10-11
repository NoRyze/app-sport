// "Store" partagé : garde le profil et le programme en mémoire pour tous
// les écrans, et les sauvegarde sur le téléphone à chaque changement.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { genererProgramme } from './ai';
import { loadProfile, loadProgram, saveProfile, saveProgram } from './storage';
import { DEFAULT_PROFILE, type Profile, type Program } from './types';

type AppState = {
  pret: boolean;
  profil: Profile;
  programme: Program | null;
  enGeneration: boolean;
  erreurIa?: string;
  majProfil: (profil: Profile) => Promise<void>;
  generer: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pret, setPret] = useState(false);
  const [profil, setProfil] = useState<Profile>(DEFAULT_PROFILE);
  const [programme, setProgramme] = useState<Program | null>(null);
  const [enGeneration, setEnGeneration] = useState(false);
  const [erreurIa, setErreurIa] = useState<string>();

  // Au démarrage : on recharge ce qui a été sauvegardé.
  useEffect(() => {
    Promise.all([loadProfile(), loadProgram()]).then(([p, prog]) => {
      setProfil(p);
      setProgramme(prog);
      setPret(true);
    });
  }, []);

  async function majProfil(nouveau: Profile) {
    setProfil(nouveau);
    await saveProfile(nouveau);
  }

  async function generer() {
    setEnGeneration(true);
    setErreurIa(undefined);
    try {
      const resultat = await genererProgramme(profil);
      setProgramme(resultat.programme);
      setErreurIa(resultat.erreurIa);
      await saveProgram(resultat.programme);
    } finally {
      setEnGeneration(false);
    }
  }

  return (
    <AppContext.Provider value={{ pret, profil, programme, enGeneration, erreurIa, majProfil, generer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}
