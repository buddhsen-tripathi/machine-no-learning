"use client";

import { useState, useMemo } from "react";
import { Mafs, Coordinates, Plot } from "mafs";
import "mafs/core.css";
import { VizLayout } from "@/components/layout";
import { Slider } from "@/components/ui";
import { parseExpression, functionPresets } from "@/lib/math/expressions";

export default function FunctionsPage() {
  const [expression, setExpression] = useState("sin(x)");
  const [params, setParams] = useState<Record<string, number>>({});
  const [selectedPreset, setSelectedPreset] = useState<string | null>("sin(x)");
  const [zoomX, setZoomX] = useState(10);
  const [zoomY, setZoomY] = useState(5);

  const parsed = useMemo(() => parseExpression(expression), [expression]);
  const currentPreset = functionPresets.find((p) => p.expression === expression);

  const handlePresetSelect = (preset: (typeof functionPresets)[0]) => {
    setExpression(preset.expression);
    setSelectedPreset(preset.expression);
    if (preset.params) {
      const newParams: Record<string, number> = {};
      preset.params.forEach((p) => { newParams[p.name] = p.default; });
      setParams(newParams);
    } else {
      setParams({});
    }
  };

  const plotFunction = (x: number) => parsed.evaluate({ x, ...params });

  // Scroll to zoom - unlimited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setZoomX((prev) => Math.max(0.5, prev * delta));
    setZoomY((prev) => Math.max(0.5, prev * delta));
  };

  const controls = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
        <div>
          <div className="text-white/40 text-xs mb-2">Expression</div>
          <input
            type="text"
            value={expression}
            onChange={(e) => { setExpression(e.target.value); setSelectedPreset(null); }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-mono text-white focus:outline-none focus:border-white/30"
            placeholder="e.g., sin(x)"
          />
          {parsed.error && <p className="text-red-400 text-xs mt-1">{parsed.error}</p>}
        </div>

        <div>
          <div className="text-white/40 text-xs mb-2">Presets</div>
          <div className="flex flex-wrap gap-1">
            {functionPresets.slice(0, 6).map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`px-2 py-1 text-xs rounded ${selectedPreset === preset.expression ? "bg-emerald-500 text-black" : "bg-white/10 text-white/60"}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {currentPreset?.params && currentPreset.params.length > 0 && (
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {currentPreset.params.map((p) => (
              <Slider
                key={p.name}
                label={p.name}
                min={p.min}
                max={p.max}
                step={0.1}
                value={params[p.name] ?? p.default}
                onChange={(e) => setParams({ ...params, [p.name]: parseFloat(e.target.value) })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-white/40">
        <div>• Scroll on graph to zoom</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="function plotter" controls={controls}>
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        onWheel={handleWheel}
      >
        <div className="w-full h-full max-w-3xl max-h-[600px] rounded-lg overflow-hidden relative">
          <Mafs viewBox={{ x: [-zoomX, zoomX], y: [-zoomY, zoomY] }} preserveAspectRatio={false}>
            <Coordinates.Cartesian xAxis={{ lines: Math.ceil(zoomX / 5) }} yAxis={{ lines: Math.ceil(zoomY / 2) }} />
            <Plot.OfX y={plotFunction} color="var(--viz-primary)" weight={2.5} />
          </Mafs>

          {/* Live expression overlay */}
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            <div className="font-mono text-sm" style={{ color: "var(--viz-primary)" }}>
              y = {expression}
            </div>
          </div>
        </div>
      </div>
    </VizLayout>
  );
}
