# Backend API & Flow Documentation

## 1. Service Overview

- Runtime stack: NestJS + Fastify.
- Global API prefix: `/api`.
- URI versioning: default version `v1`.
- Effective base URL: `/api/v1`.
- API docs (non-production): `/api/docs`.
- Server startup runs database migrations automatically from `migrations/`.

## 2. Global API Conventions

### 2.1 Authentication

- Auth scheme: `Authorization: Bearer <jwt>`.
- JWT payload fields: `sub`, `role`, `language`, `phone`, `isActive`.
- Role model:
  - `ADMIN`
  - `AGENT`
  - `CLIENT`

### 2.2 Validation, Serialization, i18n

- All request inputs use `nestjs-zod` DTOs.
- Responses are filtered/serialized by `ZodSerializerInterceptor` when response DTO is declared.
- Validation errors are localized using `accept-language` (`en` and `fr`, fallback `en`).
- Business/domain errors are localized via `I18nService`.

### 2.3 Money & Currency

- Operational currency: `USD` only.
- API request money fields: major-unit string (e.g. `"100"`, `"100.5"`, `"100.50"` depending on endpoint regex).
- API response money fields: normalized major-unit string with 2 decimals (e.g. `"100.50"`).
- Persistence: integer minor units (cents).

### 2.4 Date/Time Formats

- Date-only: `YYYY-MM-DD`.
- Month label: `YYYY-MM`.
- Datetime: ISO-8601 string.

### 2.5 Rate Limiting and Metrics

- Global throttling is enabled (`AppRateLimitGuard`).
- Health and metrics endpoints are excluded from throttling.
- HTTP metrics exposed at `/api/v1/metrics` in Prometheus format.

---

## 3. Auth & Access Model

- `JwtAuthGuard` validates Bearer tokens for protected endpoints.
- `RolesGuard` enforces role-based access where `@Roles(...)` is applied.
- `@GetUser()` is the canonical way controllers read authenticated principal.

---

## 4. Endpoint Catalog by Module

## 4.1 Root App Module

### `GET /api/v1`

- Auth: none
- Request: none
- Response:
  - `string` (`"Hello World!"`)
- Side effects: none

## 4.2 Auth Module (`/auth`)

### `POST /api/v1/auth/first-login/start`

- Auth: none
- Status: `202`
- Request body:
  - `phone` (string, min 7 max 32)
- Response:
  - `success` (`true`)
  - `message` (localized)
  - `developmentOtp` (optional, local OTP mode)
- Side effects:
  - Creates OTP session (`FIRST_LOGIN`)
  - Enqueues OTP SMS notification (or stores local OTP hash)

### `POST /api/v1/auth/first-login/verify`

- Auth: none
- Request body:
  - `phone`
  - `code` (6 chars)
- Response:
  - `otpSessionId` (uuid)
- Side effects:
  - Marks OTP session `VERIFIED`

### `POST /api/v1/auth/first-login/set-password`

- Auth: none
- Request body:
  - `phone`
  - `otpSessionId`
  - `password` (8..128)
- Response:
  - `accessToken`
  - `expiresInSeconds`
  - `tokenType` (`Bearer`)
  - `user` (`id`, `fullNames`, `phone`, `role`, `language`, `firstLoginCompleted`)
- Side effects:
  - Consumes verified OTP session
  - Sets user password hash and first-login-completed

### `POST /api/v1/auth/login/password`

- Auth: none
- Request body:
  - `phone`
  - `password`
- Response: same token payload as above
- Side effects: none

### `POST /api/v1/auth/login/otp/start`

- Auth: none
- Status: `202`
- Request body:
  - `phone`
- Response:
  - `success`
  - `message`
  - `developmentOtp` (optional)
- Side effects:
  - Creates OTP session (`LOGIN`)
  - Enqueues OTP SMS

### `POST /api/v1/auth/login/otp/verify`

- Auth: none
- Request body:
  - `phone`
  - `code`
