import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/** Root-level stack: the tab navigator plus "detail/tool" screens pushed full-screen over the
 * tab bar, reachable from any tab (navigate() bubbles up through the tab navigator automatically). */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  PokemonDetail: { speciesId: number };
  IvCalculator: { speciesId?: number } | undefined;
  Comparison: undefined;
  TypeChart: undefined;
  RaidCounters: undefined;
  EvolutionChain: { speciesId: number };
  OverlayDemo: undefined;
};

/** The 5 bottom-tab destinations. Each is a leaf screen — deeper navigation (detail, tools)
 * happens on RootStackParamList, not nested per-tab stacks, so any tab can reach any tool. */
export type TabParamList = {
  Pokedex: { pickerMode?: boolean } | undefined;
  Tools: undefined;
  Rankings: undefined;
  Quiz: undefined;
  More: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type TabScreenProps<Screen extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
