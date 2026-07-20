import {
  Buildings,
  Crosshair,
  House,
  Lamp,
  Pulse,
  Stack,
  UsersThree,
  VectorThree,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";
import VirtualHomeHouseScene from "./VirtualHomeHouseScene";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    icon: House,
    label: "COMPLETE HOME",
    number: "01",
    title: "Begin with the whole home.",
    copy: "One inhabited model enters the frame with its architecture, rooms, garden, and household state intact.",
  },
  {
    icon: Stack,
    label: "FLOORS APART",
    number: "02",
    title: "Take the structure apart.",
    copy: "The roof rises first. Upper and ground floors separate vertically while their spatial relationship stays readable.",
  },
  {
    icon: VectorThree,
    label: "CONTEXT IN LINES",
    number: "03",
    title: "Keep context without the visual weight.",
    copy: "Non-target layers become a quiet wireframe, preserving the complete home around the active floor.",
  },
  {
    icon: Crosshair,
    label: "GROUND LOCK",
    number: "04",
    title: "Descend into the ground floor.",
    copy: "The camera lowers, the exterior shell opens, and the living spaces become the primary inspection surface.",
  },
  {
    icon: Lamp,
    label: "SYSTEMS AWAKE",
    number: "05",
    title: "Let the household come online.",
    copy: "Residents, the pet, devices, and room sensors activate in sequence instead of appearing as a static diagram.",
  },
  {
    icon: Pulse,
    label: "CAUSE & EFFECT",
    number: "06",
    title: "Watch the home explain itself.",
    copy: "Signals connect people, rooms, and devices so each household event can be traced back to its cause.",
  },
];

const stageForProgress = (progress) => {
  if (progress >= 0.84) return 5;
  if (progress >= 0.67) return 4;
  if (progress >= 0.5) return 3;
  if (progress >= 0.33) return 2;
  if (progress >= 0.14) return 1;
  return 0;
};

export default function VirtualHomeScrollShowcase() {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const renderSceneRef = useRef(null);
  const stageRef = useRef(0);
  const [activeStage, setActiveStage] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(false);

  useLayoutEffect(() => {
    const desktop = window.matchMedia("(min-width: 721px)");
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");

    if (!desktop.matches || !motion.matches) {
      progressRef.current = 0.88;
      stageRef.current = 5;
      setActiveStage(5);
      setSceneVisible(true);
      renderSceneRef.current?.({ updateShadows: true });
      return undefined;
    }

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top+=82",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onToggle: ({ isActive }) => {
        setSceneVisible(isActive);
        if (isActive) {
          renderSceneRef.current?.({ updateShadows: true });
        }
      },
      onUpdate: ({ progress }) => {
        progressRef.current = progress;
        renderSceneRef.current?.({ updateShadows: true });
        const nextStage = stageForProgress(progress);

        if (nextStage !== stageRef.current) {
          stageRef.current = nextStage;
          setActiveStage(nextStage);
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const currentStage = stages[activeStage];

  return (
    <section
      className="virtualhome-scroll-section"
      ref={sectionRef}
      aria-labelledby="virtualhome-scroll-title"
    >
      <div className="virtualhome-scroll-stage">
        <header className="virtualhome-sim-header">
          <span>VIRTUALHOME / LIVE MODEL</span>
          <span><i />SIMULATION RUNNING</span>
          <span>DAY 018 · 19:42</span>
        </header>

        <div className="virtualhome-stage-progress" aria-hidden="true">
          {stages.map(({ label }, index) => (
            <i className={index <= activeStage ? "is-reached" : ""} key={label} />
          ))}
        </div>

        <div className="virtualhome-stage-copy" aria-live="polite">
          <p className="section-label">
            {currentStage.number} / {currentStage.label}
          </p>
          <h2 id="virtualhome-scroll-title">{currentStage.title}</h2>
          <p>{currentStage.copy}</p>
        </div>

        <div className="virtualhome-scene" aria-label="Scroll-driven three-dimensional home model">
          <VirtualHomeHouseScene
            animateSignals={sceneVisible && activeStage >= 4}
            progressRef={progressRef}
            renderSceneRef={renderSceneRef}
          />
          <aside
            className={`virtualhome-event-trace ${activeStage === 5 ? "is-visible" : ""}`}
            aria-hidden={activeStage !== 5}
          >
            <span>CAUSAL TRACE / 018</span>
            <ol>
              <li><time>19:42:02</time><strong>Motion detected</strong><small>Living room</small></li>
              <li><time>19:42:04</time><strong>Evening scene</strong><small>Lights → 42%</small></li>
              <li><time>19:42:08</time><strong>Comfort response</strong><small>HVAC → 22.1°C</small></li>
            </ol>
          </aside>
          <div className="virtualhome-scene-reticle" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <ol className="virtualhome-stage-rail" aria-label="Animation stages">
          {stages.map(({ icon: Icon, label }, index) => (
            <li
              className={index === activeStage ? "is-active" : ""}
              data-complete={index < activeStage ? "true" : "false"}
              key={label}
            >
              <span><Icon aria-hidden="true" size={16} weight="light" /></span>
              <small>{label}</small>
            </li>
          ))}
        </ol>

        <div className="virtualhome-live-readout" aria-label="Current simulation state">
          <div>
            <Pulse aria-hidden="true" size={18} />
            <span>
              <small>ACTIVE LAYER</small>
              <strong>{activeStage < 3 ? "WHOLE HOME" : "GROUND FLOOR"}</strong>
            </span>
          </div>
          <div>
            <UsersThree aria-hidden="true" size={18} />
            <span>
              <small>HOUSEHOLD</small>
              <strong>{activeStage < 4 ? "STANDBY" : "2 PEOPLE + 1 PET"}</strong>
            </span>
          </div>
          <div>
            <Buildings aria-hidden="true" size={18} />
            <span>
              <small>EVENT</small>
              <strong>{activeStage === 5 ? "EVENING ROUTINE / TRACE 018" : "MODEL SYNCHRONIZED"}</strong>
            </span>
          </div>
        </div>

        <p className="virtualhome-scroll-hint" aria-hidden="true">
          SCROLL TO EXPLORE <span>↓</span>
        </p>
      </div>
    </section>
  );
}
