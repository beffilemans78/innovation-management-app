"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  depth: number;
};

type Palette = {
  primary: string;
  secondary: string;
  connector: string;
  node: string;
  particle: string;
};

type HelixConfig = {
  centerX: number;
  centerY: number;
  length: number;
  radius: number;
  slope: number;
  turns: number;
  speed: number;
  phase: number;
  opacity: number;
  parallax: number;
};

const TAU = Math.PI * 2;

function cssValue(styles: CSSStyleDeclaration, name: string, fallback: string) {
  return styles.getPropertyValue(name).trim() || fallback;
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is required for the DNA background.");
  return context;
}

export function DnaBackground({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const rootElement: HTMLDivElement = root;
    const canvasElement: HTMLCanvasElement = canvas;
    const context = getCanvasContext(canvasElement);

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      influence: 0,
      targetInfluence: 0,
      lastMove: 0,
    };

    const random = seededRandom(1837);
    const particles = Array.from({ length: 88 }, () => ({
      x: random(),
      y: random(),
      depth: 0.25 + random() * 0.75,
      size: 0.45 + random() * 1.25,
      drift: random() * TAU,
    }));

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let running = true;
    let reducedMotion = motionPreference.matches;
    let palette: Palette = readPalette();

    function readPalette(): Palette {
      const styles = getComputedStyle(rootElement);
      return {
        primary: cssValue(styles, "--dna-strand-primary", "#58d7ff"),
        secondary: cssValue(styles, "--dna-strand-secondary", "#3b82f6"),
        connector: cssValue(styles, "--dna-connector", "#4fa8d8"),
        node: cssValue(styles, "--dna-node", "#d7f7ff"),
        particle: cssValue(styles, "--dna-particle", "#70a9c9"),
      };
    }

    function resize() {
      const bounds = rootElement.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvasElement.width = Math.round(width * dpr);
      canvasElement.height = Math.round(height * dpr);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (reducedMotion) draw(0);
    }

    function distort(point: Point, parallax: number): Point {
      const normalizedX = pointer.x / Math.max(width, 1) - 0.5;
      const normalizedY = pointer.y / Math.max(height, 1) - 0.5;
      let x = point.x + normalizedX * point.depth * parallax;
      let y = point.y + normalizedY * point.depth * parallax * 0.55;

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy) || 1;
      const interactionRadius = Math.min(250, Math.max(150, width * 0.16));

      if (distance < interactionRadius && pointer.influence > 0.001) {
        const force = (1 - distance / interactionRadius) ** 2 * pointer.influence;
        x += (dx / distance) * force * 24;
        y += (dy / distance) * force * 16;
      }

      return { x, y, depth: point.depth };
    }

    function renderHelix(time: number, config: HelixConfig) {
      const sampleCount = Math.min(96, Math.max(54, Math.round(width / 19)));
      const first: Point[] = [];
      const second: Point[] = [];
      const centerX = width * config.centerX;
      const centerY = height * config.centerY;
      const radius = Math.min(width, height) * config.radius;
      const length = width * config.length;
      const phase = config.phase + time * config.speed;

      for (let index = 0; index < sampleCount; index += 1) {
        const progress = index / (sampleCount - 1);
        const position = progress - 0.5;
        const angle = progress * config.turns * TAU + phase;
        const pathWave = Math.sin(progress * Math.PI * 1.35 + phase * 0.14) * height * 0.018;
        const baseX = centerX + position * length;
        const baseY = centerY + position * height * config.slope + pathWave;
        const vertical = Math.cos(angle) * radius;
        const depth = Math.sin(angle);
        const perspective = 1 + depth * 0.12;

        first.push(distort({
          x: baseX + depth * radius * 0.16,
          y: baseY + vertical * perspective,
          depth,
        }, config.parallax));
        second.push(distort({
          x: baseX - depth * radius * 0.16,
          y: baseY - vertical * perspective,
          depth: -depth,
        }, config.parallax));
      }

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";

      // Base-pair rungs sit behind the two luminous strands.
      for (let index = 0; index < sampleCount; index += 2) {
        const start = first[index];
        const end = second[index];
        const depth = (start.depth + 1) / 2;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = palette.connector;
        context.globalAlpha = config.opacity * (0.12 + depth * 0.2);
        context.lineWidth = 0.55 + depth * 0.7;
        context.stroke();
      }

      drawStrand(first, palette.primary, config.opacity);
      drawStrand(second, palette.secondary, config.opacity);

      for (let index = 0; index < sampleCount; index += 3) {
        drawNode(first[index], config.opacity);
        drawNode(second[index], config.opacity);
      }

      context.restore();
    }

    function drawStrand(points: Point[], color: string, opacity: number) {
      context.shadowColor = color;
      context.shadowBlur = 13;

      for (let index = 1; index < points.length; index += 1) {
        const start = points[index - 1];
        const end = points[index];
        const depth = ((start.depth + end.depth) * 0.5 + 1) / 2;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = color;
        context.globalAlpha = opacity * (0.24 + depth * 0.66);
        context.lineWidth = 0.8 + depth * 1.35;
        context.stroke();
      }

      context.shadowBlur = 0;
    }

    function drawNode(point: Point, opacity: number) {
      const depth = (point.depth + 1) / 2;
      context.beginPath();
      context.arc(point.x, point.y, 0.65 + depth * 1.35, 0, TAU);
      context.fillStyle = palette.node;
      context.globalAlpha = opacity * (0.24 + depth * 0.7);
      context.shadowColor = palette.primary;
      context.shadowBlur = 8;
      context.fill();
      context.shadowBlur = 0;
    }

    function drawParticles(time: number) {
      for (const particle of particles) {
        const driftX = Math.sin(time * 0.00011 + particle.drift) * 16 * particle.depth;
        const driftY = Math.cos(time * 0.00008 + particle.drift) * 11 * particle.depth;
        const pointerX = (pointer.x / Math.max(width, 1) - 0.5) * particle.depth * -17;
        const pointerY = (pointer.y / Math.max(height, 1) - 0.5) * particle.depth * -11;
        const x = particle.x * width + driftX + pointerX;
        const y = particle.y * height + driftY + pointerY;

        context.beginPath();
        context.arc(x, y, particle.size * particle.depth, 0, TAU);
        context.fillStyle = palette.particle;
        context.globalAlpha = 0.08 + particle.depth * 0.18;
        context.fill();
      }
    }

    function drawPointerLight() {
      if (pointer.influence < 0.002) return;
      const radius = Math.min(300, Math.max(180, width * 0.2));
      const gradient = context.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        radius,
      );
      gradient.addColorStop(0, "rgba(56, 189, 248, 0.075)");
      gradient.addColorStop(0.45, "rgba(37, 99, 235, 0.028)");
      gradient.addColorStop(1, "rgba(3, 12, 30, 0)");
      context.globalAlpha = pointer.influence;
      context.fillStyle = gradient;
      context.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.055;
      pointer.y += (pointer.targetY - pointer.y) * 0.055;
      pointer.targetInfluence = performance.now() - pointer.lastMove < 1450 ? 1 : 0;
      pointer.influence += (pointer.targetInfluence - pointer.influence) * 0.045;

      drawPointerLight();
      drawParticles(time);

      renderHelix(time * 0.001, {
        centerX: 0.2,
        centerY: 0.17,
        length: 0.72,
        radius: 0.055,
        slope: -0.22,
        turns: 3.25,
        speed: 0.18,
        phase: 1.4,
        opacity: 0.16,
        parallax: 15,
      });

      renderHelix(time * 0.001, {
        centerX: 0.55,
        centerY: 0.54,
        length: 1.22,
        radius: 0.15,
        slope: -0.38,
        turns: 5.6,
        speed: 0.34,
        phase: 0.2,
        opacity: 0.92,
        parallax: 34,
      });

      renderHelix(time * 0.001, {
        centerX: 0.84,
        centerY: 0.88,
        length: 0.58,
        radius: 0.07,
        slope: -0.28,
        turns: 2.8,
        speed: -0.16,
        phase: 2.1,
        opacity: 0.1,
        parallax: 12,
      });

      context.globalAlpha = 1;
    }

    function animate(time: number) {
      if (!running || reducedMotion) return;
      draw(time);
      animationFrame = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      window.cancelAnimationFrame(animationFrame);
      if (running && !reducedMotion && !document.hidden) {
        animationFrame = window.requestAnimationFrame(animate);
      } else if (reducedMotion) {
        draw(0);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.lastMove = performance.now();
      pointer.targetInfluence = 1;
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      startAnimation();
    }

    function handleVisibilityChange() {
      startAnimation();
    }

    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
      if (reducedMotion) draw(0);
    });

    resizeObserver.observe(rootElement);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionPreference.addEventListener("change", handleMotionChange);

    resize();
    startAnimation();

    return () => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionPreference.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="dna-background-grid absolute inset-0" />
      <div className="dna-background-vignette absolute inset-0" />
    </div>
  );
}
