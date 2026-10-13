// Partie CrossFit : mouvements, WODs "benchmarks", générateur de programme
// et calcul des scores. Tout fonctionne hors ligne.
//
// Un WOD ("Workout Of the Day") peut avoir 4 formats :
// - For Time : finir le travail le plus vite possible (avec un temps limite, le "cap")
// - AMRAP    : "As Many Rounds As Possible", un maximum de tours en X minutes
// - EMOM     : "Every Minute On the Minute", un travail à refaire au début de chaque minute
// - Tabata   : 8 × (20 s d'effort / 10 s de repos)
// RX = le WOD avec les charges officielles ; Scaled = version allégée.

import { phaseSemaine } from './generator';
import type { Materiel, Niveau, Profile, Sexe } from './types';

// ---------- Types ----------

export type FormatWod = 'for_time' | 'amrap' | 'emom' | 'tabata';

export const FORMAT_LABELS: Record<FormatWod, string> = {
  for_time: 'For Time',
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
};

export const FORMAT_EXPLICATIONS: Record<FormatWod, string> = {
  for_time: 'Termine le travail le plus vite possible, avant le temps limite.',
  amrap: 'Fais un maximum de tours (rounds) dans le temps donné.',
  emom: 'Au début de chaque minute, fais les reps puis repose-toi le reste de la minute.',
  tabata: '8 tours de 20 s d’effort et 10 s de repos par mouvement. Compte tes reps.',
};

export type MouvementWod = {
  nom: string;
  reps: string; // "15", "21-15-9", "400 m", "12 cal"
  rx?: string; // charge officielle (selon homme / femme)
  scaled?: string; // charge allégée ou mouvement plus simple
};

export type Wod = {
  nom: string;
  format: FormatWod;
  duree: number; // minutes : temps limite (For Time) ou durée totale
  rounds?: number; // For Time : nombre de tours
  description: string;
  mouvements: MouvementWod[];
  benchmark?: boolean; // WOD de référence, à refaire pour mesurer ses progrès
};

export type BlocForce = {
  mouvement: string;
  series: number;
  reps: string;
  intensite: string;
  charge: boolean; // false = exercice au poids du corps (pas de charge à noter)
};

export type SeanceCF = {
  jour: number;
  nom: string;
  echauffement: string[];
  force?: BlocForce;
  wod: Wod;
};

export type SemaineCF = { numero: number; theme: string; seances: SeanceCF[] };

export type ProgrammeCF = {
  id: string;
  titre: string;
  description: string;
  createdAt: string;
  semaines: SemaineCF[];
};

export type Ressenti = 'facile' | 'ok' | 'dur' | 'extreme';
export const RESSENTI_LABELS: Record<Ressenti, string> = {
  facile: '😌 Facile',
  ok: '🙂 OK',
  dur: '😤 Dur',
  extreme: '🥵 Extrême',
};

export type SeanceCFLog = {
  terminee: boolean;
  date?: string;
  rx: boolean;
  temps?: number | null; // For Time : secondes
  cap?: boolean; // For Time : temps limite atteint avant la fin
  rounds?: number | null; // AMRAP
  reps?: number | null; // reps en plus (AMRAP), au cap (For Time) ou total (EMOM, Tabata)
  chargeForce?: number | null; // charge de travail sur le bloc force
  ressenti?: Ressenti;
  notes?: string;
};

// ---------- Mouvements ----------

type Type = 'halterophilie' | 'gym' | 'cardio';
type ParSexe = { homme: string; femme: string };

type MouvementCF = {
  type: Type;
  besoin: Materiel; // matériel minimum
  niveau: Niveau; // niveau minimum
  reps: [number, number]; // fourchette par tour
  unite?: 'm' | 'cal';
  rx?: ParSexe;
  scaled: ParSexe | string;
};

