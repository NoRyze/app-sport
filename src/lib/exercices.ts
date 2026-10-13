// Fiches exercices : matériel, muscles, bonne position et images.
// Les images viennent de "Free Exercise DB" (domaine public) :
// https://github.com/yuhonas/free-exercise-db
// Chaque exercice a 2 images : position de départ et position d'arrivée.

export const GROUPES = ['Jambes', 'Pectoraux, épaules, triceps', 'Dos, biceps', 'Abdos, gainage', 'CrossFit'] as const;
export type Groupe = (typeof GROUPES)[number];

export type FicheExercice = {
  groupe: Groupe;
  image?: string; // identifiant dans Free Exercise DB
  materiel: string;
  muscles: string;
  position: string[];
  // Part du poids du corps soulevée (ex : 0.65 pour les pompes).
  // Sert au calcul du tonnage quand l'exercice se fait au poids du corps.
  poidsDuCorps?: number;
};

const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export function imagesExercice(fiche: FicheExercice): string[] {
  if (!fiche.image) return [];
  return [`${IMG_BASE}/${fiche.image}/0.jpg`, `${IMG_BASE}/${fiche.image}/1.jpg`];
}

export const FICHES: Record<string, FicheExercice> = {
  // ---------- Jambes ----------
  'Squat barre': {
    groupe: 'Jambes',
    image: 'Barbell_Squat',
    materiel: 'Barre olympique sur rack à squat',
    muscles: 'Quadriceps, fessiers, lombaires',
    position: [
      'Barre posée sur le haut du dos (trapèzes), pas sur la nuque.',
      'Pieds largeur d’épaules, pointes légèrement ouvertes.',
      'Descends en poussant les fesses en arrière, genoux dans l’axe des pieds.',
      'Dos droit, regard devant, remonte en poussant dans les talons.',
    ],
  },
  'Presse à cuisses': {
    groupe: 'Jambes',
    image: 'Leg_Press',
    materiel: 'Machine presse à cuisses (inclinée à 45°)',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Dos et bassin bien collés au dossier.',
      'Pieds au milieu de la plateforme, largeur de hanches.',
      'Descends jusqu’à environ 90° aux genoux sans décoller le bassin.',
      'Ne verrouille pas complètement les genoux en haut.',
    ],
  },
  'Hack squat': {
    groupe: 'Jambes',
    image: 'Hack_Squat',
    materiel: 'Machine hack squat',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Épaules sous les coussins, dos plaqué contre le dossier.',
      'Pieds au milieu de la plateforme, largeur d’épaules.',
      'Descends lentement jusqu’à 90° ou plus si ta mobilité le permet.',
      'Remonte en poussant sur tout le pied.',
    ],
  },
  'Goblet squat': {
    groupe: 'Jambes',
    image: 'Goblet_Squat',
    materiel: 'Un haltère ou un kettlebell',
    muscles: 'Quadriceps, fessiers, gainage',
    position: [
      'Tiens l’haltère verticalement contre ta poitrine, coudes vers le bas.',
      'Pieds un peu plus larges que les épaules.',
      'Descends entre tes jambes en gardant le buste bien droit.',
      'Coudes à l’intérieur des genoux en bas du mouvement.',
    ],
  },
  'Squat haltères': {
    groupe: 'Jambes',
    image: 'Dumbbell_Squat',
    materiel: 'Deux haltères',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Un haltère dans chaque main, bras tendus le long du corps.',
      'Pieds largeur d’épaules.',
      'Descends en gardant le dos droit et les talons au sol.',
      'Remonte en expirant.',
    ],
  },
  'Squat poids du corps': {
    groupe: 'Jambes',
    image: 'Bodyweight_Squat',
    materiel: 'Aucun',
    muscles: 'Quadriceps, fessiers',
    poidsDuCorps: 0.7,
    position: [
      'Pieds largeur d’épaules, bras tendus devant toi pour l’équilibre.',
      'Descends comme pour t’asseoir sur une chaise.',
      'Genoux dans l’axe des pieds, talons au sol.',
      'Remonte en serrant les fessiers.',
    ],
  },
  'Squat sauté': {
    groupe: 'Jambes',
    image: 'Freehand_Jump_Squat',
    materiel: 'Aucun',
    muscles: 'Quadriceps, fessiers, explosivité',
    poidsDuCorps: 0.7,
    position: [
      'Descends en squat, bras en arrière.',
      'Saute le plus haut possible en lançant les bras.',
      'Atterris souplement sur l’avant du pied, genoux fléchis.',
      'Enchaîne directement la répétition suivante.',
    ],
  },
  'Romanian deadlift': {
    groupe: 'Jambes',
    image: 'Romanian_Deadlift',
    materiel: 'Barre olympique',
    muscles: 'Ischio-jambiers, fessiers, lombaires',
    position: [
      'Debout, barre en mains, jambes presque tendues (genoux légèrement fléchis).',
      'Pousse les fesses en arrière et laisse la barre glisser le long des cuisses.',
      'Dos parfaitement droit, descends jusqu’à sentir l’étirement derrière les cuisses.',
      'Remonte en poussant les hanches vers l’avant.',
    ],
  },
  'Deadlift': {
    groupe: 'Jambes',
    image: 'Barbell_Deadlift',
    materiel: 'Barre olympique posée au sol',
    muscles: 'Chaîne arrière complète, dos, fessiers',
    position: [
      'Barre au-dessus du milieu des pieds, tibias proches de la barre.',
      'Dos droit, poitrine sortie, bras tendus.',
      'Pousse dans le sol avec les jambes, la barre reste collée au corps.',
      'Finis debout, hanches en avant, sans te cambrer.',
    ],
  },
  'Leg curl': {
    groupe: 'Jambes',
    image: 'Lying_Leg_Curls',
    materiel: 'Machine leg curl (allongé ou assis)',
    muscles: 'Ischio-jambiers',
    position: [
      'Le boudin se place juste au-dessus des talons.',
      'Genoux alignés avec l’axe de rotation de la machine.',
      'Ramène les talons vers les fesses en contrôlant.',
      'Redescends lentement, sans laisser tomber la charge.',
    ],
  },
  'Romanian deadlift haltères': {
    groupe: 'Jambes',
    image: 'Romanian_Deadlift',
    materiel: 'Deux haltères',
    muscles: 'Ischio-jambiers, fessiers',
    position: [
      'Un haltère dans chaque main devant les cuisses.',
      'Pousse les fesses en arrière, genoux légèrement fléchis.',
      'Dos droit, haltères proches des jambes.',
      'Remonte en serrant les fessiers.',
    ],
  },
  'Hip thrust haltère': {
    groupe: 'Jambes',
    image: 'Barbell_Hip_Thrust',
    materiel: 'Un banc et un haltère (ou une barre)',
    muscles: 'Fessiers, ischio-jambiers',
    position: [
      'Haut du dos appuyé sur le bord du banc, charge sur les hanches.',
      'Pieds à plat, largeur de hanches, genoux à 90° en haut.',
      'Monte les hanches jusqu’à aligner épaules, hanches et genoux.',
      'Serre fort les fessiers 1 seconde en haut.',
    ],
  },
  'Hip thrust au sol': {
    groupe: 'Jambes',
    image: 'Butt_Lift_Bridge',
    materiel: 'Aucun (un tapis)',
    muscles: 'Fessiers',
    poidsDuCorps: 0.5,
    position: [
      'Allongé sur le dos, genoux fléchis, pieds à plat.',
      'Pousse dans les talons pour monter les hanches.',
      'Serre les fessiers en haut, sans cambrer le bas du dos.',
      'Redescends lentement.',
    ],
  },
  'Good morning poids du corps': {
    groupe: 'Jambes',
    image: 'Good_Morning',
    materiel: 'Aucun (mains derrière la tête)',
    muscles: 'Ischio-jambiers, lombaires',
    poidsDuCorps: 0.4,
    position: [
      'Debout, mains derrière la tête, genoux légèrement fléchis.',
      'Penche le buste en avant en poussant les fesses en arrière.',
      'Dos bien droit tout le long.',
      'Remonte en contractant fessiers et ischios.',
    ],
  },
  'Fentes bulgares': {
    groupe: 'Jambes',
    image: 'Split_Squats',
    materiel: 'Un banc (+ barre ou haltères pour charger)',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Pied arrière posé sur le banc, pied avant un grand pas devant.',
      'Descends verticalement, le genou arrière vers le sol.',
      'Genou avant dans l’axe du pied, buste légèrement penché.',
      'Remonte en poussant dans le talon avant.',
    ],
  },
  'Fentes marchées': {
    groupe: 'Jambes',
    image: 'Barbell_Walking_Lunge',
    materiel: 'Barre ou haltères',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Fais un grand pas en avant.',
      'Descends jusqu’à ce que le genou arrière frôle le sol.',
      'Buste droit, genou avant au-dessus de la cheville.',
      'Enchaîne avec l’autre jambe en avançant.',
    ],
  },
  'Fentes bulgares haltères': {
    groupe: 'Jambes',
    image: 'Split_Squat_with_Dumbbells',
    materiel: 'Un banc et deux haltères',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Un haltère dans chaque main, pied arrière sur le banc.',
      'Descends verticalement en gardant le buste droit.',
      'Genou avant dans l’axe du pied.',
      'Remonte en poussant dans le talon avant.',
    ],
  },
  'Fentes arrière haltères': {
    groupe: 'Jambes',
    image: 'Dumbbell_Rear_Lunge',
    materiel: 'Deux haltères',
    muscles: 'Quadriceps, fessiers',
    position: [
      'Debout, un haltère dans chaque main.',
      'Fais un grand pas en arrière et descends.',
      'Genou arrière près du sol, buste droit.',
      'Reviens en poussant dans le talon avant.',
    ],
  },
  'Fentes arrière': {
    groupe: 'Jambes',
    image: 'Crossover_Reverse_Lunge',
    materiel: 'Aucun',
    muscles: 'Quadriceps, fessiers',
    poidsDuCorps: 0.7,
    position: [
      'Debout, mains sur les hanches.',
      'Recule une jambe et descends jusqu’à frôler le sol avec le genou.',
      'Buste droit, genou avant au-dessus de la cheville.',
      'Reviens et change de jambe.',
    ],
  },
  'Step-up sur banc': {
    groupe: 'Jambes',
    image: 'Dumbbell_Step_Ups',
    materiel: 'Un banc ou une marche solide',
    muscles: 'Quadriceps, fessiers',
    poidsDuCorps: 0.7,
    position: [
      'Pose un pied entier sur le banc.',
      'Monte en poussant uniquement avec la jambe du dessus.',
      'Tiens-toi droit en haut.',
      'Redescends en contrôlant.',
    ],
  },
  'Mollets debout machine': {
    groupe: 'Jambes',
    image: 'Standing_Calf_Raises',
    materiel: 'Machine à mollets debout',
    muscles: 'Mollets',
    position: [
      'Épaules sous les coussins, avant du pied sur la marche.',
      'Descends les talons le plus bas possible.',
      'Monte sur la pointe des pieds au maximum.',
      'Marque une pause de 1 seconde en haut.',
    ],
  },
  'Mollets à la presse': {
    groupe: 'Jambes',
    image: 'Calf_Press_On_The_Leg_Press_Machine',
    materiel: 'Machine presse à cuisses',
    muscles: 'Mollets',
    position: [
      'Avant des pieds en bas de la plateforme, jambes tendues.',
      'Pousse avec la pointe des pieds.',
      'Reviens en étirant bien les mollets.',
      'Garde les genoux tendus mais pas verrouillés.',
    ],
  },
  'Mollets debout haltères': {
    groupe: 'Jambes',
    image: 'Calf_Raise_On_A_Dumbbell',
    materiel: 'Haltères et une marche',
    muscles: 'Mollets',
    position: [
      'Avant du pied sur une marche, haltère en main.',
      'Descends le talon sous le niveau de la marche.',
      'Monte sur la pointe au maximum.',
      'Mouvement lent et contrôlé.',
    ],
  },
  'Mollets sur une marche': {
    groupe: 'Jambes',
    image: 'Standing_Calf_Raises',
    materiel: 'Une marche',
    muscles: 'Mollets',
    poidsDuCorps: 1,
    position: [
      'Avant des pieds sur la marche, tiens-toi au mur.',
      'Descends les talons au maximum.',
      'Monte sur la pointe des pieds.',
      'Pause 1 seconde en haut.',
    ],
  },

  // ---------- Pectoraux / épaules / triceps ----------
  'Développé couché': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Barbell_Bench_Press_-_Medium_Grip',
    materiel: 'Banc plat et barre olympique',
    muscles: 'Pectoraux, triceps, épaules',
    position: [
      'Allongé, yeux sous la barre, pieds bien à plat au sol.',
      'Mains un peu plus larges que les épaules, omoplates serrées.',
      'Descends la barre au bas des pectoraux, coudes à 45° du corps.',
      'Pousse la barre vers le haut sans décoller les fesses.',
    ],
  },
  'Développé incliné haltères': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Incline_Dumbbell_Press',
    materiel: 'Banc incliné (30 à 45°) et deux haltères',
    muscles: 'Haut des pectoraux, épaules',
    position: [
      'Banc incliné à 30-45°, haltères à hauteur de poitrine.',
      'Omoplates serrées, pieds au sol.',
      'Pousse les haltères vers le haut en les rapprochant.',
      'Redescends lentement jusqu’à l’étirement des pectoraux.',
    ],
  },
  Dips: {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Dips_-_Chest_Version',
    materiel: 'Barres parallèles',
    muscles: 'Pectoraux, triceps',
    poidsDuCorps: 0.9,
    position: [
      'Bras tendus sur les barres, buste légèrement penché en avant.',
      'Descends jusqu’à ce que les épaules soient au niveau des coudes.',
      'Coudes vers l’arrière, pas écartés.',
      'Remonte en poussant fort.',
    ],
  },
  'Développé couché haltères': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Dumbbell_Bench_Press',
    materiel: 'Banc plat et deux haltères',
    muscles: 'Pectoraux, triceps',
    position: [
      'Allongé, haltères au-dessus de la poitrine.',
      'Descends les haltères sur les côtés, coudes à 45°.',
      'Va jusqu’à l’étirement des pectoraux.',
      'Remonte en rapprochant les haltères.',
    ],
  },
  Pompes: {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Pushups',
    materiel: 'Aucun',
    muscles: 'Pectoraux, triceps, gainage',
    poidsDuCorps: 0.65,
    position: [
      'Mains un peu plus larges que les épaules.',
      'Corps gainé, aligné de la tête aux talons.',
      'Descends la poitrine près du sol, coudes à 45°.',
      'Remonte en poussant le sol.',
    ],
  },
  'Pompes pieds surélevés': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Push-Ups_With_Feet_Elevated',
    materiel: 'Un banc ou une chaise',
    muscles: 'Haut des pectoraux, épaules',
    poidsDuCorps: 0.75,
    position: [
      'Pieds posés sur le banc, mains au sol.',
      'Corps bien aligné, fessiers serrés.',
      'Descends la poitrine vers le sol.',
      'Remonte sans casser l’alignement.',
    ],
  },
  'Développé militaire': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Standing_Military_Press',
    materiel: 'Barre olympique (debout)',
    muscles: 'Épaules, triceps',
    position: [
      'Debout, barre sur le haut de la poitrine, mains largeur d’épaules.',
      'Serre les fessiers et les abdos pour ne pas te cambrer.',
      'Pousse la barre au-dessus de la tête, tête légèrement en arrière.',
      'Redescends la barre contrôlée jusqu’à la poitrine.',
    ],
  },
  'Développé épaules haltères': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Dumbbell_Shoulder_Press',
    materiel: 'Deux haltères (+ banc à dossier droit)',
    muscles: 'Épaules, triceps',
    position: [
      'Assis, dos contre le dossier, haltères à hauteur d’oreilles.',
      'Pousse les haltères au-dessus de la tête.',
      'Ne cambre pas le bas du dos.',
      'Redescends jusqu’à hauteur d’oreilles.',
    ],
  },
  'Arnold press': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Arnold_Dumbbell_Press',
    materiel: 'Deux haltères',
    muscles: 'Épaules (les 3 faisceaux)',
    position: [
      'Départ haltères devant le visage, paumes vers toi.',
      'Pousse en tournant les paumes vers l’avant.',
      'Bras tendus au-dessus de la tête.',
      'Redescends en refaisant la rotation inverse.',
    ],
  },
  'Pompes piquées': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Handstand_Push-Ups',
    materiel: 'Aucun',
    muscles: 'Épaules, triceps',
    poidsDuCorps: 0.7,
    position: [
      'Position en V inversé : fesses en l’air, mains et pieds au sol.',
      'Descends la tête vers le sol entre tes mains.',
      'Coudes vers l’arrière.',
      'Remonte en poussant.',
    ],
  },
  'Pompes pike surélevées': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Handstand_Push-Ups',
    materiel: 'Un banc',
    muscles: 'Épaules, triceps',
    poidsDuCorps: 0.8,
    position: [
      'Pieds sur le banc, fesses hautes, buste vertical.',
      'Descends la tête vers le sol.',
      'Garde les coudes proches du corps.',
      'Remonte en poussant fort.',
    ],
  },
  'Élévations latérales': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Side_Lateral_Raise',
    materiel: 'Deux haltères légers',
    muscles: 'Épaules (faisceau latéral)',
    position: [
      'Debout, haltères le long du corps, coudes légèrement fléchis.',
      'Monte les bras sur les côtés jusqu’à hauteur d’épaules.',
      'Les coudes mènent le mouvement, pas les mains.',
      'Redescends lentement.',
    ],
  },
  'Élévations latérales haltères': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Side_Lateral_Raise',
    materiel: 'Deux haltères légers',
    muscles: 'Épaules (faisceau latéral)',
    position: [
      'Debout, haltères le long du corps, coudes légèrement fléchis.',
      'Monte les bras sur les côtés jusqu’à hauteur d’épaules.',
      'Ne hausse pas les épaules.',
      'Redescends lentement.',
    ],
  },
  'Face pull poulie': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Face_Pull',
    materiel: 'Poulie haute avec corde',
    muscles: 'Arrière d’épaules, haut du dos',
    position: [
      'Poulie à hauteur du visage, corde prise à deux mains.',
      'Tire la corde vers ton front en écartant les mains.',
      'Coudes hauts, serre les omoplates.',
      'Reviens lentement.',
    ],
  },
  'Oiseau haltères': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Reverse_Flyes',
    materiel: 'Deux haltères légers',
    muscles: 'Arrière d’épaules',
    position: [
      'Buste penché en avant, dos droit, haltères sous la poitrine.',
      'Écarte les bras sur les côtés, coudes légèrement fléchis.',
      'Serre les omoplates en haut.',
      'Redescends sans élan.',
    ],
  },
  'Extension triceps poulie': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Triceps_Pushdown',
    materiel: 'Poulie haute avec barre ou corde',
    muscles: 'Triceps',
    position: [
      'Debout face à la poulie, coudes collés au corps.',
      'Pousse vers le bas jusqu’à bras tendus.',
      'Seuls les avant-bras bougent.',
      'Remonte lentement jusqu’à 90°.',
    ],
  },
  'Barre au front': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'EZ-Bar_Skullcrusher',
    materiel: 'Banc plat et barre EZ',
    muscles: 'Triceps',
    position: [
      'Allongé, barre tenue bras tendus au-dessus de la poitrine.',
      'Plie les coudes pour descendre la barre vers le front.',
      'Les coudes restent fixes et pointés vers le plafond.',
      'Tends les bras pour remonter.',
    ],
  },
  'Extension nuque haltère': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Dumbbell_One-Arm_Triceps_Extension',
    materiel: 'Un haltère',
    muscles: 'Triceps',
    position: [
      'Assis ou debout, haltère tenu à deux mains au-dessus de la tête.',
      'Descends l’haltère derrière la nuque en pliant les coudes.',
      'Coudes serrés, pointés vers le haut.',
      'Tends les bras pour remonter.',
    ],
  },
  'Kickback haltère': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Tricep_Dumbbell_Kickback',
    materiel: 'Un haltère et un banc',
    muscles: 'Triceps',
    position: [
      'Une main et un genou sur le banc, dos plat.',
      'Coude collé au corps, bras parallèle au sol.',
      'Tends l’avant-bras vers l’arrière.',
      'Reviens lentement à 90°.',
    ],
  },
  'Pompes diamant': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Push-Ups_-_Close_Triceps_Position',
    materiel: 'Aucun',
    muscles: 'Triceps, pectoraux',
    poidsDuCorps: 0.65,
    position: [
      'Mains rapprochées sous la poitrine, pouces et index qui se touchent.',
      'Corps gainé et aligné.',
      'Descends en gardant les coudes près du corps.',
      'Remonte en poussant.',
    ],
  },
  'Dips sur banc': {
    groupe: 'Pectoraux, épaules, triceps',
    image: 'Bench_Dips',
    materiel: 'Un banc ou une chaise',
    muscles: 'Triceps',
    poidsDuCorps: 0.6,
    position: [
      'Mains sur le bord du banc derrière toi, jambes tendues devant.',
      'Descends en pliant les coudes jusqu’à 90°.',
      'Garde le dos près du banc.',
      'Remonte en tendant les bras.',
    ],
  },

  // ---------- Dos / biceps ----------
  'Rowing barre': {
    groupe: 'Dos, biceps',
    image: 'Bent_Over_Barbell_Row',
    materiel: 'Barre olympique',
    muscles: 'Dos (grand dorsal, trapèzes), biceps',
    position: [
      'Buste penché à environ 45°, dos droit, genoux fléchis.',
      'Barre tenue bras tendus, mains largeur d’épaules.',
      'Tire la barre vers le nombril en serrant les omoplates.',
      'Redescends sans arrondir le dos.',
    ],
  },
  'Tirage horizontal poulie': {
    groupe: 'Dos, biceps',
    image: 'Seated_Cable_Rows',
    materiel: 'Poulie basse avec poignée triangle',
    muscles: 'Dos, biceps',
    position: [
      'Assis, pieds sur les cales, genoux légèrement fléchis.',
      'Buste droit, tire la poignée vers le ventre.',
      'Serre les omoplates en fin de mouvement.',
      'Reviens en étirant le dos sans t’arrondir.',
    ],
  },
  'Rowing haltère': {
    groupe: 'Dos, biceps',
    image: 'One-Arm_Dumbbell_Row',
    materiel: 'Un haltère et un banc',
    muscles: 'Dos, biceps',
    position: [
      'Une main et un genou sur le banc, dos plat.',
      'Tire l’haltère vers la hanche, coude près du corps.',
      'Serre l’omoplate en haut.',
      'Redescends bras tendu.',
    ],
  },
  'Rowing haltère un bras': {
    groupe: 'Dos, biceps',
    image: 'One-Arm_Dumbbell_Row',
    materiel: 'Un haltère et un banc',
    muscles: 'Dos, biceps',
    position: [
      'Une main et un genou sur le banc, dos plat.',
      'Tire l’haltère vers la hanche, coude près du corps.',
      'Serre l’omoplate en haut.',
      'Redescends bras tendu.',
    ],
  },
  'Rowing haltères buste penché': {
    groupe: 'Dos, biceps',
    image: 'Bent_Over_Two-Dumbbell_Row',
    materiel: 'Deux haltères',
    muscles: 'Dos, biceps',
    position: [
      'Buste penché à 45°, dos droit, un haltère dans chaque main.',
      'Tire les haltères vers les hanches.',
      'Serre les omoplates.',
      'Redescends en contrôlant.',
    ],
  },
  'Rowing inversé sous une table': {
    groupe: 'Dos, biceps',
    image: 'Inverted_Row',
    materiel: 'Une table solide ou une barre basse',
    muscles: 'Dos, biceps',
    poidsDuCorps: 0.6,
    position: [
      'Allongé sous la table, mains sur le bord, corps tendu.',
      'Tire ta poitrine vers la table.',
      'Garde le corps gainé comme une planche.',
      'Redescends bras tendus.',
    ],
  },
  'Superman rowing': {
    groupe: 'Dos, biceps',
    image: 'Superman',
    materiel: 'Aucun (un tapis)',
    muscles: 'Lombaires, haut du dos',
    position: [
      'Allongé sur le ventre, bras tendus devant.',
      'Décolle bras et jambes du sol.',
      'Ramène les coudes vers les côtes en serrant les omoplates.',
      'Retends les bras et repose doucement.',
    ],
  },
  Tractions: {
    groupe: 'Dos, biceps',
    image: 'Pullups',
    materiel: 'Barre de traction',
    muscles: 'Grand dorsal, biceps',
    poidsDuCorps: 1,
    position: [
      'Mains en pronation, un peu plus larges que les épaules.',
      'Pars bras tendus, épaules engagées (pas relâchées).',
      'Tire jusqu’à passer le menton au-dessus de la barre.',
      'Redescends lentement jusqu’en bas.',
    ],
  },
  'Tirage vertical poulie': {
    groupe: 'Dos, biceps',
    image: 'Wide-Grip_Lat_Pulldown',
    materiel: 'Machine tirage vertical (poulie haute)',
    muscles: 'Grand dorsal, biceps',
    position: [
      'Assis, cuisses bloquées sous les boudins.',
      'Barre prise large, buste légèrement en arrière.',
      'Tire la barre vers le haut de la poitrine.',
      'Remonte bras tendus en contrôlant.',
    ],
  },
  'Pull-over haltère': {
    groupe: 'Dos, biceps',
    image: 'Bent-Arm_Dumbbell_Pullover',
    materiel: 'Un haltère et un banc',
    muscles: 'Grand dorsal, pectoraux',
    position: [
      'Allongé sur le banc, haltère tenu à deux mains au-dessus de la poitrine.',
      'Descends l’haltère derrière la tête, coudes légèrement fléchis.',
      'Va jusqu’à l’étirement sans douleur.',
      'Ramène l’haltère au-dessus de la poitrine.',
    ],
  },
  'Rowing haltère prise haute': {
    groupe: 'Dos, biceps',
    image: 'One-Arm_Dumbbell_Row',
    materiel: 'Un haltère et un banc',
    muscles: 'Haut du dos, arrière d’épaules',
    position: [
      'Une main et un genou sur le banc.',
      'Tire l’haltère en écartant le coude du corps.',
      'Monte jusqu’à hauteur de poitrine.',
      'Redescends lentement.',
    ],
  },
  'Tractions négatives': {
    groupe: 'Dos, biceps',
    image: 'Pullups',
    materiel: 'Barre de traction (+ une chaise)',
    muscles: 'Grand dorsal, biceps',
    poidsDuCorps: 1,
    position: [
      'Monte en haut de la barre en t’aidant d’une chaise.',
      'Menton au-dessus de la barre.',
      'Descends le plus lentement possible (3 à 5 secondes).',
      'Remonte avec la chaise et recommence.',
    ],
  },
  'Curl barre EZ': {
    groupe: 'Dos, biceps',
    image: 'Close-Grip_EZ_Bar_Curl',
    materiel: 'Barre EZ (barre ondulée)',
    muscles: 'Biceps',
    position: [
      'Debout, barre en supination, coudes collés au corps.',
      'Monte la barre en pliant les coudes.',
      'Pas d’élan avec le dos.',
      'Redescends lentement bras tendus.',
    ],
  },
  'Curl poulie': {
    groupe: 'Dos, biceps',
    image: 'Standing_Biceps_Cable_Curl',
    materiel: 'Poulie basse avec barre droite',
    muscles: 'Biceps',
    position: [
      'Face à la poulie, coudes collés au corps.',
      'Monte la barre vers les épaules.',
      'Serre les biceps en haut.',
      'Redescends lentement.',
    ],
  },
  'Curl haltères': {
    groupe: 'Dos, biceps',
    image: 'Dumbbell_Bicep_Curl',
    materiel: 'Deux haltères',
    muscles: 'Biceps',
    position: [
      'Debout, haltères le long du corps, paumes vers l’avant.',
      'Monte les haltères en gardant les coudes fixes.',
      'Serre en haut.',
      'Redescends lentement.',
    ],
  },
  'Curl marteau': {
    groupe: 'Dos, biceps',
    image: 'Hammer_Curls',
    materiel: 'Deux haltères',
    muscles: 'Biceps, avant-bras',
    position: [
      'Haltères tenus comme des marteaux (paumes face à face).',
      'Monte les haltères sans bouger les coudes.',
      'Pas d’élan.',
      'Redescends en contrôlant.',
    ],
  },
  'Tractions supination': {
    groupe: 'Dos, biceps',
    image: 'Chin-Up',
    materiel: 'Barre de traction',
    muscles: 'Biceps, grand dorsal',
    poidsDuCorps: 1,
    position: [
      'Mains en supination (paumes vers toi), largeur d’épaules.',
      'Tire jusqu’à passer le menton au-dessus de la barre.',
      'Garde le corps gainé.',
      'Redescends lentement.',
    ],
  },
  'Curl serviette isométrique': {
    groupe: 'Dos, biceps',
    materiel: 'Une serviette',
    muscles: 'Biceps',
    position: [
      'Passe la serviette sous un pied, tiens les deux bouts.',
      'Tire vers le haut comme pour un curl, en résistant avec le pied.',
      'Maintiens la tension pendant toute la durée.',
      'Respire normalement.',
    ],
  },

  // ---------- Gainage ----------
  'Relevés de jambes suspendu': {
    groupe: 'Abdos, gainage',
    image: 'Hanging_Leg_Raise',
    materiel: 'Barre de traction',
    muscles: 'Abdominaux',
    position: [
      'Suspendu à la barre, bras tendus.',
      'Monte les jambes (tendues ou genoux pliés) jusqu’à l’horizontale.',
      'Évite de te balancer.',
      'Redescends lentement.',
    ],
  },
  'Crunch poulie': {
    groupe: 'Abdos, gainage',
    image: 'Cable_Crunch',
    materiel: 'Poulie haute avec corde',
    muscles: 'Abdominaux',
    position: [
      'À genoux face à la poulie, corde tenue près de la tête.',
      'Enroule le buste vers le sol en contractant les abdos.',
      'Les hanches ne bougent pas.',
      'Reviens lentement.',
    ],
  },
  'Gainage planche': {
    groupe: 'Abdos, gainage',
    image: 'Plank',
    materiel: 'Aucun (un tapis)',
    muscles: 'Abdominaux, gainage profond',
    position: [
      'En appui sur les avant-bras et les pointes de pieds.',
      'Corps aligné de la tête aux talons.',
      'Serre fessiers et abdos, ne creuse pas le dos.',
      'Respire calmement.',
    ],
  },
  'Russian twist haltère': {
    groupe: 'Abdos, gainage',
    image: 'Russian_Twist',
    materiel: 'Un haltère ou un disque',
    muscles: 'Obliques, abdominaux',
    position: [
      'Assis, buste incliné en arrière, pieds décollés ou au sol.',
      'Tiens l’haltère à deux mains devant toi.',
      'Tourne le buste d’un côté puis de l’autre.',
      'Dos droit pendant tout le mouvement.',
    ],
  },
  'Hollow hold': {
    groupe: 'Abdos, gainage',
    materiel: 'Aucun (un tapis)',
    muscles: 'Abdominaux',
    position: [
      'Allongé sur le dos, bas du dos plaqué au sol.',
      'Décolle épaules et jambes tendues de quelques centimètres.',
      'Bras tendus derrière la tête.',
      'Tiens la position en respirant.',
    ],
  },
  'Y-T-W au sol': {
    groupe: 'Abdos, gainage',
    materiel: 'Aucun (un tapis)',
    muscles: 'Haut du dos, arrière d’épaules',
    position: [
      'Allongé sur le ventre, front au sol.',
      'Monte les bras en Y, puis en T, puis en W.',
      'Serre les omoplates à chaque position.',
      'Pouces vers le plafond.',
    ],
  },
  'Pompes scapulaires': {
    groupe: 'Abdos, gainage',
    image: 'Pushups',
    materiel: 'Aucun',
    muscles: 'Dentelés, stabilité des épaules',
    position: [
      'Position de pompe, bras tendus.',
      'Sans plier les coudes, rapproche les omoplates.',
      'Puis écarte-les en poussant le sol.',
      'Mouvement de petite amplitude.',
    ],
  },

  // ---------- CrossFit ----------
  'Thruster': {
    groupe: 'CrossFit',
    image: 'Kettlebell_Thruster',
    materiel: 'Barre olympique (ou kettlebells / haltères)',
    muscles: 'Quadriceps, fessiers, épaules, triceps',
    position: [
      'Barre en appui sur l’avant des épaules, coudes hauts.',
      'Descends en front squat, cuisses au moins parallèles au sol.',
      'Remonte en explosant et utilise cet élan pour pousser la barre au-dessus de la tête.',
      'Bras verrouillés en haut, puis redescends la barre sur les épaules en enchaînant le squat.',
    ],
  },
  'Dumbbell thruster': {
    groupe: 'CrossFit',
    image: 'Kettlebell_Thruster',
    materiel: 'Deux haltères',
    muscles: 'Quadriceps, fessiers, épaules, triceps',
    position: [
      'Un haltère dans chaque main, posés sur les épaules.',
      'Squat complet, buste droit, talons au sol.',
      'Remonte en poussant fort et envoie les haltères au-dessus de la tête.',
      'Bras tendus en haut, puis redescends en contrôlant.',
    ],
  },
  'Power clean': {
    groupe: 'CrossFit',
    image: 'Power_Clean',
    materiel: 'Barre olympique',
    muscles: 'Chaîne postérieure, trapèzes, quadriceps',
    position: [
      'Pieds largeur de hanches, barre au contact des tibias, dos plat.',
      'Pousse dans le sol : la barre remonte le long des cuisses.',
      'Grande extension des hanches, haussement d’épaules, tire sous la barre.',
      'Réceptionne la barre sur l’avant des épaules en quart de squat, coudes hauts.',
    ],
  },
  'Power snatch': {
    groupe: 'CrossFit',
    image: 'Power_Snatch',
    materiel: 'Barre olympique, prise large',
    muscles: 'Chaîne postérieure, épaules, trapèzes',
    position: [
      'Prise très large, barre contre les tibias, dos plat.',
      'La barre remonte collée au corps.',
      'Extension explosive des hanches, puis passe sous la barre.',
      'Réceptionne bras tendus au-dessus de la tête en quart de squat.',
    ],
  },
  'Clean and jerk': {
    groupe: 'CrossFit',
    image: 'Clean_and_Jerk',
    materiel: 'Barre olympique',
    muscles: 'Corps entier',
    position: [
      'Épaulé : amène la barre sur l’avant des épaules (comme le power clean).',
      'Petite flexion des genoux, buste droit.',
      'Pousse explosivement avec les jambes et passe sous la barre (fentes ou pieds parallèles).',
      'Bras verrouillés, ramène les pieds alignés pour valider.',
    ],
  },
  'Push press': {
    groupe: 'CrossFit',
    image: 'Push_Press',
    materiel: 'Barre olympique',
    muscles: 'Épaules, triceps, jambes',
    position: [
      'Barre sur l’avant des épaules, coudes légèrement devant.',
      'Petite flexion des genoux (dip), buste vertical.',
      'Pousse fort avec les jambes et termine avec les bras.',
      'Barre au-dessus de la tête, tête légèrement en avant, bras verrouillés.',
    ],
  },
  'Front squat': {
    groupe: 'CrossFit',
    image: 'Front_Squat_Clean_Grip',
    materiel: 'Barre olympique sur rack',
    muscles: 'Quadriceps, fessiers, gainage',
    position: [
      'Barre posée sur l’avant des épaules, coudes hauts et vers l’avant.',
      'Pieds largeur d’épaules, pointes légèrement ouvertes.',
      'Descends buste droit, cuisses sous la parallèle si possible.',
      'Remonte en gardant les coudes hauts.',
    ],
  },
  'Overhead squat': {
    groupe: 'CrossFit',
    image: 'Overhead_Squat',
    materiel: 'Barre olympique, prise large',
    muscles: 'Quadriceps, épaules, gainage, mobilité',
    position: [
      'Barre bras tendus au-dessus de la tête, prise large.',
      'Aisselles tournées vers l’avant, épaules actives.',
      'Descends en squat en gardant la barre au-dessus du milieu des pieds.',
      'Remonte sans laisser la barre partir vers l’avant.',
    ],
  },
  'Wall ball': {
    groupe: 'CrossFit',
    materiel: 'Medicine ball (6 à 9 kg) et un mur avec une cible',
    muscles: 'Quadriceps, fessiers, épaules',
    position: [
      'Balle tenue contre la poitrine, face au mur à environ 50 cm.',
      'Squat complet, hanches sous les genoux.',
      'Remonte et lance la balle sur la cible en tendant les bras.',
      'Rattrape la balle et enchaîne directement le squat suivant.',
    ],
  },
  'Kettlebell swing': {
    groupe: 'CrossFit',
    image: 'One-Arm_Kettlebell_Swings',
    materiel: 'Kettlebell',
    muscles: 'Fessiers, ischio-jambiers, lombaires',
    position: [
      'Pieds un peu plus larges que les hanches, kettlebell à deux mains.',
      'Bascule le bassin vers l’arrière, kettlebell entre les jambes, dos plat.',
      'Ouvre les hanches avec force : ce sont les hanches qui lancent, pas les bras.',
      'Version RX : kettlebell au-dessus de la tête. Version russe : à hauteur des yeux.',
    ],
  },
  'Dumbbell snatch': {
    groupe: 'CrossFit',
    image: 'One-Arm_Kettlebell_Snatch',
    materiel: 'Un haltère',
    muscles: 'Chaîne postérieure, épaules',
    position: [
      'Haltère au sol entre les pieds, dos plat.',
      'Arrache l’haltère en ouvrant les hanches, bras proche du corps.',
      'Termine bras tendu au-dessus de la tête, debout.',
      'Change de main à chaque rep (ou selon le WOD).',
    ],
  },
  'Box jump': {
    groupe: 'CrossFit',
    image: 'Front_Box_Jump',
    materiel: 'Box (50 à 60 cm)',
    muscles: 'Quadriceps, fessiers, explosivité',
    position: [
      'Face à la box, pieds largeur de hanches.',
      'Lance les bras et saute en poussant fort.',
      'Atterris les deux pieds sur la box, genoux souples.',
      'Tends complètement les hanches en haut, puis redescends en marchant.',
    ],
  },
  'Pull-up': {
    groupe: 'CrossFit',
    image: 'Pullups',
    materiel: 'Barre de traction',
    muscles: 'Dos (grands dorsaux), biceps',
    poidsDuCorps: 1,
    position: [
      'Mains en pronation, un peu plus larges que les épaules.',
      'Pars bras tendus, épaules engagées.',
      'Tire jusqu’à passer le menton au-dessus de la barre.',
      'En CrossFit, le kipping (élan) est autorisé une fois la version stricte maîtrisée.',
    ],
  },
  'Chest-to-bar pull-up': {
    groupe: 'CrossFit',
    image: 'Pullups',
    materiel: 'Barre de traction',
    muscles: 'Dos, biceps',
    poidsDuCorps: 1,
    position: [
      'Comme un pull-up, mais plus haut.',
      'La poitrine doit toucher la barre (sous les clavicules).',
      'Tire les coudes vers l’arrière et le bas.',
      'Kipping autorisé.',
    ],
  },
  'Muscle-up': {
    groupe: 'CrossFit',
    image: 'Muscle_Up',
    materiel: 'Anneaux ou barre',
    muscles: 'Dos, pectoraux, triceps',
    poidsDuCorps: 1,
    position: [
      'Traction explosive en tirant la barre vers les hanches.',
      'Bascule rapidement le buste au-dessus de la barre (transition).',
      'Termine par un dip, bras verrouillés.',
      'À travailler seulement quand 10 chest-to-bar et 10 dips sont faciles.',
    ],
  },
  'Toes-to-bar': {
    groupe: 'CrossFit',
    image: 'Hanging_Leg_Raise',
    materiel: 'Barre de traction',
    muscles: 'Abdominaux, grip, dorsaux',
    position: [
      'Suspendu bras tendus, prise largeur d’épaules.',
      'Balancement contrôlé : creuse puis cambre légèrement.',
      'Ramène les pieds jusqu’à toucher la barre.',
      'Les deux pieds doivent toucher la barre en même temps.',
    ],
  },
  'Double-under': {
    groupe: 'CrossFit',
    image: 'Rope_Jumping',
    materiel: 'Corde à sauter',
    muscles: 'Mollets, coordination, cardio',
    position: [
      'Coudes près du corps, la rotation vient des poignets.',
      'Saut un peu plus haut qu’un saut simple, jambes presque tendues.',
      'La corde passe deux fois sous les pieds à chaque saut.',
      'Pour débuter : alterne 3 sauts simples et 1 double.',
    ],
  },
  'Rowing': {
    groupe: 'CrossFit',
    image: 'Rowing_Stationary',
    materiel: 'Rameur (type Concept2)',
    muscles: 'Jambes, dos, bras, cardio',
    position: [
      'Ordre de la poussée : jambes, puis buste, puis bras.',
      'Au retour : bras, puis buste, puis jambes.',
      'Dos droit, ne tire pas avec les bras en premier.',
      'Le score se compte en calories ou en mètres affichés.',
    ],
  },
  'Handstand push-up': {
    groupe: 'CrossFit',
    image: 'Handstand_Push-Ups',
    materiel: 'Un mur (et un tapis pour la tête)',
    muscles: 'Épaules, triceps',
    poidsDuCorps: 1,
    position: [
      'En équilibre sur les mains, dos face au mur.',
      'Mains un peu plus larges que les épaules.',
      'Descends la tête jusqu’au tapis en contrôlant.',
      'Pousse jusqu’à bras tendus. Version allégée : pike push-up.',
    ],
  },
  'Push-up': {
    groupe: 'CrossFit',
    image: 'Pushups',
    materiel: 'Aucun',
    muscles: 'Pectoraux, triceps, épaules',
    poidsDuCorps: 0.65,
    position: [
      'Mains un peu plus larges que les épaules, corps gainé en planche.',
      'La poitrine touche le sol en bas.',
      'Remonte jusqu’à bras tendus.',
      'Coudes à 45° du corps, pas écartés à 90°.',
    ],
  },
  'Air squat': {
    groupe: 'CrossFit',
    image: 'Bodyweight_Squat',
    materiel: 'Aucun',
    muscles: 'Quadriceps, fessiers',
    poidsDuCorps: 0.7,
    position: [
      'Pieds largeur d’épaules.',
      'Descends hanches sous les genoux, talons au sol.',
      'Bras devant toi pour l’équilibre.',
      'Remonte jusqu’à extension complète des hanches.',
    ],
  },
  'Burpee': {
    groupe: 'CrossFit',
    materiel: 'Aucun',
    muscles: 'Corps entier, cardio',
    poidsDuCorps: 0.5,
    position: [
      'Debout, pose les mains au sol.',
      'Saute les pieds en arrière, poitrine et cuisses touchent le sol.',
      'Ramène les pieds vers les mains d’un saut.',
      'Saute en tapant des mains au-dessus de la tête.',
    ],
  },
  'Sit-up': {
    groupe: 'CrossFit',
    image: 'Sit-Up',
    materiel: 'Un tapis (et un AbMat si possible)',
    muscles: 'Abdominaux',
    position: [
      'Allongé, plantes des pieds jointes (papillon) ou pieds au sol.',
      'Bras tendus derrière la tête.',
      'Remonte jusqu’à toucher le sol devant tes pieds.',
      'Redescends jusqu’à toucher le sol derrière la tête avec les mains.',
    ],
  },
  'Walking lunge': {
    groupe: 'CrossFit',
    image: 'Bodyweight_Walking_Lunge',
    materiel: 'Aucun',
    muscles: 'Quadriceps, fessiers',
    poidsDuCorps: 0.7,
    position: [
      'Grand pas en avant, buste droit.',
      'Le genou arrière frôle le sol.',
      'Pousse sur la jambe avant et enchaîne avec l’autre jambe.',
      'Chaque pas compte pour une rep.',
    ],
  },
  'Mountain climber': {
    groupe: 'CrossFit',
    image: 'Mountain_Climbers',
    materiel: 'Aucun',
    muscles: 'Abdominaux, épaules, cardio',
    position: [
      'Position de pompe bras tendus.',
      'Ramène un genou vers la poitrine puis alterne vite.',
      'Hanches basses, dos plat.',
      'Chaque genou compte pour une rep.',
    ],
  },
  'Run': {
    groupe: 'CrossFit',
    materiel: 'Aucun (ou un tapis de course)',
    muscles: 'Cardio, jambes',
    position: [
      'Allure soutenue mais régulière sur tout le WOD.',
      'Foulée courte, pose du pied sous le bassin.',
      'Respire profondément, épaules relâchées.',
      'Pas de place pour courir : remplace 400 m par 2 min de corde ou 500 m de rameur.',
    ],
  },
  'Handstand hold': {
    groupe: 'CrossFit',
    materiel: 'Un mur',
    muscles: 'Épaules, gainage',
    position: [
      'Monte en équilibre face ou dos au mur.',
      'Bras verrouillés, épaules qui poussent vers le plafond.',
      'Corps gainé, fessiers serrés.',
      'Pour débuter : pieds sur une box, bassin au-dessus des mains.',
    ],
  },
  'Pistol squat': {
    groupe: 'CrossFit',
    materiel: 'Aucun (une box pour s’aider)',
    muscles: 'Quadriceps, fessiers, équilibre',
    poidsDuCorps: 0.7,
    position: [
      'Debout sur une jambe, l’autre tendue devant.',
      'Descends le plus bas possible en gardant le talon au sol.',
      'Bras devant pour l’équilibre.',
      'Progression : descendre sur une box, puis de plus en plus bas.',
    ],
  },
};

