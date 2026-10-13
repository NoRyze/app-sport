// Séance CrossFit : échauffement, bloc force, WOD, puis saisie du score.
import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bouton, Card, Choix, SousTitre, Texte, Titre } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  FORMAT_EXPLICATIONS,
  FORMAT_LABELS,
  RESSENTI_LABELS,
  cleSeanceCF,
  formatTemps,
  recordsCF,
  scoreTexte,
  type Ressenti,
  type SeanceCFLog,
  type Wod,
} from '@/lib/crossfit';
import { useApp } from '@/lib/store';

// Accepte "72,5" comme "72.5"
const lireNombre = (texte: string) => {
  const n = Number(texte.replace(',', '.'));
  return texte.trim() === '' || Number.isNaN(n) ? null : n;
};

export default function SeanceCFScreen() {
  const params = useLocalSearchParams<{ semaine: string; jour: string }>();
  const semaine = Number(params.semaine);
  const jour = Number(params.jour);
  const cle = cleSeanceCF(semaine, jour);
  const { programmeCF, logsCF, majLogCF } = useApp();
  const semaineCF = programmeCF?.semaines.find((s) => s.numero === semaine);
  const seance = semaineCF?.seances.find((s) => s.jour === jour);

  if (!programmeCF || !semaineCF || !seance) {
    return (
      <View style={styles.page}>
        <Texte secondaire>Séance introuvable.</Texte>
      </View>
    );
  }

  const log = logsCF[cle];
  const { wod, force } = seance;

  // Meilleur score précédent sur ce benchmark (dans une autre séance).
  const precedent = wod.benchmark
    ? recordsCF(programmeCF, { ...logsCF, [cle]: { terminee: false, rx: false } }).benchmarks.find((b) => b.nom === wod.nom)?.meilleur
    : undefined;

  // Dernière charge notée sur le même mouvement de force.
  let chargePrecedente: number | null = null;
  for (const s of programmeCF.semaines) {
    for (const se of s.seances) {
      const l = logsCF[cleSeanceCF(s.numero, se.jour)];
      if (cleSeanceCF(s.numero, se.jour) !== cle && se.force?.mouvement === force?.mouvement && l?.chargeForce) {
        if (s.numero < semaine || (s.numero === semaine && se.jour < jour)) chargePrecedente = l.chargeForce;
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: `Semaine ${semaine} · Séance ${jour}` }} />
      <Text style={styles.theme}>{semaineCF.theme}</Text>
      <Titre>{seance.nom}</Titre>
      {log?.terminee && (
        <Text style={styles.fait}>
          ✅ Score enregistré : {scoreTexte(wod, log)} {log.rx ? '(RX)' : '(Scaled)'}
        </Text>
      )}

      <Card>
        <Text style={styles.etape}>1 · Échauffement</Text>
        {seance.echauffement.map((e) => (
          <Text key={e} style={styles.puce}>
            • {e}
          </Text>
        ))}
      </Card>

      {force && (
        <Card>
          <Text style={styles.etape}>2 · Force</Text>
          <Link href={{ pathname: '/exercice/[nom]', params: { nom: force.mouvement } }} asChild>
            <Pressable>
              <Text style={styles.mouvement}>{force.mouvement}</Text>
              <Text style={styles.detail}>
                {force.series} × {force.reps} · {force.intensite}
              </Text>
              <Text style={styles.lien}>Voir la position ›</Text>
            </Pressable>
          </Link>
          {force.charge && (
            <ChampCharge
              valeur={log?.chargeForce ?? null}
              precedente={chargePrecedente}
              onChange={(chargeForce) => majLogCF(cle, (l) => ({ ...l, chargeForce }))}
            />
          )}
        </Card>
      )}

      <Card>
        <Text style={styles.etape}>{force ? '3' : '2'} · WOD</Text>
        <View style={styles.badges}>
          <Text style={styles.badge}>{FORMAT_LABELS[wod.format]}</Text>
          {wod.benchmark && <Text style={[styles.badge, styles.badgeBench]}>🏆 Benchmark</Text>}
          <Text style={styles.badgeGris}>
            {wod.format === 'for_time' ? `Cap ${wod.duree} min` : `${wod.duree} min`}
          </Text>
        </View>
        <Texte>{wod.description}</Texte>
        <Text style={styles.explication}>{FORMAT_EXPLICATIONS[wod.format]}</Text>

        {wod.mouvements.map((m, i) => (
          <Link key={`${m.nom}-${i}`} href={{ pathname: '/exercice/[nom]', params: { nom: m.nom } }} asChild>
            <Pressable style={styles.ligneMvt}>
              <Text style={styles.reps}>{m.reps}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.mouvement}>{m.nom} ›</Text>
                {m.rx && <Text style={styles.detail}>RX : {m.rx}</Text>}
                {m.scaled && <Text style={styles.detail}>Scaled : {m.scaled}</Text>}
              </View>
            </Pressable>
          </Link>
        ))}
        {precedent && (
          <Text style={styles.record}>
            🏆 Ton record : {precedent.texte} {precedent.rx ? '(RX)' : '(Scaled)'} · semaine {precedent.semaine}
          </Text>
        )}
        <Bouton
          titre="⏱  Lancer le chrono"
          onPress={() => router.push({ pathname: '/crossfit/chrono', params: { semaine: String(semaine), jour: String(jour) } })}
        />
      </Card>

      <Card>
        <SousTitre>Mon score</SousTitre>
        {/* La clé recrée le formulaire quand le chrono a rempli le temps ou les rounds. */}
        <FormulaireScore
          key={`${log?.temps}-${log?.rounds}-${log?.cap}`}
          wod={wod}
          log={log}
          onEnregistrer={(score) =>
            majLogCF(cle, (l) => ({ ...l, ...score, terminee: true, date: l.date ?? new Date().toISOString() }))
          }
        />
      </Card>
    </ScrollView>
  );
}

