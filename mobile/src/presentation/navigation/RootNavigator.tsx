import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { COLORS, DISPLAY_FONT } from '../theme';
import { IvCalculatorScreen } from '../screens/IvCalculatorScreen';
import { PokedexListScreen } from '../screens/PokedexListScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
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
      <Stack.Screen name="Pokedex" component={PokedexListScreen} options={{ title: 'Pokedex' }} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="IvCalculator" component={IvCalculatorScreen} options={{ title: 'IV Calculator' }} />
    </Stack.Navigator>
  );
}
