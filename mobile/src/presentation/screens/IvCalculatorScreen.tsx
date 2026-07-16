import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateIvPercentage, IvCombination } from '../../domain/iv-calculator';
import { getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { calculateIvsForSpecies, UnknownSpeciesError } from '../../use-cases/calculateIvsForSpecies';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';
import { RootStackScreenProps } from '../navigation/types';
import { useTranslation } from '../../i18n';

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

/** Pokemon levels go in 0.5 increments (half-levels are real, e.g. 25.5) — parsePositiveInt
 * rejected all of them, which was a real bug: entering "25.5" as a level always failed. */
function parseLevel(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || Math.round(parsed * 2) !== parsed * 2) {
    return null;
  }
  return parsed;
}

export function IvCalculatorScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
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
    const minLevel = parseLevel(minLevelInput);
    const maxLevel = parseLevel(maxLevelInput);

    if (cp === null || hp === null) {
      setErrorMessage(t('ivCalc.errorCpHp'));
      setResults(null);
      return;
    }

    if (minLevel === null || maxLevel === null) {
      setErrorMessage(t('ivCalc.errorLevel'));
      setResults(null);
      return;
    }

    if (minLevel > maxLevel) {
      setErrorMessage(t('ivCalc.errorMinMax'));
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
        setErrorMessage(t('ivCalc.errorGeneric'));
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
            <Text style={styles.title}>{t('ivCalc.title')}</Text>

            <Card style={styles.card}>
              <Text style={styles.label}>{t('ivCalc.species')}</Text>
              <Pressable
                style={({ pressed }) => [styles.speciesPicker, pressed && styles.pressedOpacity]}
                onPress={() => navigation.navigate('Tabs', { screen: 'Pokedex', params: { pickerMode: true } })}
              >
                {species && (
                  <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.speciesSprite} resizeMode="contain" />
                )}
                <Text style={styles.speciesName}>{species?.name ?? t('ivCalc.unknownSpecies')}</Text>
                <Text style={styles.changeLabel}>{t('common.change')}</Text>
              </Pressable>

              <Text style={styles.label}>{t('ivCalc.cp')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={cpInput}
                onChangeText={setCpInput}
                placeholder="e.g. 1256"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.label}>{t('ivCalc.hp')}</Text>
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
                  <Text style={styles.label}>{t('ivCalc.minLevel')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={minLevelInput}
                    onChangeText={setMinLevelInput}
                  />
                </View>
                <View style={styles.levelRangeField}>
                  <Text style={styles.label}>{t('ivCalc.maxLevel')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={maxLevelInput}
                    onChangeText={setMaxLevelInput}
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.calculateButton, pressed && styles.pressedOpacity]}
                onPress={handleCalculate}
              >
                <Text style={styles.calculateButtonText}>{t('ivCalc.calculate')}</Text>
              </Pressable>

              {errorMessage !== null && <Text style={styles.error}>{errorMessage}</Text>}

              {results !== null && (
                <Text style={styles.resultsSummary}>
                  {results.length === 0
                    ? t('ivCalc.noMatches')
                    : t(
                        results.length === 1 ? 'ivCalc.combinationsCountSingular' : 'ivCalc.combinationsCountPlural',
                        { n: results.length },
                      )}
                </Text>
              )}
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.resultRow}>
            <Text style={styles.resultText}>
              {t('ivCalc.resultLevel', {
                level: item.level,
                ivAttack: item.ivAttack,
                ivDefense: item.ivDefense,
                ivStamina: item.ivStamina,
              })}
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
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
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.lg,
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
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginTop: SPACING.sm,
    ...SHADOW.sm,
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
