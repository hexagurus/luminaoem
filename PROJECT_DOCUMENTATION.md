# ABSTRACT

The system is developed as a full-stack Online Event Management platform to handle the operational cycle of event publishing, attendee registration, payment-backed booking, ticket issuance, and organizer-side monitoring. The implementation integrates a Node.js and Express backend with MongoDB persistence and a multi-page frontend delivered through static assets. Authentication is enforced through JWT-based request validation, and role-based controls are applied for organizer and administrator workflows. The booking subsystem includes payment order creation, signature verification, coupon validation, and persistent accounting fields such as GST split and invoice identifiers.

The implementation also addresses operational concerns that are commonly absent in basic prototypes, including check-in status tracking, cancellation windows, refund request workflow, event-level analytics, PDF ticket/invoice generation, and notification-oriented integrations such as email and Socket.IO channels. The resulting system is suitable for academic project submission as well as incremental production hardening.

# 1 Introduction

Digital event operations demand consistent coordination among organizers, attendees, and administrators. Manual registration sheets and disconnected payment records generally result in delayed confirmations, inconsistent attendee data, and weak post-event reporting. The developed application centralizes these activities within a single web system where users can discover events, complete secure bookings, and access booking artifacts while organizers can monitor sales and attendance flows.

The application follows a service-oriented web pattern in which the frontend interacts with REST endpoints for authentication, event retrieval, booking, payment verification, organizer analytics, coupon validation, and check-in operations. The design adopts modular route handling on the server and reusable API access functions on the client to maintain clarity and extensibility.

## Problem Statement

Event handling in small and medium deployments frequently suffers from fragmented tooling. Registration, payment, confirmation, and attendance verification are performed in separate systems, causing reconciliation overhead and limited traceability. The problem addressed by this work is the absence of an integrated platform that can enforce transaction integrity, preserve event ownership controls, and provide measurable operational outputs such as revenue, ticket utilization, refund status, and attendee check-in visibility.

## 1.1 Objectives

The objectives implemented in the current repository are as follows:

1. To provide secure signup and login with encrypted password storage and tokenized authorization.
2. To support organizer-driven event creation, update, and soft cancellation with ownership checks.
3. To provide searchable and filterable event discovery for active events.
4. To implement payment-integrated booking with server-side amount computation and coupon handling.
5. To generate ticket and invoice artifacts and support booking cancellation/refund request workflows.
6. To provide organizer and user analytics endpoints for operational monitoring.
7. To support event check-in validation with duplicate check-in prevention.

## 1.2 Existing System

In the existing conventional approach, event registration and payment workflows are often distributed across form links, manual cash ledgers, and separate communication channels. Confirmation handling is not synchronized with inventory updates, and refund processing typically remains ad hoc. Such environments provide limited control over data consistency and impose significant effort during event-day attendee validation.

This style of operation is also weak in terms of reporting. Organizers are unable to derive reliable booking summaries, monthly spending trends, and event-level attendance snapshots without manually combining data from multiple sources.

## 1.3 Proposed System

The proposed system consolidates the complete event workflow into a web platform with explicit module boundaries. The backend exposes route groups for authentication, events, payments, bookings, organizer analytics, coupons, and check-in. The frontend provides dedicated pages for login/signup, event listing, event detail view, booking, event creation/editing, organizer dashboard, analytics, wallet, and booking history.

The implementation is designed so that a successful payment transition leads to booking persistence, event counter updates, and downstream ticket communication steps. Operational lifecycle conditions such as cancellation eligibility and duplicate check-in prevention are enforced server-side to preserve integrity even if client behavior is modified.

# 2 Literature Survey

Modern event systems have transitioned from registration-centric portals to transaction-centric operational platforms. In contemporary practice, a usable event system is expected to provide secure authentication, gateway-backed payment processing, and a post-booking lifecycle that includes ticketing, cancellation rules, and analytics. The present implementation follows this direction by extending beyond simple event CRUD and integrating process-critical modules such as coupon validation, invoice generation, and attendance check-in.

Research and industrial case studies on web application architecture emphasize modular API design and schema-backed persistence to improve maintainability and auditing. The repository reflects this through Mongoose models that explicitly represent event, booking, user, and coupon states and through route-level separation that simplifies testing and future extension.

