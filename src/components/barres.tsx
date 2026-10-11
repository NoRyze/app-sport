// Petit graphique en barres verticales, sans librairie.
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function Barres({
  donnees,
  format = (v) => String(v),
  hauteur = 120,
  base = 0,
}: {
  donnees: { label: string; valeur: number }[];
  format?: (v: number) => string;
  hauteur?: number;
  base?: number; // valeur du bas de l'axe (ex : 70 kg pour bien voir les petites variations de poids)
}) {
  const max = Math.max(base + 1, ...donnees.map((d) => d.valeur));
  return (
    <View style={[styles.conteneur, { height: hauteur + 40 }]}>
      {donnees.map((d, i) => (
        <View key={`${d.label}-${i}`} style={styles.colonne}>
          <Text style={styles.valeur} numberOfLines={1}>
            {d.valeur > 0 ? format(d.valeur) : ''}
          </Text>
          <View style={[styles.barre, { height: Math.max(2, ((d.valeur - base) / (max - base)) * hauteur), opacity: d.valeur > 0 ? 1 : 0.25 }]} />
          <Text style={styles.label}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: Spacing.sm },
  colonne: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barre: { width: '70%', maxWidth: 28, backgroundColor: Colors.accent, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  valeur: { color: Colors.textSecondary, fontSize: 9, marginBottom: 2 },
  label: { color: Colors.textSecondary, fontSize: 10, marginTop: 4, fontWeight: '600' },
});