- Response: auth token payload
- Side effects:
  - Marks OTP verified and consumes it

### `POST /api/v1/auth/password/forgot/start`

- Auth: none
- Status: `202`
- Request body:
  - `phone`
- Response:
  - `success`
  - `message`
  - `developmentOtp` (optional)
- Side effects:
  - Creates OTP session (`FORGOT_PASSWORD`)
  - Enqueues OTP SMS

### `POST /api/v1/auth/password/forgot/verify`

- Auth: none
- Request body:
  - `phone`
  - `code`
- Response:
  - `otpSessionId`
- Side effects:
  - Marks OTP session verified

### `POST /api/v1/auth/password/forgot/reset`

- Auth: none
- Request body:
  - `phone`
  - `otpSessionId`
  - `password`
- Response:
  - `success`
  - `message`
- Side effects:
  - Consumes OTP session
  - Updates password

### `POST /api/v1/auth/password/change/start`

- Auth: JWT (`ADMIN|AGENT|CLIENT` token accepted), payload must match body phone
- Status: `202`
- Request body:
  - `phone`
- Response:
  - `success`
  - `message`
  - `developmentOtp` (optional)
- Side effects:
  - Creates OTP session (`CHANGE_PASSWORD`)
  - Enqueues OTP SMS

### `POST /api/v1/auth/password/change`

- Auth: JWT
- Request body:
  - `otpSessionId`
  - `oldPassword`
  - `newPassword`
- Response:
  - `success`
  - `message`
- Side effects:
  - Verifies old password
  - Consumes OTP session
  - Updates password

### `POST /api/v1/auth/push-token`

- Auth: JWT
- Request body:
  - `expoPushToken`
- Response:
  - `success`
  - `message`
- Side effects:
  - Upserts user push token in `user_push_tokens`

## 4.3 App Users Module

## `GET /api/v1/me`

- Auth: JWT + roles `AGENT|CLIENT`
- Request: none
- Response:
  - `user`: core profile fields
  - `profile`: union
    - CLIENT profile: `clientId`, `address`, `registeredDate`, `subscriptionAmount`, `clientType`
    - AGENT profile: `agentId`, `currentMonthCollected`, `totalAmountCollected`, `collectionsCount`, `uniqueClientsCollectedFrom`
- Side effects: none

## `PATCH /api/v1/me`

- Auth: JWT + roles `AGENT|CLIENT`
- Request body:
  - `fullNames?`
  - `phone?`
  - `otpSessionId?` (required when phone changes)
- Response: same as `GET /me`
- Side effects:
  - Optional name update
  - Optional phone update with consumed `CHANGE_PHONE` OTP session

## `POST /api/v1/me/phone-change/start`

- Auth: JWT + roles `AGENT|CLIENT`
- Status: `200`
- Request body:
  - `phone`
- Response:
  - `success`
  - `message`
  - `developmentOtp` (optional)
- Side effects:
  - Creates `CHANGE_PHONE` OTP session
  - Enqueues OTP SMS

## `POST /api/v1/me/phone-change/verify`

- Auth: JWT + roles `AGENT|CLIENT`
- Request body:
  - `phone`
  - `code`
- Response:
  - `otpSessionId`
- Side effects:
  - Marks `CHANGE_PHONE` OTP verified

## 4.4 App Clients Module (`AGENT`)

### `GET /api/v1/clients`

- Auth: JWT + role `AGENT`
- Query:
  - `skip` (default 0)
  - `limit` (default 20, max 100)
  - `search?`
  - `status?` (`PENDING|PAID`)
- Response:
  - page object: `data`, `total`, `skip`, `limit`
  - item fields: `clientId`, `fullNames`, `phone`, `address`, `clientType`, `registeredDate`, `subscriptionAmount`, `dueMonths`, `totalDue`, `status`
- Side effects: none

### `GET /api/v1/clients/:clientId`