Another common learning in production-grade event software is that authorization checks must remain server-enforced for organizer-owned resources. The implemented route handlers follow this requirement by validating user role and ownership before update, cancellation, and analytics operations.

# 3 Methodology

The implementation process follows an incremental, module-first methodology. Core layers (authentication, event management, booking persistence) are established initially, followed by transactional verification (payments), operational controls (coupon, cancellation, refund, check-in), and reporting modules (organizer/user analytics). This progression reduces integration risk because each feature is anchored to existing persisted state.

## 3.1 Proposed Model/Architecture

The system architecture is composed of three layers:

- **Presentation Layer:** HTML pages in `public/` with page-specific JavaScript modules in `public/scripts/`.
- **Application Layer:** Express application configured in `server/server.js` with modular routes in `server/routes/`.
- **Data Layer:** MongoDB schemas in `server/models/` for users, events, bookings, and coupons.

### System Architecture

Client requests are routed through centralized helper functions (`apiRequest`, `apiAuthRequest`) and mapped to backend endpoints. Protected operations pass through JWT middleware, and route handlers execute business logic with model-level persistence. Utility components (`pdf.js`, `email.js`) generate artifacts and notifications after booking events.

### Workflow / Data Flow

A representative booking data flow is implemented as follows:

1. User opens booking page and requests event detail data.
2. Client submits order amount to payment order endpoint.
3. Payment response is verified using HMAC signature validation.
4. Verified transaction triggers booking creation with server-side amount logic and optional coupon validation.
5. Event counters are updated, and booking is exposed in user/organizer dashboards.
6. Ticket/invoice download and check-in operations consume persisted booking identity fields.

## 3.2 Datasets

No external machine learning dataset is used. The system relies on transactional application datasets managed through MongoDB.

- **User dataset:** identity, email, password hash, role, creation timestamp.
- **Event dataset:** descriptive metadata, venue attributes, pricing, capacity, status, organizer reference, sales metrics.
- **Booking dataset:** user-event linkage, ticket quantity, payment details, ticket identifiers, cancellation/refund/check-in states, invoice and GST fields.
- **Coupon dataset:** code rules, discount type/value, validity, usage limits, event applicability.

These datasets are sufficient for implementing filtered retrieval, dashboard summaries, revenue tracking, and event-day validation.

## 3.3 Algorithm (Title if any)

### Algorithm A: Token-based Authentication

The module receives signup/login requests, hashes user passwords during registration, validates credentials during login, and signs JWT payloads carrying user ID and role. Protected routes verify the token and inject user context into request handling.

### Algorithm B: Filtered Event Discovery

The event retrieval route initializes query constraints for active status and incrementally applies search text, category-like matching, location constraints, and date conditions. The query is executed with sorting and pagination to support scalable listing.

### Algorithm C: Booking Creation after Payment Verification

The payment module generates gateway orders and verifies callback signatures. After successful verification, booking creation computes payable amount on the server, applies valid coupons, stores invoice-relevant values, updates event counters, and emits organizer notification events.

### Algorithm D: Cancellation, Refund, and Check-in Validation

Cancellation is allowed only for authorized users and only when the event start is beyond the 24-hour threshold. Refund requests are accepted for cancelled bookings with eligible status. Check-in validates ticket identity, event ownership, payment/booking state, and duplicate-entry conditions before status update.

## 3.4 Performance Metrics

Although benchmark scripts are not included in the repository, measurable implementation metrics can be derived from existing modules:

- API correctness through status and payload consistency across route handlers.
- Booking integrity by validating event counters against booking transactions.
- Coupon enforcement accuracy through discount application and usage-limit behavior.
- Transaction reliability through payment verification and booking creation coupling.
- Check-in correctness through duplicate-check prevention and ownership validation.

# 4 Results and Discussion

The repository demonstrates an end-to-end operational event system rather than isolated CRUD pages. Authentication routes produce signed tokens and preserve role information, event routes provide searchable and paginated active event retrieval, and booking routes capture ticketing, billing, and lifecycle state transitions. Organizer-level endpoints expose event analytics and attendee information, and check-in routes support event-day execution controls.

From a usability perspective, the frontend includes dedicated screens for core workflows such as authentication, event browsing, booking, organizer dashboards, and personal booking management. The presence of utility modules for PDF and email further indicates that post-payment communication and documentation are considered in the implementation.

