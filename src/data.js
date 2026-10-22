import { plan, allocate } from "./finance.js";
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const names = [
  "Ahmed Khan",
  "Fatima Noor",
  "Muhammad Ali",
  "Ayesha Malik",
  "Usman Shah",
  "Zainab Hassan",
  "Bilal Ahmad",
  "Maryam Iqbal",
];
export const money = (n) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n / 100);
export const fullMoney = (n) =>
  new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n / 100);
function seedDate(i) {
  const d = new Date(today() + "T00:00:00Z");
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 5, i % 2 ? 25 : 5),
  )
    .toISOString()
    .slice(0, 10);
}
const initialSeed = () => ({
  customers: names.map((name, i) => ({
    id: `CUS-${String(i + 1).padStart(6, "0")}`,
    uuid: crypto.randomUUID(),
    name,
    father: "Sample guardian",
    cnic: `00000-000000${i}-0`,
    phone: `0300000000${i}`,
    address: "Sample address, Peshawar",
    status: "Active",
  })),
  products: [
    {
      id: "PRD-000001",
      name: "Haier Inverter AC",
      brand: "Haier",
      category: "Home appliances",
      model: "1.5 ton • DC inverter",
      price: 14500000,
      stock: 12,
      min: 5,
    },
    {
      id: "PRD-000002",
      name: "Samsung Galaxy A56",
      brand: "Samsung",
      category: "Mobile phones",
      model: "256 GB • Awesome graphite",
      price: 12000000,
      stock: 4,
      min: 5,
    },
    {
      id: "PRD-000003",
      name: "Honda CD 70",
      brand: "Honda",
      category: "Motorcycles",
      model: "2026 • Red",
      price: 15990000,
      stock: 8,
      min: 3,
    },
    {
      id: "PRD-000004",
      name: "Dawlance Refrigerator",
      brand: "Dawlance",
      category: "Home appliances",
      model: "9191 WB • Silver",
      price: 9800000,
      stock: 7,
      min: 3,
    },
  ],
  contracts: names.slice(0, 6).map((_, i) => ({
    id: `CON-${String(i + 1).padStart(6, "0")}`,
    customer: `CUS-${String(i + 1).padStart(6, "0")}`,
    product: ["Haier Inverter AC", "Samsung Galaxy A56", "Honda CD 70"][i % 3],
    cash: 10000000 + i * 1500000,
    down: 2000000,
    count: 12,
    date: today(),
    ...plan(10000000 + i * 1500000, 2000000, 12, seedDate(i)),
    status: "Active",
  })),
  payments: [],
  audit: [],
  settings: {
    name: "Qist Business",
    owner: "Business owner",
    address: "Peshawar, Pakistan",
    phone: "",
    markup: 35,
  },
});
function seed() {
  let data = initialSeed();
  data.contracts = data.contracts.map((c, i) => {
    const paidCount = i % 3 === 0 ? 6 : i % 3 === 1 ? 5 : 4;
    let balance = c.total;
    const schedule = c.schedule.map((r, j) => {
      if (j >= paidCount || r.due > today()) return r;
      const p = {
        id: `PAY-${String(data.payments.length + 1).padStart(6, "0")}`,
        key: crypto.randomUUID(),
        contract: c.id,
        customer: c.customer,
        product: c.product,
        date: r.due,
        amount: r.amount,
        method: ["Cash", "Bank Transfer", "Easypaisa"][i % 3],
        reference: "Sample collection",
        previous: balance,
        receiver: "Demo administrator",
      };
      balance -= r.amount;
      data.payments.push(p);
      return { ...r, paid: r.amount };
    });
    return { ...c, schedule };
  });
  data.payments.sort((a, b) => b.date.localeCompare(a.date));
  return data;
}
const key = "qist-demo-v1";
export function loadDemo() {
  try {
    return JSON.parse(localStorage.getItem(key)) || seed();
  } catch {
    return seed();
  }
}
export function saveDemo(data) {
  localStorage.setItem(key, JSON.stringify(data));
}
export function customerInput(data, existing) {
  const name = data.name.trim(),
    cnic = String(data.cnic || "").trim(),
    phone = data.phone.replace(/[\s-]/g, "").replace(/^\+92/, "0");
  if (!name || !data.father.trim() || !data.address.trim())
    throw new Error("Name, father’s name and address are required.");
  if (!/^03\d{9}$/.test(phone))
    throw new Error("Use a valid Pakistani mobile number.");
  return { ...data, name, cnic, phone, status: "Active" };
}
export function receive(data, input) {
  const contract = data.contracts.find((c) => c.id === input.contract);
  if (!contract) throw new Error("Select a contract.");
  if (data.payments.some((p) => p.key === input.key)) return data;
  const schedule = allocate(contract.schedule, input.amount);
  const payment = {
    ...input,
    id: `PAY-${String(data.payments.length + 1).padStart(6, "0")}`,
    date: today(),
    customer: contract.customer,
    product: contract.product,
    previous: contract.schedule.reduce((s, r) => s + r.amount - r.paid, 0),
    receiver: "Demo administrator",
  };
  return {
    ...data,
    contracts: data.contracts.map((c) =>
      c.id === contract.id
        ? {
            ...c,
            schedule,
            status: schedule.every((r) => r.paid === r.amount)
              ? "Completed"
              : "Active",
          }
        : c,
    ),
    payments: [payment, ...data.payments],
    audit: [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        action: "Payment recorded",
        entity: payment.id,
      },
      ...data.audit,
    ],
  };
}
export function gasCall(action, payload = {}) {
  return new Promise((resolve, reject) =>
    window.google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler((e) => reject(new Error(e.message)))
      .api(action, payload),
  );
}
export const isGas = () => Boolean(window.google?.script?.run);
