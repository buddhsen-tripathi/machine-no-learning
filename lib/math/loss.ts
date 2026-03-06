import { colors } from "../colors";

export interface LossFunction {
  name: string;
  fn: (predicted: number, actual: number, delta?: number) => number;
  derivative: (predicted: number, actual: number, delta?: number) => number;
  description: string;
  color: string;
}

export const lossFunctions: LossFunction[] = [
  {
    name: "MSE",
    fn: (predicted, actual) => (predicted - actual) ** 2,
    derivative: (predicted, actual) => 2 * (predicted - actual),
    description: "Mean Squared Error - penalizes large errors heavily",
    color: colors.series[0],
  },
  {
    name: "MAE",
    fn: (predicted, actual) => Math.abs(predicted - actual),
    derivative: (predicted, actual) =>
      predicted > actual ? 1 : predicted < actual ? -1 : 0,
    description: "Mean Absolute Error - robust to outliers",
    color: colors.series[1],
  },
  {
    name: "Huber",
    fn: (predicted, actual, delta = 1) => {
      const error = Math.abs(predicted - actual);
      return error <= delta
        ? 0.5 * error ** 2
        : delta * (error - 0.5 * delta);
    },
    derivative: (predicted, actual, delta = 1) => {
      const error = predicted - actual;
      const absError = Math.abs(error);
      if (absError <= delta) return error;
      return error > 0 ? delta : -delta;
    },
    description: "Combines MSE and MAE benefits",
    color: colors.series[2],
  },
  {
    name: "Log-Cosh",
    fn: (predicted, actual) => Math.log(Math.cosh(predicted - actual)),
    derivative: (predicted, actual) => Math.tanh(predicted - actual),
    description: "Smooth approximation of MAE",
    color: colors.series[3],
  },
];

export function binaryCrossEntropy(predicted: number, actual: number): number {
  const eps = 1e-15;
  const p = Math.max(eps, Math.min(1 - eps, predicted));
  return -(actual * Math.log(p) + (1 - actual) * Math.log(1 - p));
}

export function binaryCrossEntropyDerivative(predicted: number, actual: number): number {
  const eps = 1e-15;
  const p = Math.max(eps, Math.min(1 - eps, predicted));
  return -actual / p + (1 - actual) / (1 - p);
}
