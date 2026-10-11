// Écran Programme : le programme en cours, semaine par semaine.
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bouton, Card, SousTitre, Texte, Titre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { iaConfiguree } from '@/lib/ai';
import { useApp } from '@/lib/store';
import { cleSeance } from '@/lib/types';

export default function ProgrammeScreen() {
  const { pret, profil, programme, logs, generer, enGeneration, erreurIa } = useApp();
  const [semaine, setSemaine] = useState(1);

  if (!pret) {
    return <ActivityIndicator style={{ flex: 1 }} color={Colors.accent} />;
  }

  if (!programme) {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Titre>{profil.prenom ? `Salut ${profil.prenom} 👋` : 'Bienvenue 👋'}</Titre>
        <Texte secondaire>
          Remplis ton profil puis génère un programme de musculation complet sur plusieurs semaines.
        </Texte>
        <View style={{ height: Spacing.lg }} />
        <Bouton titre="Générer mon programme" onPress={generer} chargement={enGeneration} />
        <Bouton titre="Créer mon programme moi-même" variante="contour" onPress={() => router.push('/programme/editer')} />
        <Bouton titre="Compléter mon profil" variante="contour" onPress={() => router.navigate('/profil')} />
      </ScrollView>
    );
  }

  const semaineCourante = programme.semaines.find((s) => s.numero === semaine) ?? programme.semaines[0];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Titre>{programme.titre}</Titre>
      <Texte secondaire>{programme.description}</Texte>
      <Text style={styles.source}>
        {programme.source === 'ia'
          ? '✨ Généré par l’IA'
          : programme.source === 'perso'
            ? '✍️ Programme personnalisé'
            : iaConfiguree
              ? '⚙️ Généré hors ligne (IA indisponible)'
              : '⚙️ Généré hors ligne'}
      </Text>
      {erreurIa && <Text style={styles.erreur}>{erreurIa}</Text>}

      {/* Sélecteur de semaine, défilant horizontalement */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semaines}>
        {programme.semaines.map((s) => {
          const actif = s.numero === semaineCourante.numero;
          return (
            <Pressable key={s.numero} onPress={() => setSemaine(s.numero)} style={[styles.semaine, actif && styles.semaineActive]}>
              <Text style={[styles.semaineNum, actif && { color: Colors.text }]}>S{s.numero}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SousTitre>
        Semaine {semaineCourante.numero} · {semaineCourante.theme}
      </SousTitre>

      {semaineCourante.sessions.map((seance) => (
        <Link key={seance.jour} href={`/seance/${semaineCourante.numero}/${seance.jour}`} asChild>
          <Pressable>
            <Card>
              <Text style={styles.jour}>Séance {seance.jour}</Text>
              <Text style={styles.seanceNom}>{seance.nom}</Text>
              <Texte secondaire>{seance.focus}</Texte>
              <Text style={styles.meta}>
                {logs[cleSeance(semaineCourante.numero, seance.jour)]?.terminee
                  ? '✅ Faite'
                  : logs[cleSeance(semaineCourante.numero, seance.jour)]?.debut
                    ? '⏳ En cours'
                    : `${seance.exercices.length} exercices`}
                {'  ›'}
              </Text>
            </Card>
          </Pressable>
        </Link>
      ))}

      <Bouton
        titre="Modifier le programme"
        onPress={() => router.push({ pathname: '/programme/editer', params: { mode: 'modifier' } })}
      />
      <Bouton titre="Créer mon propre programme" variante="contour" onPress={() => router.push('/programme/editer')} />
      <Bouton titre="Régénérer automatiquement" variante="contour" onPress={generer} chargement={enGeneration} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  source: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.sm },
  erreur: { color: Colors.accent, fontSize: 12, marginTop: Spacing.xs },
  semaines: { gap: Spacing.sm, paddingVertical: Spacing.md },
  semaine: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  semaineActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  semaineNum: { color: Colors.textSecondary, fontWeight: '700' },
  jour: { color: Colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  seanceNom: { color: Colors.text, fontSize: 18, fontWeight: '700', marginVertical: 2 },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.sm },
});