The system also reflects practical safeguards: cancellation windows are enforced, coupon constraints are validated server-side, and route authorization is checked against user role and resource ownership. These controls improve trustworthiness of data and reduce dependency on client-side assumptions.

## Advantages & Limitations

The implementation offers clear advantages in modularity, transaction integrity, and feature completeness for an academic full-stack project. The route and model decomposition supports maintainability, while workflow-specific constraints improve operational reliability.

At the same time, certain limitations remain visible from the current codebase. Test automation is not integrated in package scripts, some display labels in analytics/check-in depend on available populated user fields, and production security hardening such as strict CORS origin policy and secret management procedures can be further improved.

# 5 Conclusion & Future scope

The system is developed to provide a unified, secure, and operationally meaningful event management workflow. It handles registration, event publishing, booking, payment verification, ticketing, analytics, and check-in within a single codebase. The implementation demonstrates balanced treatment of both user-facing and organizer-facing requirements and aligns with university-level project expectations in terms of architecture and functional depth.

## Future Enhancements

Future work can focus on production-readiness and advanced observability. Recommended directions include comprehensive automated testing, role-specific audit logging, queue-based asynchronous processing for heavy notification workloads, richer analytics dashboards, and stricter deployment-time security policies.

# 6 References

1. Repository source modules under `server/` and `public/`.
2. Express.js documentation for routing and middleware design.
3. MongoDB and Mongoose documentation for schema and query modeling.
4. JWT specifications for token-based authorization.
5. Razorpay API documentation for order and signature verification workflows.

# 7. Implementation

## 7.1 System Setup

The implementation is carried out using Node.js runtime with Express as the backend framework and MongoDB as the persistence layer. The project can be initialized by installing dependencies through `npm install` in the repository root and starting the server using `npm start` or `npm run dev`.

Environment configuration is expected through a `.env` file consumed by `dotenv` in the server bootstrap. Core variables include `MONGODB_URI` for database connection, `JWT_SECRET` for token signing, `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for payment integration, and optional email variables for ticket notifications. The frontend receives runtime API base URL through `/scripts/env-config.js`, enabling deployment-time endpoint control.

The dependency set includes `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `razorpay`, `socket.io`, `nodemailer`, `pdfkit`, and `qrcode`, each mapped to a specific subsystem such as security, persistence, payment, real-time messaging, and document generation.

## 7.2 Module-wise Implementation

### Backend Structure

The backend entry point `server/server.js` configures middleware, static hosting, route registration, Socket.IO server initialization, and MongoDB connection. Route files under `server/routes/` implement business workflows: `auth.js` handles credential and token flows; `events.js` controls event lifecycle and filtered retrieval; `payments.js` implements Razorpay order and signature verification; `bookings.js` manages booking creation, analytics, cancellation, refund initiation, and PDF downloads; `organizer.js` exposes organizer event dashboards; `coupons.js` validates discount codes; and `checkin.js` performs ticket validation and check-in updates.

Model definitions in `server/models/` maintain persistence contracts. `User.js` stores identity and role fields, `Event.js` stores schedule and sales counters, `Booking.js` stores payment and lifecycle states with generated ticket number, and `Coupon.js` stores discount governance rules. Middleware in `server/middleware/auth.js` enforces token verification and request-level user context extraction.

Utilities under `server/utils/` implement cross-cutting concerns. `pdf.js` generates ticket and invoice documents including QR code embedding, and `email.js` sends booking mail when credentials are configured, while still supporting simulation logs in local environments.

### Frontend Structure

The frontend is implemented as a multi-page interface in `public/`. Page-specific workflows are handled through scripts in `public/scripts/`. `config.js` and `api.js` provide centralized API endpoint management and authenticated request helpers. `auth.js` manages login/signup persistence and logout state cleanup. `home.js` and `event-details.js` render event data. `booking.js` drives payment and booking finalization. Organizer-facing operations are handled in `create_event.js`, `edit-event.js`, `organizer-dashboard.js`, and `event-analytics.js`, while attendee-facing lifecycle handling is implemented in `my-bookings.js` and `my-wallet.js`.

This separation keeps page behavior localized while preserving reusable infrastructure at the API-helper layer.

## 7.3 Code-Level Explanation

