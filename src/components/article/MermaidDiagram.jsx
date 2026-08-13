import { useEffect, useId, useState } from "react";
import "./MermaidDiagram.css";

let mermaidModulePromise;
let renderSequence = 0;

function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        suppressErrorRendering: true,
        theme: "base",
        themeVariables: {
          background: "#0a0f10",
          primaryColor: "#141b1c",
          primaryTextColor: "#f0f1ea",
          primaryBorderColor: "#c5ff3d",
          secondaryColor: "#101718",
          secondaryTextColor: "#f0f1ea",
          secondaryBorderColor: "#718078",
          tertiaryColor: "#0a0f10",
          tertiaryTextColor: "#f0f1ea",
          tertiaryBorderColor: "#58635f",
          lineColor: "#8b9892",
          textColor: "#f0f1ea",
          mainBkg: "#141b1c",
          nodeBorder: "#c5ff3d",
          clusterBkg: "#101718",
          clusterBorder: "#58635f",
          edgeLabelBackground: "#0a0f10",
          fontFamily: '"IBM Plex Sans", Arial, sans-serif',
        },
        flowchart: {
          htmlLabels: false,
          useMaxWidth: true,
        },
      });
      return mermaid;
    });
  }

  return mermaidModulePromise;
}

function errorMessage(error) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "无法解析这段 Mermaid 语法。";
}

export default function MermaidDiagram({ source }) {
  const reactId = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const [rendered, setRendered] = useState({ status: "loading" });

  useEffect(() => {
    let active = true;
    const diagramId = `mermaid-${reactId}-${renderSequence += 1}`;

    setRendered({ status: "loading" });
    loadMermaid()
      .then((mermaid) => mermaid.render(diagramId, source))
      .then(({ svg }) => {
        if (active) setRendered({ status: "ready", svg });
      })
      .catch((error) => {
        if (active) setRendered({ status: "error", message: errorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, [reactId, source]);

  if (rendered.status === "error") {
    return (
      <figure className="mermaid-diagram mermaid-diagram--error">
        <figcaption>流程图渲染失败：{rendered.message}</figcaption>
        <pre><code className="language-mermaid">{source}</code></pre>
      </figure>
    );
  }

  return (
    <figure className="mermaid-diagram">
      {rendered.status === "ready" ? (
        <div
          aria-label="流程图"
          className="mermaid-diagram__canvas"
          dangerouslySetInnerHTML={{ __html: rendered.svg }}
          role="img"
        />
      ) : (
        <div aria-live="polite" className="mermaid-diagram__loading">
          正在绘制流程图…
        </div>
      )}
    </figure>
  );
}
