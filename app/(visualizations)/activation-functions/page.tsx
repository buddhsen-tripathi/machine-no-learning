"use client";

import { useState } from "react";
import { Mafs, Coordinates, Plot, Line, Circle } from "mafs";
import "mafs/core.css";
import { VizLayout } from "@/components/layout";
import { Slider } from "@/components/ui";
import { activationFunctions } from "@/lib/math/activation";

export default function ActivationFunctionsPage() {
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(["ReLU", "Sigmoid", "Tanh"]);
  const [showDerivatives, setShowDerivatives] = useState(false);
  const [inputValue, setInputValue] = useState(0);
  const [zoom, setZoom] = useState(5);

  const toggleFunction = (name: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const selectedActivations = activationFunctions.filter((f) => selectedFunctions.includes(f.name));

  // Scroll to zoom - unlimited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, prev * delta));
  };

  const controls = (
    <div className="space-y-6">
      {/* Function selection */}
      <div>
        <div className="text-white/60 text-xs mb-3">Activation Functions</div>
        <div className="grid grid-cols-3 gap-2">
          {activationFunctions.map((fn) => (
            <button
              key={fn.name}
              onClick={() => toggleFunction(fn.name)}
              className={`p-2 rounded-lg text-xs transition-colors ${
                selectedFunctions.includes(fn.name)
                  ? "text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
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

      {/* Options */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={showDerivatives}
            onChange={(e) => setShowDerivatives(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          Show derivatives
        </label>
      </div>

      {/* Input slider */}
      <Slider
        label="Input Value (x)"
        min={-10}
        max={10}
        step={0.1}
        value={inputValue}
        onChange={(e) => setInputValue(parseFloat(e.target.value))}
      />

      {/* Function descriptions */}
      <div>
        <div className="text-white/60 text-xs mb-2">Selected Functions</div>
        <div className="space-y-2">
          {selectedActivations.map((fn) => (
            <div key={fn.name} className="text-xs text-white/40">
              <span style={{ color: fn.color }} className="font-medium">{fn.name}:</span>{" "}
              {fn.description}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-white/40">
        <div>• Scroll on graph to zoom</div>
      </div>
    </div>
  );

  return (
    <VizLayout title="activation functions" controls={controls}>
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        onWheel={handleWheel}
      >
        <div className="w-full h-full max-w-3xl max-h-[600px] rounded-lg overflow-hidden relative">
          <Mafs viewBox={{ x: [-zoom, zoom], y: [-2, 2] }} preserveAspectRatio={false}>
            <Coordinates.Cartesian xAxis={{ lines: Math.ceil(zoom / 2) }} yAxis={{ lines: 0.5 }} />

            {/* Activation functions */}
            {selectedActivations.map((fn) => (
              <Plot.OfX key={fn.name} y={fn.fn} color={fn.color} weight={2.5} />
            ))}

            {/* Derivatives */}
            {showDerivatives &&
              selectedActivations.map((fn) => (
                <Plot.OfX
                  key={`${fn.name}-d`}
                  y={fn.derivative}
                  color={fn.color}
                  weight={1.5}
                  opacity={0.4}
                  style="dashed"
                />
              ))}

            {/* Vertical line at input */}
            <Line.Segment
              point1={[inputValue, -10]}
              point2={[inputValue, 10]}
              color="#ffffff"
              opacity={0.2}
              weight={1}
            />

            {/* Points at intersection */}
            {selectedActivations.map((fn) => (
              <Circle
                key={`${fn.name}-pt`}
                center={[inputValue, fn.fn(inputValue)]}
                radius={0.08 * (zoom / 5)}
                color={fn.color}
                fillOpacity={1}
              />
            ))}
          </Mafs>

          {/* Live values overlay */}
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
            <div className="text-xs text-white/40 mb-2">x = {inputValue.toFixed(2)}</div>
            <div className="space-y-1">
              {selectedActivations.map((fn) => (
                <div key={fn.name} className="flex justify-between gap-4">
                  <span className="text-xs" style={{ color: fn.color }}>{fn.name}:</span>
                  <span className="font-mono text-xs" style={{ color: fn.color }}>
                    {fn.fn(inputValue).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
            {showDerivatives && (
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                <div className="text-xs text-white/40">Derivatives:</div>
                {selectedActivations.map((fn) => (
                  <div key={`${fn.name}-d`} className="flex justify-between gap-4">
                    <span className="text-xs text-white/40">{fn.name}':</span>
                    <span className="font-mono text-xs text-white/60">
                      {fn.derivative(inputValue).toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </VizLayout>
  );
}
