import { useEffect, useRef, useState } from "react";
import "./LineSidebar.css";

const DEFAULT_ITEMS = ["Overview", "Context", "Details", "Conclusion"];

function getFalloff(distance, radius, falloff) {
  const progress = Math.max(0, 1 - distance / radius);

  if (falloff === "linear") return progress;
  if (falloff === "exponential") return progress ** 2;

  return progress * progress * (3 - 2 * progress);
}

function normalizeItem(item) {
  return typeof item === "string" ? { label: item, level: 2 } : item;
}

export default function LineSidebar({
  items = DEFAULT_ITEMS,
  accentColor = "#A855F7",
  textColor = "#c4c4c4",
  markerColor = "#6c6c6c",
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = "smooth",
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  defaultActive = null,
  activeIndex: controlledActiveIndex,
  onItemClick,
  className = "",
  ariaLabel = "Table of contents",
}) {
  const itemRefs = useRef([]);
  const pointerY = useRef(null);
  const frame = useRef(null);
  const activeRef = useRef(defaultActive);
  const [localActiveIndex, setLocalActiveIndex] = useState(defaultActive);
  const activeIndex = controlledActiveIndex ?? localActiveIndex;

  activeRef.current = activeIndex;

  useEffect(() => {
    const update = () => {
      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        const activeEffect = index === activeRef.current ? 1 : 0;
        let pointerEffect = 0;

        if (pointerY.current !== null) {
          const rect = item.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          pointerEffect = getFalloff(
            Math.abs(pointerY.current - center),
            proximityRadius,
            falloff,
          );
        }

        item.style.setProperty("--effect", Math.max(activeEffect, pointerEffect));
      });

      frame.current = window.requestAnimationFrame(update);
    };

    frame.current = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame.current);
  }, [falloff, proximityRadius]);

  const style = {
    "--accent-color": accentColor,
    "--text-color": textColor,
    "--marker-color": markerColor,
    "--marker-length": `${markerLength}px`,
    "--marker-gap": `${markerGap}px`,
    "--tick-scale": tickScale,
    "--max-shift": `${maxShift}px`,
    "--item-gap": `${itemGap}px`,
    "--font-size": `${fontSize}rem`,
    "--smoothing": `${smoothing}ms`,
  };

  const classes = [
    "line-sidebar",
    showMarker && "line-sidebar--markers",
    scaleTick && "line-sidebar--scale-tick",
    className,
  ].filter(Boolean).join(" ");

  return (
    <nav
      aria-label={ariaLabel}
      className={classes}
      onPointerMove={(event) => {
        pointerY.current = event.clientY;
      }}
      onPointerLeave={() => {
        pointerY.current = null;
      }}
      style={style}
    >
      <ol className="line-sidebar__list">
        {items.map((rawItem, index) => {
          const item = normalizeItem(rawItem);

          return (
            <li
              className={`line-sidebar__item line-sidebar__item--level-${item.level ?? 2}`}
              key={item.id ?? `${item.label}-${index}`}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
            >
              <button
                aria-current={index === activeIndex ? "location" : undefined}
                className="line-sidebar__button"
                onClick={() => {
                  setLocalActiveIndex(index);
                  onItemClick?.(item, index);
                }}
                type="button"
              >
                {showMarker && <span aria-hidden="true" className="line-sidebar__marker" />}
                <span className="line-sidebar__label">
                  {showIndex && (
                    <span aria-hidden="true" className="line-sidebar__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
