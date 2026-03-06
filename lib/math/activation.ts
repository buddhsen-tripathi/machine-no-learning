import { colors } from "../colors";

export interface ActivationFunction {
  name: string;
  fn: (x: number) => number;
  derivative: (x: number) => number;
  description: string;
  color: string;
}

export const activationFunctions: ActivationFunction[] = [
  {
    name: "ReLU",
    fn: (x) => Math.max(0, x),
    derivative: (x) => (x > 0 ? 1 : 0),
    description: "Rectified Linear Unit - simple and efficient",
    color: colors.series[0],
  },
  {
    name: "Sigmoid",
    fn: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
    description: "S-shaped curve between 0 and 1",
    color: colors.series[1],
  },
  {
    name: "Tanh",
    fn: (x) => Math.tanh(x),
    derivative: (x) => 1 - Math.tanh(x) ** 2,
    description: "Hyperbolic tangent, output -1 to 1",
    color: colors.series[2],
  },
  {
    name: "Leaky ReLU",
    fn: (x) => (x > 0 ? x : 0.01 * x),
    derivative: (x) => (x > 0 ? 1 : 0.01),
    description: "ReLU with small negative slope",
    color: colors.series[3],
  },
  {
    name: "ELU",
    fn: (x) => (x > 0 ? x : Math.exp(x) - 1),
    derivative: (x) => (x > 0 ? 1 : Math.exp(x)),
    description: "Exponential Linear Unit",
    color: colors.series[4],
  },
  {
    name: "Swish",
    fn: (x) => x / (1 + Math.exp(-x)),
    derivative: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s + x * s * (1 - s);
    },
    description: "Self-gated activation function",
    color: colors.series[5],
  },
];

export function softmax(values: number[]): number[] {
  const maxVal = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
