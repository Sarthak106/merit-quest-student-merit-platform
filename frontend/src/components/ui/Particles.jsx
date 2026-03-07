/*
 * Particles – lightweight CSS-only ambient particles.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Particles({ count = 30, className = '' }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.05,
      })),
    [count],
  );

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-indigo-400"
          style={{
            width: d.size,
            height: d.size,
            left: `${d.x}%`,
            top: `${d.y}%`,
            opacity: d.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [d.opacity, d.opacity * 2, d.opacity],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
