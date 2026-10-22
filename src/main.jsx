import React, { useState, useEffect, useRef, useId } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ArrowRight,
  Menu,
  X,
  Download,
  Check,
  ShieldCheck,
  Clock,
  TriangleAlert,
  ArrowLeft,
  Printer,
  SlidersHorizontal,
  Landmark,
  Box,
  CalendarDays,
  History,
  Folder,
  Database,
  Plug,
  ScrollText,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import {
  loadDemo,
  saveDemo,
  money,
  fullMoney,
  customerInput,
  receive,
  today,
  isGas,
  gasCall,
} from "./data";
import { plan, minor } from "./finance";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./styles.css";
const navGroups = [
  [
    "WORKSPACE",
    [
      ["Dashboard", LayoutDashboard],
      ["Customers", Users],
      ["Products", Package],
      ["Inventory", Box],
      ["Contracts", FileText],
    ],
  ],
  [
    "COLLECTIONS",
    [
      ["Installment Schedules", CalendarDays],
      ["Receive Payment", Wallet],
      ["Payment History", History],
      ["Overdue Installments", Clock],
      ["Vouchers and Receipts", FileText],
    ],
  ],
  [
    "BUSINESS",
    [
      ["Reports and Analytics", ChartNoAxesCombined],
      ["Documents", Folder],
      ["Backup and Restore", Database],
      ["Integrations", Plug],
      ["Audit Logs", ScrollText],
      ["Settings", Settings],
    ],
  ],
];
const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
const outstanding = (c) =>
  c.schedule.reduce((s, r) => s + r.amount - r.paid, 0);
