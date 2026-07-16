import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SPACING } from '../theme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/lifecycle crashes anywhere below it and shows a recoverable fallback instead of
 * a blank white screen. Deliberately a class component — React's error boundary API
 * (getDerivedStateFromError/componentDidCatch) has no hook equivalent. Wraps the whole app in
 * App.tsx, outside LanguageProvider, since a crash in any single screen — or in the
 * language/translation context itself — should still let the trainer reset back to a working
 * state. Fallback copy is deliberately English-only and not run through `t()`: the crash UI must
 * not depend on the same context tree that might have caused the crash.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught a crash:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.screen}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Pressable
            style={styles.button}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.brandRed,
    textAlign: 'center',
  },
  message: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.brandBlue,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.surface,
  },
});
