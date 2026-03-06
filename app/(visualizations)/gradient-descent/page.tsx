"use client";

import { useState, useCallback } from "react";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import { GradientDescent3D } from "@/components/visualizations/gradient-descent-3d";

type SurfaceType = "quadratic" | "rosenbrock" | "saddle" | "beale";

const surfaces: { key: SurfaceType; label: string; description: string; optimal: string }[] = [
  { key: "quadratic", label: "Quadratic", description: "Simple convex bowl - always converges", optimal: "(0, 0)" },
  { key: "rosenbrock", label: "Rosenbrock", description: "Narrow curved valley - tests precision", optimal: "(1, 1)" },
  { key: "saddle", label: "Saddle", description: "Saddle point - gradient is zero but not minimum", optimal: "(0, 0)*" },
  { key: "beale", label: "Beale", description: "Flat regions with sharp valleys", optimal: "(3, 0.5)" },
];

export default function GradientDescentPage() {
  const [surfaceType, setSurfaceType] = useState<SurfaceType>("quadratic");
  const [learningRate, setLearningRate] = useState(0.05);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ x: 3, y: 3, loss: 18 });
  const [key, setKey] = useState(0); // For forcing reset

  const handlePositionChange = useCallback((x: number, y: number, loss: number) => {
    setPosition({ x, y, loss });
  }, []);

  const handleReset = () => {
    setIsPlaying(false);
    setKey(k => k + 1); // Force remount to reset position
  };

  const handleSurfaceChange = (type: SurfaceType) => {
    setSurfaceType(type);
    setIsPlaying(false);
    setKey(k => k + 1);
  };

  const currentSurface = surfaces.find(s => s.key === surfaceType)!;

  const controls = (
    <div className="space-y-6">
      {/* Play controls */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsPlaying(!isPlaying)} variant="primary">
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </Button>
        <Button onClick={handleReset} variant="outline">
          ↺ Reset
        </Button>
      </div>

      {/* Learning rate */}
      <div>
        <Slider
          label="Learning Rate"
          min={0.001}
          max={0.3}
          step={0.001}
          value={learningRate}
          onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          formatValue={(v) => v.toFixed(3)}
        />
        <div className="text-xs text-white/40 mt-1">
          {learningRate < 0.01 ? "Very slow - precise but takes many steps" :
           learningRate < 0.05 ? "Slow - good for complex surfaces" :
           learningRate < 0.1 ? "Medium - balanced speed and stability" :
           learningRate < 0.2 ? "Fast - may overshoot on complex surfaces" :
           "Very fast - may diverge!"}
        </div>
      </div>

      {/* Surface selection */}
      <div>
        <div className="text-white/60 text-xs mb-3">Loss Surface</div>
        <div className="grid grid-cols-2 gap-2">
          {surfaces.map((s) => (
            <button
              key={s.key}
              onClick={() => handleSurfaceChange(s.key)}
              className={`p-3 rounded-lg text-left transition-colors ${
                surfaceType === s.key
                  ? "bg-emerald-500/20 border border-emerald-500/50"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <div className={`text-sm font-medium ${surfaceType === s.key ? "text-emerald-400" : "text-white"}`}>
                {s.label}
              </div>
              <div className="text-xs text-white/40 mt-1">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current state */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-white/60 text-xs mb-3">Current State</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-white/40">x</div>
            <div className="font-mono text-white">{position.x.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs text-white/40">y</div>
            <div className="font-mono text-white">{position.y.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs text-white/40">Loss</div>
            <div className="font-mono text-emerald-400 text-lg">{position.loss.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Surface info */}
      <div className="text-xs text-white/40">
        <div>Optimal: <span className="text-white/60 font-mono">{currentSurface.optimal}</span></div>
        <div className="mt-2">Drag to rotate the 3D surface</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="gradient descent" controls={controls} isPlaying={isPlaying}>
      <GradientDescent3D
        key={key}
        learningRate={learningRate}
        surfaceType={surfaceType}
        isPlaying={isPlaying}
        onPositionChange={handlePositionChange}
      />
    </VizLayout>
  );
}
