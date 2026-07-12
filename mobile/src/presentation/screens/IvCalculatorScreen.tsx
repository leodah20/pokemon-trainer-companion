import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateIvPercentage, IvCombination } from '../../domain/iv-calculator';
import { getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { calculateIvsForSpecies, UnknownSpeciesError } from '../../use-cases/calculateIvsForSpecies';
import { COLORS, FONT_SIZE, PIXEL_FONT } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'IvCalculator'>;

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
        ListHeaderComponent={
          <View style={styles.form}>
            <Text style={styles.title}>IV Calculator</Text>

            <Text style={styles.label}>Species</Text>
            <Pressable
              style={styles.speciesPicker}
              onPress={() => navigation.navigate('Pokedex', { pickerMode: true })}
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
            />

            <Text style={styles.label}>HP</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={hpInput}
              onChangeText={setHpInput}
              placeholder="e.g. 111"
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

            <Pressable style={styles.calculateButton} onPress={handleCalculate}>
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
    backgroundColor: COLORS.cream,
  },
  form: {
    padding: 16,
  },
  title: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.pokedexRed,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginTop: 12,
    marginBottom: 4,
  },
  speciesPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    padding: 8,
  },
  speciesSprite: {
    width: 36,
    height: 36,
  },
  speciesName: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
  },
  changeLabel: {
    fontSize: 12,
    color: COLORS.pokedexRed,
    fontWeight: '700',
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  levelRangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  levelRangeField: {
    flex: 1,
  },
  calculateButton: {
    marginTop: 20,
    backgroundColor: COLORS.navy,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
  },
  error: {
    marginTop: 12,
    color: '#b00020',
  },
  resultsSummary: {
    marginTop: 16,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 15,
  },
  resultPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.pokedexRed,
  },
});
