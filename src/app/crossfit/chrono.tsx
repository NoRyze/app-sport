// Chrono WOD : For Time (chrono qui monte avec temps limite), AMRAP (compte à
// rebours + compteur de rounds), EMOM (minute par minute) et Tabata (20 s / 10 s).
// 10 secondes de décompte avant le départ, bips aux moments clés,
// et l'écran reste allumé pendant le WOD.
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bouton, Choix, Compteur, Texte } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { bip, preparerSon } from '@/lib/bip';
import { FORMAT_EXPLICATIONS, FORMAT_LABELS, cleSeanceCF, formatTemps, type FormatWod } from '@/lib/crossfit';
import { useApp } from '@/lib/store';

const DECOMPTE = 10; // secondes avant le départ

type Etat = { depart: number; pauseDebut: number | null; pauseTotale: number; fini: boolean };

export default function ChronoScreen() {
  const params = useLocalSearchParams<{ semaine?: string; jour?: string }>();
  const { programmeCF, majLogCF } = useApp();
  const semaine = Number(params.semaine);
  const jour = Number(params.jour);
  const seance = programmeCF?.semaines.find((s) => s.numero === semaine)?.seances.find((s) => s.jour === jour);
  const wod = seance?.wod;

  // Chrono libre (sans séance) : on choisit le format et la durée.
  const [formatLibre, setFormatLibre] = useState<FormatWod>('amrap');
  const [dureeLibre, setDureeLibre] = useState(12);
  const [nbTabata, setNbTabata] = useState(1);

  const format = wod?.format ?? formatLibre;
  const mouvements = wod?.mouvements.map((m) => m.nom) ?? [];
  const nbBlocsTabata = wod ? Math.max(1, wod.mouvements.length) : nbTabata;
  const total = format === 'tabata' ? nbBlocsTabata * 8 * 30 : (wod?.duree ?? dureeLibre) * 60; // secondes

  const [etat, setEtat] = useState<Etat | null>(null);
  const [rounds, setRounds] = useState(0);
  const [maintenant, setMaintenant] = useState(Date.now());
  const derniereSeconde = useRef<number | null>(null);

  const ecouleMs = etat ? (etat.pauseDebut ?? maintenant) - etat.depart - etat.pauseTotale : -DECOMPTE * 1000;
  const seconde = Math.floor(ecouleMs / 1000);
  const enCours = etat != null && !etat.fini && etat.pauseDebut == null;

  useEffect(() => {
    if (!enCours) return;
    const id = setInterval(() => setMaintenant(Date.now()), 200);
    return () => clearInterval(id);
  }, [enCours]);

  // Bips et fin automatique : évalués une fois par seconde.
  useEffect(() => {
    if (!enCours || derniereSeconde.current === seconde) return;
    derniereSeconde.current = seconde;
    const s = seconde;
    if (s >= total) {
      bip(true);
      setEtat((e) => (e ? { ...e, fini: true, pauseDebut: e.depart + e.pauseTotale + total * 1000 } : e));
      return;
    }
    if (s >= -3 && s <= -1) bip();
    else if (s === 0) bip(true);
    else if (format === 'emom' && s % 60 === 0) bip(true);
    else if (format === 'emom' && s % 60 >= 57) bip();
    else if (format === 'tabata' && (s % 30 === 0 || s % 30 === 20)) bip(true);
    else if (format === 'tabata' && [17, 18, 19, 27, 28, 29].includes(s % 30)) bip();
    else if (total - s <= 3) bip();
  }, [seconde, enCours, format, total]);

  function demarrer() {
    preparerSon();
    derniereSeconde.current = null;
    setRounds(0);
    const t = Date.now();
    setMaintenant(t);
    setEtat({ depart: t + DECOMPTE * 1000, pauseDebut: null, pauseTotale: 0, fini: false });
  }

  function pause() {
    const t = Date.now();
    setMaintenant(t);
    setEtat((e) =>
      e && (e.pauseDebut == null ? { ...e, pauseDebut: t } : { ...e, pauseTotale: e.pauseTotale + (t - e.pauseDebut), pauseDebut: null }),
    );
  }

  function terminer() {
    const t = Date.now();
    bip(true);
    setEtat((e) => e && { ...e, fini: true, pauseDebut: e.pauseDebut ?? t });
  }

  // Résultat obtenu
  const tempsFinal = Math.min(total, Math.max(0, seconde));
  const auCap = format === 'for_time' && tempsFinal >= total;

  async function enregistrer() {
    if (!seance) return;
    await majLogCF(cleSeanceCF(semaine, jour), (l) => {
      if (format === 'for_time') return { ...l, temps: tempsFinal, cap: auCap };
      if (format === 'amrap') return { ...l, rounds };
      return l;
    });
    router.back();
  }

  // ----- Affichage selon le format -----
  let grand = '';
  let detail = '';
  let couleur: string = Colors.text;
  if (!etat || seconde < 0) {
    grand = String(etat ? -seconde : DECOMPTE);
    detail = etat ? 'Prêt ?' : 'Appuie sur Démarrer';
    couleur = Colors.accent;
  } else if (format === 'for_time') {
    grand = formatTemps(tempsFinal);
    detail = `Temps limite ${formatTemps(total)}`;
  } else if (format === 'amrap') {
    grand = formatTemps(Math.max(0, total - seconde));
    detail = `Il reste · ${Math.round(total / 60)} min au total`;
  } else if (format === 'emom') {
    const minute = Math.min(Math.floor(seconde / 60) + 1, total / 60);
    grand = formatTemps(etat.fini ? 0 : 60 - (seconde % 60));
    const mvt = mouvements.length ? ` · ${mouvements[(minute - 1) % mouvements.length]}` : '';
    detail = `Minute ${minute}/${total / 60}${mvt}`;
  } else {
    const bloc = Math.min(Math.floor(seconde / 30), nbBlocsTabata * 8 - 1);
    const dansBloc = etat.fini ? 30 : seconde % 30;
    const travail = dansBloc < 20;
    grand = String(travail ? 20 - dansBloc : 30 - dansBloc);
    couleur = travail ? Colors.success : Colors.textSecondary;
    const mvt = mouvements[Math.floor(bloc / 8)];
    detail = `${travail ? 'TRAVAIL' : 'Repos'} · tour ${(bloc % 8) + 1}/8${mvt ? ` · ${mvt}` : ''}`;
  }
  if (etat?.fini) {
    couleur = Colors.success;
    detail = 'Terminé !';
  }

  useKeepAwake(undefined, { suppressDeactivateWarnings: true });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: wod ? `Chrono · ${wod.nom}` : 'Chrono WOD' }} />

      {!wod && !etat && (
        <>
          <Choix
            label="Format"
            valeur={formatLibre}
            options={FORMAT_LABELS}
            onChange={(f) => setFormatLibre(f)}
          />
          {formatLibre === 'tabata' ? (
            <Compteur label="Mouvements (4 min chacun)" valeur={nbTabata} onChange={setNbTabata} min={1} max={4} />
          ) : (
            <Compteur label={formatLibre === 'for_time' ? 'Temps limite' : 'Durée'} valeur={dureeLibre} onChange={setDureeLibre} min={1} max={60} unite="min" />
          )}
        </>
      )}

      <Text style={styles.format}>{FORMAT_LABELS[format]}</Text>
      <Texte secondaire>{FORMAT_EXPLICATIONS[format]}</Texte>
      {wod && (
        <Text style={styles.mouvements}>
          {wod.mouvements.map((m) => `${m.reps} ${m.nom}`).join('  ·  ')}
        </Text>
      )}

      <View style={styles.cadran}>
        <Text style={[styles.grand, { color: couleur }]}>{grand}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>

      {(format === 'amrap' || (format === 'for_time' && (!wod || (wod.rounds ?? 1) > 1))) && etat && seconde >= 0 && (
        <View style={styles.rounds}>
          <Pressable onPress={() => setRounds((r) => Math.max(0, r - 1))} style={styles.petit} hitSlop={8}>
            <Text style={styles.petitTexte}>−</Text>
          </Pressable>
          <Pressable onPress={() => setRounds((r) => r + 1)} style={styles.gros} disabled={etat.fini}>
            <Text style={styles.grosTexte}>{rounds}</Text>
            <Text style={styles.grosLabel}>rounds · appuie à chaque tour</Text>
          </Pressable>
        </View>
      )}

      {!etat && <Bouton titre="Démarrer" onPress={demarrer} />}
      {etat && !etat.fini && (
        <>
          {format === 'for_time' && seconde >= 0 && <Bouton titre="Terminé !" onPress={terminer} />}
          <Bouton titre={etat.pauseDebut ? 'Reprendre' : 'Pause'} variante="contour" onPress={pause} />
          {format !== 'for_time' && <Bouton titre="Arrêter" variante="contour" onPress={terminer} />}
        </>
      )}
      {etat?.fini && (
        <>
          <Text style={styles.resultat}>
            {format === 'for_time'
              ? auCap
                ? 'Temps limite atteint (CAP) : note tes reps sur la séance.'
                : `Ton temps : ${formatTemps(tempsFinal)}`
              : format === 'amrap'
                ? `${rounds} rounds complets : ajoute les reps du tour entamé sur la séance.`
                : 'Bravo ! Note ton total de reps sur la séance.'}
          </Text>
          {seance && <Bouton titre="Enregistrer et revenir à la séance" onPress={enregistrer} />}
          <Bouton titre="Recommencer" variante="contour" onPress={() => setEtat(null)} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  format: { color: Colors.accent, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  mouvements: { color: Colors.text, fontSize: 15, fontWeight: '600', marginTop: Spacing.sm, lineHeight: 22 },
  cadran: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  grand: { fontSize: 88, fontWeight: '800', fontVariant: ['tabular-nums'] },
  detail: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700', marginTop: Spacing.xs, textAlign: 'center' },
  rounds: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  petit: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.cardActive, alignItems: 'center', justifyContent: 'center' },
  petitTexte: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  gros: { flex: 1, backgroundColor: Colors.accentSoft, borderColor: Colors.accent, borderWidth: 1, borderRadius: Radius.lg, alignItems: 'center', paddingVertical: Spacing.md },
  grosTexte: { color: Colors.text, fontSize: 36, fontWeight: '800' },
  grosLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  resultat: { color: Colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
});
