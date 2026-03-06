"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Mafs, Coordinates, Plot, Circle } from "mafs";
import "mafs/core.css";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import { linearRegression, generateRandomPoints, Point } from "@/lib/math/regression";
import { colors } from "@/lib/colors";

export default function LinearRegressionPage() {
  const [points, setPoints] = useState<Point[]>(() =>
    generateRandomPoints(12, [-4, 4], 1.5, 0.8, 0.5)
  );
  const [noise, setNoise] = useState(1.5);
  const [numPoints, setNumPoints] = useState(12);
  const [trueSlope, setTrueSlope] = useState(0.8);
  const [trueIntercept, setTrueIntercept] = useState(0.5);
  const [showErrors, setShowErrors] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [zoom, setZoom] = useState(6);

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatedSlope, setAnimatedSlope] = useState(0);
  const [animatedIntercept, setAnimatedIntercept] = useState(0);
  const animationRef = useRef<number | null>(null);

  const regression = useMemo(() => linearRegression(points), [points]);

  // Animate the line fitting
  useEffect(() => {
    if (!isPlaying) return;

    const targetSlope = regression.slope;
    const targetIntercept = regression.intercept;
    const learningRate = 0.05;

    const animate = () => {
      setAnimatedSlope(prev => {
        const diff = targetSlope - prev;
        if (Math.abs(diff) < 0.001) return targetSlope;
        return prev + diff * learningRate;
      });

      setAnimatedIntercept(prev => {
        const diff = targetIntercept - prev;
        if (Math.abs(diff) < 0.001) return targetIntercept;
        return prev + diff * learningRate;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start from random position
    setAnimatedSlope((Math.random() - 0.5) * 4);
    setAnimatedIntercept((Math.random() - 0.5) * 4);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, regression.slope, regression.intercept]);

  // Check if animation is done
  useEffect(() => {
    if (isPlaying) {
      const slopeDone = Math.abs(animatedSlope - regression.slope) < 0.01;
      const interceptDone = Math.abs(animatedIntercept - regression.intercept) < 0.01;
      if (slopeDone && interceptDone) {
        setTimeout(() => setIsPlaying(false), 500);
      }
    }
  }, [isPlaying, animatedSlope, animatedIntercept, regression.slope, regression.intercept]);

  const handleRegenerate = () => {
    setPoints(generateRandomPoints(numPoints, [-4, 4], noise, trueSlope, trueIntercept));
    setIsPlaying(false);
  };

  const handleAddPoint = () => {
    const x = (Math.random() - 0.5) * 8;
    const y = regression.slope * x + regression.intercept + (Math.random() - 0.5) * noise * 2;
    setPoints([...points, { x, y }]);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Scroll to zoom - unlimited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, prev * delta));
  };

  const displaySlope = isPlaying ? animatedSlope : regression.slope;
  const displayIntercept = isPlaying ? animatedIntercept : regression.intercept;

  const controls = (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handlePlay} variant="primary" disabled={isPlaying || points.length < 2}>
          {isPlaying ? "Fitting..." : "▶ Animate Fit"}
        </Button>
        <Button onClick={handleRegenerate} variant="outline">
          Regenerate
        </Button>
        <Button onClick={handleAddPoint} variant="outline">
          + Point
        </Button>
        <Button onClick={() => setPoints([])} variant="outline" disabled={points.length === 0}>
          Clear
        </Button>
      </div>

      {/* Data generation parameters */}
      <div>
        <div className="text-white/60 text-xs mb-3">Data Generation</div>
        <div className="grid grid-cols-2 gap-4">
          <Slider
            label="Points"
            min={5}
            max={30}
            step={1}
            value={numPoints}
            onChange={(e) => setNumPoints(parseInt(e.target.value))}
            formatValue={(v) => v.toString()}
          />
          <Slider
            label="Noise"
            min={0}
            max={4}
            step={0.1}
            value={noise}
            onChange={(e) => setNoise(parseFloat(e.target.value))}
          />
          <Slider
            label="True Slope"
            min={-2}
            max={2}
            step={0.1}
            value={trueSlope}
            onChange={(e) => setTrueSlope(parseFloat(e.target.value))}
          />
          <Slider
            label="True Intercept"
            min={-2}
            max={2}
            step={0.1}
            value={trueIntercept}
            onChange={(e) => setTrueIntercept(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Display options */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={showErrors}
            onChange={(e) => setShowErrors(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          Show errors
        </label>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={showPredictions}
            onChange={(e) => setShowPredictions(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          Show predictions
        </label>
      </div>

      {/* Info */}
      <div className="text-xs text-white/40">
        <div>• Scroll on graph to zoom</div>
        <div>• R² = 1 means perfect fit</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="linear regression" controls={controls} isPlaying={isPlaying}>
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        onWheel={handleWheel}
      >
        <div className="w-full h-full max-w-4xl max-h-[700px] rounded-lg overflow-hidden relative">
          <Mafs
            viewBox={{ x: [-zoom, zoom], y: [-zoom, zoom] }}
            preserveAspectRatio={false}
          >
            <Coordinates.Cartesian
              xAxis={{ lines: Math.ceil(zoom / 2) }}
              yAxis={{ lines: Math.ceil(zoom / 2) }}
            />

            {/* Regression line */}
            {points.length >= 2 && (
              <Plot.OfX
                y={(x) => displaySlope * x + displayIntercept}
                color={colors.primary}
                weight={2.5}
              />
            )}

            {/* Error lines */}
            {showErrors && !isPlaying && points.map((point, i) => {
              const predicted = regression.slope * point.x + regression.intercept;
              return (
                <Plot.Parametric
                  key={`error-${i}`}
                  xy={(t) => [point.x, point.y + (predicted - point.y) * t]}
                  t={[0, 1]}
                  color={colors.error}
                  opacity={0.5}
                  weight={1}
                />
              );
            })}

            {/* Prediction points on line */}
            {showPredictions && !isPlaying && points.map((point, i) => {
              const predicted = regression.slope * point.x + regression.intercept;
              return (
                <Circle
                  key={`pred-${i}`}
                  center={[point.x, predicted]}
                  radius={0.08 * (zoom / 6)}
                  color={colors.primary}
                  fillOpacity={0.6}
                />
              );
            })}

            {/* Data points */}
            {points.map((point, i) => (
              <Circle
                key={i}
                center={[point.x, point.y]}
                radius={0.15 * (zoom / 6)}
                color={colors.accent}
                fillOpacity={1}
              />
            ))}
          </Mafs>

          {/* Live values overlay - always visible on graph */}
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-white/40 text-xs">Equation</span>
                <div className="font-mono" style={{ color: colors.primary }}>
                  y = {displaySlope.toFixed(3)}x {displayIntercept >= 0 ? "+" : ""} {displayIntercept.toFixed(3)}
                </div>
              </div>
              <div className="border-t border-white/10 pt-2 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-white/40 text-xs">R²</span>
                  <div className={`font-mono ${regression.rSquared > 0.8 ? "text-emerald-400" : regression.rSquared > 0.5 ? "text-amber-400" : "text-red-400"}`}>
                    {regression.rSquared.toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-white/40 text-xs">MSE</span>
                  <div className="font-mono text-white">{regression.mse.toFixed(4)}</div>
                </div>
              </div>
              <div className="text-xs text-white/40">
                Points: {points.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VizLayout>
  );
}
