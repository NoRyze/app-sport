// Fiche d'un exercice : images de départ et d'arrivée, matériel, bonne position.
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, SousTitre, Texte, Titre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ficheExercice, imagesExercice } from '@/lib/exercices';

export default function ExerciceScreen() {
  const { nom } = useLocalSearchParams<{ nom: string }>();
  const fiche = ficheExercice(nom);
  const images = fiche ? imagesExercice(fiche) : [];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: 'Fiche exercice' }} />
      <Titre>{nom}</Titre>

      {images.length > 0 && (
        <View style={styles.images}>
          {images.map((uri, i) => (
            <View key={uri} style={styles.imageBloc}>
              <Image source={{ uri }} style={styles.image} contentFit="cover" transition={200} />
              <Text style={styles.legende}>{i === 0 ? 'Départ' : 'Arrivée'}</Text>
            </View>
          ))}
        </View>
      )}

      {fiche ? (
        <>
          <Card>
            <Text style={styles.label}>Matériel</Text>
            <Texte>{fiche.materiel}</Texte>
            <View style={{ height: Spacing.md }} />
            <Text style={styles.label}>Muscles travaillés</Text>
            <Texte>{fiche.muscles}</Texte>
          </Card>
          <Card>
            <SousTitre>Bonne position</SousTitre>
            {fiche.position.map((etape, i) => (
              <View key={i} style={styles.etape}>
                <Text style={styles.numero}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Texte>{etape}</Texte>
                </View>
              </View>
            ))}
          </Card>
          {images.length > 0 && <Text style={styles.credit}>Images : Free Exercise DB (domaine public)</Text>}
        </>
      ) : (
        <Texte secondaire>Pas encore de fiche pour cet exercice.</Texte>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  images: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.md },
  imageBloc: { flex: 1 },
  image: { width: '100%', aspectRatio: 0.85, borderRadius: Radius.md, backgroundColor: Colors.cardActive },
  legende: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4, fontWeight: '600' },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  etape: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  numero: {
    color: Colors.background,
    backgroundColor: Colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '800',
    fontSize: 12,
    overflow: 'hidden',
  },
  credit: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center' },
});
