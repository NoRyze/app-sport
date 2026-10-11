// Sauvegarde locale sur le téléphone (AsyncStorage = petit stockage clé/valeur).
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PROFILE, type Mesure, type Profile, type Program, type SeanceLog } from './types';

const PROFILE_KEY = 'profile';
const PROGRAM_KEY = 'program';
const MESURES_KEY = 'mesures';
const logsKey = (programId: string) => `logs:${programId}`;

async function read<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function write(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadProfile(): Promise<Profile> {
  const saved = await read<Partial<Profile>>(PROFILE_KEY);
  return { ...DEFAULT_PROFILE, ...saved };
}

export const saveProfile = (profile: Profile) => write(PROFILE_KEY, profile);

export const loadProgram = () => read<Program>(PROGRAM_KEY);

export const saveProgram = (program: Program) => write(PROGRAM_KEY, program);

// Les séances remplies sont rangées par programme.
export async function loadLogs(programId: string): Promise<Record<string, SeanceLog>> {
  return (await read<Record<string, SeanceLog>>(logsKey(programId))) ?? {};
}

export const saveLogs = (programId: string, logs: Record<string, SeanceLog>) => write(logsKey(programId), logs);

export async function loadMesures(): Promise<Mesure[]> {
  return (await read<Mesure[]>(MESURES_KEY)) ?? [];
}

export const saveMesures = (mesures: Mesure[]) => write(MESURES_KEY, mesures);
