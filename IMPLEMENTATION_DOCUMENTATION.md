# 7. IMPLEMENTATION DOCUMENTATION

## 7.1 System Setup

### 7.1.1 Development Environment

The implementation is carried out as a Node.js web application with a static frontend and an Express-based backend. The repository root contains `package.json`, public assets under `public/`, and backend modules under `server/`. The runtime entry point is configured as `server/server.js`, and development mode is enabled through `nodemon`.

A standard development workstation requires Node.js (LTS recommended), npm, and a reachable MongoDB instance. Since the code includes payment and email integrations, optional credentials can be supplied for end-to-end behavior; however, core functional flows can still be tested without live credentials due to fallback logic in selected modules.

### 7.1.2 Installation Procedure

1. Clone the repository and move into project root.
2. Install dependencies through npm.
3. Configure environment variables in `.env`.
4. Start server in development mode using `npm run dev` or production mode using `npm start`.

The project scripts are minimal and intentionally direct. The server starts an HTTP instance, mounts route handlers, initializes Socket.IO, and serves static frontend pages from `public/`.

### 7.1.3 Environment Configuration

Environment values are loaded through `dotenv` in the backend bootstrap file. The application expects at least database and security secrets to be provided for proper protected-route execution.

Typical variables required for complete functionality:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `BASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_SERVICE`

The frontend does not hardcode backend endpoints. Instead, `/scripts/env-config.js` is served dynamically by backend and exposes `window.__ENV__.BASE_URL` to browser scripts.

### 7.1.4 Dependency Mapping

The implementation uses the following major packages:

- `express` for REST API routing and middleware orchestration.
- `mongoose` for schema-driven MongoDB persistence.
- `bcryptjs` for secure password hashing.
- `jsonwebtoken` for signed token issuance and validation.
- `razorpay` with `crypto` signature verification for payment integrity.
- `socket.io` for organizer notification channels.
- `pdfkit` and `qrcode` for ticket/invoice generation.
- `nodemailer` for transactional email dispatch.

This set is coherent with the implemented workflows and avoids unnecessary framework overhead.

## 7.2 Module-wise Implementation

### 7.2.1 Project Folder Structure

The implementation follows a clear folder split:

- `server/` contains backend bootstrap, routes, models, middleware, and utility modules.
- `public/` contains UI pages, CSS styles, and page-specific JavaScript behavior.
- Root-level validation scripts and logs are used for local verification and debugging.

This separation keeps request-processing code isolated from browser-facing logic.

### 7.2.2 Backend Core Module (`server/server.js`)

The server module initializes Express, applies CORS and JSON middleware, mounts API routes, injects `req.io` for real-time notifications, connects MongoDB, serves static files, and starts HTTP+Socket.IO listeners. Route registration order ensures dynamic environment script delivery (`/scripts/env-config.js`) is resolved before static middleware fallback.

The module also defines a health endpoint and root page serving behavior. This gives both operational status checks and browser entry support.

### 7.2.3 Authentication Module (`server/routes/auth.js` + `server/middleware/auth.js`)

The authentication route module implements signup and login.

During signup, the module checks duplicate users by email, hashes password with generated salt, stores user record, and signs JWT with user ID and role claims. During login, password hashes are compared and a new token is issued on success.

The middleware module enforces protected access by reading `x-auth-token`, validating JWT integrity using `JWT_SECRET`, and attaching decoded user context to `req.user`. Every secured business route depends on this context for ownership and role checks.

### 7.2.4 Event Management Module (`server/routes/events.js` + `server/models/Event.js`)

The events route module implements event listing, retrieval by ID, creation, update, and soft delete.

Listing is filter-aware. Query parameters for search, category-like matching, location, date, and pagination are transformed into MongoDB query objects. Active status filtering is enforced by default for public event feed.

Create and update operations are protected by auth middleware. Organizer ownership is checked before mutation; admin override is also supported for authorized governance. Deletion is implemented as status transition (`CANCELLED`) rather than hard record removal.

