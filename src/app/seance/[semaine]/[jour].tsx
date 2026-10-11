// Écran détail d'une séance : la liste des exercices à faire.
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Texte, Titre } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApp } from '@/lib/store';

function formatRepos(secondes: number) {
  if (secondes < 60) return `${secondes} s`;
  const min = Math.floor(secondes / 60);
  const s = secondes % 60;
  return s ? `${min} min ${s}` : `${min} min`;
}

export default function SeanceScreen() {
  // Les paramètres viennent de l'adresse : /seance/2/3 = semaine 2, séance 3.
  const { semaine, jour } = useLocalSearchParams<{ semaine: string; jour: string }>();
  const { programme } = useApp();
  const seance = programme?.semaines
    .find((s) => s.numero === Number(semaine))
    ?.sessions.find((s) => s.jour === Number(jour));

  if (!seance) {
    return (
      <View style={styles.page}>
        <Texte secondaire>Séance introuvable.</Texte>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: `Semaine ${semaine} · Séance ${jour}` }} />
      <Titre>{seance.nom}</Titre>
      <Texte secondaire>{seance.focus}</Texte>
      <View style={{ height: Spacing.md }} />

      {seance.exercices.map((ex, i) => (
        <Card key={`${ex.nom}-${i}`}>
          <Text style={styles.numero}>{i + 1}</Text>
          <Text style={styles.nom}>{ex.nom}</Text>
          <View style={styles.stats}>
            <Stat label="Séries" valeur={String(ex.series)} />
            <Stat label="Reps" valeur={ex.reps} />
            <Stat label="Repos" valeur={formatRepos(ex.repos)} />
            <Stat label="Effort" valeur={ex.intensite} />
          </View>
          {ex.conseil ? <Text style={styles.conseil}>💡 {ex.conseil}</Text> : null}
        </Card>
      ))}
    </ScrollView>
  );
}

function Stat({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValeur}>{valeur}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  numero: { color: Colors.accent, fontWeight: '800', fontSize: 13 },
  nom: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: Spacing.sm },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValeur: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
  conseil: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.sm, lineHeight: 19 },
});
