import React, { useState } from "react";
import { Download, Mail, MessageCircle, Printer, Share2 } from "lucide-react";
import {
  receiptSummary,
  whatsAppUrl,
  emailUrl,
  receiptFile,
  downloadReceipt,
} from "./sharing";
export default function ReceiptActions({ payment, customer, business }) {
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [channel, setChannel] = useState(null);
  const text = receiptSummary(payment, customer, business);
  function download() {
    setError("");
    try {
      downloadReceipt(receiptFile(payment, customer, business));
      setMessage(
        "PDF downloaded. You can attach it manually in WhatsApp or email.",
      );
    } catch {
      setError(
        "The PDF could not be created. You can still print or save it using your browser.",
      );
    }
  }
  async function share() {
    setBusy(true);
    setError("");
    try {
      const file = receiptFile(payment, customer, business);
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          files: [file],
          title: `Receipt ${payment.id}`,
        });
        setMessage("Receipt handed to your device’s share menu.");
      } else {
        downloadReceipt(file);
        setMessage(
          "This browser cannot share PDF files directly. The PDF was downloaded so you can attach it manually.",
        );
      }
    } catch (e) {
      if (e.name !== "AbortError")
        setError(
          "File sharing could not finish. Download the PDF and attach it manually.",
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="receipt-actions">
      <div className="receipt-action-buttons">
        <button className="btn primary" onClick={download}>
          <Download size={16} /> Download PDF
        </button>
        <button className="btn" onClick={() => window.print()}>
          <Printer size={16} /> Print receipt
        </button>
        <button
          className="btn"
          onClick={() => {
            setChannel("whatsapp");
            setMessage("");
            setError("");
          }}
        >
          <MessageCircle size={16} /> WhatsApp
        </button>
        <button
          className="btn"
          onClick={() => {
            setChannel("email");
            setMessage("");
            setError("");
          }}
        >
          <Mail size={16} /> Email
        </button>
        <button className="btn" onClick={share} disabled={busy}>
          <Share2 size={16} />
          {busy ? "Preparing PDF…" : "Share PDF"}
        </button>
      </div>
      {channel && (
        <section className="share-preview" aria-label="Share receipt preview">
          <h3>Review before sharing</h3>
          <p>
            You are sharing this receipt summary with an external app. It
            includes the customer’s name, payment and balance details. No CNIC
            or address is included. The PDF is not automatically attached.
          </p>
          <pre>{text}</pre>
          <a
            className="btn primary"
            href={
              channel === "whatsapp"
                ? whatsAppUrl(text, customer.whatsapp || customer.phone)
                : emailUrl(text, customer.email, payment.id)
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {channel === "whatsapp"
              ? "Open WhatsApp summary"
              : "Open email draft"}
          </a>
          <button className="btn" onClick={() => setChannel(null)}>
            Cancel
          </button>
          <small>
            For an attachment, download the PDF first and attach it in the app
            yourself. WhatsApp or an email application must be available on your
            device.
          </small>
        </section>
      )}
      {message && (
        <p className="share-message" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
