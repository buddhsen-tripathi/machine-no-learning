export interface Point {
  x: number;
  y: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  mse: number;
}

export function linearRegression(points: Point[]): RegressionResult {
  if (points.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, mse: 0 };
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denominator = sumXX - (sumX * sumX) / n;

  if (Math.abs(denominator) < 1e-10) {
    return { slope: 0, intercept: meanY, rSquared: 0, mse: 0 };
  }

  const slope = (sumXY - (sumX * sumY) / n) / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate R-squared
  let ssRes = 0;
  let ssTot = 0;

  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssRes += (p.y - predicted) ** 2;
    ssTot += (p.y - meanY) ** 2;
  }

  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const mse = ssRes / n;

  return { slope, intercept, rSquared, mse };
}

export function predict(x: number, slope: number, intercept: number): number {
  return slope * x + intercept;
}

export function generateRandomPoints(
  count: number,
  xRange: [number, number] = [-5, 5],
  noise: number = 1,
  slope: number = 1,
  intercept: number = 0
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i < count; i++) {
    const x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
    const y = slope * x + intercept + (Math.random() - 0.5) * 2 * noise;
    points.push({ x, y });
  }

  return points;
}
