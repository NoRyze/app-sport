// Signaux du chrono : un bip sur le web (et la web app iPhone),
// une vibration dans l'app native.
import { Platform, Vibration } from 'react-native';

let contexte: AudioContext | null = null;

// Sur iPhone, le son ne peut démarrer qu'après un appui de l'utilisateur :
// on appelle cette fonction quand il appuie sur "Démarrer".
export function preparerSon() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (!contexte) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) contexte = new Ctx();
  }
  contexte?.resume().catch(() => {});
}

export function bip(long = false) {
  if (Platform.OS !== 'web') {
    Vibration.vibrate(long ? 600 : 150);
    return;
  }
  if (!contexte) return;
  const oscillateur = contexte.createOscillator();
  const volume = contexte.createGain();
  oscillateur.frequency.value = long ? 880 : 660;
  volume.gain.value = 0.3;
  oscillateur.connect(volume).connect(contexte.destination);
  oscillateur.start();
  oscillateur.stop(contexte.currentTime + (long ? 0.6 : 0.15));
}
