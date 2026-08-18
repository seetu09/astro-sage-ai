'use client';

import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function WarmGlow() {
  const { resolvedTheme, mounted } = useTheme();
  const isDark = mounted ? resolvedTheme === 'night' : false;

  const topOrbOpacity = isDark ? [0.15, 0.25, 0.15] : [0.10, 0.18, 0.10];
  const topOrbDuration = isDark ? 8 : 12;
  const topOrbBg = isDark
    ? 'radial-gradient(circle, rgba(201, 120, 42, 0.4) 0%, rgba(232, 168, 92, 0.2) 40%, transparent 70%)'
    : 'radial-gradient(circle, rgba(201, 120, 42, 0.28) 0%, rgba(232, 168, 92, 0.14) 40%, transparent 70%)';

  const bottomOrbOpacity = isDark ? [0.10, 0.20, 0.10] : [0.07, 0.14, 0.07];
  const bottomOrbDuration = isDark ? 10 : 15;
  const bottomOrbBg = isDark
    ? 'radial-gradient(circle, rgba(201, 120, 42, 0.3) 0%, rgba(232, 168, 92, 0.15) 40%, transparent 70%)'
    : 'radial-gradient(circle, rgba(201, 120, 42, 0.22) 0%, rgba(232, 168, 92, 0.10) 40%, transparent 70%)';

  const centerGlowOpacity = isDark ? [0.05, 0.10, 0.05] : [0.03, 0.06, 0.03];
  const centerGlowDuration = isDark ? 6 : 9;
  const centerGlowBg = isDark
    ? 'radial-gradient(circle, rgba(201, 120, 42, 0.2) 0%, transparent 60%)'
    : 'radial-gradient(circle, rgba(201, 120, 42, 0.14) 0%, transparent 60%)';

  const gridOpacity = isDark ? 0.02 : 0.012;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: topOrbOpacity,
        }}
        transition={{
          duration: topOrbDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{ background: topOrbBg }}
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: bottomOrbOpacity,
        }}
        transition={{
          duration: bottomOrbDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full"
        style={{ background: bottomOrbBg }}
      />

      <motion.div
        animate={{
          opacity: centerGlowOpacity,
        }}
        transition={{
          duration: centerGlowDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{ background: centerGlowBg }}
      />

      <div
        className="absolute inset-0"
        style={{
          opacity: gridOpacity,
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
