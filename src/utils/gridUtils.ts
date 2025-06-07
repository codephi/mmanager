export function calculateGridSize(totalWindows: number) {
  const cols = Math.ceil(Math.sqrt(totalWindows));
  const rows = Math.ceil(totalWindows / cols);
  return { cols, rows };
}
