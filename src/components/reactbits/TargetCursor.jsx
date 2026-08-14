import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import "./TargetCursor.css";

const RESTING_POSITIONS = [
  { x: -16, y: -16 },
  { x: 4, y: -16 },
  { x: 4, y: 4 },
  { x: -16, y: 4 },
];

// Streamlined adaptation of React Bits' Target Cursor.
export default function TargetCursor({
  targetSelector = ".cursor-target",
  hideDefaultCursor = true,
  hoverDuration = 0.18,
}) {
  const cursorRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!cursor || !finePointer || reducedMotion) return undefined;

    const corners = Array.from(cursor.querySelectorAll(".target-cursor-corner"));
    const dot = cursor.querySelector(".target-cursor-dot");
    const originalCursor = document.body.style.cursor;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const setCursorX = gsap.quickSetter(cursor, "x", "px");
    const setCursorY = gsap.quickSetter(cursor, "y", "px");
    const setCursorOpacity = gsap.quickSetter(cursor, "opacity");
    const cornerSetters = corners.map((corner) => ({
      x: gsap.quickSetter(corner, "x", "px"),
      y: gsap.quickSetter(corner, "y", "px"),
    }));
    let activeTarget = null;
    let activeRect = null;
    let targetTweening = false;

    if (hideDefaultCursor) {
      document.body.style.cursor = "none";
      document.body.classList.add("target-cursor-active");
    }
    gsap.set(cursor, { x: pointer.x, y: pointer.y });
    corners.forEach((corner, index) => gsap.set(corner, RESTING_POSITIONS[index]));

    const getTargetPositions = () => {
      if (!activeRect) return null;

      const positions = [
        { x: activeRect.left - pointer.x - 5, y: activeRect.top - pointer.y - 5 },
        { x: activeRect.right - pointer.x - 7, y: activeRect.top - pointer.y - 5 },
        { x: activeRect.right - pointer.x - 7, y: activeRect.bottom - pointer.y - 7 },
        { x: activeRect.left - pointer.x - 5, y: activeRect.bottom - pointer.y - 7 },
      ];

      return positions;
    };

    const updateTargetCorners = (immediate = false) => {
      const positions = getTargetPositions();
      if (!positions) return;

      if (immediate && targetTweening) {
        gsap.killTweensOf(corners, "x,y");
        targetTweening = false;
      } else if (!immediate) {
        targetTweening = true;
      }

      corners.forEach((corner, index) => {
        if (immediate) {
          cornerSetters[index].x(positions[index].x);
          cornerSetters[index].y(positions[index].y);
          return;
        }

        gsap.to(corner, {
          ...positions[index],
          duration: hoverDuration,
          ease: "power3.out",
          overwrite: true,
        });
      });
    };

    const releaseTarget = () => {
      if (!activeTarget) return;
      activeTarget = null;
      activeRect = null;
      targetTweening = false;
      corners.forEach((corner, index) => {
        gsap.to(corner, {
          ...RESTING_POSITIONS[index],
          duration: 0.24,
          ease: "power3.out",
          overwrite: true,
        });
      });
      gsap.to(dot, { scale: 1, duration: 0.15 });
    };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const nativeCursorZone = event.target.closest?.("[data-native-cursor]");
      setCursorX(pointer.x);
      setCursorY(pointer.y);
      setCursorOpacity(nativeCursorZone ? 0 : 1);
      if (nativeCursorZone) {
        releaseTarget();
        return;
      }
      updateTargetCorners(true);
    };

    const handlePointerOver = (event) => {
      const target = event.target.closest?.(targetSelector);
      if (!target || target === activeTarget) return;
      activeTarget = target;
      activeRect = target.getBoundingClientRect();
      updateTargetCorners();
      gsap.to(dot, { scale: 0.5, duration: 0.15 });
    };

    const handlePointerOut = (event) => {
      if (!activeTarget) return;
      const nextTarget = event.relatedTarget?.closest?.(targetSelector);
      if (nextTarget === activeTarget) return;
      releaseTarget();
    };

    const refreshTarget = () => {
      if (!activeTarget) return;
      activeRect = activeTarget.getBoundingClientRect();
      updateTargetCorners(true);
    };
    const handlePointerLeave = () => gsap.to(cursor, { opacity: 0, duration: 0.15 });
    const handlePointerEnter = () => gsap.to(cursor, { opacity: 1, duration: 0.15 });
    const handlePointerDown = () => gsap.to(cursor, { scale: 0.9, duration: 0.12 });
    const handlePointerUp = () => gsap.to(cursor, { scale: 1, duration: 0.18 });

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("scroll", refreshTarget, { passive: true });
    window.addEventListener("resize", refreshTarget);
    document.addEventListener("mouseleave", handlePointerLeave);
    document.addEventListener("mouseenter", handlePointerEnter);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("scroll", refreshTarget);
      window.removeEventListener("resize", refreshTarget);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("mouseenter", handlePointerEnter);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = originalCursor;
      document.body.classList.remove("target-cursor-active");
      gsap.killTweensOf([cursor, dot, ...corners]);
    };
  }, [hideDefaultCursor, hoverDuration, reducedMotion, targetSelector]);

  if (reducedMotion) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper" aria-hidden="true">
      <div className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
}
