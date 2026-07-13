export interface TimelineEvent {
  /** e.g. "Generation I (1996)" or "Anime debut" — kept short, this renders as a small header. */
  label: string;
  note: string;
}

export interface LoreEntry {
  speciesId: number;
  /** Shown first, before the trainer chooses to dig deeper. Keep this to one or two sentences. */
  summary: string;
  timeline: readonly TimelineEvent[];
  curiosities: readonly string[];
}
