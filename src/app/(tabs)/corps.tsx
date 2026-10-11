// Onglet Corps : poids et mensurations, avec l'historique de tes mesures.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Barres } from '@/components/barres';
import { Bouton, Card, SousTitre, Texte } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useApp } from '@/lib/store';
import { MENSURATIONS, type Mensuration, type Mesure } from '@/lib/types';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const formatValeur = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

export default function CorpsScreen() {
  const { mesures, ajouterMesure, supprimerMesure } = useApp();
  const [saisie, setSaisie] = useState<Partial<Record<Mensuration, string>>>({});
  const [ouvert, setOuvert] = useState(mesures.length === 0);

  const premiere = mesures[0];
  const derniere = mesures[mesures.length - 1];
  const historiquePoids = mesures.filter((m) => m.valeurs.poids).slice(-10);

  async function enregistrer() {
    const valeurs: Mesure['valeurs'] = {};
    for (const { cle } of MENSURATIONS) {
      const n = Number((saisie[cle] ?? '').replace(',', '.'));
      if (saisie[cle]?.trim() && !Number.isNaN(n)) valeurs[cle] = n;
    }
    if (Object.keys(valeurs).length === 0) return;
    await ajouterMesure({ id: String(Date.now()), date: new Date().toISOString(), valeurs });
    setSaisie({});
    setOuvert(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {derniere && (
        <Card>
          <SousTitre>Dernières mesures · {formatDate(derniere.date)}</SousTitre>
          {MENSURATIONS.filter((m) => derniere.valeurs[m.cle] != null).map((m) => {
            const valeur = derniere.valeurs[m.cle]!;
            const depart = premiere !== derniere ? premiere.valeurs[m.cle] : undefined;
            const ecart = depart != null ? valeur - depart : 0;
            return (
              <View key={m.cle} style={styles.ligne}>
                <Text style={styles.ligneLabel}>{m.label}</Text>
                <Text style={styles.ligneValeur}>
                  {formatValeur(valeur)} {m.unite}
                </Text>
                <Text style={[styles.ecart, { color: ecart === 0 ? Colors.textSecondary : Colors.text }]}>
                  {depart != null && ecart !== 0 ? `${ecart > 0 ? '+' : ''}${formatValeur(ecart)}` : ''}
                </Text>
              </View>
            );
          })}
          {premiere !== derniere && <Text style={styles.note}>Écart calculé depuis ta première mesure ({formatDate(premiere.date)}).</Text>}
        </Card>
      )}

      {historiquePoids.length > 1 && (
        <Card>
          <SousTitre>Évolution du poids</SousTitre>
          <Barres
            donnees={historiquePoids.map((m) => ({ label: formatDate(m.date), valeur: m.valeurs.poids! }))}
            format={(v) => `${formatValeur(v)}`}
            base={Math.floor(Math.min(...historiquePoids.map((m) => m.valeurs.poids!)) - 2)}
          />
          <Text style={styles.note}>L’axe ne part pas de zéro pour bien voir les variations.</Text>
        </Card>
      )}

      {ouvert ? (
        <Card>
          <SousTitre>Nouvelle mesure</SousTitre>
          <Texte secondaire>Remplis seulement ce que tu veux suivre. Mesure toujours au même moment (le matin à jeun, par exemple).</Texte>
          <View style={{ height: Spacing.md }} />
          {MENSURATIONS.map((m) => (
            <View key={m.cle} style={styles.champLigne}>
              <Text style={styles.champLabel}>{m.label}</Text>
              <TextInput
                value={saisie[m.cle] ?? ''}
                onChangeText={(v) => setSaisie({ ...saisie, [m.cle]: v })}
                keyboardType="decimal-pad"
                placeholder={derniere?.valeurs[m.cle] != null ? formatValeur(derniere.valeurs[m.cle]!) : '—'}
                placeholderTextColor={Colors.textSecondary}
                style={styles.champ}
              />
              <Text style={styles.unite}>{m.unite}</Text>
            </View>
          ))}
          <Bouton titre="Enregistrer la mesure" onPress={enregistrer} />
        </Card>
      ) : (
        <Bouton titre="+ Ajouter une mesure" onPress={() => setOuvert(true)} />
      )}

      {mesures.length > 0 && (
        <Card>
          <SousTitre>Historique</SousTitre>
          {[...mesures].reverse().map((m) => (
            <View key={m.id} style={styles.historique}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ligneValeur}>{formatDate(m.date)}</Text>
                <Text style={styles.note}>
                  {MENSURATIONS.filter((x) => m.valeurs[x.cle] != null)
                    .map((x) => `${x.label} ${formatValeur(m.valeurs[x.cle]!)} ${x.unite}`)
                    .join(' · ')}
                </Text>
              </View>
              <Pressable onPress={() => supprimerMesure(m.id)} hitSlop={8}>
                <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  ligneLabel: { color: Colors.textSecondary, flex: 1, fontSize: 14 },
  ligneValeur: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  ecart: { width: 60, textAlign: 'right', fontWeight: '700', fontSize: 13 },
  note: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 17 },
  champLigne: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  champLabel: { color: Colors.text, flex: 1, fontSize: 14 },
  champ: {
    width: 90,
    backgroundColor: Colors.cardActive,
    color: Colors.text,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  unite: { color: Colors.textSecondary, width: 26, fontSize: 13 },
  historique: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
});
