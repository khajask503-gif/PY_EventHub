import { test, expect } from '@playwright/test';

/**
 * API Integration tests for Booking Management.
 * Focuses on business rules, security, and high-volume data handling.
 * 
 * Scenario:
 * - TC-101: FIFO Pruning (Limit 9)
 */

const API_URL = 'https://api.eventhub.rahulshettyacademy.com/api';
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

test.describe('Booking API — Business Rules & Limits', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate and get JWT token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: USER_EMAIL, password: USER_PASSWORD }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const body = await loginResponse.json();
    token = body.token;
  });

  test('TC-101: verify FIFO pruning (max 9 bookings per user)', async ({ request }) => {
    // 1. Clear all existing bookings via API to ensure a clean state
    await request.delete(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Create 9 bookings for Event ID 1 (World Tech Summit)
    const bookingIds: string[] = [];
    for (let i = 1; i <= 9; i++) {
      const response = await request.post(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          eventId: 1,
          customerName: `Test User ${i}`,
          customerEmail: `test${i}@example.com`,
          customerPhone: '9876543210',
          quantity: 1
        }
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      bookingIds.push(body.data.id);
    }

    const firstBookingId = bookingIds[0];

    // 3. Create the 10th booking
    const tenthResponse = await request.post(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        eventId: 1,
        customerName: 'Tenth User',
        customerEmail: 'tenth@example.com',
        customerPhone: '9876543210',
        quantity: 1
      }
    });
    expect(tenthResponse.ok()).toBeTruthy();

    // 4. Verify the 10th booking exists and the 1st booking was pruned
    const listResponse = await request.get(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listBody = await listResponse.json();
    const bookings = listBody.data;

    expect(bookings).toHaveLength(9); // Total must stay at 9
    expect(bookings.find(b => b.id === firstBookingId)).toBeUndefined(); // First one is pruned
    expect(bookings.find(b => b.customerName === 'Tenth User')).toBeDefined(); // Tenth one exists
  });
});
