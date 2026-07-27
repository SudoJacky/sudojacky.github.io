import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import { markdownRemarkPlugins } from "./markdownConfig.js";

test("renders a GFM table as table markup", () => {
  const markdown = [
    "| 状态 | checkpoint | 处理 |",
    "| --- | --- | --- |",
    "| Running | 任意 | interrupted |",
  ].join("\n");

  const html = renderToStaticMarkup(
    createElement(ReactMarkdown, { remarkPlugins: markdownRemarkPlugins }, markdown),
  );

  assert.match(html, /<table>/);
  assert.match(html, /<th>状态<\/th>/);
  assert.match(html, /<td>interrupted<\/td>/);
});
