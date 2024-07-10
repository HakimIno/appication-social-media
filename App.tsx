import React from 'react'
import Navigation from './src/navigation';
import { useFonts } from 'expo-font';
import { FORNTS } from "./src/constants/fonts"
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Knewave_400Regular } from '@expo-google-fonts/knewave';
import { PottaOne_400Regular } from '@expo-google-fonts/potta-one'
import { AuthProvider } from './src/contexts/auth.context'
import store from './src/redux-store';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
})

export default function App() {
  const [fontsLoaded] = useFonts({
    "LINESeedSansTH_A_Bd": FORNTS.LINESeedSansTH_A_Bd,
    "LINESeedSansTH_A_He": FORNTS.LINESeedSansTH_A_He,
    "LINESeedSansTH_A_Rg": FORNTS.LINESeedSansTH_A_Rg,
    "LINESeedSansTH_A_Th": FORNTS.LINESeedSansTH_A_Th,
    "LINESeedSansTH_A_XBd": FORNTS.LINESeedSansTH_A_XBd,
    "Knewave_400Regular": Knewave_400Regular,
    "PottaOne_400Regular": PottaOne_400Regular
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <Navigation />
            </SafeAreaProvider>
          </GestureHandlerRootView >
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  )
}