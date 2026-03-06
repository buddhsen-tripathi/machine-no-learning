"use client";

import { useState, useEffect, useRef } from "react";
import { Mafs, Coordinates, Plot, Line, Circle } from "mafs";
import "mafs/core.css";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import { lossFunctions } from "@/lib/math/loss";
import { colors } from "@/lib/colors";

export default function LossFunctionsPage() {
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(["MSE", "MAE"]);
  const [actualValue, setActualValue] = useState(0);
  const [predictedValue, setPredictedValue] = useState(1);
  const [huberDelta, setHuberDelta] = useState(1);
  const [zoom, setZoom] = useState(4);

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"forward" | "backward">("forward");
  const animationRef = useRef<number | null>(null);

  const toggleFunction = (name: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const selectedLosses = lossFunctions.filter((f) => selectedFunctions.includes(f.name));

  // Animate predicted value sweeping across
  useEffect(() => {
    if (!isPlaying) return;

    const speed = 0.03;
    const minVal = -zoom + 0.5;
    const maxVal = zoom - 0.5;

    const animate = () => {
      setPredictedValue((prev) => {
        if (animationDirection === "forward") {
          if (prev >= maxVal) {
            setAnimationDirection("backward");
            return prev - speed;
          }
          return prev + speed;
        } else {
          if (prev <= minVal) {
            setAnimationDirection("forward");
            return prev + speed;
          }
          return prev - speed;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animationDirection, zoom]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPredictedValue(1);
    setActualValue(0);
    setAnimationDirection("forward");
  };

  // Scroll to zoom - unlimited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, prev * delta));
  };

  const controls = (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handlePlay} variant="primary">
          {isPlaying ? "⏸ Pause" : "▶ Sweep Prediction"}
        </Button>
        <Button onClick={handleReset} variant="outline">
          ↺ Reset
        </Button>
      </div>

      {/* Loss function selection */}
      <div>
        <div className="text-white/60 text-xs mb-3">Loss Functions</div>
        <div className="flex flex-wrap gap-2">
          {lossFunctions.map((fn) => (
            <button
              key={fn.name}
              onClick={() => toggleFunction(fn.name)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                selectedFunctions.includes(fn.name)
                  ? "text-black font-medium"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
              style={{
                backgroundColor: selectedFunctions.includes(fn.name) ? fn.color : undefined,
              }}
            >
              {fn.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Target Value"
          min={-10}
          max={10}
          step={0.1}
          value={actualValue}
          onChange={(e) => setActualValue(parseFloat(e.target.value))}
        />

        <Slider
          label="Predicted Value"
          min={-10}
          max={10}
          step={0.1}
          value={predictedValue}
          onChange={(e) => setPredictedValue(parseFloat(e.target.value))}
          disabled={isPlaying}
        />

        {selectedFunctions.includes("Huber") && (
          <Slider
            label="Huber δ"
            min={0.1}
            max={3}
            step={0.1}
            value={huberDelta}
            onChange={(e) => setHuberDelta(parseFloat(e.target.value))}
          />
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-white/40">
        <div>• Scroll on graph to zoom</div>
        <div>• Watch how different loss functions penalize errors differently</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="loss functions" controls={controls} isPlaying={isPlaying}>
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        onWheel={handleWheel}
      >
        <div className="w-full h-full max-w-4xl max-h-[700px] rounded-lg overflow-hidden relative">
          <Mafs
            viewBox={{ x: [-zoom, zoom], y: [0, zoom * 1.25] }}
            preserveAspectRatio={false}
          >
            <Coordinates.Cartesian
              xAxis={{ lines: Math.ceil(zoom / 2) }}
              yAxis={{ lines: Math.ceil(zoom / 2) }}
            />

            {/* Loss function curves */}
            {selectedLosses.map((fn) => (
              <Plot.OfX
                key={fn.name}
                y={(x) => fn.fn(x, actualValue, huberDelta)}
                color={fn.color}
                weight={2.5}
              />
            ))}

            {/* Target line (where actual value is) */}
            <Line.Segment
              point1={[actualValue, 0]}
              point2={[actualValue, zoom * 2]}
              color={colors.primary}
              opacity={0.6}
              weight={2}
            />

            {/* Predicted line */}
            <Line.Segment
              point1={[predictedValue, 0]}
              point2={[predictedValue, zoom * 2]}
              color={colors.accent}
              opacity={0.4}
              weight={1.5}
            />

            {/* Points on the loss curves */}
            {selectedLosses.map((fn) => (
              <Circle
                key={`${fn.name}-pt`}
                center={[predictedValue, fn.fn(predictedValue, actualValue, huberDelta)]}
                radius={0.12 * (zoom / 4)}
                color={fn.color}
                fillOpacity={1}
              />
            ))}

            {/* Target point marker at bottom */}
            <Circle
              center={[actualValue, 0]}
              radius={0.15 * (zoom / 4)}
              color={colors.primary}
              fillOpacity={1}
            />
          </Mafs>

          {/* Live values overlay - always visible on graph */}
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-white/40">Target:</span>
                <span className="font-mono" style={{ color: colors.primary }}>{actualValue.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-white/40">Predicted:</span>
                <span className="font-mono" style={{ color: colors.accent }}>{predictedValue.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                {selectedLosses.map((fn) => (
                  <div key={fn.name} className="flex justify-between gap-4">
                    <span className="text-xs" style={{ color: fn.color }}>{fn.name}:</span>
                    <span className="font-mono text-xs" style={{ color: fn.color }}>
                      {fn.fn(predictedValue, actualValue, huberDelta).toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VizLayout>
  );
}
