// "Store" partagé : garde le profil, le programme, les séances remplies et
// les mesures en mémoire pour tous les écrans, et les sauvegarde sur le
// téléphone à chaque changement.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { genererProgramme } from './ai';
import { genererProgrammeCF, type ProgrammeCF, type SeanceCFLog } from './crossfit';
import {
  loadLogs,
  loadLogsCF,
  loadMesures,
  loadProfile,
  loadProgram,
  loadProgrammeCF,
  saveLogs,
  saveLogsCF,
  saveMesures,
  saveProfile,
  saveProgram,
  saveProgrammeCF,
} from './storage';
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
  // nouveau = nouveau suivi ; sinon on garde l'id et les séances déjà remplies
  enregistrerProgramme: (programme: Program, nouveau: boolean) => Promise<void>;
  // modif reçoit la dernière version de la séance (ou `initial` si elle n'existe pas encore)
  majLog: (cle: string, initial: SeanceLog, modif: (log: SeanceLog) => SeanceLog) => Promise<void>;
  ajouterMesure: (mesure: Mesure) => Promise<void>;
  supprimerMesure: (id: string) => Promise<void>;
  // CrossFit
  programmeCF: ProgrammeCF | null;
  logsCF: Record<string, SeanceCFLog>;
  genererCF: () => Promise<void>;
  majLogCF: (cle: string, modif: (log: SeanceCFLog) => SeanceCFLog) => Promise<void>;
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
  const [programmeCF, setProgrammeCF] = useState<ProgrammeCF | null>(null);
  const [logsCF, setLogsCFState] = useState<Record<string, SeanceCFLog>>({});
  const logsCFRef = useRef(logsCF);
  const setLogsCF = (l: Record<string, SeanceCFLog>) => {
    logsCFRef.current = l;
    setLogsCFState(l);
  };
  const [erreurIa, setErreurIa] = useState<string>();

  // Au démarrage : on recharge ce qui a été sauvegardé.
  useEffect(() => {
    (async () => {
      const [p, prog, m, cf] = await Promise.all([loadProfile(), loadProgram(), loadMesures(), loadProgrammeCF()]);
      setProfil(p);
      setProgramme(prog);
      setMesures(m);
      setProgrammeCF(cf);
      if (prog) setLogs(await loadLogs(prog.id));
      if (cf) setLogsCF(await loadLogsCF(cf.id));
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

  async function enregistrerProgramme(nouveauProgramme: Program, nouveau: boolean) {
    setProgramme(nouveauProgramme);
    if (nouveau) setLogs({});
    setErreurIa(undefined);
    await saveProgram(nouveauProgramme);
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

  async function genererCF() {
    const nouveau = genererProgrammeCF(profil);
    setProgrammeCF(nouveau);
    setLogsCF({});
    await saveProgrammeCF(nouveau);
  }

  async function majLogCF(cle: string, modif: (log: SeanceCFLog) => SeanceCFLog) {
    if (!programmeCF) return;
    const actuels = logsCFRef.current;
    const nouveaux = { ...actuels, [cle]: modif(actuels[cle] ?? { terminee: false, rx: profil.niveau !== 'debutant' }) };
    setLogsCF(nouveaux);
    await saveLogsCF(programmeCF.id, nouveaux);
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
        enregistrerProgramme,
        majLog,
        ajouterMesure,
        supprimerMesure,
        programmeCF,
        logsCF,
        genererCF,
        majLogCF,
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
