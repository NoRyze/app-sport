// Onglet CrossFit : le programme CrossFit semaine par semaine, et les records.
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bouton, Card, SousTitre, Texte, Titre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FORMAT_EXPLICATIONS, FORMAT_LABELS, cleSeanceCF, recordsCF, scoreTexte, type FormatWod } from '@/lib/crossfit';
import { useApp } from '@/lib/store';

export default function CrossfitScreen() {
  const { pret, profil, programmeCF, logsCF, genererCF } = useApp();
  const [semaine, setSemaine] = useState(1);
  const [enCours, setEnCours] = useState(false);

  async function generer() {
    setEnCours(true);
    try {
      await genererCF();
      setSemaine(1);
    } finally {
      setEnCours(false);
    }
  }

  if (!pret) return <ActivityIndicator style={{ flex: 1 }} color={Colors.accent} />;

  if (!programmeCF) {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Titre>CrossFit 🔥</Titre>
        <Texte secondaire>
          Un programme sur {profil.semaines} semaines adapté à ton profil : un bloc force puis un WOD à chaque séance,
          avec des benchmarks pour mesurer tes progrès.
        </Texte>
        <View style={{ height: Spacing.md }} />
        <Card>
          <SousTitre>Les formats de WOD</SousTitre>
          {(Object.keys(FORMAT_LABELS) as FormatWod[]).map((f) => (
            <View key={f} style={{ marginBottom: Spacing.sm }}>
              <Text style={styles.format}>{FORMAT_LABELS[f]}</Text>
              <Texte secondaire>{FORMAT_EXPLICATIONS[f]}</Texte>
            </View>
          ))}
          <Text style={styles.note}>RX = charges officielles du WOD. Scaled = version allégée, parfaite pour progresser.</Text>
        </Card>
        <Bouton titre="Générer mon programme CrossFit" onPress={generer} chargement={enCours} />
        <Bouton titre="Chrono WOD libre" variante="contour" onPress={() => router.push('/crossfit/chrono')} />
        <Bouton titre="Ajuster mon profil (matériel, niveau…)" variante="contour" onPress={() => router.navigate('/profil')} />
      </ScrollView>
    );
  }

  const semaineCourante = programmeCF.semaines.find((s) => s.numero === semaine) ?? programmeCF.semaines[0];
  const records = recordsCF(programmeCF, logsCF);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Titre>{programmeCF.titre}</Titre>
      <Texte secondaire>{programmeCF.description}</Texte>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semaines}>
        {programmeCF.semaines.map((s) => {
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

      {semaineCourante.seances.map((seance) => {
        const log = logsCF[cleSeanceCF(semaineCourante.numero, seance.jour)];
        return (
          <Link key={seance.jour} href={`/crossfit/${semaineCourante.numero}/${seance.jour}`} asChild>
            <Pressable>
              <Card>
                <Text style={styles.jour}>
                  Séance {seance.jour} · {FORMAT_LABELS[seance.wod.format]}
                </Text>
                <Text style={styles.seanceNom}>
                  {seance.wod.benchmark ? '🏆 ' : ''}
                  {seance.nom}
                </Text>
                <Texte secondaire>
                  {seance.force ? `${seance.force.mouvement} + ` : ''}
                  {seance.wod.mouvements.map((m) => m.nom).join(', ')}
                </Texte>
                <Text style={styles.meta}>
                  {log?.terminee ? `✅ ${scoreTexte(seance.wod, log)} ${log.rx ? 'RX' : 'Scaled'}` : `${seance.wod.duree} min`}
                  {'  ›'}
                </Text>
              </Card>
            </Pressable>
          </Link>
        );
      })}

      <Card>
        <SousTitre>Mes records</SousTitre>
        {records.benchmarks.length === 0 && records.force.length === 0 ? (
          <Texte secondaire>Enregistre tes scores : tes records sur les benchmarks et les charges apparaîtront ici.</Texte>
        ) : (
          <>
            {records.benchmarks.map((b) => (
              <View key={b.nom} style={styles.ligne}>
                <Text style={[styles.ligneNom, { flex: 1 }]}>🏆 {b.nom}</Text>
                <Text style={styles.ligneValeur}>
                  {b.meilleur.texte} {b.meilleur.rx ? 'RX' : 'Sc.'}
                </Text>
              </View>
            ))}
            {records.force.map((f) => (
              <View key={f.mouvement} style={styles.ligne}>
                <Text style={[styles.ligneNom, { flex: 1 }]}>🏋️ {f.mouvement}</Text>
                <Text style={styles.ligneValeur}>{f.record} kg</Text>
              </View>
            ))}
          </>
        )}
      </Card>

      <Bouton titre="⏱  Chrono WOD libre" onPress={() => router.push('/crossfit/chrono')} />
      <Bouton titre="Générer un nouveau programme" variante="contour" onPress={generer} chargement={enCours} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  format: { color: Colors.accent, fontWeight: '800', fontSize: 14 },
  note: { color: Colors.textSecondary, fontSize: 12, marginTop: Spacing.xs, lineHeight: 17 },
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
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  ligneNom: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  ligneValeur: { color: Colors.success, fontWeight: '800' },
});