const MOUVEMENTS: Record<string, MouvementCF> = {
  // Haltérophilie (salle)
  Thruster: { type: 'halterophilie', besoin: 'salle', niveau: 'debutant', reps: [9, 15], rx: { homme: '43 kg', femme: '30 kg' }, scaled: { homme: '30 kg', femme: '20 kg' } },
  'Power clean': { type: 'halterophilie', besoin: 'salle', niveau: 'debutant', reps: [5, 10], rx: { homme: '61 kg', femme: '43 kg' }, scaled: { homme: '40 kg', femme: '30 kg' } },
  'Power snatch': { type: 'halterophilie', besoin: 'salle', niveau: 'intermediaire', reps: [5, 10], rx: { homme: '43 kg', femme: '30 kg' }, scaled: { homme: '30 kg', femme: '20 kg' } },
  'Clean and jerk': { type: 'halterophilie', besoin: 'salle', niveau: 'intermediaire', reps: [5, 10], rx: { homme: '61 kg', femme: '43 kg' }, scaled: { homme: '40 kg', femme: '30 kg' } },
  'Push press': { type: 'halterophilie', besoin: 'salle', niveau: 'debutant', reps: [6, 12], rx: { homme: '52 kg', femme: '34 kg' }, scaled: { homme: '35 kg', femme: '25 kg' } },
  'Front squat': { type: 'halterophilie', besoin: 'salle', niveau: 'debutant', reps: [6, 12], rx: { homme: '61 kg', femme: '43 kg' }, scaled: { homme: '40 kg', femme: '30 kg' } },
  'Overhead squat': { type: 'halterophilie', besoin: 'salle', niveau: 'intermediaire', reps: [5, 10], rx: { homme: '43 kg', femme: '30 kg' }, scaled: { homme: '20 kg', femme: '15 kg' } },
  Deadlift: { type: 'halterophilie', besoin: 'salle', niveau: 'debutant', reps: [8, 15], rx: { homme: '102 kg', femme: '70 kg' }, scaled: { homme: '70 kg', femme: '50 kg' } },
  'Wall ball': { type: 'halterophilie', besoin: 'salle', niveau: 'debutant', reps: [12, 20], rx: { homme: '9 kg, cible 3 m', femme: '6 kg, cible 2,7 m' }, scaled: { homme: '6 kg', femme: '4 kg' } },
  // Haltères, kettlebell, petit matériel
  'Kettlebell swing': { type: 'halterophilie', besoin: 'halteres', niveau: 'debutant', reps: [12, 21], rx: { homme: '24 kg', femme: '16 kg' }, scaled: { homme: '16 kg', femme: '12 kg' } },
  'Dumbbell snatch': { type: 'halterophilie', besoin: 'halteres', niveau: 'debutant', reps: [8, 14], rx: { homme: '22,5 kg', femme: '15 kg' }, scaled: { homme: '15 kg', femme: '10 kg' } },
  'Dumbbell thruster': { type: 'halterophilie', besoin: 'halteres', niveau: 'debutant', reps: [8, 14], rx: { homme: '2 × 15 kg', femme: '2 × 10 kg' }, scaled: { homme: '2 × 10 kg', femme: '2 × 7,5 kg' } },
  'Goblet squat': { type: 'halterophilie', besoin: 'halteres', niveau: 'debutant', reps: [10, 20], rx: { homme: '24 kg', femme: '16 kg' }, scaled: { homme: '16 kg', femme: '12 kg' } },
  'Box jump': { type: 'gym', besoin: 'halteres', niveau: 'debutant', reps: [8, 15], rx: { homme: '60 cm', femme: '50 cm' }, scaled: 'Step-up sur la box' },
  'Pull-up': { type: 'gym', besoin: 'halteres', niveau: 'debutant', reps: [5, 15], scaled: 'Ring row (ou tractions avec élastique)' },
  'Toes-to-bar': { type: 'gym', besoin: 'halteres', niveau: 'intermediaire', reps: [8, 15], scaled: 'Hanging knee raise (genoux à la poitrine)' },
  'Double-under': { type: 'cardio', besoin: 'halteres', niveau: 'intermediaire', reps: [30, 60], scaled: 'Single-under (2 fois plus de reps)' },
  // Salle, niveau avancé
  Rowing: { type: 'cardio', besoin: 'salle', niveau: 'debutant', reps: [12, 20], unite: 'cal', scaled: '25 % de calories en moins' },
  'Chest-to-bar pull-up': { type: 'gym', besoin: 'salle', niveau: 'avance', reps: [5, 12], scaled: 'Pull-up' },
  'Muscle-up': { type: 'gym', besoin: 'salle', niveau: 'avance', reps: [3, 6], scaled: '2 Chest-to-bar pull-ups par muscle-up' },
  'Handstand push-up': { type: 'gym', besoin: 'poids_du_corps', niveau: 'avance', reps: [5, 10], scaled: 'Pike push-up' },
  // Poids du corps
  'Push-up': { type: 'gym', besoin: 'poids_du_corps', niveau: 'debutant', reps: [10, 20], scaled: 'Push-up sur les genoux' },
  'Air squat': { type: 'gym', besoin: 'poids_du_corps', niveau: 'debutant', reps: [15, 30], scaled: 'Squat sur une chaise' },
  Burpee: { type: 'gym', besoin: 'poids_du_corps', niveau: 'debutant', reps: [8, 15], scaled: 'Burpee sans saut ni pompe' },
  'Sit-up': { type: 'gym', besoin: 'poids_du_corps', niveau: 'debutant', reps: [15, 25], scaled: 'Crunch' },
  'Walking lunge': { type: 'gym', besoin: 'poids_du_corps', niveau: 'debutant', reps: [10, 20], scaled: 'Fentes sur place' },
  'Mountain climber': { type: 'gym', besoin: 'poids_du_corps', niveau: 'debutant', reps: [20, 40], scaled: 'Mountain climber lent' },
  Run: { type: 'cardio', besoin: 'poids_du_corps', niveau: 'debutant', reps: [200, 400], unite: 'm', scaled: '25 % de distance en moins' },
};

