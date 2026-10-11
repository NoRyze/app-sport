// Générateur "hors ligne" : il construit un programme à partir de règles
// d'entraînement classiques. Il sert de solution de secours quand l'IA
// n'est pas encore branchée (ou pas de réseau).

import type { AiPlan, Exercise, Materiel, Objectif, Profile, Program, Session, Week } from './types';
import { OBJECTIF_LABELS } from './types';

// Un "mouvement" est une famille d'exercices (ex : pousser horizontalement).
// Pour chaque matériel on choisit une variante adaptée.
type Mouvement =
  | 'squat'
  | 'charniere'
  | 'fente'
  | 'pousseeHorizontale'
  | 'pousseeVerticale'
  | 'tirageHorizontal'
  | 'tirageVertical'
  | 'biceps'
  | 'triceps'
  | 'epaulesIsolation'
  | 'mollets'
  | 'gainage';

const EXERCICES: Record<Mouvement, Record<Materiel, string[]>> = {
  squat: {
    salle: ['Squat barre', 'Presse à cuisses', 'Hack squat'],
    halteres: ['Goblet squat', 'Squat haltères'],
    poids_du_corps: ['Squat poids du corps', 'Squat sauté'],
  },
  charniere: {
    salle: ['Soulevé de terre roumain', 'Soulevé de terre', 'Leg curl'],
    halteres: ['Soulevé de terre roumain haltères', 'Hip thrust haltère'],
    poids_du_corps: ['Hip thrust au sol', 'Good morning poids du corps'],
  },
  fente: {
    salle: ['Fentes bulgares', 'Fentes marchées'],
    halteres: ['Fentes bulgares haltères', 'Fentes arrière haltères'],
    poids_du_corps: ['Fentes arrière', 'Step-up sur banc'],
  },
  pousseeHorizontale: {
    salle: ['Développé couché', 'Développé incliné haltères', 'Dips'],
    halteres: ['Développé couché haltères', 'Développé incliné haltères'],
    poids_du_corps: ['Pompes', 'Pompes pieds surélevés'],
  },
  pousseeVerticale: {
    salle: ['Développé militaire', 'Développé épaules haltères'],
    halteres: ['Développé épaules haltères', 'Arnold press'],
    poids_du_corps: ['Pompes piquées', 'Pompes pike surélevées'],
  },
  tirageHorizontal: {
    salle: ['Rowing barre', 'Tirage horizontal poulie', 'Rowing haltère'],
    halteres: ['Rowing haltère un bras', 'Rowing haltères buste penché'],
    poids_du_corps: ['Rowing inversé sous une table', 'Superman rowing'],
  },
  tirageVertical: {
    salle: ['Tractions', 'Tirage vertical poulie'],
    halteres: ['Pull-over haltère', 'Rowing haltère prise haute'],
    poids_du_corps: ['Tractions', 'Tractions négatives'],
  },
  biceps: {
    salle: ['Curl barre EZ', 'Curl poulie'],
    halteres: ['Curl haltères', 'Curl marteau'],
    poids_du_corps: ['Tractions supination', 'Curl serviette isométrique'],
  },
  triceps: {
    salle: ['Extension triceps poulie', 'Barre au front'],
    halteres: ['Extension nuque haltère', 'Kickback haltère'],
    poids_du_corps: ['Pompes diamant', 'Dips sur banc'],
  },
  epaulesIsolation: {
    salle: ['Élévations latérales', 'Face pull poulie'],
    halteres: ['Élévations latérales haltères', 'Oiseau haltères'],
    poids_du_corps: ['Y-T-W au sol', 'Pompes scapulaires'],
  },
  mollets: {
    salle: ['Mollets debout machine', 'Mollets à la presse'],
    halteres: ['Mollets debout haltères'],
    poids_du_corps: ['Mollets sur une marche'],
  },
  gainage: {
    salle: ['Relevés de jambes suspendu', 'Crunch poulie'],
    halteres: ['Gainage planche', 'Russian twist haltère'],
    poids_du_corps: ['Gainage planche', 'Hollow hold'],
  },
};

// Gros exercices polyarticulaires : on les place en début de séance.
const POLYARTICULAIRES: Mouvement[] = [
  'squat',
  'charniere',
  'pousseeHorizontale',
  'pousseeVerticale',
  'tirageHorizontal',
  'tirageVertical',
];

