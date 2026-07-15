import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS, DISPLAY_FONT, Logo, SHADOW } from '../theme';
import { MoreScreen } from '../screens/MoreScreen';
import { PokedexListScreen } from '../screens/PokedexListScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ToolsHubScreen } from '../screens/ToolsHubScreen';
import { TopRankingsScreen } from '../screens/TopRankingsScreen';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Pokedex: '📖',
  Tools: '🧮',
  Rankings: '🏆',
  Quiz: '❓',
  More: '☰',
};

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }): React.JSX.Element {
  return <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{symbol}</Text>;
}

export function BottomTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: styles.header,
        headerTintColor: COLORS.surface,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        tabBarActiveTintColor: COLORS.brandRed,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => <TabIcon symbol={TAB_ICONS[route.name]} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Pokedex"
        component={PokedexListScreen}
        options={{
          headerTitle: () => <Logo size="sm" color={COLORS.surface} />,
        }}
      />
      <Tab.Screen name="Tools" component={ToolsHubScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Rankings" component={TopRankingsScreen} options={{ title: 'Top Rankings' }} />
      <Tab.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.brandRed,
  },
  headerTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    ...SHADOW.lg,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
