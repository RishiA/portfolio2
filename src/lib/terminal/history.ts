export const HISTORY_LIMIT = 50;

/** In-memory command history with up/down navigation. Entries are kept per page view only. */
export class CommandHistory {
  private entries: string[] = [];
  private cursor: number | null = null;
  private draft = "";

  constructor(private readonly limit: number = HISTORY_LIMIT) {}

  push(entry: string): void {
    const value = entry.trim();
    this.reset();
    if (!value || this.entries[this.entries.length - 1] === value) return;
    this.entries.push(value);
    if (this.entries.length > this.limit) this.entries.splice(0, this.entries.length - this.limit);
  }

  /** Older entry. `current` is saved as the draft when navigation starts. Returns null when there is no history. */
  previous(current: string): string | null {
    if (this.entries.length === 0) return null;
    if (this.cursor === null) {
      this.draft = current;
      this.cursor = this.entries.length - 1;
    } else if (this.cursor > 0) {
      this.cursor -= 1;
    }
    return this.entries[this.cursor];
  }

  /** Newer entry, or the saved draft after the newest. Returns null when navigation has not started. */
  next(): string | null {
    if (this.cursor === null) return null;
    if (this.cursor < this.entries.length - 1) {
      this.cursor += 1;
      return this.entries[this.cursor];
    }
    this.cursor = null;
    return this.draft;
  }

  reset(): void {
    this.cursor = null;
    this.draft = "";
  }

  get size(): number {
    return this.entries.length;
  }

  toArray(): string[] {
    return [...this.entries];
  }
}
