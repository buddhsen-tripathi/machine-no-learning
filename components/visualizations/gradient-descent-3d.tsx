"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/colors";

interface GradientDescent3DProps {
  learningRate: number;
  surfaceType: "quadratic" | "rosenbrock" | "saddle" | "beale";
  isPlaying: boolean;
  onPositionChange?: (x: number, y: number, loss: number) => void;
}

export function GradientDescent3D({
  learningRate,
  surfaceType,
  isPlaying,
  onPositionChange,
}: GradientDescent3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef({ x: 3, y: 3 });
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef({ x: 0.5, y: 0.3 });

  const lossFunctions = {
    quadratic: {
      fn: (x: number, y: number) => x * x + y * y,
      gradient: (x: number, y: number) => [2 * x, 2 * y],
    },
    rosenbrock: {
      fn: (x: number, y: number) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
      gradient: (x: number, y: number) => [
        -2 * (1 - x) - 400 * x * (y - x * x),
        200 * (y - x * x),
      ],
    },
    saddle: {
      fn: (x: number, y: number) => x * x - y * y,
      gradient: (x: number, y: number) => [2 * x, -2 * y],
    },
    beale: {
      fn: (x: number, y: number) =>
        (1.5 - x + x * y) ** 2 + (2.25 - x + x * y * y) ** 2,
      gradient: (x: number, y: number) => {
        const a = 1.5 - x + x * y;
        const b = 2.25 - x + x * y * y;
        return [
          2 * a * (-1 + y) + 2 * b * (-1 + y * y),
          2 * a * x + 2 * b * 2 * x * y,
        ];
      },
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const surface = lossFunctions[surfaceType];
    const range = surfaceType === "rosenbrock" ? 2 : 4;
    const gridSize = 40;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.35;

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      const project = (x: number, y: number, z: number) => {
        const nx = x / range;
        const ny = y / range;
        const nz = Math.min(1, Math.max(-1, z / 20));

        const rx = nx * cosY - nz * sinY;
        const rz = nx * sinY + nz * cosY;
        const ry = ny * cosX - rz * sinX;
        const rz2 = ny * sinX + rz * cosX;

        const perspective = 2;
        const pScale = perspective / (perspective + rz2 + 1);

        return {
          x: centerX + rx * scale * pScale,
          y: centerY - ry * scale * pScale,
          z: rz2,
          scale: pScale,
        };
      };

      const points: { x: number; y: number; z: number; px: number; py: number; pz: number }[][] = [];

      for (let i = 0; i <= gridSize; i++) {
        points[i] = [];
        for (let j = 0; j <= gridSize; j++) {
          const x = (i / gridSize - 0.5) * 2 * range;
          const y = (j / gridSize - 0.5) * 2 * range;
          let z = surface.fn(x, y);
          z = Math.min(50, Math.max(-50, z));

          const projected = project(x, z * 0.1, y);
          points[i][j] = { x, y, z, px: projected.x, py: projected.y, pz: projected.z };
        }
      }

      // Draw surface
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const p1 = points[i][j];
          const p2 = points[i + 1][j];
          const p3 = points[i + 1][j + 1];
          const p4 = points[i][j + 1];

          const avgZ = (p1.pz + p2.pz + p3.pz + p4.pz) / 4;
          const avgHeight = (p1.z + p2.z + p3.z + p4.z) / 4;
          const normalizedHeight = Math.min(1, Math.max(0, (avgHeight + 10) / 40));

          // Use primary color (emerald) for surface
          const alpha = 0.3 + avgZ * 0.2;
          ctx.fillStyle = `rgba(16, 185, 129, ${Math.max(0.05, alpha * 0.3)})`;
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.lineTo(p3.px, p3.py);
          ctx.lineTo(p4.px, p4.py);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0.1, 0.4 + avgZ * 0.3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Update position if playing
      if (isPlaying) {
        const [gx, gy] = surface.gradient(positionRef.current.x, positionRef.current.y);
        const gradMag = Math.sqrt(gx * gx + gy * gy);

        if (gradMag > 0.001) {
          positionRef.current.x -= learningRate * gx;
          positionRef.current.y -= learningRate * gy;
          positionRef.current.x = Math.max(-range, Math.min(range, positionRef.current.x));
          positionRef.current.y = Math.max(-range, Math.min(range, positionRef.current.y));

          pathRef.current.push({ ...positionRef.current });
          if (pathRef.current.length > 200) pathRef.current.shift();
        }
      }

      // Draw path (accent color - amber)
      if (pathRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;

        for (let i = 0; i < pathRef.current.length; i++) {
          const p = pathRef.current[i];
          const z = surface.fn(p.x, p.y);
          const projected = project(p.x, z * 0.1 + 0.5, p.y);

          if (i === 0) ctx.moveTo(projected.x, projected.y);
          else ctx.lineTo(projected.x, projected.y);
        }
        ctx.stroke();
      }

      // Draw current position (ball)
      const currentZ = surface.fn(positionRef.current.x, positionRef.current.y);
      const ballPos = project(positionRef.current.x, currentZ * 0.1 + 0.5, positionRef.current.y);

      // Ball glow
      const glowGradient = ctx.createRadialGradient(
        ballPos.x, ballPos.y, 0,
        ballPos.x, ballPos.y, 25 * ballPos.scale
      );
      glowGradient.addColorStop(0, "rgba(245, 158, 11, 0.6)");
      glowGradient.addColorStop(1, "transparent");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(ballPos.x, ballPos.y, 25 * ballPos.scale, 0, Math.PI * 2);
      ctx.fill();

      // Ball core
      const ballGradient = ctx.createRadialGradient(
        ballPos.x - 3, ballPos.y - 3, 0,
        ballPos.x, ballPos.y, 12 * ballPos.scale
      );
      ballGradient.addColorStop(0, "#fcd34d");
      ballGradient.addColorStop(1, colors.accent);
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ballPos.x, ballPos.y, 10 * ballPos.scale, 0, Math.PI * 2);
      ctx.fill();

      if (onPositionChange) {
        onPositionChange(positionRef.current.x, positionRef.current.y, currentZ);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        rotationRef.current.y += e.movementX * 0.005;
        rotationRef.current.x += e.movementY * 0.005;
        rotationRef.current.x = Math.max(-1, Math.min(1, rotationRef.current.x));
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [surfaceType, learningRate, isPlaying, isDragging, onPositionChange]);

  useEffect(() => {
    const startPositions = {
      quadratic: { x: 3, y: 3 },
      rosenbrock: { x: -1, y: 1 },
      saddle: { x: 2, y: 0.5 },
      beale: { x: 2, y: 2 },
    };
    positionRef.current = { ...startPositions[surfaceType] };
    pathRef.current = [];
  }, [surfaceType]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ background: "#000" }}
    />
  );
}
