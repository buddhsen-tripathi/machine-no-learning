"use client";

import { useState, useMemo } from "react";
import { Mafs, Coordinates, Circle, Plot } from "mafs";
import "mafs/core.css";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import { Point } from "@/lib/math/regression";

interface LabeledPoint extends Point {
  label: 0 | 1;
}

function generateSeparableData(count: number, margin: number = 1): LabeledPoint[] {
  const points: LabeledPoint[] = [];
  for (let i = 0; i < count; i++) {
    const label = Math.random() > 0.5 ? 1 : 0;
    const angle = Math.random() * Math.PI * 2;
    const distance = 1 + Math.random() * 2;
    const centerX = label === 1 ? margin : -margin;
    const centerY = label === 1 ? margin : -margin;
    points.push({
      x: centerX + Math.cos(angle) * distance * 0.5,
      y: centerY + Math.sin(angle) * distance * 0.5,
      label: label as 0 | 1,
    });
  }
  return points;
}

function generateCircularData(count: number): LabeledPoint[] {
  const points: LabeledPoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const isInner = Math.random() > 0.5;
    const radius = isInner ? Math.random() * 1.5 : 2 + Math.random() * 1.5;
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, label: isInner ? 0 : 1 });
  }
  return points;
}

function fitLinearClassifier(points: LabeledPoint[]): { w1: number; w2: number; b: number } {
  let w1 = 0.1, w2 = 0.1, b = 0;
  for (let epoch = 0; epoch < 100; epoch++) {
    for (const p of points) {
      const prediction = w1 * p.x + w2 * p.y + b > 0 ? 1 : 0;
      const error = p.label - prediction;
      w1 += 0.1 * error * p.x;
      w2 += 0.1 * error * p.y;
      b += 0.1 * error;
    }
  }
  return { w1, w2, b };
}

export default function DecisionBoundaryPage() {
  const [dataType, setDataType] = useState<"linear" | "circular">("linear");
  const [classifierType, setClassifierType] = useState<"linear" | "rbf">("linear");
  const [complexity, setComplexity] = useState(1);
  const [points, setPoints] = useState<LabeledPoint[]>(() => generateSeparableData(40));
  const [zoom, setZoom] = useState(5);

  const handleRegenerate = () => {
    setPoints(dataType === "circular" ? generateCircularData(40) : generateSeparableData(40));
  };

  const linearParams = useMemo(() => fitLinearClassifier(points), [points]);

  const decisionFunction = useMemo(() => {
    if (classifierType === "linear") {
      return (x: number, y: number) => linearParams.w1 * x + linearParams.w2 * y + linearParams.b;
    }
    return (x: number, y: number) => {
      let score0 = 0, score1 = 0;
      for (const p of points) {
        const dist = (x - p.x) ** 2 + (y - p.y) ** 2;
        const kernel = Math.exp(-complexity * dist);
        if (p.label === 0) score0 += kernel;
        else score1 += kernel;
      }
      return score1 - score0;
    };
  }, [classifierType, linearParams, points, complexity]);

  // Scroll to zoom - unlimited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, prev * delta));
  };

  const class0Count = points.filter(p => p.label === 0).length;
  const class1Count = points.filter(p => p.label === 1).length;

  const controls = (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleRegenerate} variant="primary">
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-white/40 text-xs mb-2">Data</div>
          <div className="flex gap-1">
            {(["linear", "circular"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setDataType(t); setPoints(t === "circular" ? generateCircularData(40) : generateSeparableData(40)); }}
                className={`px-3 py-1.5 text-xs rounded ${dataType === t ? "bg-emerald-500 text-black" : "bg-white/10 text-white/60"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-white/40 text-xs mb-2">Classifier</div>
          <div className="flex gap-1">
            {(["linear", "rbf"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setClassifierType(t)}
                className={`px-3 py-1.5 text-xs rounded ${classifierType === t ? "bg-emerald-500 text-black" : "bg-white/10 text-white/60"}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {classifierType === "rbf" && (
        <Slider label="Gamma" min={0.1} max={5} step={0.1} value={complexity} onChange={(e) => setComplexity(parseFloat(e.target.value))} />
      )}

      {/* Info */}
      <div className="text-xs text-white/40">
        <div>• Scroll on graph to zoom</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="decision boundary" controls={controls}>
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        onWheel={handleWheel}
      >
        <div className="w-full h-full max-w-3xl max-h-[600px] rounded-lg overflow-hidden relative">
          <Mafs viewBox={{ x: [-zoom, zoom], y: [-zoom, zoom] }} preserveAspectRatio={false}>
            <Coordinates.Cartesian xAxis={{ lines: Math.ceil(zoom / 2) }} yAxis={{ lines: Math.ceil(zoom / 2) }} />

            <Plot.Inequality
              y={{
                "<=": (x) => {
                  for (let y = zoom; y >= -zoom; y -= 0.1) {
                    if (decisionFunction(x, y) <= 0) return y;
                  }
                  return -zoom;
                },
                ">=": () => -zoom,
              }}
              color="var(--viz-class0)"
            />

            {points.map((point, i) => (
              <Circle
                key={i}
                center={[point.x, point.y]}
                radius={0.12 * (zoom / 5)}
                color={point.label === 0 ? "var(--viz-class0)" : "var(--viz-class1)"}
                fillOpacity={1}
              />
            ))}
          </Mafs>

          {/* Live values overlay */}
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-white/40">Points:</span>
                <span className="font-mono text-white">{points.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: "var(--viz-class0)" }}>Class 0:</span>
                <span className="font-mono" style={{ color: "var(--viz-class0)" }}>{class0Count}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: "var(--viz-class1)" }}>Class 1:</span>
                <span className="font-mono" style={{ color: "var(--viz-class1)" }}>{class1Count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VizLayout>
  );
}
