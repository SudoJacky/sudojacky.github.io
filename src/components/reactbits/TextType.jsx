import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import "./TextType.css";

// Adapted from React Bits' Text Type component.
export default function TextType({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 1800,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  cursorCharacter = "_",
  cursorBlinkDuration = 0.5,
  startOnVisible = false,
  ...props
}) {
  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const reducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [visible, setVisible] = useState(!startOnVisible);
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!cursorRef.current || !showCursor || reducedMotion) return undefined;
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => tween.kill();
  }, [cursorBlinkDuration, reducedMotion, showCursor]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(textArray[0] || "");
      return undefined;
    }
    if (!visible) return undefined;

    const currentText = textArray[textIndex] || "";
    let timeout;

    if (!deleting && characterIndex < currentText.length) {
      timeout = window.setTimeout(() => {
        setDisplayedText(currentText.slice(0, characterIndex + 1));
        setCharacterIndex((value) => value + 1);
      }, characterIndex === 0 ? initialDelay : typingSpeed);
    } else if (!deleting && (loop || textIndex < textArray.length - 1)) {
      timeout = window.setTimeout(() => setDeleting(true), pauseDuration);
    } else if (deleting && displayedText.length > 0) {
      timeout = window.setTimeout(() => {
        setDisplayedText((value) => value.slice(0, -1));
      }, deletingSpeed);
    } else if (deleting) {
      setDeleting(false);
      setCharacterIndex(0);
      setTextIndex((value) => (value + 1) % textArray.length);
    }

    return () => window.clearTimeout(timeout);
  }, [
    characterIndex,
    deleting,
    deletingSpeed,
    displayedText,
    initialDelay,
    loop,
    pauseDuration,
    reducedMotion,
    textArray,
    textIndex,
    typingSpeed,
    visible,
  ]);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`,
      "aria-label": textArray.join(" "),
      ...props,
    },
    <span className="text-type__content" aria-hidden="true">{displayedText}</span>,
    showCursor && !reducedMotion && (
      <span ref={cursorRef} className="text-type__cursor" aria-hidden="true">
        {cursorCharacter}
      </span>
    ),
  );
}
