# App Sport

Application iPhone (Expo / React Native) qui génère des programmes d'entraînement sur plusieurs semaines grâce à l'IA.
Premier module : **musculation**. À venir : HYROX, CrossFit.

## Fonctionnalités

- **Profil** : âge, poids, niveau, objectif, matériel, séances par semaine…
- **Programme** sur 4 à 16 semaines (IA ou générateur hors ligne), noms d'exercices usuels en salle.
- **Programme perso** : crée ta propre programmation ou modifie celle générée (séances, exercices de la bibliothèque ou libres, séries, reps, repos). Les semaines déjà commencées ne sont pas modifiées.
- **Séance** : saisie de la charge et des répétitions de chaque série, chrono de repos automatique
  (vibration à la fin), tonnage, durée et calories estimées en direct.
- **Fiche exercice** : images de départ et d'arrivée, matériel, muscles, bonne position.
- **Corps** : poids et mensurations datés (bras, poitrine, taille, cuisse…).
- **CrossFit** : programme hors ligne (échauffement, bloc force, WOD For Time / AMRAP / EMOM / Tabata), charges RX et Scaled, benchmarks (Fran, Helen, Cindy…) refaits en fin de programme, chrono WOD avec bips, saisie du score et records.
- **Bilan** : assiduité, tonnage par semaine, progression de force (1RM estimé), évolution du corps.

Calories : estimation par la méthode MET (5 MET × poids × durée). Images : [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (domaine public).

## Tester sur ton iPhone (sans Mac)

1. Installe **Node.js LTS** sur ton PC : https://nodejs.org
2. Installe l'app **Expo Go** sur ton iPhone (App Store).
3. Dans un terminal, dans ce dossier :
   ```bash
   npm install
   npx expo start
   ```
4. Un QR code s'affiche. Scanne-le avec l'appareil photo de l'iPhone : l'app s'ouvre dans Expo Go.
   Ton PC et ton iPhone doivent être sur le même Wi-Fi (sinon : `npx expo start --tunnel`).

Chaque fois que tu modifies un fichier, l'app se met à jour toute seule sur le téléphone.

Version web (pour le portfolio) : `npx expo start --web`.

## Installer l'app sur l'iPhone (sans PC, hors ligne)

L'app peut s'installer comme une « web app » sur l'écran d'accueil et fonctionner sans internet.

1. Construis la version web : `npm run build:web` (crée le dossier `dist/`).
2. Mets le dossier `dist/` en ligne (GitHub Pages ou Netlify, gratuit).
3. Sur l'iPhone, ouvre l'adresse dans **Safari**, touche **Partager** puis **Sur l'écran d'accueil**.
4. Ouvre l'app une fois avec internet : elle se copie sur le téléphone (avec les images des exercices).
   Ensuite, elle marche même en mode avion.

Tes données (séances, mesures) restent sur le téléphone. Limite : pas de vibration à la fin du repos
(Safari ne le permet pas), le chrono reste affiché.

## Comment le code est organisé

```
src/
  app/                    ← chaque fichier = un écran (Expo Router)
    _layout.tsx           ← navigation principale
    (tabs)/_layout.tsx    ← barre d'onglets en bas
    (tabs)/index.tsx      ← écran Muscu (programme)
    (tabs)/crossfit.tsx   ← écran CrossFit (programme + records)
    (tabs)/corps.tsx      ← écran Corps (mesures)
    (tabs)/bilan.tsx      ← écran Bilan
    (tabs)/profil.tsx     ← écran Profil
    exercice/[nom].tsx    ← fiche exercice (images, position)
    programme/editer.tsx  ← créer / modifier un programme
    seance/[semaine]/[jour].tsx ← détail d'une séance
    crossfit/[semaine]/[jour].tsx ← séance CrossFit + saisie du score
    crossfit/chrono.tsx   ← chrono WOD (For Time, AMRAP, EMOM, Tabata)
  components/ui.tsx       ← boutons, cartes, sélecteurs réutilisables
  components/rest-timer.tsx ← chrono de repos
  components/barres.tsx   ← petit graphique en barres
  constants/theme.ts      ← couleurs et espacements
  lib/
    types.ts              ← forme des données (profil, programme, séance…)
    storage.ts            ← sauvegarde sur le téléphone
    store.tsx             ← état partagé entre les écrans
    generator.ts          ← générateur hors ligne + "déroulage" du plan IA
    ai.ts                 ← appel au serveur IA (avec secours hors ligne)
    exercices.ts          ← fiches exercices (images, position)
    stats.ts              ← tonnage, calories, 1RM, bilan
    crossfit.ts           ← mouvements, benchmarks, générateur de WOD, scores
    bip.ts                ← bips / vibrations du chrono
supabase/functions/generate-program/index.ts ← serveur qui parle à Claude
scripts/build-pwa.js       ← rend la version web installable et hors ligne
public/icons/              ← icônes de l'app
```

## Brancher l'IA

Sans configuration, l'app utilise le générateur hors ligne (règles de coach classiques).
Pour activer l'IA :

1. Crée un projet gratuit sur https://supabase.com
2. Crée une clé API sur https://console.anthropic.com
3. Déploie la fonction serveur :
   ```bash
   npx supabase login
   npx supabase link --project-ref <id-du-projet>
   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   npx supabase functions deploy generate-program
   ```
4. Copie `.env.example` en `.env` et remplis l'URL et la clé "anon" de Supabase.

La clé Anthropic reste sur le serveur : elle n'est jamais dans l'app.
