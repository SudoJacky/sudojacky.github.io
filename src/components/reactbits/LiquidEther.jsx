import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "./useReducedMotion";
import "./LiquidEther.css";

const DEFAULT_COLORS = ["#173d30", "#3b745f", "#c5ff3d"];

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uVelocity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 0.17;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 mouse = (uMouse - 0.5) * vec2(aspect, 1.0);

    float baseFlow = fbm(p * 2.2 + vec2(uTime * 0.055, -uTime * 0.035));
    float detailFlow = fbm(p * 4.0 - vec2(uTime * 0.035, uTime * 0.045));
    float wave = sin((baseFlow * 2.8 + detailFlow + p.x * 0.8 - p.y * 0.55 + uTime * 0.1) * 3.14159);
    float pointerField = exp(-length(p - mouse) * 4.2) * (0.22 + min(uVelocity, 1.5) * 0.42);
    float energy = smoothstep(0.04, 0.96, baseFlow * 0.52 + abs(wave) * 0.34 + pointerField);

    vec3 color = mix(uColorA, uColorB, smoothstep(0.18, 0.72, energy));
    color = mix(color, uColorC, smoothstep(0.62, 1.0, energy + pointerField));
    float edgeFade = smoothstep(0.92, 0.18, length(p * vec2(0.72, 1.0)));
    float alpha = energy * edgeFade * 0.72;

    gl_FragColor = vec4(color, alpha);
  }
`;

// Compact project adaptation of React Bits' Liquid Ether background.
export default function LiquidEther({
  colors = DEFAULT_COLORS,
  mouseForce = 0.65,
  autoDemo = true,
  autoSpeed = 0.45,
  resolution = 0.7,
  className = "",
}) {
  const mountRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const colorKey = colors.join(",");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || reducedMotion) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const pointer = new THREE.Vector2(0.72, 0.34);
    const pointerTarget = pointer.clone();
    const previousPointer = pointer.clone();
    const palette = colors.length >= 3 ? colors : DEFAULT_COLORS;
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: pointer },
      uVelocity: { value: 0 },
      uColorA: { value: new THREE.Color(palette[0]) },
      uColorB: { value: new THREE.Color(palette[1]) },
      uColorC: { value: new THREE.Color(palette[2]) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId;
    let visible = true;
    let userActive = false;
    let lastInteraction = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const renderWidth = Math.max(1, Math.round(width * resolution));
      const renderHeight = Math.max(1, Math.round(height * resolution));
      renderer.setSize(renderWidth, renderHeight, false);
      uniforms.uResolution.value.set(renderWidth, renderHeight);
    };

    const handlePointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const inside = (
        event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom
      );
      if (!inside) {
        userActive = false;
        return;
      }
      pointerTarget.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      );
      userActive = true;
      lastInteraction = performance.now();
    };

    const render = () => {
      if (!visible) return;

      const elapsed = clock.getElapsedTime();
      if (autoDemo && !userActive && performance.now() - lastInteraction > 600) {
        pointerTarget.set(
          0.5 + Math.cos(elapsed * autoSpeed) * 0.28,
          0.5 + Math.sin(elapsed * autoSpeed * 0.83) * 0.22,
        );
      }

      pointer.lerp(pointerTarget, 0.075);
      uniforms.uVelocity.value = THREE.MathUtils.lerp(
        uniforms.uVelocity.value,
        pointer.distanceTo(previousPointer) * 80 * mouseForce,
        0.18,
      );
      previousPointer.copy(pointer);
      uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      const nextVisible = entry.isIntersecting;
      if (nextVisible === visible) return;
      visible = nextVisible;
      if (visible) {
        clock.start();
        frameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frameId);
      }
    });

    resizeObserver.observe(mount);
    intersectionObserver.observe(mount);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    resize();
    render();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [autoDemo, autoSpeed, colorKey, mouseForce, reducedMotion, resolution]);

  return (
    <div
      ref={mountRef}
      className={`liquid-ether-container ${className}`}
      aria-hidden="true"
    />
  );
}
