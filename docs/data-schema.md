# MediTrack AI — Data Schema

> This document defines the complete database schema for MediTrack AI.
> All Firestore collections, document fields, types, and relationships are documented here.
> **Both Mahi (backend) and Faizan (frontend) must follow this schema exactly.**

---

## Collections Overview

| Collection | Purpose | Written By | Read By |
|---|---|---|---|
| `users` | User profiles and roles | Auth system | Frontend (profile, network page) |
| `shipments` | Core shipment records | Backend (API + simulation) | Frontend (all pages) |
| `telemetry` | Real-time sensor readings | Backend (simulation engine) | Frontend (charts, gauges) |
| `blockchain` | Immutable event chain | Backend (event logger) | Frontend (ledger page) |
| `payments` | Transaction records | Backend (payment engine) | Frontend (payments page) |
| `notifications` | Alerts and email logs | Backend (event triggers) | Frontend (notification feed) |

---

## Collection: `users`

Stores all registered users across the platform.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (auto) | ✅ | Firestore document ID |
| `uid` | string | ✅ | Firebase Auth UID (links to auth system) |
| `name` | string | ✅ | Full name of the user |
| `email` | string | ✅ | Email address (unique, verified) |
| `role` | string | ✅ | One of: `manufacturer`, `carrier`, `distributor`, `hospital`, `regulator` |
| `organization` | string | ✅ | Company or institution name |
| `location` | string | ✅ | City / Region |
| `avatar` | string | ❌ | Profile image URL (optional) |
| `verified` | boolean | ✅ | Whether email is verified |
| `trustScore` | number | ❌ | 0–100, calculated from delivery history (default: 80) |
| `activeShipments` | number | ❌ | Count of current active shipments (default: 0) |
| `createdAt` | timestamp | ✅ | Account creation time |
| `lastLoginAt` | timestamp | ❌ | Last login timestamp |

### Role Definitions

| Role | Can Create Shipment | Can Track | Can Confirm Delivery | Can Release Payment | Blockchain Audit |
|---|---|---|---|---|---|
| `manufacturer` | ✅ | ✅ | ❌ | ✅ (initiate) | ✅ |
| `carrier` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `distributor` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `hospital` | ❌ | ✅ | ✅ | ❌ | ✅ |
| `regulator` | ❌ | ✅ | ❌ | Override | Full access |

---

## Collection: `shipments`

Core collection storing all shipment records and their current state.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (auto) | ✅ | Firestore document ID |
| `shipmentId` | string | ✅ | Human-readable ID (format: `SHP-2026-XXXX`) |
| `product` | string | ✅ | Product name (e.g., "Covaxin", "Insulin Glargine") |
| `productCategory` | string | ✅ | One of: `vaccine`, `insulin`, `biologic` |
| `batchNumber` | string | ✅ | Manufacturer batch/lot number |
| `tempRange` | object | ✅ | `{ min: number, max: number }` — required temperature in °C |
| `quantity` | number | ✅ | Number of units/vials |
| `origin` | object | ✅ | `{ city: string, lat: number, lng: number }` |
| `destination` | object | ✅ | `{ city: string, lat: number, lng: number }` |
| `checkpoints` | array | ❌ | `[{ city, lat, lng, crossedAt }]` — route waypoints |
| `carrierId` | string | ✅ | User ID of assigned carrier |
| `receiverId` | string | ✅ | User ID of receiver (hospital/distributor) |
| `createdBy` | string | ✅ | User ID of creator (manufacturer) |
| `status` | string | ✅ | One of: `created`, `in-transit`, `at-risk`, `delivered`, `failed` |
| `priority` | string | ✅ | One of: `normal`, `urgent`, `critical` |
| `currentTemp` | number | ✅ | Latest temperature reading in °C |
| `currentHumidity` | number | ❌ | Latest humidity reading in % |
| `currentSpeed` | number | ❌ | Current speed in km/h |
| `currentLat` | number | ✅ | Current latitude |
| `currentLng` | number | ✅ | Current longitude |
| `riskScore` | number | ✅ | Current risk score 0–100 |
| `riskFactors` | object | ❌ | `{ temperature, delay, route, weather, cooling, transit }` — individual scores |
| `eta` | number | ❌ | Estimated time of arrival in minutes |
| `progress` | number | ✅ | Journey completion percentage 0–100 |
| `distanceTotal` | number | ❌ | Total route distance in km |
| `distanceCovered` | number | ❌ | Distance covered so far in km |
| `aiRecommendation` | string | ❌ | Latest Gemini recommendation text |
| `incidentReport` | string | ❌ | Gemini-generated incident report (if breach occurred) |
| `complianceReport` | string | ❌ | Gemini-generated compliance summary (after delivery) |
| `receiverSignature` | boolean | ✅ | Whether receiver has digitally signed (default: false) |
| `qrCodeUrl` | string | ❌ | Generated QR code verification URL |
| `createdAt` | timestamp | ✅ | Shipment creation time |
| `pickedUpAt` | timestamp | ❌ | When carrier picked up |
| `deliveredAt` | timestamp | ❌ | Delivery confirmation time |

