"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const visualizations = [
  { title: "Gradient Descent", href: "/gradient-descent" },
  { title: "Linear Regression", href: "/linear-regression" },
  { title: "Neural Network", href: "/neural-network" },
  { title: "Activation Functions", href: "/activation-functions" },
  { title: "Loss Functions", href: "/loss-functions" },
  { title: "Decision Boundary", href: "/decision-boundary" },
  { title: "Clustering", href: "/clustering" },
  { title: "Function Plotter", href: "/functions" },
];

export default function VisualizationsPage() {
  return (
    <div className="min-h-screen bg-black pt-20 px-6 pb-12">
      <div className="max-w-md mx-auto">
        <div className="space-y-2">
          {visualizations.map((viz, i) => (
            <motion.div
              key={viz.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={viz.href}
                className="flex items-center justify-between py-3 text-white/60 hover:text-white transition-colors group"
              >
                <span className="text-sm">{viz.title}</span>
                <svg
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
