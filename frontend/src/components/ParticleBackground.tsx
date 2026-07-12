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
      // Different sizes: 1.0px to 2.8px
      const size = Math.random() * 1.8 + 1.0;
      return {
        x: fromLeft ? -10 : Math.random() * (canvas?.width || 800),
        y: Math.random() * (canvas?.height || 600),
        // Distinct speed variance: slow drift (0.15) to swift flow (1.65)
        vx: Math.random() * 1.5 + 0.15,
        vy: (Math.random() - 0.5) * 0.3,
        size,
        opacity: Math.random() * 0.14 + 0.06, // subtle
        pulseSpeed: 0.015 + Math.random() * 0.035,
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

        // Splitting behavior: increased split chance (0.005) for visible splits
        if (p.size > 1.8 && Math.random() < 0.005 && particles.length < maxParticles + 12) {
          const sizeSplit = p.size * 0.6;
          // Spawn two daughter particles moving at different speeds & trajectories
          nextParticles.push({
            ...p,
            size: sizeSplit,
            vx: p.vx * 1.3, // speeds up
            vy: p.vy + 0.18
          });
          nextParticles.push({
            ...p,
            x: p.x - 3,
            size: sizeSplit,
            vx: p.vx * 0.75, // slows down
            vy: p.vy - 0.18
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

          if (dist < 20) { // 20px merge radius
            // Fuse properties: increase size and bump opacity/glow temporarily
            const newSize = Math.min(p.size + other.size * 0.4, 4.0);
            p.x = (p.x + other.x) / 2;
            p.y = (p.y + other.y) / 2;
            p.size = newSize;
            // Weighted average speed
            p.vx = (p.vx + other.vx) / 2;
            p.vy = (p.vy + other.vy) / 2;
            p.opacity = Math.min(p.opacity + 0.06, 0.4); // brief bright flare on merge

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
