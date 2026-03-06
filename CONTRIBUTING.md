# Contributing to Machine No Learning

Thanks for your interest in contributing! This project aims to make ML concepts accessible through interactive visualizations.

## Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/machine-no-learning.git
cd machine-no-learning

# Install dependencies
bun install

# Start development server
bun dev
```

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── visualizations/page.tsx     # Visualization gallery
├── (visualizations)/           # Individual visualization pages
│   ├── linear-regression/
│   ├── gradient-descent/
│   ├── neural-network/
│   ├── activation-functions/
│   ├── loss-functions/
│   ├── decision-boundary/
│   ├── clustering/
│   └── functions/

components/
├── layout/                     # Layout components (Header, VizLayout)
├── ui/                         # Reusable UI (Button, Slider, Card)
└── visualizations/             # Visualization-specific components

lib/
├── colors.ts                   # Centralized color palette
├── math/                       # Mathematical utilities
│   ├── activation.ts           # Activation functions
│   ├── clustering.ts           # K-means algorithm
│   ├── gradient.ts             # Gradient descent
│   ├── loss.ts                 # Loss functions
│   └── regression.ts           # Linear regression
└── hooks/                      # React hooks
```

## Design Principles

### Visual Style
- **Dark theme** - Black background (#000000)
- **Minimal UI** - Let visualizations be the focus
- **Emerald accent** - Primary color for interactive elements
- **No clutter** - Controls auto-hide during animations

### Code Style
- TypeScript for type safety
- Functional React components
- Keep files focused and small
- Use centralized colors from `lib/colors.ts`

## Adding a New Visualization

1. Create a new folder in `app/(visualizations)/your-viz-name/`
2. Add `page.tsx` with your visualization
3. Use `VizLayout` component for consistent layout
4. Add math utilities to `lib/math/` if needed
5. Update the gallery in `app/visualizations/page.tsx`

### Visualization Template

```tsx
"use client";

import { useState } from "react";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import { colors } from "@/lib/colors";

export default function YourVisualizationPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  const controls = (
    <div className="space-y-6">
      {/* Your controls here */}
    </div>
  );

  return (
    <VizLayout title="your visualization" controls={controls} isPlaying={isPlaying}>
      {/* Your visualization here */}
    </VizLayout>
  );
}
```

## Color System

Colors are defined in two places that must stay in sync:

1. **CSS Variables** (`app/globals.css`)
2. **JS Constants** (`lib/colors.ts`)

```typescript
// lib/colors.ts
export const colors = {
  primary: "#10b981",    // Emerald - main accent
  secondary: "#06b6d4",  // Cyan - secondary accent
  accent: "#f59e0b",     // Amber - data points
  error: "#ef4444",      // Red - errors/negative
  // ...
};
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run `bun run build` to verify no errors
5. Run `bun run lint` to check code style
6. Commit with clear messages
7. Push and open a PR

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add support vector machine visualization
fix: correct gradient descent convergence check
docs: update README with new visualizations
style: format code with prettier
refactor: extract common animation hook
```

## Issues

### Good First Issues
Look for issues labeled `good first issue` - these are great for new contributors.

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information

### Feature Requests
Describe:
- The visualization or feature you'd like
- Why it would be useful for learning ML
- Any references or examples

## Questions?

Open an issue with the `question` label or start a discussion.
