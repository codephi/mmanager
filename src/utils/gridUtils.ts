export function calculateGridSize(totalWindows: number) {
  // Proteção contra valores inválidos
  if (!totalWindows || totalWindows <= 0 || !Number.isFinite(totalWindows)) {
    return { cols: 1, rows: 1 };
  }
  
  try {
    const cols = Math.max(1, Math.ceil(Math.sqrt(totalWindows)));
    const rows = Math.max(1, Math.ceil(totalWindows / cols));
    
    // Proteção final contra valores inválidos
    if (!Number.isFinite(cols) || !Number.isFinite(rows) || cols <= 0 || rows <= 0) {
      return { cols: 1, rows: 1 };
    }
    
    return { cols, rows };
  } catch (error) {
    console.error("[calculateGridSize] Error calculating grid size:", error);
    return { cols: 1, rows: 1 };
  }
}
