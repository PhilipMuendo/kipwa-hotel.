"use client";

/**
 * OceanCanvas: a real-time Indian Ocean, from dawn to moonrise.
 *
 * A single full-screen fragment shader (raw WebGL, no three.js): a sky whose
 * palette follows the hour of the day, a sea surface built from layered,
 * noise-warped travelling waves, Fresnel reflection of the sky, a sun-glitter
 * road at sunrise and a moon road at night, with stars. Mombasa faces east, so
 * the sun rises over the water and the moon rises over it at night; at dusk
 * the sun is behind you and only the afterglow colours the sea.
 *
 * `hour` (0–1, 0.25 = 06:00) can be a MotionValue so scroll drives the sky.
 * Renders only while visible; frozen for prefers-reduced-motion; falls back
 * to a photograph if WebGL is unavailable.
 */

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { MotionValue } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/useMedia";

type Props = {
  hour: MotionValue<number> | number;
  fallback: StaticImageData;
  className?: string;
  /** vertical position of the horizon, 0 = bottom, 1 = top */
  horizon?: number;
  priority?: boolean;
};

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHour;
uniform vec2 uMouse;
uniform float uHorizon;

const float PI = 3.14159265;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// palette keyframes through the day
vec3 key(float h, vec3 night, vec3 dawn, vec3 morning, vec3 noon, vec3 dusk, vec3 late){
  if(h < 0.22) return night;
  if(h < 0.27) return mix(night, dawn, smoothstep(0.22, 0.27, h));
  if(h < 0.36) return mix(dawn, morning, smoothstep(0.27, 0.36, h));
  if(h < 0.5)  return mix(morning, noon, smoothstep(0.36, 0.5, h));
  if(h < 0.72) return mix(noon, dusk, smoothstep(0.6, 0.76, h));
  if(h < 0.82) return mix(dusk, late, smoothstep(0.74, 0.82, h));
  return mix(late, night, smoothstep(0.82, 0.9, h));
}

vec3 zenithC(float h){ return key(h, vec3(0.02,0.03,0.07), vec3(0.42,0.50,0.62), vec3(0.55,0.70,0.80), vec3(0.42,0.64,0.80), vec3(0.30,0.30,0.48), vec3(0.09,0.10,0.20)); }
vec3 horizonC(float h){ return key(h, vec3(0.07,0.09,0.15), vec3(0.98,0.74,0.56), vec3(0.97,0.90,0.80), vec3(0.90,0.94,0.93), vec3(0.98,0.62,0.30), vec3(0.45,0.26,0.30)); }
vec3 deepC(float h){ return key(h, vec3(0.01,0.02,0.04), vec3(0.12,0.17,0.24), vec3(0.08,0.26,0.32), vec3(0.04,0.33,0.40), vec3(0.10,0.12,0.20), vec3(0.03,0.04,0.08)); }

vec3 sunDir(float h){
  float a = (h - 0.25) * 2.0 * PI;
  // rises in front (east, over the sea), sets behind (west, over the land)
  return normalize(vec3(0.18, sin(a) * 0.9 + 0.02, cos(a)));
}

vec3 moonDir(float h){
  float t = clamp((h - 0.8) / 0.2, 0.0, 1.0);
  return normalize(vec3(-0.22, 0.02 + t * 0.32, 1.0));
}

float nightAmt(float h){ return clamp(1.0 - smoothstep(0.2, 0.27, h) + smoothstep(0.82, 0.9, h), 0.0, 1.0); }
float moonUp(float h){ return smoothstep(0.8, 0.88, h); }

vec3 sky(vec3 d, float h){
  float y = max(d.y, 0.0);
  vec3 col = mix(horizonC(h), zenithC(h), pow(y, 0.55));
  // sun: small disk, soft halo
  vec3 s = sunDir(h);
  float sd = max(dot(d, s), 0.0);
  float vis = smoothstep(-0.06, 0.04, s.y) * step(0.0, s.z);
  vec3 sunCol = mix(vec3(1.0, 0.62, 0.32), vec3(1.0, 0.95, 0.85), smoothstep(0.05, 0.5, s.y));
  col += sunCol * (smoothstep(0.99955, 0.9998, sd) * 5.0 + pow(sd, 160.0) * 0.5 + pow(sd, 10.0) * 0.14) * vis;
  // dusk afterglow along the whole horizon
  float dusk = smoothstep(0.66, 0.76, h) * (1.0 - smoothstep(0.8, 0.88, h));
  col += vec3(0.9, 0.42, 0.12) * dusk * pow(1.0 - y, 8.0) * 0.35;
  // night: moon + stars
  float n = nightAmt(h);
  if(n > 0.001){
    vec3 m = moonDir(h);
    float md = max(dot(d, m), 0.0);
    col += vec3(0.95, 0.93, 0.85) * (smoothstep(0.99975, 0.9999, md) * 1.6 + pow(md, 60.0) * 0.12) * n * moonUp(h);
    vec2 g = floor(d.xy / max(d.z, 0.2) * 220.0);
    float st = step(0.9965, hash(g)) * smoothstep(0.02, 0.25, y);
    col += vec3(st) * n * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g) * 30.0));
  }
  return col;
}

