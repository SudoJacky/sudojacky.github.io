import { ArrowDown, ArrowLeft, Check } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import MarkdownArticleLayout from "../../components/article/MarkdownArticleLayout";
import "./AgentConversationCompactionPage.css";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    number: "01",
    label: "SAME INPUT",
    title: "先复制出两份相同的会话。",
    copy: "两边都有用户要求、Agent 回复和工具输出。接下来，它们会用完全不同的方式腾出空间。",
  },
  {
    number: "02",
    label: "FULL REPLACEMENT",
    title: "A 轨：整段换成一份摘要。",
    copy: "这段会话全部交给模型。摘要生成后，里面的用户消息、Agent 回复和工具结果都会被移除。",
  },
  {
    number: "03",
    label: "CODEX-TYPE",
    title: "B 轨：扫到用户消息就跳过。",
    copy: "扫描从最近的内容开始。Agent 回复和工具结果依次消失，用户当时输入的话继续留在上下文里。",
  },
  {
    number: "04",
    label: "TRADE-OFF",
    title: "省下多少，只说了一半。",
    copy: "A 轨更短，但用户原话也交给摘要重写。B 轨占用更多空间，换来两条没有被改写的用户消息。",
  },
];

const messages = [
  { role: "USER", text: "保持现有架构，只修改会话恢复流程。" },
  { role: "TOOL", text: "扫描完成：36 个文件，1,842 行输出。" },
  { role: "AGENT", text: "当前失败来自检查点遗漏了未解决的决策。" },
  { role: "AGENT", text: "也许需要重写整个存储层。" },
  { role: "USER", text: "不要引入新的运行时依赖。" },
  { role: "TOOL", text: "恢复测试仍未执行。" },
];

const compactSummary = [
  "目标：修复会话恢复流程",
  "根因：检查点遗漏未解决决策",
  "约束：不改架构，不增加依赖",
  "下一步：执行恢复测试",
];

const strategies = [
  {
    id: "A",
    title: "全量摘要替换",
    mechanism: "模型读完整段历史，再用一份摘要替换其中所有消息。",
    strength: "输出短，格式统一，需要释放多少空间也比较好控制。",
    risk: "用户原话只剩转述。摘要漏掉的内容，下一轮通常察觉不到。",
  },
  {
    id: "B",
    title: "Codex 型保留式清理",
    mechanism: "先生成压缩状态，再从最近向前删除非用户消息，用户消息保持原样。",
    strength: "回头检查时还能看到用户当时究竟说了什么。",
    risk: "用户可能引用已经删除的回复或日志，摘要得负责把上下文接回来。",
  },
];

const comparisonRows = [
  ["用户原话", "进入摘要后消失", "逐字保留"],
  ["占用空间", "较少，也更稳定", "取决于用户消息长度"],
  ["容易出错的地方", "摘要漏掉原始要求", "留下的话失去所指内容"],
  ["更看重什么", "压缩率", "用户原话"],
];

const recoveryStages = [
  {
    number: "01",
    label: "HANDOFF",
    title: "把检查点交给一个没看过历史的 Agent。",
    copy: "它只拿到压缩结果和当前工作区。原会话不会回来替它补充说明。",
  },
  {
    number: "02",
    label: "SUMMARY ONLY",
    title: "A 轨把一句硬约束写软了。",
    copy: "摘要里的“优先复用”听起来像建议。新 Agent 于是把重写存储层重新列为可选方案。",
  },
  {
    number: "03",
    label: "SUMMARY + USER",
    title: "B 轨还能看到用户当时的原话。",
    copy: "“保持现有架构，只修改恢复流程”仍在上下文里。这个方案刚出现就被挡了下来。",
  },
  {
    number: "04",
    label: "RECOVERY COST",
    title: "遗漏最后会变成返工。",
    copy: "两份压缩结果都很短。真正拉开差距的，是新 Agent 要走多少弯路才能回到正确位置。",
  },
];

