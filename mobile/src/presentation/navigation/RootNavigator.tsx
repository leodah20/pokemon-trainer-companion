import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { COLORS, PIXEL_FONT } from '../theme';
import { IvCalculatorScreen } from '../screens/IvCalculatorScreen';
import { PokedexListScreen } from '../screens/PokedexListScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.pokedexRed },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontFamily: PIXEL_FONT, fontSize: 12 },
      }}
    >
      <Stack.Screen name="Pokedex" component={PokedexListScreen} options={{ title: 'Pokedex' }} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="IvCalculator" component={IvCalculatorScreen} options={{ title: 'IV Calculator' }} />
    </Stack.Navigator>
  );
}
