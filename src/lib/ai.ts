// Point d'entrée pour générer un programme.
// - Si le serveur IA est configuré (fichier .env), on lui envoie le profil.
// - Sinon, ou en cas d'erreur, on utilise le générateur hors ligne.
//
// La clé de l'IA n'est JAMAIS dans l'app : elle reste sur le serveur
// (Supabase), sinon n'importe qui pourrait la récupérer dans l'app.

import { developperPlan, genererProgrammeLocal } from './generator';
import type { AiPlan, Profile, Program } from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const iaConfiguree = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function genererProgramme(profil: Profile): Promise<{ programme: Program; erreurIa?: string }> {
  if (!iaConfiguree) {
    return { programme: genererProgrammeLocal(profil) };
  }

  try {
    const reponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ profil }),
    });
    if (!reponse.ok) throw new Error(`Serveur IA : erreur ${reponse.status}`);
    const plan = (await reponse.json()) as AiPlan;
    return { programme: developperPlan(plan) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { programme: genererProgrammeLocal(profil), erreurIa: message };
  }
}
