// Écran séance : tu notes la charge et les répétitions de chaque série,
// le chrono de repos se lance quand tu valides une série, et le résumé
// (tonnage, durée, calories) se met à jour en direct.
import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { RestTimer } from '@/components/rest-timer';
import { Bouton, Card, Texte, Titre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ficheExercice, imagesExercice } from '@/lib/exercices';
import { calories, derniereCharge, dureeMinutes, formatDuree, formatTonnage, seriesFaites, tonnageSeance } from '@/lib/stats';
import { useApp } from '@/lib/store';
import { cleSeance, type Exercise, type SeanceLog, type SerieLog } from '@/lib/types';

function formatRepos(secondes: number) {
  if (secondes < 60) return `${secondes} s`;
  const min = Math.floor(secondes / 60);
  const s = secondes % 60;
  return s ? `${min} min ${s}` : `${min} min`;
}

// "8-10" -> 8 ; "30-45 s" -> 30
const premierNombre = (texte: string) => Number(texte.match(/\d+/)?.[0] ?? 0) || null;
// Accepte "72,5" comme "72.5"
const lireNombre = (texte: string) => {
  const n = Number(texte.replace(',', '.'));
  return texte.trim() === '' || Number.isNaN(n) ? null : n;
};

export default function SeanceScreen() {
  // Les paramètres viennent de l'adresse : /seance/2/3 = semaine 2, séance 3.
  const params = useLocalSearchParams<{ semaine: string; jour: string }>();
  const semaine = Number(params.semaine);
  const jour = Number(params.jour);
  const cle = cleSeance(semaine, jour);
  const { programme, logs, majLog, profil } = useApp();
  const seance = programme?.semaines.find((s) => s.numero === semaine)?.sessions.find((s) => s.jour === jour);

  const [repos, setRepos] = useState<{ finA: number; total: number } | null>(null);
  const [, setTick] = useState(0);

  // Rafraîchit la durée chaque minute.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (!programme || !seance) {
    return (
      <View style={styles.page}>
        <Texte secondaire>Séance introuvable.</Texte>
      </View>
    );
  }

  // Si la séance n'a jamais été ouverte, on prépare des séries vides
  // pré-remplies avec la dernière charge utilisée sur le même exercice.
  const log: SeanceLog = logs[cle] ?? {
    terminee: false,
    series: Object.fromEntries(
      seance.exercices.map((ex, i) => {
        const charge = derniereCharge(programme, logs, ex.nom, cle);
        return [i, Array.from({ length: ex.series }, () => ({ poids: charge, reps: null, fait: false }))];
      }),
    ),
  };

  const modifier = (modif: (l: SeanceLog) => SeanceLog) => majLog(cle, log, modif);

  function majSerie(indexExo: number, indexSerie: number, modif: Partial<SerieLog>) {
    modifier((l) => {
      const series = [...(l.series[indexExo] ?? [])];
      series[indexSerie] = { ...series[indexSerie], ...modif };
      return { ...l, series: { ...l.series, [indexExo]: series } };
    });
  }

  function validerSerie(ex: Exercise, indexExo: number, indexSerie: number) {
    const fait = !log.series[indexExo][indexSerie].fait;
    const maintenant = new Date().toISOString();
    modifier((l) => {
      const series = [...l.series[indexExo]];
      const serie = series[indexSerie];
      series[indexSerie] = { ...serie, fait, reps: serie.reps ?? (fait ? premierNombre(ex.reps) : null) };
      // Pré-remplit la série suivante avec la même charge.
      if (fait && series[indexSerie + 1] && series[indexSerie + 1].poids == null) {
        series[indexSerie + 1] = { ...series[indexSerie + 1], poids: serie.poids };
      }
      return { ...l, debut: l.debut ?? maintenant, derniereActivite: maintenant, series: { ...l.series, [indexExo]: series } };
    });
    if (fait) setRepos({ finA: Date.now() + ex.repos * 1000, total: ex.repos });
  }

  function ajouterSerie(indexExo: number) {
    modifier((l) => {
      const series = l.series[indexExo] ?? [];
      const derniere = series[series.length - 1];
      return {
        ...l,
        series: { ...l.series, [indexExo]: [...series, { poids: derniere?.poids ?? null, reps: null, fait: false }] },
      };
    });
  }

  function terminer() {
    const fin = () => {
      modifier((l) => ({ ...l, terminee: true, derniereActivite: l.derniereActivite ?? new Date().toISOString() }));
      setRepos(null);
    };
    const total = seance!.exercices.reduce((n, _, i) => n + (log.series[i]?.length ?? 0), 0);
    if (seriesFaites(log) < total) {
      // Sur le web (démo portfolio), Alert n'affiche pas de boutons : on utilise confirm().
      if (Platform.OS === 'web') {
        if (window.confirm('Certaines séries ne sont pas validées. Terminer quand même ?')) fin();
        return;
      }
      Alert.alert('Terminer la séance ?', 'Certaines séries ne sont pas validées.', [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Terminer', onPress: fin },
      ]);
    } else fin();
  }

  const totalSeries = seance.exercices.reduce((n, _, i) => n + (log.series[i]?.length ?? 0), 0);
  const tonnage = tonnageSeance(seance, log, profil.poids);
  const minutes = dureeMinutes(log);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.page, repos && { paddingBottom: 220 }]} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: `Semaine ${semaine} · Séance ${jour}` }} />
        <Titre>{seance.nom}</Titre>
        <Texte secondaire>{seance.focus}</Texte>

        {/* Résumé en direct */}
        <View style={styles.resume}>
          <Resume label="Tonnage" valeur={formatTonnage(tonnage)} />
          <Resume label="Durée" valeur={formatDuree(minutes)} />
          <Resume label="Calories" valeur={`${calories(minutes, profil.poids)} kcal`} />
          <Resume label="Séries" valeur={`${seriesFaites(log)}/${totalSeries}`} />
        </View>
        {log.terminee && <Text style={styles.terminee}>✅ Séance terminée et enregistrée</Text>}

        {seance.exercices.map((ex, i) => {
          const fiche = ficheExercice(ex.nom);
          const vignette = fiche ? imagesExercice(fiche)[1] : undefined;
          return (
            <Card key={`${ex.nom}-${i}`}>
              <Link href={{ pathname: '/exercice/[nom]', params: { nom: ex.nom } }} asChild>
                <Pressable style={styles.entete}>
                  {vignette ? (
                    <Image source={{ uri: vignette }} style={styles.vignette} contentFit="cover" />
                  ) : (
                    <View style={[styles.vignette, styles.vignetteVide]}>
                      <Text style={{ fontSize: 22 }}>🏋️</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{ex.nom}</Text>
                    <Text style={styles.objectif}>
                      {ex.series} × {ex.reps} · repos {formatRepos(ex.repos)} · {ex.intensite}
                    </Text>
                    <Text style={styles.voirFiche}>Voir la position ›</Text>
                  </View>
                </Pressable>
              </Link>
              {ex.conseil ? <Text style={styles.conseil}>💡 {ex.conseil}</Text> : null}

              <View style={styles.enteteSeries}>
                <Text style={[styles.colonne, { width: 44 }]}>Série</Text>
                <Text style={[styles.colonne, { flex: 1 }]}>{fiche?.poidsDuCorps ? 'Lest (kg)' : 'Charge (kg)'}</Text>
                <Text style={[styles.colonne, { flex: 1 }]}>Reps</Text>
                <View style={{ width: 44 }} />
              </View>
              {(log.series[i] ?? []).map((serie, j) => (
                <LigneSerie
                  key={j}
                  numero={j + 1}
                  serie={serie}
                  repsCible={ex.reps}
                  onChange={(modif) => majSerie(i, j, modif)}
                  onValider={() => validerSerie(ex, i, j)}
                />
              ))}
              <Pressable onPress={() => ajouterSerie(i)} style={styles.ajouter}>
                <Text style={styles.ajouterTexte}>+ Ajouter une série</Text>
              </Pressable>
            </Card>
          );
        })}

        {!log.terminee && <Bouton titre="Terminer la séance" onPress={terminer} />}
      </ScrollView>

      {repos && (
        <RestTimer
          finA={repos.finA}
          total={repos.total}
          onChange={(finA) => setRepos(finA ? { ...repos, finA } : null)}
        />
      )}
    </View>
  );
}

