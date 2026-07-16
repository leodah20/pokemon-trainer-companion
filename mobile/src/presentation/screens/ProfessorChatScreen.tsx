import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { ChatMessage, CompanionApiError, fetchChatReply } from '../../data/companion/companionApiClient';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';
import { useTranslation } from '../../i18n';

interface DisplayMessage extends ChatMessage {
  id: string;
}

let messageIdCounter = 0;
function nextMessageId(): string {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

/**
 * "Professor Mode" — free-form chat with the Companion AI, as opposed to the Companion widget's
 * "Companion Mode" (rule-based tips + one-shot species-scoped suggestions). The trainer can ask
 * literally anything Pokemon-related; POST /api/companion/chat forwards the full conversation to
 * Gemini so it has real multi-turn context, not just the latest message.
 */
export function ProfessorChatScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<DisplayMessage>>(null);

  async function handleSend(): Promise<void> {
    const text = input.trim();
    if (text === '' || sending) {
      return;
    }

    const userMessage: DisplayMessage = { id: nextMessageId(), role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setSending(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const reply = await fetchChatReply(nextMessages.map(({ role, text: messageText }) => ({ role, text: messageText })));
      setMessages((prev) => [...prev, { id: nextMessageId(), role: 'model', text: reply }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setError(err instanceof CompanionApiError ? err.message : t('professorChat.genericError'));
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('professorChat.emptyState')}</Text>}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleModel]}>
              {item.role === 'model' ? (
                <Markdown style={markdownStyles}>{item.text}</Markdown>
              ) : (
                <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{item.text}</Text>
              )}
            </View>
          )}
        />

        {sending && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={COLORS.brandBlue} />
            <Text style={styles.typingText}>{t('professorChat.thinking')}</Text>
          </View>
        )}
        {error !== null && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('professorChat.inputPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            multiline
            accessibilityLabel={t('professorChat.inputPlaceholder')}
          />
          <Pressable
            style={[styles.sendButton, (input.trim() === '' || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={input.trim() === '' || sending}
            accessibilityRole="button"
            accessibilityLabel={t('professorChat.sendButton')}
          >
            <Text style={styles.sendButtonText}>{t('professorChat.sendButton')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// react-native-markdown-display's `style` prop is keyed by markdown-it token names, not a
// StyleSheet — matched to the theme so **bold**/lists/etc. in the Professor's replies render
// properly instead of showing literal asterisks (real issue found testing on a physical device).
const markdownStyles = {
  body: { fontSize: FONT_SIZE.sm, lineHeight: 20, color: COLORS.textPrimary },
  paragraph: { marginTop: 0, marginBottom: SPACING.xs },
  strong: { fontWeight: '800' as const },
  em: { fontStyle: 'italic' as const },
  bullet_list: { marginBottom: SPACING.xs },
  ordered_list: { marginBottom: SPACING.xs },
  list_item: { flexDirection: 'row' as const, marginBottom: 2 },
  code_inline: {
    backgroundColor: COLORS.glassSurface,
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  code_block: {
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  fence: {
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  link: { color: COLORS.brandBlue },
  heading1: { fontSize: FONT_SIZE.lg, fontWeight: '800' as const, marginBottom: SPACING.xs },
  heading2: { fontSize: FONT_SIZE.md, fontWeight: '800' as const, marginBottom: SPACING.xs },
  heading3: { fontSize: FONT_SIZE.sm, fontWeight: '800' as const, marginBottom: SPACING.xs },
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  messageList: {
    padding: SPACING.lg,
    gap: SPACING.sm,
    flexGrow: 1,
  },
  emptyText: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.brandBlue,
  },
  bubbleModel: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.glassSurface,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  bubbleText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  bubbleTextUser: {
    color: COLORS.surface,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  typingText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  errorText: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  sendButton: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.surface,
  },
});
