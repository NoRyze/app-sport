// Onglet Bilan : où tu en es sur le programme (régularité, charges, corps).
// Il devient le "bilan final" quand la dernière semaine est faite.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Barres } from '@/components/barres';
import { Card, SousTitre, Texte, Titre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { calculerBilan, formatDuree, formatTonnage } from '@/lib/stats';
import { useApp } from '@/lib/store';
import { MENSURATIONS, cleSeance, type Mensuration, type Objectif } from '@/lib/types';

const fmt = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const pct = (debut: number, fin: number) => (debut > 0 ? Math.round(((fin - debut) / debut) * 100) : 0);

// Une évolution est "positive" selon l'objectif : en sèche on veut perdre du poids,
// en prise de masse en gagner. Le tour de taille et la masse grasse : on veut baisser.
function sensPositif(cle: Mensuration, objectif: Objectif): 1 | -1 {
  if (cle === 'taille' || cle === 'masseGrasse') return -1;
  if (cle === 'poids') return objectif === 'seche' ? -1 : 1;
  return 1;
}

export default function BilanScreen() {
  const { programme, logs, mesures, profil } = useApp();

  if (!programme) {
    return (
      <View style={styles.page}>
        <Texte secondaire>Génère un programme pour voir ton bilan.</Texte>
      </View>
    );
  }

  const bilan = calculerBilan(programme, logs, profil.poids);
  const derniereSemaine = programme.semaines[programme.semaines.length - 1];
  const final = derniereSemaine.sessions.every((s) => logs[cleSeance(derniereSemaine.numero, s.jour)]?.terminee);
  const assiduite = Math.round((bilan.seancesFaites / Math.max(1, bilan.seancesPrevues)) * 100);
  // La progression n'a de sens que pour les exercices faits au moins 2 fois.
  const comparables = bilan.progression.filter((p) => p.seances >= 2);
  const gainMoyen = comparables.length
    ? Math.round(comparables.reduce((n, p) => n + pct(p.debut, p.fin), 0) / comparables.length)
    : null;

  const premiere = mesures.find((m) => Date.parse(m.date) >= Date.parse(programme.createdAt) - 7 * 864e5) ?? mesures[0];
  const derniere = mesures[mesures.length - 1];
  const evolutions =
    premiere && derniere && premiere !== derniere
      ? MENSURATIONS.filter((m) => premiere.valeurs[m.cle] != null && derniere.valeurs[m.cle] != null).map((m) => ({
          ...m,
          debut: premiere.valeurs[m.cle]!,
          fin: derniere.valeurs[m.cle]!,
        }))
      : [];

  // Résumé écrit automatiquement.
  const phrases = [
    `Tu as fait ${bilan.seancesFaites} séance${bilan.seancesFaites > 1 ? 's' : ''} sur ${bilan.seancesPrevues} (${assiduite} %).`,
  ];
  if (gainMoyen == null && bilan.seancesFaites > 0)
    phrases.push('Ta progression de force apparaîtra quand tu auras refait les mêmes exercices.');
  if (gainMoyen != null) phrases.push(`Ta force estimée a évolué de ${gainMoyen >= 0 ? '+' : ''}${gainMoyen} % en moyenne sur tes exercices.`);
  const bras = evolutions.find((e) => e.cle === 'bras');
  if (bras && bras.fin !== bras.debut) phrases.push(`Tour de bras : ${bras.fin > bras.debut ? '+' : ''}${fmt(bras.fin - bras.debut)} cm.`);
  const poids = evolutions.find((e) => e.cle === 'poids');
  if (poids && poids.fin !== poids.debut) phrases.push(`Poids : ${poids.fin > poids.debut ? '+' : ''}${fmt(poids.fin - poids.debut)} kg.`);
  if (bilan.seancesFaites === 0) phrases.push('Valide tes séries pendant les séances pour remplir ce bilan.');

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.badge}>{final ? '🏁 Bilan final' : '📈 Bilan en cours'}</Text>
      <Titre>{programme.titre}</Titre>
      <Card>
        {phrases.map((p, i) => (
          <Texte key={i}>{p}</Texte>
        ))}
      </Card>

      <View style={styles.grille}>
        <Stat label="Séances" valeur={`${bilan.seancesFaites}/${bilan.seancesPrevues}`} />
        <Stat label="Tonnage total" valeur={formatTonnage(bilan.tonnageTotal)} />
        <Stat label="Temps total" valeur={formatDuree(bilan.minutesTotal)} />
        <Stat label="Calories (estim.)" valeur={`${bilan.caloriesTotal.toLocaleString('fr-FR')} kcal`} />
      </View>

      <Card>
        <SousTitre>Tonnage par semaine</SousTitre>
        <Barres
          donnees={bilan.tonnageParSemaine.map((s) => ({ label: `S${s.semaine}`, valeur: s.tonnage }))}
          format={(v) => (v >= 1000 ? `${fmt(v / 1000)}t` : String(v))}
        />
      </Card>

      <Card>
        <SousTitre>Progression des charges</SousTitre>
        {bilan.progression.length === 0 ? (
          <Texte secondaire>Pas encore de données : valide des séries avec leur charge.</Texte>
        ) : (
          <>
            <Text style={styles.note}>Force estimée (1RM) : charge max théorique pour 1 répétition.</Text>
            {bilan.progression.map((p) => {
              const gain = p.seances >= 2 ? pct(p.debut, p.fin) : 0;
              return (
                <View key={p.nom} style={styles.ligne}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ligneNom}>{p.nom}</Text>
                    <Text style={styles.note}>
                      {p.debut} → {p.fin} kg · record {p.record} kg
                    </Text>
                  </View>
                  <Text style={[styles.gain, { color: gain > 0 ? Colors.success : gain < 0 ? Colors.accent : Colors.textSecondary }]}>
                    {p.seances < 2 ? 'nouveau' : `${gain > 0 ? '+' : ''}${gain} %`}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </Card>

      <Card>
        <SousTitre>Développement du corps</SousTitre>
        {evolutions.length === 0 ? (
          <Texte secondaire>Ajoute au moins deux mesures dans l’onglet Corps (début et fin de programme) pour voir l’évolution.</Texte>
        ) : (
          evolutions.map((e) => {
            const ecart = e.fin - e.debut;
            const bon = ecart * sensPositif(e.cle, profil.objectif) > 0;
            return (
              <View key={e.cle} style={styles.ligne}>
                <Text style={[styles.ligneNom, { flex: 1, fontWeight: '500' }]}>{e.label}</Text>
                <Text style={styles.note}>
                  {fmt(e.debut)} → {fmt(e.fin)} {e.unite}
                </Text>
                <Text style={[styles.gain, { color: ecart === 0 ? Colors.textSecondary : bon ? Colors.success : Colors.accent }]}>
                  {ecart > 0 ? '+' : ''}
                  {fmt(ecart)}
                </Text>
              </View>
            );
          })
        )}
      </Card>
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
  badge: { color: Colors.accent, fontWeight: '800', fontSize: 13, textTransform: 'uppercase', marginBottom: 4 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  statValeur: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2, fontWeight: '600' },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  ligneNom: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  gain: { width: 64, textAlign: 'right', fontWeight: '800' },
  note: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
});
