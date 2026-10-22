import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
function context() {
  const ctx = { Session: { getActiveUser: () => ({ getEmail: () => "" }) } };
  vm.createContext(ctx);
  for (const file of fs
    .readdirSync("apps-script")
    .filter((f) => f.endsWith(".gs")))
    vm.runInContext(fs.readFileSync("apps-script/" + file, "utf8"), ctx, {
      filename: file,
    });
  return ctx;
}
test("all server sources parse and schema headers are unique", () => {
  const c = context();
  assert.equal(Object.keys(c.ERP_SCHEMA_).length, 26);
  for (const name of Object.keys(c.ERP_SCHEMA_)) {
    const h = c.headers_(name);
    assert.equal(new Set(h).size, h.length);
  }
});
test("server denies missing verified Workspace identity", () => {
  assert.throws(() => context().actor_(), /identity is unavailable/);
});
test("server rejects inactive, unknown and staff accounts", () => {
  for (const [role, active] of [
    ["ADMIN", false],
    ["STAFF", true],
    ["UNKNOWN", true],
  ]) {
    const c = context();
    c.Session = {
      getActiveUser: () => ({ getEmail: () => "person@example.test" }),
    };
    c.repository_ = () => ({
      findMany: () => [
        { email: "person@example.test", role, active, status: "Active" },
      ],
    });
    assert.throws(() => c.actor_());
  }
});
test("admin can create customers but cannot manage settings", () => {
  const c = context();
  assert.doesNotThrow(() =>
    c.authorize_({ role: "ADMIN" }, "customers.create"),
  );
  assert.throws(
    () => c.authorize_({ role: "ADMIN" }, "settings.manage"),
    /Permission denied/,
  );
  assert.throws(
    () => c.authorize_({ role: "STAFF" }, "customers.create"),
    /Permission denied/,
  );
});
test("formula-leading values are escaped before Sheets writes", () => {
  const c = context();
  for (const v of ['=IMPORTXML("x")', "+123", "-123", "@value", "  =formula"])
    assert.equal(c.safeCell_(v), "'" + v);
  assert.equal(c.safeCell_("03001234567"), "03001234567");
  assert.equal(c.safeCell_(100), 100);
});
test("customer service rechecks authorization before touching storage", () => {
  assert.throws(
    () => context().createCustomer_({ role: "STAFF" }, {}),
    /Permission denied/,
  );
});

test("server permits optional and unrestricted CNIC while retaining other required fields", () => {
  const c = context(),
    rows = [];
  c.LockService = {
    getScriptLock: () => ({ waitLock() {}, releaseLock() {} }),
  };
  c.PropertiesService = {
    getScriptProperties: () => ({ getProperty: () => 0, setProperty() {} }),
  };
  c.Utilities = { getUuid: () => `uuid-${rows.length}` };
  c.repository_ = () => ({
    findMany: () => rows,
    create: (_, row) => {
      rows.push(row);
      return row;
    },
  });
  c.audit_ = () => {};
  const user = { role: "ADMIN", email: "admin@example.test" };
  for (const cnic of ["", "not-a-formatted-id", "not-a-formatted-id"])
    c.createCustomer_(user, {
      name: "Test",
      father: "Father",
      address: "Peshawar",
      phone: "03001234567",
      cnic,
    });
  assert.deepEqual(
    rows.map((r) => r.cnic),
    ["", "not-a-formatted-id", "not-a-formatted-id"],
  );
  assert.throws(
    () =>
      c.createCustomer_(user, {
        name: "Test",
        father: "Father",
        address: "",
        phone: "03001234567",
        cnic: "",
      }),
    /Required customer/,
  );
});
