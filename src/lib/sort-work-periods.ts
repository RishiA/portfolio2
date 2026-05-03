/** Career timeline order: Present first, then newer ranges before older (by start year). */
export function sortWorkPeriodLabels(labels: readonly string[]): string[] {
  const score = (label: string): number => {
    const t = label.trim().toLowerCase();
    if (t === "present") return 1_000_000;
    const y = label.match(/(\d{4})/);
    return y ? parseInt(y[1], 10) : 0;
  };
  return [...labels].sort((a, b) => score(b) - score(a));
}
