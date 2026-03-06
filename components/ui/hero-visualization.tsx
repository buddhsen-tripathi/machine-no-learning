"use client";

import { useEffect, useRef } from "react";

export function HeroVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Colors
    const isDark = document.documentElement.classList.contains("dark");

    const animate = () => {
      time += 0.015;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const primaryColor = isDark ? "#2dd4bf" : "#0d9488";
      const secondaryColor = isDark ? "#22d3ee" : "#06b6d4";
      const tertiaryColor = isDark ? "#a78bfa" : "#8b5cf6";
      const gridColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
      const axisColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

      // Draw 3D perspective grid
      const gridSize = 20;
      const perspective = 400;
      const offsetY = height * 0.6;

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Horizontal grid lines (going into distance)
      for (let z = 0; z < 20; z++) {
        ctx.beginPath();
        const zPos = z * 30;
        const scale = perspective / (perspective + zPos);
        const y = offsetY - zPos * scale * 0.5;
        const xSpread = width * 0.8 * scale;
        ctx.moveTo(width / 2 - xSpread / 2, y);
        ctx.lineTo(width / 2 + xSpread / 2, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = -10; x <= 10; x++) {
        ctx.beginPath();
        for (let z = 0; z < 20; z++) {
          const zPos = z * 30;
          const scale = perspective / (perspective + zPos);
          const xPos = width / 2 + x * 30 * scale;
          const y = offsetY - zPos * scale * 0.5;
          if (z === 0) ctx.moveTo(xPos, y);
          else ctx.lineTo(xPos, y);
        }
        ctx.stroke();
      }

      // Draw 3D surface wave
      ctx.lineWidth = 2;
      const surfacePoints: { x: number; y: number; z: number }[][] = [];

      for (let zIdx = 0; zIdx < 30; zIdx++) {
        surfacePoints[zIdx] = [];
        for (let xIdx = -15; xIdx <= 15; xIdx++) {
          const xVal = xIdx * 0.3;
          const zVal = zIdx * 0.3;

          // 3D wave function
          const wave = Math.sin(xVal + time) * Math.cos(zVal * 0.5 + time * 0.7) * 40;
          const wave2 = Math.sin(xVal * 0.5 - time * 0.5) * 20;

          const zPos = zIdx * 25;
          const scale = perspective / (perspective + zPos);
          const screenX = width / 2 + xIdx * 25 * scale;
          const screenY = offsetY - zPos * scale * 0.5 - (wave + wave2) * scale;

          surfacePoints[zIdx].push({ x: screenX, y: screenY, z: zPos });
        }
      }

      // Draw surface lines (back to front for proper layering)
      for (let zIdx = surfacePoints.length - 1; zIdx >= 0; zIdx--) {
        const row = surfacePoints[zIdx];
        const alpha = 1 - zIdx / surfacePoints.length * 0.7;

        // Draw horizontal line
        ctx.beginPath();
        ctx.strokeStyle = isDark
          ? `rgba(45, 212, 191, ${alpha * 0.8})`
          : `rgba(13, 148, 136, ${alpha * 0.8})`;

        for (let i = 0; i < row.length; i++) {
          if (i === 0) ctx.moveTo(row[i].x, row[i].y);
          else ctx.lineTo(row[i].x, row[i].y);
        }
        ctx.stroke();
      }

      // Draw vertical connecting lines
      for (let xIdx = 0; xIdx < surfacePoints[0].length; xIdx += 2) {
        ctx.beginPath();
        for (let zIdx = 0; zIdx < surfacePoints.length; zIdx++) {
          const point = surfacePoints[zIdx][xIdx];
          const alpha = 1 - zIdx / surfacePoints.length * 0.7;
          ctx.strokeStyle = isDark
            ? `rgba(34, 211, 238, ${alpha * 0.4})`
            : `rgba(6, 182, 212, ${alpha * 0.4})`;

          if (zIdx === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }

      // Draw floating data points
      const numPoints = 15;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + time * 0.3;
        const radius = 80 + Math.sin(time * 2 + i) * 20;
        const x = width * 0.2 + Math.cos(angle) * radius;
        const y = height * 0.3 + Math.sin(angle) * radius * 0.4;
        const size = 3 + Math.sin(time * 3 + i * 0.5) * 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
        ctx.fill();

        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, isDark ? "rgba(45, 212, 191, 0.3)" : "rgba(13, 148, 136, 0.2)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw neural network on right side
      const nnX = width * 0.8;
      const nnY = height * 0.35;
      const layers = [3, 5, 4, 2];
      const layerSpacing = 60;
      const nodeSpacing = 35;

      const nodePositions: { x: number; y: number }[][] = [];

      // Calculate positions
      layers.forEach((nodeCount, layerIdx) => {
        nodePositions[layerIdx] = [];
        const layerHeight = (nodeCount - 1) * nodeSpacing;
        for (let i = 0; i < nodeCount; i++) {
          nodePositions[layerIdx].push({
            x: nnX + layerIdx * layerSpacing - (layers.length * layerSpacing) / 2,
            y: nnY + i * nodeSpacing - layerHeight / 2,
          });
        }
      });

      // Draw connections
      ctx.lineWidth = 1;
      for (let l = 0; l < nodePositions.length - 1; l++) {
        for (const fromNode of nodePositions[l]) {
          for (const toNode of nodePositions[l + 1]) {
            const pulse = Math.sin(time * 3 + fromNode.x * 0.01 + toNode.y * 0.01);
            const alpha = 0.1 + pulse * 0.1;
            ctx.strokeStyle = isDark
              ? `rgba(167, 139, 250, ${alpha})`
              : `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodePositions.forEach((layer, layerIdx) => {
        layer.forEach((node, nodeIdx) => {
          const pulse = Math.sin(time * 2 + layerIdx + nodeIdx * 0.5);
          const size = 6 + pulse * 2;

          // Glow
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 3);
          gradient.addColorStop(0, isDark ? "rgba(167, 139, 250, 0.4)" : "rgba(139, 92, 246, 0.3)");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Node
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fillStyle = tertiaryColor;
          ctx.fill();
        });
      });

      // Draw sine wave at bottom left
      ctx.beginPath();
      ctx.lineWidth = 2;
      const waveY = height * 0.75;
      for (let x = 0; x < width * 0.35; x += 2) {
        const y = waveY + Math.sin(x * 0.03 + time * 2) * 30 * Math.sin(x * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = isDark ? "rgba(45, 212, 191, 0.5)" : "rgba(13, 148, 136, 0.5)";
      ctx.stroke();

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
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
