// Petits composants visuels réutilisés sur tous les écrans.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Titre({ children }: { children: ReactNode }) {
  return <Text style={styles.titre}>{children}</Text>;
}

export function SousTitre({ children }: { children: ReactNode }) {
  return <Text style={styles.sousTitre}>{children}</Text>;
}

export function Texte({ children, secondaire }: { children: ReactNode; secondaire?: boolean }) {
  return <Text style={[styles.texte, secondaire && { color: Colors.textSecondary }]}>{children}</Text>;
}

export function Bouton({
  titre,
  onPress,
  chargement,
  variante = 'plein',
}: {
  titre: string;
  onPress: () => void;
  chargement?: boolean;
  variante?: 'plein' | 'contour';
}) {
  const plein = variante === 'plein';
  return (
    <Pressable
      onPress={onPress}
      disabled={chargement}
      style={({ pressed }) => [styles.bouton, plein ? styles.boutonPlein : styles.boutonContour, pressed && { opacity: 0.8 }]}>
      {chargement ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text style={[styles.boutonTexte, !plein && { color: Colors.accent }]}>{titre}</Text>
      )}
    </Pressable>
  );
}

// Liste de choix sous forme de "pastilles" (une seule sélectionnée).
export function Choix<T extends string>({
  label,
  valeur,
  options,
  onChange,
}: {
  label: string;
  valeur: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pastilles}>
        {(Object.keys(options) as T[]).map((cle) => {
          const actif = cle === valeur;
          return (
            <Pressable key={cle} onPress={() => onChange(cle)} style={[styles.pastille, actif && styles.pastilleActive]}>
              <Text style={[styles.pastilleTexte, actif && { color: Colors.text }]}>{options[cle]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Sélecteur numérique avec boutons - et +.
export function Compteur({
  label,
  valeur,
  onChange,
  min,
  max,
  pas = 1,
  unite = '',
}: {
  label: string;
  valeur: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  pas?: number;
  unite?: string;
}) {
  const changer = (delta: number) => onChange(Math.min(max, Math.max(min, valeur + delta)));
  return (
    <View style={[styles.champ, styles.compteur]}>
      <Text style={[styles.label, { marginBottom: 0, flex: 1 }]}>{label}</Text>
      <Pressable onPress={() => changer(-pas)} style={styles.compteurBouton} hitSlop={8}>
        <Text style={styles.compteurSigne}>−</Text>
      </Pressable>
      <Text style={styles.compteurValeur}>
        {valeur}
        {unite && <Text style={{ color: Colors.textSecondary, fontSize: 14 }}> {unite}</Text>}
      </Text>
      <Pressable onPress={() => changer(pas)} style={styles.compteurBouton} hitSlop={8}>
        <Text style={styles.compteurSigne}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  titre: { color: Colors.text, fontSize: 26, fontWeight: '700', marginBottom: Spacing.xs },
  sousTitre: { color: Colors.text, fontSize: 18, fontWeight: '600', marginBottom: Spacing.sm },
  texte: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  bouton: { borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginVertical: Spacing.sm },
  boutonPlein: { backgroundColor: Colors.accent },
  boutonContour: { borderWidth: 1, borderColor: Colors.accent },
  boutonTexte: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  champ: { marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase' },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pastille: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.cardActive,
    borderWidth: 1,
    borderColor: Colors.cardActive,
  },
  pastilleActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  pastilleTexte: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  compteur: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  compteurBouton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compteurSigne: { color: Colors.text, fontSize: 20, fontWeight: '600' },
  compteurValeur: { color: Colors.text, fontSize: 18, fontWeight: '700', minWidth: 64, textAlign: 'center' },
});
