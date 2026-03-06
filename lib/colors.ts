/**
 * Visualization colors - keep in sync with globals.css
 *
 * When contributing, update both this file AND globals.css
 * to maintain consistency across the app.
 */

export const colors = {
  // Primary visualization colors
  primary: "#10b981",      // Emerald - main lines, positive
  secondary: "#06b6d4",    // Cyan - secondary elements
  accent: "#f59e0b",       // Amber - highlights, points
  error: "#ef4444",        // Red - errors, negative

  // Classification colors
  class0: "#3b82f6",       // Blue
  class1: "#f59e0b",       // Amber

  // Multi-series chart colors (use in order)
  series: [
    "#10b981",  // 1 - Emerald
    "#06b6d4",  // 2 - Cyan
    "#8b5cf6",  // 3 - Purple
    "#f59e0b",  // 4 - Amber
    "#ef4444",  // 5 - Red
    "#ec4899",  // 6 - Pink
    "#14b8a6",  // 7 - Teal
    "#84cc16",  // 8 - Lime
  ],
} as const;

// CSS variable references for use in styles
export const cssVars = {
  primary: "var(--viz-primary)",
  secondary: "var(--viz-secondary)",
  accent: "var(--viz-accent)",
  error: "var(--viz-error)",
  class0: "var(--viz-class0)",
  class1: "var(--viz-class1)",
} as const;
