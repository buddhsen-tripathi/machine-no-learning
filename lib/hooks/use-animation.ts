"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAnimationOptions {
  duration?: number;
  fps?: number;
  autoStart?: boolean;
  loop?: boolean;
}

export function useAnimation(options: UseAnimationOptions = {}) {
  const { duration = 2000, fps = 60, autoStart = false, loop = false } = options;

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const frameInterval = 1000 / fps;

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);

      setProgress(newProgress);

      if (newProgress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else if (loop) {
        startTimeRef.current = null;
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    },
    [duration, loop]
  );

  const play = useCallback(() => {
    if (progress >= 1) {
      startTimeRef.current = null;
      setProgress(0);
    }
    setIsPlaying(true);
  }, [progress]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    startTimeRef.current = null;
  }, []);

  const step = useCallback(
    (stepSize: number = 0.01) => {
      setProgress((prev) => Math.min(Math.max(prev + stepSize, 0), 1));
    },
    []
  );

  useEffect(() => {
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(animate);
    } else if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, animate]);

  return {
    progress,
    isPlaying,
    play,
    pause,
    reset,
    step,
    setProgress,
  };
}

export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
}
