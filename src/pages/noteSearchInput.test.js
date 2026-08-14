import assert from "node:assert/strict";
import test from "node:test";
import { getSearchChangeCommit } from "./noteSearchInput.js";

test("does not commit intermediate IME composition text", () => {
  assert.equal(getSearchChangeCommit("nni", true, null), null);
});

test("does not commit the browser input event repeated after compositionend", () => {
  assert.equal(getSearchChangeCommit("你", false, "你"), null);
});

test("commits regular keyboard input", () => {
  assert.equal(getSearchChangeCommit("agent", false, null), "agent");
});
