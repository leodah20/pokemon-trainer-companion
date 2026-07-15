import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSpecies } from '../../data/pokedex/pokedexRepository';
import { generateQuiz } from '../../use-cases/generateQuiz';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';

const ALL_SPECIES = getAllSpecies();
const QUESTION_COUNT = 10;

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export function QuizScreen(): React.JSX.Element {
  const [questions, setQuestions] = useState(() => generateQuiz(ALL_SPECIES, QUESTION_COUNT));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');

  const currentQuestion = questions[questionIndex];
  const isFinished = questionIndex >= questions.length;

  const progressLabel = useMemo(
    () => (isFinished ? '' : `Question ${questionIndex + 1} / ${questions.length}`),
    [questionIndex, questions.length, isFinished],
  );

  function handleSelectOption(optionIndex: number): void {
    if (answerState !== 'unanswered') {
      return;
    }
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setSelectedOption(optionIndex);
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext(): void {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setQuestionIndex((prev) => prev + 1);
  }

  function handlePlayAgain(): void {
    setQuestions(generateQuiz(ALL_SPECIES, QUESTION_COUNT));
    setQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswerState('unanswered');
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.finishedText}>Not enough data to build a quiz right now.</Text>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <Card style={styles.resultCard} accentColor={COLORS.brandGold}>
            <Text style={styles.finishedTitle}>Quiz complete!</Text>
            <Text style={styles.finishedScore}>
              {score} / {questions.length}
            </Text>
            <Text style={styles.finishedText}>{scoreMessage(score, questions.length)}</Text>
          </Card>
          <Pressable style={styles.primaryButton} onPress={handlePlayAgain}>
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.progress}>{progressLabel}</Text>
        <Card style={styles.questionCard} accentColor={COLORS.brandBlue}>
          <Text style={styles.prompt}>{currentQuestion.prompt}</Text>
        </Card>

        <View style={styles.optionsList}>
          {currentQuestion.options.map((option, index) => (
            <Pressable
              key={option}
              onPress={() => handleSelectOption(index)}
              style={[
                styles.optionButton,
                selectedOption === index && answerState === 'correct' && styles.optionCorrect,
                selectedOption === index && answerState === 'incorrect' && styles.optionIncorrect,
                answerState !== 'unanswered' &&
                  index === currentQuestion.correctIndex &&
                  selectedOption !== index &&
                  styles.optionRevealCorrect,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === index && answerState !== 'unanswered' && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        {answerState !== 'unanswered' && (
          <Pressable style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {questionIndex + 1 < questions.length ? 'Next Question' : 'See Results'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function scoreMessage(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) {
    return 'Perfect score — true Pokemon Professor!';
  }
  if (ratio >= 0.7) {
    return 'Great job, Trainer!';
  }
  if (ratio >= 0.4) {
    return 'Not bad — keep studying the Pokedex.';
  }
  return 'Time to hit the books, Trainer.';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  progress: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  questionCard: {
    marginBottom: SPACING.lg,
  },
  prompt: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionButton: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOW.sm,
  },
  optionCorrect: {
    backgroundColor: COLORS.success,
  },
  optionIncorrect: {
    backgroundColor: COLORS.danger,
  },
  optionRevealCorrect: {
    borderColor: COLORS.success,
    borderWidth: 3,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.surface,
  },
  primaryButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.brandRed,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.lg,
  },
  primaryButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.surface,
  },
  resultCard: {
    alignItems: 'center',
  },
  finishedTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  finishedScore: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.brandRed,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  finishedText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
