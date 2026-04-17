# Frontend Integration Documentation

## 1. Base
- Runtime: NestJS + Fastify
- Base path: `/api/v1`
- Swagger in non-production: `/api/docs`
- Auth header: `Authorization: Bearer <jwt>`
- Languages: `en`, `fr` with fallback `en`
- Currency: `USD` only
- Money requests: major-unit strings like `"100"` or `"100.50"`
- Money responses: normalized strings like `"100.00"`
- Common formats: UUID, month `YYYY-MM`, date `YYYY-MM-DD`, datetime ISO-8601
- Pagination defaults: `skip=0`, `limit=20`, max `limit=100`

## 2. Roles
- `ADMIN`: admin dashboards, user management, imports, reports, billing trigger
- `AGENT`: assigned clients, collections, own profile
- `CLIENT`: own profile, own payment timeline, own receipts

## 3. Request formats

### Auth
- `StartOtpBody`: `{ "phone": "+2507..." }`
- `VerifyOtpBody`: `{ "phone": "+2507...", "code": "123456" }`
- `SetPasswordBody`: `{ "phone": "+2507...", "otpSessionId": "uuid", "password": "password123" }`
- `PasswordLoginBody`: `{ "phone": "+2507...", "password": "password123" }`
- `ChangePasswordBody`: `{ "otpSessionId": "uuid", "oldPassword": "old-pass", "newPassword": "new-pass" }`
- `PushTokenBody`: `{ "expoPushToken": "ExponentPushToken[...]" }`

### Me
- `UpdateMeBody`: `{ "fullNames": "New Name", "phone": "+2507...", "otpSessionId": "uuid" }`
- `UpdateLanguageBody`: `{ "language": "en" }`

### Payments
- `CollectPaymentBody`: `{ "clientId": "uuid", "months": ["2026-03", "2026-04"], "amount": "20.00" }`
- `CollectClientPaymentBody`: `{ "months": ["2026-03", "2026-04"], "amount": "20.00" }`
- `MarkClientPaymentCompleteBody`: `{ "months": ["2026-03", "2026-04"] }`

### Admin
- `CreateAdminOrAgentBody`: `{ "fullNames": "Agent Name", "phone": "+2507...", "language": "en" }`
- `CreateClientBody`: `{ "fullNames": "Client Name", "phone": "+2507...", "address": "Kigali", "language": "en", "type": "NORMAL", "subscriptionAmount": "10.00", "registeredDate": "2026-01-01" }`
- `UpdateAdminClientBody`: `{ "fullNames": "New Name", "phone": "+2507...", "language": "fr", "isActive": true, "address": "Kigali", "type": "NORMAL", "subscriptionAmount": "10.00", "registeredDate": "2026-01-01" }`
- `UpdateAdminAgentBody`: `{ "fullNames": "New Name", "phone": "+2507...", "language": "fr", "isActive": true }`
- `SetStatusBody`: `{ "isActive": true }`

## 4. Response formats

### Generic
- `SimpleSuccess`
```json
{ "success": true, "message": "Operation completed" }
```
- `BooleanSuccess`
```json
{ "success": true }
```
- `OtpStartSuccess`
```json
{ "success": true, "message": "OTP sent", "developmentOtp": "123456" }
```
- `OtpVerifySuccess`
```json
{ "otpSessionId": "uuid" }
```
- `Page<T>`
```json
{ "data": [], "total": 0, "skip": 0, "limit": 20 }
```

### Auth
- `AuthTokenResponse`
```json
{
  "accessToken": "jwt",
  "expiresInSeconds": 86400,
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "fullNames": "John Doe",
    "phone": "+2507...",
    "role": "AGENT",
    "language": "en",
    "firstLoginCompleted": true
  }
}
```

### Me
- `MeResponse`
```json
{
  "user": {
    "id": "uuid",
    "fullNames": "John Doe",
    "phone": "+2507...",
    "role": "CLIENT",
    "language": "en",
    "isActive": true,
    "firstLoginCompleted": true,
    "createdAt": "2026-04-16T10:00:00.000Z"
  },
  "profile": {
    "type": "CLIENT",
    "clientId": "uuid",
    "address": "Kigali",
    "registeredDate": "2026-01-01",
    "subscriptionAmount": "10.00",
    "clientType": "NORMAL"
  }
}
```
- Agent `profile` shape
```json
{
  "type": "AGENT",
  "agentId": "uuid",
  "currentMonthCollected": "150.00",
  "totalAmountCollected": "400.00",
  "collectionsCount": 20,
  "uniqueClientsCollectedFrom": 8
}
```

