// src/components/common/AnimatedBackground.jsx
import React from "react";

/**
 * Animated gradient background with floating orbs
 * Used in hero sections and cards
 */
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
};

export default AnimatedBackground;