function ChampCharge({
  valeur,
  precedente,
  onChange,
}: {
  valeur: number | null;
  precedente: number | null;
  onChange: (v: number | null) => void;
}) {
  const [texte, setTexte] = useState(valeur?.toString() ?? '');
  return (
    <View style={styles.ligneChamp}>
      <Text style={[styles.detail, { flex: 1 }]}>
        Charge de travail (kg){precedente ? `\nLa dernière fois : ${precedente} kg` : ''}
      </Text>
      <TextInput
        value={texte}
        onChangeText={setTexte}
        onBlur={() => onChange(lireNombre(texte))}
        onEndEditing={() => onChange(lireNombre(texte))}
        keyboardType="decimal-pad"
        placeholder={precedente?.toString() ?? '—'}
        placeholderTextColor={Colors.textSecondary}
        style={[styles.champ, { flex: 0, flexBasis: 'auto', width: 90 }]}
        selectTextOnFocus
      />
    </View>
  );
}

function FormulaireScore({
  wod,
  log,
  onEnregistrer,
}: {
  wod: Wod;
  log?: SeanceCFLog;
  onEnregistrer: (score: Partial<SeanceCFLog>) => void;
}) {
  const [minutes, setMinutes] = useState(log?.temps != null ? String(Math.floor(log.temps / 60)) : '');
  const [secondes, setSecondes] = useState(log?.temps != null ? String(log.temps % 60) : '');
  const [cap, setCap] = useState(log?.cap ?? false);
  const [rounds, setRounds] = useState(log?.rounds?.toString() ?? '');
  const [reps, setReps] = useState(log?.reps?.toString() ?? '');
  const [rx, setRx] = useState<'rx' | 'scaled'>(log ? (log.rx ? 'rx' : 'scaled') : 'scaled');
  const [ressenti, setRessenti] = useState<Ressenti>(log?.ressenti ?? 'ok');
  const [notes, setNotes] = useState(log?.notes ?? '');
  const [message, setMessage] = useState('');

  function enregistrer() {
    const score: Partial<SeanceCFLog> = { rx: rx === 'rx', ressenti, notes: notes.trim() || undefined };
    if (wod.format === 'for_time') {
      if (cap) {
        score.cap = true;
        score.temps = null;
        score.reps = lireNombre(reps) ?? 0;
      } else {
        const t = (lireNombre(minutes) ?? 0) * 60 + (lireNombre(secondes) ?? 0);
        if (t <= 0) return setMessage('Indique ton temps (ou coche « Temps limite atteint »).');
        score.cap = false;
        score.temps = Math.round(t);
        score.reps = null;
      }
    } else if (wod.format === 'amrap') {
      if (lireNombre(rounds) == null && lireNombre(reps) == null) return setMessage('Indique tes rounds et tes reps.');
      score.rounds = lireNombre(rounds) ?? 0;
      score.reps = lireNombre(reps) ?? 0;
    } else {
      if (lireNombre(reps) == null) return setMessage('Indique ton total de reps.');
      score.reps = lireNombre(reps);
    }
    setMessage('');
    onEnregistrer(score);
  }

  return (
    <>
      {wod.format === 'for_time' && (
        <>
          {!cap && (
            <View style={styles.ligneChamp}>
              <Champ label="min" valeur={minutes} onChange={setMinutes} />
              <Text style={styles.deuxPoints}>:</Text>
              <Champ label="s" valeur={secondes} onChange={setSecondes} />
            </View>
          )}
          <Pressable onPress={() => setCap(!cap)} style={styles.caseLigne}>
            <View style={[styles.case, cap && styles.caseCochee]}>{cap && <Text style={styles.coche}>✓</Text>}</View>
            <Text style={styles.detail}>Temps limite atteint ({formatTemps(wod.duree * 60)}) avant la fin</Text>
          </Pressable>
          {cap && (
            <View style={styles.ligneChamp}>
              <Champ label="reps faites au cap" valeur={reps} onChange={setReps} />
            </View>
          )}
        </>
      )}
      {wod.format === 'amrap' && (
        <View style={styles.ligneChamp}>
          <Champ label="rounds" valeur={rounds} onChange={setRounds} />
          <Text style={styles.deuxPoints}>+</Text>
          <Champ label="reps" valeur={reps} onChange={setReps} />
        </View>
      )}
      {(wod.format === 'emom' || wod.format === 'tabata') && (
        <View style={styles.ligneChamp}>
          <Champ label="reps au total" valeur={reps} onChange={setReps} />
        </View>
      )}

      <Choix label="Version" valeur={rx} options={{ rx: 'RX (charges officielles)', scaled: 'Scaled' }} onChange={setRx} />
      <Choix label="Ressenti" valeur={ressenti} options={RESSENTI_LABELS} onChange={setRessenti} />
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (charges utilisées, sensations…)"
        placeholderTextColor={Colors.textSecondary}
        style={[styles.champ, styles.notes]}
        multiline
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Bouton titre={log?.terminee ? 'Mettre à jour mon score' : 'Enregistrer mon score'} onPress={enregistrer} />
    </>
  );
}