const RANG_MATERIEL: Record<Materiel, number> = { poids_du_corps: 0, halteres: 1, salle: 2 };
const RANG_NIVEAU: Record<Niveau, number> = { debutant: 0, intermediaire: 1, avance: 2 };

const disponible = (m: { besoin: Materiel; niveau?: Niveau }, profil: Profile) =>
  RANG_MATERIEL[m.besoin] <= RANG_MATERIEL[profil.materiel] && RANG_NIVEAU[m.niveau ?? 'debutant'] <= RANG_NIVEAU[profil.niveau];

function mouvementWod(nom: string, reps: string, sexe: Sexe, rx?: ParSexe): MouvementWod {
  const m = MOUVEMENTS[nom];
  const scaled = typeof m.scaled === 'string' ? m.scaled : m.scaled[sexe];
  const charge = rx ?? m.rx;
  return { nom, reps, rx: charge?.[sexe], scaled };
}

// ---------- Benchmarks ("les filles" du CrossFit et tests maison) ----------

type Benchmark = {
  nom: string;
  besoin: Materiel;
  niveau?: Niveau;
  format: FormatWod;
  duree: number;
  rounds?: number;
  description: string;
  mouvements: { nom: string; reps: string; rx?: ParSexe }[];
};

const BENCHMARKS: Benchmark[] = [
  {
    nom: 'Fran',
    besoin: 'salle',
    format: 'for_time',
    duree: 10,
    description: '21-15-9 reps de chaque mouvement, le plus vite possible.',
    mouvements: [
      { nom: 'Thruster', reps: '21-15-9' },
      { nom: 'Pull-up', reps: '21-15-9' },
    ],
  },
  {
    nom: 'Grace',
    besoin: 'salle',
    niveau: 'intermediaire',
    format: 'for_time',
    duree: 10,
    description: '30 Clean and jerk le plus vite possible.',
    mouvements: [{ nom: 'Clean and jerk', reps: '30' }],
  },
  {
    nom: 'Karen',
    besoin: 'salle',
    format: 'for_time',
    duree: 15,
    description: '150 Wall balls le plus vite possible.',
    mouvements: [{ nom: 'Wall ball', reps: '150' }],
  },
  {
    nom: 'Jackie',
    besoin: 'salle',
    format: 'for_time',
    duree: 20,
    description: 'Dans l’ordre, le plus vite possible.',
    mouvements: [
      { nom: 'Rowing', reps: '1000 m' },
      { nom: 'Thruster', reps: '50', rx: { homme: '20 kg', femme: '15 kg' } },
      { nom: 'Pull-up', reps: '30' },
    ],
  },
  {
    nom: 'Helen',
    besoin: 'halteres',
    format: 'for_time',
    duree: 15,
    rounds: 3,
    description: '3 rounds le plus vite possible.',
    mouvements: [
      { nom: 'Run', reps: '400 m' },
      { nom: 'Kettlebell swing', reps: '21' },
      { nom: 'Pull-up', reps: '12' },
    ],
  },
  {
    nom: 'Cindy',
    besoin: 'halteres',
    format: 'amrap',
    duree: 20,
    description: 'Un maximum de rounds en 20 minutes.',
    mouvements: [
      { nom: 'Pull-up', reps: '5' },
      { nom: 'Push-up', reps: '10' },
      { nom: 'Air squat', reps: '15' },
    ],
  },
  {
    nom: 'Annie',
    besoin: 'halteres',
    niveau: 'intermediaire',
    format: 'for_time',
    duree: 15,
    description: '50-40-30-20-10 reps de chaque mouvement.',
    mouvements: [
      { nom: 'Double-under', reps: '50-40-30-20-10' },
      { nom: 'Sit-up', reps: '50-40-30-20-10' },
    ],
  },
  {
    nom: 'Test Haltères',
    besoin: 'halteres',
    format: 'for_time',
    duree: 15,
    rounds: 5,
    description: '5 rounds le plus vite possible. Ton test de départ et de fin.',
    mouvements: [
      { nom: 'Kettlebell swing', reps: '15' },
      { nom: 'Goblet squat', reps: '15' },
      { nom: 'Burpee', reps: '10' },
    ],
  },
  {
    nom: 'Test Poids du corps',
    besoin: 'poids_du_corps',
    format: 'amrap',
    duree: 12,
    description: 'Un maximum de rounds en 12 minutes. Ton test de départ et de fin.',
    mouvements: [
      { nom: 'Burpee', reps: '10' },
      { nom: 'Air squat', reps: '15' },
      { nom: 'Sit-up', reps: '20' },
    ],
  },
];

