// "Store" partagé : garde le profil, le programme, les séances remplies et
// les mesures en mémoire pour tous les écrans, et les sauvegarde sur le
// téléphone à chaque changement.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { genererProgramme } from './ai';
import { loadLogs, loadMesures, loadProfile, loadProgram, saveLogs, saveMesures, saveProfile, saveProgram } from './storage';
import { DEFAULT_PROFILE, type Mesure, type Profile, type Program, type SeanceLog } from './types';

type AppState = {
  pret: boolean;
  profil: Profile;
  programme: Program | null;
  logs: Record<string, SeanceLog>;
  mesures: Mesure[];
  enGeneration: boolean;
  erreurIa?: string;
  majProfil: (profil: Profile) => Promise<void>;
  generer: () => Promise<void>;
  // modif reçoit la dernière version de la séance (ou `initial` si elle n'existe pas encore)
  majLog: (cle: string, initial: SeanceLog, modif: (log: SeanceLog) => SeanceLog) => Promise<void>;
  ajouterMesure: (mesure: Mesure) => Promise<void>;
  supprimerMesure: (id: string) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pret, setPret] = useState(false);
  const [profil, setProfil] = useState<Profile>(DEFAULT_PROFILE);
  const [programme, setProgramme] = useState<Program | null>(null);
  const [logs, setLogsState] = useState<Record<string, SeanceLog>>({});
  // Copie toujours à jour des séances : évite de perdre une saisie quand
  // deux modifications arrivent très vite (ex : quitter un champ puis valider).
  const logsRef = useRef(logs);
  const setLogs = (l: Record<string, SeanceLog>) => {
    logsRef.current = l;
    setLogsState(l);
  };
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [enGeneration, setEnGeneration] = useState(false);
  const [erreurIa, setErreurIa] = useState<string>();

  // Au démarrage : on recharge ce qui a été sauvegardé.
  useEffect(() => {
    (async () => {
      const [p, prog, m] = await Promise.all([loadProfile(), loadProgram(), loadMesures()]);
      setProfil(p);
      setProgramme(prog);
      setMesures(m);
      if (prog) setLogs(await loadLogs(prog.id));
      setPret(true);
    })();
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
      setLogs({}); // nouveau programme = nouveau suivi (l'ancien reste sauvegardé)
      setErreurIa(resultat.erreurIa);
      await saveProgram(resultat.programme);
    } finally {
      setEnGeneration(false);
    }
  }

  async function majLog(cle: string, initial: SeanceLog, modif: (log: SeanceLog) => SeanceLog) {
    if (!programme) return;
    const actuels = logsRef.current;
    const nouveaux = { ...actuels, [cle]: modif(actuels[cle] ?? initial) };
    setLogs(nouveaux);
    await saveLogs(programme.id, nouveaux);
  }

  async function ajouterMesure(mesure: Mesure) {
    const nouvelles = [...mesures, mesure].sort((a, b) => a.date.localeCompare(b.date));
    setMesures(nouvelles);
    await saveMesures(nouvelles);
    // Le poids mesuré met aussi à jour le profil (utile pour les calories).
    if (mesure.valeurs.poids) await majProfil({ ...profil, poids: mesure.valeurs.poids });
  }

  async function supprimerMesure(id: string) {
    const nouvelles = mesures.filter((m) => m.id !== id);
    setMesures(nouvelles);
    await saveMesures(nouvelles);
  }

  return (
    <AppContext.Provider
      value={{
        pret,
        profil,
        programme,
        logs,
        mesures,
        enGeneration,
        erreurIa,
        majProfil,
        generer,
        majLog,
        ajouterMesure,
        supprimerMesure,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}
