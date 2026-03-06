"use client";

import { useState, useEffect } from "react";
import { Mafs, Coordinates, Circle, Line } from "mafs";
import "mafs/core.css";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import {
  generateClusteredData,
  initializeCentroids,
  kMeansStep,
  ClusteringState,
  clusterColors,
} from "@/lib/math/clustering";
import { Point } from "@/lib/math/regression";
import { useAnimation } from "@/lib/hooks/use-animation";

export default function ClusteringPage() {
  const [k, setK] = useState(3);
  const [pointsPerCluster, setPointsPerCluster] = useState(20);
  const [spread, setSpread] = useState(1);
  const [showLines, setShowLines] = useState(true);
  const [autoSpeed, setAutoSpeed] = useState(500);
  const [zoom, setZoom] = useState(6);
  const [rawPoints, setRawPoints] = useState<Point[]>(() => generateClusteredData(3, 20, 1));

  const [state, setState] = useState<ClusteringState>(() => ({
    points: rawPoints.map((p) => ({ ...p, cluster: -1 })),
    centroids: initializeCentroids(rawPoints, k).map((c, i) => ({ ...c, cluster: i })),
    iteration: 0,
    converged: false,
  }));

  const { isPlaying, play, pause, reset } = useAnimation({ duration: 10000, loop: false });

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.converged) {
          pause();
          return prev;
        }
        return kMeansStep(prev);
      });
    }, autoSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, pause, autoSpeed]);

  const handleRegenerate = () => {
    const newPoints = generateClusteredData(k, pointsPerCluster, spread);
    setRawPoints(newPoints);
    const centroids = initializeCentroids(newPoints, k);
    setState({
      points: newPoints.map((p) => ({ ...p, cluster: -1 })),
      centroids: centroids.map((c, i) => ({ ...c, cluster: i })),
      iteration: 0,
      converged: false,
    });
    reset();
  };

  const handleReset = () => {
    const centroids = initializeCentroids(rawPoints, k);
    setState({
      points: rawPoints.map((p) => ({ ...p, cluster: -1 })),
      centroids: centroids.map((c, i) => ({ ...c, cluster: i })),
      iteration: 0,
      converged: false,
    });
    reset();
  };

  const handleStep = () => {
    if (!state.converged) {
      setState(kMeansStep(state));
    }
  };

  const handleKChange = (newK: number) => {
    setK(newK);
    const centroids = initializeCentroids(rawPoints, newK);
    setState({
      points: rawPoints.map((p) => ({ ...p, cluster: -1 })),
      centroids: centroids.map((c, i) => ({ ...c, cluster: i })),
      iteration: 0,
      converged: false,
    });
    reset();
  };

  // Scroll to zoom - unlimited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, prev * delta));
  };

  const controls = (
    <div className="space-y-6">
      {/* Play controls */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={isPlaying ? pause : play} variant="primary" disabled={state.converged}>
          {state.converged ? "✓ Converged" : isPlaying ? "⏸ Pause" : "▶ Auto Run"}
        </Button>
        <Button onClick={handleStep} variant="outline" disabled={state.converged}>
          Step →
        </Button>
        <Button onClick={handleReset} variant="outline">
          ↺ Reset
        </Button>
        <Button onClick={handleRegenerate} variant="outline">
          New Data
        </Button>
      </div>

      {/* K value */}
      <div>
        <Slider
          label="Number of Clusters (k)"
          min={2}
          max={8}
          step={1}
          value={k}
          onChange={(e) => handleKChange(parseInt(e.target.value))}
          formatValue={(v) => v.toString()}
        />
      </div>

      {/* Data generation */}
      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Points per Cluster"
          min={10}
          max={40}
          step={5}
          value={pointsPerCluster}
          onChange={(e) => setPointsPerCluster(parseInt(e.target.value))}
          formatValue={(v) => v.toString()}
        />
        <Slider
          label="Cluster Spread"
          min={0.5}
          max={2.5}
          step={0.1}
          value={spread}
          onChange={(e) => setSpread(parseFloat(e.target.value))}
        />
      </div>

      {/* Animation speed */}
      <Slider
        label="Animation Speed"
        min={100}
        max={1000}
        step={100}
        value={1100 - autoSpeed}
        onChange={(e) => setAutoSpeed(1100 - parseInt(e.target.value))}
        formatValue={(v) => v > 500 ? "Fast" : v > 200 ? "Medium" : "Slow"}
      />

      {/* Options */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="showLines"
          checked={showLines}
          onChange={(e) => setShowLines(e.target.checked)}
          className="w-4 h-4 accent-emerald-500"
        />
        <label htmlFor="showLines" className="text-white/60 text-sm">
          Show assignment lines
        </label>
      </div>

      {/* Info */}
      <div className="text-xs text-white/40">
        <div>• Scroll on graph to zoom</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="k-means clustering" controls={controls} isPlaying={isPlaying}>
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        onWheel={handleWheel}
      >
        <div className="w-full h-full max-w-3xl max-h-[600px] rounded-lg overflow-hidden relative">
          <Mafs viewBox={{ x: [-zoom, zoom], y: [-zoom, zoom] }} preserveAspectRatio={false}>
            <Coordinates.Cartesian xAxis={{ lines: Math.ceil(zoom / 3) }} yAxis={{ lines: Math.ceil(zoom / 3) }} />

            {/* Lines from points to centroids */}
            {showLines && state.points.map((point, i) => {
              if (point.cluster === -1) return null;
              const centroid = state.centroids[point.cluster];
              if (!centroid) return null;
              return (
                <Line.Segment
                  key={`line-${i}`}
                  point1={[point.x, point.y]}
                  point2={[centroid.x, centroid.y]}
                  color={clusterColors[point.cluster]}
                  opacity={0.15}
                  weight={1}
                />
              );
            })}

            {/* Data points */}
            {state.points.map((point, i) => (
              <Circle
                key={`point-${i}`}
                center={[point.x, point.y]}
                radius={0.12 * (zoom / 6)}
                color={point.cluster >= 0 ? clusterColors[point.cluster] : "#6b7280"}
                fillOpacity={0.8}
              />
            ))}

            {/* Centroids */}
            {state.centroids.map((centroid, i) => (
              <g key={`centroid-${i}`}>
                <Circle
                  center={[centroid.x, centroid.y]}
                  radius={0.25 * (zoom / 6)}
                  color={clusterColors[i]}
                  fillOpacity={1}
                />
                <Circle
                  center={[centroid.x, centroid.y]}
                  radius={0.4 * (zoom / 6)}
                  color={clusterColors[i]}
                  fillOpacity={0}
                  strokeStyle="dashed"
                />
              </g>
            ))}
          </Mafs>

          {/* Live values overlay */}
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-white/40">Iteration:</span>
                <span className="font-mono text-white">{state.iteration}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/40">Status:</span>
                <span className={`font-mono ${state.converged ? "text-emerald-400" : "text-amber-400"}`}>
                  {state.converged ? "Done" : "Running"}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                {Array.from({ length: k }).map((_, i) => {
                  const count = state.points.filter((p) => p.cluster === i).length;
                  return (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-xs" style={{ color: clusterColors[i] }}>Cluster {i + 1}:</span>
                      <span className="font-mono text-xs" style={{ color: clusterColors[i] }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VizLayout>
  );
}