// Le WOD test refait au début et à la fin du programme.
const TEST: Record<Materiel, string> = { salle: 'Fran', halteres: 'Test Haltères', poids_du_corps: 'Test Poids du corps' };

function wodBenchmark(b: Benchmark, sexe: Sexe): Wod {
  return {
    nom: b.nom,
    format: b.format,
    duree: b.duree,
    rounds: b.rounds,
    description: b.description,
    mouvements: b.mouvements.map((m) => mouvementWod(m.nom, m.reps, sexe, m.rx)),
    benchmark: true,
  };
}

// ---------- Bloc force ----------

const FORCE: Record<Materiel, { nom: string; charge: boolean }[]> = {
  salle: [
    { nom: 'Back squat', charge: true },
    { nom: 'Deadlift', charge: true },
    { nom: 'Strict press', charge: true },
    { nom: 'Front squat', charge: true },
    { nom: 'Power clean', charge: true },
  ],
  halteres: [
    { nom: 'Goblet squat', charge: true },
    { nom: 'Romanian deadlift haltères', charge: true },
    { nom: 'Développé épaules haltères', charge: true },
    { nom: 'Rowing haltère', charge: true },
  ],
  poids_du_corps: [
    { nom: 'Handstand hold', charge: false },
    { nom: 'Pistol squat', charge: false },
    { nom: 'Hollow hold', charge: false },
    { nom: 'Pompes diamant', charge: false },
  ],
};

function blocForce(profil: Profile, jour: number, semaine: number, total: number): BlocForce {
  const mvt = FORCE[profil.materiel][(jour - 1) % FORCE[profil.materiel].length];
  const phase = phaseSemaine(semaine, total);
  const position = (semaine - 1) % 4; // 0, 1, 2 dans un bloc, 3 = décharge
  const decharge = phase.theme === 'Décharge';
  const test = phase.theme === 'Test et pic';

  if (!mvt.charge) {
    const tenue = mvt.nom.includes('hold');
    const p = decharge ? 0 : position;
    return {
      mouvement: mvt.nom,
      series: decharge ? 3 : 4 + Math.min(p, 1),
      reps: tenue ? `${20 + p * 10} s` : mvt.nom === 'Pistol squat' ? '3-5 par jambe' : `${8 + p * 2}`,
      intensite: decharge ? 'Facile, technique' : 'Qualité avant quantité',
      charge: false,
    };
  }
  if (test) {
    return { mouvement: mvt.nom, series: 1, reps: '3RM', intensite: 'Monte par paliers jusqu’à ton max sur 3 reps', charge: true };
  }
  if (profil.materiel === 'halteres') {
    // Haltères : charges limitées, on progresse surtout en répétitions.
    return decharge
      ? { mouvement: mvt.nom, series: 3, reps: '10', intensite: 'RPE 6', charge: true }
      : { mouvement: mvt.nom, series: 4, reps: `${[8, 10, 12][position]}`, intensite: `RPE ${7 + Math.min(position, 1)}`, charge: true };
  }
  const cycle = [
    { series: 5, reps: '5', pct: 70 },
    { series: 5, reps: '4', pct: 75 },
    { series: 5, reps: '3', pct: 80 },
  ];
  if (decharge) return { mouvement: mvt.nom, series: 3, reps: '5', intensite: '60 % de ton max', charge: true };
  const c = cycle[position] ?? cycle[2];
  return { mouvement: mvt.nom, series: c.series, reps: c.reps, intensite: `${c.pct + Math.floor((semaine - 1) / 4) * 2} % de ton max`, charge: true };
}

