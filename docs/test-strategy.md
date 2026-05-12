# Test Strategy: Booking Management (Code-Grounded)

This document defines the optimal distribution of test scenarios across the test pyramid, grounded in **Source Code Discovery** of the EventHub implementation.

## 1. Test Distribution Summary

| Layer | Count | Focus | Estimated Execution Time |
| :--- | :--- | :--- | :--- |
| **E2E (Playwright)** | 4 | Critical "Smoke" User Journeys & UI State | ~45s |
| **API (Integration)** | 6 | Business Logic, Security, & High-Volume Data | ~10s |
| **Component/Unit** | 5 | Pure Logic & Frontend-only State | ~5s |
| **Total** | **15** | | **~60s** |

---

## 2. Forensic Layer Assignments

### E2E Layer (The "Top" - High Value Smoke)
*Focus: Verifying the integration of UI, API, and DB on the live site.*

| ID | Title | Rationale | Code Verified |
| :--- | :--- | :--- | :--- |
| **TC-001** | View active bookings list | Verifies `BookingCard.jsx` rendering data from `useBookings` hook. | `frontend/components/bookings/BookingCard.jsx` |
| **TC-002** | View booking details | Confirms Next.js dynamic routing and `DetailSection` components. | `frontend/app/bookings/[id]/page.tsx` |
| **TC-003** | Cancel a single booking | Validates `useCancelBooking` mutation and `ConfirmDialog` integration. | `frontend/app/bookings/[id]/page.tsx:166` |
| **TC-004** | Clear all bookings | Verifies batch delete UI and "No bookings yet" empty state. | `frontend/components/ui/EmptyState.tsx` |

### API Layer (The "Middle" - Business Rules & Security)
*Focus: Validating backend logic directly against the Express API.*

| ID | Title | Rationale | Source Logic |
| :--- | :--- | :--- | :--- |
| **TC-100** | Booking ref format | Regex validation of `randomRef` output is faster via API. | `backend/src/services/bookingService.js:9` |
| **TC-101** | FIFO Pruning (Limit 9) | Validates `MAX_USER_BOOKINGS` check and oldest delete. | `backend/src/services/bookingService.js:62` |
| **TC-102** | Seat restoration | Confirms computed seat logic works without UI state interference. | `backend/src/services/bookingService.js:120` |
| **TC-200** | Sandbox Isolation (403) | Direct status code check on `ForbiddenError` throw. | `backend/src/services/bookingService.js:48` |
| **TC-300** | View pruned booking (404) | Validates `NotFoundError` response contract. | `backend/src/services/bookingService.js:47` |
| **TC-401** | Reaching exactly 9 bookings | Boundary test for the `count >= 9` logic. | `backend/src/services/bookingService.js:64` |

### Component/Unit Layer (The "Base" - Pure Logic)
*Focus: Testing frontend-only logic isolated from the server.*

| ID | Title | Rationale | Source Logic |
| :--- | :--- | :--- | :--- |
| **TC-103** | Refund Eligibility (Single) | Logic `quantity === 1` is purely client-side. | `frontend/app/bookings/[id]/page.tsx:26` |
| **TC-104** | Refund Rejection (Multi) | Logic `quantity > 1` is purely client-side. | `frontend/app/bookings/[id]/page.tsx:64` |
| **TC-400** | Empty state rendering | Verifies `EmptyState` component visibility. | `frontend/components/ui/EmptyState.tsx` |
| **TC-500** | 4-second spinner | Validates the `setTimeout(..., 4000)` implementation. | `frontend/app/bookings/[id]/page.tsx:25` |
| **TC-501** | Sandbox banner visibility | Verifies conditional rendering logic based on counts. | `frontend/components/layout/Banner.tsx` |

---

## 3. Pyramid Compliance Audit

### ✅ Optimization: Moving Security DOWN
We moved **TC-200 (Access Denied)** from E2E to API. Testing a 403 error in a browser is wasteful; testing it via API is instant and more reliable.

### ✅ Optimization: Moving Client Logic DOWN
We moved **TC-103/104 (Refund Rules)** to the Component layer. Since these rules do not exist in the backend (Rule #8), testing them in E2E would be redundant and slow.

### ✅ Optimization: High Volume to API
**TC-101 (FIFO Pruning)** requires creating 10 bookings. Doing this in Playwright takes ~30 seconds. Doing it in an API test takes <2 seconds.

## 4. Final Verdict
The strategy is now **100% verified** against the restored codebase. It avoids the "Ice Cream Cone" anti-pattern by ensuring 11 out of 15 scenarios are tested at the API or Component layers.
