import test from "node:test";
import assert from "node:assert/strict";
import { customerInput } from "../src/data.js";
import {
  receiptSummary,
  whatsAppUrl,
  emailUrl,
  receiptFile,
} from "../src/sharing.js";
const customer = {
  name: "Test Customer",
  father: "Father",
  phone: "03001234567",
  address: "Peshawar",
  cnic: "sensitive-id",
  email: "test@example.test",
};
const payment = {
  id: "PAY-000001",
  contract: "CON-000001",
  date: "2026-10-22",
  amount: 900000,
  previous: 10800000,
  method: "Cash",
  receiver: "Demo administrator",
};
test("CNIC may be omitted, blank, freely formatted or repeated", () => {
  for (const cnic of [undefined, "", "123", "1234512345671", "any free text"])
    assert.equal(
      customerInput({ ...customer, cnic }, [{ cnic }]).cnic,
      cnic || "",
    );
});
test("unrelated name, address and mobile validation still applies", () => {
  for (const fields of [
    { name: "" },
    { father: "" },
    { address: "" },
    { phone: "abc" },
  ])
    assert.throws(() => customerInput({ ...customer, ...fields }, []));
});
test("share summary contains exact receipt balances without CNIC or address", () => {
  const text = receiptSummary(payment, customer, { name: "Qist & Co" });
  assert(text.includes("PKR 9,000.00"));
  assert(text.includes("PKR 99,000.00"));
  assert(!text.includes(customer.cnic));
  assert(!text.includes(customer.address));
  assert(text.includes("DEMO RECEIPT"));
});
test("WhatsApp encoding preserves content and normalizes Pakistani mobile", () => {
  const text = "A & B\nPKR 9,000";
  const url = new URL(whatsAppUrl(text, "0300 1234567"));
  assert.equal(url.pathname, "/923001234567");
  assert.equal(url.searchParams.get("text"), text);
  assert.equal(new URL(whatsAppUrl(text, "bad-phone")).pathname, "/");
});
test("email composer encodes subject and body and rejects injected recipients", () => {
  const text = "Line one\nLine two & more";
  const url = new URL(emailUrl(text, "test@example.test", "PAY-1"));
  assert.equal(url.searchParams.get("body"), text);
  assert.equal(url.searchParams.get("subject"), "Payment receipt PAY-1");
  assert.equal(
    new URL(emailUrl(text, "test@example.test?bcc=other@example.test"))
      .pathname,
    "",
  );
});
test("PDF generator creates an actual PDF file with a voucher filename", async () => {
  const file = receiptFile(payment, customer, { name: "Qist Business" });
  assert.equal(file.name, "VCH-000001.pdf");
  assert.equal(file.type, "application/pdf");
  const bytes = Buffer.from(await file.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert(bytes.toString().includes("99,000.00"));
});
