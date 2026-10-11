// Écran Profil : les informations utilisées pour construire le programme.
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, Text, View } from 'react-native';

import { Bouton, Card, Choix, Compteur, SousTitre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useApp } from '@/lib/store';
import { MATERIEL_LABELS, NIVEAU_LABELS, OBJECTIF_LABELS, type Profile } from '@/lib/types';

export default function ProfilScreen() {
  const { profil, majProfil, generer, enGeneration } = useApp();

  // Met à jour un seul champ du profil (et le sauvegarde).
  function maj<K extends keyof Profile>(cle: K, valeur: Profile[K]) {
    majProfil({ ...profil, [cle]: valeur });
  }

  async function genererEtVoir() {
    await generer();
    router.navigate('/');
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card>
        <SousTitre>Toi</SousTitre>
        <View style={styles.champ}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            value={profil.prenom}
            onChangeText={(v) => maj('prenom', v)}
            placeholder="Ton prénom"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
          />
        </View>
        <Choix label="Sexe" valeur={profil.sexe} options={{ homme: 'Homme', femme: 'Femme' }} onChange={(v) => maj('sexe', v)} />
        <Compteur label="Âge" valeur={profil.age} min={14} max={80} unite="ans" onChange={(v) => maj('age', v)} />
        <Compteur label="Poids" valeur={profil.poids} min={35} max={200} unite="kg" onChange={(v) => maj('poids', v)} />
        <Compteur label="Taille" valeur={profil.taille} min={130} max={220} unite="cm" onChange={(v) => maj('taille', v)} />
      </Card>

      <Card>
        <SousTitre>Entraînement</SousTitre>
        <Choix label="Niveau" valeur={profil.niveau} options={NIVEAU_LABELS} onChange={(v) => maj('niveau', v)} />
        <Choix label="Objectif" valeur={profil.objectif} options={OBJECTIF_LABELS} onChange={(v) => maj('objectif', v)} />
        <Choix label="Matériel" valeur={profil.materiel} options={MATERIEL_LABELS} onChange={(v) => maj('materiel', v)} />
        <Compteur label="Séances / semaine" valeur={profil.joursParSemaine} min={2} max={6} onChange={(v) => maj('joursParSemaine', v)} />
        <Compteur label="Durée séance" valeur={profil.dureeSeance} min={30} max={120} pas={15} unite="min" onChange={(v) => maj('dureeSeance', v)} />
        <Compteur label="Durée programme" valeur={profil.semaines} min={4} max={16} unite="sem." onChange={(v) => maj('semaines', v)} />
        <View style={styles.champ}>
          <Text style={styles.label}>Blessures ou préférences</Text>
          <TextInput
            value={profil.notes}
            onChangeText={(v) => maj('notes', v)}
            placeholder="Ex : genou fragile, pas de soulevé de terre..."
            placeholderTextColor={Colors.textSecondary}
            style={[styles.input, { minHeight: 70 }]}
            multiline
          />
        </View>
      </Card>

      <Bouton titre="Générer mon programme" onPress={genererEtVoir} chargement={enGeneration} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  champ: { marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.cardActive,
    color: Colors.text,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
});
