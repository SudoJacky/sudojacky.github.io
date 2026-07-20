import { ArrowDown, ArrowLeft, Check, X } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import MarkdownArticleLayout from "../../components/article/MarkdownArticleLayout";
import "./FromPromptToAutonomousLoopPage.css";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    number: "01",
    label: "PROMPT",
    title: "先把一次回答调好。",
    copy: "人的注意力贴着输入框。换一句指令、补一个示例，模型就交出另一份结果。",
  },
  {
    number: "02",
    label: "CONTEXT",
    title: "再安排这一刻该知道什么。",
    copy: "历史、文件、工具和计划进入有限窗口。工程对象从一句话变成每轮推理前的认知现场。",
  },
  {
    number: "03",
    label: "HARNESS",
    title: "然后给 Agent 一个能工作的地方。",
    copy: "Git、测试、沙箱和权限围到模型外面。失败有没有证据，开始比 prompt 是否漂亮更重要。",
  },
  {
    number: "04",
    label: "AUTONOMOUS LOOP",
    title: "最后，把下一轮也交给系统。",
    copy: "新会话读取共享状态、领取任务、执行并验证。人退到循环外，只保留目标、预算和停止条件。",
  },
];

const contextNodes = [
  ["HISTORY", "8 turns"],
  ["FILES", "12 selected"],
  ["TOOLS", "6 available"],
  ["PLAN", "3 steps"],
];

const harnessNodes = [
  ["GIT", "state"],
  ["TESTS", "oracle"],
  ["SANDBOX", "boundary"],
  ["PERMISSIONS", "policy"],
];