function App() {
  const [data, setData] = useState(() => (isGas() ? null : loadDemo())),
    [error, setError] = useState(""),
    [page, setPage] = useState("Dashboard"),
    [theme, setTheme] = useState(
      () => localStorage.getItem("qist-theme") || "light",
    ),
    [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [query, setQuery] = useState(""),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [notices, setNotices] = useState(false),
    [profile, setProfile] = useState(false),
    [period, setPeriod] = useState("All time");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("qist-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (isGas())
      gasCall("bootstrap")
        .then(setData)
        .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (data && !isGas()) saveDemo(data);
  }, [data]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  function go(p) {
    setPage(p);
    setQuery("");
    setMobile(false);
    setNotices(false);
  }
  function update(next, message) {
    setData(next);
    setToast(message);
    setModal(null);
  }
  const customers = data?.customers || [],
    contracts = data?.contracts || [],
    payments = data?.payments || [];
  const due = contracts
    .flatMap((c) =>
      c.schedule
        .filter((r) => r.paid < r.amount)
        .map((r) => ({
          ...r,
          contract: c.id,
          customer: c.customer,
          product: c.product,
        })),
    )
    .sort((a, b) => a.due.localeCompare(b.due));
  const overdue = due.filter((r) => r.due < today());
  const dueTotal = due.reduce((s, r) => s + r.amount - r.paid, 0),
    overdueTotal = overdue.reduce((s, r) => s + r.amount - r.paid, 0);
  const customerName = (id) => customers.find((c) => c.id === id)?.name || id;
  const filtered = (rows) =>
    rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
    );
  const collected = payments
    .filter((p) =>
      period === "Today"
        ? p.date === today()
        : period === "This month"
          ? p.date.slice(0, 7) === today().slice(0, 7)
          : true,
    )
    .reduce((s, p) => s + p.amount, 0);
  function exportCSV() {
    if (isGas()) {
      setToast("Server report exports are not enabled in this foundation.");
      return;
    }
    const rows = [
      ["Payment", "Customer", "Contract", "Date", "Amount PKR", "Method"],
      ...payments.map((p) => [
        p.id,
        customerName(p.customer),
        p.contract,
        p.date,
        (p.amount / 100).toFixed(2),
        p.method,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map(
            (v) =>
              '"' +
              String(v)
                .replace(/^[=+@-]/, "'$&")
                .replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "qist-payments.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setToast("Payment report exported.");
  }
  if (error)
    return (
      <div className="access-error">
        <ShieldCheck size={40} />
        <h1>Workspace access required</h1>
        <p>{error}</p>
        <p>
          Ask your administrator to verify deployment identity and your active
          role.
        </p>
        <button onClick={() => location.reload()}>Try again</button>
      </div>
    );
  if (!data)
    return (
      <div className="access-error">
        <div className="spinner" />
        <h1>Opening your workspace…</h1>
      </div>
    );
  return (
    <div className={`app ${collapsed ? "is-collapsed" : ""}`}>
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          className="brand"
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            go("Dashboard");
          }}
        >
          <span className="brand-symbol">
            <Landmark size={23} />
          </span>
          <span>
            qist<span className="brand-dot">.</span>
            <small>BUSINESS, IN BALANCE</small>
          </span>
        </a>
        <button className="workspace-switch" onClick={() => go("Settings")}>
          <span className="workspace-logo">Q</span>
          <span className="nav-label">
            <b>{data.settings.name}</b>
            <small>Main workspace</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <nav aria-label="Main navigation">
          {navGroups.map(([title, items]) => (
            <div className="nav-group" key={title}>
              <p>{title}</p>
              {items.map(([name, Icon]) => (
                <button
                  title={name}
                  key={name}
                  className={`nav-item ${page === name ? "active" : ""}`}
                  onClick={() => go(name)}
                >
                  <Icon size={18} />
                  <span className="nav-label">
                    {name === "Reports and Analytics"
                      ? "Reports & analytics"
                      : name === "Vouchers and Receipts"
                        ? "Vouchers & receipts"
                        : name === "Backup and Restore"
                          ? "Backup & restore"
                          : name}
                  </span>
                  {name === "Overdue Installments" && (
                    <span className="nav-count">{overdue.length}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="safe-card">
            <ShieldCheck size={20} />
            <div>
              <b>
                {isGas()
                  ? "Workspace connected"
                  : "Your preview workspace"}{" "}
              </b>
              <small>
                {isGas()
                  ? "Google Workspace identity"
                  : "Sample data · saved on this device"}
              </small>
            </div>
          </div>
          <button
            className="collapse-btn"
            onClick={() => {
              setCollapsed(!collapsed);
              setMobile(false);
            }}
          >
            <PanelLeftClose size={17} />
            <span>Collapse sidebar</span>
          </button>
        </div>
      </aside>
      <div className="shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <span className="live-label">
              <i />
              {isGas() ? "Workspace" : "Demo workspace"}
            </span>
            <button
              className="icon-btn"
              aria-label={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <div className="popover-wrap">
              <button
                className="icon-btn notification-btn"
                aria-label="Notifications"
                onClick={() => {
                  setNotices(!notices);
                  setProfile(false);
                }}
              >
                <Bell size={19} />
                <i />
              </button>
              {notices && (
                <div className="popover">
                  <h3>Workspace notifications</h3>
                  <p>
                    <Clock size={16} /> {overdue.length} installments need
                    attention.
                  </p>
                  <button onClick={() => go("Overdue Installments")}>
                    Review overdue installments <ArrowRight size={15} />
                  </button>
                  <p>
                    <Box size={16} />{" "}
                    {data.products.filter((p) => p.stock <= p.min).length}{" "}
                    products are running low.
                  </p>
                  <button onClick={() => go("Inventory")}>
                    Check inventory <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
            <div className="top-divider" />
            <div className="popover-wrap">
              <button
                className="profile-btn"
                aria-label="Account menu"
                onClick={() => {
                  setProfile(!profile);
                  setNotices(false);
                }}
              >
                <span className="avatar owner">
                  {initials(data.settings.owner)}
                </span>
                <span>
                  <b>{data.settings.owner}</b>
                  <small>
                    {isGas() ? "Administrator" : "Demo administrator"}
                  </small>
                </span>
                <ChevronDown size={14} />
              </button>
              {profile && (
                <div className="popover">
                  <h3>{data.settings.owner}</h3>
                  <p>
                    {isGas()
                      ? "Identity managed by Google Workspace."
                      : "You are exploring synthetic sample data."}
                  </p>
                  <button
                    onClick={() => {
                      go("Settings");
                      setProfile(false);
                    }}
                  >
                    Workspace settings <Settings size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR BUSINESS, AT A GLANCE</div>
              <h1>
                {page === "Dashboard"
                  ? "A clearer view. A better business."
                  : page}
              </h1>
              <p>
                {page === "Dashboard"
                  ? "Welcome back. Here’s how your installment business is doing today."
                  : subtitles[page] ||
                    "Everything you need, organized in one place."}
              </p>
            </div>
            <div className="heading-actions">
              {page === "Dashboard" || page === "Reports and Analytics" ? (
                <>
                  <button className="btn" onClick={exportCSV}>
                    <Download size={16} /> Export report
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => setModal({ type: "payment" })}
                  >
                    <Plus size={17} /> Receive payment
                  </button>
                </>
              ) : page === "Customers" ? (
                <button
                  className="btn primary"
                  onClick={() => setModal({ type: "customer" })}
                >
                  <Plus size={17} /> Add customer
                </button>
              ) : page === "Contracts" ? (
                <button
                  className="btn primary"
                  onClick={() => setModal({ type: "contract" })}
                >
                  <Plus size={17} /> New contract
                </button>
              ) : null}
            </div>
          </div>
          {!isGas() && (
            <div className="demo-banner">
              <span>
                <span className="demo-pill">DEMO</span> Explore with sample
                data. Changes stay in this browser; no real payments are
                processed.
              </span>
              <span className="banner-end">
                PKR <span>·</span> Asia/Karachi
              </span>
            </div>
          )}
          {page === "Dashboard" && (
            <>
              <div className="section-toolbar">
                <div className="overview-title">
                  Business overview{" "}
                  <span className="soft-tag">
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: "Asia/Karachi",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date())}
                  </span>
                </div>
                <label className="select-btn">
                  <CalendarDays size={15} />
                  <select
                    aria-label="Collection period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option>This month</option>
                    <option>Today</option>
                    <option>All time</option>
                  </select>
                </label>
              </div>
              <div className="stats-grid">
                <Stat
                  title="Installment collections"
                  value={money(collected)}
                  icon={Wallet}
                  tone="green"
                  detail={`${payments.length} payments recorded`}
                  currency
                />
                <Stat
                  title="Outstanding receivables"
                  value={money(dueTotal)}
                  icon={Landmark}
                  tone="blue"
                  detail="Across all active contracts"
                  currency
                />
                <Stat
                  title="Active contracts"
                  value={contracts.filter((c) => c.status === "Active").length}
                  icon={FileText}
                  tone="purple"
                  detail={`${customers.length} customers in your workspace`}
                />
                <Stat
                  title="Overdue amount"
                  value={money(overdueTotal)}
                  icon={Clock}
                  tone="orange"
                  detail={`${overdue.length} installments need attention`}
                  currency
                />
              </div>
              <div className="dashboard-grid">
                <section className="card collection-chart">
                  <div className="card-head">
                    <div>
                      <h2>Collection overview</h2>
                      <p>Actual collections and expected installments</p>
                    </div>
                    <span className="soft-tag">{period}</span>
                  </div>
                  <CollectionChart
                    contracts={contracts}
                    payments={payments}
                    period={period}
                  />
                  <div className="chart-caption">
                    <span>
                      <i className="legend-dot green" />
                      Collected
                    </span>
                    <span>
                      <i className="legend-dot pale" />
                      Expected
                    </span>
                    <span className="caption-note">Amounts in PKR</span>
                  </div>
                </section>
                <section className="card portfolio">
                  <div className="card-head">
                    <div>
                      <h2>Your portfolio</h2>
                      <p>Every rupee, accounted for</p>
                    </div>
                    <ChartNoAxesCombined size={18} />
                  </div>
                  <div className="donut-wrap">
                    <div
                      className="donut"
                      style={{
                        "--progress": `${dueTotal + payments.reduce((s, p) => s + p.amount, 0) ? (payments.reduce((s, p) => s + p.amount, 0) / (dueTotal + payments.reduce((s, p) => s + p.amount, 0))) * 100 : 0}%`,
                      }}
                    >
                      <div>
                        <small>Collection rate</small>
                        <strong>
                          {dueTotal + payments.reduce((s, p) => s + p.amount, 0)
                            ? Math.round(
                                (payments.reduce((s, p) => s + p.amount, 0) /
                                  (dueTotal +
                                    payments.reduce(
                                      (s, p) => s + p.amount,
                                      0,
                                    ))) *
                                  100,
                              )
                            : 0}
                          <span>%</span>
                        </strong>
                        <span>of installment receivables</span>
                      </div>
                    </div>
                  </div>
                  <div className="portfolio-row">
                    <span>
                      <i className="legend-dot green" />
                      Total collected
                    </span>
                    <b>
                      PKR {money(payments.reduce((s, p) => s + p.amount, 0))}
                    </b>
                  </div>
                  <div className="portfolio-row">
                    <span>
                      <i className="legend-dot pale" />
                      Outstanding
                    </span>
                    <b>PKR {money(dueTotal)}</b>
                  </div>
                  <div className="portfolio-note">
                    <ShieldCheck size={14} /> No late fees. Fair, transparent
                    installments.
                  </div>
                </section>
              </div>
              <div className="dashboard-lower">
                <section className="card">
                  <div className="card-head">
                    <div>
                      <h2>Upcoming & overdue</h2>
                      <p>A little follow-up goes a long way.</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => go("Installment Schedules")}
                    >
                      View all <ArrowRight size={15} />
                    </button>
                  </div>
                  <DueTable
                    rows={due.slice(0, 5)}
                    name={customerName}
                    onPay={(id) => setModal({ type: "payment", contract: id })}
                  />
                </section>
                <section className="card quick-actions">
                  <div className="card-head">
                    <div>
                      <h2>Make your next move</h2>
                      <p>Less admin. More business.</p>
                    </div>
                  </div>
                  {[
                    [
                      Users,
                      "Add a customer",
                      "Start a new relationship",
                      "customer",
                    ],
                    [
                      FileText,
                      "Create a contract",
                      "Build a flexible payment plan",
                      "contract",
                    ],
                    [
                      Wallet,
                      "Receive a payment",
                      "Keep your collections moving",
                      "payment",
                    ],
                  ].map(([Icon, title, desc, type]) => (
                    <button
                      className="quick-action"
                      key={type}
                      onClick={() => setModal({ type })}
                    >
                      <span className={`action-icon ${type}`}>
                        <Icon size={20} />
                      </span>
                      <span>
                        <b>{title}</b>
                        <small>{desc}</small>
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                  <div className="tip">
                    <span>BUILT FOR YOUR BUSINESS</span>
                    <p>
                      Small steps.
                      <br />
                      <b>Stronger cash flow.</b>
                    </p>
                    <div className="tip-art">
                      <div />
                      <div />
                      <div />
                      <ArrowUpRight size={32} />
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
          {[
            "Customers",
            "Products",
            "Inventory",
            "Contracts",
            "Installment Schedules",
            "Overdue Installments",
            "Payment History",
            "Vouchers and Receipts",
            "Audit Logs",
          ].includes(page) && (
            <section className="card records">
              <div className="records-toolbar">
                <div className="search-field">
                  <Search size={17} />
                  <input
                    aria-label={`Search ${page}`}
                    placeholder={`Search ${page.toLowerCase()}…`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      className="icon-btn"
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="soft-tag">
                  {page === "Customers"
                    ? customers.length
                    : page === "Contracts"
                      ? contracts.length
                      : page === "Products" || page === "Inventory"
                        ? data.products.length
                        : page === "Audit Logs"
                          ? data.audit.length
                          : page.includes("Installment")
                            ? due.length
                            : payments.length}{" "}
                  records
                </span>
              </div>
              {page === "Customers" && (
                <PagedTable
                  headers={["Customer", "Contact", "Location", "Status", ""]}
                  rows={filtered(customers)}
                  render={(c) => (
                    <>
                      <td>
                        <Person name={c.name} sub={c.id} />
                      </td>
                      <td>
                        {c.phone}
                        <small className="cell-sub">
                          CNIC •••••-•••••••-{c.cnic.slice(-1)}
                        </small>
                      </td>
                      <td>{c.address}</td>
                      <td>
                        <Badge>{c.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="text-btn"
                          onClick={() =>
                            setModal({ type: "customerDetail", customer: c })
                          }
                        >
                          View <ArrowRight size={14} />
                        </button>
                      </td>
                    </>
                  )}
                />
              )}
              {(page === "Products" || page === "Inventory") && (
                <PagedTable
                  headers={[
                    "Product",
                    "Category",
                    "Cash price",
                    "Stock",
                    "Status",
                  ]}
                  rows={filtered(data.products)}
                  render={(p) => (
                    <>
                      <td>
                        <div className="product-cell">
                          <span className="product-icon">
                            <Package size={22} />
                          </span>
                          <div>
                            <b>{p.name}</b>
                            <small className="cell-sub">{p.model}</small>
                          </div>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>PKR {money(p.price)}</td>
                      <td>{p.stock} units</td>
                      <td>
                        <Badge warning={p.stock <= p.min}>
                          {p.stock <= p.min ? "Low stock" : "In stock"}
                        </Badge>
                      </td>
                    </>
                  )}
                />
              )}
              {page === "Contracts" && (
                <PagedTable
                  headers={[
                    "Contract",
                    "Customer / product",
                    "Receivable",
                    "Outstanding",
                    "Status",
                    "",
                  ]}
                  rows={filtered(
                    contracts.map((c) => ({
                      ...c,
                      name: customerName(c.customer),
                    })),
                  )}
                  render={(c) => (
                    <>
                      <td>
                        <b>{c.id}</b>
                        <small className="cell-sub">
                          {c.count} monthly installments
                        </small>
                      </td>
                      <td>
                        {c.name}
                        <small className="cell-sub">{c.product}</small>
                      </td>
                      <td>PKR {money(c.total)}</td>
                      <td>PKR {money(outstanding(c))}</td>
                      <td>
                        <Badge>{c.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="text-btn"
                          onClick={() =>
                            setModal({ type: "schedule", contract: c })
                          }
                        >
                          View plan <ArrowRight size={14} />
                        </button>
                      </td>
                    </>
                  )}
                />
              )}
              {["Installment Schedules", "Overdue Installments"].includes(
                page,
              ) && (
                <DueTable
                  rows={filtered(
                    (page === "Overdue Installments" ? overdue : due).map(
                      (r) => ({ ...r, name: customerName(r.customer) }),
                    ),
                  )}
                  name={customerName}
                  onPay={(id) => setModal({ type: "payment", contract: id })}
                  paginated
                />
              )}
              {["Payment History", "Vouchers and Receipts"].includes(page) && (
                <PagedTable
                  headers={[
                    "Payment",
                    "Customer",
                    "Date",
                    "Method",
                    "Amount",
                    "",
                  ]}
                  rows={filtered(
                    payments.map((p) => ({
                      ...p,
                      name: customerName(p.customer),
                    })),
                  )}
                  render={(p) => (
                    <>
                      <td>
                        <b>{p.id}</b>
                        <small className="cell-sub">{p.contract}</small>
                      </td>
                      <td>{p.name}</td>
                      <td>{p.date}</td>
                      <td>{p.method}</td>
                      <td>PKR {fullMoney(p.amount)}</td>
                      <td>
                        <button
                          className="text-btn"
                          onClick={() =>
                            setModal({ type: "receipt", payment: p })
                          }
                        >
                          Receipt <ArrowRight size={14} />
                        </button>
                      </td>
                    </>
                  )}
                />
              )}
              {page === "Audit Logs" && (
                <PagedTable
                  headers={["Time", "Action", "Record"]}
                  rows={filtered(data.audit)}
                  render={(r) => (
                    <>
                      <td>
                        {new Date(r.date).toLocaleString("en-GB", {
                          timeZone: "Asia/Karachi",
                        })}
                      </td>
                      <td>{r.action}</td>
                      <td>{r.entity}</td>
                    </>
                  )}
                />
              )}
            </section>
          )}
          {page === "Receive Payment" && (
            <section className="card standalone-form">
              <PaymentForm
                data={data}
                onSubmit={(p) =>
                  update(
                    receive(data, p),
                    "Payment recorded. Receipt is available in payment history.",
                  )
                }
                notify={setToast}
              />
            </section>
          )}
          {page === "Reports and Analytics" && (
            <>
              <div className="stats-grid">
                <Stat
                  title="Cash price of contracts"
                  value={money(contracts.reduce((s, c) => s + c.cash, 0))}
                  icon={FileText}
                  tone="green"
                  currency
                  detail="Contract price snapshots"
                />
                <Stat
                  title="Down payments"
                  value={money(contracts.reduce((s, c) => s + c.down, 0))}
                  icon={Wallet}
                  tone="blue"
                  currency
                  detail="Recorded at contract creation"
                />
                <Stat
                  title="Contract markup"
                  value={money(contracts.reduce((s, c) => s + c.markup, 0))}
                  icon={ChartNoAxesCombined}
                  tone="purple"
                  currency
                  detail="One-time markup"
                />
                <Stat
                  title="Outstanding installments"
                  value={money(dueTotal)}
                  icon={Clock}
                  tone="orange"
                  currency
                  detail="No late fees applied"
                />
              </div>
              <section className="card">
                <div className="card-head">
                  <div>
                    <h2>Receivables aging</h2>
                    <p>Open installment balances as of {today()}</p>
                  </div>
                  <button className="btn" onClick={() => window.print()}>
                    <Printer size={16} /> Print report
                  </button>
                </div>
                <div className="aging">
                  {[
                    ["Upcoming", (r) => r.due >= today()],
                    ["1–30 days", (r) => age(r.due) > 0 && age(r.due) <= 30],
                    ["31–60 days", (r) => age(r.due) > 30 && age(r.due) <= 60],
                    ["61–90 days", (r) => age(r.due) > 60 && age(r.due) <= 90],
                    ["90+ days", (r) => age(r.due) > 90],
                  ].map(([label, fn]) => (
                    <div key={label}>
                      <small>{label}</small>
                      <strong>
                        PKR{" "}
                        {money(
                          due
                            .filter(fn)
                            .reduce((s, r) => s + r.amount - r.paid, 0),
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {page === "Settings" && (
            <SettingsForm
              settings={data.settings}
              onSubmit={(settings) => {
                if (isGas())
                  throw new Error("Server settings updates are not enabled.");
                update({ ...data, settings }, "Workspace settings saved.");
              }}
            />
          )}
          {["Documents", "Backup and Restore", "Integrations"].includes(
            page,
          ) && (
            <section className="card integration-state">
              <span className="integration-icon">
                {page === "Documents" ? (
                  <Folder size={30} />
                ) : page === "Backup and Restore" ? (
                  <Database size={30} />
                ) : (
                  <Plug size={30} />
                )}
              </span>
              <span className="soft-tag">GOOGLE WORKSPACE SETUP</span>
              <h2>
                {page === "Documents"
                  ? "A secure home for your business files"
                  : page === "Backup and Restore"
                    ? "Protect every part of your business"
                    : "Connect your business, thoughtfully"}
              </h2>
              <p>
                {page === "Documents"
                  ? "Customer files, contracts and receipts belong in restricted Google Drive folders. Document uploads and PDF delivery require the document-service phase."
                  : page === "Backup and Restore"
                    ? "Drive backup scheduling, attachment manifests, integrity verification and authorized restore are not enabled in this phase. Browser demo data is not a business backup."
                    : "Google Sheets and Drive are used by the Apps Script foundation. WhatsApp, payment providers and external databases require separately authenticated integrations."}
              </p>
              <div className="integration-checklist">
                <div>
                  <Check size={17} /> Setup and deployment instructions included
                </div>
                <div>
                  <ShieldCheck size={17} /> No credentials stored in the browser
                </div>
                <div>
                  <Clock size={17} /> Google deployment validation required
                </div>
              </div>
              <button className="btn" onClick={() => go("Settings")}>
                <Settings size={16} /> View workspace settings
              </button>
            </section>
          )}
          <footer>
            <span>
              <span className="footer-brand">qist.</span> A little clarity. A
              lot of possibility.
            </span>
            <span>
              PKR · Asia/Karachi <span className="footer-dot">•</span>{" "}
              {isGas() ? "Workspace foundation" : "Local demo · v0.1"}
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <Modal
          title={
            {
              customer: "Add a customer",
              contract: "Create a contract",
              payment: "Receive a payment",
              customerDetail: "Customer profile",
              schedule: "Installment plan",
              receipt: "Payment receipt",
            }[modal.type]
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "customer" && (
            <CustomerForm
              existing={customers}
              onSubmit={async (input) => {
                if (isGas()) {
                  await gasCall("createCustomer", input);
                  setData(await gasCall("bootstrap"));
                  setModal(null);
                  setToast("Customer registered.");
                  return;
                }
                const c = {
                  ...customerInput(input, customers),
                  uuid: crypto.randomUUID(),
                  id: `CUS-${String(customers.length + 1).padStart(6, "0")}`,
                };
                update(
                  {
                    ...data,
                    customers: [c, ...customers],
                    audit: [
                      {
                        id: crypto.randomUUID(),
                        date: new Date().toISOString(),
                        action: "Customer registered",
                        entity: c.id,
                      },
                      ...data.audit,
                    ],
                  },
                  "Customer registered successfully.",
                );
              }}
            />
          )}
          {modal.type === "contract" && (
            <ContractForm
              data={data}
              onSubmit={(c) => {
                if (isGas())
                  throw new Error(
                    "Server contract activation is not enabled. This calculator is a preview only.",
                  );
                update(
                  {
                    ...data,
                    contracts: [
                      ...contracts,
                      {
                        ...c,
                        id: `CON-${String(contracts.length + 1).padStart(6, "0")}`,
                        status: c.total === 0 ? "Completed" : "Active",
                      },
                    ],
                    audit: [
                      {
                        id: crypto.randomUUID(),
                        date: new Date().toISOString(),
                        action: "Demo contract created",
                        entity: c.customer,
                      },
                      ...data.audit,
                    ],
                  },
                  "Demo contract created with an exact installment schedule.",
                );
              }}
            />
          )}
          {modal.type === "payment" && (
            <PaymentForm
              data={data}
              selected={modal.contract}
              notify={setToast}
              onSubmit={(p) =>
                update(
                  receive(data, p),
                  "Payment recorded. View your receipt in payment history.",
                )
              }
            />
          )}
          {modal.type === "customerDetail" && (
            <>
              <div className="detail-profile">
                <Person name={modal.customer.name} sub={modal.customer.id} />
                <Badge>Active</Badge>
              </div>
              <dl className="detail-grid">
                <div>
                  <dt>Father’s name</dt>
                  <dd>{modal.customer.father}</dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>{modal.customer.phone}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{modal.customer.address}</dd>
                </div>
                <div>
                  <dt>Outstanding</dt>
                  <dd>
                    PKR{" "}
                    {fullMoney(
                      contracts
                        .filter((c) => c.customer === modal.customer.id)
                        .reduce((s, c) => s + outstanding(c), 0),
                    )}
                  </dd>
                </div>
              </dl>
              <h3>Associated contracts</h3>
              {contracts
                .filter((c) => c.customer === modal.customer.id)
                .map((c) => (
                  <button
                    key={c.id}
                    className="contract-link"
                    onClick={() => setModal({ type: "schedule", contract: c })}
                  >
                    <span>
                      {c.id} · {c.product}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              {!contracts.some((c) => c.customer === modal.customer.id) && (
                <p>No contracts yet.</p>
              )}
            </>
          )}
          {modal.type === "schedule" && (
            <>
              <p>
                {customerName(modal.contract.customer)} ·{" "}
                {modal.contract.product}
              </p>
              <div className="plan-summary">
                <span>
                  Financed amount <b>PKR {fullMoney(modal.contract.total)}</b>
                </span>
                <span>
                  Outstanding{" "}
                  <b>PKR {fullMoney(outstanding(modal.contract))}</b>
                </span>
              </div>
              <PagedTable
                headers={[
                  "Installment",
                  "Due date",
                  "Amount",
                  "Paid",
                  "Status",
                ]}
                rows={modal.contract.schedule}
                render={(r) => (
                  <>
                    <td>#{r.number}</td>
                    <td>{r.due}</td>
                    <td>{fullMoney(r.amount)}</td>
                    <td>{fullMoney(r.paid)}</td>
                    <td>
                      <Badge warning={r.paid < r.amount && r.due < today()}>
                        {r.paid === r.amount
                          ? "Paid"
                          : r.paid
                            ? "Partially paid"
                            : r.due < today()
                              ? "Overdue"
                              : "Upcoming"}
                      </Badge>
                    </td>
                  </>
                )}
              />
            </>
          )}
          {modal.type === "receipt" && (
            <div className="receipt">
              <div className="receipt-brand">{data.settings.name}</div>
              <p>{data.settings.address}</p>
              <span className="soft-tag">
                {isGas()
                  ? "PAYMENT RECEIPT"
                  : "DEMO RECEIPT — NOT A REAL PAYMENT"}
              </span>
              <h2>PKR {fullMoney(modal.payment.amount)}</h2>
              <dl className="detail-grid">
                {Object.entries({
                  Receipt: modal.payment.id.replace("PAY", "VCH"),
                  Customer: customerName(modal.payment.customer),
                  Contract: modal.payment.contract,
                  "Payment date": modal.payment.date,
                  Method: modal.payment.method,
                  Reference: modal.payment.reference || "—",
                  "Previous balance": `PKR ${fullMoney(modal.payment.previous)}`,
                  "Balance after payment": `PKR ${fullMoney(modal.payment.previous - modal.payment.amount)}`,
                  "Received by": modal.payment.receiver,
                }).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p>Thank you for your payment. No late fees are charged.</p>
              <button className="btn primary" onClick={() => window.print()}>
                <Printer size={16} /> Print / save PDF
              </button>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function age(date) {
  return Math.floor((Date.parse(today()) - Date.parse(date)) / 86400000);
}
const subtitles = {
  Customers: "Good relationships start with knowing your customers.",
  Products: "Your catalog, ready for the next opportunity.",
  Inventory: "Keep the right products within reach.",
  Contracts: "Clear terms. Confident commitments.",
  "Receive Payment": "Record a collection and keep every balance in sync.",
  "Payment History": "A clear trail of every collection.",
  "Overdue Installments": "Follow up thoughtfully. No penalties, ever.",
  Settings: "Make this workspace feel like your business.",
};
function Stat({ title, value, icon: Icon, tone, detail, currency }) {
  return (
    <section className={`card stat ${tone}`}>
      <div className="stat-top">
        <span>{title}</span>
        <span className="stat-icon">
          <Icon size={18} />
        </span>
      </div>
      <div className="stat-value">
        {currency && <small>PKR</small>}
        {value}
      </div>
      <div className="stat-detail">
        <span className="tiny-dot" />
        {detail}
      </div>
    </section>
  );
}
function Person({ name, sub }) {
  return (
    <div className="person">
      <span className={`avatar shade-${name.length % 4}`}>
        {initials(name)}
      </span>
      <span>
        <b>{name}</b>
        <small>{sub}</small>
      </span>
    </div>
  );
}
function Badge({ children, warning }) {
  return (
    <span className={`badge ${warning ? "warning" : ""}`}>
      <i />
      {children}
    </span>
  );
}
function PagedTable({ headers, rows, render }) {
  const [page, setPage] = useState(0);
  const size = 8;
  useEffect(() => setPage(0), [rows.length]);
  const p = Math.min(page, Math.max(0, Math.ceil(rows.length / size) - 1));
  return (
    <>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(p * size, p * size + size).map((r, i) => (
              <tr key={r.id || `${r.contract}-${r.number}` || i}>
                {render(r)}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">
            <Search size={24} />
            <b>No records to show</b>
            <p>Add your first record or try another search.</p>
          </div>
        )}
      </div>
      {rows.length > 0 && (
        <div className="pagination">
          <span>
            Showing {p * size + 1}–{Math.min(p * size + size, rows.length)} of{" "}
            {rows.length}
          </span>
          <div>
            <button
              disabled={!p}
              onClick={() => setPage(p - 1)}
              aria-label="Previous page"
            >
              <ArrowLeft size={15} />
            </button>
            <span>{p + 1}</span>
            <button
              disabled={(p + 1) * size >= rows.length}
              onClick={() => setPage(p + 1)}
              aria-label="Next page"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function DueTable({ rows, name, onPay }) {
  return (
    <PagedTable
      headers={["Customer", "Due date", "Amount", "Status", ""]}
      rows={rows}
      render={(r) => (
        <>
          <td>
            <Person name={name(r.customer)} sub={r.contract} />
          </td>
          <td>
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
            }).format(new Date(r.due + "T00:00:00Z"))}
            <small className="cell-sub">Installment {r.number}</small>
          </td>
          <td>
            <b className="amount">PKR {money(r.amount - r.paid)}</b>
          </td>
          <td>
            <Badge warning={r.due < today()}>
              {r.due < today()
                ? "Overdue"
                : r.due === today()
                  ? "Due today"
                  : "Upcoming"}
            </Badge>
          </td>
          <td>
            <button
              className="table-action"
              aria-label={`Receive payment for ${name(r.customer)}`}
              onClick={() => onPay(r.contract)}
            >
              <ArrowUpRight size={17} />
            </button>
          </td>
        </>
      )}
    />
  );
}
function CollectionChart({ contracts, payments, period }) {
  const now = new Date(today() + "T00:00:00Z"),
    month = today().slice(0, 7);
  let buckets;
  if (period === "Today")
    buckets = [{ label: "Today", matches: (d) => d === today() }];
  else if (period === "This month")
    buckets = Array.from({ length: 5 }, (_, i) => ({
      label: `${i * 7 + 1}–${Math.min(i * 7 + 7, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate())}`,
      matches: (d) =>
        d.startsWith(month) &&
        Number(d.slice(8)) >= i * 7 + 1 &&
        Number(d.slice(8)) <= i * 7 + 7,
    })).filter(
      (_, i) =>
        i * 7 <
        new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
        ).getUTCDate(),
    );
  else {
    const allDates = contracts
      .flatMap((c) => c.schedule.map((r) => r.due))
      .concat(payments.map((p) => p.date))
      .filter((d) => d <= today())
      .sort();
    const first = new Date((allDates[0] || today()) + "T00:00:00Z");
    const count = Math.max(
      1,
      (now.getUTCFullYear() - first.getUTCFullYear()) * 12 +
        now.getUTCMonth() -
        first.getUTCMonth() +
        1,
    );
    buckets = Array.from({ length: count }, (_, i) => {
      const d = new Date(
          Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1),
        ),
        key = d.toISOString().slice(0, 7);
      return {
        label: d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }),
        matches: (value) => value.startsWith(key),
      };
    });
  }
  const points = buckets.map((b) => ({
    ...b,
    expected: contracts
      .flatMap((c) => c.schedule)
      .filter((r) => b.matches(r.due))
      .reduce((s, r) => s + r.amount, 0),
    paid: payments
      .filter((p) => b.matches(p.date))
      .reduce((s, p) => s + p.amount, 0),
  }));
  const max = Math.max(...points.flatMap((m) => [m.expected, m.paid]), 100000);
  return (
    <div className="chart">
      <div className="chart-axis">
        {[1, 0.75, 0.5, 0.25, 0].map((v) => (
          <span key={v}>{money(Math.round(max * v))}</span>
        ))}
      </div>
      <div className="chart-plot">
        <div className="grid-lines">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} />
          ))}
        </div>
        <div className="chart-bars">
          {points.map((m, i) => (
            <div
              className="bar-group"
              key={i}
              title={`${m.label}: collected PKR ${money(m.paid)}, expected PKR ${money(m.expected)}`}
            >
              <div className="bar-pair">
                <div
                  className="bar paid"
                  style={{ height: `${(m.paid / max) * 100}%` }}
                />
                <div
                  className="bar expected"
                  style={{ height: `${(m.expected / max) * 100}%` }}
                />
              </div>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = [
          ...ref.current.querySelectorAll(
            "button,input,select,textarea,a[href]",
          ),
        ].filter((el) => !el.disabled);
        const first = elements[0],
          last = elements.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">QIST WORKSPACE</span>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
function Field({ label, children, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children ? (
        React.cloneElement(children, { id })
      ) : (
        <input id={id} {...props} />
      )}
    </div>
  );
}
function CustomerForm({ onSubmit }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await onSubmit(Object.fromEntries(new FormData(e.currentTarget)));
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="form-intro">
        A new relationship starts here. Fields below are required.
      </p>
      <div className="form-grid">
        <Field label="Full name" name="name" required maxLength={100} />
        <Field label="Father’s name" name="father" required maxLength={100} />
        <Field
          label="CNIC number"
          name="cnic"
          placeholder="12345-1234567-1"
          required
          pattern="[0-9]{5}-[0-9]{7}-[0-9]"
        />
        <Field
          label="Mobile number"
          name="phone"
          placeholder="0300 1234567"
          required
        />
        <Field
          label="Complete address"
          name="address"
          required
          maxLength={300}
        />
        <Field label="Email (optional)" name="email" type="email" />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-footer">
        <span>
          <ShieldCheck size={15} /> Keep personal information private.
        </span>
        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : "Register customer"}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
function ContractForm({ data, onSubmit }) {
  const [cash, setCash] = useState("100000"),
    [down, setDown] = useState("20000"),
    [count, setCount] = useState("12"),
    [date, setDate] = useState(today()),
    [product, setProduct] = useState(data.products[0]?.name || ""),
    [error, setError] = useState("");
  let preview;
  try {
    preview = plan(
      minor(cash),
      minor(down),
      Number(count),
      date,
      Math.round(data.settings.markup * 100),
    );
  } catch {}
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        try {
          if (!preview)
            throw new Error("Check the price, down payment and due date.");
          onSubmit({
            ...preview,
            customer: new FormData(e.currentTarget).get("customer"),
            product,
            cash: minor(cash),
            down: minor(down),
            count: Number(count),
            date,
            markupBps: Math.round(data.settings.markup * 100),
          });
        } catch (e) {
          setError(e.message);
        }
      }}
    >
      <p className="form-intro">
        Preview a one-time markup payment plan. No late fees.
      </p>
      <div className="form-grid">
        <Field label="Customer">
          <select name="customer" required>
            <option value="">Select a customer</option>
            {data.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Product">
          <select
            value={product}
            onChange={(e) => {
              setProduct(e.target.value);
              const p = data.products.find((p) => p.name === e.target.value);
              setCash(String(p.price / 100));
            }}
          >
            {data.products.map((p) => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Cash price (PKR)"
          inputMode="decimal"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          required
        />
        <Field
          label="Down payment (PKR)"
          inputMode="decimal"
          value={down}
          onChange={(e) => setDown(e.target.value)}
          required
        />
        <Field label="Installment term">
          <select value={count} onChange={(e) => setCount(e.target.value)}>
            {[6, 12, 18, 24].map((n) => (
              <option value={n} key={n}>
                {n} months
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="First due date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      {preview ? (
        <div className="calculation">
          <div>
            <span>Remaining principal</span>
            <b>PKR {fullMoney(preview.principal)}</b>
          </div>
          <div>
            <span>One-time markup ({data.settings.markup}%)</span>
            <b>PKR {fullMoney(preview.markup)}</b>
          </div>
          <div>
            <span>Total installment receivable</span>
            <b>PKR {fullMoney(preview.total)}</b>
          </div>
          <div className="calculation-total">
            <span>
              Monthly installment{" "}
              <small>Final installment adjusts rounding</small>
            </span>
            <strong>PKR {fullMoney(preview.schedule[0].amount)}</strong>
          </div>
        </div>
      ) : (
        <p className="form-error">
          Enter valid amounts; the down payment cannot exceed the cash price.
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-footer">
        <span>
          {isGas()
            ? "Calculator preview · server activation unavailable"
            : "Synthetic demo contract only"}
        </span>
        <button className="btn primary" disabled={!preview}>
          Create demo contract <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
function PaymentForm({ data, selected, onSubmit }) {
  const [contract, setContract] = useState(selected || ""),
    [amount, setAmount] = useState(""),
    [error, setError] = useState(""),
    [key, setKey] = useState(() => crypto.randomUUID());
  const c = data.contracts.find((c) => c.id === contract);
  const balance = c ? outstanding(c) : 0;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        try {
          if (isGas())
            throw new Error(
              "Production payment posting is not enabled. No payment has been processed.",
            );
          const fields = Object.fromEntries(new FormData(e.currentTarget));
          onSubmit({
            contract,
            amount: minor(amount),
            method: fields.method,
            reference: fields.reference,
            key,
          });
          setAmount("");
          setKey(crypto.randomUUID());
        } catch (e) {
          setError(e.message);
        }
      }}
    >
      <p className="form-intro">
        Payments are allocated to the oldest unpaid installment first.
      </p>
      <Field label="Customer / contract">
        <select
          value={contract}
          onChange={(e) => {
            setContract(e.target.value);
            setAmount("");
          }}
          required
        >
          <option value="">Select an active contract</option>
          {data.contracts
            .filter((c) => outstanding(c) > 0)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {data.customers.find((u) => u.id === c.customer)?.name} · {c.id}
              </option>
            ))}
        </select>
      </Field>
      {c && (
        <div className="payment-balance">
          <div>
            <small>Outstanding balance</small>
            <strong>PKR {fullMoney(balance)}</strong>
          </div>
          <span>{c.product}</span>
        </div>
      )}
      <div className="form-grid">
        <Field
          label="Amount received (PKR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          required
        />
        <Field label="Payment method">
          <select name="method">
            {[
              "Cash",
              "Bank Transfer",
              "Easypaisa",
              "JazzCash",
              "Cheque",
              "Other",
            ].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Transaction reference (optional)"
          name="reference"
          maxLength={100}
        />
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-footer">
        <span>
          <ShieldCheck size={15} />{" "}
          {isGas()
            ? "Server posting unavailable"
            : "Demo · no money is transferred"}
        </span>
        <button className="btn primary" disabled={!c}>
          Record payment <ArrowDownLeft size={16} />
        </button>
      </div>
    </form>
  );
}
function SettingsForm({ settings, onSubmit }) {
  const [error, setError] = useState("");
  return (
    <section className="card settings-card">
      <div className="card-head">
        <div>
          <h2>Business details</h2>
          <p>Branding for your workspace and printed receipts.</p>
        </div>
        <span className="soft-tag">ADMINISTRATOR</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            const markup = Number(fields.markup);
            if (!Number.isFinite(markup) || markup < 0 || markup > 100)
              throw new Error("Markup must be between 0 and 100.");
            onSubmit({ ...fields, markup });
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <div className="form-grid">
          <Field
            label="Business name"
            name="name"
            defaultValue={settings.name}
            required
          />
          <Field
            label="Owner name"
            name="owner"
            defaultValue={settings.owner}
            required
          />
          <Field
            label="Business address"
            name="address"
            defaultValue={settings.address}
            required
          />
          <Field
            label="Business phone"
            name="phone"
            defaultValue={settings.phone}
          />
          <Field
            label="Default one-time markup (%)"
            type="number"
            name="markup"
            defaultValue={settings.markup}
            min="0"
            max="100"
            step="0.01"
            required
          />
          <Field
            label="Currency / timezone"
            value="PKR · Asia/Karachi"
            readOnly
          />
        </div>
        <p className="form-intro">
          Changes apply to new plans. Existing contract prices and markup remain
          unchanged.
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="form-footer">
          <span>Workspace preferences</span>
          <button className="btn primary">
            Save changes <Check size={16} />
          </button>
        </div>
      </form>
    </section>
  );
}
createRoot(document.getElementById("root")).render(<App />);
