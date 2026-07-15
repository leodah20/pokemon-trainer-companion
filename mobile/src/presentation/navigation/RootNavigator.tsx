import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { COLORS, DISPLAY_FONT, Logo } from '../theme';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { IvCalculatorScreen } from '../screens/IvCalculatorScreen';
import { OverlayDemoScreen } from '../screens/OverlayDemoScreen';
import { PokedexListScreen } from '../screens/PokedexListScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { TopRankingsScreen } from '../screens/TopRankingsScreen';
import { TypeChartScreen } from '../screens/TypeChartScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.brandRed },
        headerTintColor: COLORS.surface,
        headerTitleStyle: { fontFamily: DISPLAY_FONT, fontSize: 16 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Pokedex"
        component={PokedexListScreen}
        options={{
          // The app's brand identity lives here, in the header, instead of a plain "Pokedex" title.
          headerTitle: () => <Logo size="sm" color={COLORS.surface} />,
        }}
      />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="IvCalculator" component={IvCalculatorScreen} options={{ title: 'IV Calculator' }} />
      <Stack.Screen name="OverlayDemo" component={OverlayDemoScreen} options={{ title: 'Overlay Demo' }} />
      <Stack.Screen name="TypeChart" component={TypeChartScreen} options={{ title: 'Type Chart' }} />
      <Stack.Screen name="Comparison" component={ComparisonScreen} options={{ title: 'Compare' }} />
      <Stack.Screen name="TopRankings" component={TopRankingsScreen} options={{ title: 'Top Rankings' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
    </Stack.Navigator>
  );
}
