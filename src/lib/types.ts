// Les "types" décrivent la forme des données. TypeScript vérifie
// qu'on ne se trompe pas de champ quand on les utilise.

export type Sexe = 'homme' | 'femme';
export type Niveau = 'debutant' | 'intermediaire' | 'avance';
export type Objectif = 'masse' | 'force' | 'seche' | 'forme';
export type Materiel = 'salle' | 'halteres' | 'poids_du_corps';

export type Profile = {
  prenom: string;
  sexe: Sexe;
  age: number;
  poids: number; // kg
  taille: number; // cm
  niveau: Niveau;
  objectif: Objectif;
  joursParSemaine: number; // 2 à 6
  dureeSeance: number; // minutes
  materiel: Materiel;
  semaines: number; // durée du programme
  notes: string; // blessures, préférences...
};

export type Exercise = {
  nom: string;
  series: number;
  reps: string; // ex : "8-10" ou "30 s"
  repos: number; // secondes
  intensite: string; // ex : "RPE 7" (effort ressenti sur 10)
  conseil?: string;
};

export type Session = {
  jour: number; // 1 = première séance de la semaine
  nom: string; // ex : "Haut du corps A"
  focus: string; // ex : "Pectoraux, dos, épaules"
  exercices: Exercise[];
};

export type Week = {
  numero: number;
  theme: string; // ex : "Accumulation" ou "Décharge"
  sessions: Session[];
};

export type Program = {
  id: string;
  titre: string;
  description: string;
  createdAt: string;
  source: 'ia' | 'local' | 'perso';
  semaines: Week[];
};

export const NIVEAU_LABELS: Record<Niveau, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export const OBJECTIF_LABELS: Record<Objectif, string> = {
  masse: 'Prise de masse',
  force: 'Force',
  seche: 'Sèche',
  forme: 'Remise en forme',
};

export const MATERIEL_LABELS: Record<Materiel, string> = {
  salle: 'Salle complète',
  halteres: 'Haltères',
  poids_du_corps: 'Poids du corps',
};

export const DEFAULT_PROFILE: Profile = {
  prenom: '',
  sexe: 'homme',
  age: 30,
  poids: 75,
  taille: 178,
  niveau: 'intermediaire',
  objectif: 'masse',
  joursParSemaine: 4,
  dureeSeance: 60,
  materiel: 'salle',
  semaines: 8,
  notes: '',
};

// Ce que l'IA renvoie : une semaine type + une règle de progression par semaine.
// L'app "déroule" ensuite ce plan sur toutes les semaines (voir developperPlan).
// C'est plus rapide et moins cher que de faire écrire chaque semaine à l'IA.
export type AiPlan = {
  titre: string;
  description: string;
  seances: Session[];
  progression: { numero: number; theme: string; rpe: number; deltaSeries: number }[];
};

// ---------- Suivi : ce que tu remplis pendant les séances ----------

export type SerieLog = {
  poids: number | null; // kg (lest ajouté pour les exercices au poids du corps)
  reps: number | null;
  fait: boolean;
};

export type SeanceLog = {
  debut?: string; // date ISO de la première série validée
  derniereActivite?: string; // date ISO de la dernière série validée
  terminee: boolean;
  series: Record<number, SerieLog[]>; // index de l'exercice -> ses séries
};

// Clé d'une séance dans le programme : "semaine-jour", ex : "3-2".
export const cleSeance = (semaine: number, jour: number) => `${semaine}-${jour}`;

// ---------- Mesures du corps ----------

export type Mensuration =
  | 'poids'
  | 'masseGrasse'
  | 'cou'
  | 'epaules'
  | 'poitrine'
  | 'bras'
  | 'avantBras'
  | 'taille'
  | 'hanches'
  | 'cuisse'
  | 'mollet';

export const MENSURATIONS: { cle: Mensuration; label: string; unite: string; objectifBaisse?: boolean }[] = [
  { cle: 'poids', label: 'Poids', unite: 'kg' },
  { cle: 'masseGrasse', label: 'Masse grasse', unite: '%', objectifBaisse: true },
  { cle: 'cou', label: 'Cou', unite: 'cm' },
  { cle: 'epaules', label: 'Épaules', unite: 'cm' },
  { cle: 'poitrine', label: 'Poitrine', unite: 'cm' },
  { cle: 'bras', label: 'Bras (biceps contracté)', unite: 'cm' },
  { cle: 'avantBras', label: 'Avant-bras', unite: 'cm' },
  { cle: 'taille', label: 'Tour de taille', unite: 'cm', objectifBaisse: true },
  { cle: 'hanches', label: 'Hanches', unite: 'cm' },
  { cle: 'cuisse', label: 'Cuisse', unite: 'cm' },
  { cle: 'mollet', label: 'Mollet', unite: 'cm' },
];

export type Mesure = {
  id: string;
  date: string; // ISO
  valeurs: Partial<Record<Mensuration, number>>;
};

// Brouillon d'un programme créé ou modifié à la main : une semaine type
// qui est ensuite déroulée sur toutes les semaines.
export type ModeleProgramme = {
  titre: string;
  semaines: number;
  // auto : intensité qui monte + décharge toutes les 4 semaines ; fixe : identique chaque semaine
  progression: 'auto' | 'fixe';
  seances: Session[];
};