- Auth: JWT + role `AGENT`
- Params:
  - `clientId` (uuid)
- Query:
  - `dueOnly?` (boolean)
- Response:
  - `clientId`, `fullNames`, `phone`, `address`, `clientType`, `registeredDate`, `subscriptionAmount`
  - `duePayments[]` (`month`, `amount`, `dueDate`, `daysPassedSinceDue`)
  - `daysSinceFirstDueDate`, `totalDue`, `dueOnly`
- Side effects: none

### `GET /api/v1/clients/:clientId/payments`

- Auth: JWT + role `AGENT`
- Params:
  - `clientId`
- Query:
  - `skip`, `limit`, `search?`
- Response:
  - page with confirmed payments including `paymentId`, `amount`, `months`, `paymentDate`, `createdAt`, `receiptId`, `receiptNumber`, `setByAdmin`, `agentId`, `agentName`
- Side effects: none

### `POST /api/v1/clients/:clientId/payments`

- Auth: JWT + role `AGENT`
- Params:
  - `clientId`
- Request body:
  - `months[]` (`YYYY-MM`)
  - `amount` (major-unit string)
- Response (`PaymentResponseDto`):
  - `paymentId`
  - `receiptId` (`null` initially)
  - `receiptNumber` (`null` initially)
  - `receiptStatus` (`PENDING|READY`) (returns `PENDING` immediately)
  - `amount`
  - `months`
  - `paymentDate`
- Side effects:
  - Inserts confirmed payment with `agentId`
  - Enqueues receipt generation job (`receipts` queue)

## 4.5 Payments Module

### `GET /api/v1/payments/agent/pending`

- Auth: JWT + role `AGENT`
- Query:
  - `skip`, `limit`, `search?`
- Response:
  - pending client page with `clientId`, `clientName`, `clientPhone`, `overdueMonths`, `overdueCount`, `totalAmountDue`
- Side effects: none

### `GET /api/v1/payments/agent/client/:clientId/unpaid-months`

- Auth: JWT + role `AGENT`
- Params:
  - `clientId`
- Response:
  - `clientId`, `months[]`, `suggestedAmount`
- Side effects: none

### `POST /api/v1/payments/agent/confirm`

- Auth: JWT + role `AGENT`
- Request body:
  - `clientId`
  - `months[]`
  - `amount`
- Response: `PaymentResponseDto`
- Side effects:
  - Creates confirmed payment
  - Enqueues receipt generation job

### `GET /api/v1/payments/mine`

- Auth: JWT (`AGENT|CLIENT|ADMIN` accepted by guard)
- Query:
  - `skip`, `limit`, `search?`
- Response:
  - For `CLIENT`: timeline from app-users service, includes both `CONFIRMED` and synthetic `DUE` entries.
  - For `AGENT`/`ADMIN`: paginated confirmed payment list with receipt fields.
- Side effects: none

### `GET /api/v1/payments/:paymentId`

- Auth: JWT + roles `AGENT|CLIENT`
- Params:
  - `paymentId`
- Response:
  - payment detail including `paymentId`, `clientId`, `amount`, `months`, `status`, `paymentDate`, `createdAt`, `receiptId`, `receiptNumber`, `setByAdmin`, `agentId`, `agentName`
- Side effects: none

### `GET /api/v1/payments/receipts/:receiptId/download`

- Auth: JWT (`ADMIN|AGENT|CLIENT` with ownership checks in service)
- Params:
  - `receiptId`
- Response:
  - PDF file bytes (`Content-Type` from stored receipt, attachment filename `<receiptNumber>.pdf`)
- Side effects: none

## 4.6 Public Receipts Module

### `GET /api/v1/public/receipts/:receiptId/verify`

- Auth: none
- Params:
  - `receiptId`
- Response:
  - `valid` (boolean)
  - `receiptId` (nullable)
  - `receiptNumber` (nullable)
  - `paymentId` (nullable)
- Side effects: none

