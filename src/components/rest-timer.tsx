// Chrono de repos : compte à rebours affiché en bas de l'écran.
// Le téléphone vibre quand le repos est terminé.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  finA: number; // horodatage (ms) de fin du repos
  total: number; // durée totale en secondes (pour la barre de progression)
  onChange: (finA: number | null) => void;
};

export function RestTimer({ finA, total, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const [maintenant, setMaintenant] = useState(Date.now());
  const restant = Math.max(0, Math.ceil((finA - maintenant) / 1000));

  // On rafraîchit l'affichage 4 fois par seconde.
  useEffect(() => {
    const id = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Fin du repos : vibration puis fermeture du chrono.
  useEffect(() => {
    if (restant > 0) return;
    Vibration.vibrate([0, 400, 200, 400]);
    const id = setTimeout(() => onChange(null), 1500);
    return () => clearTimeout(id);
  }, [restant === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const min = Math.floor(restant / 60);
  const sec = String(restant % 60).padStart(2, '0');
  const progression = total > 0 ? 1 - restant / total : 1;

  return (
    <View style={[styles.conteneur, { paddingBottom: insets.bottom + Spacing.sm }]}>
      <View style={[styles.barre, { width: `${Math.min(100, progression * 100)}%` }]} />
      <View style={styles.ligne}>
        <Pressable onPress={() => onChange(finA - 15000)} style={styles.bouton} hitSlop={8}>
          <Text style={styles.boutonTexte}>−15 s</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.label}>{restant > 0 ? 'Repos' : 'C’est reparti !'}</Text>
          <Text style={styles.temps}>
            {min}:{sec}
          </Text>
        </View>
        <Pressable onPress={() => onChange(finA + 15000)} style={styles.bouton} hitSlop={8}>
          <Text style={styles.boutonTexte}>+15 s</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => onChange(null)} style={styles.passer}>
        <Text style={styles.passerTexte}>Passer le repos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  barre: { position: 'absolute', top: 0, left: 0, height: 4, backgroundColor: Colors.accent },
  ligne: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  temps: { color: Colors.text, fontSize: 44, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bouton: { backgroundColor: Colors.cardActive, borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  boutonTexte: { color: Colors.text, fontWeight: '700' },
  passer: { alignItems: 'center', paddingVertical: Spacing.sm },
  passerTexte: { color: Colors.accent, fontWeight: '600' },
});
