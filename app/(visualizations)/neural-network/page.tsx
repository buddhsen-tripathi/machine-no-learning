"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { VizLayout } from "@/components/layout";
import { Button, Slider } from "@/components/ui";
import { activationFunctions } from "@/lib/math/activation";
import { colors } from "@/lib/colors";
import { useAnimation } from "@/lib/hooks/use-animation";

interface Layer {
  neurons: number;
  activation: string;
}

function initializeWeights(layers: Layer[]): number[][][] {
  const weights: number[][][] = [];
  for (let i = 0; i < layers.length - 1; i++) {
    const layerWeights: number[][] = [];
    for (let j = 0; j < layers[i].neurons; j++) {
      const neuronWeights: number[] = [];
      for (let k = 0; k < layers[i + 1].neurons; k++) {
        neuronWeights.push((Math.random() - 0.5) * 2);
      }
      layerWeights.push(neuronWeights);
    }
    weights.push(layerWeights);
  }
  return weights;
}

function forwardPass(input: number[], layers: Layer[], weights: number[][][]): number[][] {
  const activations: number[][] = [input];
  let current = input;

  for (let i = 0; i < layers.length - 1; i++) {
    const next: number[] = [];
    const activation = activationFunctions.find((a) => a.name === layers[i + 1].activation);

    for (let j = 0; j < layers[i + 1].neurons; j++) {
      let sum = 0;
      for (let k = 0; k < current.length; k++) {
        sum += current[k] * weights[i][k][j];
      }
      next.push(activation ? activation.fn(sum) : sum);
    }
    activations.push(next);
    current = next;
  }
  return activations;
}

const availableActivations = ["ReLU", "Sigmoid", "Tanh", "Leaky ReLU"];