// layered swell: long rollers from the east plus wind chop at irregular angles,
// domain-warped by noise so the pattern never reads as a grid
float waves(vec2 p, float t){
  vec2 q = p + vec2(vnoise(p * 0.35 + t * 0.05), vnoise(p * 0.35 - t * 0.04)) * 1.6;
  float h = 0.0;
  h += 0.055 * sin(dot(q, vec2(0.12, 1.00)) * 1.3 + t * 0.95);
  h += 0.032 * sin(dot(q, vec2(-0.63, 0.78)) * 2.3 + t * 1.35);
  h += 0.020 * sin(dot(q, vec2(0.83, 0.55)) * 3.7 + t * 1.80);
  h += 0.012 * sin(dot(q, vec2(-0.29, 0.96)) * 6.1 + t * 2.40);
  h += 0.007 * sin(dot(q, vec2(0.97, -0.24)) * 10.3 + t * 3.10);
  h += 0.004 * sin(dot(q, vec2(-0.71, -0.70)) * 16.9 + t * 3.90);
  h += 0.010 * (vnoise(q * 3.1 + t * 0.6) - 0.5);
  return h;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float h = uHour;
  float t = uTime;

  // camera: on a terrace, looking east over the water
  vec3 eye = vec3(0.0, 1.35, 0.0);
  vec2 sc = vec2((uv.x - 0.5) * aspect, uv.y - uHorizon);
  vec3 d = normalize(vec3(sc.x * 0.9 + uMouse.x * 0.04, sc.y * 0.9 + 0.0001 - uMouse.y * 0.02, 1.0));

  vec3 col;
  if(d.y >= 0.0){
    col = sky(d, h);
  } else {
    float dist = -eye.y / d.y;
    vec3 p = eye + d * dist;
    float e = 0.02;
    float hp = waves(p.xz, t);
    vec3 n = normalize(vec3(
      -(waves(p.xz + vec2(e, 0.0), t) - hp) / e,
      1.0,
      -(waves(p.xz + vec2(0.0, e), t) - hp) / e));
    // calm the far field to avoid aliasing at the horizon
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(8.0, 60.0, dist)));
    vec3 r = reflect(d, n);
    r.y = abs(r.y);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-d, n), 0.0), 5.0);
    vec3 refl = sky(r, h);
    vec3 water = deepC(h) + vec3(0.0, 0.05, 0.05) * max(n.y - 0.9, 0.0) * 6.0;
    col = mix(water, refl, fres);
    // glitter roads
    vec3 s = sunDir(h);
    float sunVis = smoothstep(-0.04, 0.05, s.y) * step(0.0, s.z);
    col += vec3(1.0, 0.82, 0.6) * pow(max(dot(r, s), 0.0), 220.0) * 3.5 * sunVis;
    vec3 m = moonDir(h);
    col += vec3(0.85, 0.86, 0.8) * pow(max(dot(r, m), 0.0), 160.0) * 2.2 * nightAmt(h) * moonUp(h);
    // haze into the horizon
    col = mix(col, horizonC(h), smoothstep(10.0, 140.0, dist) * 0.85);
  }

  // filmic grade: soft shoulder, slight warmth, vignette, grain
  col = col / (1.0 + col * 0.35);
  col = pow(col, vec3(0.95, 0.97, 1.02));
  float v = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(aspect * 0.8, 1.0)));
  col *= mix(0.82, 1.0, v);
  col += (hash(uv * uRes + t) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}`;

export default function OceanCanvas({ hour, fallback, className, horizon = 0.42, priority }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) return setFailed(true);

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[OceanCanvas]", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return setFailed(true);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return setFailed(true);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      hour: gl.getUniformLocation(prog, "uHour"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      horizon: gl.getUniformLocation(prog, "uHorizon"),
    };

    const small = window.innerWidth < 768;
    let W = 1, H = 1;
    let dirty = true;
    const resize = () => {
      // one fragment shader per pixel: keep the resolution sensible
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    const getHour = () => (typeof hour === "number" ? hour : hour.get());
    const unsub = typeof hour === "number" ? undefined : hour.on("change", () => (dirty = true));

    let raf = 0;
    let time = 3.0;
    let last = performance.now();
    const draw = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform2f(u.res, W, H);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.hour, getHour());
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.horizon, horizon);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      const tick = (now: number) => {
        if (!visible || document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!reduce) {
          time += dt;
          draw();
        } else if (dirty) {
          draw();
          dirty = false;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    start();
    const onVis = () => !document.hidden && visible && start();
    document.addEventListener("visibilitychange", onVis);
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unsub?.();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [hour, horizon, reduce]);

  if (failed) {
    return (
      <div className={className}>
        <Image src={fallback} alt="" fill sizes="100vw" className="object-cover" priority={priority} placeholder="blur" />
      </div>
    );
  }
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
