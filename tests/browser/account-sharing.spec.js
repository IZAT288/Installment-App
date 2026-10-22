import { test, expect } from "@playwright/test";
test("login, registration and recovery pages explain missing provider without fake success", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register an account" }).click();
  await expect(page).toHaveURL(/#\/register$/);
  await page.getByLabel("Full name").fill("Test User");
  await page.getByLabel("Email address").fill("test@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("PrivateTestPassword123");
  await page.getByLabel("Confirm password").fill("PrivateTestPassword123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Account service is not connected",
  );
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("PrivateTestPassword123");
  await page.getByRole("button", { name: "Back to sign in" }).click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Let’s get you back in." }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("test@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Account service is not connected",
  );
  await page.getByRole("button", { name: "Explore local demo" }).click();
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Exit demo / sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("receipts download a PDF, preview safe composer links and fall back when file sharing is unsupported", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore local demo" }).click();
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Payment History", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Receipt", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  let download = page.waitForEvent("download");
  await dialog
    .getByRole("button", { name: "Download PDF", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/^VCH-.*\.pdf$/);
  await dialog.getByRole("button", { name: "WhatsApp", exact: true }).click();
  await expect(
    dialog.getByRole("region", { name: "Share receipt preview" }),
  ).toBeVisible();
  const whatsapp = dialog.getByRole("link", { name: "Open WhatsApp summary" });
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/923/);
  expect(
    new URL(await whatsapp.getAttribute("href")).searchParams.get("text"),
  ).toContain("Balance after payment:");
  await dialog.getByRole("button", { name: "Email", exact: true }).click();
  await expect(
    dialog.getByRole("link", { name: "Open email draft" }),
  ).toHaveAttribute("href", /^mailto:/);
  download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Share PDF", exact: true }).click();
  await download;
  await expect(dialog.getByRole("status")).toContainText(
    "cannot share PDF files directly",
  );
});
test("customer form accepts a missing CNIC", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore local demo" }).click();
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Customers", exact: true })
    .click();
  await page.getByRole("button", { name: "Add customer", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("CNIC number (optional)")).not.toHaveAttribute(
    "required",
    "",
  );
  await expect(dialog.getByLabel("CNIC number (optional)")).not.toHaveAttribute(
    "pattern",
    /.+/,
  );
  await dialog.getByLabel("Full name").fill("No CNIC Customer");
  await dialog.getByLabel("Father’s name").fill("Test Father");
  await dialog.getByLabel("Mobile number").fill("03001234567");
  await dialog.getByLabel("Complete address").fill("Peshawar");
  await dialog.getByRole("button", { name: "Register customer" }).click();
  await expect(
    page.getByRole("cell", { name: "No CNIC Customer" }),
  ).toBeVisible();
  await expect(
    page.getByText("CNIC not provided", { exact: true }),
  ).toBeVisible();
});
test("native file-share receives the generated PDF when supported", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      value: ({ files }) => files?.length === 1,
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: async ({ files }) => {
        window.sharedReceipt = {
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        };
      },
      configurable: true,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore local demo" }).click();
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Payment History", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Receipt", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Share PDF", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "handed to your device",
  );
  const file = await page.evaluate(() => window.sharedReceipt);
  expect(file.type).toBe("application/pdf");
  expect(file.name).toMatch(/^VCH-.*\.pdf$/);
  expect(file.size).toBeGreaterThan(1000);
});
