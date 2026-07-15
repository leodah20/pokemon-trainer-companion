/**
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { CompanionWidget } from './src/presentation/components/CompanionWidget';
import { LanguageProvider } from './src/i18n';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <CompanionWidget />
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

export default App;
