# Machine No Learning

Interactive visualizations to understand machine learning concepts. No math PhD required.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Visualizations

| Visualization | Description |
|---------------|-------------|
| **Gradient Descent** | 3D loss surfaces with animated optimization paths |
| **Linear Regression** | Interactive data points, watch the line fit in real-time |
| **Neural Network** | Forward propagation with adjustable layers and activations |
| **Activation Functions** | Compare ReLU, Sigmoid, Tanh, Leaky ReLU side by side |
| **Loss Functions** | MSE, MAE, Huber, Log-Cosh with animated predictions |
| **Decision Boundary** | See how classifiers divide feature space |
| **K-Means Clustering** | Step-by-step centroid updates |
| **Function Plotter** | Plot any mathematical expression |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/buddhsen-tripathi/machine-no-learning.git
cd machine-no-learning

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **2D Visualization**: [Mafs](https://mafs.dev/)
- **3D Rendering**: Canvas API
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── visualizations/page.tsx     # Gallery of all visualizations
└── (visualizations)/           # Individual visualization pages
    ├── gradient-descent/
    ├── linear-regression/
    ├── neural-network/
    ├── activation-functions/
    ├── loss-functions/
    ├── decision-boundary/
    ├── clustering/
    └── functions/

components/
├── layout/                     # Header, VizLayout
├── ui/                         # Button, Slider, Card
└── visualizations/             # Visualization-specific components

lib/
├── colors.ts                   # Centralized color palette
├── math/                       # Mathematical utilities
└── hooks/                      # React hooks
```

## Color System

All colors are centralized for easy theming:

| Location | Purpose |
|----------|---------|
| `app/globals.css` | CSS variables for Tailwind |
| `lib/colors.ts` | JavaScript constants for canvas/SVG |

Keep both files in sync when modifying colors.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Quick contribution workflow
git checkout -b feature/your-feature
bun run build  # Verify no errors
bun run lint   # Check code style
```

## License

[MIT](LICENSE) - feel free to use this for learning, teaching, or building upon.
