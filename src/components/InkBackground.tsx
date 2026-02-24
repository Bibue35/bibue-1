import { useEffect, useRef, useCallback } from "react";

const VERTEX_SRC = `attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`;

const FRAGMENT_SRC = `
precision highp float;
uniform float t;
uniform vec2 r;
uniform vec2 m;

vec3 mod289(vec3 x){return x-floor(x/289.)*289.;}
vec2 mod289(vec2 x){return x-floor(x/289.)*289.;}
vec3 permute(vec3 x){return mod289((x*34.+1.)*x);}

float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=x0.x>x0.y?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1.))+i.x+vec3(0,i1.x,1.));
  vec3 m2=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m2=m2*m2;m2=m2*m2;
  vec3 x_=2.*fract(p*C.www)-1.;vec3 h=abs(x_)-.5;
  vec3 ox=floor(x_+.5);vec3 a0=x_-ox;
  m2*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m2,g);
}

float fbm(vec2 p){
  float v=0.,a=.5;mat2 rot=mat2(.8,.6,-.6,.8);
  for(int i=0;i<6;i++){v+=a*snoise(p);p=rot*p*2.05;a*=.48;}
  return v;
}

float inkSpread(vec2 p,float time){
  vec2 q=vec2(fbm(p+time*0.04),fbm(p+vec2(4.2,1.8)+time*0.035));
  vec2 rr=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+time*0.025),fbm(p+3.5*q+vec2(8.3,2.8)+time*0.03));
  return fbm(p+4.*rr);
}

void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy*2.-r)/min(r.x,r.y);

  vec3 paper=vec3(0.95,0.925,0.88);
  float grain=snoise(gl_FragCoord.xy*0.15)*0.02;
  float grain2=snoise(gl_FragCoord.xy*0.4)*0.01;
  paper+=grain+grain2;

  float fiber=snoise(vec2(gl_FragCoord.x*0.03,gl_FragCoord.y*0.5))*0.008;
  paper+=fiber;

  float ink1=inkSpread(p*0.6,t);
  float ink2=inkSpread(p*0.8+3.,t*0.8);
  float ink3=inkSpread(p*0.4+7.,t*1.2);

  float blob1=smoothstep(0.15,0.35,ink1)*smoothstep(1.3,0.4,length(p*vec2(0.7,0.8)+vec2(-0.2,0.1)));
  float blob2=smoothstep(0.1,0.4,ink2)*smoothstep(1.1,0.3,length(p*vec2(0.8,0.6)+vec2(0.3,-0.2)));
  float blob3=smoothstep(0.2,0.5,ink3)*smoothstep(1.5,0.5,length(p*vec2(0.5,0.9)+vec2(0.1,0.3)));

  float inkDark1=blob1*(0.6+ink1*0.4);
  float inkDark2=blob2*(0.4+ink2*0.3);
  float inkDark3=blob3*(0.3+ink3*0.2);

  float totalInk=clamp(inkDark1+inkDark2*0.7+inkDark3*0.5,0.,1.);

  vec3 inkColor=mix(
    vec3(0.08,0.06,0.1),
    vec3(0.12,0.08,0.05),
    ink1*0.5+0.5
  );

  float edge=smoothstep(0.01,0.25,totalInk)-smoothstep(0.25,0.9,totalInk);
  vec3 edgeColor=vec3(0.15,0.15,0.22);
  inkColor=mix(inkColor,edgeColor,edge*0.3);

  vec3 c=mix(paper,inkColor,totalInk*0.85);

  float colorZone1=smoothstep(0.2,0.6,blob1);
  float colorZone2=smoothstep(0.15,0.5,blob2);
  vec3 hint1=vec3(0.2,0.15,0.3)*colorZone1*0.08;
  vec3 hint2=vec3(0.3,0.15,0.1)*colorZone2*0.05;
  c-=hint1+hint2;

  // Ink splatter dots
  for(int i=0;i<8;i++){
    float fi=float(i);
    vec2 sp=vec2(sin(fi*7.3+2.)*0.8,cos(fi*5.7+1.)*0.6);
    float sd=length(p-sp);
    float dot=smoothstep(0.025+sin(fi*3.)*0.01,0.005,sd);
    float dotOpacity=smoothstep(1.5,0.5,length(p-sp*0.5))*0.6;
    c=mix(c,inkColor,dot*dotOpacity);
  }

  // Mouse ripple
  vec2 mp=m*2.-1.;
  float mDist=length(p-mp);
  float ripple=sin(mDist*8.-t*2.)*exp(-mDist*3.)*0.015;
  c-=ripple;

  // Vignette
  float vig=smoothstep(0.2,1.5,length(uv-0.5));
  c-=vig*0.08;

  gl_FragColor=vec4(c,1.);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(s));
  }
  return s;
}

export function InkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 });
  const animRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX / innerWidth;
    mouseRef.current.y = 1 - e.clientY / innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const dpr = Math.min(devicePixelRatio, 1.5); // Lower for perf

    function resize() {
      canvas!.width = innerWidth * dpr;
      canvas!.height = innerHeight * dpr;
      canvas!.style.width = innerWidth + "px";
      canvas!.style.height = innerHeight + "px";
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();

    const prog = gl.createProgram()!;
    gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, VERTEX_SRC));
    gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, "t");
    const uR = gl.getUniformLocation(prog, "r");
    const uM = gl.getUniformLocation(prog, "m");

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resize);

    function frame(t: number) {
      const m = mouseRef.current;
      m.sx += (m.x - m.sx) * 0.03;
      m.sy += (m.y - m.sy) * 0.03;

      gl!.uniform1f(uT, t * 0.001);
      gl!.uniform2f(uR, canvas!.width, canvas!.height);
      gl!.uniform2f(uM, m.sx, m.sy);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
