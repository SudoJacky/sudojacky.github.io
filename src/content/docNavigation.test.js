import assert from "node:assert/strict";
import test from "node:test";
import { countProjectDocs, takeDocSections } from "./docNavigation.js";

const sections = [
  {
    title: "Start here",
    docs: [{ slug: "one" }, { slug: "two" }],
  },
  {
    title: "Internals",
    docs: [{ slug: "three" }, { slug: "four" }],
  },
];

test("limits a project preview across section boundaries", () => {
  const preview = takeDocSections(sections);

  assert.deepEqual(
    preview.map((section) => ({
      title: section.title,
      slugs: section.docs.map((doc) => doc.slug),
    })),
    [
      { title: "Start here", slugs: ["one", "two"] },
      { title: "Internals", slugs: ["three"] },
    ],
  );
  assert.equal(countProjectDocs({ sections }), 4);
});
