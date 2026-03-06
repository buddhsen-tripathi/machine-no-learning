"use client";

import { useEffect, useRef } from "react";

export function TerrainMesh() {
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

    const animate = () => {
      time += 0.008;
      const { width, height } = canvas;

      // Clear with dark background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Terrain parameters
      const cols = 60;
      const rows = 40;
      const cellWidth = width / (cols - 1);
      const perspective = 300;
      const cameraY = height * 0.4;
      const terrainDepth = height * 1.2;
      const terrainStartY = height * 0.35;

      // Generate terrain heights
      const heights: number[][] = [];
      for (let z = 0; z < rows; z++) {
        heights[z] = [];
        for (let x = 0; x < cols; x++) {
          // Multiple wave functions for natural terrain
          const nx = x / cols;
          const nz = z / rows;

          const wave1 = Math.sin(nx * 4 + time) * Math.cos(nz * 3 + time * 0.7) * 60;
          const wave2 = Math.sin(nx * 2 - time * 0.5) * Math.sin(nz * 2 + time * 0.3) * 40;
          const wave3 = Math.cos(nx * 6 + nz * 4 + time * 0.4) * 25;
          const ridge = Math.sin(nx * Math.PI) * 30; // Creates a ridge in the middle

          heights[z][x] = wave1 + wave2 + wave3 + ridge;
        }
      }

      // Project 3D point to 2D screen
      const project = (x: number, y: number, z: number) => {
        const scale = perspective / (perspective + z);
        const screenX = width / 2 + (x - width / 2) * scale;
        const screenY = cameraY + (y - cameraY) * scale + z * 0.5;
        return { x: screenX, y: screenY, scale };
      };

      // Draw horizontal lines (going into the distance)
      for (let z = 0; z < rows; z++) {
        const zPos = (z / rows) * terrainDepth;
        const alpha = Math.max(0.1, 1 - z / rows);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.7})`;
        ctx.lineWidth = Math.max(0.5, 1.5 - z / rows);

        for (let x = 0; x < cols; x++) {
          const xPos = x * cellWidth;
          const yPos = terrainStartY - heights[z][x];
          const projected = project(xPos, yPos, zPos);

          if (x === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines (across the terrain)
      for (let x = 0; x < cols; x++) {
        const xPos = x * cellWidth;
        const alpha = 0.4;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 0.5;

        for (let z = 0; z < rows; z++) {
          const zPos = (z / rows) * terrainDepth;
          const yPos = terrainStartY - heights[z][x];
          const projected = project(xPos, yPos, zPos);
          const lineAlpha = Math.max(0.1, 1 - z / rows);

          ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha * 0.4})`;

          if (z === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.stroke();
      }

      // Add subtle glow on peaks
      for (let z = 0; z < rows; z += 4) {
        for (let x = 0; x < cols; x += 4) {
          const height = heights[z][x];
          if (height > 40) {
            const xPos = x * cellWidth;
            const zPos = (z / rows) * terrainDepth;
            const yPos = terrainStartY - height;
            const projected = project(xPos, yPos, zPos);
            const alpha = Math.max(0, (1 - z / rows) * 0.3);

            const gradient = ctx.createRadialGradient(
              projected.x, projected.y, 0,
              projected.x, projected.y, 15 * projected.scale
            );
            gradient.addColorStop(0, `rgba(16, 185, 129, ${alpha})`);
            gradient.addColorStop(1, "transparent");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, 15 * projected.scale, 0, Math.PI * 2);
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