### Agent client views
- `AgentClientsPage`
```json
{
  "data": [
    {
      "clientId": "uuid",
      "fullNames": "Jane Doe",
      "phone": "+2507...",
      "address": "Kigali",
      "clientType": "NORMAL",
      "registeredDate": "2026-01-01",
      "subscriptionAmount": "10.00",
      "dueMonths": ["2026-03", "2026-04"],
      "totalDue": "20.00",
      "status": "PENDING"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```
- `AgentClientDetail`
```json
{
  "clientId": "uuid",
  "fullNames": "Jane Doe",
  "phone": "+2507...",
  "address": "Kigali",
  "clientType": "NORMAL",
  "registeredDate": "2026-01-01",
  "subscriptionAmount": "10.00",
  "duePayments": [
    {
      "month": "2026-04",
      "amount": "10.00",
      "dueDate": "2026-04-01T00:00:00.000Z",
      "daysPassedSinceDue": 15
    }
  ],
  "daysSinceFirstDueDate": 15,
  "totalDue": "10.00",
  "dueOnly": false
}
```
- `AgentClientPaymentsPage`
```json
{
  "data": [
    {
      "paymentId": "uuid",
      "amount": "20.00",
      "months": ["2026-03", "2026-04"],
      "paymentDate": "2026-04-16T10:00:00.000Z",
      "createdAt": "2026-04-16T10:00:00.000Z",
      "receiptId": "uuid",
      "receiptNumber": "RCPT-20260416-ABCDEFGH",
      "setByAdmin": false,
      "agentId": "uuid",
      "agentName": "Agent Name"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

### Payments
- `PendingPaymentsPage`
```json
{
  "data": [
    {
      "clientId": "uuid",
      "clientName": "Jane Doe",
      "clientPhone": "+2507...",
      "overdueMonths": ["2026-03", "2026-04"],
      "overdueCount": 2,
      "totalAmountDue": "20.00"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```
- `UnpaidMonthsResponse`
```json
{ "clientId": "uuid", "months": ["2026-03", "2026-04"], "suggestedAmount": "20.00" }
```
- `PaymentCreateResponse`
```json
{
  "paymentId": "uuid",
  "receiptId": null,
  "receiptNumber": null,
  "receiptStatus": "PENDING",
  "amount": "20.00",
  "months": ["2026-03", "2026-04"],
  "paymentDate": "2026-04-16T10:00:00.000Z"
}
```
- `PaymentDetailResponse`
```json
{
  "paymentId": "uuid",
  "clientId": "uuid",
  "amount": "20.00",
  "months": ["2026-03", "2026-04"],
  "status": "CONFIRMED",
  "paymentDate": "2026-04-16T10:00:00.000Z",
  "createdAt": "2026-04-16T10:00:00.000Z",
  "receiptId": "uuid",
  "receiptNumber": "RCPT-20260416-ABCDEFGH",
  "setByAdmin": false,
  "agentId": "uuid",
  "agentName": "Agent Name"
}
```
- `ClientTimelinePage`
```json
{
  "data": [
    {
      "id": "uuid-or-due-key",
      "status": "CONFIRMED",
      "amount": "10.00",
      "months": ["2026-04"],
      "paymentDate": "2026-04-16T10:00:00.000Z",
      "dueDate": "2026-04-16T10:00:00.000Z",
      "receiptId": "uuid",
      "receiptNumber": "RCPT-20260416-ABCDEFGH",
      "setByAdmin": false,
      "createdAt": "2026-04-16T10:00:00.000Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```
- `ReceiptDataResponse`
```json
{
  "paymentId": "uuid",
  "receiptId": "uuid",
  "receiptNumber": "RCPT-20260416-ABCDEFGH",
  "clientName": "Jane Doe",
  "clientPhone": "+2507...",
  "agentName": "Agent Name",
  "months": ["2026-03", "2026-04"],
  "amount": "20.00",
  "paymentDate": "2026-04-16T10:00:00.000Z",
  "verificationUrl": "https://app.example.com/receipt/uuid",
  "qrCodeUrl": "https://app.example.com/receipt/uuid"
}
```
- `ReceiptVerifyResponse`
```json
{
  "valid": true,
  "receiptId": "uuid",
  "receiptNumber": "RCPT-20260416-ABCDEFGH",
  "paymentId": "uuid"
}
```

### Admin
- `UserSummaryResponse`
```json
{
  "id": "uuid",
  "fullNames": "Agent Name",
  "phone": "+2507...",
  "role": "AGENT",
  "language": "en",
  "isActive": true,
  "firstLoginCompleted": false,
  "createdAt": "2026-04-16T10:00:00.000Z"
}
```
- `AdminClientsPage`: `Page<{ clientId, userId, fullNames, phone, language, isActive, type, address, registeredDate, subscriptionAmount, createdAt, totalAmountDue, totalMonthsDue }>`
- `AdminClientDetailResponse`: `{ clientId, userId, fullNames, phone, language, isActive, type, address, registeredDate, subscriptionAmount, createdAt, updatedAt, totalAmountDue, totalMonthsDue }`
- `AdminClientPaymentsPage`: `Page<{ id, status, amount, months, paymentDate, createdAt, agentId, agentName, setByAdmin, receiptId, receiptNumber }>`
- `AdminAgentsPage`: `Page<{ agentId, userId, fullNames, phone, language, isActive, createdAt, currentMonthCollected }>`
- `AdminAgentDetailResponse`: `{ agentId, userId, fullNames, phone, language, isActive, createdAt, currentMonthCollected, totalAmountCollected, uniqueClientsCollectedFrom }`
- `AdminPaymentsPage`: `Page<{ paymentId, clientId, clientName, clientPhone, agentId, agentName, agentPhone, setByAdmin, amount, months, status, paymentDate, createdAt, receiptId, receiptNumber, receiptReady }>`
- `DashboardResponse`
```json
{
  "timezone": "Africa/Kigali",
  "year": 2026,
  "kpis": {
    "currentMonthRevenue": {
      "amount": "1000.00",
      "contributingClients": 100,
      "percentIncreaseVsLastMonth": 10.5,
      "currentAmount": "1000.00",
      "previousAmount": "905.00"
    },
    "totalPendingDue": { "amount": "250.00", "clients": 12 },
    "totalClientsActive": { "count": 120, "previousCount": 115, "percentIncreaseVsLastMonth": 4.35 },
    "totalAgentsActive": { "count": 8, "previousCount": 7, "percentIncreaseVsLastMonth": 14.29 }
  },
  "graphs": { "revenuePerMonth": [{ "month": "2026-01", "amount": "100.00" }] },
  "tables": {
    "topAgents": [
      {
        "agentId": "uuid",
        "userId": "uuid",
        "fullNames": "Agent Name",
        "phone": "+2507...",
        "amountCollected": "300.00",
        "collectionsCount": 20
      }
    ]
  }
}
```
- `ImportReportResponse`
```json
{
  "totalRows": 10,
  "successCount": 8,
  "failedCount": 2,
  "failures": [
    { "row": 3, "reason": "Invalid phone number", "data": { "phone": "..." } }
  ]
}
```

### Ops
- `HealthResponse`
```json
{
  "status": "up",
  "timestamp": "2026-04-16T10:00:00.000Z",
  "checks": {
    "database": { "status": "up", "latencyMs": 4 },
    "s3": { "status": "up", "latencyMs": 12 }
  }
}
```
- `MetricsResponse`
```text
Prometheus plaintext
```

## 5. Endpoint map

### Root
- `GET /` -> string response `"Hello World!"`

### Auth
- `POST /auth/first-login/start` -> `OtpStartSuccess`
- `POST /auth/first-login/verify` -> `OtpVerifySuccess`
- `POST /auth/first-login/set-password` -> `AuthTokenResponse`
- `POST /auth/login/password` -> `AuthTokenResponse`
- `POST /auth/login/otp/start` -> `OtpStartSuccess`
- `POST /auth/login/otp/verify` -> `AuthTokenResponse`
- `POST /auth/password/forgot/start` -> `OtpStartSuccess`
- `POST /auth/password/forgot/verify` -> `OtpVerifySuccess`
- `POST /auth/password/forgot/reset` -> `SimpleSuccess`
- `POST /auth/password/change/start` -> `OtpStartSuccess`
- `POST /auth/password/change` -> `SimpleSuccess`
- `POST /auth/push-token` -> `SimpleSuccess`

### Me
- `GET /me` -> `MeResponse`
- `PATCH /me` -> `MeResponse`
- `PATCH /me/language` -> `SimpleSuccess`
- `POST /me/phone-change/start` -> `OtpStartSuccess`
- `POST /me/phone-change/verify` -> `OtpVerifySuccess`

### Agent clients
- `GET /clients` -> `AgentClientsPage`
- `GET /clients/:clientId` -> `AgentClientDetail`
- `GET /clients/:clientId/payments` -> `AgentClientPaymentsPage`
- `POST /clients/:clientId/payments` -> `PaymentCreateResponse`

### Payments
- `GET /payments/agent/pending` -> `PendingPaymentsPage`
- `GET /payments/agent/client/:clientId/unpaid-months` -> `UnpaidMonthsResponse`
- `POST /payments/agent/confirm` -> `PaymentCreateResponse`
- `GET /payments/mine`
- As `CLIENT` -> `ClientTimelinePage`
- As `AGENT` or `ADMIN` -> compact payment page with items shaped like payment list objects
- `GET /payments/:paymentId` -> `PaymentDetailResponse`
- `GET /payments/:paymentId/receipt/data` -> `ReceiptDataResponse`
- `GET /payments/:paymentId/receipt/download` -> PDF file
- `GET /payments/receipts/:receiptId/download` -> PDF file

### Public receipt verification
- `GET /public/receipts/:receiptId/verify` -> `ReceiptVerifyResponse`

### Admin
- `POST /admin/users/admins` -> `UserSummaryResponse` with `role: "ADMIN"`
- `POST /admin/users/agents` -> `UserSummaryResponse` with `role: "AGENT"`
- `POST /admin/users/clients` -> `UserSummaryResponse` with `role: "CLIENT"`
- `POST /admin/agents/deactivate` -> `BooleanSuccess`
- `GET /admin/clients` -> `AdminClientsPage`
- `GET /admin/clients/:clientId` -> `AdminClientDetailResponse`
- `PATCH /admin/clients/:clientId` -> `AdminClientDetailResponse`
- `PATCH /admin/clients/:clientId/status` -> `BooleanSuccess`
- `GET /admin/clients/:clientId/payments` -> `AdminClientPaymentsPage`
- `POST /admin/clients/:clientId/payments/mark-complete` -> `PaymentCreateResponse`
- `GET /admin/agents` -> `AdminAgentsPage`
- `GET /admin/agents/:agentId` -> `AdminAgentDetailResponse`
- `PATCH /admin/agents/:agentId` -> `AdminAgentDetailResponse`
- `PATCH /admin/agents/:agentId/status` -> `BooleanSuccess`
- `GET /admin/payments` -> `AdminPaymentsPage`
- `GET /admin/payments/:paymentId` -> one item from `AdminPaymentsPage.data`
- `GET /admin/dashboard` -> `DashboardResponse`

### Imports
- `GET /admin/imports/templates/agents.csv` -> CSV file
- `GET /admin/imports/templates/agents.xlsx` -> XLSX file
- `GET /admin/imports/templates/clients.csv` -> CSV file
- `GET /admin/imports/templates/clients.xlsx` -> XLSX file
- `POST /admin/imports/agents` -> `ImportReportResponse`
- `POST /admin/imports/clients` -> `ImportReportResponse`

### Billing and ops
- `POST /billing/run-daily` -> `BooleanSuccess`
- `GET /health` -> `HealthResponse`
- `GET /metrics` -> Prometheus plaintext

## 6. Flow playbooks

### First login
1. `POST /auth/first-login/start`
2. `POST /auth/first-login/verify`
3. `POST /auth/first-login/set-password`
4. Store `accessToken` and user payload

### Change phone
1. `POST /me/phone-change/start`
2. `POST /me/phone-change/verify`
3. `PATCH /me` with `phone` and returned `otpSessionId`

### Agent collection
1. Load due clients with `GET /payments/agent/pending`
2. Optionally fetch month suggestions with `GET /payments/agent/client/:clientId/unpaid-months`
3. Create payment using `POST /payments/agent/confirm` or `POST /clients/:clientId/payments`
4. Treat the immediate create response as saved payment with pending receipt

### Receipt and QR flow
1. Call `GET /payments/:paymentId/receipt/data`
2. Use `verificationUrl` or `qrCodeUrl` as the QR payload
3. Render the QR image on the frontend from that URL string
4. Download the PDF from `GET /payments/:paymentId/receipt/download` or `GET /payments/receipts/:receiptId/download`
5. For scanned QR verification, call `GET /public/receipts/:receiptId/verify`

## 7. Important notes
- Receipt generation is async after payment creation, but receipt data and receipt download endpoints can also generate on demand
- `qrCodeUrl` is not a hosted QR image; it is currently the same verification URL string returned by the backend
- Public QR verification is keyed by `receiptId`
- Admin payment creation via `mark-complete` follows the same receipt workflow as agent-collected payments
- Current edit endpoints are `PATCH /admin/clients/:clientId` and `PATCH /admin/agents/:agentId`
