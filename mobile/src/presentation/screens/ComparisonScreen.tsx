import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PokemonSpecies } from '../../domain/pokemon-species';
import { getAllSpecies, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { compareSpecies, ComparisonWinner, StatComparison } from '../../use-cases/comparePokemon';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, getTypeColor, RADIUS, SPACING, TypeBadge } from '../theme';

const ALL_SPECIES = getAllSpecies();
const MAX_SEARCH_RESULTS = 6;

function searchSpecies(query: string): readonly PokemonSpecies[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') {
    return [];
  }
  return ALL_SPECIES.filter((species) => species.name.toLowerCase().includes(normalized)).slice(
    0,
    MAX_SEARCH_RESULTS,
  );
}

interface SpeciesSlotProps {
  label: string;
  species: PokemonSpecies | null;
  onSelect: (species: PokemonSpecies) => void;
  onClear: () => void;
}

function SpeciesSlot({ label, species, onSelect, onClear }: SpeciesSlotProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchSpecies(query), [query]);

  if (species) {
    return (
      <View style={styles.slot}>
        <Text style={styles.slotLabel}>{label}</Text>
        <Pressable style={styles.selectedRow} onPress={onClear}>
          <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.selectedSprite} resizeMode="contain" />
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedName}>{species.name}</Text>
            <View style={styles.selectedTypes}>
              {species.types.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
            </View>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.slot}>
      <Text style={styles.slotLabel}>{label}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name"
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      {results.length > 0 && (
        <View style={styles.resultsList}>
          {results.map((result) => (
            <Pressable
              key={result.id}
              style={styles.resultRow}
              onPress={() => {
                onSelect(result);
                setQuery('');
              }}
            >
              <Image source={{ uri: getSpriteUrl(result.id) }} style={styles.resultSprite} resizeMode="contain" />
              <Text style={styles.resultName}>{result.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function winnerColor(winner: ComparisonWinner, side: 'a' | 'b'): string {
  if (winner === 'tie') {
    return COLORS.textPrimary;
  }
  return winner === side ? COLORS.success : COLORS.textMuted;
}

function ComparisonRow({ comparison }: { comparison: StatComparison }): React.JSX.Element {
  return (
    <View style={styles.comparisonRow}>
      <Text style={[styles.comparisonValue, { color: winnerColor(comparison.winner, 'a') }]}>
        {comparison.valueA}
      </Text>
      <Text style={styles.comparisonLabel}>{comparison.label}</Text>
      <Text style={[styles.comparisonValue, { color: winnerColor(comparison.winner, 'b') }]}>
        {comparison.valueB}
      </Text>
    </View>
  );
}

export function ComparisonScreen(): React.JSX.Element {
  const [speciesA, setSpeciesA] = useState<PokemonSpecies | null>(null);
  const [speciesB, setSpeciesB] = useState<PokemonSpecies | null>(null);

  const comparisons = useMemo(
    () => (speciesA && speciesB ? compareSpecies(speciesA, speciesB) : null),
    [speciesA, speciesB],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SpeciesSlot label="Pokemon A" species={speciesA} onSelect={setSpeciesA} onClear={() => setSpeciesA(null)} />
        <SpeciesSlot label="Pokemon B" species={speciesB} onSelect={setSpeciesB} onClear={() => setSpeciesB(null)} />

        {comparisons && speciesA && speciesB && (
          <Card style={styles.resultCard} accentColor={getTypeColor(speciesA.types[0])}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultHeaderName}>{speciesA.name}</Text>
              <Text style={styles.resultHeaderName}>{speciesB.name}</Text>
            </View>
            {comparisons.map((comparison) => (
              <ComparisonRow key={comparison.label} comparison={comparison} />
            ))}
            <Text style={styles.sourceText}>Green highlights the higher stat. Bulk is a DEF+STA heuristic.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  slot: {
    gap: SPACING.sm,
  },
  slotLabel: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  searchInput: {
    borderRadius: RADIUS.full,
    borderWidth: 2.5,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  resultsList: {
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  resultSprite: {
    width: 32,
    height: 32,
  },
  resultName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 2.5,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  selectedSprite: {
    width: 48,
    height: 48,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedTypes: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  changeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.brandBlue,
    fontWeight: '700',
  },
  resultCard: {
    marginTop: SPACING.md,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  resultHeaderName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  comparisonValue: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  comparisonLabel: {
    width: 90,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sourceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
