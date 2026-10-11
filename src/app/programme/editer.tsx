// Éditeur de programme : crée ta propre programmation ou modifie celle
// qui a été générée. Tu construis une semaine type (séances + exercices),
// et l'app la répète sur le nombre de semaines choisi.
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton, Card, Choix, Compteur, Texte } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FICHES, GROUPES } from '@/lib/exercices';
import { construireDepuisModele } from '@/lib/generator';
import { useApp } from '@/lib/store';
import type { Exercise, ModeleProgramme, Session } from '@/lib/types';

const nouvelleSeance = (n: number): Session => ({ jour: n, nom: `Séance ${n}`, focus: '', exercices: [] });

const nouvelExercice = (nom: string): Exercise => ({ nom, series: 3, reps: '8-12', repos: 90, intensite: 'RPE 8' });

// Déplace un élément d'un tableau (pour monter / descendre un exercice).
function deplacer<T>(liste: T[], de: number, vers: number) {
  if (vers < 0 || vers >= liste.length) return liste;
  const copie = [...liste];
  const [el] = copie.splice(de, 1);
  copie.splice(vers, 0, el);
  return copie;
}

export default function EditeurScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { programme, logs, profil, enregistrerProgramme } = useApp();
  const modification = mode === 'modifier' && programme != null;

  // Brouillon de départ : le programme actuel (semaine 1) ou une page vierge.
  const [modele, setModele] = useState<ModeleProgramme>(() =>
    modification
      ? {
          titre: programme!.titre,
          semaines: programme!.semaines.length,
          progression: 'auto',
          seances: programme!.semaines[0].sessions.map((s) => ({ ...s, exercices: s.exercices.map((e) => ({ ...e })) })),
        }
      : {
          titre: 'Mon programme',
          semaines: 8,
          progression: 'auto',
          seances: Array.from({ length: profil.joursParSemaine }, (_, i) => nouvelleSeance(i + 1)),
        },
  );
  const [choixPour, setChoixPour] = useState<number | null>(null); // index de la séance qui reçoit un exercice

  // Semaines où au moins une séance a été remplie : on ne les touche pas.
  const semainesCommencees = useMemo(
    () => new Set(Object.entries(logs).filter(([, l]) => l.debut).map(([cle]) => Number(cle.split('-')[0]))),
    [logs],
  );

  function majSeance(i: number, modif: Partial<Session>) {
    setModele((m) => ({ ...m, seances: m.seances.map((s, j) => (j === i ? { ...s, ...modif } : s)) }));
  }

  function majExercice(i: number, k: number, modif: Partial<Exercise>) {
    const seance = modele.seances[i];
    majSeance(i, { exercices: seance.exercices.map((e, j) => (j === k ? { ...e, ...modif } : e)) });
  }

  async function enregistrer() {
    const vides = modele.seances.filter((s) => s.exercices.length === 0);
    if (modele.seances.length === 0 || vides.length === modele.seances.length) return;
    const modeleNettoye = { ...modele, seances: modele.seances.filter((s) => s.exercices.length > 0) };
    const resultat = construireDepuisModele(
      modeleNettoye,
      modification ? programme! : undefined,
      modification ? semainesCommencees : undefined,
    );
    await enregistrerProgramme(resultat, !modification);
    router.back();
  }

  const peutEnregistrer = modele.seances.some((s) => s.exercices.length > 0);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: modification ? 'Modifier le programme' : 'Créer mon programme' }} />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.label}>Nom du programme</Text>
          <TextInput
            value={modele.titre}
            onChangeText={(titre) => setModele({ ...modele, titre })}
            style={styles.input}
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={{ height: Spacing.md }} />
          <Compteur
            label="Durée"
            valeur={modele.semaines}
            min={1}
            max={16}
            unite="sem."
            onChange={(semaines) => setModele({ ...modele, semaines })}
          />
          <Choix
            label="Progression"
            valeur={modele.progression}
            options={{ auto: 'Automatique', fixe: 'Identique chaque semaine' }}
            onChange={(progression) => setModele({ ...modele, progression })}
          />
          <Texte secondaire>
            {modele.progression === 'auto'
              ? 'L’effort monte de semaine en semaine, avec une semaine plus légère toutes les 4 semaines.'
              : 'Chaque semaine reprend exactement ta semaine type.'}
          </Texte>
          {modification && semainesCommencees.size > 0 && (
            <Text style={styles.info}>
              Les semaines déjà commencées ({[...semainesCommencees].sort((a, b) => a - b).map((n) => `S${n}`).join(', ')}) ne
              seront pas modifiées.
            </Text>
          )}
        </Card>

        {modele.seances.map((seance, i) => (
          <Card key={i}>
            <View style={styles.enteteSeance}>
              <TextInput
                value={seance.nom}
                onChangeText={(nom) => majSeance(i, { nom })}
                style={[styles.input, styles.nomSeance]}
                placeholder={`Séance ${i + 1}`}
                placeholderTextColor={Colors.textSecondary}
              />
              <Pressable
                onPress={() => setModele({ ...modele, seances: modele.seances.filter((_, j) => j !== i) })}
                hitSlop={8}>
                <Text style={styles.supprimer}>Supprimer</Text>
              </Pressable>
            </View>
            <TextInput
              value={seance.focus}
              onChangeText={(focus) => majSeance(i, { focus })}
              style={[styles.input, { marginTop: Spacing.sm, fontSize: 14 }]}
              placeholder="Focus (ex : Pectoraux, triceps)"
              placeholderTextColor={Colors.textSecondary}
            />

            {seance.exercices.map((ex, k) => (
              <View key={`${ex.nom}-${k}`} style={styles.exercice}>
                <View style={styles.exerciceEntete}>
                  <Text style={styles.exerciceNom}>{ex.nom}</Text>
                  <Pressable onPress={() => majSeance(i, { exercices: deplacer(seance.exercices, k, k - 1) })} hitSlop={6}>
                    <Text style={styles.icone}>↑</Text>
                  </Pressable>
                  <Pressable onPress={() => majSeance(i, { exercices: deplacer(seance.exercices, k, k + 1) })} hitSlop={6}>
                    <Text style={styles.icone}>↓</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => majSeance(i, { exercices: seance.exercices.filter((_, j) => j !== k) })}
                    hitSlop={6}>
                    <Text style={styles.icone}>✕</Text>
                  </Pressable>
                </View>
                <Compteur label="Séries" valeur={ex.series} min={1} max={10} onChange={(series) => majExercice(i, k, { series })} />
                <View style={styles.ligneReps}>
                  <Text style={[styles.label, { marginBottom: 0, flex: 1 }]}>Reps</Text>
                  <TextInput
                    value={ex.reps}
                    onChangeText={(reps) => majExercice(i, k, { reps })}
                    style={[styles.input, styles.inputReps]}
                    placeholder="8-12"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <Compteur
                  label="Repos"
                  valeur={ex.repos}
                  min={15}
                  max={300}
                  pas={15}
                  unite="s"
                  onChange={(repos) => majExercice(i, k, { repos })}
                />
              </View>
            ))}

            <Pressable onPress={() => setChoixPour(i)} style={styles.ajouter}>
              <Text style={styles.ajouterTexte}>+ Ajouter un exercice</Text>
            </Pressable>
          </Card>
        ))}

        <Bouton
          titre="+ Ajouter une séance"
          variante="contour"
          onPress={() => setModele({ ...modele, seances: [...modele.seances, nouvelleSeance(modele.seances.length + 1)] })}
        />
        {peutEnregistrer ? (
          <Bouton titre={modification ? 'Enregistrer les modifications' : 'Créer le programme'} onPress={enregistrer} />
        ) : (
          <Texte secondaire>Ajoute au moins un exercice pour enregistrer.</Texte>
        )}
      </ScrollView>

      <ChoixExercice
        visible={choixPour !== null}
        onFermer={() => setChoixPour(null)}
        onChoisir={(nom) => {
          if (choixPour === null) return;
          majSeance(choixPour, { exercices: [...modele.seances[choixPour].exercices, nouvelExercice(nom)] });
          setChoixPour(null);
        }}
      />
    </View>
  );
}