### Status Transitions

```
created → in-transit → delivered
                    → at-risk → delivered
                              → failed
```

---

## Collection: `telemetry`

Time-series sensor data generated by the simulation engine. One document per reading, every 2–3 seconds during simulation.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (auto) | ✅ | Firestore document ID |
| `shipmentId` | string | ✅ | Reference to parent shipment |
| `temperature` | number | ✅ | Temperature in °C |
| `humidity` | number | ✅ | Humidity in % |
| `speed` | number | ✅ | Speed in km/h |
| `lat` | number | ✅ | GPS latitude |
| `lng` | number | ✅ | GPS longitude |
| `batteryLevel` | number | ❌ | Cooling unit battery % (0–100) |
| `isViolation` | boolean | ✅ | Whether this reading is outside safe range |
| `timestamp` | timestamp | ✅ | Reading timestamp |

### Indexing

Create a composite index on `shipmentId` + `timestamp` (ascending) for efficient timeline queries.

---

## Collection: `blockchain`

Append-only hash chain recording all significant events. Each document is a "block" linked to the previous by hash.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (auto) | ✅ | Firestore document ID |
| `blockNumber` | number | ✅ | Sequential block number (starts at 0 for genesis) |
| `eventType` | string | ✅ | Event type (see Event Types below) |
| `shipmentId` | string | ✅ | Reference to related shipment |
| `data` | object | ✅ | Event-specific payload (varies by event type) |
| `hash` | string | ✅ | SHA-256 hash of this block's content |
| `prevHash` | string | ✅ | Hash of previous block ("0" for genesis block) |
| `timestamp` | timestamp | ✅ | Block creation time |
| `verified` | boolean | ✅ | Chain integrity status (default: true) |
| `createdBy` | string | ✅ | User ID or "system" |

### Event Types

| Event Type | Trigger | Data Payload |
|---|---|---|
| `GENESIS` | System initialization | `{ message: "MediTrack AI Genesis Block" }` |
| `USER_REGISTERED` | New user signup | `{ userId, name, role, organization }` |
| `SHIPMENT_CREATED` | New shipment | `{ shipmentId, product, origin, destination, carrier }` |
| `SHIPMENT_PICKED_UP` | Carrier picks up | `{ shipmentId, carrierId, timestamp }` |
| `CHECKPOINT_CROSSED` | Passes waypoint | `{ shipmentId, checkpoint, lat, lng }` |
| `TEMP_VIOLATION` | Temp exceeds range | `{ shipmentId, temperature, threshold, duration }` |
| `TEMP_RECOVERED` | Temp returns to range | `{ shipmentId, temperature, recoveredAt }` |
| `DELAY_DETECTED` | Significant delay | `{ shipmentId, expectedEta, newEta, delayMinutes }` |
| `RISK_UPDATED` | Risk score changes | `{ shipmentId, oldScore, newScore, factors }` |
| `AI_RECOMMENDATION` | Gemini suggests action | `{ shipmentId, recommendation, riskReduction }` |
| `DELIVERED` | Shipment arrives | `{ shipmentId, receivedBy, temperature, condition }` |
| `SIGNATURE_RECEIVED` | Receiver signs | `{ shipmentId, signedBy, timestamp }` |
| `PAYMENT_HELD` | Payment escrowed | `{ paymentId, shipmentId, amount }` |
| `PAYMENT_RELEASED` | Payment completed | `{ paymentId, shipmentId, amount, conditions }` |
| `PAYMENT_DISPUTED` | Breach flagged | `{ paymentId, shipmentId, reason, severity }` |