The Event schema persists core metadata (title, description, schedule, venue, image, pricing, capacity) and operational counters (`ticketsSold`, `revenue`, `bookedCount`).

### 7.2.5 Booking Lifecycle Module (`server/routes/bookings.js` + `server/models/Booking.js`)

The booking route module is the most workflow-intensive part of the system.

Key behaviors implemented:

- Booking creation after payment success.
- Server-side price computation and optional coupon application.
- GST/base amount calculation and invoice field population.
- Event counter updates.
- Organizer real-time notification emit.
- Ticket/invoice PDF download endpoints.
- Booking cancellation with 24-hour event window constraint.
- Refund request initiation with state checks.
- User analytics and booking list retrieval with filter/pagination.

The Booking schema stores payment status, ticket number, lifecycle status, refund status, check-in fields, and billing fields. A pre-save hook auto-generates unique ticket numbers in a deterministic sequence format.

### 7.2.6 Payment Module (`server/routes/payments.js`)

The payment module integrates Razorpay order creation and callback verification.

Order API converts amount to smallest currency unit and returns order metadata. Verification API recomputes HMAC signature from order and payment identifiers and compares with gateway signature. Booking persistence is only intended after verification succeeds.

The module also exposes Razorpay key endpoint for frontend checkout initialization.

### 7.2.7 Organizer Analytics Module (`server/routes/organizer.js`)

Organizer APIs provide role-protected access to organizer-owned events and event-level analytics.

The analytics endpoint validates organizer/admin role, verifies resource ownership, loads relevant bookings, and returns attendee and aggregate insights. This module supports dashboard and analytics page visualization flows.

### 7.2.8 Coupon Validation Module (`server/routes/coupons.js` + `server/models/Coupon.js`)

Coupon validation is performed server-side to prevent client-side discount tampering.

Validation checks include code existence, activation status, expiry, usage limit, and event applicability. Valid responses return discount type/value metadata consumed by booking UI and booking creation logic.

Coupon schema tracks usage counters and supports both fixed and percentage discount modes.

### 7.2.9 Check-in Module (`server/routes/checkin.js`)

The check-in route validates QR/ticket data and updates attendee check-in state.

The implementation supports raw ticket value or JSON payload extraction, verifies ticket existence, checks organizer ownership for event, enforces confirmed+paid status, prevents duplicate check-ins, and records check-in timestamp and operator identity.

This module is important for event-day execution and fraud prevention.

### 7.2.10 Utility Modules (`server/utils/pdf.js`, `server/utils/email.js`)

PDF utility generates both ticket and invoice documents. Ticket output includes event and booking details plus QR payload embedding. Invoice generation includes subtotal, GST, and final amount presentation.

Email utility sends booking confirmation emails when SMTP credentials are available. In local development without credentials, it simulates email output in logs without blocking booking flow.

### 7.2.11 Frontend Infrastructure Modules (`public/scripts/config.js`, `public/scripts/api.js`)

`config.js` computes centralized base URL through dynamic environment injection or hostname fallback. `api.js` defines `apiRequest` and `apiAuthRequest` wrappers to reduce duplicate fetch and auth-header logic across page scripts.

This infrastructure ensures consistency in endpoint invocation across all screens.

### 7.2.12 Frontend Feature Modules

The frontend follows per-screen logic files:

- `auth.js` for signup/login/logout behavior.
- `home.js` for event list display and filtering.
- `event-details.js` for single event view.
- `booking.js` for coupon, payment, and booking finalization.
- `create_event.js` / `edit-event.js` for organizer event mutation.
- `my-bookings.js` for ticket view, cancellation, refund requests, and downloads.
- `organizer-dashboard.js` and `event-analytics.js` for organizer reporting.
- `my-wallet.js` for wallet-related front-end behavior.

## 7.3 Code-Level Explanation

### 7.3.1 Token Enforcement Pattern

```js
const token = req.header('x-auth-token');
if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded.user;
```

This pattern is used to guarantee that protected route execution begins only after identity proof is established. Since token payload includes role and user ID, subsequent modules can enforce ownership-sensitive policies consistently.

### 7.3.2 Filtered Event Query Construction