type Modele = { nom: string; focus: string; mouvements: Mouvement[] };

const FULL_A: Modele = {
  nom: 'Full body A',
  focus: 'Corps entier, accent jambes',
  mouvements: ['squat', 'pousseeHorizontale', 'tirageHorizontal', 'fente', 'epaulesIsolation', 'gainage', 'biceps'],
};
const FULL_B: Modele = {
  nom: 'Full body B',
  focus: 'Corps entier, accent chaîne arrière',
  mouvements: ['charniere', 'pousseeVerticale', 'tirageVertical', 'fente', 'triceps', 'mollets', 'gainage'],
};
const FULL_C: Modele = {
  nom: 'Full body C',
  focus: 'Corps entier, accent haut du corps',
  mouvements: ['squat', 'tirageVertical', 'pousseeHorizontale', 'charniere', 'epaulesIsolation', 'biceps', 'triceps'],
};
const HAUT_A: Modele = {
  nom: 'Haut du corps A',
  focus: 'Pectoraux, dos, bras',
  mouvements: ['pousseeHorizontale', 'tirageHorizontal', 'pousseeVerticale', 'tirageVertical', 'biceps', 'triceps', 'epaulesIsolation'],
};
const BAS_A: Modele = {
  nom: 'Bas du corps A',
  focus: 'Quadriceps, fessiers',
  mouvements: ['squat', 'charniere', 'fente', 'mollets', 'gainage'],
};
const HAUT_B: Modele = {
  nom: 'Haut du corps B',
  focus: 'Dos, épaules, bras',
  mouvements: ['tirageVertical', 'pousseeVerticale', 'tirageHorizontal', 'pousseeHorizontale', 'epaulesIsolation', 'triceps', 'biceps'],
};
const BAS_B: Modele = {
  nom: 'Bas du corps B',
  focus: 'Ischios, fessiers',
  mouvements: ['charniere', 'fente', 'squat', 'mollets', 'gainage'],
};
const PUSH: Modele = {
  nom: 'Push',
  focus: 'Pectoraux, épaules, triceps',
  mouvements: ['pousseeHorizontale', 'pousseeVerticale', 'pousseeHorizontale', 'epaulesIsolation', 'triceps', 'triceps'],
};
const PULL: Modele = {
  nom: 'Pull',
  focus: 'Dos, biceps',
  mouvements: ['tirageVertical', 'tirageHorizontal', 'charniere', 'epaulesIsolation', 'biceps', 'biceps'],
};
const LEGS: Modele = {
  nom: 'Legs',
  focus: 'Jambes complètes',
  mouvements: ['squat', 'charniere', 'fente', 'mollets', 'gainage'],
};

// Choix de la répartition (le "split") selon le nombre de séances par semaine.
function choisirSplit(jours: number, niveau: Profile['niveau']): Modele[] {
  if (jours <= 2) return [FULL_A, FULL_B];
  if (jours === 3) return niveau === 'debutant' ? [FULL_A, FULL_B, FULL_C] : [PUSH, PULL, LEGS];
  if (jours === 4) return [HAUT_A, BAS_A, HAUT_B, BAS_B];
  if (jours === 5) return [PUSH, PULL, LEGS, HAUT_A, BAS_B];
  return [PUSH, PULL, LEGS, { ...PUSH, nom: 'Push B' }, { ...PULL, nom: 'Pull B' }, { ...LEGS, nom: 'Legs B' }];
}

// Séries, répétitions et repos selon l'objectif.
const PARAMS: Record<Objectif, { series: number; repsPoly: string; repsIso: string; repos: number; reposIso: number }> = {
  force: { series: 5, repsPoly: '4-6', repsIso: '8-10', repos: 180, reposIso: 90 },
  masse: { series: 4, repsPoly: '6-10', repsIso: '10-12', repos: 120, reposIso: 75 },
  seche: { series: 3, repsPoly: '10-12', repsIso: '12-15', repos: 75, reposIso: 45 },
  forme: { series: 3, repsPoly: '10-12', repsIso: '12-15', repos: 90, reposIso: 60 },
};

