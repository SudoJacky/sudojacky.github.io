import { ArrowDown, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import MarkdownArticleLayout from "../../components/article/MarkdownArticleLayout";
import "./FromAgentLineToTaskGraphPage.css";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    number: "01",
    label: "QUEUE",
    title: "一句“然后”，先排出一条长队。",
    copy: "安全、性能和测试依次等待。图上每条边都像依赖，实际上只是指令的书写顺序。",
  },
  {
    number: "02",
    label: "INSPECT EDGES",
    title: "先问：下一步真的读取了什么？",
    copy: "安全审查不读取性能结论，性能审查也不读取测试结果。两条箭头没有数据依据，可以删除。",
  },
  {
    number: "03",
    label: "FAN OUT",
    title: "共享输入，不等于相互依赖。",
    copy: "三项检查同时读取同一份变更与约束，各自输出结构化发现。长队在这里展开成三条独立路径。",
  },
  {
    number: "04",
    label: "REDUCE + VERIFY",
    title: "并行结果要在正确的位置收回来。",
    copy: "普通代码先去重和过滤，再由验证节点尝试推翻剩余发现。屏障只留在真正需要完整集合的地方。",
  },
  {
    number: "05",
    label: "SYNTHESIZE",
    title: "最终报告保留结论，也保留来路。",
    copy: "三个经复核的发现进入报告；被丢弃的结果、失败节点和路由选择仍留在 trace 里。",
  },
];

const nodes = [
  {
    id: "source",
    eyebrow: "INPUT",
    title: "READ CHANGE",
    detail: "diff + constraints",
  },
  {
    id: "security",
    eyebrow: "AGENT / 01",
    title: "SECURITY",
    detail: "2 findings",
  },
  {
    id: "performance",
    eyebrow: "AGENT / 02",
    title: "PERFORMANCE",
    detail: "1 finding",
  },
  {
    id: "tests",
    eyebrow: "AGENT / 03",
    title: "TEST IMPACT",
    detail: "4 findings",
  },
  {
    id: "reduce",
    eyebrow: "CODE",
    title: "REDUCE",
    detail: "7 → 5",
  },
  {
    id: "verify",
    eyebrow: "AGENT / 04",
    title: "VERIFY",
    detail: "5 → 3",
  },
  {
    id: "report",
    eyebrow: "OUTPUT",
    title: "REPORT",
    detail: "3 verified",
  },
];

const desktopGraphPaths = [
  "M10 50 C20 50 22 22 34 22",
  "M10 50 H34",
  "M10 50 C20 50 22 78 34 78",
  "M34 22 C46 22 47 50 58 50",
  "M34 50 H58",
  "M34 78 C46 78 47 50 58 50",
  "M58 50 H76",
  "M76 50 H92",
];

const mobileGraphPaths = [
  "M50 8 C50 18 18 18 18 31",
  "M50 8 V31",
  "M50 8 C50 18 82 18 82 31",
  "M18 31 C18 44 50 43 50 55",
  "M50 31 V55",
  "M82 31 C82 44 50 43 50 55",
  "M50 55 V74",
  "M50 74 V92",
];

function EdgeLayer({ className, paths }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {paths.map((path, index) => (
        <path d={path} key={path} pathLength="1" data-edge-index={index} />
      ))}
    </svg>
  );
}