export default function NeuralNetworkPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });

  const [layers, setLayers] = useState<Layer[]>([
    { neurons: 3, activation: "none" },
    { neurons: 4, activation: "ReLU" },
    { neurons: 4, activation: "ReLU" },
    { neurons: 2, activation: "Sigmoid" },
  ]);

  const [inputValues, setInputValues] = useState([0.5, -0.3, 0.8]);
  const [weights, setWeights] = useState(() => initializeWeights(layers));
  const { progress, isPlaying, play, reset } = useAnimation({ duration: 2000, loop: false });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, rect.width - 40),
          height: Math.max(400, rect.height - 40),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const activations = useMemo(
    () => forwardPass(inputValues.slice(0, layers[0].neurons), layers, weights),
    [inputValues, layers, weights]
  );

  const handleRandomize = () => {
    setWeights(initializeWeights(layers));
    reset();
  };

  const handleAddLayer = () => {
    if (layers.length < 6) {
      const newLayers = [...layers];
      newLayers.splice(layers.length - 1, 0, { neurons: 3, activation: "ReLU" });
      setLayers(newLayers);
      setWeights(initializeWeights(newLayers));
      reset();
    }
  };

  const handleRemoveLayer = () => {
    if (layers.length > 2) {
      const newLayers = layers.filter((_, i) => i !== layers.length - 2);
      setLayers(newLayers);
      setWeights(initializeWeights(newLayers));
      reset();
    }
  };

  const handleUpdateNeurons = (layerIdx: number, neurons: number) => {
    const newLayers = [...layers];
    newLayers[layerIdx] = { ...newLayers[layerIdx], neurons };
    setLayers(newLayers);
    setWeights(initializeWeights(newLayers));

    if (layerIdx === 0) {
      const newInputs = Array(neurons).fill(0).map((_, i) => inputValues[i] ?? (Math.random() - 0.5) * 2);
      setInputValues(newInputs);
    }
    reset();
  };

  const handleUpdateActivation = (layerIdx: number, activation: string) => {
    const newLayers = [...layers];
    newLayers[layerIdx] = { ...newLayers[layerIdx], activation };
    setLayers(newLayers);
    reset();
  };

  // Dynamic SVG layout
  const { width, height } = dimensions;
  const padding = 80;
  const layerSpacing = (width - 2 * padding) / (layers.length - 1);

  const maxNeurons = Math.max(...layers.map(l => l.neurons));
  const neuronRadius = Math.min(25, (height - 2 * padding) / (maxNeurons * 2.5));

  const getNeuronPosition = (layerIdx: number, neuronIdx: number) => {
    const x = padding + layerIdx * layerSpacing;
    const layerHeight = height - 2 * padding;
    const neuronCount = layers[layerIdx].neurons;
    const neuronSpacing = layerHeight / (neuronCount + 1);
    const y = padding + (neuronIdx + 1) * neuronSpacing;
    return { x, y };
  };

  const controls = (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={isPlaying ? reset : play} variant="primary">
          {isPlaying ? "Reset" : "Forward Pass"}
        </Button>
        <Button onClick={handleRandomize} variant="outline">
          Randomize Weights
        </Button>
        <Button onClick={handleAddLayer} variant="outline" disabled={layers.length >= 6}>
          + Layer
        </Button>
        <Button onClick={handleRemoveLayer} variant="outline" disabled={layers.length <= 2}>
          - Layer
        </Button>
      </div>

      {/* Input values */}
      <div>
        <div className="text-white/60 text-xs mb-3">Input Values</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: layers[0].neurons }).map((_, i) => (
            <Slider
              key={i}
              label={`x${i + 1}`}
              min={-2}
              max={2}
              step={0.1}
              value={inputValues[i] ?? 0}
              onChange={(e) => {
                const newInputs = [...inputValues];
                newInputs[i] = parseFloat(e.target.value);
                setInputValues(newInputs);
              }}
            />
          ))}
        </div>
      </div>

      {/* Layer configuration */}
      <div>
        <div className="text-white/60 text-xs mb-3">Layer Configuration</div>
        <div className="space-y-3">
          {layers.map((layer, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <span className="text-xs text-white/40 w-16">
                {i === 0 ? "Input" : i === layers.length - 1 ? "Output" : `Hidden ${i}`}
              </span>

              <div className="flex-1">
                <Slider
                  label="Neurons"
                  min={1}
                  max={i === 0 ? 5 : i === layers.length - 1 ? 4 : 8}
                  step={1}
                  value={layer.neurons}
                  onChange={(e) => handleUpdateNeurons(i, parseInt(e.target.value))}
                  formatValue={(v) => v.toString()}
                />
              </div>

              {i > 0 && (
                <div className="w-28">
                  <div className="text-white/40 text-xs mb-1">Activation</div>
                  <select
                    value={layer.activation}
                    onChange={(e) => handleUpdateActivation(i, e.target.value)}
                    className="w-full px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {availableActivations.map((a) => (
                      <option key={a} value={a} className="bg-black">{a}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Output values */}
      <div>
        <div className="text-white/60 text-xs mb-2">Output Values</div>
        <div className="flex gap-4">
          {activations[activations.length - 1].map((val, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-white/40">y{i + 1}</div>
              <div className="text-lg font-mono text-emerald-400">{val.toFixed(4)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald-500" />
          <span>Positive weight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500" />
          <span>Negative weight</span>
        </div>
      </div>
    </div>
  );

  return (
    <VizLayout title="neural network" controls={controls} isPlaying={isPlaying}>
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center p-4">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full max-h-full">
          {/* Connections */}
          {weights.map((layerWeights, layerIdx) =>
            layerWeights.map((neuronWeights, fromIdx) =>
              neuronWeights.map((weight, toIdx) => {
                const from = getNeuronPosition(layerIdx, fromIdx);
                const to = getNeuronPosition(layerIdx + 1, toIdx);
                const delay = layerIdx * 0.2;
                const localProgress = Math.max(0, Math.min(1, (progress - delay) / 0.3));

                return (
                  <line
                    key={`${layerIdx}-${fromIdx}-${toIdx}`}
                    x1={from.x}
                    y1={from.y}
                    x2={from.x + (to.x - from.x) * localProgress}
                    y2={from.y + (to.y - from.y) * localProgress}
                    stroke={weight > 0 ? colors.primary : colors.error}
                    strokeWidth={Math.abs(weight) * 2 + 0.5}
                    opacity={0.15 + localProgress * 0.4}
                  />
                );
              })
            )
          )}

          {/* Neurons */}
          {layers.map((layer, layerIdx) =>
            Array(layer.neurons)
              .fill(0)
              .map((_, neuronIdx) => {
                const pos = getNeuronPosition(layerIdx, neuronIdx);
                const value = activations[layerIdx]?.[neuronIdx] ?? 0;
                const delay = layerIdx * 0.2;
                const localProgress = Math.max(0, Math.min(1, (progress - delay) / 0.3));

                return (
                  <g key={`${layerIdx}-${neuronIdx}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={neuronRadius}
                      fill={`hsl(${160 + value * 40}, 70%, ${30 + Math.abs(value) * 30}%)`}
                      stroke={layerIdx === 0 ? colors.secondary : layerIdx === layers.length - 1 ? colors.primary : "#6b7280"}
                      strokeWidth={2}
                      opacity={0.5 + localProgress * 0.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={Math.max(9, neuronRadius * 0.5)}
                      fontFamily="monospace"
                    >
                      {value.toFixed(2)}
                    </text>
                  </g>
                );
              })
          )}

          {/* Layer labels */}
          {layers.map((layer, i) => {
            const x = padding + i * layerSpacing;
            return (
              <g key={`label-${i}`}>
                <text x={x} y={height - 25} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={12}>
                  {i === 0 ? "Input" : i === layers.length - 1 ? "Output" : `Hidden ${i}`}
                </text>
                {i > 0 && (
                  <text x={x} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>
                    {layer.activation}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </VizLayout>
  );
}
