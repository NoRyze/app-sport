// Fonction serveur (Supabase Edge Function) : reçoit le profil de l'app,
// demande à Claude un plan d'entraînement et renvoie du JSON.
// La clé ANTHROPIC_API_KEY est un "secret" Supabase, jamais envoyé à l'app.
//
// Déploiement :
//   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   npx supabase functions deploy generate-program

import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic(); // lit ANTHROPIC_API_KEY dans l'environnement

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};

const exercice = {
  type: 'object',
  properties: {
    nom: { type: 'string' },
    series: { type: 'integer' },
    reps: { type: 'string', description: 'ex : "8-10" ou "30-45 s"' },
    repos: { type: 'integer', description: 'repos en secondes' },
    intensite: { type: 'string', description: 'ex : "RPE 7"' },
    conseil: { type: 'string', description: 'conseil technique court en français' },
  },
  required: ['nom', 'series', 'reps', 'repos', 'intensite', 'conseil'],
  additionalProperties: false,
};

const schema = {
  type: 'object',
  properties: {
    titre: { type: 'string' },
    description: { type: 'string' },
    seances: {
      type: 'array',
      description: 'Une séance par jour d’entraînement de la semaine type',
      items: {
        type: 'object',
        properties: {
          jour: { type: 'integer' },
          nom: { type: 'string' },
          focus: { type: 'string' },
          exercices: { type: 'array', items: exercice },
        },
        required: ['jour', 'nom', 'focus', 'exercices'],
        additionalProperties: false,
      },
    },
    progression: {
      type: 'array',
      description: 'Une entrée par semaine du programme',
      items: {
        type: 'object',
        properties: {
          numero: { type: 'integer' },
          theme: { type: 'string' },
          rpe: { type: 'integer', description: 'effort cible sur 10, de 6 à 10' },
          deltaSeries: { type: 'integer', description: 'séries à ajouter (+) ou retirer (-) par rapport à la semaine type' },
        },
        required: ['numero', 'theme', 'rpe', 'deltaSeries'],
        additionalProperties: false,
      },
    },
  },
  required: ['titre', 'description', 'seances', 'progression'],
  additionalProperties: false,
};

const SYSTEM = `Tu es un coach de musculation diplômé. Tu conçois des programmes sûrs, efficaces et réalistes, en français.
Tu renvoies une semaine type (une séance par jour d'entraînement) et une progression semaine par semaine
(périodisation avec montée progressive de l'intensité et des semaines de décharge quand c'est pertinent).
Respecte la durée de séance, le matériel disponible et les blessures signalées. Les noms d'exercices sont courts et usuels en salle : garde le nom anglais quand c'est celui que tout le monde utilise (Romanian deadlift, Deadlift, Hip thrust, Leg curl, Face pull, Goblet squat...), sinon le nom français (Développé couché, Tractions, Fentes bulgares...).`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { profil } = await req.json();

    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      system: SYSTEM,
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      // Si un filtre de sécurité refuse la demande, l'API réessaie avec un autre modèle.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [
        {
          role: 'user',
          content: `Crée un programme de ${profil.semaines} semaines, ${profil.joursParSemaine} séances par semaine pour ce profil :\n${JSON.stringify(profil, null, 2)}`,
        },
      ],
    } as any);

    if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
      throw new Error(`Génération interrompue (${response.stop_reason})`);
    }
    const texte = response.content.find((b: { type: string }) => b.type === 'text') as { text: string } | undefined;
    if (!texte) throw new Error('Réponse vide');

    return new Response(texte.text, { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
