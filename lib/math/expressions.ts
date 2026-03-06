import { compile, EvalFunction } from "mathjs";

export interface ParsedExpression {
  evaluate: (scope: Record<string, number>) => number;
  expression: string;
  error: string | null;
}

export function parseExpression(expr: string): ParsedExpression {
  try {
    const compiled = compile(expr);
    return {
      evaluate: (scope) => {
        try {
          const result = compiled.evaluate(scope);
          return typeof result === "number" && isFinite(result) ? result : NaN;
        } catch {
          return NaN;
        }
      },
      expression: expr,
      error: null,
    };
  } catch (e) {
    return {
      evaluate: () => NaN,
      expression: expr,
      error: e instanceof Error ? e.message : "Invalid expression",
    };
  }
}

export interface FunctionPreset {
  name: string;
  expression: string;
  params?: { name: string; min: number; max: number; default: number }[];
}

export const functionPresets: FunctionPreset[] = [
  { name: "Sine", expression: "sin(x)" },
  { name: "Cosine", expression: "cos(x)" },
  { name: "Quadratic", expression: "x^2" },
  {
    name: "Parabola",
    expression: "a * x^2 + b * x + c",
    params: [
      { name: "a", min: -5, max: 5, default: 1 },
      { name: "b", min: -5, max: 5, default: 0 },
      { name: "c", min: -5, max: 5, default: 0 },
    ],
  },
  {
    name: "Sine Wave",
    expression: "a * sin(b * x + c)",
    params: [
      { name: "a", min: 0.1, max: 3, default: 1 },
      { name: "b", min: 0.1, max: 5, default: 1 },
      { name: "c", min: -3.14, max: 3.14, default: 0 },
    ],
  },
  { name: "Exponential", expression: "exp(x)" },
  { name: "Logarithm", expression: "log(x)" },
  { name: "Square Root", expression: "sqrt(x)" },
  { name: "Absolute", expression: "abs(x)" },
  {
    name: "Gaussian",
    expression: "exp(-((x - m)^2) / (2 * s^2))",
    params: [
      { name: "m", min: -5, max: 5, default: 0 },
      { name: "s", min: 0.1, max: 3, default: 1 },
    ],
  },
];
