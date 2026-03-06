import { Point } from "./regression";
import { colors } from "../colors";

export interface Centroid extends Point {
  cluster: number;
}

export interface ClusteringState {
  points: (Point & { cluster: number })[];
  centroids: Centroid[];
  iteration: number;
  converged: boolean;
}

// Use centralized color palette
export const clusterColors = colors.series;

export function initializeCentroids(
  points: Point[],
  k: number,
  method: "random" | "kmeans++" = "kmeans++"
): Point[] {
  if (method === "random") {
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k);
  }

  // K-means++ initialization
  const centroids: Point[] = [];
  const randomIdx = Math.floor(Math.random() * points.length);
  centroids.push({ ...points[randomIdx] });

  for (let c = 1; c < k; c++) {
    const distances = points.map((p) => {
      const minDist = Math.min(
        ...centroids.map(
          (centroid) => (p.x - centroid.x) ** 2 + (p.y - centroid.y) ** 2
        )
      );
      return minDist;
    });

    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;

    for (let i = 0; i < points.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push({ ...points[i] });
        break;
      }
    }
  }

  return centroids;
}

export function assignClusters(
  points: Point[],
  centroids: Point[]
): (Point & { cluster: number })[] {
  return points.map((p) => {
    let minDist = Infinity;
    let cluster = 0;

    centroids.forEach((c, idx) => {
      const dist = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      if (dist < minDist) {
        minDist = dist;
        cluster = idx;
      }
    });

    return { ...p, cluster };
  });
}

export function updateCentroids(
  points: (Point & { cluster: number })[],
  k: number
): Point[] {
  const newCentroids: Point[] = [];

  for (let c = 0; c < k; c++) {
    const clusterPoints = points.filter((p) => p.cluster === c);

    if (clusterPoints.length === 0) {
      newCentroids.push({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      });
    } else {
      const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
      const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
      newCentroids.push({
        x: sumX / clusterPoints.length,
        y: sumY / clusterPoints.length,
      });
    }
  }

  return newCentroids;
}

export function kMeansStep(state: ClusteringState): ClusteringState {
  const assignedPoints = assignClusters(state.points, state.centroids);
  const newCentroids = updateCentroids(assignedPoints, state.centroids.length);

  const converged = state.centroids.every((c, i) => {
    const dx = c.x - newCentroids[i].x;
    const dy = c.y - newCentroids[i].y;
    return Math.sqrt(dx * dx + dy * dy) < 0.001;
  });

  return {
    points: assignedPoints,
    centroids: newCentroids.map((c, i) => ({ ...c, cluster: i })),
    iteration: state.iteration + 1,
    converged,
  };
}

export function generateClusteredData(
  numClusters: number,
  pointsPerCluster: number,
  spread: number = 1
): Point[] {
  const points: Point[] = [];
  const clusterCenters: Point[] = [];

  for (let i = 0; i < numClusters; i++) {
    clusterCenters.push({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    });
  }

  for (const center of clusterCenters) {
    for (let i = 0; i < pointsPerCluster; i++) {
      points.push({
        x: center.x + (Math.random() - 0.5) * 2 * spread,
        y: center.y + (Math.random() - 0.5) * 2 * spread,
      });
    }
  }

  return points;
}