// ---------- Générateur de WOD ----------

// Petit générateur de nombres aléatoires "reproductible" à partir d'une graine.
function aleatoire(graine: number) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Alea = () => number;

function choisir(alea: Alea, profil: Profile, types: Type[], deja: string[]): string {
  for (const type of types) {
    const options = Object.entries(MOUVEMENTS)
      .filter(([nom, m]) => m.type === type && disponible(m, profil) && !deja.includes(nom))
      .map(([nom]) => nom);
    if (options.length) return options[Math.floor(alea() * options.length)];
  }
  // Toujours au moins un mouvement au poids du corps de disponible.
  const secours = ['Burpee', 'Air squat', 'Push-up', 'Sit-up', 'Mountain climber'].filter((n) => !deja.includes(n));
  return secours[Math.floor(alea() * secours.length)];
}

function repsPour(nom: string, alea: Alea, facteur: number): string {
  const m = MOUVEMENTS[nom];
  const [min, max] = m.reps;
  const brut = (min + alea() * (max - min)) * facteur;
  if (m.unite === 'm') return `${Math.max(100, Math.round(brut / 100) * 100)} m`;
  const n = Math.max(1, Math.round(brut));
  return m.unite === 'cal' ? `${n} cal` : String(n);
}

function genererWod(format: FormatWod, profil: Profile, alea: Alea, facteur: number): Wod {
  const sexe = profil.sexe;
  const mvt = (nom: string, reps: string) => mouvementWod(nom, reps, sexe);

  if (format === 'for_time') {
    if (alea() < 0.45) {
      // Couplet : deux mouvements en 21-15-9 (ou 15-12-9 pour débuter)
      const a = choisir(alea, profil, ['halterophilie', 'gym'], []);
      const b = choisir(alea, profil, ['gym', 'cardio'], [a]);
      const schema = profil.niveau === 'debutant' || facteur < 0.9 ? '15-12-9' : '21-15-9';
      return {
        nom: `${FORMAT_LABELS[format]} ${schema}`,
        format,
        duree: profil.niveau === 'debutant' ? 12 : 10,
        description: `${schema} reps de chaque mouvement, le plus vite possible.`,
        mouvements: [mvt(a, schema), mvt(b, schema)],
      };
    }
    const a = choisir(alea, profil, ['cardio', 'gym'], []);
    const b = choisir(alea, profil, ['halterophilie', 'gym'], [a]);
    const c = choisir(alea, profil, ['gym'], [a, b]);
    const rounds = Math.max(3, Math.round((3 + alea() * 2) * facteur));
    return {
      nom: `${rounds} rounds For Time`,
      format,
      duree: Math.min(20, rounds * 3 + 3),
      rounds,
      description: `${rounds} rounds le plus vite possible.`,
      mouvements: [a, b, c].map((n) => mvt(n, repsPour(n, alea, 0.8 * facteur))),
    };
  }

  if (format === 'amrap') {
    const duree = Math.round((10 + Math.floor(alea() * 3) * 3) * facteur); // 10, 13 ou 16 min
    const a = choisir(alea, profil, ['halterophilie', 'gym'], []);
    const b = choisir(alea, profil, ['gym'], [a]);
    const c = choisir(alea, profil, ['cardio', 'gym'], [a, b]);
    return {
      nom: `AMRAP ${duree} min`,
      format,
      duree,
      description: `Un maximum de rounds en ${duree} minutes.`,
      mouvements: [a, b, c].map((n) => mvt(n, repsPour(n, alea, 0.7))),
    };
  }

  if (format === 'emom') {
    const nombre = alea() < 0.5 ? 2 : 3;
    const a = choisir(alea, profil, ['halterophilie', 'gym'], []);
    const b = choisir(alea, profil, ['gym'], [a]);
    const noms = nombre === 2 ? [a, b] : [a, b, choisir(alea, profil, ['cardio', 'gym'], [a, b])];
    const tours = Math.max(3, Math.round(((nombre === 2 ? 6 : 4) + Math.floor(alea() * 2)) * facteur));
    const duree = tours * nombre;
    return {
      nom: `EMOM ${duree} min`,
      format,
      duree,
      description: `Au début de chaque minute, pendant ${duree} minutes. Minute 1 : ${noms[0]}, minute 2 : ${noms[1]}${
        nombre === 3 ? `, minute 3 : ${noms[2]}` : ''
      }, puis on recommence.`,
      mouvements: noms.map((n) => mvt(n, repsPour(n, alea, 0.5))),
    };
  }

  // Tabata : 2 mouvements, 8 tours chacun
  const a = choisir(alea, profil, ['gym'], []);
  const b = choisir(alea, profil, ['cardio', 'gym'], [a, 'Run']); // pas de course en Tabata
  return {
    nom: 'Tabata',
    format: 'tabata',
    duree: 8,
    description: `4 minutes de ${a} puis 4 minutes de ${b} : 8 × (20 s d’effort / 10 s de repos) chacun. Score = total des reps.`,
    mouvements: [mvt(a, 'max'), mvt(b, 'max')],
  };
}

