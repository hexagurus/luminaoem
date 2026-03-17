# ABSTRACT

The developed system is an online event management platform that supports the full lifecycle of event operations: user registration, event publishing, event discovery, ticket booking, payment verification, ticket generation, organizer analytics, and attendee check-in. The implementation follows a web-based client-server model using Node.js, Express, MongoDB, and a multi-page frontend. Authentication is enforced through JSON Web Tokens, role-based access is applied for organizer and administrative workflows, and transactional flows are integrated with Razorpay APIs. Beyond booking confirmation, the system extends to operational requirements such as invoice generation, coupon validation, cancellation and refund request handling, and real-time organizer notification through Socket.IO.

From an engineering perspective, the application demonstrates modular routing, schema-driven persistence, and reusable frontend API abstractions. The structure supports extensibility for additional features such as stronger recommendation logic, dynamic reporting dashboards, and tighter production security policies.

# 1 Introduction

Digital event execution requires coordination across multiple stakeholders, including attendees, organizers, and system administrators. Conventional approaches based on spreadsheets, manual registration, and fragmented communication channels often create operational delays and inconsistencies. The implemented platform addresses this by centralizing event publishing, discovery, booking, and tracking through a unified web application.

At the backend, the system exposes RESTful endpoints for authentication, event lifecycle management, payment flow, booking lifecycle management, organizer analytics, coupon operations, and check-in. At the frontend, dedicated pages and scripts provide role-aware user journeys for browsing events, viewing details, booking tickets, managing bookings, and monitoring organizer performance.

## 1.1 Objectives

The system is designed to meet the following objectives in a measurable and implementation-oriented manner:

1. To provide secure user onboarding and login using hashed passwords and token-based session control.
2. To enable organizers to create, update, and cancel events while preserving event ownership constraints.
3. To provide attendees with searchable and filterable access to active events.
4. To implement an integrated booking workflow with payment order creation, signature verification, and booking persistence.
5. To support post-booking operations including downloadable ticket/invoice artifacts, cancellation, and refund request initiation.
6. To provide operational analytics for organizers and booking statistics for users.
7. To support event-day execution with ticket check-in capabilities.

## 1.2 Existing System

In many small and medium event setups, the existing process is either fully manual or partially digitized through disconnected tools. Registration links may be distributed through social channels, payments may be tracked separately, and attendee reconciliation is typically performed through ad-hoc lists.

Such fragmented practice introduces common issues: delayed confirmations, poor visibility of seat utilization, weak audit trails for refunds, and limited post-event analytics. Even basic controls such as coupon limits or check-in status tracking are difficult to enforce consistently when data is distributed across independent tools.

## 1.3 Proposed System

The proposed system consolidates event management into a role-driven web platform. Users can register and authenticate, browse active events with search and filters, complete bookings via payment gateway integration, and access booking history. Organizers can manage event inventory and view event-level metrics and attendees. The platform further introduces operational modules for coupon validation, refund request initiation, and check-in updates.

Architecturally, the design adopts an Express-based API layer over MongoDB models and a static frontend served by the same application server. This arrangement reduces deployment complexity for academic and small production contexts while keeping clear boundaries between route handlers, middleware, utilities, and client scripts.

# 2 Literature Survey

Event management systems have evolved from desktop scheduling tools to cloud-enabled booking platforms. Contemporary systems generally converge on several capabilities: online registration, payment integration, attendee communication, and dashboard-based monitoring. The codebase implementation aligns with this progression by coupling transactional booking flows with operational features such as PDF ticketing and analytics.

A review of common practices in web application engineering indicates that scalable event platforms favor modular APIs, schema-level validation, and role-sensitive access control. The present implementation reflects this through isolated route modules (`auth`, `events`, `bookings`, `organizer`, `payments`, `coupons`, `checkin`), JWT middleware enforcement, and dedicated Mongoose schemas.

Another recurring insight from modern platforms is the importance of post-transaction workflows rather than only payment acceptance. In response, the implemented system includes invoice generation, refund request status fields, and check-in state transitions, indicating an operationally complete approach rather than a booking-only prototype.

# 3 Methodology

The development methodology follows a modular incremental approach. Core flows (authentication, events, booking) are established first, then enhanced with payment verification, analytics, coupon logic, invoicing, and check-in. Both frontend and backend modules are structured for separation of concerns: reusable API utility functions on the client and route/schema/middleware decomposition on the server.

## 3.1 Proposed Model/Architecture

The system follows a three-layer architecture:

1. **Presentation Layer (Frontend):** Multi-page HTML interfaces with JavaScript modules for authentication, event discovery, booking, dashboard interaction, and API communication.
2. **Application Layer (Backend):** Express routes handling business logic, JWT middleware for protected endpoints, and utility modules for email and PDF generation.
3. **Data Layer (Database):** MongoDB collections represented using Mongoose schemas for users, events, bookings, and coupons.

### High-level Data Flow

- User credentials are submitted through frontend forms and validated on authentication routes.
- Event listing requests include optional filters and pagination parameters.
- Booking requests execute server-side amount computation, optional coupon processing, booking persistence, event statistics updates, and asynchronous notification/email steps.
- Organizer analytics and user booking analytics are generated using aggregation queries.

### Security and Access Strategy

