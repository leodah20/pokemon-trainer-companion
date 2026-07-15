import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS, DISPLAY_FONT, Logo, SHADOW } from '../theme';
import { useTranslation } from '../../i18n';
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
  const { t } = useTranslation();

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
          tabBarLabel: t('nav.pokedex'),
          headerTitle: () => <Logo size="sm" color={COLORS.brandGold} />,
        }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsHubScreen}
        options={{ tabBarLabel: t('nav.tools'), headerShown: false }}
      />
      <Tab.Screen
        name="Rankings"
        component={TopRankingsScreen}
        options={{ tabBarLabel: t('nav.rankings'), title: t('nav.rankings') }}
      />
      <Tab.Screen name="Quiz" component={QuizScreen} options={{ tabBarLabel: t('nav.quiz'), title: t('nav.quiz') }} />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: t('nav.more'), headerShown: false }}
      />
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
    backgroundColor: COLORS.glassSurface,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    ...SHADOW.md,
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
