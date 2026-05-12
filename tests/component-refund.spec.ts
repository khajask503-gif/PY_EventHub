import { test, expect } from '@playwright/test';

/**
 * Component-level E2E tests for Frontend-only logic.
 * 
 * Scenarios:
 * - TC-500: 4-second spinner animation for refund check
 * - TC-103: Refund eligibility for single-ticket bookings
 * - TC-104: Refund rejection for multi-ticket bookings
 */

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

test.describe('Booking Detail — Component Logic', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@email.com').fill(USER_EMAIL!);
    await page.getByLabel('Password').fill(USER_PASSWORD!);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('TC-500 & TC-103: verify 4s spinner and single-ticket refund eligibility', async ({ page }) => {
    // 1. Create a single-ticket booking
    await page.goto(`${BASE_URL}/events/1`); // World Tech Summit
    await page.getByLabel('Full Name').fill('Component Tester');
    await page.locator('#customer-email').fill('comp@example.com');
    await page.getByPlaceholder('+91 98765 43210').fill('9876543210');
    // Ensure quantity is 1
    const ticketCount = await page.locator('#ticket-count').textContent();
    if (ticketCount !== '1') {
      await page.getByRole('button', { name: '−' }).click();
    }
    await page.locator('#confirm-booking').click();
    await page.getByRole('link', { name: 'View My Bookings' }).click();
    await page.getByTestId('booking-card').first().getByRole('link', { name: 'View Details' }).click();

    // 2. Trigger Refund Check
    const checkBtn = page.getByTestId('check-refund-btn');
    await expect(checkBtn).toBeVisible();
    
    const startTime = Date.now();
    await checkBtn.click();

    // 3. Verify Spinner visibility immediately
    await expect(page.getByTestId('refund-spinner')).toBeVisible();
    
    // 4. Verify Result visibility after 4 seconds
    await expect(page.getByTestId('refund-result')).toBeVisible({ timeout: 10000 });
    const duration = Date.now() - startTime;
    
    expect(duration).toBeGreaterThan(3500); // Verify it waited approx 4s
    await expect(page.getByText('Eligible for refund')).toBeVisible();
  });

  test('TC-104: verify multi-ticket refund rejection', async ({ page }) => {
    // 1. Create a multi-ticket booking (quantity = 2)
    await page.goto(`${BASE_URL}/events/1`);
    await page.getByLabel('Full Name').fill('Component Tester');
    await page.locator('#customer-email').fill('comp@example.com');
    await page.getByPlaceholder('+91 98765 43210').fill('9876543210');
    
    // Increase quantity to 2
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.locator('#ticket-count')).toHaveText('2');
    
    await page.locator('#confirm-booking').click();
    await page.getByRole('link', { name: 'View My Bookings' }).click();
    await page.getByTestId('booking-card').first().getByRole('link', { name: 'View Details' }).click();

    // 2. Trigger Refund Check
    await page.getByTestId('check-refund-btn').click();

    // 3. Verify Ineligible result
    await expect(page.getByTestId('refund-result')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Not eligible for refund')).toBeVisible();
    await expect(page.getByText('Group bookings (2 tickets) are non-refundable')).toBeVisible();
  });
});
