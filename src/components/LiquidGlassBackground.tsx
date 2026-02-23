import { useRef, useEffect, useCallback } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";

// ─── GLSL Shaders ───────────────────────────────────────────────
const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0,1);}`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_res;
uniform float u_scroll;
uniform vec2  u_mouse;
uniform float u_dark;

// Simplex-style noise (3D)
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0,.5,1,2);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);
  vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=perm(perm(perm(
    i.z+vec4(0,i1.z,i2.z,1))
   +i.y+vec4(0,i1.y,i2.y,1))
   +i.x+vec4(0,i1.x,i2.x,1));
  float n_=1./7.;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=1.79284291400159-.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float t=u_time*0.08;
  float scroll=u_scroll*0.0005;

  // Cursor ripple (100px radius)
  float cursorDist=length(gl_FragCoord.xy-u_mouse);
  float ripple=smoothstep(100.,0.,cursorDist)*0.12*sin(cursorDist*0.06-u_time*2.);

  // Heavy viscous noise layers
  float n1=snoise(vec3(uv*2.+scroll,t*0.3))*0.5;
  float n2=snoise(vec3(uv*3.5-scroll*0.5,t*0.2+3.))*0.35;
  float n3=snoise(vec3(uv*6.,t*0.15+7.))*0.15;
  float n=n1+n2+n3+ripple;

  // Colors
  vec3 indigo =vec3(0.043,0.020,0.078);
  vec3 blue   =vec3(0.0,0.639,1.0);
  vec3 pink   =vec3(1.0,0.0,0.741);
  vec3 amber  =vec3(1.0,0.565,0.0);

  // Light mode base
  vec3 lightBase=vec3(0.925,0.933,0.973);
  vec3 base=mix(lightBase,indigo,u_dark);

  // Blend channels via noise
  float b_mix=smoothstep(-0.2,0.5,n);
  float p_mix=smoothstep(0.0,0.7,n+0.1);
  float a_mix=smoothstep(0.3,0.9,n)*0.6;

  vec3 col=base;
  col=mix(col,blue,b_mix*mix(0.12,0.35,u_dark));
  col=mix(col,pink,p_mix*mix(0.08,0.25,u_dark));
  // Amber specular highlight
  col+=amber*a_mix*mix(0.06,0.15,u_dark);

  // Surface specular — simulates liquid metal reflections
  float spec=pow(max(0.,snoise(vec3(uv*8.,t*0.4))),3.)*mix(0.08,0.2,u_dark);
  col+=vec3(spec);

  gl_FragColor=vec4(col,1.);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function LiquidGlassBackground() {
  const { flavor, resolvedMode } = useThemeContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const isVisibleRef = useRef(true);
  const scrollRef = useRef(0);
  const mouseRef = useRef<[number, number]>([0, 0]);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    uTime: WebGLUniformLocation;
    uRes: WebGLUniformLocation;
    uScroll: WebGLUniformLocation;
    uMouse: WebGLUniformLocation;
    uDark: WebGLUniformLocation;
  } | null>(null);

  // Track scroll
  useEffect(() => {
    if (flavor !== "liquid-glass") return;
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [flavor]);

  // Track mouse (throttled via RAF flag)
  useEffect(() => {
    if (flavor !== "liquid-glass") return;
    let ticking = false;
    const onMove = (e: MouseEvent) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const dpr = window.devicePixelRatio || 1;
        const scale = 0.5;
        mouseRef.current = [
          e.clientX * scale * dpr,
          (window.innerHeight - e.clientY) * scale * dpr,
        ];
        ticking = false;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [flavor]);

  const initGL = useCallback((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return null;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    return {
      gl,
      uTime: gl.getUniformLocation(prog, "u_time")!,
      uRes: gl.getUniformLocation(prog, "u_res")!,
      uScroll: gl.getUniformLocation(prog, "u_scroll")!,
      uMouse: gl.getUniformLocation(prog, "u_mouse")!,
      uDark: gl.getUniformLocation(prog, "u_dark")!,
    };
  }, []);

  useEffect(() => {
    if (flavor !== "liquid-glass") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = initGL(canvas);
    if (!state) return; // WebGL not supported, silent fail
    glRef.current = state;
    const { gl, uTime, uRes, uScroll, uMouse, uDark } = state;

    const scale = 0.5;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * scale * dpr);
      canvas.height = Math.floor(window.innerHeight * scale * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onVisibility = () => { isVisibleRef.current = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const isDark = resolvedMode === "dark" ? 1.0 : 0.0;
    gl.uniform1f(uDark, isDark);

    const startTime = performance.now();
    const loop = () => {
      if (isVisibleRef.current) {
        const elapsed = (performance.now() - startTime) * 0.001;
        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uScroll, scrollRef.current);
        gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      // Lose context to free GPU memory
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      glRef.current = null;
    };
  }, [flavor, resolvedMode, initGL]);

  if (flavor !== "liquid-glass") return null;

  return (
    <canvas
      ref={canvasRef}
      className="liquid-glass-canvas"
      aria-hidden="true"
    />
  );
}
