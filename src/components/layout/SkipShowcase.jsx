import { ArrowDown } from "@phosphor-icons/react";

export default function SkipShowcase({ targetId }) {
  return (
    <button className="showcase-skip text-link" type="button" onClick={() => {
      const target = document.getElementById(targetId);
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "instant", block: "start" });
    }}>
      Skip to the architecture <ArrowDown size={16} aria-hidden="true" />
    </button>
  );
}