// Retrouve la fiche d'un exercice, même si l'IA l'a nommé un peu différemment.
const normaliser = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const INDEX = Object.entries(FICHES).map(([nom, fiche]) => ({ cle: normaliser(nom), fiche }));

// Autres noms possibles pour un même exercice (français ou anglais).
const ALIAS: Record<string, string> = {
  'souleve de terre roumain': 'romanian deadlift',
  'souleve de terre': 'deadlift',
  'rdl': 'romanian deadlift',
  'bench press': 'developpe couche',
  'squat': 'squat barre',
  'pull ups': 'tractions',
  'lat pulldown': 'tirage vertical poulie',
  'skull crusher': 'barre au front',
  'bulgarian split squat': 'fentes bulgares',
  'plank': 'gainage planche',
  'back squat': 'squat barre',
  'strict press': 'developpe militaire',
};

export function ficheExercice(nom: string): FicheExercice | undefined {
  let cle = normaliser(nom);
  const exacte = INDEX.find((e) => e.cle === cle);
  if (exacte) return exacte.fiche;
  const alias = Object.keys(ALIAS).find((a) => cle === a || cle.startsWith(`${a} `));
  if (alias) cle = cle.replace(alias, ALIAS[alias]);
  const exacteAlias = INDEX.find((e) => e.cle === cle);
  if (exacteAlias) return exacteAlias.fiche;
  // Sinon on prend la fiche dont le nom est le plus long contenu dans celui demandé.
  const candidats = INDEX.filter((e) => cle.includes(e.cle) || e.cle.includes(cle));
  candidats.sort((a, b) => b.cle.length - a.cle.length);
  return candidats[0]?.fiche;
}
