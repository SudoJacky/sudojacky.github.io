import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Brain,
  DotsThree,
  FileText,
  Folder,
  Globe,
  Monitor,
  Plus,
  SidebarSimple,
  SlidersHorizontal,
  SquaresFour,
  TerminalWindow,
  UsersThree,
  Wrench,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const suggestions = [
  "Plan a task and show every execution step",
  "Review this project and surface the riskiest decisions",
  "Turn a folder of notes into a concise brief",
  "Coordinate multiple agents around one outcome",
];

const workspaceFolders = [
  "cowork",
  "knowledge",
  "memory",
  "plans",
  "workspace",
];

export default function TinybotMorphShowcase() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 721px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      ({ conditions }) => {
        if (!conditions.desktop || !conditions.motion) return undefined;

        const section = sectionRef.current;
        const stage = section.querySelector(".tinybot-morph-stage");
        const shell = section.querySelector(".tinybot-morph-shell");
        const composer = section.querySelector(".tinybot-morph-composer");
        const intro = section.querySelector(".tinybot-morph-intro");
        const compactHint = section.querySelector(".tinybot-morph-compact-hint");
        const prompt = section.querySelector(".tinybot-morph-prompt");
        const signals = section.querySelector(".tinybot-morph-signals");
        const toolbar = section.querySelector(".tinybot-morph-toolbar");
        const header = section.querySelector(".tinybot-workbench-header");
        const welcome = section.querySelector(".tinybot-workbench-welcome");
        const chat = section.querySelector(".tinybot-workbench-chat");
        const tinyOs = section.querySelector(".tinybot-tinyos-panel");
        const captions = gsap.utils.toArray(".tinybot-morph-caption", section);

        const availableWidth = () => stage.clientWidth;
        const pillWidth = () => Math.min(620, availableWidth() - 44);
        const composerWidth = () => Math.min(790, availableWidth() - 44);
        const fullWidth = () => Math.min(1180, availableWidth() - 24);
        const fullHeight = () => Math.min(700, stage.clientHeight - 38);

        gsap.set(shell, {
          width: 80,
          height: 80,
          right: 28,
          xPercent: 0,
          borderRadius: 999,
          borderColor: "transparent",
          backgroundColor: "transparent",
        });
        gsap.set(composer, {
          width: 80,
          height: 80,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          borderColor: "transparent",
        });
        gsap.set([compactHint, prompt, signals, toolbar, header, welcome], {
          opacity: 0,
        });
        gsap.set([compactHint, prompt, signals, toolbar], { y: 12 });
        gsap.set([header, welcome], { y: 18 });
        gsap.set(tinyOs, { autoAlpha: 0, xPercent: 104 });
        gsap.set(captions, { opacity: 0, y: 10 });
        gsap.set(captions[0], { opacity: 1, y: 0 });

        const showCaption = (index, position) => {
          captions.forEach((caption, captionIndex) => {
            if (captionIndex === index) {
              gsap.set(caption, { pointerEvents: "auto" });
            }
          });
          return gsap
            .timeline()
            .to(captions, { opacity: 0, y: -8, duration: 0.18 }, 0)
            .to(captions[index], { opacity: 1, y: 0, duration: 0.3 }, position ?? 0.12);
        };

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top+=82",
            end: "bottom bottom",
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(shell, {
            width: pillWidth,
            height: 84,
            borderRadius: 42,
            borderColor: "rgba(197, 255, 61, 0.62)",
            backgroundColor: "#121918",
            duration: 1,
          })
          .to(
            composer,
            {
              width: pillWidth,
              height: 84,
              borderRadius: 42,
              duration: 1,
            },
            "<",
          )
          .to(compactHint, { opacity: 1, y: 0, duration: 0.34 }, 0.38)
          .add(showCaption(1), 0.54)
          .to(shell, {
            width: composerWidth,
            height: 286,
            borderRadius: 28,
            duration: 1.15,
          })
          .to(
            composer,
            {
              width: composerWidth,
              height: 286,
              borderRadius: 28,
              duration: 1.15,
            },
            "<",
          )
          .to(compactHint, { opacity: 0, y: -10, duration: 0.24 }, "<")
          .to(prompt, { opacity: 1, y: 0, duration: 0.4 }, "<0.3")
          .to(toolbar, { opacity: 1, y: 0, duration: 0.34 }, "<0.18")
          .add(showCaption(2), "<0.1")
          .to(signals, { opacity: 1, y: 0, duration: 0.45 })
          .to(signals, { "--signal-fill": "100%", duration: 0.8 })
          .to(intro, { opacity: 0, y: -20, duration: 0.35 })
          .add(showCaption(3), "<")
          .to(shell, {
            width: fullWidth,
            height: fullHeight,
            right: "50%",
            xPercent: 50,
            borderRadius: 18,
            borderColor: "rgba(197, 255, 61, 0.4)",
            duration: 1.5,
          })
          .to(
            composer,
            {
              width: () => fullWidth() - 52,
              height: 188,
              right: 26,
              bottom: 26,
              borderRadius: 18,
              borderColor: "rgba(59, 65, 64, 1)",
              duration: 1.5,
            },
            "<",
          )
          .to(signals, { opacity: 0, y: -8, duration: 0.24 }, "<0.12")
          .to(header, { opacity: 1, y: 0, duration: 0.42 }, "<0.28")
          .to(welcome, { opacity: 1, y: 0, duration: 0.55 }, "<0.16")
          .to(prompt, { opacity: 0.72, duration: 0.3 }, "<")
          .to(toolbar, { opacity: 1, duration: 0.3 }, "<")
          .add(showCaption(4), "+=0.22")
          .to(
            chat,
            {
              width: "42%",
              duration: 1.45,
            },
            "<",
          )
          .to(
            composer,
            {
              width: () => fullWidth() * 0.42 - 32,
              height: 170,
              right: 16,
              bottom: 18,
              duration: 1.45,
            },
            "<",
          )
          .to(
            welcome,
            {
              width: "calc(100% - 36px)",
              top: 104,
              duration: 1.1,
            },
            "<0.1",
          )
          .to(
            prompt,
            {
              top: 24,
              right: 20,
              left: 20,
              fontSize: 16,
              lineHeight: 1.45,
              duration: 1.1,
            },
            "<",
          )
          .to(
            tinyOs,
            {
              autoAlpha: 1,
              xPercent: 0,
              duration: 1.45,
              ease: "power2.out",
            },
            "<",
          );

        return () => timeline.kill();
      },
      sectionRef,
    );

    return () => media.revert();
  }, []);

  return (
    <section
      className="tinybot-morph-section"
      ref={sectionRef}
      aria-labelledby="tinybot-morph-title"
    >
      <div className="tinybot-morph-stage">
        <div className="tinybot-morph-intro">
          <p className="section-label">SCROLL TO BUILD</p>
          <h2 id="tinybot-morph-title">One action becomes a workbench.</h2>
          <p>
            Follow a single prompt as Tinybot adds intent, context, tools, memory,
            and collaborating agents around it.
          </p>
        </div>

        <div className="tinybot-morph-shell">
          <div className="tinybot-workbench-chat">
            <header className="tinybot-workbench-header">
              <div>
                <strong>New session</strong>
                <span><i />Native runtime ready</span>
              </div>
              <div aria-hidden="true">
                <SidebarSimple size={20} />
                <DotsThree size={24} weight="bold" />
              </div>
            </header>

            <div className="tinybot-workbench-welcome">
              <p className="section-label">TINYBOT / NATIVE WORKBENCH</p>
              <h3>What should Tinybot work on?</h3>
              <p>Start with an outcome. Tinybot keeps the system around it visible.</p>
              <div className="tinybot-workbench-suggestions">
                {suggestions.map((suggestion) => (
                  <span key={suggestion}>{suggestion}</span>
                ))}
              </div>
            </div>

            <div className="tinybot-morph-composer">
              <span className="tinybot-morph-compact-hint">Describe a task...</span>
              <p className="tinybot-morph-prompt">
                Plan a release-ready desktop assistant and keep every important
                step observable.
              </p>

              <div className="tinybot-morph-signals">
                <span><Wrench size={14} />Tools connected</span>
                <span><Brain size={14} />Memory ready</span>
                <span><UsersThree size={14} />Cowork online</span>
              </div>

              <div className="tinybot-morph-toolbar">
                <span aria-hidden="true"><Plus size={20} /></span>
                <span aria-hidden="true"><SlidersHorizontal size={19} /></span>
                <strong>Model / routed</strong>
                <small><i />Context ready</small>
              </div>

              <span className="tinybot-morph-send" aria-hidden="true">
                <ArrowUp size={28} weight="bold" />
              </span>
            </div>
          </div>

          <aside
            className="tinybot-tinyos-panel"
            aria-label="TinyOS shared desktop preview"
          >
            <header className="tinybot-tinyos-header">
              <div>
                <Monitor size={19} weight="duotone" />
                <strong>TinyOS</strong>
                <span>Shared desktop</span>
              </div>
              <small><i />USER + TINYBOT</small>
            </header>

            <div className="tinybot-tinyos-desktop">
              <div className="tinybot-tinyos-session">
                <span><Monitor size={15} />SHARED WORKSPACE</span>
                <small>Both cursors connected</small>
              </div>

              <section className="tinybot-tinyos-window tinybot-tinyos-files">
                <header>
                  <span><Folder size={17} weight="duotone" />Files</span>
                  <DotsThree size={18} weight="bold" />
                </header>
                <div className="tinybot-tinyos-file-toolbar">
                  <Folder size={14} />
                  <span>WORKSPACE</span>
                </div>
                <div className="tinybot-tinyos-file-list">
                  {workspaceFolders.map((folder) => (
                    <span key={folder}>
                      <Folder size={14} />
                      {folder}
                    </span>
                  ))}
                  <span>
                    <FileText size={14} />
                    shared-plan.md
                  </span>
                </div>
                <footer>Workspace root / ready</footer>
              </section>

              <section className="tinybot-tinyos-window tinybot-tinyos-browser">
                <header>
                  <span><Globe size={17} weight="duotone" />Browser</span>
                  <DotsThree size={18} weight="bold" />
                </header>
                <div className="tinybot-tinyos-browser-bar">
                  <ArrowLeft size={14} />
                  <ArrowRight size={14} />
                  <ArrowClockwise size={14} />
                  <span>tinybot.local/shared</span>
                </div>
                <div className="tinybot-tinyos-browser-page">
                  <small>LIVE SHARED VIEW</small>
                  <Globe size={38} weight="thin" />
                  <h4>TinyOS keeps the work visible.</h4>
                  <p>User and Tinybot can inspect the same workspace while the task runs.</p>
                  <div>
                    <span><i />Files indexed</span>
                    <span><i />Browser shared</span>
                    <span><i />Agent tools ready</span>
                  </div>
                </div>
                <footer><i />USER HAS CONTROL</footer>
              </section>

              <nav className="tinybot-tinyos-dock" aria-label="TinyOS tools">
                <span aria-label="Files"><Folder size={19} /></span>
                <span aria-label="Terminal"><TerminalWindow size={19} /></span>
                <span className="is-active" aria-label="Browser"><Globe size={19} /></span>
                <span aria-label="Workspace overview"><SquaresFour size={19} /></span>
              </nav>
            </div>
          </aside>
        </div>

        <div className="tinybot-morph-captions" aria-hidden="true">
          <p className="tinybot-morph-caption">
            <span>01 / ACTION</span>
            One clear place to begin.
          </p>
          <p className="tinybot-morph-caption">
            <span>02 / INTENT</span>
            The action opens into a prompt.
          </p>
          <p className="tinybot-morph-caption">
            <span>03 / CONTEXT</span>
            Tools, memory, and agents connect.
          </p>
          <p className="tinybot-morph-caption">
            <span>04 / WORKBENCH</span>
            The whole system becomes visible.
          </p>
          <p className="tinybot-morph-caption">
            <span>05 / TINYOS</span>
            A shared space for human and agent work.
          </p>
        </div>
      </div>
    </section>
  );
}
