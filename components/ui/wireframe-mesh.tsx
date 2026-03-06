"use client";

import { useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function WireframeMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Grid parameters
    const gridSize = 40;
    const spacing = 25;

    const project = (point: Point3D, width: number, height: number) => {
      const fov = 500;
      const viewDistance = 600;
      const scale = fov / (viewDistance + point.z);

      return {
        x: point.x * scale + width / 2,
        y: point.y * scale + height / 2,
        scale,
      };
    };

    const animate = () => {
      time += 0.008;
      const { width, height } = canvas;

      // Clear with fade effect for trail
      ctx.fillStyle = "rgba(5, 5, 8, 0.15)";
      ctx.fillRect(0, 0, width, height);

      const points: Point3D[][] = [];

      // Generate terrain points
      for (let i = 0; i < gridSize; i++) {
        points[i] = [];
        for (let j = 0; j < gridSize; j++) {
          const x = (i - gridSize / 2) * spacing;
          const z = (j - gridSize / 2) * spacing + 200;

          // Wave function for terrain
          const wave1 = Math.sin(i * 0.15 + time) * 40;
          const wave2 = Math.cos(j * 0.12 + time * 0.8) * 35;
          const wave3 = Math.sin((i + j) * 0.1 + time * 0.5) * 25;
          const y = wave1 + wave2 + wave3 + 150;

          points[i][j] = { x, y, z };
        }
      }

      // Draw horizontal lines
      for (let i = 0; i < gridSize; i++) {
        ctx.beginPath();
        for (let j = 0; j < gridSize; j++) {
          const projected = project(points[i][j], width, height);

          // Gradient based on depth and position
          const alpha = Math.max(0.05, Math.min(0.6, 1 - points[i][j].z / 800));
          const greenIntensity = Math.floor(180 + (points[i][j].y - 100) * 0.5);
          const blueIntensity = Math.floor(220 - (points[i][j].y - 100) * 0.3);

          ctx.strokeStyle = `rgba(${Math.floor(greenIntensity * 0.3)}, ${greenIntensity}, ${blueIntensity}, ${alpha})`;
          ctx.lineWidth = projected.scale * 1.2;

          if (j === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let j = 0; j < gridSize; j++) {
        ctx.beginPath();
        for (let i = 0; i < gridSize; i++) {
          const projected = project(points[i][j], width, height);

          const alpha = Math.max(0.05, Math.min(0.5, 1 - points[i][j].z / 800));
          const greenIntensity = Math.floor(160 + (points[i][j].y - 100) * 0.4);

          ctx.strokeStyle = `rgba(20, ${greenIntensity}, 180, ${alpha})`;
          ctx.lineWidth = projected.scale * 0.8;

          if (i === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.stroke();
      }

      // Draw glowing vertices on peaks
      for (let i = 0; i < gridSize; i += 3) {
        for (let j = 0; j < gridSize; j += 3) {
          const point = points[i][j];
          if (point.y < 120) {
            const projected = project(point, width, height);
            const glowSize = (150 - point.y) * 0.03 * projected.scale;

            const gradient = ctx.createRadialGradient(
              projected.x,
              projected.y,
              0,
              projected.x,
              projected.y,
              glowSize * 3
            );
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
            gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.3)");
            gradient.addColorStop(1, "rgba(6, 182, 212, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, glowSize * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
