import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DataProvider } from "@/lib/data-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="booking-detail" options={{ headerShown: false }} />
      <Stack.Screen name="add-booking" options={{ headerShown: false }} />
      <Stack.Screen name="add-client" options={{ headerShown: false }} />
      <Stack.Screen name="add-expense" options={{ headerShown: false }} />
      <Stack.Screen name="add-vendor" options={{ headerShown: false }} />
      <Stack.Screen name="add-task" options={{ headerShown: false }} />
      <Stack.Screen name="add-itinerary" options={{ headerShown: false }} />
      <Stack.Screen name="itinerary-detail" options={{ headerShown: false }} />
      <Stack.Screen name="add-pricing" options={{ headerShown: false }} />
      <Stack.Screen name="pricing-detail" options={{ headerShown: false }} />
      <Stack.Screen name="invoice-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </DataProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
