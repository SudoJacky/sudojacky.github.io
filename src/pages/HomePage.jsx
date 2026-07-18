import { ArrowRight } from "@phosphor-icons/react";
import { lazy, Suspense } from "react";
import { NavLink } from "react-router-dom";
import SpotlightCard from "../components/reactbits/SpotlightCard";
import TextType from "../components/reactbits/TextType";

const LiquidEther = lazy(() => import("../components/reactbits/LiquidEther"));
const Lanyard = lazy(() => import("../components/reactbits/Lanyard"));

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-background">
          <Suspense fallback={null}>
            <LiquidEther mouseForce={0.72} autoSpeed={0.38} resolution={0.65} />
          </Suspense>
        </div>

        <div className="hero-lanyard">
          <Suspense fallback={<div className="hero-lanyard-placeholder" aria-hidden="true" />}>
            <Lanyard />
          </Suspense>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">SOFTWARE ENGINEER · BUILDER · PROBLEM SOLVER</p>
          <TextType
            as="h1"
            id="home-title"
            className="hero-title"
            text={"I build software\nthat makes complex\nthings clear."}
            typingSpeed={38}
            initialDelay={220}
            loop={false}
            cursorCharacter="_"
          />
          <p className="hero-intro">I'm Jacky, a software engineer focused on building reliable systems, useful tools, and products that are easy to understand and maintain.</p>
          <div className="hero-actions">
            <NavLink className="button button-primary" to="/projects">
              View my projects <ArrowRight aria-hidden="true" size={20} />
            </NavLink>
            <NavLink className="button button-secondary" to="/notes">
              Read my notes <ArrowRight aria-hidden="true" size={20} />
            </NavLink>
          </div>
        </div>

        <div className="hero-lower">
          <a href="https://github.com/SudoJacky" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </section>

      <section className="experience" id="experience" aria-labelledby="experience-title">
        <header className="experience-heading">
          <p className="section-label">EXPERIENCE</p>
          <h2 id="experience-title">Where I've worked and what I've contributed.</h2>
        </header>

        <div className="experience-timeline">
          <SpotlightCard
            as="article"
            className="experience-entry"
            spotlightColor="rgba(197, 255, 61, 0.14)"
          >
            <span className="experience-index" aria-hidden="true">01</span>
            <time dateTime="2024-05">May 2024 – Present</time>
            <div className="experience-company">
              <h3>Samsung Research</h3>
              <p>Software Engineer</p>
            </div>
          </SpotlightCard>
        </div>
      </section>
    </main>
  );
}