// Fenêtre de choix d'un exercice : recherche dans la bibliothèque, classée
// par groupe musculaire, ou saisie d'un exercice libre.
function ChoixExercice({
  visible,
  onFermer,
  onChoisir,
}: {
  visible: boolean;
  onFermer: () => void;
  onChoisir: (nom: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [recherche, setRecherche] = useState('');

  const sections = useMemo(() => {
    const filtre = recherche
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return GROUPES.map((groupe) => ({
      title: groupe,
      data: Object.entries(FICHES)
        .filter(([, f]) => f.groupe === groupe)
        .map(([nom, f]) => ({ nom, materiel: f.materiel }))
        .filter((e) =>
          `${e.nom} ${e.materiel}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .includes(filtre),
        ),
    })).filter((s) => s.data.length > 0);
  }, [recherche]);

  function choisir(nom: string) {
    setRecherche('');
    onChoisir(nom);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onFermer}>
      <View style={[styles.modal, { paddingTop: Spacing.md, paddingBottom: insets.bottom }]}>
        <View style={styles.modalEntete}>
          <Text style={styles.modalTitre}>Choisir un exercice</Text>
          <Pressable onPress={onFermer} hitSlop={8}>
            <Text style={styles.ajouterTexte}>Fermer</Text>
          </Pressable>
        </View>
        <TextInput
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Rechercher (ex : squat, haltères, dos…)"
          placeholderTextColor={Colors.textSecondary}
          style={[styles.input, { marginHorizontal: Spacing.md }]}
          autoFocus
        />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.nom}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: Spacing.md }}
          renderSectionHeader={({ section }) => <Text style={styles.groupe}>{section.title}</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => choisir(item.nom)} style={styles.choix}>
              <Text style={styles.exerciceNom}>{item.nom}</Text>
              <Text style={styles.materiel}>{item.materiel}</Text>
            </Pressable>
          )}
          ListFooterComponent={
            recherche.trim() ? (
              <Pressable onPress={() => choisir(recherche.trim())} style={[styles.choix, { borderColor: Colors.accent }]}>
                <Text style={styles.exerciceNom}>+ Ajouter « {recherche.trim()} »</Text>
                <Text style={styles.materiel}>Exercice libre (sans fiche ni images)</Text>
              </Pressable>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl * 2 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.cardActive,
    color: Colors.text,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
  info: { color: Colors.accent, fontSize: 13, marginTop: Spacing.sm },
  enteteSeance: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nomSeance: { flex: 1, minWidth: 0, fontWeight: '700', fontSize: 17 },
  supprimer: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  exercice: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  exerciceEntete: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  exerciceNom: { color: Colors.text, fontWeight: '700', fontSize: 15, flex: 1 },
  icone: { color: Colors.textSecondary, fontSize: 18, fontWeight: '700', paddingHorizontal: 2 },
  ligneReps: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.md },
  inputReps: { width: 110, textAlign: 'center', fontWeight: '700' },
  ajouter: { alignItems: 'center', paddingTop: Spacing.md },
  ajouterTexte: { color: Colors.accent, fontWeight: '700', fontSize: 15 },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalTitre: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  groupe: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  choix: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  materiel: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
});
