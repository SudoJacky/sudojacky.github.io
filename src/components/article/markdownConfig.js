import remarkGfm from "remark-gfm";

export const markdownRemarkPlugins = [remarkGfm];

export function isMermaidCodeClassName(className = "") {
  if (typeof className !== "string") return false;
  return className.split(/\s+/).includes("language-mermaid");
}
