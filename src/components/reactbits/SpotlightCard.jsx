import { useRef } from "react";
import "./SpotlightCard.css";

// Adapted from React Bits' Spotlight Card component.
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(197, 255, 61, 0.16)",
  as: Component = "div",
  ...props
}) {
  const cardRef = useRef(null);

  const handlePointerMove = (event) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    cardRef.current.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    cardRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <Component
      ref={cardRef}
      className={`card-spotlight ${className}`}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {children}
    </Component>
  );
}
