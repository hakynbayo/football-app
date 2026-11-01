import test from "node:test";
import assert from "node:assert/strict";

import { computeLeaderboardFromGoalRows } from "../lib/leaderboard";

test("leaderboard ignores placeholder scorer/assist values and counts real player contributions", () => {
  const leaderboard = computeLeaderboardFromGoalRows([
    { scorer: "Alice", assist: "Bob" },
    { scorer: "Alice", assist: "none" },
    { scorer: "none", assist: "Bob" },
    { scorer: "Carol", assist: "Alice" },
    { scorer: "Bob", assist: "Alice" },
    { scorer: "  ", assist: "   " },
  ]);

  const alice = leaderboard.find((entry) => entry.player === "Alice");
  const bob = leaderboard.find((entry) => entry.player === "Bob");
  const carol = leaderboard.find((entry) => entry.player === "Carol");

  assert.ok(alice);
  assert.ok(bob);
  assert.ok(carol);

  assert.equal(alice?.goals, 2);
  assert.equal(alice?.assists, 2);
  assert.equal(bob?.goals, 1);
  assert.equal(bob?.assists, 2);
  assert.equal(carol?.goals, 1);
  assert.equal(carol?.assists, 0);
  assert.equal(leaderboard.some((entry) => entry.player === "none"), false);
});