```js
const query = { status: 'ACTIVE' };
if (search) query.$or = [{ title: /search/i }, { description: /search/i }, { location: /search/i }];
if (location) query.location = new RegExp(location, 'i');
if (date) query.date = { $gte: new Date(date) };
```

The listing route builds query clauses incrementally. This approach keeps optional parameters independent and allows pagination to remain stable regardless of filter combinations.

### 7.3.3 Payment Signature Verification

```js
const hmac = crypto.createHmac('sha256', key_secret);
hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
const generated_signature = hmac.digest('hex');
```

The cryptographic check prevents unauthorized or forged payment confirmation payloads from triggering booking persistence.

### 7.3.4 Server-side Booking Amount and Tax Logic

```js
let totalAmount = event.price * ticketQuantity;
if (couponCode) {
  // validate coupon and adjust amount
}
baseAmount = totalAmount / 1.18;
gstAmount = totalAmount - baseAmount;
```

Financial values are calculated server-side, not trusted from frontend submission. This design protects monetary integrity and provides consistent invoice values.

### 7.3.5 Booking Cancellation Window Rule

```js
const hoursDiff = (new Date(event.date) - new Date()) / (1000 * 60 * 60);
if (hoursDiff < 24) {
  return res.status(400).json({ message: 'Cannot cancel within 24 hours of the event' });
}
```

Business policy is enforced in backend to prevent bypass attempts via client-side script modification.

### 7.3.6 Check-in Duplicate Prevention

```js
if (booking.checkInStatus === 'CHECKED_IN') {
  return res.status(400).json({ message: 'Already Checked In', status: 'error' });
}
booking.checkInStatus = 'CHECKED_IN';
booking.checkInTime = new Date();
```

The check-in module maintains idempotence and preserves an event-day audit trail.

### 7.3.7 Frontend Auth Request Standardization

```js
async function apiAuthRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  return apiRequest(endpoint, { ...options, headers: { 'x-auth-token': token, ...options.headers } });
}
```

This helper avoids repetitive token plumbing and keeps page-specific scripts focused on screen behavior.

## 7.4 Screen-to-Screen Implementation Explanation

### 7.4.1 Screen: Signup (`public/signup.html`)

This screen captures new user details and submits them through `public/scripts/auth.js` to `/api/auth/signup`. Backend signup flow checks duplicate email, hashes password, stores role-aware user record, signs JWT, and returns session token plus user profile metadata.

Upon successful response, client stores token and user information in local storage and routes user to homepage. This establishes immediate authenticated session post-registration.

### 7.4.2 Screen: Login (`public/login.html`)

The login interface receives email and password and sends credentials to `/api/auth/login` through `auth.js`. Server validates email existence and bcrypt password match before signing a new token. On success, frontend persists auth state and redirects to landing page.

Interaction path:

1. User enters credentials.
2. Client posts to auth route.
3. Server verifies and returns token.
4. Client persists state and navigates.

### 7.4.3 Screen: Home Event List (`public/index.html`)

The home screen is backed by `home.js`, which fetches events from `/api/events` and renders cards for active events. Filter parameters (search/location/date/category-like value) are passed as query parameters and processed by backend query builder.

When users interact with filter controls, frontend reissues event list request with updated query set. Backend returns paginated response with event array and page metadata.

### 7.4.4 Screen: Event Details (`public/event-details.html`)

This screen is implemented by `event-details.js`. It reads selected event ID from navigation context, requests `/api/events/:id`, and renders complete event information including schedule, location, and pricing. The screen provides transition action to booking page by preserving event identity.

The module is primarily read-focused but acts as the gateway into transaction flow.

### 7.4.5 Screen: Booking and Checkout (`public/booking.html`)

This screen is managed by `booking.js` and integrates multiple backend modules.

Functional progression:

1. Load event details for selected event.
2. Compute display total by ticket quantity.
3. Validate coupon through `/api/coupons/validate` when user applies code.
4. Create payment order via `/api/payments/orders`.
5. Fetch gateway key via `/api/payments/key`.
6. Complete Razorpay checkout interaction.
7. Verify signature via `/api/payments/verify`.
8. Create booking via `/api/bookings/create`.
9. Redirect to booking history page.

