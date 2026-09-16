import { ArrowRight } from "@phosphor-icons/react";
import { lazy, Suspense } from "react";
import { NavLink } from "react-router-dom";
import { notes } from "../content/contentRegistry";

const LiquidEther = lazy(() => import("../components/reactbits/LiquidEther"));
const Lanyard = lazy(() => import("../components/reactbits/Lanyard"));

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-background">
          <Suspense fallback={null}><LiquidEther mouseForce={0.72} autoSpeed={0.38} resolution={0.65} /></Suspense>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">JACKY / SOFTWARE ENGINEER</p>
          <h1 id="home-title">Building agents.<br />Writing the details.</h1>
          <p className="hero-intro">I build Tinybot and explore how agents work: their tools, memory, and execution. These are my notes from building the systems.</p>
          <div className="hero-actions">
            <NavLink className="button button-primary" to="/notes">Read my notes <ArrowRight aria-hidden="true" size={20} /></NavLink>
            <NavLink className="text-link" to="/projects">Explore projects <ArrowRight aria-hidden="true" size={20} /></NavLink>
          </div>
        </div>
        <div className="hero-lanyard">
          <Suspense fallback={<div className="hero-lanyard-placeholder" aria-hidden="true" />}><Lanyard /></Suspense>
        </div>
        <div className="hero-lower">
          <span>Currently at Samsung Research</span>
          <a href="https://github.com/SudoJacky" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </section>
      <section className="home-notes" aria-labelledby="home-notes-title">
        <header className="home-section-heading">
          <div><p className="section-label">FROM THE NOTEBOOK</p><h2 id="home-notes-title">Recent writing</h2></div>
          <NavLink className="text-link" to="/notes">All notes <ArrowRight aria-hidden="true" size={20} /></NavLink>
        </header>
        <div className="index-list" lang="zh-CN">
          {notes.slice(0, 3).map((note) => (
            <NavLink className="home-note" to={`/notes/${note.slug}`} key={note.slug}>
              <time dateTime={note.date}>{note.date}</time>
              <div><h3>{note.title}</h3><p>{note.summary}</p></div>
              <ArrowRight aria-hidden="true" size={22} />
            </NavLink>
          ))}
        </div>
      </section>
      <section className="home-project" aria-labelledby="home-project-title">
        <NavLink className="home-project-image" to="/projects/tinybot" aria-label="Explore Tinybot">
          <img src={`${import.meta.env.BASE_URL}images/projects/tinybot-workbench.webp`} alt="Tinybot desktop showing a task conversation and its generated report side by side" loading="lazy" width="1926" height="1140" />
        </NavLink>
        <div>
          <p className="section-label">IN DEVELOPMENT / TINYBOT</p>
          <h2 id="home-project-title">Where the ideas become software.</h2>
          <p>A desktop workbench for following an agent's work, from a task and its tools to memory and collaborating agents.</p>
          <NavLink className="text-link" to="/projects/tinybot">Explore Tinybot <ArrowRight aria-hidden="true" size={20} /></NavLink>
          <NavLink className="text-link" to="/docs/tinybot">Read the engineering notes <ArrowRight aria-hidden="true" size={20} /></NavLink>
        </div>
      </section>
      <section className="experience" aria-label="Current work">
        <p className="section-label">CURRENT WORK</p>
        <div><h2>Samsung Research</h2><p>Software Engineer</p></div>
        <time dateTime="2024-05">May 2024 – Present</time>
      </section>
    </main>
  );
}
