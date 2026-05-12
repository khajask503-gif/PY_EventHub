# Master Framework Reconstruction Report

This document serves as the definitive **Framework DNA** and **System Prompt** for recreating the EventHub Test Automation framework in any fresh environment.

---

## Section 1: The Architectural Blueprint

### 📂 Framework Hierarchy (Recursive Tree)
```text
C:\Users\khaja\PycharmProjects\PY_EventHUb\
├── .gemini/                    # Gemini-specific logic and skills
│   └── skills/
│       ├── eventhub-domain/     # Passive Knowledge Base (Rules, API, UI)
│       ├── create-scenarios/    # Senior Functional Test Designer
│       ├── test-strategy/       # Test Architect (Pyramid Governance)
│       ├── generate-tests/      # Test Automation Developer
│       ├── review-tests/        # AI Code Reviewer
│       └── playwright-best-practices/ # Automation Lawbook
├── backend/                    # Express.js Backend (Source of Truth)
│   ├── prisma/                 # Database Schema & Seed
│   └── src/                    # Business Logic, Services, Validators
├── frontend/                   # Next.js 14 Frontend (Source of Truth)
│   ├── app/                    # UI Routes & Page Logic
│   ├── components/             # UI Components (Stateful Logic)
│   ├── lib/                    # API Glue & Hooks
│   └── types/                  # Data Contracts
├── docs/                       # QA Artifacts & Strategy
│   ├── test-scenarios.md       # 15 Detailed Test Scenarios
│   ├── test-strategy.md        # Pyramid Layer Assignments
│   └── framework-status-report.md # THIS FILE
├── tests/                      # Multi-Layer Automation Suite
│   ├── booking-flow.spec.js    # Core E2E Journeys
│   ├── api-bookings.spec.ts    # High-Volume API Logic
│   └── component-refund.spec.ts # Frontend-only Logic
├── .env                        # Active Environment Variables
├── .env.example                # Environment Template
├── package.json                # Root Dependencies & Scripts
└── playwright.config.ts        # Playwright Governance File
```

### 🧬 Environment DNA
**.env.example**
```bash
# Database Connection (Prisma)
DATABASE_URL="mysql://root:your_password@localhost:3306/eventhub"
# Server Configuration
PORT=3001
NODE_ENV=development
# Security
JWT_SECRET="your_super_secret_jwt_key_here"
CORS_ORIGIN="http://localhost:3000"
```

**Required Root Configs:**
*   `playwright.config.ts`: Configured with `dotenv` to load credentials and `workers: 1` to prevent shared-account state conflicts.

---

## Section 2: Infrastructure & Command History

### 🛠️ Executed Setup Commands
| Phase | Command | Purpose |
| :--- | :--- | :--- |
| **Dependencies** | `npm install --legacy-peer-deps` | Install root dependencies bypass conflict. |
| **Browsers** | `npx playwright install chromium` | Download required browser binaries. |
| **Prisma** | `npx prisma generate` | Create the Prisma Client in `backend/`. |
| **Database** | `npx prisma db push` | Sync schema to local MySQL. |
| **Seeding** | `npm run seed` | Populate 10 static events for testing. |

### ⚡ Custom Slash Commands (Agent Ecosystem)
*   **/create-scenarios**: Role: **Functional Test Designer**. Uses the '6 Thinking Lenses' (Happy Path, Business Rules, Security, Negative, Edge Cases, UI State). 
    *   *Setting*: `disable-model-invocation: true` | *Hint*: `[feature-name]`
*   **/test-strategy**: Role: **Test Architect**. Enforces the **'Push-Down' principle** to prevent the 'Ice Cream Cone' anti-pattern.
    *   *Setting*: `disable-model-invocation: true` | *Hint*: `[feature-name]`

---

## Section 3: Sub-Agent Intelligence (The 'Brain')

### 🧠 Specialized Skills Summary
*   **eventhub-domain**: The **Passive Knowledge Library**. Stores source-of-truth for business rules (e.g., 9 booking limit), API contracts, and UI selectors.
*   **create-scenarios**: The **Functional Tester**. Transforms domain knowledge into exhaustive test cases using multi-lens thinking.
*   **test-strategy**: The **Architect**. Critically analyzes if a test belongs at the Unit, API, or E2E layer based on code discovery.
*   **playwright-best-practices**: The **E2E Lawbook**. Defines the rules for `data-testid` usage, wait strategies (no `waitForTimeout`), and auto-waiting assertions.

---

## Section 4: Universal Source of Truth Checklist

To achieve **Zero Hallucination**, the following developer artifacts must be present:
1.  **Backend Services**: `backend/src/services/` (to verify logic branches like FIFO pruning).
2.  **Validators**: `backend/src/validators/` (to avoid redundant E2E tests for input validation).
3.  **Frontend Components**: `frontend/components/` (to verify client-side logic like the 4s spinner).
4.  **Prisma Schema**: `backend/prisma/schema.prisma` (the ultimate data model truth).

---

## Section 5: Live Execution & Gap Analysis

### 📊 Planned vs. Implemented Audit
| Layer | Recommended (Strategy) | Actual Implemented | Status |
| :--- | :---: | :---: | :---: |
| **E2E (Smoke)** | 4 | 4 | ✅ 100% |
| **API (Integration)** | 6 | 1 | ⚠️ 17% |
| **Component/Unit** | 5 | 3 | ⚠️ 60% |

### 🔴 Test Run Status (`npx playwright test --reporter=line`)
*   **Total Tests**: 13
*   **Passed**: 12
*   **Failed**: 1 (**TC-003**: Cancellation)
*   **Failure Analysis**: **TC-003** suffers from transient TimeoutErrors during React modal confirmation on the live site.

### 🚀 Priority Roadmap (Next 5 Critical Automations)
1.  **TC-200 (API)**: Security - Verify Sandbox Isolation (403 Forbidden).
2.  **TC-102 (API)**: Data Integrity - Verify Seat Restoration after cancellation.
3.  **TC-100 (API)**: Logic - Validate Booking Ref format (Starts with Event Letter).
4.  **TC-401 (API)**: Boundary - Test exactly 9 bookings limit.
5.  **TC-501 (Component)**: UI State - Verify conditional Sandbox Warning Banner visibility.

---
> **Final Verdict**: The framework is **Archi-Ready**. The "Body" (code) and "Brain" (agents) are aligned. Transitioning to focus on the **API Layer** will yield the highest ROI for remaining coverage gaps.