Behind this flow, server computes final amount, updates event counters, emits organizer booking notification, and triggers email workflow.

### 7.4.6 Screen: My Bookings (`public/my-bookings.html`)

The screen logic in `my-bookings.js` loads authenticated booking history from `/api/bookings/my-bookings` with optional search/date filters and pagination.

When user opens ticket modal, the script shows event/date/seat/ticket details and dynamically controls action buttons based on booking status and time-to-event. Actions supported:

- Download ticket PDF.
- Download invoice PDF.
- Cancel booking (subject to 24-hour rule).
- Request refund for cancelled booking.

All policy decisions are revalidated server-side in bookings routes.

### 7.4.7 Screen: Organizer Dashboard (`public/organizer-dashboard.html`)

This screen uses `organizer-dashboard.js` and consumes `/api/organizer/events`. The page is role-sensitive and intended for organizer/admin users. It presents organizer-owned events and acts as navigation point for deeper analytics and event management actions.

Backend verifies role before returning dataset to avoid unauthorized event visibility.

### 7.4.8 Screen: Event Analytics (`public/event-analytics.html`)

Implemented through `event-analytics.js`, this screen requests `/api/organizer/events/:id/analytics` for selected event. Response includes summary values and attendee list derived from bookings.

Data shown on this screen is operationally useful for post-booking monitoring, sales understanding, and attendance planning. Ownership verification in backend ensures only event owner (or admin) can access analytics output.

### 7.4.9 Screen: Create Event (`public/create-event.html`)

`create_event.js` binds form inputs (title, description, date, time, location, address, coordinates, price, capacity, image URI) and submits payload to protected `POST /api/events`.

Server injects organizer identity from token context and persists event record. Success path redirects to homepage with organizer-facing feedback.

### 7.4.10 Screen: Edit Event (`public/edit-event.html`)

`edit-event.js` handles update flow against `PUT /api/events/:id`. Existing event data is loaded, edited values are submitted, and backend enforces ownership/admin checks before mutation.

This screen enables controlled event lifecycle maintenance without direct database operations.

### 7.4.11 Screen: Wallet (`public/my-wallet.html`)

The wallet page script (`my-wallet.js`) is integrated as a user-centric auxiliary screen for financial view behavior in frontend. It complements booking/invoice flows and contributes to account-level interaction continuity.

### 7.4.12 Screen: Check-in Flow (API-centric operational screen)

Although QR scanner UI assets are not provided as standalone page in this repository snapshot, check-in interaction is fully implemented at API layer via `/api/checkin/validate`. The expected screen behavior is:

1. Capture QR/ticket payload.
2. Submit payload using organizer-authenticated session.
3. Receive success/error response with attendee/check-in state.

Backend performs ticket existence, event ownership, paid+confirmed status checks, and duplicate prevention before check-in update.

## 7.5 Results-Oriented Implementation Notes

The implementation demonstrates full lifecycle consistency. Authenticated users can discover and book events, while organizers can create events and monitor performance. Payment verification is cryptographically enforced, booking states are policy-constrained, and document outputs are generated through utility services.

Operational maturity is increased by integration of refund workflow, event-day check-in controls, and analytics endpoints. These are practical additions that distinguish the system from basic CRUD samples and align with university-level project expectations focused on real workflow execution.

## 7.6 Limitations and Technical Improvement Opportunities

Despite strong module coverage, production maturity can be further improved by introducing automated integration tests, tightening CORS origin controls, adding centralized logging and monitoring, strengthening schema-level validation for certain fields, and introducing queue-backed async processing for heavy operations such as PDF generation and mail dispatch.

## 7.7 Integration Checklist for Report Submission

For final academic submission, this standalone implementation document can be appended after methodology/results chapters of the main report. If UI screenshots are supplied, each screenshot should be inserted under corresponding screen subsection in **7.4** without changing the section order, preserving one-to-one mapping between visual evidence and code modules.
