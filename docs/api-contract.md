# MediTrack AI — API Contract

> This document defines all API endpoints for MediTrack AI.
> Backend (Mahi) implements these as Next.js API Routes in `src/app/api/`.
> Frontend (Faizan) calls these endpoints using `fetch("/api/endpoint")`.
> **Do not change request/response shapes without notifying the other person.**

---

## Base URL

| Environment | Base URL |
|---|---|
| Local Development | `http://localhost:3000/api` |
| Production (Vercel) | `https://meditrack-ai.vercel.app/api` |

All endpoints accept and return **JSON**.
All endpoints use **POST** method unless specified otherwise.

---

## Endpoints

---

### 1. `POST /api/simulation`

**Purpose:** Start the digital twin simulation for a shipment.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Simulation started for SHP-2026-0042",
  "estimatedDuration": 55
}
```

**Side Effects:**
- Updates `shipments` document status to `in-transit`
- Starts writing `telemetry` documents every 2–3 seconds
- Creates `blockchain` block: `SHIPMENT_PICKED_UP`
- Creates `payments` record with status `held`
- Creates `notifications` for carrier and receiver
- At ~40% progress: triggers temperature breach event
- At 100%: triggers delivery event

**Error Response:**
```json
{
  "success": false,
  "error": "Shipment not found"
}
```

---

### 2. `POST /api/chat`

**Purpose:** Gemini-powered chatbot with shipment context.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042",
  "question": "Why is the risk score high?"
}
```

**Response:**
```json
{
  "answer": "The risk score for SHP-2026-0042 is currently at 72% due to a temperature violation detected near Jaipur. The cooling unit recorded -5°C, which is 13°C above the required -18°C threshold. Traffic delays have also contributed, adding 20% to the delay risk factor. I recommend activating backup cooling and notifying the receiver of a potential 2-hour delay.",
  "shipmentId": "SHP-2026-0042",
  "riskScore": 72,
  "timestamp": "2026-04-22T14:32:07Z"
}
```

---

### 3. `POST /api/risk`

**Purpose:** Get AI-powered risk analysis for a shipment.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042"
}
```

**Response:**
```json
{
  "shipmentId": "SHP-2026-0042",
  "riskScore": 72,
  "riskLevel": "high",
  "factors": {
    "temperature": { "score": 85, "weight": 0.30, "detail": "13°C above threshold for 8 minutes" },
    "delay": { "score": 60, "weight": 0.20, "detail": "22 minutes behind schedule" },
    "route": { "score": 40, "weight": 0.15, "detail": "On planned route, 62% completed" },
    "weather": { "score": 30, "weight": 0.15, "detail": "Clear conditions, no hazards" },
    "cooling": { "score": 90, "weight": 0.10, "detail": "Cooling unit showing irregular pattern" },
    "transit": { "score": 50, "weight": 0.10, "detail": "6 hours elapsed of 12 hour journey" }
  },
  "recommendation": "Activate backup cooling unit immediately. Current trajectory suggests 40% spoilage probability if conditions persist. Consider rerouting via Ahmedabad cold storage facility.",
  "predictedOutcome": "If temperature is not corrected within 15 minutes, product viability drops below acceptable threshold.",
  "timestamp": "2026-04-22T14:32:07Z"
}
```

---

### 4. `POST /api/verify`

**Purpose:** Verify blockchain chain integrity for a shipment.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042"
}
```

**Response (Valid Chain):**
```json
{
  "valid": true,
  "shipmentId": "SHP-2026-0042",
  "totalBlocks": 8,
  "blocks": [
    {
      "blockNumber": 0,
      "eventType": "SHIPMENT_CREATED",
      "hash": "a3f8c2...",
      "prevHash": "0",
      "verified": true,
      "timestamp": "2026-04-22T10:00:00Z"
    },
    {
      "blockNumber": 1,
      "eventType": "PAYMENT_HELD",
      "hash": "7b2e1d...",
      "prevHash": "a3f8c2...",
      "verified": true,
      "timestamp": "2026-04-22T10:00:02Z"
    }
  ],
  "message": "All 8 blocks verified. Chain integrity: VALID."
}
```

**Response (Tampered Chain):**
```json
{
  "valid": false,
  "shipmentId": "SHP-2026-0042",
  "totalBlocks": 8,
  "tamperedAt": 4,
  "message": "Chain integrity broken at block #4. Blocks 4-8 cannot be trusted."
}
```

---

### 5. `POST /api/incident`

**Purpose:** Generate a Gemini-powered incident report.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042",
  "eventType": "TEMP_VIOLATION"
}
```

**Response:**
```json
{
  "report": "INCIDENT REPORT — SHP-2026-0042\n\nAt 14:32 IST on April 22, 2026, shipment SHP-2026-0042 (Covaxin, 500 units) experienced a cooling system malfunction near Jaipur, Rajasthan. Temperature rose from the required -18°C to -5°C over a period of 8 minutes.\n\nRoot Cause: Cooling unit battery dropped to 15%, triggering reduced cooling output.\n\nImpact Assessment: Moderate — product was exposed to out-of-range temperatures for 8 minutes. According to WHO guidelines, brief excursions of this magnitude may not compromise vaccine viability if corrected promptly.\n\nActions Taken: Alert dispatched to all stakeholders. Payment automatically placed on hold. Blockchain event logged (Block #5).\n\nRecommendation: Activate backup cooling. Flag shipment for quality inspection upon arrival.",
  "severity": "moderate",
  "shipmentId": "SHP-2026-0042",
  "eventType": "TEMP_VIOLATION",
  "timestamp": "2026-04-22T14:32:07Z"
}
```

---

### 6. `POST /api/compliance`

**Purpose:** Generate a delivery compliance summary after shipment is delivered.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042"
}
```

