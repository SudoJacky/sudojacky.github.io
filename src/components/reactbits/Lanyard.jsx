/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import avatarImageUrl from "../../assets/sudojacky-avatar.png";
import { useReducedMotion } from "./useReducedMotion";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

function drawCardTexture(side, avatarImage) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1068;
  const context = canvas.getContext("2d");

  context.fillStyle = "#111918";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(197, 255, 61, 0.09)";
  context.lineWidth = 2;
  for (let x = 0; x <= canvas.width; x += 64) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 64) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  const drawRule = (y) => {
    context.strokeStyle = "rgba(232, 231, 224, 0.22)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(56, y);
    context.lineTo(712, y);
    context.stroke();
  };

  const drawLabel = (text, x, y) => {
    context.fillStyle = "#8d938e";
    context.font = "500 19px 'IBM Plex Mono', monospace";
    context.fillText(text, x, y);
  };

  if (side === "front") {
    if (avatarImage) {
      context.save();
      context.beginPath();
      context.arc(384, 226, 142, 0, Math.PI * 2);
      context.clip();
      context.drawImage(avatarImage, 242, 84, 284, 284);
      context.restore();

      context.strokeStyle = "#c5ff3d";
      context.lineWidth = 7;
      context.beginPath();
      context.arc(384, 226, 148, 0, Math.PI * 2);
      context.stroke();
    }

    context.fillStyle = "#e8e7e0";
    context.font = "500 56px 'IBM Plex Mono', monospace";
    context.fillText("SudoJacky", 58, 454);
    context.fillStyle = "#a8aaa6";
    context.font = "400 29px 'IBM Plex Sans', sans-serif";
    context.fillText("Software Engineer", 60, 500);

    drawRule(548);
    drawLabel("IDENTIFIER", 56, 596);
    drawLabel("TYPE", 390, 596);
    context.fillStyle = "#e8e7e0";
    context.font = "500 27px 'IBM Plex Mono', monospace";
    context.fillText("SJ-2405", 56, 636);
    context.fillText("PERSONAL SITE", 390, 636);

    drawLabel("ACCESS", 56, 698);
    context.fillStyle = "#c5ff3d";
    context.font = "500 20px 'IBM Plex Mono', monospace";
    context.fillText("HOME / PROJECTS / NOTES / DOCS", 56, 736);

    context.fillStyle = "rgba(197, 255, 61, 0.065)";
    context.fillRect(56, 774, 656, 142);
    context.strokeStyle = "rgba(197, 255, 61, 0.34)";
    context.strokeRect(56, 774, 656, 142);
    drawLabel("CURRENT EXPERIENCE", 78, 812);
    context.fillStyle = "#e8e7e0";
    context.font = "500 31px 'IBM Plex Mono', monospace";
    context.fillText("Samsung Electronics", 78, 855);
    context.fillStyle = "#c5ff3d";
    context.font = "500 18px 'IBM Plex Mono', monospace";
    context.fillText("MAY 2024 - PRESENT", 78, 890);
  } else {
    context.fillStyle = "#c5ff3d";
    context.fillRect(56, 58, 10, 112);
    context.font = "600 25px 'IBM Plex Mono', monospace";
    context.fillText("PROFILE / REVERSE", 92, 91);
    context.fillStyle = "#8d938e";
    context.font = "500 17px 'IBM Plex Mono', monospace";
    context.fillText("SUDOJACKY / 01", 92, 126);
    context.fillStyle = "#c5ff3d";
    context.fillRect(584, 58, 128, 42);
    context.fillStyle = "#0b100f";
    context.font = "600 17px 'IBM Plex Mono', monospace";
    context.fillText("REVERSE", 611, 85);
    drawRule(190);

    drawLabel("CURRENT EXPERIENCE", 56, 246);
    context.fillStyle = "#e8e7e0";
    context.font = "500 46px 'IBM Plex Mono', monospace";
    context.fillText("Samsung Electronics", 56, 308);
    context.fillStyle = "#c5ff3d";
    context.font = "500 21px 'IBM Plex Mono', monospace";
    context.fillText("MAY 2024 - PRESENT", 56, 350);

    drawRule(402);
    drawLabel("FOCUS", 56, 454);
    context.fillStyle = "#c5ff3d";
    context.font = "500 20px 'IBM Plex Mono', monospace";
    context.fillText("01", 56, 512);
    context.fillText("02", 56, 570);
    context.fillText("03", 56, 628);
    context.fillStyle = "#e8e7e0";
    context.font = "500 31px 'IBM Plex Mono', monospace";
    context.fillText("Reliable systems", 112, 512);
    context.fillText("Useful tools", 112, 570);
    context.fillText("Clear documentation", 112, 628);

    drawRule(680);
    drawLabel("SITE ACCESS", 56, 732);
    context.fillStyle = "#e8e7e0";
    context.font = "500 21px 'IBM Plex Mono', monospace";
    context.fillText("HOME / PROJECTS / NOTES / DOCS", 56, 772);

    drawLabel("CONTACT", 56, 842);
    context.fillStyle = "#c5ff3d";
    context.font = "500 24px 'IBM Plex Mono', monospace";
    context.fillText("github.com/SudoJacky", 56, 886);
    context.fillStyle = "#a8aaa6";
    context.font = "400 18px 'IBM Plex Mono', monospace";
    context.fillText("PERSONAL PORTFOLIO / NOT A CORPORATE ID", 56, 970);
  }

  context.fillStyle = "#a8aaa6";
  context.font = "400 20px 'IBM Plex Mono', monospace";
  context.fillText("sudojacky.github.io", 56, 1026);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function drawBandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  context.fillStyle = "#070b0a";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.lineCap = "round";
  for (let x = -64; x < canvas.width + 64; x += 12) {
    context.strokeStyle = x % 24 === 0 ? "#2b3531" : "#18211e";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(x, canvas.height);
    context.lineTo(x + 64, 0);
    context.stroke();
  }

  for (let x = -64; x < canvas.width + 64; x += 16) {
    context.strokeStyle = "rgba(255, 255, 255, 0.055)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 64, canvas.height);
    context.stroke();
  }

  [36, 164].forEach((x) => {
    context.strokeStyle = "#c5ff3d";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x, canvas.height);
    context.lineTo(x + 64, 0);
    context.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function StaticLanyard() {
  return (
    <div className="lanyard-static" aria-label="SudoJacky personal identity card">
      <span className="lanyard-static__strap" aria-hidden="true" />
      <div className="lanyard-static__card">
        <div className="lanyard-static__identity">
          <img src={avatarImageUrl} alt="" />
          <span>SudoJacky</span>
          <small>Software Engineer</small>
        </div>
        <div className="lanyard-static__details">
          <span><small>ID</small>SJ-2405</span>
          <span><small>CURRENT</small>Samsung Electronics</span>
        </div>
        <span className="lanyard-static__bottom">sudojacky.github.io</span>
      </div>
    </div>
  );
}

function Band({ onDraggingChange }) {
  const band = useRef(null);
  const fixed = useRef(null);
  const joint1 = useRef(null);
  const joint2 = useRef(null);
  const joint3 = useRef(null);
  const card = useRef(null);
  const visualCard = useRef(null);
  const pointerPress = useRef(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const avatarTexture = useTexture(avatarImageUrl);
  const frontTexture = useMemo(
    () => drawCardTexture("front", avatarTexture.image),
    [avatarTexture],
  );
  const backTexture = useMemo(() => drawCardTexture("back"), []);
  const bandTexture = useMemo(() => drawBandTexture(), []);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]));
  const pointerVector = useMemo(() => new THREE.Vector3(), []);
  const directionVector = useMemo(() => new THREE.Vector3(), []);
  const cardAttachment = useMemo(() => new THREE.Vector3(), []);
  const cardQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const angularVelocity = useMemo(() => new THREE.Vector3(), []);
  const rotation = useMemo(() => new THREE.Vector3(), []);
  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  useRopeJoint(fixed, joint1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(joint1, joint2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(joint2, joint3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(joint3, card, [[0, 0, 0], [0, 2.44, 0]]);

  useEffect(() => () => {
    frontTexture.dispose();
    backTexture.dispose();
    bandTexture.dispose();
  }, [backTexture, bandTexture, frontTexture]);

  useFrame((state, delta) => {
    if (visualCard.current) {
      visualCard.current.rotation.y = THREE.MathUtils.damp(
        visualCard.current.rotation.y,
        flipped ? Math.PI : 0,
        10,
        delta,
      );
    }

    if (dragOffset && card.current) {
      pointerVector.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      directionVector.copy(pointerVector).sub(state.camera.position).normalize();
      pointerVector.add(directionVector.multiplyScalar(state.camera.position.length()));
      [card, joint1, joint2, joint3, fixed].forEach((body) => body.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: pointerVector.x - dragOffset.x,
        y: pointerVector.y - dragOffset.y,
        z: pointerVector.z - dragOffset.z,
      });
    }

    if (!fixed.current || !joint1.current || !joint2.current || !joint3.current || !card.current) return;

    [joint1, joint2].forEach((joint) => {
      if (!joint.current.smoothed) {
        joint.current.smoothed = new THREE.Vector3().copy(joint.current.translation());
      }
      const distance = joint.current.smoothed.distanceTo(joint.current.translation());
      joint.current.smoothed.lerp(
        joint.current.translation(),
        delta * (5 + Math.min(1, Math.max(0.1, distance)) * 45),
      );
    });

    const cardRotation = card.current.rotation();
    cardQuaternion.set(cardRotation.x, cardRotation.y, cardRotation.z, cardRotation.w);
    cardAttachment
      .set(0, 2.44, 0)
      .applyQuaternion(cardQuaternion)
      .add(card.current.translation());

    curve.points[0].copy(cardAttachment);
    curve.points[1].copy(joint2.current.smoothed);
    curve.points[2].copy(joint1.current.smoothed);
    curve.points[3].copy(fixed.current.translation());
    band.current?.geometry.setPoints(curve.getPoints(32));

    angularVelocity.copy(card.current.angvel());
    rotation.copy(card.current.rotation());
    card.current.setAngvel({
      x: angularVelocity.x,
      y: angularVelocity.y - rotation.y * 0.25,
      z: angularVelocity.z,
    });
  });

  curve.curveType = "chordal";

  const beginInteraction = (event) => {
    event.stopPropagation();
    event.target.setPointerCapture(event.pointerId);
    const pointerEvent = event.nativeEvent ?? event;
    pointerPress.current = {
      pointerId: event.pointerId,
      x: pointerEvent.clientX,
      y: pointerEvent.clientY,
      moved: false,
    };
  };

  const moveInteraction = (event) => {
    const press = pointerPress.current;
    if (!press || press.pointerId !== event.pointerId || press.moved) return;

    const pointerEvent = event.nativeEvent ?? event;
    const distance = Math.hypot(
      pointerEvent.clientX - press.x,
      pointerEvent.clientY - press.y,
    );
    if (distance < 6) return;

    event.stopPropagation();
    press.moved = true;
    const translation = card.current.translation();
    setDragOffset(new THREE.Vector3(
      event.point.x - translation.x,
      event.point.y - translation.y,
      event.point.z - translation.z,
    ));
    onDraggingChange(true);
  };

  const finishInteraction = (event, allowFlip) => {
    event.stopPropagation();
    const press = pointerPress.current;
    const shouldFlip = allowFlip
      && press?.pointerId === event.pointerId
      && !press.moved;
    pointerPress.current = null;

    if (event.target.hasPointerCapture?.(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId);
    }
    setDragOffset(null);
    onDraggingChange(false);
    if (shouldFlip) setFlipped((value) => !value);
  };

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody ref={joint1} {...segmentProps} position={[0.5, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={joint2} {...segmentProps} position={[1, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={joint3} {...segmentProps} position={[1.5, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={card}
          {...segmentProps}
          type={dragOffset ? "kinematicPosition" : "dynamic"}
          position={[2, 0, 0]}
        >
          <CuboidCollider args={[1.78, 2.47, 0.12]} />
          <group
            ref={visualCard}
            onPointerDown={beginInteraction}
            onPointerMove={moveInteraction}
            onPointerUp={(event) => finishInteraction(event, true)}
            onPointerCancel={(event) => finishInteraction(event, false)}
          >
            <RoundedBox args={[3.54, 4.92, 0.18]} radius={0.2} smoothness={5}>
              <meshPhysicalMaterial
                color="#101716"
                roughness={0.58}
                metalness={0.34}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
              />
            </RoundedBox>
            <mesh position={[0, 0, 0.101]}>
              <planeGeometry args={[3.3, 4.68]} />
              <meshStandardMaterial map={frontTexture} roughness={0.72} metalness={0.08} />
            </mesh>
            <mesh position={[0, 0, -0.101]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[3.3, 4.68]} />
              <meshStandardMaterial map={backTexture} roughness={0.72} metalness={0.08} />
            </mesh>
            <mesh position={[0, 2.18, 0.13]}>
              <boxGeometry args={[0.81, 0.22, 0.16]} />
              <meshStandardMaterial color="#050807" roughness={0.35} metalness={0.7} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#ffffff"
          map={bandTexture}
          useMap={1}
          repeat={[5, 1]}
          transparent
          opacity={0.96}
          depthTest
          lineWidth={0.46}
          resolution={[1000, 1000]}
        />
      </mesh>
    </>
  );
}

// Project-specific, asset-free adaptation of React Bits' Lanyard component.
export default function Lanyard() {
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(() => (
    window.matchMedia("(max-width: 980px), (pointer: coarse)").matches
  ));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 980px), (pointer: coarse)");
    const updateMode = () => setCompact(media.matches);
    media.addEventListener?.("change", updateMode);
    return () => media.removeEventListener?.("change", updateMode);
  }, []);

  if (compact || reducedMotion) return <StaticLanyard />;

  return (
    <div
      className="lanyard-wrapper"
      data-native-cursor
      data-dragging={dragging ? "true" : "false"}
      aria-label="Draggable SudoJacky personal identity card"
    >
      <Canvas
        camera={{ position: [0, -3.2, 20], rotation: [0, 0, 0], fov: 20 }}
        dpr={[1, 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
        <directionalLight position={[-5, 8, 7]} intensity={3.4} color="#ffffff" />
        <pointLight position={[5, 1, 5]} intensity={18} color="#c5ff3d" distance={18} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band onDraggingChange={setDragging} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
