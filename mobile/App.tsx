/**
 * @format
 */

import { useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { CompanionWidget } from './src/presentation/components/CompanionWidget';
import { ErrorBoundary } from './src/presentation/components/ErrorBoundary';
import { LanguageProvider } from './src/i18n';
import { RootStackParamList } from './src/presentation/navigation/types';

// Screens where the floating Companion widget would just get in the way — right now that's only
// its own full-screen Professor Mode chat (the speech bubble floating over the chat transcript
// was confusing, not charming). Extend this set if another full-screen "AI-forward" screen needs
// the same treatment.
const ROUTES_HIDING_COMPANION_WIDGET = new Set(['ProfessorChat']);

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>();

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <NavigationContainer
            ref={navigationRef}
            onReady={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name)}
            onStateChange={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name)}
          >
            <RootNavigator />
            {/* Rendered inside NavigationContainer (not just SafeAreaProvider) so it can call
                useNavigation() to open the Professor Mode chat screen. */}
            {!ROUTES_HIDING_COMPANION_WIDGET.has(currentRouteName ?? '') && <CompanionWidget />}
          </NavigationContainer>
        </SafeAreaProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
