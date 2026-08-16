'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  type: 'star' | 'dot';
}

interface ChakraSymbol {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
  petals: number;
  label: string;
}

interface SacredGeometry {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'mandala' | 'sriyantra' | 'om';
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme, mounted } = useTheme();

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let chakras: ChakraSymbol[] = [];
    let sacredGeometries: SacredGeometry[] = [];

    const isDark = resolvedTheme === 'night';
    
    const colors = {
      star: isDark ? '251, 191, 36' : '201, 150, 80',
      glow: isDark ? '245, 158, 11' : '201, 150, 80',
      line: isDark ? '180, 130, 70' : '180, 130, 70',
      bgStart: isDark ? '#1a1209' : '#faf6f0',
      bgEnd: isDark ? '#0f0a05' : '#faf6f0',
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(isDark ? 80 : 50, Math.floor((canvas.width * canvas.height) / 25000));

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (isDark ? 2.5 : 2) + 0.5,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * (isDark ? 0.6 : 0.4) + (isDark ? 0.2 : 0.1),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          type: Math.random() > 0.7 ? 'star' : 'dot',
        });
      }
    };

    const createChakras = () => {
      chakras = [];
      const chakraData = [
        { color: isDark ? 'rgba(220, 60, 60, 0.15)' : 'rgba(220, 60, 60, 0.1)', petals: 4, label: 'Muladhara' },
        { color: isDark ? 'rgba(230, 130, 50, 0.15)' : 'rgba(230, 130, 50, 0.1)', petals: 6, label: 'Svadhisthana' },
        { color: isDark ? 'rgba(230, 190, 50, 0.15)' : 'rgba(230, 190, 50, 0.1)', petals: 10, label: 'Manipura' },
        { color: isDark ? 'rgba(60, 170, 90, 0.15)' : 'rgba(60, 170, 90, 0.1)', petals: 12, label: 'Anahata' },
        { color: isDark ? 'rgba(60, 150, 200, 0.15)' : 'rgba(60, 150, 200, 0.1)', petals: 16, label: 'Vishuddha' },
      ];

      for (let i = 0; i < 4; i++) {
        const data = chakraData[i % chakraData.length];
        chakras.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 50 + 40,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.002,
          opacity: Math.random() * (isDark ? 0.1 : 0.06) + (isDark ? 0.06 : 0.04),
          pulseSpeed: Math.random() * 0.008 + 0.003,
          pulsePhase: Math.random() * Math.PI * 2,
          color: data.color,
          petals: data.petals,
          label: data.label,
        });
      }
    };

    const createSacredGeometries = () => {
      sacredGeometries = [];
      const types: SacredGeometry['type'][] = ['mandala', 'sriyantra', 'om', 'mandala'];

      for (let i = 0; i < 4; i++) {
        sacredGeometries.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 100 + 70,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.0015,
          opacity: Math.random() * (isDark ? 0.08 : 0.05) + (isDark ? 0.05 : 0.03),
          type: types[i % types.length],
        });
      }
    };

    const drawStar = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${colors.star}, ${opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const drawChakra = (chakra: ChakraSymbol, time: number) => {
      const { x, y, size, rotation, opacity, pulseSpeed, pulsePhase, color, petals } = chakra;
      const pulse = Math.sin(time * pulseSpeed + pulsePhase) * 0.3 + 0.7;
      const currentSize = size * pulse;
      const currentOpacity = opacity * pulse;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + time * 0.0003);

      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 1.5);
      glowGradient.addColorStop(0, color.replace(isDark ? '0.15' : '0.1', String(currentOpacity * (isDark ? 0.7 : 0.5))));
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(-currentSize * 1.5, -currentSize * 1.5, currentSize * 3, currentSize * 3);

      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace(isDark ? '0.15' : '0.1', String(currentOpacity * (isDark ? 1.5 : 1.2)));
      ctx.lineWidth = isDark ? 2 : 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace(isDark ? '0.15' : '0.1', String(currentOpacity * (isDark ? 1.0 : 0.8)));
      ctx.lineWidth = 1;
      ctx.stroke();

      if (petals >= 4 && petals <= 20) {
        for (let i = 0; i < petals; i++) {
          const angle = (i * 2 * Math.PI) / petals;
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -currentSize * 0.75, currentSize * 0.12, currentSize * 0.35, 0, 0, Math.PI * 2);
          ctx.strokeStyle = color.replace(isDark ? '0.15' : '0.1', String(currentOpacity * (isDark ? 0.9 : 0.6)));
          ctx.lineWidth = isDark ? 1.2 : 0.8;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(isDark ? '0.15' : '0.1', String(currentOpacity * (isDark ? 2.5 : 2)));
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -currentSize * 0.3);
      ctx.lineTo(-currentSize * 0.26, currentSize * 0.15);
      ctx.lineTo(currentSize * 0.26, currentSize * 0.15);
      ctx.closePath();
      ctx.strokeStyle = color.replace(isDark ? '0.15' : '0.1', String(currentOpacity * (isDark ? 1.0 : 0.8)));
      ctx.lineWidth = isDark ? 1 : 0.8;
      ctx.stroke();

      ctx.restore();
    };

    const drawMandala = (geo: SacredGeometry, time: number) => {
      const { x, y, size, rotation, opacity } = geo;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + time * 0.0002);

      const rings = 5;
      for (let r = 1; r <= rings; r++) {
        const radius = (size * r) / rings;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (1 - r / (rings + 1)) * (isDark ? 0.9 : 0.6)})`;
        ctx.lineWidth = isDark ? 0.8 : 0.6;
        ctx.stroke();

        const dots = r * 8;
        for (let i = 0; i < dots; i++) {
          const angle = (i * 2 * Math.PI) / dots + time * 0.0001 * r;
          const dx = Math.cos(angle) * radius;
          const dy = Math.sin(angle) * radius;
          ctx.beginPath();
          ctx.arc(dx, dy, isDark ? 2 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colors.star}, ${opacity * (isDark ? 1.0 : 0.7)})`;
          ctx.fill();
        }
      }

      const lines = 16;
      for (let i = 0; i < lines; i++) {
        const angle = (i * 2 * Math.PI) / lines;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.4 : 0.25)})`;
        ctx.lineWidth = isDark ? 0.6 : 0.4;
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.25, size * 0.08, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.star}, ${opacity * (isDark ? 0.25 : 0.15)})`;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    const drawSriYantra = (geo: SacredGeometry, time: number) => {
      const { x, y, size, rotation, opacity } = geo;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + time * 0.00015);

      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.8 : 0.5)})`;
      ctx.lineWidth = isDark ? 1.2 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -size * 0.9);
      ctx.lineTo(-size * 0.78, size * 0.45);
      ctx.lineTo(size * 0.78, size * 0.45);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.9 : 0.6)})`;
      ctx.lineWidth = isDark ? 1.5 : 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, size * 0.9);
      ctx.lineTo(-size * 0.78, -size * 0.45);
      ctx.lineTo(size * 0.78, -size * 0.45);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.8 : 0.5)})`;
      ctx.lineWidth = isDark ? 1.2 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(-size * 0.43, size * 0.25);
      ctx.lineTo(size * 0.43, size * 0.25);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.7 : 0.45)})`;
      ctx.lineWidth = isDark ? 1.1 : 0.9;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, size * 0.5);
      ctx.lineTo(-size * 0.43, -size * 0.25);
      ctx.lineTo(size * 0.43, -size * 0.25);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.6 : 0.4)})`;
      ctx.lineWidth = isDark ? 1 : 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${isDark ? '245, 158, 11' : '201, 120, 42'}, ${opacity * (isDark ? 1.5 : 1.2)})`;
      ctx.fill();

      [0.2, 0.35].forEach((r) => {
        ctx.beginPath();
        ctx.arc(0, 0, size * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.5 : 0.3)})`;
        ctx.lineWidth = isDark ? 0.7 : 0.5;
        ctx.stroke();
      });

      ctx.restore();
    };

    const drawOm = (geo: SacredGeometry, time: number) => {
      const { x, y, size, rotation, opacity } = geo;
      const pulse = Math.sin(time * 0.002) * 0.15 + 0.85;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(pulse, pulse);

      ctx.strokeStyle = `rgba(${colors.line}, ${opacity})`;
      ctx.lineWidth = isDark ? 3 : 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(-size * 0.35, size * 0.15);
      ctx.bezierCurveTo(-size * 0.55, size * 0.15, -size * 0.55, -size * 0.15, -size * 0.35, -size * 0.15);
      ctx.bezierCurveTo(-size * 0.15, -size * 0.15, -size * 0.15, size * 0.05, -size * 0.25, size * 0.05);
      ctx.bezierCurveTo(-size * 0.1, size * 0.05, -size * 0.05, -size * 0.1, 0, -size * 0.1);
      ctx.moveTo(size * 0.02, -size * 0.1);
      ctx.lineTo(size * 0.02, size * 0.2);
      ctx.moveTo(size * 0.02, -size * 0.05);
      ctx.quadraticCurveTo(size * 0.15, -size * 0.05, size * 0.2, size * 0.05);
      ctx.lineTo(size * 0.2, size * 0.2);
      ctx.moveTo(-size * 0.05, -size * 0.35);
      ctx.quadraticCurveTo(size * 0.08, -size * 0.5, size * 0.2, -size * 0.35);
      ctx.moveTo(size * 0.08, -size * 0.55);
      ctx.arc(size * 0.08, -size * 0.55, size * 0.06, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = `rgba(${colors.glow}, ${isDark ? 0.4 : 0.25})`;
      ctx.shadowBlur = isDark ? 30 : 20;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${colors.line}, ${opacity * (isDark ? 0.5 : 0.3)})`;
      ctx.lineWidth = isDark ? 1 : 0.8;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    };

    const draw = (time: number) => {
      if (isDark) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width
        );
        gradient.addColorStop(0, colors.bgStart);
        gradient.addColorStop(1, colors.bgEnd);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = colors.bgStart;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase);
        const currentOpacity = p.opacity * (0.5 + 0.5 * twinkle);

        if (p.type === 'star') {
          drawStar(p.x, p.y, p.size * 1.5, currentOpacity);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colors.star}, ${currentOpacity})`;
          ctx.fill();
        }

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          gradient.addColorStop(0, `rgba(${colors.star}, ${currentOpacity * (isDark ? 0.4 : 0.2)})`);
          gradient.addColorStop(1, `rgba(${colors.star}, 0)`);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      chakras.forEach((chakra) => {
        chakra.rotation += chakra.rotationSpeed;
        drawChakra(chakra, time);
      });

      sacredGeometries.forEach((geo) => {
        geo.rotation += geo.rotationSpeed;
        switch (geo.type) {
          case 'mandala':
            drawMandala(geo, time);
            break;
          case 'sriyantra':
            drawSriYantra(geo, time);
            break;
          case 'om':
            drawOm(geo, time);
            break;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    createChakras();
    createSacredGeometries();
    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      resize();
      createParticles();
      createChakras();
      createSacredGeometries();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [resolvedTheme, mounted]);

  // Don't render canvas until mounted (prevents SSR issues)
  if (!mounted) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundColor: '#faf6f0' }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
