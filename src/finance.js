export function plan(cash, down, count, firstDate, bps = 3500) {
  if (
    ![cash, down, count, bps].every(Number.isSafeInteger) ||
    cash < 0 ||
    down < 0 ||
    down > cash ||
    ![6, 12, 18, 24].includes(count) ||
    bps < 0 ||
    bps > 10000
  )
    throw new Error("Enter a valid price, down payment and installment term.");
  const principal = cash - down;
  if (!Number.isSafeInteger(principal * bps + 5000))
    throw new Error("Amount exceeds the supported limit.");
  const markup = Math.floor((principal * bps + 5000) / 10000),
    total = principal + markup;
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(down + total))
    throw new Error("Amount exceeds the supported limit.");
  const date = new Date(firstDate + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(firstDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== firstDate
  )
    throw new Error("Choose a valid first due date.");
  const base = Math.floor(total / count);
  const schedule = Array.from({ length: count }, (_, i) => {
    const d = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + i, 1),
    );
    d.setUTCDate(
      Math.min(
        date.getUTCDate(),
        new Date(
          Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
        ).getUTCDate(),
      ),
    );
    return {
      number: i + 1,
      due: d.toISOString().slice(0, 10),
      amount: i === count - 1 ? total - base * (count - 1) : base,
      paid: 0,
    };
  });
  return { principal, markup, total, overall: down + total, schedule };
}
export function allocate(schedule, amount) {
  const outstanding = schedule.reduce((s, r) => s + r.amount - r.paid, 0);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > outstanding)
    throw new Error(
      "Payment must be positive and cannot exceed the outstanding balance.",
    );
  let remaining = amount;
  return schedule.map((r) => {
    const applied = Math.min(remaining, r.amount - r.paid);
    remaining -= applied;
    return { ...r, paid: r.paid + applied };
  });
}
export function minor(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value)))
    throw new Error("Use a positive amount with up to two decimal places.");
  const [whole, fraction = ""] = String(value).split(".");
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(n)) throw new Error("Amount is too large.");
  return n;
}
