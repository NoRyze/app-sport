// Sauvegarde locale sur le téléphone (AsyncStorage = petit stockage clé/valeur).
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PROFILE, type Profile, type Program } from './types';

const PROFILE_KEY = 'profile';
const PROGRAM_KEY = 'program';

async function read<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function loadProfile(): Promise<Profile> {
  const saved = await read<Partial<Profile>>(PROFILE_KEY);
  return { ...DEFAULT_PROFILE, ...saved };
}

export async function saveProfile(profile: Profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProgram(): Promise<Program | null> {
  return read<Program>(PROGRAM_KEY);
}

export async function saveProgram(program: Program) {
  await AsyncStorage.setItem(PROGRAM_KEY, JSON.stringify(program));
}