## 4.7 Admin Module

All endpoints below require: JWT + role `ADMIN`.

### User management

#### `POST /api/v1/admin/users/admins`

- Status: `201`
- Request body: `fullNames`, `phone`, `language`
- Response: `UserSummaryDto`
- Side effects:
  - Creates `users` + `admins` rows

#### `POST /api/v1/admin/users/agents`

- Status: `201`
- Request body: `fullNames`, `phone`, `language`
- Response: `UserSummaryDto`
- Side effects:
  - Creates `users` + `agents` rows

#### `POST /api/v1/admin/users/clients`

- Status: `201`
- Request body:
  - `fullNames`, `phone`, `address`, `language`, `type`, `subscriptionAmount`, `registeredDate?`
- Response: `UserSummaryDto`
- Side effects:
  - Creates `users` + `clients` rows

#### `POST /api/v1/admin/agents/deactivate`

- Request body: `userId`
- Response: `{ success: true }`
- Side effects:
  - Deactivates agent user

### Client admin-read and status

#### `GET /api/v1/admin/clients`

- Query supports filters and sorting:
  - `skip`, `limit`, `search?`, `isActive?`, `type?`, `hasDue?`, `minDueMonths?`, `maxDueMonths?`, `registeredDateFrom?`, `registeredDateTo?`, `createdAtFrom?`, `createdAtTo?`, `sortBy`, `sortDir`
- Response: `AdminClientsPageDto`
- Side effects: none

#### `GET /api/v1/admin/clients/:clientId`

- Response: `AdminClientDetailDto`
- Side effects: none

#### `PATCH /api/v1/admin/clients/:clientId/status`

- Request body: `isActive`
- Response: `{ success: true }`
- Side effects:
  - Updates user active/deactivated fields

#### `GET /api/v1/admin/clients/:clientId/payments`

- Query:
  - `skip`, `limit`, `search?`, `month?`, `dateFrom?`, `dateTo?`, `status?`, `sortDir`
- Response: `AdminClientPaymentTimelinePageDto` (confirmed + due timeline)
- Side effects: none

#### `POST /api/v1/admin/clients/:clientId/payments/mark-complete`

- Status: `201`
- Request body: `months[]`
- Response: `PaymentResponseDto`
- Side effects:
  - Inserts admin-confirmed payment (`setByAdmin=true`, `agentId=null`)
  - Enqueues receipt generation job

### Agent admin-read and status

#### `GET /api/v1/admin/agents`

- Query:
  - `skip`, `limit`, `search?`, `isActive?`, `createdAtFrom?`, `createdAtTo?`, `minCurrentMonthCollected?`, `maxCurrentMonthCollected?`, `sortBy`, `sortDir`
- Response: `AdminAgentsPageDto`
- Side effects: none

#### `GET /api/v1/admin/agents/:agentId`

- Response: `AdminAgentDetailDto`
- Side effects: none

#### `PATCH /api/v1/admin/agents/:agentId/status`

- Request body: `isActive`
- Response: `{ success: true }`
- Side effects:
  - Updates agent user active/deactivated fields

### Payments reports

#### `GET /api/v1/admin/payments`

- Query:
  - `skip`, `limit`, `search?`, `clientId?`, `agentId?`, `setByAdmin?`, `month?`, `dateFrom?`, `dateTo?`, `amountMin?`, `amountMax?`, `receiptReady?`, `sortBy`, `sortDir`
- Response: `AdminPaymentsPageDto`
- Side effects: none

#### `GET /api/v1/admin/payments/:paymentId`

- Response: `AdminPaymentDetailDto`
- Side effects: none

### Dashboard

#### `GET /api/v1/admin/dashboard`

- Query:
  - `year?` (2000..2100)
  - `topAgentsLimit` (default 10)
- Response: `DashboardResponseDto`
  - `timezone`, `year`
  - KPI blocks
  - `graphs.revenuePerMonth[]`
  - `tables.topAgents[]`