### Hash Calculation

```javascript
hash = SHA256(blockNumber + eventType + shipmentId + JSON.stringify(data) + prevHash + timestamp)
```

---

## Collection: `payments`

Financial transaction records linked to shipments with conditional release logic.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (auto) | ✅ | Firestore document ID |
| `paymentId` | string | ✅ | Human-readable ID (format: `PAY-XXXX`) |
| `shipmentId` | string | ✅ | Reference to linked shipment |
| `payerId` | string | ✅ | User ID of payer (manufacturer) |
| `payerName` | string | ✅ | Organization name of payer |
| `payeeId` | string | ✅ | User ID of payee (carrier) |
| `payeeName` | string | ✅ | Organization name of payee |
| `amount` | number | ✅ | Payment amount in ₹ |
| `currency` | string | ✅ | Currency code (default: `INR`) |
| `status` | string | ✅ | One of: `created`, `held`, `under-review`, `released`, `disputed` |
| `conditions` | object | ✅ | See conditions object below |
| `disputeReason` | string | ❌ | Reason for dispute (if status is `disputed`) |
| `disputeSeverity` | string | ❌ | One of: `low`, `medium`, `high` |
| `blockchainRef` | string | ❌ | Block number of payment event |
| `createdAt` | timestamp | ✅ | Payment creation time |
| `heldAt` | timestamp | ❌ | When payment was escrowed |
| `releasedAt` | timestamp | ❌ | When payment was released |

### Conditions Object

```javascript
conditions: {
  deliveryConfirmed: false,   // Receiver confirmed receipt
  tempCompliance: false,      // Temperature stayed in range (or within tolerance)
  chainVerified: false,       // Blockchain chain integrity passed
  signatureReceived: false    // Receiver digitally signed
}
```

### Status Transitions

```
created → held → released          (happy path)
               → under-review → released   (minor breach, resolved)
               → under-review → disputed   (major breach)
```

---

## Collection: `notifications`

All alerts, emails, and system messages.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (auto) | ✅ | Firestore document ID |
| `type` | string | ✅ | One of: `alert`, `email`, `system`, `payment` |
| `severity` | string | ✅ | One of: `critical`, `warning`, `info` |
| `title` | string | ✅ | Short notification title |
| `message` | string | ✅ | Full notification message |
| `shipmentId` | string | ❌ | Related shipment (if applicable) |
| `userId` | string | ✅ | Target user ID |
| `read` | boolean | ✅ | Whether user has seen it (default: false) |
| `actionUrl` | string | ❌ | Link to relevant page |
| `emailSentTo` | string | ❌ | Email address (for email type) |
| `emailStatus` | string | ❌ | `sent`, `failed`, `pending` |
| `timestamp` | timestamp | ✅ | Notification creation time |

---

## Firestore Security Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT MODE — open access
    // Change to role-based rules before production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Before submission:** Replace with proper role-based security rules.

---

## Relationships Diagram

```
users (1) ──────┐
                ├──── shipments (many)
users (1) ──────┤        │
(carrier)       │        ├──── telemetry (many readings)
                │        ├──── blockchain (many blocks)
users (1) ──────┘        ├──── payments (1)
(receiver)               └──── notifications (many)
```

---

## Naming Conventions

| Convention | Rule | Example |
|---|---|---|
| Collection names | lowercase, plural | `shipments`, `users` |
| Field names | camelCase | `shipmentId`, `createdAt` |
| Enum values | lowercase, hyphenated | `in-transit`, `under-review` |
| IDs (human-readable) | UPPERCASE prefix + number | `SHP-2026-0042`, `PAY-0042` |
| Timestamps | Firestore `serverTimestamp()` | Auto-generated |

---

> **This schema is the integration contract between Mahi (backend) and Faizan (frontend).**
> Any changes must be communicated immediately to avoid breaking integration.