function nombreExercices(dureeSeance: number) {
  if (dureeSeance <= 45) return 4;
  if (dureeSeance <= 60) return 5;
  if (dureeSeance <= 75) return 6;
  return 7;
}

// Périodisation : on monte l'intensité 3 semaines puis 1 semaine de décharge.
function phaseSemaine(numero: number, total: number) {
  const estDecharge = numero % 4 === 0 && numero !== total;
  if (estDecharge) return { theme: 'Décharge', rpe: 6, deltaSeries: -1 };
  if (numero === total && total >= 4) return { theme: 'Test et pic', rpe: 9, deltaSeries: 0 };
  const position = ((numero - 1) % 4) + 1; // 1, 2 ou 3 dans le bloc
  const themes = ['Accumulation', 'Progression', 'Intensification'];
  return { theme: themes[position - 1], rpe: 6 + position, deltaSeries: 0 };
}

function construireSeance(modele: Modele, jour: number, profil: Profile, semaine: number, totalSemaines: number): Session {
  const params = PARAMS[profil.objectif];
  const phase = phaseSemaine(semaine, totalSemaines);
  const ajustNiveau = profil.niveau === 'debutant' ? -1 : profil.niveau === 'avance' ? 1 : 0;
  const deja = new Map<Mouvement, number>();

  const exercices: Exercise[] = modele.mouvements.slice(0, nombreExercices(profil.dureeSeance)).map((mvt) => {
    const variantes = EXERCICES[mvt][profil.materiel];
    // On fait tourner les variantes d'un bloc de 4 semaines à l'autre pour varier.
    const index = (deja.get(mvt) ?? 0) + Math.floor((semaine - 1) / 4);
    deja.set(mvt, (deja.get(mvt) ?? 0) + 1);
    const poly = POLYARTICULAIRES.includes(mvt);
    const gainage = mvt === 'gainage';
    const series = Math.max(2, (poly ? params.series : params.series - 1) + ajustNiveau + phase.deltaSeries);

    return {
      nom: variantes[index % variantes.length],
      series,
      reps: gainage ? '30-45 s' : poly ? params.repsPoly : params.repsIso,
      repos: poly ? params.repos : params.reposIso,
      intensite: `RPE ${poly ? phase.rpe : Math.min(phase.rpe + 1, 9)}`,
      conseil: poly && semaine === 1 ? 'Trouve une charge où il te reste 2 à 3 répétitions en réserve.' : undefined,
    };
  });

  return { jour, nom: modele.nom, focus: modele.focus, exercices };
}

export function genererProgrammeLocal(profil: Profile): Program {
  const split = choisirSplit(profil.joursParSemaine, profil.niveau);
  const semaines: Week[] = [];

  for (let s = 1; s <= profil.semaines; s++) {
    const sessions = Array.from({ length: profil.joursParSemaine }, (_, i) =>
      construireSeance(split[i % split.length], i + 1, profil, s, profil.semaines),
    );
    semaines.push({ numero: s, theme: phaseSemaine(s, profil.semaines).theme, sessions });
  }

  return {
    id: String(Date.now()),
    titre: `${OBJECTIF_LABELS[profil.objectif]} · ${profil.semaines} semaines`,
    description: `${profil.joursParSemaine} séances par semaine de ${profil.dureeSeance} min. Intensité progressive avec une semaine de décharge toutes les 4 semaines.`,
    createdAt: new Date().toISOString(),
    source: 'local',
    semaines,
  };
}

// Transforme le plan de l'IA (une semaine type + progression) en programme complet.
export function developperPlan(plan: AiPlan): Program {
  const semaines: Week[] = plan.progression.map((p) => ({
    numero: p.numero,
    theme: p.theme,
    sessions: plan.seances.map((seance) => ({
      ...seance,
      exercices: seance.exercices.map((ex) => ({
        ...ex,
        series: Math.max(1, ex.series + p.deltaSeries),
        intensite: `RPE ${p.rpe}`,
        conseil: p.numero === 1 ? ex.conseil : undefined,
      })),
    })),
  }));

  return {
    id: String(Date.now()),
    titre: plan.titre,
    description: plan.description,
    createdAt: new Date().toISOString(),
    source: 'ia',
    semaines,
  };
}