- Side effects: none

## 4.8 Imports Module (`/admin/imports`)

All endpoints require JWT + role `ADMIN`.

### Template downloads

#### `GET /api/v1/admin/imports/templates/agents.csv`

- Response: CSV file template
- Side effects: none

#### `GET /api/v1/admin/imports/templates/agents.xlsx`

- Response: XLSX file template
- Side effects: none

#### `GET /api/v1/admin/imports/templates/clients.csv`

- Response: CSV file template
- Side effects: none

#### `GET /api/v1/admin/imports/templates/clients.xlsx`

- Response: XLSX file template
- Side effects: none

### Import endpoints

#### `POST /api/v1/admin/imports/agents`

- Status: `200`
- Content type: `multipart/form-data` (single file)
- Accepted file extensions: `.csv`, `.xlsx`
- Response: `ImportReportDto`
  - `totalRows`, `successCount`, `failedCount`, `failures[]`
- Side effects:
  - Creates agent users from rows via `AdminService`

#### `POST /api/v1/admin/imports/clients`

- Status: `200`
- Content type: `multipart/form-data` (single file)
- Accepted file extensions: `.csv`, `.xlsx`
- Response: `ImportReportDto`
- Side effects:
  - Creates client users from rows via `AdminService`

## 4.9 Billing Module

### `POST /api/v1/billing/run-daily`

- Auth: JWT + role `ADMIN`
- Status: `200`
- Request: none
- Response: `{ success: true }`
- Side effects:
  - Executes daily reminder logic immediately
  - Enqueues SMS and push notifications for due/overdue clients

## 4.10 Health Module

### `GET /api/v1/health`

- Auth: none
- Status:
  - `200` when service status is `up`
  - `503` when any required dependency is `down`
- Response (`HealthCheckResult`):
  - `status` (`up|down`)
  - `timestamp`
  - `checks.database` (`status`, `latencyMs`, `details?`)
  - `checks.s3` (`status`, `latencyMs`, `details?`)
- Side effects: none

## 4.11 Monitoring Module

### `GET /api/v1/metrics`

- Auth: none
- Response: Prometheus plaintext metrics
- Side effects: none

---

## 5. Flow Playbooks (Ordered API Usage)

## 5.1 First Login (password bootstrap)

1. `POST /auth/first-login/start`
- Input: `phone`
- Output: OTP sent confirmation.

2. `POST /auth/first-login/verify`
- Input: `phone`, `code`
- Output: `otpSessionId`.

3. `POST /auth/first-login/set-password`
- Input: `phone`, `otpSessionId`, `password`
- Output: JWT token payload.

## 5.2 Password Login

1. `POST /auth/login/password`
- Input: `phone`, `password`
- Output: JWT token payload.

## 5.3 OTP Login

1. `POST /auth/login/otp/start`
- Input: `phone`
- Output: OTP sent confirmation.

2. `POST /auth/login/otp/verify`
- Input: `phone`, `code`
- Output: JWT token payload.

## 5.4 Forgot Password

1. `POST /auth/password/forgot/start`
- Input: `phone`
- Output: OTP sent confirmation.

2. `POST /auth/password/forgot/verify`
- Input: `phone`, `code`
- Output: `otpSessionId`.

3. `POST /auth/password/forgot/reset`
- Input: `phone`, `otpSessionId`, `password`
- Output: success message.

## 5.5 Change Password (authenticated)

1. `POST /auth/password/change/start`
- Input: authenticated user + same `phone`
- Output: OTP sent confirmation.

2. `POST /auth/password/change`
- Input: `otpSessionId`, `oldPassword`, `newPassword`
- Output: success message.

## 5.6 Update Profile + Phone Change

1. Optional read baseline: `GET /me`.

2. Start phone change: `POST /me/phone-change/start`.

3. Verify phone OTP: `POST /me/phone-change/verify` -> `otpSessionId`.