function Champ({ label, valeur, onChange }: { label: string; valeur: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flex: 1, flexBasis: 0, minWidth: 0 }}>
      <TextInput
        value={valeur}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={Colors.textSecondary}
        style={styles.champ}
        selectTextOnFocus
      />
      <Text style={styles.champLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: Spacing.md, paddingBottom: Spacing.xl },
  theme: { color: Colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  fait: { color: Colors.success, fontWeight: '700', marginBottom: Spacing.md },
  etape: { color: Colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: Spacing.sm },
  puce: { color: Colors.text, fontSize: 15, lineHeight: 23 },
  mouvement: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  detail: { color: Colors.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 18 },
  lien: { color: Colors.accent, fontSize: 13, fontWeight: '600', marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  badge: {
    color: Colors.text,
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
  },
  badgeBench: { backgroundColor: '#3A3114', borderColor: '#E5B53A' },
  badgeGris: {
    color: Colors.textSecondary,
    backgroundColor: Colors.cardActive,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  explication: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: Spacing.sm, lineHeight: 18 },
  ligneMvt: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  reps: { color: Colors.accent, fontSize: 18, fontWeight: '800', minWidth: 64, textAlign: 'center' },
  record: { color: '#E5B53A', fontWeight: '700', marginTop: Spacing.sm },
  ligneChamp: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginVertical: Spacing.sm },
  champ: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    backgroundColor: Colors.cardActive,
    color: Colors.text,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  champLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 4, textTransform: 'uppercase' },
  deuxPoints: { color: Colors.text, fontSize: 24, fontWeight: '800', paddingTop: 8 },
  caseLigne: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  case: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  caseCochee: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  coche: { color: Colors.text, fontWeight: '800' },
  notes: { textAlign: 'left', fontSize: 15, fontWeight: '500', minHeight: 70, textAlignVertical: 'top', flex: 0, flexBasis: 'auto', marginBottom: Spacing.sm },
  message: { color: Colors.accent, fontWeight: '600' },
});
