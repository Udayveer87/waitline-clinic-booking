// Runs axe-core against every page. Any "serious" or "critical" violation
// fails the test — and with this wired into CI, fails the build. This is
// what backs the "automatic accessibility check in CI" claim: it isn't a
// one-time manual check, it runs on every push.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function assertNoSeriousViolations(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test('slot list page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.getByRole('heading', { name: /available appointment slots/i })).toBeVisible();
  await assertNoSeriousViolations(page);
});

test('my bookings page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/my-bookings.html');
  await expect(page.getByRole('heading', { name: /my bookings/i })).toBeVisible();
  await assertNoSeriousViolations(page);
});

test('skip link lets keyboard users jump straight to the page content', async ({ page }) => {
  await page.goto('/index.html');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeVisible();
});

test('every form input on the booking page has an accessible label', async ({ page }) => {
  await page.goto('/book.html?slotId=1');
  await expect(page.getByLabel(/full name/i)).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await assertNoSeriousViolations(page);
});
