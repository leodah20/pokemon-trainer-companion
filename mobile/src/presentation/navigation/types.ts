export type RootStackParamList = {
  Pokedex: { pickerMode?: boolean } | undefined;
  PokemonDetail: { speciesId: number };
  IvCalculator: { speciesId?: number } | undefined;
  OverlayDemo: undefined;
};