export default function FromAgentLineToTaskGraphPage({ note }) {
  const pageRef = useRef(null);
  const graphRef = useRef(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const graph = graphRef.current;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(page.querySelectorAll(".task-graph-hero [data-intro]"), {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      page.querySelectorAll(".task-graph-body > *").forEach((item) => {
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
        desktop: "(min-width: 901px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      ({ conditions }) => {
        if (!conditions.desktop || !conditions.motion) return undefined;

        const captions = gsap.utils.toArray(".task-graph-stage-copy", graph);
        const stageMarkers = gsap.utils.toArray(".task-graph-stage-marker", graph);
        const graphNodes = Object.fromEntries(
          nodes.map(({ id }) => [
            id,
            graph.querySelector(`[data-node="${id}"]`),
          ]),
        );
        const branchNodes = [
          graphNodes.security,
          graphNodes.performance,
          graphNodes.tests,
        ];
        const linearEdges = graph.querySelectorAll(".task-graph-linear-edges path");
        const falseEdges = [linearEdges[1], linearEdges[2]];
        const networkEdges = graph.querySelectorAll(".task-graph-network-edges--desktop path");
        const auditFlags = graph.querySelectorAll(".task-graph-audit-flag");
        const nodeResults = graph.querySelectorAll(".task-graph-node-result");
        const mergeStatus = graph.querySelector(".task-graph-merge-status");
        const trace = graph.querySelector(".task-graph-trace");
        const progress = graph.querySelector(".task-graph-progress-fill");
        const activeCount = graph.querySelector("[data-metric='active']");
        const edgeCount = graph.querySelector("[data-metric='edges']");
        const waitCount = graph.querySelector("[data-metric='waits']");
        const activeCountFrom = activeCount.querySelector(".task-graph-metric-from");
        const activeCountTo = activeCount.querySelector(".task-graph-metric-to");
        const edgeCountFrom = edgeCount.querySelector(".task-graph-metric-from");
        const edgeCountTo = edgeCount.querySelector(".task-graph-metric-to");
        const waitCountFrom = waitCount.querySelector(".task-graph-metric-from");
        const waitCountTo = waitCount.querySelector(".task-graph-metric-to");

        gsap.set(captions.slice(1), { autoAlpha: 0, y: 24 });
        gsap.set([graphNodes.reduce, graphNodes.verify], {
          autoAlpha: 0,
          scale: 0.76,
        });
        gsap.set(networkEdges, {
          autoAlpha: 0,
          strokeDasharray: 1,
          strokeDashoffset: 1,
        });
        gsap.set([auditFlags, nodeResults, mergeStatus, trace], {
          autoAlpha: 0,
          y: 10,
        });
        gsap.set(progress, {
          scaleX: 0.08,
          transformOrigin: "left center",
        });

        const showCaption = (timeline, from, to, at) => {
          timeline
            .to(captions[from], {
              autoAlpha: 0,
              y: -20,
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
            trigger: graph,
            start: "top top+=82",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(progress, { scaleX: 0.2, duration: 0.45 }, 0)
          .to(stageMarkers[0], { color: "#c5ff3d", duration: 0.1 }, 0);

        showCaption(timeline, 0, 1, 0.58);
        timeline
          .to(stageMarkers[1], { color: "#c5ff3d", duration: 0.15 }, 0.68)
          .to(branchNodes, {
            borderColor: "rgba(197, 255, 61, 0.62)",
            stagger: 0.06,
            duration: 0.28,
          }, 0.68)
          .to(falseEdges, {
            stroke: "#f19c92",
            strokeDasharray: "0.06 0.05",
            duration: 0.28,
          }, 0.72)
          .to(auditFlags, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.24,
          }, 0.82)
          .to(waitCount, { color: "#f19c92", duration: 0.2 }, 0.85)
          .to(progress, { scaleX: 0.4, duration: 0.42 }, 0.88);

        showCaption(timeline, 1, 2, 1.36);
        timeline
          .to(stageMarkers[2], { color: "#c5ff3d", duration: 0.15 }, 1.46)
          .to(auditFlags, { autoAlpha: 0, y: -8, duration: 0.2 }, 1.43)
          .to(linearEdges, { autoAlpha: 0, duration: 0.28 }, 1.46)
          .to(graphNodes.security, {
            left: "34%",
            top: "22%",
            duration: 0.58,
            ease: "power2.inOut",
          }, 1.48)
          .to(graphNodes.performance, {
            left: "34%",
            top: "50%",
            duration: 0.58,
            ease: "power2.inOut",
          }, 1.48)
          .to(graphNodes.tests, {
            left: "34%",
            top: "78%",
            duration: 0.58,
            ease: "power2.inOut",
          }, 1.48)
          .to(graphNodes.report, {
            left: "92%",
            duration: 0.58,
            ease: "power2.inOut",
          }, 1.48)
          .to([graphNodes.reduce, graphNodes.verify], {
            autoAlpha: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.34,
          }, 1.72)
          .to(networkEdges, {
            autoAlpha: 1,
            strokeDashoffset: 0,
            stagger: 0.055,
            duration: 0.42,
          }, 1.64)
          .to(activeCount, { color: "#c5ff3d", duration: 0.2 }, 1.76)
          .to(waitCount, { color: "#c5ff3d", duration: 0.2 }, 1.76)
          .to(activeCountFrom, { autoAlpha: 0, duration: 0.14 }, 1.74)
          .to(activeCountTo, { autoAlpha: 1, duration: 0.14 }, 1.82)
          .to(waitCountFrom, { autoAlpha: 0, duration: 0.14 }, 1.74)
          .to(waitCountTo, { autoAlpha: 1, duration: 0.14 }, 1.82)
          .to(progress, { scaleX: 0.6, duration: 0.42 }, 1.9);

        showCaption(timeline, 2, 3, 2.3);
        timeline
          .to(stageMarkers[3], { color: "#c5ff3d", duration: 0.15 }, 2.4)
          .to(nodeResults, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.07,
            duration: 0.28,
          }, 2.42)
          .to(graphNodes.reduce, {
            borderColor: "#c5ff3d",
            backgroundColor: "rgba(197, 255, 61, 0.08)",
            duration: 0.28,
          }, 2.62)
          .to(graphNodes.verify, {
            borderColor: "#c5ff3d",
            backgroundColor: "rgba(197, 255, 61, 0.08)",
            duration: 0.28,
          }, 2.78)
          .to(mergeStatus, { autoAlpha: 1, y: 0, duration: 0.3 }, 2.68)
          .to(edgeCount, { color: "#c5ff3d", duration: 0.2 }, 2.72)
          .to(edgeCountFrom, { autoAlpha: 0, duration: 0.14 }, 2.7)
          .to(edgeCountTo, { autoAlpha: 1, duration: 0.14 }, 2.78)
          .to(progress, { scaleX: 0.8, duration: 0.42 }, 2.86);

        showCaption(timeline, 3, 4, 3.18);
        timeline
          .to(stageMarkers[4], { color: "#c5ff3d", duration: 0.15 }, 3.28)
          .to([...branchNodes, graphNodes.reduce, graphNodes.verify], {
            autoAlpha: 0.48,
            duration: 0.3,
          }, 3.3)
          .to(graphNodes.report, {
            width: 132,
            minHeight: 86,
            left: "90%",
            borderColor: "#c5ff3d",
            backgroundColor: "rgba(197, 255, 61, 0.12)",
            duration: 0.38,
            ease: "power2.out",
          }, 3.34)
          .to(trace, { autoAlpha: 1, y: 0, duration: 0.32 }, 3.5)
          .to(progress, { scaleX: 1, duration: 0.44 }, 3.52);

        return undefined;
      },
    );

    return () => media.revert();
  }, []);

  return (
    <main className="task-graph-note" ref={pageRef}>
      <header className="task-graph-hero">
        <NavLink className="task-graph-back-link" data-intro to="/notes">
          <ArrowLeft aria-hidden="true" size={16} />
          ALL NOTES
        </NavLink>

        <div className="task-graph-hero-copy">
          <p className="section-label" data-intro>NOTE / {note.date}</p>
          <h1 data-intro>
            当 Agent 不再排队，
            <span>从线性流程到任务图</span>
          </h1>
          <p className="task-graph-hero-lede" data-intro>
            不先增加 Agent，先删除没有数据依据的等待。
            一条被语言写窄的流程，会在滚动中重新展开成真实依赖。
          </p>
        </div>

        <div className="task-graph-hero-footer" data-intro>
          <span>QUEUE / 05 NODES</span>
          <span>DEPENDENCIES / UNVERIFIED</span>
          <span>SCROLL TO REWIRE <ArrowDown aria-hidden="true" size={15} /></span>
        </div>
      </header>

      <section
        aria-labelledby="task-graph-stage-title"
        className="task-graph-experiment"
        ref={graphRef}
      >
        <div className="task-graph-experiment-stage">
          <header className="task-graph-experiment-header">
            <span id="task-graph-stage-title">TASK GRAPH / DEPENDENCY INSPECTOR</span>
            <div className="task-graph-stage-markers" aria-hidden="true">
              {stages.map((stage) => (
                <span className="task-graph-stage-marker" key={stage.label}>
                  {stage.number} {stage.label}
                </span>
              ))}
            </div>
          </header>

          <div className="task-graph-experiment-layout">
            <div className="task-graph-narrative">
              {stages.map((stage) => (
                <article className="task-graph-stage-copy" key={stage.number}>
                  <p>{stage.number} / {stage.label}</p>
                  <h2>{stage.title}</h2>
                  <span>{stage.copy}</span>
                </article>
              ))}
            </div>

            <div className="task-graph-workbench" aria-hidden="true">
              <div className="task-graph-workbench-bar">
                <span>RUN / REVIEW-042</span>
                <div>
                  <span><i /> LIVE</span>
                  <span data-metric="active">
                    ACTIVE / <b className="task-graph-metric-from">1</b><b className="task-graph-metric-to">3</b>
                  </span>
                  <span data-metric="edges">
                    EDGES / <b className="task-graph-metric-from">4</b><b className="task-graph-metric-to">8</b>
                  </span>
                  <span data-metric="waits">
                    FALSE WAITS / <b className="task-graph-metric-from">2</b><b className="task-graph-metric-to">0</b>
                  </span>
                </div>
              </div>

              <div className="task-graph-canvas">
                <EdgeLayer
                  className="task-graph-linear-edges"
                  paths={[
                    "M10 50 H28",
                    "M28 50 H46",
                    "M46 50 H64",
                    "M64 50 H88",
                  ]}
                />
                <EdgeLayer
                  className="task-graph-network-edges task-graph-network-edges--desktop"
                  paths={desktopGraphPaths}
                />
                <EdgeLayer
                  className="task-graph-network-edges task-graph-network-edges--mobile"
                  paths={mobileGraphPaths}
                />

                <span className="task-graph-audit-flag task-graph-audit-flag-a">
                  × NO DATA READ
                </span>
                <span className="task-graph-audit-flag task-graph-audit-flag-b">
                  × NO DATA READ
                </span>

                {nodes.map((node) => (
                  <div className="task-graph-node" data-node={node.id} key={node.id}>
                    <span>{node.eyebrow}</span>
                    <strong>{node.title}</strong>
                    <small className="task-graph-node-result">{node.detail}</small>
                  </div>
                ))}

                <div className="task-graph-merge-status">
                  <span>FINDINGS / 07</span>
                  <i />
                  <span>DEDUPED / 05</span>
                  <i />
                  <span>VERIFIED / 03</span>
                </div>

                <div className="task-graph-trace">
                  <CheckCircle aria-hidden="true" size={14} weight="fill" />
                  <span>TRACE COMPLETE</span>
                  <small>7 nodes · 8 edges · 2 discarded · 0 silent failures</small>
                </div>
              </div>
            </div>
          </div>

          <div className="task-graph-progress" aria-hidden="true">
            <span className="task-graph-progress-fill" />
          </div>
        </div>
      </section>

      <MarkdownArticleLayout articleClassName="task-graph-body" body={note.body}>
        <p className="task-graph-body-kicker">DELETE FALSE WAITS BEFORE ADDING AGENTS</p>
      </MarkdownArticleLayout>
    </main>
  );
}
