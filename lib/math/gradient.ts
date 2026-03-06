export interface GradientState {
  x: number;
  y: number;
  loss: number;
  gradX: number;
  gradY: number;
}

export type LossSurface = (x: number, y: number) => number;
export type GradientFn = (x: number, y: number) => [number, number];

// Common loss surfaces
export const lossSurfaces = {
  quadratic: {
    name: "Quadratic Bowl",
    fn: (x: number, y: number) => x * x + y * y,
    gradient: (x: number, y: number): [number, number] => [2 * x, 2 * y],
    optimal: [0, 0] as [number, number],
  },
  rosenbrock: {
    name: "Rosenbrock",
    fn: (x: number, y: number) =>
      (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    gradient: (x: number, y: number): [number, number] => [
      -2 * (1 - x) - 400 * x * (y - x * x),
      200 * (y - x * x),
    ],
    optimal: [1, 1] as [number, number],
  },
  beale: {
    name: "Beale",
    fn: (x: number, y: number) =>
      (1.5 - x + x * y) ** 2 +
      (2.25 - x + x * y * y) ** 2 +
      (2.625 - x + x * y * y * y) ** 2,
    gradient: (x: number, y: number): [number, number] => {
      const a = 1.5 - x + x * y;
      const b = 2.25 - x + x * y * y;
      const c = 2.625 - x + x * y * y * y;
      return [
        2 * a * (-1 + y) + 2 * b * (-1 + y * y) + 2 * c * (-1 + y * y * y),
        2 * a * x + 2 * b * 2 * x * y + 2 * c * 3 * x * y * y,
      ];
    },
    optimal: [3, 0.5] as [number, number],
  },
  saddle: {
    name: "Saddle Point",
    fn: (x: number, y: number) => x * x - y * y,
    gradient: (x: number, y: number): [number, number] => [2 * x, -2 * y],
    optimal: [0, 0] as [number, number],
  },
};

export function gradientDescentStep(
  x: number,
  y: number,
  gradient: GradientFn,
  learningRate: number
): [number, number] {
  const [gx, gy] = gradient(x, y);
  return [x - learningRate * gx, y - learningRate * gy];
}

export function runGradientDescent(
  startX: number,
  startY: number,
  lossFn: LossSurface,
  gradient: GradientFn,
  learningRate: number,
  maxSteps: number = 100,
  tolerance: number = 1e-6
): GradientState[] {
  const path: GradientState[] = [];
  let x = startX;
  let y = startY;

  for (let i = 0; i < maxSteps; i++) {
    const loss = lossFn(x, y);
    const [gradX, gradY] = gradient(x, y);

    path.push({ x, y, loss, gradX, gradY });

    // Check convergence
    const gradMag = Math.sqrt(gradX * gradX + gradY * gradY);
    if (gradMag < tolerance) break;

    [x, y] = gradientDescentStep(x, y, gradient, learningRate);
  }

  return path;
}

export function generateContourData(
  lossFn: LossSurface,
  xRange: [number, number],
  yRange: [number, number],
  resolution: number = 50
): { x: number[]; y: number[]; z: number[][] } {
  const x: number[] = [];
  const y: number[] = [];
  const z: number[][] = [];

  const xStep = (xRange[1] - xRange[0]) / resolution;
  const yStep = (yRange[1] - yRange[0]) / resolution;

  for (let i = 0; i <= resolution; i++) {
    x.push(xRange[0] + i * xStep);
    y.push(yRange[0] + i * yStep);
  }

  for (let j = 0; j <= resolution; j++) {
    const row: number[] = [];
    for (let i = 0; i <= resolution; i++) {
      row.push(lossFn(x[i], y[j]));
    }
    z.push(row);
  }

  return { x, y, z };
}
