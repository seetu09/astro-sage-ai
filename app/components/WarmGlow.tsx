'use client';

import { motion } from 'framer-motion';

export default function WarmGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-right warm orb */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201, 120, 42, 0.4) 0%, rgba(232, 168, 92, 0.2) 40%, transparent 70%)',
        }}
      />

      {/* Bottom-left warm orb */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201, 120, 42, 0.3) 0%, rgba(232, 168, 92, 0.15) 40%, transparent 70%)',
        }}
      />

      {/* Center subtle glow */}
      <motion.div
        animate={{
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201, 120, 42, 0.2) 0%, transparent 60%)',
        }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 120, 42, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 120, 42, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
