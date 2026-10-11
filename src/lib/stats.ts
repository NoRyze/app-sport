// Calculs : tonnage, durée, calories, records et bilan.
import { ficheExercice } from './exercices';
import { cleSeance, type Program, type SeanceLog, type Session } from './types';

// Charge réelle d'une série : charge saisie + part du poids du corps
// pour les exercices au poids du corps (pompes, tractions...).
function chargeSerie(nomExercice: string, poids: number | null, poidsCorps: number) {
  const pdc = ficheExercice(nomExercice)?.poidsDuCorps ?? 0;
  return (poids ?? 0) + pdc * poidsCorps;
}

// Tonnage = somme de (charge × répétitions) sur toutes les séries validées.
export function tonnageSeance(seance: Session, log: SeanceLog | undefined, poidsCorps: number) {
  if (!log) return 0;
  let total = 0;
  seance.exercices.forEach((ex, i) => {
    for (const s of log.series[i] ?? []) {
      if (s.fait && s.reps) total += chargeSerie(ex.nom, s.poids, poidsCorps) * s.reps;
    }
  });
  return Math.round(total);
}

export function seriesFaites(log: SeanceLog | undefined) {
  if (!log) return 0;
  return Object.values(log.series).reduce((n, series) => n + series.filter((s) => s.fait).length, 0);
}

// Durée entre la première et la dernière série validée (+ 2 min pour la dernière série).
export function dureeMinutes(log: SeanceLog | undefined, maintenant = Date.now()) {
  if (!log?.debut) return 0;
  const fin = log.terminee && log.derniereActivite ? Date.parse(log.derniereActivite) : maintenant;
  return Math.max(1, Math.round((fin - Date.parse(log.debut)) / 60000) + (log.terminee ? 2 : 0));
}

// Calories estimées avec la méthode MET (dépense énergétique d'une activité) :
// kcal = MET × poids (kg) × durée (h). La musculation intense vaut environ 5 MET.
// C'est une estimation : une montre cardio sera plus précise.
export function calories(minutes: number, poidsCorps: number, met = 5) {
  return Math.round(met * poidsCorps * (minutes / 60));
}

// 1RM estimé (charge max pour 1 répétition), formule d'Epley.
export const unRM = (charge: number, reps: number) => (reps <= 1 ? charge : charge * (1 + reps / 30));

// Dernière charge utilisée pour un exercice (pour pré-remplir la séance suivante).
export function derniereCharge(programme: Program, logs: Record<string, SeanceLog>, nomExercice: string, avant: string) {
  let resultat: number | null = null;
  for (const semaine of programme.semaines) {
    for (const seance of semaine.sessions) {
      const cle = cleSeance(semaine.numero, seance.jour);
      if (cle === avant) return resultat;
      const log = logs[cle];
      if (!log) continue;
      seance.exercices.forEach((ex, i) => {
        if (ex.nom !== nomExercice) return;
        const faites = (log.series[i] ?? []).filter((s) => s.fait && s.poids != null);
        if (faites.length) resultat = faites[faites.length - 1].poids;
      });
    }
  }
  return resultat;
}

export type ProgressionExercice = {
  nom: string;
  debut: number; // meilleur 1RM estimé lors de la 1re séance
  fin: number; // meilleur 1RM estimé lors de la dernière séance
  record: number; // meilleure charge soulevée
  seances: number; // nombre de séances où l'exercice a été fait
};

export type Bilan = {
  seancesPrevues: number;
  seancesFaites: number;
  tonnageTotal: number;
  minutesTotal: number;
  caloriesTotal: number;
  tonnageParSemaine: { semaine: number; tonnage: number }[];
  progression: ProgressionExercice[];
};

export function calculerBilan(programme: Program, logs: Record<string, SeanceLog>, poidsCorps: number): Bilan {
  let seancesPrevues = 0;
  let seancesFaites = 0;
  let tonnageTotal = 0;
  let minutesTotal = 0;
  const tonnageParSemaine: Bilan['tonnageParSemaine'] = [];
  const parExercice = new Map<string, { debut?: number; fin: number; record: number; seances: number }>();

  for (const semaine of programme.semaines) {
    let tonnageSemaine = 0;
    for (const seance of semaine.sessions) {
      seancesPrevues++;
      const log = logs[cleSeance(semaine.numero, seance.jour)];
      if (!log || seriesFaites(log) === 0) continue;
      seancesFaites++;
      const t = tonnageSeance(seance, log, poidsCorps);
      tonnageSemaine += t;
      minutesTotal += dureeMinutes(log);

      seance.exercices.forEach((ex, i) => {
        const faites = (log.series[i] ?? []).filter((s) => s.fait && s.reps);
        if (!faites.length) return;
        const charges = faites.map((s) => chargeSerie(ex.nom, s.poids, poidsCorps));
        const meilleur1RM = Math.max(...faites.map((s, j) => unRM(charges[j], s.reps ?? 0)));
        const suivi = parExercice.get(ex.nom) ?? { fin: 0, record: 0, seances: 0 };
        suivi.seances++;
        suivi.debut ??= meilleur1RM;
        suivi.fin = meilleur1RM;
        suivi.record = Math.max(suivi.record, ...charges);
        parExercice.set(ex.nom, suivi);
      });
    }
    tonnageTotal += tonnageSemaine;
    tonnageParSemaine.push({ semaine: semaine.numero, tonnage: tonnageSemaine });
  }

  const progression = [...parExercice.entries()]
    .filter(([, s]) => s.debut && s.record > 0)
    .map(([nom, s]) => ({
      nom,
      debut: Math.round(s.debut!),
      fin: Math.round(s.fin),
      record: Math.round(s.record),
      seances: s.seances,
    }))
    .sort((a, b) => b.fin - b.debut - (a.fin - a.debut));

  return {
    seancesPrevues,
    seancesFaites,
    tonnageTotal,
    minutesTotal,
    caloriesTotal: calories(minutesTotal, poidsCorps),
    tonnageParSemaine,
    progression,
  };
}

// Formatage : 12500 -> "12,5 t" ; 850 -> "850 kg"
export function formatTonnage(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} t` : `${kg} kg`;
}

// 75 -> "1 h 15" ; 42 -> "42 min"
export function formatDuree(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
}
