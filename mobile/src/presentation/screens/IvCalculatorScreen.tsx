import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateIvPercentage, IvCombination } from '../../domain/iv-calculator';
import { getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { calculateIvsForSpecies, UnknownSpeciesError } from '../../use-cases/calculateIvsForSpecies';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SPACING } from '../theme';
import { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'IvCalculator'>;

const DEFAULT_SPECIES_ID = 1; // Bulbasaur
const DEFAULT_MIN_LEVEL = '1';
const DEFAULT_MAX_LEVEL = '40';

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function IvCalculatorScreen({ route, navigation }: Props): React.JSX.Element {
  const [speciesId, setSpeciesId] = useState(route.params?.speciesId ?? DEFAULT_SPECIES_ID);
  const [cpInput, setCpInput] = useState('');
  const [hpInput, setHpInput] = useState('');
  const [minLevelInput, setMinLevelInput] = useState(DEFAULT_MIN_LEVEL);
  const [maxLevelInput, setMaxLevelInput] = useState(DEFAULT_MAX_LEVEL);
  const [results, setResults] = useState<IvCombination[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.speciesId !== undefined) {
      setSpeciesId(route.params.speciesId);
      setResults(null);
      setErrorMessage(null);
    }
  }, [route.params?.speciesId]);

  const species = getSpeciesById(speciesId);

  function handleCalculate(): void {
    const cp = parsePositiveInt(cpInput);
    const hp = parsePositiveInt(hpInput);
    const minLevel = parsePositiveInt(minLevelInput);
    const maxLevel = parsePositiveInt(maxLevelInput);

    if (cp === null || hp === null || minLevel === null || maxLevel === null) {
      setErrorMessage('Enter valid positive whole numbers for CP, HP, and level range.');
      setResults(null);
      return;
    }

    if (minLevel > maxLevel) {
      setErrorMessage('Min level must not be greater than max level.');
      setResults(null);
      return;
    }

    try {
      const matches = calculateIvsForSpecies({
        speciesId,
        observedCp: cp,
        observedHp: hp,
        levelRange: { minLevel, maxLevel },
      });
      setErrorMessage(null);
      setResults(matches);
    } catch (error) {
      if (error instanceof UnknownSpeciesError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Something went wrong calculating IVs.');
      }
      setResults(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={results ?? []}
        keyExtractor={(item, index) => `${item.level}-${item.ivAttack}-${item.ivDefense}-${item.ivStamina}-${index}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.form}>
            <Text style={styles.title}>IV Calculator</Text>

            <Card style={styles.card}>
              <Text style={styles.label}>Species</Text>
              <Pressable
                style={({ pressed }) => [styles.speciesPicker, pressed && styles.pressedOpacity]}
                onPress={() => navigation.navigate('Tabs', { screen: 'Pokedex', params: { pickerMode: true } })}
              >
                {species && (
                  <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.speciesSprite} resizeMode="contain" />
                )}
                <Text style={styles.speciesName}>{species?.name ?? 'Unknown species'}</Text>
                <Text style={styles.changeLabel}>Change</Text>
              </Pressable>

              <Text style={styles.label}>CP</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={cpInput}
                onChangeText={setCpInput}
                placeholder="e.g. 1256"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.label}>HP</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={hpInput}
                onChangeText={setHpInput}
                placeholder="e.g. 111"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.levelRangeRow}>
                <View style={styles.levelRangeField}>
                  <Text style={styles.label}>Min level</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={minLevelInput}
                    onChangeText={setMinLevelInput}
                  />
                </View>
                <View style={styles.levelRangeField}>
                  <Text style={styles.label}>Max level</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={maxLevelInput}
                    onChangeText={setMaxLevelInput}
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.calculateButton, pressed && styles.pressedOpacity]}
                onPress={handleCalculate}
              >
                <Text style={styles.calculateButtonText}>Calculate</Text>
              </Pressable>

              {errorMessage !== null && <Text style={styles.error}>{errorMessage}</Text>}

              {results !== null && (
                <Text style={styles.resultsSummary}>
                  {results.length === 0
                    ? 'No IV combination matches those numbers for this species.'
                    : `${results.length} possible combination${results.length === 1 ? '' : 's'}:`}
                </Text>
              )}
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.resultRow}>
            <Text style={styles.resultText}>
              Level {item.level} — {item.ivAttack}/{item.ivDefense}/{item.ivStamina}
            </Text>
            <Text style={styles.resultPercentage}>{calculateIvPercentage(item)}%</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: SPACING.lg,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.brandRed,
    marginBottom: SPACING.lg,
  },
  card: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  speciesPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
  },
  pressedOpacity: {
    opacity: 0.85,
  },
  speciesSprite: {
    width: 36,
    height: 36,
  },
  speciesName: {
    marginLeft: SPACING.sm,
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  changeLabel: {
    fontSize: 12,
    color: COLORS.brandRed,
    fontWeight: '700',
  },
  input: {
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  levelRangeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  levelRangeField: {
    flex: 1,
  },
  calculateButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.brandBlue,
    borderRadius: RADIUS.md,
    borderWidth: 3,
    borderColor: COLORS.outline,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.surface,
  },
  error: {
    marginTop: SPACING.md,
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
  },
  resultsSummary: {
    marginTop: SPACING.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.outline,
    marginTop: SPACING.sm,
  },
  resultText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  resultPercentage: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.brandRed,
  },
});
