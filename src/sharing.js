import { jsPDF } from "jspdf";
import { fullMoney } from "./data.js";
export function receiptLines(payment, customer, business) {
  return [
    business.name,
    "DEMO RECEIPT - NOT A REAL PAYMENT",
    `Receipt: ${payment.id.replace("PAY", "VCH")}`,
    `Customer: ${customer.name}`,
    `Contract: ${payment.contract}`,
    `Date: ${payment.date}`,
    `Amount paid: PKR ${fullMoney(payment.amount)}`,
    `Method: ${payment.method}`,
    `Reference: ${payment.reference || "Not provided"}`,
    `Previous balance: PKR ${fullMoney(payment.previous)}`,
    `Balance after payment: PKR ${fullMoney(payment.previous - payment.amount)}`,
    `Received by: ${payment.receiver}`,
    "Thank you for your payment. No late fees are charged.",
  ];
}
export function receiptSummary(payment, customer, business) {
  return receiptLines(payment, customer, business).join("\n");
}
export function whatsAppUrl(text, phone = "") {
  let digits = phone.replace(/\D/g, "");
  if (/^03\d{9}$/.test(digits)) digits = "92" + digits.slice(1);
  return `https://wa.me/${/^923\d{9}$/.test(digits) ? digits : ""}?text=${encodeURIComponent(text)}`;
}
export function emailUrl(text, email = "", id = "") {
  const address = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)
    ? email
    : "";
  return `mailto:${address}?subject=${encodeURIComponent(`Payment receipt ${id}`)}&body=${encodeURIComponent(text)}`;
}
export function receiptFile(payment, customer, business) {
  const pdf = new jsPDF();
  let y = 23;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  for (const [i, line] of receiptLines(payment, customer, business).entries()) {
    pdf.setFontSize(i === 0 ? 20 : 11);
    pdf.setFont("helvetica", i === 0 ? "bold" : "normal");
    pdf.setTextColor(i === 1 ? 155 : 35, i === 1 ? 77 : 55, i === 1 ? 48 : 45);
    const lines = pdf.splitTextToSize(line, 170);
    if (y + lines.length * 6 > 277) {
      pdf.addPage();
      y = 23;
    }
    pdf.text(lines, 20, y);
    y += lines.length * 6 + (i === 0 ? 9 : 4);
  }
  return new File(
    [pdf.output("arraybuffer")],
    `${payment.id.replace("PAY", "VCH")}.pdf`,
    { type: "application/pdf" },
  );
}
export function downloadReceipt(file) {
  const url = URL.createObjectURL(file),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
