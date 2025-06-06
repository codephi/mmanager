export function calculateGridSize(windowCount: number): {
  rows: number;
  cols: number;
} {
  if (windowCount === 0) return { rows: 0, cols: 0 };

  let cols = Math.ceil(Math.sqrt(windowCount));
  let rows = Math.ceil(windowCount / cols);

  // Pequeno ajuste opcional para balancear ainda melhor:
  if (rows > cols) {
    cols++;
    rows = Math.ceil(windowCount / cols);
  }

  return { rows, cols };
}