function echauffement(wod: Wod): string[] {
  const noms = wod.mouvements.map((m) => m.nom).filter((n) => MOUVEMENTS[n]?.type !== 'cardio');
  return [
    '3 min de cardio léger (rameur, corde ou footing)',
    'Mobilité : épaules, hanches, chevilles (5 min)',
    noms.length
      ? `2 tours très légers de 5 reps : ${noms.join(', ')}`
      : 'Quelques accélérations progressives',
  ];
}

const ROTATION: FormatWod[] = ['amrap', 'for_time', 'emom', 'for_time', 'amrap', 'tabata'];

export function genererProgrammeCF(profil: Profile, graine = Date.now()): ProgrammeCF {
  const alea = aleatoire(graine);
  const total = Math.max(1, profil.semaines);
  const jours = Math.min(5, Math.max(2, profil.joursParSemaine));
  const sexe = profil.sexe;
  const test = BENCHMARKS.find((b) => b.nom === TEST[profil.materiel])!;
  const autres = BENCHMARKS.filter((b) => b.nom !== test.nom && disponible(b, profil));
  const avecForce = profil.dureeSeance >= 45;
  const facteurNiveau = profil.niveau === 'debutant' ? 0.85 : profil.niveau === 'avance' ? 1.15 : 1;
  let indexBenchmark = 0;

  const semaines: SemaineCF[] = [];
  for (let numero = 1; numero <= total; numero++) {
    const phase = phaseSemaine(numero, total);
    const decharge = phase.theme === 'Décharge';
    const facteur = facteurNiveau * (decharge ? 0.75 : 1);
    const seances: SeanceCF[] = [];
    for (let jour = 1; jour <= jours; jour++) {
      let wod: Wod;
      if ((numero === 1 && jour === 1) || (numero === total && total > 1 && jour === jours)) {
        wod = wodBenchmark(test, sexe); // test de départ et de fin
      } else if (numero > 1 && numero % 2 === 1 && numero !== total && !decharge && jour === Math.min(2, jours) && autres.length) {
        wod = wodBenchmark(autres[indexBenchmark++ % autres.length], sexe); // un benchmark toutes les 2 semaines
      } else {
        wod = genererWod(ROTATION[(numero * jours + jour) % ROTATION.length], profil, alea, facteur);
      }
      seances.push({
        jour,
        nom: wod.benchmark ? `Benchmark : ${wod.nom}` : wod.nom,
        echauffement: echauffement(wod),
        force: avecForce ? blocForce(profil, jour, numero, total) : undefined,
        wod,
      });
    }
    semaines.push({ numero, theme: phase.theme, seances });
  }

  const niveau = { debutant: 'débutant', intermediaire: 'intermédiaire', avance: 'avancé' }[profil.niveau];
  return {
    id: `cf-${graine}`,
    titre: `CrossFit ${total} semaines`,
    description: `${jours} séances par semaine, niveau ${niveau}. Chaque séance : échauffement, ${
      avecForce ? 'bloc force, ' : ''
    }puis le WOD. Ton test « ${test.nom} » est refait à la fin pour mesurer tes progrès.`,
    createdAt: new Date().toISOString(),
    semaines,
  };
}

