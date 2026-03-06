"use client";

import { Mafs, Coordinates, Plot, Theme } from "mafs";
import "mafs/core.css";
import { parseExpression } from "@/lib/math/expressions";
import { useTheme } from "@/lib/hooks/use-theme";

interface FunctionPlotProps {
  expression: string;
  params?: Record<string, number>;
  color?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  height?: number;
}

export function FunctionPlot({
  expression,
  params = {},
  color = "var(--color-viz-line)",
  xRange = [-10, 10],
  yRange = [-10, 10],
  height = 400,
}: FunctionPlotProps) {
  const { theme } = useTheme();
  const parsed = parseExpression(expression);

  const plotFunction = (x: number) => {
    return parsed.evaluate({ x, ...params });
  };

  return (
    <div
      className="rounded-lg overflow-hidden border border-border"
      style={{ height }}
    >
      <Mafs
        viewBox={{
          x: xRange,
          y: yRange,
        }}
        preserveAspectRatio={false}
      >
        <Coordinates.Cartesian
          xAxis={{ lines: 1 }}
          yAxis={{ lines: 1 }}
        />
        <Plot.OfX
          y={plotFunction}
          color={color}
          weight={2}
        />
      </Mafs>
    </div>
  );
}
