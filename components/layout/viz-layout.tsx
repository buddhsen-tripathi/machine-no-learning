"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VizLayoutProps {
  title: string;
  children: ReactNode;
  controls?: ReactNode;
  isPlaying?: boolean; // Auto-close controls when true
}

export function VizLayout({ title, children, controls, isPlaying }: VizLayoutProps) {
  const [showControls, setShowControls] = useState(false);

  // Auto-close controls when playing starts
  useEffect(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, [isPlaying]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] bg-black overflow-hidden">
      {/* Visualization - always full screen */}
      <div className="absolute inset-0">
        {children}
      </div>

      {/* Title overlay - top left */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-white/90 text-sm tracking-wide">{title}</h1>
      </div>

      {/* Controls toggle - bottom right */}
      {controls && (
        <>
          <button
            onClick={() => setShowControls(!showControls)}
            className={`absolute bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2 text-sm border rounded-full backdrop-blur-sm transition-all ${
              showControls
                ? "bg-white/10 border-white/20 text-white"
                : "bg-black/50 border-white/10 text-white/70 hover:text-white hover:border-white/30"
            }`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showControls ? 'rotate-45' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            controls
          </button>

          {/* Controls panel - overlay at bottom */}
          <AnimatePresence>
            {showControls && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10"
                  onClick={() => setShowControls(false)}
                />

                {/* Controls panel */}
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute bottom-0 left-0 right-0 z-20 max-h-[70vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 p-6 pb-20">
                    <div className="max-w-4xl mx-auto">
                      {controls}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
