"use client";

import { useEffect, useRef } from "react";

export default function Home() {
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
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // 3D rotating torus knot made of particles
    const particles: { x: number; y: number; z: number; baseX: number; baseY: number; baseZ: number }[] = [];
    const numParticles = 2000;

    // Generate torus knot points
    for (let i = 0; i < numParticles; i++) {
      const t = (i / numParticles) * Math.PI * 4;
      const p = 2;
      const q = 3;
      const r = 150;
      const tubeRadius = 60;

      // Torus knot parametric equations
      const phi = t * q;
      const theta = t * p;

      const x = (r + tubeRadius * Math.cos(phi)) * Math.cos(theta);
      const y = (r + tubeRadius * Math.cos(phi)) * Math.sin(theta);
      const z = tubeRadius * Math.sin(phi);

      particles.push({ x, y, z, baseX: x, baseY: y, baseZ: z });
    }

    const animate = () => {
      time += 0.008;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Rotation matrices
      const rotY = time * 0.3;
      const rotX = time * 0.2;
      const rotZ = time * 0.1;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Project and sort particles by depth
      const projected: { x: number; y: number; z: number; alpha: number; size: number }[] = [];

      particles.forEach((p, i) => {
        // Add some wave distortion
        const wave = Math.sin(time * 2 + i * 0.02) * 10;

        let x = p.baseX + wave * 0.3;
        let y = p.baseY;
        let z = p.baseZ + wave * 0.5;

        // Rotate Y
        let temp = x * cosY - z * sinY;
        z = x * sinY + z * cosY;
        x = temp;

        // Rotate X
        temp = y * cosX - z * sinX;
        z = y * sinX + z * cosX;
        y = temp;

        // Rotate Z
        temp = x * cosZ - y * sinZ;
        y = x * sinZ + y * cosZ;
        x = temp;

        // Perspective projection
        const perspective = 600;
        const scale = perspective / (perspective + z + 300);
        const screenX = centerX + x * scale;
        const screenY = centerY + y * scale;

        // Depth-based alpha and size
        const normalizedZ = (z + 300) / 600;
        const alpha = 0.2 + normalizedZ * 0.8;
        const size = 1 + scale * 3;

        projected.push({ x: screenX, y: screenY, z, alpha, size });
      });

      // Sort by z (back to front)
      projected.sort((a, b) => a.z - b.z);

      // Draw particles
      projected.forEach((p, i) => {
        const hue = 160 + (i / projected.length) * 60;

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue}, 70%, 70%, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines between nearby particles (sparse)
      ctx.strokeStyle = "rgba(16, 185, 129, 0.03)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i += 10) {
        const nextIdx = (i + 10) % projected.length;
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[nextIdx].x, projected[nextIdx].y);
        ctx.stroke();
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
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Visualization */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100vw", height: "100vh" }}
      />

      {/* Header - minimal */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6">
        <span className="text-white/90 text-sm tracking-wide">
          nothing but machine learning
        </span>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
      </header>

      {/* Bottom - explore link */}
      <a
        href="/visualizations"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-6 py-3 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/30 rounded-full backdrop-blur-sm transition-all hover:scale-105"
      >
        explore visualizations
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    </div>
  );
}
