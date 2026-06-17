import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import { AppProvider } from '../context/AppContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function AppStack() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="modals/add-expense" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modals/add-goal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modals/allocate-goal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modals/new-month" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modals/month-recap" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modals/customize-month" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modals/manage-goals" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <AppProvider>
        <Head>
          <title>Flo — Gestion de budget</title>
          <meta name="description" content="Gérez vos dépenses et atteignez vos objectifs d'épargne." />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#4F46E5" />
          <link rel="apple-touch-icon" href="/icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Flo" />
        </Head>
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <View style={{ width: '100%', maxWidth: 390, flex: 1 }}>
            <AppStack />
          </View>
        </View>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <AppStack />
    </AppProvider>
  );
}
