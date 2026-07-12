import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulseSpeed: number;
  pulseTime: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 40; // Keep it clean, performant, and extremely subtle

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticle = (fromLeft = false): Particle => {
      const size = Math.random() * 1.5 + 1.0; // 1px to 2.5px
      return {
        x: fromLeft ? -10 : Math.random() * (canvas?.width || 800),
        y: Math.random() * (canvas?.height || 600),
        vx: Math.random() * 0.9 + 0.3, // different speeds, mostly moving horizontally
        vy: (Math.random() - 0.5) * 0.25, // diagonal drift angle
        size,
        opacity: Math.random() * 0.14 + 0.06, // extremely subtle opacity: 0.06 to 0.20
        pulseSpeed: 0.01 + Math.random() * 0.03,
        pulseTime: Math.random() * Math.PI
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(false));
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nextParticles: Particle[] = [];
      const mergedIndices = new Set<number>();

      // Update position, handle splits & merges
      for (let i = 0; i < particles.length; i++) {
        if (mergedIndices.has(i)) continue;

        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseTime += p.pulseSpeed;

        // Splitting behavior: extremely low chance to split if particle size is big enough
        if (p.size > 1.7 && Math.random() < 0.0015 && particles.length < maxParticles + 8) {
          const sizeSplit = p.size * 0.65;
          nextParticles.push({
            ...p,
            size: sizeSplit,
            vx: p.vx * 1.15,
            vy: p.vy + 0.12
          });
          nextParticles.push({
            ...p,
            x: p.x - 2,
            size: sizeSplit,
            vx: p.vx * 0.85,
            vy: p.vy - 0.12
          });
          continue;
        }

        // Merging check: merge with another close particle
        for (let j = i + 1; j < particles.length; j++) {
          if (mergedIndices.has(j)) continue;
          const other = particles[j];

          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 18) { // 18px boundary to merge
            const newSize = Math.min(p.size + other.size * 0.35, 3.5);
            p.x = (p.x + other.x) / 2;
            p.y = (p.y + other.y) / 2;
            p.size = newSize;
            p.vx = (p.vx + other.vx) / 2;
            p.vy = (p.vy + other.vy) / 2;
            p.opacity = Math.min(p.opacity + 0.04, 0.35); // merge splits glow slightly

            mergedIndices.add(j);
            break;
          }
        }

        // Wrap boundaries
        if (p.x > canvas.width + 15 || p.y < -15 || p.y > canvas.height + 15) {
          nextParticles.push(createParticle(true));
        } else {
          nextParticles.push(p);
        }
      }

      particles = nextParticles;

      // Draw subtle connecting lines representing network information flow
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.05; // extremely subtle connection line: 0 to 0.05
            ctx.strokeStyle = `rgba(62, 92, 75, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles with glowing pulse
      for (const p of particles) {
        const currentOpacity = p.opacity + Math.sin(p.pulseTime) * 0.04;
        ctx.fillStyle = `rgba(62, 92, 75, ${Math.max(0.04, currentOpacity)})`;
        
        ctx.shadowColor = 'rgba(62, 92, 75, 0.3)';
        ctx.shadowBlur = p.size * 1.8;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0; // reset blur

      // Refill to keep particle count stable
      while (particles.length < maxParticles) {
        particles.push(createParticle(true));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-0 block bg-transparent"
    />
  );
}
