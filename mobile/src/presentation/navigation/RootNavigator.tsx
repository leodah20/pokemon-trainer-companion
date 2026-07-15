import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { COLORS, DISPLAY_FONT } from '../theme';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { EvolutionChainScreen } from '../screens/EvolutionChainScreen';
import { IvCalculatorScreen } from '../screens/IvCalculatorScreen';
import { OverlayDemoScreen } from '../screens/OverlayDemoScreen';
import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { RaidCountersScreen } from '../screens/RaidCountersScreen';
import { TypeChartScreen } from '../screens/TypeChartScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
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
        // Modern, subtle push-and-fade instead of the platform-default slide — applies to every
        // screen pushed on top of the tab bar (detail screens, tools opened outside their tab).
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="IvCalculator" component={IvCalculatorScreen} options={{ title: 'IV Calculator' }} />
      <Stack.Screen name="Comparison" component={ComparisonScreen} options={{ title: 'Compare' }} />
      <Stack.Screen name="TypeChart" component={TypeChartScreen} options={{ title: 'Type Chart' }} />
      <Stack.Screen name="RaidCounters" component={RaidCountersScreen} options={{ title: 'Raid Counters' }} />
      <Stack.Screen name="EvolutionChain" component={EvolutionChainScreen} options={{ title: 'Evolution Chain' }} />
      <Stack.Screen name="OverlayDemo" component={OverlayDemoScreen} options={{ title: 'Overlay Demo' }} />
    </Stack.Navigator>
  );
}