JWT tokens are issued at login/signup and passed using `x-auth-token`. The middleware decodes token payload and attaches user identity/role to the request context. Route-level checks enforce ownership and role permissions for organizer/admin-sensitive actions.

## 3.2 Datasets

No external benchmark dataset is used in this project. The application uses operational data generated through normal system transactions and stored in MongoDB collections.

- **User dataset:** `username`, `email`, encrypted `password`, `role`, `createdAt`.
- **Event dataset:** title/description/time-location metadata, pricing, capacity, organizer reference, status, and sales counters.
- **Booking dataset:** user-event references, booking amounts, payment metadata, ticket identifiers, refund/check-in status, and invoice fields.
- **Coupon dataset:** code constraints, discount model, validity window, usage counters, and optional event applicability.

This schema-driven internal dataset is sufficient for implementing search, filtering, analytics, and workflow state transitions.

## 3.3 Algorithm (Title if any)

### Algorithm 1: Secure Authentication and Authorization

1. Accept credentials from login/signup request.
2. For signup, hash password with salt before persistence.
3. For login, compare plaintext password with hash.
4. Build JWT payload with user ID and role.
5. Sign token with server secret and return token to client.
6. For protected routes, verify token and extract user context before business logic execution.

### Algorithm 2: Event Retrieval with Search and Filters

1. Initialize query with `status = ACTIVE`.
2. Apply text search (title/description/location) using case-insensitive regex.
3. Apply optional category, location, and date constraints.
4. Execute paginated query with sorting by event date.
5. Return events with pagination metadata.

### Algorithm 3: Booking and Payment Completion Pipeline

1. Create payment order for final amount.
2. Receive payment identifiers and verify cryptographic signature.
3. On successful verification, compute booking total server-side.
4. Validate coupon status and apply discount (fixed/percentage).
5. Persist booking with ticket/invoice fields.
6. Update event counters (`ticketsSold`, `revenue`, `bookedCount`).
7. Emit organizer notification via Socket.IO and trigger ticket email workflow.

### Algorithm 4: Cancellation and Refund Eligibility

1. Validate booking ownership.
2. Compute time difference between current time and event start.
3. Reject cancellation when less than 24 hours remain.
4. Mark booking as cancelled and reverse event counters.
5. Accept refund request only for cancelled bookings with no prior refund state.

## 3.4 Performance Metrics

The repository does not define a dedicated benchmarking suite; however, performance and correctness can be evaluated through operational metrics derived from implemented fields and endpoints.

1. **API Response Correctness:** success/failure status and schema-consistent JSON output for route operations.
2. **Booking Integrity:** consistency between booking records and event aggregate counters.
3. **Search Efficiency Indicators:** paginated retrieval behavior under query filters.
4. **Transactional Reliability:** payment verification success rate vs. booking creation completion.
5. **Operational Timeliness:** check-in updates and organizer notification propagation.

These metrics are suitable for academic validation in the absence of synthetic load datasets.

# 4 Results and Discussion

The implemented system provides complete end-to-end workflows from authentication to ticket lifecycle operations. Functional outcomes observed from code structure and integrated modules are summarized below.

The authentication module enforces password hashing and tokenized identity propagation. Event modules support create-read-update-cancel flows with organizer ownership checks. Booking modules include pricing, coupon application, ticket numbering, and GST-compatible invoice fields. Payment modules integrate order creation and signature verification, reducing the risk of booking persistence without validated payment.

Operationally, the project extends beyond basic CRUD by incorporating organizer analytics, user booking analytics, PDF generation for tickets/invoices, email dispatch capability (with simulation fallback), and check-in transitions. This indicates a mature academic project scope where both business workflows and post-transaction controls are represented.

A representative backend pattern used across modules is shown below.

```js
// JWT-protected route with ownership/role guard pattern
router.put('/:id', auth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // update logic ...
});
```

The frontend architecture also demonstrates modularity through shared API helper functions and environment-aware base URL configuration, which supports cleaner deployment transitions between local and hosted environments.

# 5 Conclusion & Future scope

The developed platform delivers a comprehensive online event management workflow with secure authentication, event publication and discovery, payment-backed booking, ticket/invoice generation, and organizer-side visibility. The implementation reflects practical full-stack design principles and demonstrates clear module boundaries suitable for maintenance and future evolution.

From a project-report perspective, the system satisfies the expectations of an academic capstone by integrating database design, API engineering, client-side interaction, and operational controls within one coherent solution.

## Future scope

Future enhancement can be directed toward production-hardening and advanced intelligence features:

1. Fine-grained category taxonomy and recommendation models for personalized discovery.
2. Stronger observability with centralized logs, request tracing, and dashboarded KPIs.
3. Asynchronous job queues for email/PDF workloads to improve throughput under peak load.
4. Automated test coverage for route-level and integration-level workflows.
5. Expanded role policies and audit trails for refund approvals and check-in operations.

# 6 References

1. Source repository modules: `server/server.js`, `server/routes/*.js`, `server/models/*.js`, `server/middleware/auth.js`, `server/utils/*.js`, `public/scripts/*.js`.
2. Express.js official documentation: routing and middleware concepts.
3. MongoDB and Mongoose documentation: schema modeling and aggregation pipeline usage.
4. JSON Web Token (JWT) documentation for tokenized authentication.
5. Razorpay API documentation for order creation and payment signature verification.