function Resume({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={styles.resumeCase}>
      <Text style={styles.resumeValeur}>{valeur}</Text>
      <Text style={styles.resumeLabel}>{label}</Text>
    </View>
  );
}

// Une ligne = une série. Le texte tapé est gardé localement puis enregistré
// quand tu quittes le champ (ça évite de perdre "72," pendant la saisie).
function LigneSerie({
  numero,
  serie,
  repsCible,
  onChange,
  onValider,
}: {
  numero: number;
  serie: SerieLog;
  repsCible: string;
  onChange: (modif: Partial<SerieLog>) => void;
  onValider: () => void;
}) {
  const [poids, setPoids] = useState(serie.poids?.toString() ?? '');
  const [reps, setReps] = useState(serie.reps?.toString() ?? '');

  // Si la valeur change ailleurs (pré-remplissage), on met le champ à jour.
  useEffect(() => setPoids(serie.poids?.toString() ?? ''), [serie.poids]);
  useEffect(() => setReps(serie.reps?.toString() ?? ''), [serie.reps]);

  return (
    <View style={[styles.serie, serie.fait && styles.serieFaite]}>
      <Text style={[styles.serieNum, { width: 44 }]}>{numero}</Text>
      <TextInput
        value={poids}
        onChangeText={setPoids}
        onEndEditing={() => onChange({ poids: lireNombre(poids) })}
        onBlur={() => onChange({ poids: lireNombre(poids) })}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={Colors.textSecondary}
        style={styles.champ}
        selectTextOnFocus
      />
      <TextInput
        value={reps}
        onChangeText={setReps}
        onEndEditing={() => onChange({ reps: lireNombre(reps) })}
        onBlur={() => onChange({ reps: lireNombre(reps) })}
        keyboardType="number-pad"
        placeholder={repsCible}
        placeholderTextColor={Colors.textSecondary}
        style={styles.champ}
        selectTextOnFocus
      />
      <Pressable onPress={onValider} style={[styles.coche, serie.fait && styles.cocheFaite]} hitSlop={6}>
        <Text style={styles.cocheTexte}>✓</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  resume: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.md },
  resumeCase: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  resumeValeur: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  resumeLabel: { color: Colors.textSecondary, fontSize: 10, marginTop: 2, textTransform: 'uppercase', fontWeight: '600' },
  terminee: { color: Colors.success, fontWeight: '700', marginBottom: Spacing.md },
  entete: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  vignette: { width: 64, height: 64, borderRadius: Radius.sm, backgroundColor: Colors.cardActive },
  vignetteVide: { alignItems: 'center', justifyContent: 'center' },
  nom: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  objectif: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  voirFiche: { color: Colors.accent, fontSize: 13, fontWeight: '600', marginTop: 4 },
  conseil: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.sm, lineHeight: 19 },
  enteteSeries: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, marginBottom: 4 },
  colonne: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  serie: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingVertical: 4, borderRadius: Radius.sm },
  serieFaite: { backgroundColor: '#13261C' },
  serieNum: { color: Colors.textSecondary, fontWeight: '800', textAlign: 'center' },
  champ: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0, // sinon le champ déborde sur le web
    backgroundColor: Colors.cardActive,
    color: Colors.text,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  coche: {
    width: 44,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cocheFaite: { backgroundColor: Colors.success },
  cocheTexte: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  ajouter: { alignItems: 'center', paddingTop: Spacing.sm },
  ajouterTexte: { color: Colors.accent, fontWeight: '600' },
});