**Response:**
```json
{
  "summary": "COMPLIANCE REPORT — SHP-2026-0042\n\nProduct: Covaxin (500 units)\nRoute: Mumbai → Delhi (1,420 km)\nTransit Time: 11 hours 45 minutes\n\nTemperature Compliance: 94.2%\n- Required range: -20°C to -15°C\n- Average maintained: -17.8°C\n- One excursion detected: -5°C for 8 minutes near Jaipur\n- Temperature recovered to safe range after cooling unit restart\n\nDelivery Status: Confirmed by Apollo Hospital Delhi\nReceiver Signature: Verified\nBlockchain Verification: All 12 blocks valid\n\nOverall Assessment: CONDITIONALLY COMPLIANT\nNote: 8-minute temperature excursion flagged. Recommend quality inspection before administration.",
  "complianceScore": 94.2,
  "status": "conditional",
  "shipmentId": "SHP-2026-0042",
  "timestamp": "2026-04-22T21:45:00Z"
}
```

---

### 7. `POST /api/scenario`

**Purpose:** "What-if" scenario simulation using Gemini.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042",
  "whatIf": "What if temperature rises by 5°C for 30 minutes?"
}
```

**Response:**
```json
{
  "prediction": "If the temperature rises by 5°C (from -18°C to -13°C) and remains elevated for 30 minutes, the risk score would increase from 34% to 68%. At -13°C, Covaxin remains within WHO-acceptable thermal tolerance for up to 45 minutes. However, if the excursion extends beyond 45 minutes, vaccine potency drops below 80% efficacy threshold. Immediate action: activate backup cooling and reduce transit speed to minimize heat generation.",
  "currentRiskScore": 34,
  "predictedRiskScore": 68,
  "riskChange": "+34%",
  "urgency": "high",
  "shipmentId": "SHP-2026-0042",
  "timestamp": "2026-04-22T14:00:00Z"
}
```

---

### 8. `POST /api/qr-summary`

**Purpose:** Get patient-facing safety summary for QR verification page.

**Request:**
```json
{
  "shipmentId": "SHP-2026-0042"
}
```

**Response:**
```json
{
  "shipmentId": "SHP-2026-0042",
  "product": "Covaxin",
  "batchNumber": "CVX-2026-BN-4421",
  "manufacturer": "Serum Institute of India",
  "safetyStatement": "This vaccine was transported from Mumbai to Delhi over 11 hours and 45 minutes. Temperature was maintained within the safe range for 94.2% of the journey. A brief 8-minute excursion was detected and corrected. Based on WHO thermal stability guidelines, this vaccine meets safety standards for administration.",
  "verified": true,
  "chainIntegrity": "VALID",
  "totalBlocks": 12,
  "temperatureCompliance": 94.2,
  "deliveredAt": "2026-04-22T21:45:00Z",
  "verifiedBy": "MediTrack AI"
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

| HTTP Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request (missing or invalid fields) |
| 404 | Shipment or resource not found |
| 500 | Server error (Gemini API failure, database error) |

---

## Rate Limits

| Endpoint | Limit | Reason |
|---|---|---|
| `/api/chat` | 15 req/min | Gemini API free tier limit |
| `/api/risk` | 15 req/min | Gemini API free tier limit |
| `/api/scenario` | 15 req/min | Gemini API free tier limit |
| `/api/simulation` | 1 concurrent | One simulation at a time |
| All others | No limit | Firestore handles scaling |

---

## Frontend Integration Examples

### Faizan — How to Call Any Endpoint

```javascript
// Generic pattern
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    shipmentId: "SHP-2026-0042",
    question: "Why is risk high?"
  })
});

const data = await response.json();
console.log(data.answer);
```

### Faizan — How to Read Real-Time Data from Firestore

```javascript
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

// Listen to shipment updates (real-time)
const q = query(collection(db, "shipments"), where("status", "==", "in-transit"));

onSnapshot(q, (snapshot) => {
  const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Update UI with shipments array
});

// Listen to telemetry for charts (real-time)
const telQ = query(
  collection(db, "telemetry"),
  where("shipmentId", "==", "SHP-2026-0042"),
  orderBy("timestamp", "asc")
);

onSnapshot(telQ, (snapshot) => {
  const readings = snapshot.docs.map(doc => doc.data());
  // Feed to Recharts LineChart
});
```

---

> **This contract is the integration bridge between Mahi and Faizan.**
> Mahi implements the endpoints. Faizan calls them.
> If either person changes a request/response shape, notify the other immediately.
