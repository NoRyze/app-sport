// Point d'entrée de la navigation : une pile d'écrans (Stack) qui contient
// les onglets, plus l'écran de détail d'une séance par-dessus.
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { AppProvider } from '@/lib/store';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Colors.background, card: Colors.background, primary: Colors.accent },
};

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerTintColor: Colors.text, headerStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="seance/[semaine]/[jour]" options={{ title: 'Séance', headerBackTitle: 'Programme' }} />
          <Stack.Screen name="programme/editer" options={{ title: 'Programme', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="exercice/[nom]" options={{ title: 'Fiche exercice', headerBackTitle: 'Séance' }} />
        </Stack>
      </ThemeProvider>
    </AppProvider>
  );
}
