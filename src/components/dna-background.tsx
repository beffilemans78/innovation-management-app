"use client";

import { useEffect, useRef } from "react";

type Vec3 = { x: number; y: number; z: number };
type Projected = Vec3 & { scale: number };
type NetworkNode = {
  x: number;
  y: number;
  z: number;
  phase: number;
  speed: number;
};

const TAU = Math.PI * 2;

function getContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is required for the DNA background.");
  return context;
}
function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
    const context = getContext(canvasElement);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const random = seededRandom(93017);

    const nodes: NetworkNode[] = Array.from({ length: 68 }, () => ({
      x: random(),
      y: random(),
      z: 0.25 + random() * 0.75,
      phase: random() * TAU,
      speed: 0.35 + random() * 0.75,
    }));

    const dust = Array.from({ length: 104 }, () => ({
      x: random(),
      y: random(),
      z: 0.2 + random() * 0.8,
      phase: random() * TAU,
      radius: 0.25 + random() * 1.2,
    }));

    const sphereDots = Array.from({ length: 20 }, (_, index) => {
      const y = 1 - (index / 19) * 2;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = index * 2.399963;
      return { x: Math.cos(angle) * radial, y, z: Math.sin(angle) * radial };
    }).filter((point) => point.z > -0.2);

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let running = true;
    let reducedMotion = motionQuery.matches;
    const pointer = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      energy: 0,
      lastMove: 0,
    };

    function resize() {
      const bounds = rootElement.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      canvasElement.width = Math.round(width * dpr);
      canvasElement.height = Math.round(height * dpr);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion) draw(0);
    }

    function project(point: Vec3, yaw: number, pitch: number): Projected {
      const lean = 0.14;
      const cosLean = Math.cos(lean);
      const sinLean = Math.sin(lean);
      const xLean = point.x * cosLean - point.y * sinLean;
      const yLean = point.x * sinLean + point.y * cosLean;

      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const xYaw = xLean * cosYaw + point.z * sinYaw;
      const zYaw = -xLean * sinYaw + point.z * cosYaw;

      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const yPitch = yLean * cosPitch - zYaw * sinPitch;
      const zPitch = yLean * sinPitch + zYaw * cosPitch;

      const cameraDistance = Math.max(600, width * 0.62);
      const scale = cameraDistance / Math.max(260, cameraDistance + zPitch);
      const centerX = width * (width < 760 ? 0.5 : 0.31);
      const centerY = height * 0.52;
      return {
        x: centerX + xYaw * scale,
        y: centerY + yPitch * scale,
        z: zPitch,
        scale,
      };
    }

    function drawFog(time: number) {
      const clouds = [
        { x: 0.16, y: 0.25, r: 0.34, a: 0.24, p: 0.2 },
        { x: 0.5, y: 0.68, r: 0.42, a: 0.17, p: 1.8 },
        { x: 0.83, y: 0.25, r: 0.36, a: 0.13, p: 3.1 },
        { x: 0.72, y: 0.86, r: 0.3, a: 0.11, p: 4.7 },
      ];
      for (const cloud of clouds) {
        const driftX = Math.sin(time * 0.00008 + cloud.p) * width * 0.035;
        const driftY = Math.cos(time * 0.00006 + cloud.p) * height * 0.025;
        const x = width * cloud.x + driftX;
        const y = height * cloud.y + driftY;
        const radius = Math.max(width, height) * cloud.r;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(49, 151, 169, ${cloud.a})`);
        gradient.addColorStop(0.42, `rgba(23, 100, 119, ${cloud.a * 0.55})`);
        gradient.addColorStop(1, "rgba(3, 22, 29, 0)");
        context.fillStyle = gradient;
        context.globalAlpha = 1;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }

    function networkPosition(node: NetworkNode, time: number) {
      const drift = time * 0.00005 * node.speed;
      let x = node.x * width + Math.sin(drift + node.phase) * 22 * node.z;
      let y = node.y * height + Math.cos(drift * 0.8 + node.phase) * 16 * node.z;
      x -= (pointer.x - 0.5) * 34 * node.z;
      y -= (pointer.y - 0.5) * 22 * node.z;

      const dx = x - pointer.x * width;
      const dy = y - pointer.y * height;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance < 190 && pointer.energy > 0.001) {
        const force = (1 - distance / 190) ** 2 * pointer.energy;
        x += (dx / distance) * force * 22;
        y += (dy / distance) * force * 22;
      }
      return { x, y };
    }

    function drawNetwork(time: number) {
      const positions = nodes.map((node) => networkPosition(node, time));
      context.lineWidth = 0.65;
      for (let i = 0; i < nodes.length; i += 1) {
        let connections = 0;
        for (let j = i + 1; j < nodes.length && connections < 4; j += 1) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const distance = Math.hypot(dx, dy);
          const limit = Math.min(width, height) * 0.19;
          if (distance > limit) continue;
          context.beginPath();
          context.moveTo(positions[i].x, positions[i].y);
          context.lineTo(positions[j].x, positions[j].y);
          context.strokeStyle = "#8ed4dd";
          context.globalAlpha = (1 - distance / limit) * 0.16 * nodes[i].z;
          context.stroke();
          connections += 1;
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const position = positions[i];
        context.beginPath();
        context.arc(position.x, position.y, 0.55 + node.z * 1.25, 0, TAU);
        context.fillStyle = "#c6f5f5";
        context.globalAlpha = 0.16 + node.z * 0.34;
        context.fill();
      }
    }

    function drawDust(time: number) {
      for (const particle of dust) {
        const x = particle.x * width + Math.sin(time * 0.00012 + particle.phase) * 18 * particle.z;
        const y = particle.y * height + Math.cos(time * 0.00009 + particle.phase) * 13 * particle.z;
        context.beginPath();
        context.arc(x, y, particle.radius * particle.z, 0, TAU);
        context.fillStyle = "#d8ffff";
        context.globalAlpha = 0.05 + particle.z * 0.28;
        context.fill();
      }
    }

    function drawDottedRung(start: Projected, end: Projected) {
      const dotCount = 11;
      for (let index = 1; index < dotCount; index += 1) {
        const progress = index / dotCount;
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress;
        const scale = start.scale + (end.scale - start.scale) * progress;
        const depth = start.z + (end.z - start.z) * progress;
        const focus = clamp(1 - Math.abs(depth) / 620, 0.18, 1);
        context.beginPath();
        context.ellipse(x, y, 1.1 * scale, 2.15 * scale, 0, 0, TAU);
        context.fillStyle = "#e5ffff";
        context.globalAlpha = (0.22 + focus * 0.62) * clamp(scale, 0.45, 1.25);
        context.shadowColor = "#bdfaff";
        context.shadowBlur = 5 * scale;
        context.fill();
      }
      context.shadowBlur = 0;
    }

    function drawBead(point: Projected, strand: number) {
      const depthFocus = clamp(1 - Math.abs(point.z) / 720, 0.14, 1);
      const radius = clamp(14.5 * point.scale, 5.8, 30);
      const blur = clamp(Math.abs(point.z) / 330 - 0.25, 0, 2.8);
      context.save();
      context.filter = blur > 0.15 ? `blur(${blur}px)` : "none";
      context.globalAlpha = 0.3 + depthFocus * 0.7;
      context.shadowColor = strand === 0 ? "#d4ffff" : "#a8e9ef";
      context.shadowBlur = 10 + radius * 0.8;

      const gradient = context.createRadialGradient(
        point.x - radius * 0.28,
        point.y - radius * 0.3,
        radius * 0.08,
        point.x,
        point.y,
        radius,
      );
      gradient.addColorStop(0, "rgba(247,255,255,.78)");
      gradient.addColorStop(0.34, "rgba(207,249,249,.3)");
      gradient.addColorStop(0.78, "rgba(104,189,202,.13)");
      gradient.addColorStop(1, "rgba(190,245,246,.04)");
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, TAU);
      context.fillStyle = gradient;
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = "rgba(225,255,255,.72)";
      context.lineWidth = clamp(0.6 * point.scale, 0.35, 1.1);
      context.stroke();

      context.strokeStyle = "rgba(210,252,252,.22)";
      context.lineWidth = 0.45;
      context.beginPath();
      context.ellipse(point.x, point.y, radius * 0.43, radius, 0, 0, TAU);
      context.stroke();
      context.beginPath();
      context.ellipse(point.x, point.y, radius * 0.72, radius, 0, 0, TAU);
      context.stroke();
      context.beginPath();
      context.ellipse(point.x, point.y, radius, radius * 0.42, 0, 0, TAU);
      context.stroke();

      context.fillStyle = "#e9ffff";
      for (const dot of sphereDots) {
        context.beginPath();
        context.arc(
          point.x + dot.x * radius * 0.82,
          point.y + dot.y * radius * 0.82,
          clamp(0.55 * point.scale, 0.3, 1.05),
          0,
          TAU,
        );
        context.globalAlpha = (0.12 + depthFocus * 0.55) * (0.5 + dot.z * 0.5);
        context.fill();
      }
      context.restore();
    }

    function drawHelix(time: number) {
      const mobile = width < 760;
      const rungs = mobile ? 38 : 44;
      const span = height * (mobile ? 1.25 : 1.46);
      const radius = Math.min(width, height) * (mobile ? 0.17 : 0.21);
      const rotation = time * 0.00013;
      const yaw = -0.08 + (pointer.x - 0.5) * 0.28;
      const pitch = 0.13 + (pointer.y - 0.5) * 0.12;
      const beads: Array<{ point: Projected; strand: number }> = [];
      const strandA: Projected[] = [];
      const strandB: Projected[] = [];

      for (let index = 0; index < rungs; index += 1) {
        const normalized = index / (rungs - 1) - 0.5;
        const y = normalized * span;
        const angle = normalized * TAU * 4.35 + rotation;
        const curveX = Math.sin(normalized * 3.4 + time * 0.00007) * radius * 0.25;
        const curveZ = Math.cos(normalized * 2.8 - time * 0.00005) * radius * 0.22;
        const a = project({
          x: curveX + Math.cos(angle) * radius,
          y,
          z: curveZ + Math.sin(angle) * radius,
        }, yaw, pitch);
        const b = project({
          x: curveX - Math.cos(angle) * radius,
          y,
          z: curveZ - Math.sin(angle) * radius,
        }, yaw, pitch);
        strandA.push(a);
        strandB.push(b);
        drawDottedRung(a, b);
        beads.push({ point: a, strand: 0 }, { point: b, strand: 1 });
      }

      // A faint continuous filament keeps the beaded strands visually coherent.
      for (const strand of [strandA, strandB]) {
        context.beginPath();
        strand.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.strokeStyle = "#c7f8f7";
        context.globalAlpha = 0.08;
        context.lineWidth = 1.1;
        context.stroke();
      }

      beads.sort((a, b) => b.point.z - a.point.z);
      for (const bead of beads) drawBead(bead.point, bead.strand);
    }

    function drawPointerGlow() {
      if (pointer.energy < 0.002) return;
      const x = pointer.x * width;
      const y = pointer.y * height;
      const radius = Math.min(290, Math.max(180, width * 0.2));
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(113, 230, 237, .075)");
      gradient.addColorStop(0.55, "rgba(31, 127, 148, .025)");
      gradient.addColorStop(1, "rgba(3, 22, 29, 0)");
      context.fillStyle = gradient;
      context.globalAlpha = pointer.energy;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;
      const targetEnergy = performance.now() - pointer.lastMove < 1500 ? 1 : 0;
      pointer.energy += (targetEnergy - pointer.energy) * 0.04;

      drawFog(time);
      drawNetwork(time);
      drawDust(time);
      drawPointerGlow();
      drawHelix(time);
      context.globalAlpha = 1;
      context.filter = "none";
    }

    function animate(time: number) {
      if (!running || reducedMotion || document.hidden) return;
      draw(time);
      frame = window.requestAnimationFrame(animate);
    }

    function restart() {
      window.cancelAnimationFrame(frame);
      if (reducedMotion) draw(0);
      else if (!document.hidden) frame = window.requestAnimationFrame(animate);
    }

    function handlePointerMove(event: PointerEvent) {
      const bounds = rootElement.getBoundingClientRect();
      pointer.targetX = clamp((event.clientX - bounds.left) / width, 0, 1);
      pointer.targetY = clamp((event.clientY - bounds.top) / height, 0, 1);
      pointer.lastMove = performance.now();
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      restart();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(rootElement);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", restart);
    motionQuery.addEventListener("change", handleMotionChange);
    resize();
    restart();

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", restart);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="dna-background-vignette absolute inset-0" />
    </div>
  );
}
