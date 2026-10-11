import { useEffect, useRef, useState } from 'react';
import { cn } from 'lightweight-ui';

/**
 * The hero's halftone dome: a sphere rising from the bottom edge with sound
 * waves rolling through it, printed as a dot screen in WebGL2.
 *
 * Pass 1 shades the dome into a tiny texture, one texel per dot. Pass 2 draws a
 * dot per cell whose size follows the texel's light, plus a soft upscaled glow.
 * The intro scrambles the cells and lets them settle into place.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const SCENE = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uIn;     // dome fades up, 0..1
out vec4 o;

float env2(vec2 uv) { return smoothstep(0.95, 0.2, abs(uv.x)); }

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5);
  float b = fract(sin(dot(i + vec2(1, 0), vec2(127.1, 311.7))) * 43758.5);
  float c = fract(sin(dot(i + vec2(0, 1), vec2(127.1, 311.7))) * 43758.5);
  float d = fract(sin(dot(i + vec2(1, 1), vec2(127.1, 311.7))) * 43758.5);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Halftone sphere rising from the bottom edge: bright rim, mottled body, sound
// waves rolling across its lower half, glow pooling under them.
vec3 dome(vec2 uv) {
  float aspect = uRes.x / uRes.y;
  float R = aspect < 1.2 ? aspect * 0.49 : min(0.86, aspect * 0.42);
  vec2 c = vec2(0.0, 0.42 - R);
  float d = length(uv - c) / R;
  float grow = uIn;
  if (d > 1.0) return vec3(exp(-(d - 1.0) * 40.0) * 0.18 * grow);
  float body = 0.1 + 0.26 * vnoise(uv * 5.0 + vec2(uTime * 0.04, 0.0)) * vnoise(uv * 2.0 - uTime * 0.02);
  float rim = pow(smoothstep(0.7, 1.0, d), 7.0) * 0.75 + smoothstep(0.985, 1.0, d) * 0.35;
  float base = smoothstep(-0.1, -0.5, uv.y) * 0.42 * (1.0 - d * 0.4) + exp(-length(uv - vec2(0.0, -0.3)) * 4.0) * 0.25;
  float waves = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float env = exp(-uv.x * uv.x * (1.6 + fi * 0.5));
    float y = -0.24 + 0.16 * env * sin(uv.x * (3.0 + fi * 0.9) + uTime * (0.6 + fi * 0.15) + fi * 1.9);
    waves += exp(-abs(uv.y - y) * (70.0 - fi * 10.0)) * (0.62 - fi * 0.1);
  }
  float l = (body + rim + base + waves * env2(uv)) * grow;
  return vec3(l * 0.92, l * 0.92, l);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  o = vec4(dome(uv), 1.0);
}`;

const HALFTONE = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform vec2 uCells;
uniform float uCell;
uniform float uMix;    // 0 = scrambled, 1 = assembled
uniform float uTime;
out vec4 o;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 cell = floor(fc / uCell);
  vec2 local = fc - (cell + 0.5) * uCell;
  float rnd = hash(cell);
  float late = smoothstep(rnd * 0.7, rnd * 0.7 + 0.3, uMix);
  vec2 jump = (vec2(hash(cell + 7.3), hash(cell + 1.9)) - 0.5) * uCells * 0.6 * (1.0 - late);
  vec2 src = clamp(cell + floor(jump), vec2(0), uCells - 1.0);
  vec3 c = texelFetch(uScene, ivec2(src), 0).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float r = uCell * 0.5 * clamp(pow(l, 0.6) * 1.08, 0.0, 1.0) * (0.35 + 0.65 * late);
  float d = length(local);
  float dot_ = 1.0 - smoothstep(r - 1.0, r + 0.2, d);
  vec3 tint = c / max(max(c.r, max(c.g, c.b)), 1e-3);
  vec3 col = tint * mix(0.6, 1.0, l) * dot_;
  // faint screen everywhere, like an unlit LED panel
  col += vec3(0.05) * (1.0 - smoothstep(uCell * 0.08, uCell * 0.08 + 0.8, d));
  col += texture(uScene, fc / (uCells * uCell)).rgb * 0.22 * uMix;
  o = vec4(col, 1.0);
}`;

export const domeTimeline = { inAt: 0.15, inFor: 2.4, settleAt: 2.35 };

interface DomeCanvasProps {
  /** Starts the intro when it flips to true. */
  started: boolean;
  /** Bump to play the intro again. */
  replay?: number;
  reduced?: boolean;
  className?: string;
  /** Rendered when WebGL2 isn't available. */
  fallback?: React.ReactNode;
}

export function DomeCanvas({ started, replay = 0, reduced, className, fallback }: DomeCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started && (startRef.current === null || replay)) startRef.current = performance.now();
  }, [started, replay]);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      setFailed(true);
      return;
    }
    const prog = (frag: string) => {
      const p = gl.createProgram()!;
      for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, frag]] as const) {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) console.error('DomeCanvas shader:', gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      }
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      return p;
    };
    const scene = prog(SCENE);
    const tone = prog(HALFTONE);
    const u = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    const fbo = gl.createFramebuffer();
    let cols = 1;
    let rows = 1;
    let cell = 7;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      cell = (r.width < 640 ? 5 : 7) * dpr;
      cols = Math.ceil(canvas.width / cell);
      rows = Math.ceil(canvas.height / cell);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    };

    const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const s = startRef.current;
      const el = s === null ? 0 : (now - s) / 1000;
      const T = domeTimeline;
      const into = reduced ? (s === null ? 0 : 1) : ease((el - T.inAt) / T.inFor);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, cols, rows);
      gl.useProgram(scene);
      gl.uniform2f(u(scene, 'uRes'), cols, rows);
      gl.uniform1f(u(scene, 'uTime'), reduced ? 2 : now / 1000);
      gl.uniform1f(u(scene, 'uIn'), into);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(tone);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(u(tone, 'uScene'), 0);
      gl.uniform2f(u(tone, 'uCells'), cols, rows);
      gl.uniform1f(u(tone, 'uCell'), cell);
      gl.uniform1f(u(tone, 'uMix'), reduced ? into : ease((el - T.inAt) / (T.inFor * 0.9)));
      gl.uniform1f(u(tone, 'uTime'), now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  if (failed) return <>{fallback}</>;
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="A sphere of glowing dots rising from the bottom edge, with sound waves rolling through it"
      className={cn('block h-full w-full', className)}
    />
  );
}