The following implementation snippets demonstrate core system behavior.

```js
// server/middleware/auth.js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded.user;
next();
```

This middleware operation validates token authenticity and pushes decoded user identity into request context. The same context is consumed by route modules to enforce role or ownership constraints before data mutation.

```js
// server/routes/payments.js
const hmac = crypto.createHmac('sha256', key_secret);
hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
const generated_signature = hmac.digest('hex');
```

This logic cryptographically verifies payment callback authenticity. Without this verification, booking persistence could occur for unverifiable transactions.

```js
// server/routes/bookings.js
let totalAmount = event.price * ticketQuantity;
if (couponCode) { /* validate coupon and apply discount */ }
booking.baseAmount = parseFloat((totalAmount / 1.18).toFixed(2));
booking.gstAmount = parseFloat((totalAmount - (totalAmount / 1.18)).toFixed(2));
```

The server performs amount and tax computation even when the client submits display values. This design prevents client-side manipulation from directly affecting persisted financial fields.

```js
// public/scripts/api.js
async function apiAuthRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  return apiRequest(endpoint, {
    ...options,
    headers: { 'x-auth-token': token, ...options.headers }
  });
}
```

This frontend helper centralizes token propagation and reduces repeated header logic in page-level scripts. It creates consistent interaction contracts with protected backend endpoints.

## 7.4 Screen-wise Implementation Notes

### 7.4.1 Screen: Login Interface

The login screen is implemented through `public/login.html` and `public/scripts/auth.js`. User credentials entered in the form are transmitted to `/api/auth/login`. On successful response, token and user metadata are stored in local storage and navigation is redirected to the homepage. The backend route in `server/routes/auth.js` verifies credential validity using hashed password comparison and returns signed JWT for subsequent authenticated requests.

### 7.4.2 Screen: Event Listing (Home)

The event listing interface is powered by `public/index.html` with logic in `public/scripts/home.js`. The page requests event collections from `/api/events` and supports dynamic filtering behavior. The backend handler in `server/routes/events.js` applies active-status condition, search/location/date filters, and pagination. The rendered cards provide entry to detail and booking flows.

### 7.4.3 Screen: Event Details

The event detail view is implemented in `public/event-details.html` and `public/scripts/event-details.js`. The page fetches one event by identifier from `/api/events/:id` and displays complete schedule and venue context. This view acts as the transition point to booking by preserving selected event identity for the payment workflow.

### 7.4.4 Screen: Booking and Payment

The booking screen uses `public/booking.html` and `public/scripts/booking.js`. It computes display totals, supports coupon validation via `/api/coupons/validate`, initiates payment orders through `/api/payments/orders`, verifies gateway callbacks via `/api/payments/verify`, and finalizes booking through `/api/bookings/create`. Backend modules in `server/routes/coupons.js`, `server/routes/payments.js`, and `server/routes/bookings.js` jointly complete this transaction pipeline.

### 7.4.5 Screen: My Bookings

The attendee booking management screen is implemented in `public/my-bookings.html` and `public/scripts/my-bookings.js`. It retrieves authenticated booking history from `/api/bookings/my-bookings`, supports pagination and filtering, provides ticket/invoice download actions, and triggers cancellation/refund requests where eligible. Corresponding business rules are enforced in `server/routes/bookings.js`.

### 7.4.6 Screen: Organizer Dashboard and Analytics

Organizer-oriented screens include `public/organizer-dashboard.html` with `public/scripts/organizer-dashboard.js` and `public/event-analytics.html` with `public/scripts/event-analytics.js`. These modules consume `/api/organizer/events` and `/api/organizer/events/:id/analytics` to visualize event-level performance and attendee records. Authorization and ownership validation are enforced by `server/routes/organizer.js` before analytics payloads are returned.

### 7.4.7 Screen: Event Creation and Edit

Event publishing interfaces are implemented in `public/create-event.html`, `public/edit-event.html`, and scripts `public/scripts/create_event.js`, `public/scripts/edit-event.js`. Form submissions call protected event routes for create and update operations. Backend validation and organizer ownership rules are handled in `server/routes/events.js`, and persistence is maintained through `server/models/Event.js`.

> Note: In this conversation, only the index screenshot was provided. Additional UI screenshots can be embedded under the same subsection titles without changing the explanatory flow.
