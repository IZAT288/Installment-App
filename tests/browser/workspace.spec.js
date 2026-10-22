import { test, expect } from "@playwright/test";
async function navigate(page, name) {
  const toggle = page.getByRole("button", { name: "Open navigation" });
  if (await toggle.isVisible()) await toggle.click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
}
test("dashboard is responsive, theme persists, navigation and search work", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A clearer view. A better business." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(17, 27, 24)");
  await expect(page.locator("h1")).toHaveCSS("color", "rgb(225, 236, 229)");
  await page.screenshot({
    path: `/tmp/qist-${testInfo.project.name}-dark.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await navigate(page, "Customers");
  await page.getByRole("textbox", { name: "Search Customers" }).fill("Fatima");
  await expect(page.getByRole("cell", { name: "Fatima Noor" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Ahmed Khan" })).toHaveCount(0);
  expect(errors).toEqual([]);
  await navigate(page, "Dashboard");
  await page.screenshot({
    path: `/tmp/qist-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test("register customer, create exact plan, collect payment and view receipt", async ({
  page,
}) => {
  await page.goto("/");
  await navigate(page, "Customers");
  await page.getByRole("button", { name: "Add customer", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Test Customer");
  await dialog.getByLabel("Father’s name").fill("Test Father");
  await dialog.getByLabel("CNIC number").fill("12345-1234567-1");
  await dialog.getByLabel("Mobile number").fill("03001234567");
  await dialog.getByLabel("Complete address").fill("Peshawar");
  await dialog.getByRole("button", { name: "Register customer" }).click();
  await expect(page.getByRole("cell", { name: "Test Customer" })).toBeVisible();
  await page.getByRole("button", { name: "Add customer", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Duplicate");
  await dialog.getByLabel("Father’s name").fill("Test");
  await dialog.getByLabel("CNIC number").fill("12345-1234567-1");
  await dialog.getByLabel("Mobile number").fill("03001234567");
  await dialog.getByLabel("Complete address").fill("Peshawar");
  await dialog.getByRole("button", { name: "Register customer" }).click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "A customer with this CNIC already exists.",
  );
  await page.keyboard.press("Escape");
  await navigate(page, "Contracts");
  await page.getByRole("button", { name: "New contract" }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Customer", { exact: true })
    .selectOption({ label: "Test Customer" });
  await dialog.getByLabel("Cash price (PKR)").fill("100000");
  await dialog.getByLabel("Down payment (PKR)").fill("20000");
  await expect(dialog.getByText("PKR 9,000.00", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Create demo contract" }).click();
  await expect(page.getByRole("cell", { name: "Test Customer" })).toBeVisible();
  await navigate(page, "Receive Payment");
  await page
    .getByLabel("Customer / contract")
    .selectOption({ label: "Test Customer · CON-000007" });
  await page.getByLabel("Amount received (PKR)").fill("108001");
  await page.getByRole("button", { name: "Record payment" }).click();
  await expect(page.getByRole("alert")).toContainText("cannot exceed");
  await page.getByLabel("Amount received (PKR)").fill("9000");
  await page.getByRole("button", { name: "Record payment" }).click();
  await expect(page.getByText("PKR 99,000.00", { exact: true })).toBeVisible();
  await navigate(page, "Payment History");
  await page
    .getByRole("row")
    .filter({ hasText: "Test Customer" })
    .getByRole("button", { name: "Receipt", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("PKR 99,000.00", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A clearer view. A better business." }),
  ).toBeVisible();
  await navigate(page, "Payment History");
  await expect(page.getByRole("cell", { name: "Test Customer" })).toBeVisible();
});