4. Commit profile update: `PATCH /me` with `phone` + `otpSessionId` and/or `fullNames`.

5. Read updated profile: `GET /me`.

## 5.7 Agent Collection Flow

1. `GET /payments/agent/pending` to discover clients with debt.

2. Optional: `GET /payments/agent/client/:clientId/unpaid-months` for month list and amount suggestion.

3. Optional client context:
- `GET /clients/:clientId`
- `GET /clients/:clientId/payments`

4. Confirm payment:
- `POST /payments/agent/confirm` or `POST /clients/:clientId/payments`.
- Immediate response has `receiptStatus = PENDING` and `receiptId = null`.

5. Receipt generation occurs asynchronously in queue worker.

6. Later reads for receipt availability:
- `GET /payments/mine`
- `GET /clients/:clientId/payments`
- `GET /payments/:paymentId`

7. Download when receipt exists:
- `GET /payments/receipts/:receiptId/download`.

8. Public verification option:
- `GET /public/receipts/:receiptId/verify`.

## 5.8 Client Payment History Flow

1. `GET /payments/mine` (as client) returns timeline including `DUE` and `CONFIRMED` items.

2. For confirmed item detail: `GET /payments/:paymentId`.

3. If `receiptId` present: `GET /payments/receipts/:receiptId/download`.

4. External receipt authenticity check: `GET /public/receipts/:receiptId/verify`.

## 5.9 Admin User & Operations Flow

### Create accounts

1. `POST /admin/users/admins` or `/agents` or `/clients`.

2. New users complete first login via auth flow.

### Client lifecycle and collections

1. Browse/filter clients: `GET /admin/clients`.

2. Inspect one client: `GET /admin/clients/:clientId`.

3. Optional status update: `PATCH /admin/clients/:clientId/status`.

4. View timeline: `GET /admin/clients/:clientId/payments`.

5. Admin mark payment complete: `POST /admin/clients/:clientId/payments/mark-complete`.

6. Receipt generation completes asynchronously.

### Agent lifecycle

1. Browse/filter agents: `GET /admin/agents`.

2. Inspect one agent: `GET /admin/agents/:agentId`.

3. Activate/deactivate: `PATCH /admin/agents/:agentId/status` or legacy deactivate route.

### Reporting

1. List payments: `GET /admin/payments`.

2. Payment detail: `GET /admin/payments/:paymentId`.

3. Dashboard KPI/graphs/top-agents: `GET /admin/dashboard`.

## 5.10 Import Flow (Admin)

1. Download template:
- `/admin/imports/templates/agents.csv|xlsx`
- `/admin/imports/templates/clients.csv|xlsx`

2. Upload data file:
- `POST /admin/imports/agents` or `/clients` (multipart).

3. Read import report:
- inspect `successCount`, `failedCount`, and `failures[]` row-level reasons.

## 5.11 Billing Reminder Flow

1. Trigger sources:
- Scheduled job at `0 8 * * *` (daily)
- Manual admin endpoint `/billing/run-daily`

2. For each active client:
- compute unpaid months
- decide trigger type (`BILLING_REMINDER` pre-due or `OVERDUE_REMINDER` post-due cadence)

3. Enqueue SMS and push notifications (`notifications` queue).

4. Notification worker dispatches Twilio/Expo and updates notification log status.

---

## 6. Background / Async Flow Map

## 6.1 Queue Names

- `starter`
- `notifications`
- `billing`
- `receipts`

## 6.2 Receipt Job (`receipts` queue)

- Producers:
  - `PaymentsService.confirmPayment`
  - `AdminClientsService.markClientPaymentComplete`
- Payload:
  - `paymentId`
- Consumer:
  - `PaymentsProcessor`
- Processing:
  - Reads payment + participant metadata.
  - Generates receipt PDF file.
  - Inserts `receipts` row.
  - Sets `payments.receiptId` if still null.
  - Enqueues payment receipt SMS and push notifications.