export default function FromPromptToAutonomousLoopPage({ note }) {
  const pageRef = useRef(null);
  const evolutionRef = useRef(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const evolution = evolutionRef.current;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(page.querySelectorAll(".agent-loop-hero [data-intro]"), {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      page.querySelectorAll(".agent-loop-body > *").forEach((item) => {
        gsap.from(item, {
          autoAlpha: 0,
          y: 28,
          duration: 0.72,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true,
          },
        });
      });

      return undefined;
    });

    media.add(
      {
        desktop: "(min-width: 1101px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      ({ conditions }) => {
        if (!conditions.desktop || !conditions.motion) return undefined;

        const captions = gsap.utils.toArray(".agent-loop-stage-copy", evolution);
        const stageMarkers = gsap.utils.toArray(".agent-loop-stage-marker", evolution);
        const contextFrame = evolution.querySelector(".agent-loop-context-frame");
        const harnessFrame = evolution.querySelector(".agent-loop-harness-frame");
        const contextItems = evolution.querySelectorAll(".agent-loop-context-node");
        const harnessItems = evolution.querySelectorAll(".agent-loop-harness-node");
        const promptNode = evolution.querySelector(".agent-loop-prompt-node");
        const modelCore = evolution.querySelector(".agent-loop-model");
        const baseOutput = evolution.querySelector(".agent-loop-output-node");
        const baseConnectors = evolution.querySelectorAll(".agent-loop-connector");
        const operator = evolution.querySelector(".agent-loop-operator");
        const loopTrack = evolution.querySelector(".agent-loop-cycle");
        const agents = evolution.querySelectorAll(".agent-loop-agent");
        const evaluator = evolution.querySelector(".agent-loop-evaluator");
        const failState = evolution.querySelector(".agent-loop-eval-fail");
        const passState = evolution.querySelector(".agent-loop-eval-pass");
        const controls = evolution.querySelector(".agent-loop-controls");
        const progress = evolution.querySelector(".agent-loop-progress-fill");

        gsap.set(captions.slice(1), { autoAlpha: 0, y: 26 });
        gsap.set([contextFrame, harnessFrame, contextItems, harnessItems], {
          autoAlpha: 0,
        });
        gsap.set(contextFrame, { scale: 0.62 });
        gsap.set(harnessFrame, { scale: 0.68 });
        gsap.set([loopTrack, agents, evaluator, controls], { autoAlpha: 0 });
        gsap.set(agents, { y: 18 });
        gsap.set(passState, { autoAlpha: 0 });
        gsap.set(progress, { scaleX: 0.06, transformOrigin: "left center" });

        const showCaption = (timeline, from, to, at) => {
          timeline
            .to(captions[from], {
              autoAlpha: 0,
              y: -22,
              duration: 0.18,
            }, at)
            .to(captions[to], {
              autoAlpha: 1,
              y: 0,
              duration: 0.2,
            }, at + 0.14);
        };

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: evolution,
            start: "top top+=82",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(progress, { scaleX: 0.25, duration: 0.45 }, 0)
          .to(stageMarkers[0], { color: "#c5ff3d", duration: 0.1 }, 0);

        showCaption(timeline, 0, 1, 0.48);
        timeline
          .to(stageMarkers[1], { color: "#c5ff3d", duration: 0.16 }, 0.58)
          .to(contextFrame, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.48,
          }, 0.55)
          .to(contextItems, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.3,
          }, 0.72)
          .to(baseOutput, { autoAlpha: 0.36, duration: 0.24 }, 0.7)
          .to(progress, { scaleX: 0.5, duration: 0.46 }, 0.72);

        showCaption(timeline, 1, 2, 1.28);
        timeline
          .to(stageMarkers[2], { color: "#c5ff3d", duration: 0.16 }, 1.38)
          .to(contextItems, { autoAlpha: 0.55, duration: 0.2 }, 1.36)
          .to(harnessFrame, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
          }, 1.38)
          .to(harnessItems, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.055,
            duration: 0.34,
          }, 1.58)
          .to(operator, {
            color: "#7c8783",
            borderColor: "#35403d",
            duration: 0.22,
          }, 1.55)
          .to(progress, { scaleX: 0.75, duration: 0.46 }, 1.55);

        showCaption(timeline, 2, 3, 2.12);
        timeline
          .to(stageMarkers[3], { color: "#c5ff3d", duration: 0.16 }, 2.22)
          .to([contextItems, harnessItems], { autoAlpha: 0.28, duration: 0.24 }, 2.2)
          .to([contextFrame, harnessFrame], {
            borderColor: "rgba(197, 255, 61, 0.22)",
            duration: 0.24,
          }, 2.2)
          .to([promptNode, modelCore, baseOutput, baseConnectors], {
            autoAlpha: 0.18,
            duration: 0.24,
          }, 2.2)
          .to(loopTrack, { autoAlpha: 1, scale: 1, duration: 0.38 }, 2.22)
          .to(agents, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.3,
          }, 2.38)
          .to(evaluator, { autoAlpha: 1, duration: 0.24 }, 2.52)
          .to(failState, { autoAlpha: 0, duration: 0.16 }, 2.78)
          .to(passState, { autoAlpha: 1, duration: 0.2 }, 2.82)
          .to(controls, { autoAlpha: 1, y: 0, duration: 0.34 }, 2.62)
          .to(operator, { autoAlpha: 0.22, duration: 0.22 }, 2.58)
          .to(progress, { scaleX: 1, duration: 0.46 }, 2.55);

        return undefined;
      },
    );

    return () => media.revert();
  }, []);

  return (
    <main className="agent-loop-note" ref={pageRef}>
      <header className="agent-loop-hero">
        <NavLink className="agent-loop-back-link" data-intro to="/notes">
          <ArrowLeft aria-hidden="true" size={16} />
          ALL NOTES
        </NavLink>

        <div className="agent-loop-hero-copy">
          <p className="section-label" data-intro>NOTE / {note.date}</p>
          <h1 data-intro>
            从 Prompt 到 Loop，
            <span>Agent 工程到底在工程什么？</span>
          </h1>
          <p className="agent-loop-hero-lede" data-intro>
            一次回答变成一段工作，再变成没人盯着也会继续推进的系统。
            工程师控制的东西，正在一层层移到模型外面。
          </p>
        </div>

        <div className="agent-loop-hero-footer" data-intro>
          <span>CONTROL / EXPANDING</span>
          <span>HUMAN / STEPPING OUT</span>
          <span>SCROLL TO EXPAND <ArrowDown aria-hidden="true" size={15} /></span>
        </div>
      </header>

      <section
        className="agent-loop-evolution"
        ref={evolutionRef}
        aria-labelledby="agent-loop-evolution-title"
      >
        <div className="agent-loop-evolution-stage">
          <header className="agent-loop-evolution-header">
            <span id="agent-loop-evolution-title">AGENT CONTROL SURFACE / 2020—2026</span>
            <div className="agent-loop-stage-markers" aria-hidden="true">
              {stages.map((stage) => (
                <span className="agent-loop-stage-marker" key={stage.label}>
                  {stage.number} {stage.label}
                </span>
              ))}
            </div>
          </header>

          <div className="agent-loop-evolution-layout">
            <div className="agent-loop-narrative">
              {stages.map((stage) => (
                <article className="agent-loop-stage-copy" key={stage.number}>
                  <p>{stage.number} / {stage.label}</p>
                  <h2>{stage.title}</h2>
                  <span>{stage.copy}</span>
                </article>
              ))}
            </div>

            <div className="agent-loop-system" aria-hidden="true">
              <div className="agent-loop-harness-frame agent-loop-frame">
                <span>HARNESS / RUNTIME</span>
              </div>
              <div className="agent-loop-context-frame agent-loop-frame">
                <span>CONTEXT WINDOW</span>
              </div>

              <div className="agent-loop-operator">HUMAN / DIRECTING</div>
              <div className="agent-loop-prompt-node agent-loop-node">
                <span>PROMPT</span>
                <strong>Finish the task.</strong>
              </div>
              <span className="agent-loop-connector agent-loop-connector-in" />
              <div className="agent-loop-model">
                <span>MODEL</span>
                <strong>INFERENCE</strong>
                <i />
              </div>
              <span className="agent-loop-connector agent-loop-connector-out" />
              <div className="agent-loop-output-node agent-loop-node">
                <span>OUTPUT</span>
                <strong>One response</strong>
              </div>

              <div className="agent-loop-context-nodes">
                {contextNodes.map(([label, value]) => (
                  <div className="agent-loop-context-node agent-loop-micro-node" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="agent-loop-harness-nodes">
                {harnessNodes.map(([label, value]) => (
                  <div className="agent-loop-harness-node agent-loop-micro-node" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="agent-loop-cycle">
                <span>SHARED STATE</span>
                <i />
              </div>
              <div className="agent-loop-agent agent-loop-agent-a"><span>A</span>SESSION 01</div>
              <div className="agent-loop-agent agent-loop-agent-b"><span>B</span>SESSION 02</div>
              <div className="agent-loop-agent agent-loop-agent-c"><span>C</span>NEXT</div>

              <div className="agent-loop-evaluator">
                <span>EVALUATOR</span>
                <strong className="agent-loop-eval-fail"><X size={13} weight="bold" />FAIL / RETRY</strong>
                <strong className="agent-loop-eval-pass"><Check size={13} weight="bold" />PASS / CONTINUE</strong>
              </div>

              <div className="agent-loop-controls">
                <span>HUMAN CONTROL PLANE</span>
                <div><small>GOAL</small><strong>DEFINED</strong></div>
                <div><small>BUDGET</small><strong>BOUNDED</strong></div>
                <div><small>STOP</small><strong>AVAILABLE</strong></div>
              </div>
            </div>
          </div>

          <div className="agent-loop-progress" aria-hidden="true">
            <span className="agent-loop-progress-fill" />
          </div>
        </div>
      </section>

      <MarkdownArticleLayout articleClassName="agent-loop-body" body={note.body}>
        <p className="agent-loop-body-kicker">THE CONTROL SURFACE MOVES OUTWARD</p>
      </MarkdownArticleLayout>
    </main>
  );
}
