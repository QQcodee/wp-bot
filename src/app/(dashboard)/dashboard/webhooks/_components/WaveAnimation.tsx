"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface WaveAnimationProps {
  status: "active" | "error";
}

const WaveAnimation = ({ status }: WaveAnimationProps) => {
  const [waveState, setWaveState] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for container
  const [dotCount, setDotCount] = useState(50); // Dynamic number of dots
  const [xcount, setXcount] = useState(35);

  // Function to generate a sine wave for each dot
  const generateWave = (index: number, waveState: number) => {
    return Math.sin((index + waveState) * 0.6) * 2; // Sine wave calculation
  };

  // Update the waveState to animate the wave
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveState((prev) => prev + 0.2); // Increase the wave phase for animation
    }, 50); // Update every 50ms to create smooth animation

    return () => clearInterval(interval);
  }, []);

  // Dynamically calculate the number of dots based on container width

  return (
    <div ref={containerRef} className="flex w-full items-center justify-center">
      {status === "active" && (
        <div className="flex w-full space-x-2">
          {[...Array(dotCount)].map((_, index) => (
            <motion.div
              key={index}
              className="h-3 w-3 rounded-full bg-green-300"
              style={{
                // Animate the y-position using the sine wave function
                transform: `translateY(${generateWave(index, waveState)}px)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                // Add staggered animation for the wave effect
                delay: index * 0.05,
                duration: 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="flex w-full space-x-2">
          {[...Array(xcount)].map((_, index) => (
            <motion.div
              key={index}
              className="h-5 w-5"
              style={{
                // Animate the y-position using the sine wave function
                transform: `translateY(${generateWave(index, waveState)}px)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                // Add staggered animation for the wave effect
                delay: index * 0.05,
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <X className="h-5 w-5 text-red-300" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaveAnimation;