// ---------- Scores ----------

export const formatTemps = (secondes: number) =>
  `${Math.floor(secondes / 60)}:${String(Math.floor(secondes % 60)).padStart(2, '0')}`;

export function scoreTexte(wod: Wod, log: SeanceCFLog): string {
  if (wod.format === 'for_time') {
    if (log.cap) return `CAP + ${log.reps ?? 0} reps`;
    return log.temps != null ? formatTemps(log.temps) : '—';
  }
  if (wod.format === 'amrap') return `${log.rounds ?? 0} rounds + ${log.reps ?? 0} reps`;
  return `${log.reps ?? 0} reps`;
}

// Nombre où "plus grand = meilleur", pour comparer deux scores d'un même WOD.
// For Time : un temps fini bat toujours un score au cap.
export function scoreValeur(wod: Wod, log: SeanceCFLog): number {
  if (wod.format === 'for_time') return log.cap || log.temps == null ? (log.reps ?? 0) : 100000 - log.temps;
  if (wod.format === 'amrap') return (log.rounds ?? 0) * 1000 + (log.reps ?? 0);
  return log.reps ?? 0;
}

export const cleSeanceCF = (semaine: number, jour: number) => `${semaine}-${jour}`;

export type EssaiBenchmark = { semaine: number; jour: number; texte: string; valeur: number; rx: boolean; date?: string };

export function recordsCF(programme: ProgrammeCF, logs: Record<string, SeanceCFLog>) {
  const benchmarks = new Map<string, EssaiBenchmark[]>();
  const force = new Map<string, number[]>();
  let seancesFaites = 0;
  let minutes = 0;

  for (const semaine of programme.semaines) {
    for (const s of semaine.seances) {
      const log = logs[cleSeanceCF(semaine.numero, s.jour)];
      if (!log?.terminee) continue;
      seancesFaites++;
      minutes += 10 + (s.force ? 15 : 0) + (s.wod.format === 'for_time' && log.temps && !log.cap ? log.temps / 60 : s.wod.duree);
      if (s.wod.benchmark) {
        const essais = benchmarks.get(s.wod.nom) ?? [];
        essais.push({
          semaine: semaine.numero,
          jour: s.jour,
          texte: scoreTexte(s.wod, log),
          valeur: scoreValeur(s.wod, log),
          rx: log.rx,
          date: log.date,
        });
        benchmarks.set(s.wod.nom, essais);
      }
      if (s.force?.charge && log.chargeForce) {
        force.set(s.force.mouvement, [...(force.get(s.force.mouvement) ?? []), log.chargeForce]);
      }
    }
  }

  return {
    seancesFaites,
    seancesPrevues: programme.semaines.reduce((n, s) => n + s.seances.length, 0),
    minutes: Math.round(minutes),
    benchmarks: [...benchmarks.entries()].map(([nom, essais]) => ({
      nom,
      essais,
      // Un score RX passe devant un score Scaled.
      meilleur: [...essais].sort((a, b) => Number(b.rx) - Number(a.rx) || b.valeur - a.valeur)[0],
    })),
    force: [...force.entries()].map(([mouvement, charges]) => ({
      mouvement,
      premier: charges[0],
      dernier: charges[charges.length - 1],
      record: Math.max(...charges),
    })),
  };
}

// Calories d'une séance de CrossFit (effort intense : MET ≈ 8).
export const caloriesCF = (minutes: number, poids: number) => Math.round(8 * poids * (minutes / 60));
