'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let chakras: ChakraSymbol[] = [];
    let sacredGeometries: SacredGeometry[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.4 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          type: Math.random() > 0.7 ? 'star' : 'dot',
        });
      }
    };

    const createChakras = () => {
      chakras = [];
      const chakraData = [
        { color: 'rgba(220, 60, 60, 0.1)', petals: 4, label: 'Muladhara' },
        { color: 'rgba(230, 130, 50, 0.1)', petals: 6, label: 'Svadhisthana' },
        { color: 'rgba(230, 190, 50, 0.1)', petals: 10, label: 'Manipura' },
        { color: 'rgba(60, 170, 90, 0.1)', petals: 12, label: 'Anahata' },
        { color: 'rgba(60, 150, 200, 0.1)', petals: 16, label: 'Vishuddha' },
      ];
      
      for (let i = 0; i < 4; i++) {
        const data = chakraData[i % chakraData.length];
        chakras.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 50 + 40,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.002,
          opacity: Math.random() * 0.06 + 0.04,
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
          opacity: Math.random() * 0.05 + 0.03,
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
      ctx.fillStyle = `rgba(201, 150, 80, ${opacity})`;
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

      // Outer glow
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 1.5);
      glowGradient.addColorStop(0, color.replace('0.1', String(currentOpacity * 0.5)));
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(-currentSize * 1.5, -currentSize * 1.5, currentSize * 3, currentSize * 3);

      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace('0.1', String(currentOpacity * 1.2));
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace('0.1', String(currentOpacity * 0.8));
      ctx.lineWidth = 1;
      ctx.stroke();

      // Petals
      if (petals >= 4 && petals <= 20) {
        for (let i = 0; i < petals; i++) {
          const angle = (i * 2 * Math.PI) / petals;
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -currentSize * 0.75, currentSize * 0.12, currentSize * 0.35, 0, 0, Math.PI * 2);
          ctx.strokeStyle = color.replace('0.1', String(currentOpacity * 0.6));
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Center bindu (divine point)
      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = color.replace('0.1', String(currentOpacity * 2));
      ctx.fill();

      // Inner triangle (for spiritual symbolism)
      ctx.beginPath();
      ctx.moveTo(0, -currentSize * 0.3);
      ctx.lineTo(-currentSize * 0.26, currentSize * 0.15);
      ctx.lineTo(currentSize * 0.26, currentSize * 0.15);
      ctx.closePath();
      ctx.strokeStyle = color.replace('0.1', String(currentOpacity * 0.8));
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };

    const drawMandala = (geo: SacredGeometry, time: number) => {
      const { x, y, size, rotation, opacity } = geo;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + time * 0.0002);

      // Outer ring with decorative pattern
      const rings = 5;
      for (let r = 1; r <= rings; r++) {
        const radius = (size * r) / rings;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * (1 - r / (rings + 1)) * 0.6})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Dots on each ring
        const dots = r * 8;
        for (let i = 0; i < dots; i++) {
          const angle = (i * 2 * Math.PI) / dots + time * 0.0001 * r;
          const dx = Math.cos(angle) * radius;
          const dy = Math.sin(angle) * radius;
          ctx.beginPath();
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 150, 80, ${opacity * 0.7})`;
          ctx.fill();
        }
      }

      // Radial lines
      const lines = 16;
      for (let i = 0; i < lines; i++) {
        const angle = (i * 2 * Math.PI) / lines;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.25})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Center lotus pattern
      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.25, size * 0.08, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 150, 80, ${opacity * 0.15})`;
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

      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer downward triangle
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.9);
      ctx.lineTo(-size * 0.78, size * 0.45);
      ctx.lineTo(size * 0.78, size * 0.45);
      ctx.closePath();
      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.6})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Outer upward triangle
      ctx.beginPath();
      ctx.moveTo(0, size * 0.9);
      ctx.lineTo(-size * 0.78, -size * 0.45);
      ctx.lineTo(size * 0.78, -size * 0.45);
      ctx.closePath();
      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner downward triangle
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(-size * 0.43, size * 0.25);
      ctx.lineTo(size * 0.43, size * 0.25);
      ctx.closePath();
      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.45})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Inner upward triangle
      ctx.beginPath();
      ctx.moveTo(0, size * 0.5);
      ctx.lineTo(-size * 0.43, -size * 0.25);
      ctx.lineTo(size * 0.43, -size * 0.25);
      ctx.closePath();
      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Center bindu (divine point)
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 120, 42, ${opacity * 1.2})`;
      ctx.fill();

      // Inner circles
      [0.2, 0.35].forEach((r) => {
        ctx.beginPath();
        ctx.arc(0, 0, size * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.3})`;
        ctx.lineWidth = 0.5;
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

      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Stylized Om symbol
      ctx.beginPath();
      
      // Lower curve (3-like shape)
      ctx.moveTo(-size * 0.35, size * 0.15);
      ctx.bezierCurveTo(-size * 0.55, size * 0.15, -size * 0.55, -size * 0.15, -size * 0.35, -size * 0.15);
      ctx.bezierCurveTo(-size * 0.15, -size * 0.15, -size * 0.15, size * 0.05, -size * 0.25, size * 0.05);
      
      // Upper curve connecting to vertical
      ctx.bezierCurveTo(-size * 0.1, size * 0.05, -size * 0.05, -size * 0.1, 0, -size * 0.1);
      
      // Vertical stroke of Ma
      ctx.moveTo(size * 0.02, -size * 0.1);
      ctx.lineTo(size * 0.02, size * 0.2);
      
      // Right curve of Ma
      ctx.moveTo(size * 0.02, -size * 0.05);
      ctx.quadraticCurveTo(size * 0.15, -size * 0.05, size * 0.2, size * 0.05);
      ctx.lineTo(size * 0.2, size * 0.2);
      
      // Chandra bindu (crescent moon above)
      ctx.moveTo(-size * 0.05, -size * 0.35);
      ctx.quadraticCurveTo(size * 0.08, -size * 0.5, size * 0.2, -size * 0.35);
      
      // Dot above crescent
      ctx.moveTo(size * 0.08, -size * 0.55);
      ctx.arc(size * 0.08, -size * 0.55, size * 0.06, 0, Math.PI * 2);

      ctx.stroke();

      // Soft glow
      ctx.shadowColor = 'rgba(201, 150, 80, 0.25)';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Decorative circle around Om
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 130, 70, ${opacity * 0.3})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
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
          ctx.fillStyle = `rgba(201, 150, 80, ${currentOpacity})`;
          ctx.fill();
        }

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          gradient.addColorStop(0, `rgba(201, 150, 80, ${currentOpacity * 0.2})`);
          gradient.addColorStop(1, 'rgba(201, 150, 80, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Draw chakras
      chakras.forEach((chakra) => {
        chakra.rotation += chakra.rotationSpeed;
        drawChakra(chakra, time);
      });

      // Draw sacred geometries
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
