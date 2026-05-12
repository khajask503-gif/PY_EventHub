import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Booking Management flow.
 * These tests follow the Test Strategy defined in docs/test-strategy.md
 * 
 * Scenarios Covered:
 * - TC-001: View active bookings list
 * - TC-002: View detailed booking information
 * - TC-003: Successfully cancel a single booking
 * - TC-004: Clear all bookings
 */

const BASE_URL      = 'https://eventhub.rahulshettyacademy.com';
const USER_EMAIL    = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

if (!USER_EMAIL || !USER_PASSWORD) {
  throw new Error('USER_EMAIL and USER_PASSWORD must be set in .env file (local) or as GitHub Secrets (CI)');
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  
  await page.getByPlaceholder('you@email.com').fill(USER_EMAIL);
  await page.getByLabel('Password').fill(USER_PASSWORD);
  
  await Promise.all([
    page.waitForURL(`${BASE_URL}/`),
    page.getByRole('button', { name: 'Sign In' }).click()
  ]);

  await expect(page.getByRole('heading', { name: /Discover & Book/i })).toBeVisible({ timeout: 15000 });
}

async function bookEvent(page) {
  await page.goto(`${BASE_URL}/events`);
  
  const bookNowBtn = page.getByRole('link', { name: 'Book Now' }).first();
  await expect(bookNowBtn).toBeVisible();
  
  const eventCard = page.locator('article').filter({ has: bookNowBtn });
  const eventTitle = (await eventCard.locator('h3').first().textContent())?.trim() ?? '';
  console.log(`Booking event: "${eventTitle}"`);
  
  await bookNowBtn.click();
  await expect(page).toHaveURL(/\/events\/\d+/);

  await page.getByLabel('Full Name').fill('Automation Tester');
  await page.locator('#customer-email').fill('tester@example.com');
  await page.getByPlaceholder('+91 98765 43210').fill('9876543210');
  
  const confirmBtn = page.locator('#confirm-booking');
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();

  const refEl = page.locator('.booking-ref').first();
  await expect(refEl).toBeVisible({ timeout: 20000 });
  const bookingRef = (await refEl.textContent())?.trim() ?? '';
  console.log(`Booking confirmed. Ref: ${bookingRef}`);
  
  return { bookingRef, eventTitle };
}

async function ensureAtLeastOneBooking(page) {
  await page.goto(`${BASE_URL}/bookings`);
  
  const noBookingsMsg = page.getByText('No bookings yet');
  
  await Promise.race([
    page.getByTestId('booking-card').first().waitFor({ state: 'visible' }).catch(() => {}),
    noBookingsMsg.waitFor({ state: 'visible' }).catch(() => {})
  ]);

  if (await noBookingsMsg.isVisible()) {
    console.log('No bookings found, creating one...');
    return await bookEvent(page);
  } else {
    const firstCard = page.getByTestId('booking-card').first();
    const eventTitle = (await firstCard.locator('h3').textContent())?.trim() ?? '';
    const bookingRef = (await firstCard.locator('.booking-ref').textContent())?.trim() ?? '';
    console.log(`Existing booking found: ${bookingRef}`);
    return { bookingRef, eventTitle };
  }
}

// ── Test Suite ─────────────────────────────────────────────────────────────────

test.describe('Booking Flow — Core E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-001: displays booking card on bookings list page', async ({ page }) => {
    const { bookingRef, eventTitle } = await ensureAtLeastOneBooking(page);
    await page.goto(`${BASE_URL}/bookings`);
    
    const card = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(card).toBeVisible();
    await expect(card).toContainText(eventTitle);
    await expect(card).toContainText(bookingRef);
  });

  test('TC-002: shows all sections on booking detail page', async ({ page }) => {
    const { bookingRef } = await ensureAtLeastOneBooking(page);
    await page.goto(`${BASE_URL}/bookings`);
    const card = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await card.getByRole('link', { name: 'View Details' }).click();
    
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    await expect(page.locator('span.font-mono.font-bold').first()).toContainText(bookingRef);
    await expect(page.getByText('Event Details')).toBeVisible();
    await expect(page.getByText('Customer Details')).toBeVisible();
    await expect(page.getByText('Payment Summary')).toBeVisible();
    await expect(page.getByTestId('check-refund-btn')).toBeVisible();
  });

  test('TC-003: successfully cancel a single booking', async ({ page }) => {
    const { bookingRef } = await bookEvent(page); 

    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    await page.goto(`${BASE_URL}/bookings`);
    const card = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(card).toBeVisible();
    await card.getByRole('link', { name: 'View Details' }).click();
    
    await expect(page.locator('span.font-mono.font-bold').first()).toContainText(bookingRef);

    const cancelBtn = page.getByTestId('cancel-booking-btn').first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click({ force: true });
    
    const confirmBtn = page.getByTestId('confirm-dialog-yes');
    await expect(confirmBtn).toBeVisible({ timeout: 15000 });
    
    // Perform confirmation and wait for navigation back to list
    await confirmBtn.click({ force: true });
    
    // Use a more resilient wait for navigation back to bookings list
    await expect(page).toHaveURL(/.*\/bookings/, { timeout: 20000 });
    
    const deletedCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(deletedCard).not.toBeVisible({ timeout: 10000 });
  });

  test('TC-004: successfully clear all bookings', async ({ page }) => {
    await ensureAtLeastOneBooking(page);
    await page.goto(`${BASE_URL}/bookings`);
    
    const clearBtn = page.getByRole('button', { name: /clear all bookings/i });
    await expect(clearBtn).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await clearBtn.click();

    await expect(page.getByText('No bookings yet')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('main').getByRole('link', { name: 'Browse Events' })).toBeVisible();
  });

});