## 6.3 Notification Job (`notifications` queue)

- Producers:
  - Auth OTP starts
  - Billing reminders
  - Receipt generation completion
- Payload types:
  - Verify OTP SMS job
  - Generic SMS job
  - Push notification job
- Consumer:
  - `NotificationsProcessor`
- Processing:
  - OTP SMS -> Twilio Verify start
  - SMS -> Twilio message send
  - Push -> Expo send to active tokens
  - Updates `notification_logs` to `SENT` or `FAILED`

## 6.4 Starter Job (`starter` queue)

- Producer: `JobsService.enqueueLogMessage`
- Consumer: `StarterProcessor`
- Processing: logs message and emits monitoring metrics.

---

## 7. Module Coverage Matrix

| Module | Public API Endpoints | Internal Responsibility | Depends On | Used By |
|---|---|---|---|---|
| `AuthModule` | Yes (`/auth/*`) | OTP and password auth, JWT issuing, push-token registration | `Users`, `Notifications`, `I18n`, `Jwt` | App/API modules via guards/tokens |
| `AppUsersModule` | Yes (`/me*`) | Authenticated profile reads/updates, phone change OTP | `Auth`, `Users`, `Notifications`, `I18n` | `PaymentsModule` |
| `AppClientsModule` | Yes (`/clients*`) | Agent-side client browsing/details/payments view | `Auth`, `Payments`, `I18n` | API |
| `PaymentsModule` | Yes (`/payments*`, `/public/receipts/*`) | Payment confirmation, listing, receipt access and validation, receipt job processing | `AppUsers`, `Auth`, `Notifications`, `I18n` | API + Admin workflows |
| `AdminModule` | Yes (`/admin*`) | Admin CRUD, reporting, dashboard, mark-complete | `Users`, `Auth`, `I18n`, `Payments` (through service usage) | API + Imports |
| `ImportsModule` | Yes (`/admin/imports*`) | Import template generation and bulk user/client creation | `Admin`, `Auth`, `I18n` | API |
| `BillingModule` | Yes (`/billing/run-daily`) + scheduled | Reminder schedule and due/overdue notification generation | `Notifications`, `I18n`, DB | API + scheduler |
| `HealthModule` | Yes (`/health`) | DB + S3 readiness/liveness checks | DB, config | Ops |
| `MonitoringModule` | Yes (`/metrics`) | Prometheus metrics + job timing helpers | Prom client registry | All modules via interceptors/services |
| `NotificationsModule` | No direct route | Notification enqueueing and async dispatch (Twilio/Expo) | DB, queue, monitoring | Auth, Billing, Payments |
| `UsersModule` | No direct route | User, role-record, OTP-session, push-token persistence API | DB, i18n | Auth, Admin, AppUsers |
| `QueueModule` | No direct route | Global pg-boss integration | DB URL/config | Jobs, Notifications, Payments, Billing |
| `JobsModule` | No direct route | Starter queue dispatch + processing | Monitoring | Internal/infra |
| `DrizzlePGModule` | No direct route | DB connection/provider wiring | `pg`, drizzle config | All data modules |
| `I18nModule` | No direct route | Language resolution and message localization | Context service + message dictionary | All user-facing modules |
| `Common` | No direct route | Guards, decorators, money utils, timezone utils, filters | Nest + shared libs | All modules |
| `Config` | No direct route | Typed environment/secrets access | `process.env` | All modules |

---

## 8. Operational Notes

- OTP behavior:
  - Local/dev mode stores hashed OTP internally and may return `developmentOtp` in responses.
  - Non-local mode relies on Twilio Verify.
- Receipt download requires ownership checks for non-admin callers.
- `GET /payments/mine` is role-sensitive and returns different shapes for client vs agent/admin paths.
- Receipt issuance is asynchronous; immediate payment confirmation does not include receipt ID.
- Import endpoints process only first worksheet for XLSX and report per-row failures.