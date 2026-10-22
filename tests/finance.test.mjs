import test from "node:test";
import assert from "node:assert/strict";
import { plan, allocate, minor } from "../src/finance.js";
test("specified 35% example uses a one-time markup on the principal", () => {
  const p = plan(10000000, 2000000, 12, "2026-01-31");
  assert.equal(p.principal, 8000000);
  assert.equal(p.markup, 2800000);
  assert.equal(p.total, 10800000);
  assert.equal(p.overall, 12800000);
  assert.equal(p.schedule[0].amount, 900000);
});
for (const count of [6, 12, 18, 24])
  test(`schedule sums exactly for ${count} installments`, () => {
    const p = plan(10000001, 100, count, "2026-01-31");
    assert.equal(
      p.schedule.reduce((s, r) => s + r.amount, 0),
      p.total,
    );
    assert.equal(p.schedule[1].due, "2026-02-28");
    assert.equal(p.schedule[2].due, "2026-03-31");
  });
test("leap years clamp independently of prior month", () => {
  const p = plan(10000, 0, 6, "2028-01-31");
  assert.equal(p.schedule[1].due, "2028-02-29");
  assert.equal(p.schedule[2].due, "2028-03-31");
});
test("zero remaining principal produces zero receivable", () => {
  assert.equal(plan(10000, 10000, 6, "2026-01-01").total, 0);
});
test("rejects invalid financial inputs and civil dates", () => {
  for (const args of [
    [100, 101, 6, "2026-01-01"],
    [-1, 0, 6, "2026-01-01"],
    [100, 0, 7, "2026-01-01"],
    [100, 0, 6, "2026-02-30"],
    [1.5, 0, 6, "2026-01-01"],
    [Number.MAX_SAFE_INTEGER, 0, 6, "2026-01-01"],
  ])
    assert.throws(() => plan(...args));
});
test("partial and advance payments allocate oldest first without mutation", () => {
  const s = [
    { amount: 100, paid: 0 },
    { amount: 100, paid: 0 },
    { amount: 100, paid: 0 },
  ];
  const p = allocate(s, 150);
  assert.deepEqual(
    p.map((r) => r.paid),
    [100, 50, 0],
  );
  assert.deepEqual(
    s.map((r) => r.paid),
    [0, 0, 0],
  );
  assert.deepEqual(
    allocate(p, 150).map((r) => r.paid),
    [100, 100, 100],
  );
  assert.throws(() => allocate(p, 151));
  assert.throws(() => allocate(p, 0));
});
test("decimal input converts exactly to integer paisa", () => {
  assert.equal(minor("123.45"), 12345);
  assert.equal(minor("0.01"), 1);
  assert.equal(minor("100"), 10000);
  for (const v of ["-1", "1.001", "NaN", "1e6", ""])
    assert.throws(() => minor(v));
});