export default function AgentConversationCompactionPage({ note }) {
  const pageRef = useRef(null);
  const labRef = useRef(null);
  const recoveryRef = useRef(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const lab = labRef.current;
    const recovery = recoveryRef.current;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const heroElements = page.querySelectorAll(".compaction-note-hero [data-intro]");
      const revealItems = new Set([
        ...page.querySelectorAll("[data-scroll-reveal]"),
        ...page.querySelectorAll(".compaction-note-body > *"),
      ]);

      gsap.from(heroElements, {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      revealItems.forEach((item) => {
        gsap.from(item, {
          autoAlpha: 0,
          y: 30,
          duration: 0.75,
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

        const captions = gsap.utils.toArray(".compaction-lab-copy", lab);
        const methodARows = lab.querySelectorAll(".compaction-method-a .compaction-message");
        const methodBRemoved = lab.querySelectorAll(".compaction-method-b .compaction-message:not(.is-user)");
        const methodBUsers = lab.querySelectorAll(".compaction-method-b .compaction-message.is-user");
        const methodASummary = lab.querySelector(".compaction-method-a .compaction-method-summary");
        const methodBSummary = lab.querySelector(".compaction-method-b .compaction-method-summary");
        const methodBScan = lab.querySelector(".compaction-method-b .compaction-scan-line");
        const methodAResult = lab.querySelector(".compaction-method-a .compaction-method-result");
        const methodBResult = lab.querySelector(".compaction-method-b .compaction-method-result");
        const methodA = lab.querySelector(".compaction-method-a");
        const methodB = lab.querySelector(".compaction-method-b");
        const progress = lab.querySelector(".compaction-lab-progress-fill");

        gsap.set(captions.slice(1), { autoAlpha: 0, y: 24 });
        gsap.set([methodASummary, methodBSummary], {
          autoAlpha: 0,
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          borderWidth: 0,
        });
        gsap.set([methodAResult, methodBResult], { autoAlpha: 0, y: 12 });
        gsap.set(methodBScan, { autoAlpha: 0, bottom: "4%" });
        gsap.set(progress, { scaleX: 0.08, transformOrigin: "left center" });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: lab,
            start: "top top+=82",
            end: "bottom bottom",
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(progress, { scaleX: 0.33, duration: 0.55 }, 0)
          .to(captions[0], { autoAlpha: 0, y: -20, duration: 0.2 }, 0.35)
          .to(captions[1], { autoAlpha: 1, y: 0, duration: 0.2 }, 0.5)
          .to(methodB, { autoAlpha: 0.24, duration: 0.25 }, 0.45)
          .to(methodARows, {
            autoAlpha: 0,
            height: 0,
            minHeight: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            borderWidth: 0,
            stagger: 0.055,
            duration: 0.45,
          }, 0.45)
          .to(methodASummary, {
            autoAlpha: 1,
            height: "auto",
            marginBottom: 10,
            paddingTop: 14,
            paddingBottom: 14,
            borderWidth: 1,
            duration: 0.38,
          }, 0.72)
          .to(progress, { scaleX: 0.6, duration: 0.45 }, 0.82)
          .to(captions[1], { autoAlpha: 0, y: -20, duration: 0.2 }, 1.05)
          .to(captions[2], { autoAlpha: 1, y: 0, duration: 0.2 }, 1.2)
          .to(methodA, { autoAlpha: 0.42, duration: 0.25 }, 1.15)
          .to(methodB, { autoAlpha: 1, duration: 0.25 }, 1.15)
          .to(methodBScan, { autoAlpha: 1, bottom: "88%", duration: 0.75 }, 1.18)
          .to(methodBRemoved, {
            autoAlpha: 0,
            height: 0,
            minHeight: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            borderWidth: 0,
            stagger: { each: 0.1, from: "end" },
            duration: 0.5,
          }, 1.22)
          .to(methodBUsers, {
            borderColor: "rgba(197, 255, 61, 0.62)",
            backgroundColor: "rgba(197, 255, 61, 0.08)",
            stagger: 0.08,
            duration: 0.3,
          }, 1.4)
          .to(methodBSummary, {
            autoAlpha: 1,
            height: "auto",
            marginBottom: 10,
            paddingTop: 14,
            paddingBottom: 14,
            borderWidth: 1,
            duration: 0.38,
          }, 1.48)
          .to(methodBScan, { autoAlpha: 0, duration: 0.15 }, 1.7)
          .to(progress, { scaleX: 0.86, duration: 0.45 }, 1.55)
          .to(captions[2], { autoAlpha: 0, y: -20, duration: 0.2 }, 1.85)
          .to(captions[3], { autoAlpha: 1, y: 0, duration: 0.2 }, 2)
          .to([methodA, methodB], { autoAlpha: 1, duration: 0.28 }, 2)
          .to([methodAResult, methodBResult], {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.35,
          }, 2.05)
          .to(progress, { scaleX: 1, duration: 0.4 }, 2.15);

        const recoveryCaptions = gsap.utils.toArray(".compaction-recovery-copy", recovery);
        const pathA = recovery.querySelector(".is-path-a");
        const pathB = recovery.querySelector(".is-path-b");
        const pathAItems = pathA.querySelectorAll("[data-recovery-item]");
        const pathBItems = pathB.querySelectorAll("[data-recovery-item]");
        const recoveryScore = recovery.querySelector(".compaction-recovery-score");
        const recoveryProgress = recovery.querySelector(".compaction-recovery-progress-fill");

        gsap.set(recoveryCaptions.slice(1), { autoAlpha: 0, y: 24 });
        gsap.set([...pathAItems, ...pathBItems], { autoAlpha: 0, y: 14 });
        gsap.set(recoveryScore, { autoAlpha: 0, y: 16 });
        gsap.set(recoveryProgress, { scaleX: 0.08, transformOrigin: "left center" });

        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: recovery,
            start: "top top+=82",
            end: "bottom bottom",
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        })
          .to(recoveryProgress, { scaleX: 0.3, duration: 0.4 }, 0)
          .to(recoveryCaptions[0], { autoAlpha: 0, y: -20, duration: 0.18 }, 0.3)
          .to(recoveryCaptions[1], { autoAlpha: 1, y: 0, duration: 0.18 }, 0.44)
          .to(pathB, { autoAlpha: 0.24, duration: 0.22 }, 0.38)
          .to(pathAItems, { autoAlpha: 1, y: 0, stagger: 0.11, duration: 0.34 }, 0.48)
          .to(recoveryProgress, { scaleX: 0.56, duration: 0.4 }, 0.72)
          .to(recoveryCaptions[1], { autoAlpha: 0, y: -20, duration: 0.18 }, 1)
          .to(recoveryCaptions[2], { autoAlpha: 1, y: 0, duration: 0.18 }, 1.14)
          .to(pathA, { autoAlpha: 0.42, duration: 0.22 }, 1.08)
          .to(pathB, { autoAlpha: 1, duration: 0.22 }, 1.08)
          .to(pathBItems, { autoAlpha: 1, y: 0, stagger: 0.11, duration: 0.34 }, 1.18)
          .to(recoveryProgress, { scaleX: 0.82, duration: 0.4 }, 1.42)
          .to(recoveryCaptions[2], { autoAlpha: 0, y: -20, duration: 0.18 }, 1.72)
          .to(recoveryCaptions[3], { autoAlpha: 1, y: 0, duration: 0.18 }, 1.86)
          .to([pathA, pathB], { autoAlpha: 1, duration: 0.25 }, 1.82)
          .to(recoveryScore, { autoAlpha: 1, y: 0, duration: 0.35 }, 1.94)
          .to(recoveryProgress, { scaleX: 1, duration: 0.35 }, 2.02);

        return undefined;
      },
    );

    return () => media.revert();
  }, []);

  return (
    <main className="compaction-note" ref={pageRef}>
      <header className="compaction-note-hero">
        <NavLink className="compaction-back-link" data-intro to="/notes">
          <ArrowLeft aria-hidden="true" size={16} />
          ALL NOTES
        </NavLink>
        <div className="compaction-hero-copy">
          <p className="section-label" data-intro>NOTE / {note.date}</p>
          <h1 data-intro>
            会话压缩之后，
            <span>Agent 还记得什么？</span>
          </h1>
          <p className="compaction-hero-lede" data-intro>
            上下文装不下了，Agent 得丢掉一部分历史。难点在于：
            丢完以后，它还能不能把事情接着做下去。
          </p>
        </div>
        <div className="compaction-hero-footer" data-intro>
          <span>CONTEXT / FINITE</span>
          <span>STATE / CONTINUOUS</span>
          <span>SCROLL TO COMPACT <ArrowDown aria-hidden="true" size={15} /></span>
        </div>
      </header>

      <section
        className="compaction-lab"
        ref={labRef}
        aria-labelledby="compaction-lab-title"
      >
        <div className="compaction-lab-stage">
          <header className="compaction-lab-header">
            <span id="compaction-lab-title">COMPACTION LAB / SESSION 018</span>
            <span><i />CONTEXT 94% USED</span>
          </header>

          <div className="compaction-lab-layout">
            <div className="compaction-lab-narrative">
              {stages.map((stage) => (
                <article className="compaction-lab-copy" key={stage.number}>
                  <p>{stage.number} / {stage.label}</p>
                  <h2>{stage.title}</h2>
                  <span>{stage.copy}</span>
                </article>
              ))}
            </div>

            <div className="compaction-machine" aria-hidden="true">
              {[
                ["A", "FULL REPLACEMENT", "compaction-method-a"],
                ["B", "CODEX-TYPE", "compaction-method-b"],
              ].map(([id, label, className]) => (
                <section className={`compaction-method ${className}`} key={id}>
                  <header>
                    <span><i>{id}</i>{label}</span>
                    <span>SAME INPUT</span>
                  </header>

                  <div className="compaction-method-body">
                    <div className="compaction-method-summary">
                      <span>OUTPUT / {id === "A" ? "SUMMARY ONLY" : "SUMMARY + USER"}</span>
                      {compactSummary.map((line) => <p key={line}>{line}</p>)}
                    </div>

                    <div className="compaction-message-list">
                      {messages.map((message, index) => (
                        <div
                          className={`compaction-message ${message.role === "USER" ? "is-user" : ""}`}
                          key={`${id}-${message.role}-${index}`}
                        >
                          <span>{message.role}</span>
                          <p>{message.text}</p>
                          {message.role === "USER" && className === "compaction-method-b" && (
                            <Check size={12} weight="bold" />
                          )}
                        </div>
                      ))}
                    </div>

                    {className === "compaction-method-b" && <span className="compaction-scan-line" />}
                  </div>

                  <div className="compaction-method-result">
                    <span>ORIGINAL USER MESSAGES</span>
                    <strong>{id === "A" ? "0 / 2" : "2 / 2"}</strong>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="compaction-lab-progress" aria-hidden="true">
            <span className="compaction-lab-progress-fill" />
          </div>
        </div>
      </section>

      <section className="compaction-signal-section">
        <header data-scroll-reveal>
          <p className="section-label">TWO LOSS FUNCTIONS</p>
          <h2>这两种做法，各自容易丢什么？</h2>
          <p>
            全量替换把整段历史交给摘要。保留式清理给用户原话留了位置，
            但也可能把原话所指向的回复删掉。麻烦只是落在了不同地方。
          </p>
        </header>

        <ol className="compaction-signal-grid compaction-strategy-grid">
          {strategies.map((strategy) => (
            <li data-scroll-reveal key={strategy.id}>
              <span>{strategy.id}</span>
              <h3>{strategy.title}</h3>
              <dl>
                <div><dt>机制</dt><dd>{strategy.mechanism}</dd></div>
                <div><dt>优势</dt><dd>{strategy.strength}</dd></div>
                <div><dt>风险</dt><dd>{strategy.risk}</dd></div>
              </dl>
            </li>
          ))}
        </ol>

        <p className="compaction-method-note" data-scroll-reveal>
          Codex 的公开文档只说明 <code>/compact</code> 会总结可见会话，没有解释上述
          逆序删除规则。这里的“Codex 型”指本文采用的演示模型，不代表已公开的内部实现。
        </p>

        <div className="compaction-contract" data-scroll-reveal>
          <div>
            <p>TRADE-OFF MATRIX</p>
            <strong>删完以后，还能找回什么？</strong>
          </div>
          <div className="compaction-comparison-table">
            <div className="is-heading"><span>维度</span><span>全量替换</span><span>Codex 型</span></div>
            {comparisonRows.map(([dimension, methodA, methodB]) => (
              <div key={dimension}><span>{dimension}</span><span>{methodA}</span><span>{methodB}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="compaction-recovery"
        ref={recoveryRef}
        aria-labelledby="compaction-recovery-title"
      >
        <div className="compaction-recovery-stage">
          <header className="compaction-recovery-header">
            <span id="compaction-recovery-title">BLIND RECOVERY TEST / NEW AGENT</span>
            <span><i />NO ORIGINAL TRANSCRIPT</span>
          </header>

          <div className="compaction-recovery-layout">
            <div className="compaction-recovery-narrative">
              {recoveryStages.map((stage) => (
                <article className="compaction-recovery-copy" key={stage.number}>
                  <p>{stage.number} / {stage.label}</p>
                  <h2>{stage.title}</h2>
                  <span>{stage.copy}</span>
                </article>
              ))}
            </div>

            <div className="compaction-recovery-console" aria-hidden="true">
              <header>
                <span>CHECKPOINT LOADED</span>
                <span>RECOVERY RUN 01</span>
              </header>

              <div className="compaction-recovery-paths">
                <article className="compaction-recovery-path is-path-a">
                  <header><span>A</span>SUMMARY ONLY</header>
                  <div data-recovery-item>
                    <small>RECEIVED CONSTRAINT</small>
                    <p>优先复用现有架构</p>
                  </div>
                  <div className="compaction-recovery-action" data-recovery-item>
                    <small>AGENT ACTION</small>
                    <strong>评估重写存储层</strong>
                  </div>
                  <footer className="is-failed" data-recovery-item>
                    CONSTRAINT DRIFT / REWORK REQUIRED
                  </footer>
                </article>

                <article className="compaction-recovery-path is-path-b">
                  <header><span>B</span>SUMMARY + USER</header>
                  <div data-recovery-item>
                    <small>ORIGINAL USER MESSAGE</small>
                    <p>保持现有架构，只修改会话恢复流程。</p>
                  </div>
                  <div className="compaction-recovery-action" data-recovery-item>
                    <small>AGENT ACTION</small>
                    <strong>局部修复检查点生成</strong>
                  </div>
                  <footer className="is-passed" data-recovery-item>
                    CONSTRAINT HELD / CONTINUE
                  </footer>
                </article>
              </div>

              <div className="compaction-recovery-score">
                <span>RESUME FROM CORRECT STATE</span>
                <strong><i>A / RETRY</i><i>B / CONTINUE</i></strong>
              </div>
            </div>
          </div>

          <div className="compaction-recovery-progress" aria-hidden="true">
            <span className="compaction-recovery-progress-fill" />
          </div>
        </div>
      </section>

      <MarkdownArticleLayout articleClassName="compaction-note-body" body={note.body}>
        <p className="compaction-body-kicker" data-scroll-reveal>DESIGNING THE LOSS</p>
      </MarkdownArticleLayout>
    </main>
  );
}
