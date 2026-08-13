import { Children, isValidElement } from "react";
import MermaidDiagram from "./MermaidDiagram";
import { isMermaidCodeClassName } from "./markdownConfig";

function codeBlockSource(children) {
  return Children.toArray(children)
    .map((child) => typeof child === "string" || typeof child === "number" ? String(child) : "")
    .join("")
    .replace(/\n$/, "");
}

export default function MarkdownPre({ children, node, ...props }) {
  const child = Children.count(children) === 1 ? Children.only(children) : null;

  if (isValidElement(child) && isMermaidCodeClassName(child.props.className)) {
    return <MermaidDiagram source={codeBlockSource(child.props.children)} />;
  }

  return <pre {...props}>{children}</pre>;
}
