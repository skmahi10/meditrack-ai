import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "You are MediTrack AI, an intelligent cold-chain pharmaceutical logistics assistant. You analyze real-time shipment data including temperature, GPS, blockchain audit trails, and risk factors. Be concise, professional, data-driven. Reference specific numbers and events from the provided data.";

function summarizeContext(shipmentData, telemetryData = [], blockchainData = []) {
  return JSON.stringify(
    {
      shipment: shipmentData,
      telemetry: telemetryData.slice(-20),
      blockchain: blockchainData.slice(-20),
    },
    null,
    2,
  );
}

async function callGemini(taskPrompt, fallback) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return fallback;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${taskPrompt}`);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini request failed:", error);
    return fallback;
  }
}

export async function chatWithContext(shipmentData, telemetryData, question) {
  const fallback = `Shipment ${shipmentData.shipmentId} is currently ${shipmentData.status} with risk score ${shipmentData.riskScore}. Latest temperature is ${shipmentData.currentTemp}°C against the required range ${shipmentData.tempRange.min}°C to ${shipmentData.tempRange.max}°C.`;

  return callGemini(
    `Answer this operator question using the shipment context.\nQuestion: ${question}\nContext:\n${summarizeContext(
      shipmentData,
      telemetryData,
    )}`,
    fallback,
  );
}

export async function generateRiskRecommendation(shipmentData, telemetryData) {
  const latest = telemetryData[telemetryData.length - 1] || {};
  const fallback = `Risk is ${shipmentData.riskScore || 45}/100. Monitor temperature closely, verify cooling battery level ${
    latest.batteryLevel ?? "unknown"
  }%, and keep carrier and receiver informed until the shipment is delivered.`;

  return callGemini(
    `Generate a concise risk recommendation for this shipment.\nContext:\n${summarizeContext(
      shipmentData,
      telemetryData,
    )}`,
    fallback,
  );
}

export async function generateIncidentReport(shipmentData, telemetryData, eventType) {
  const violations = telemetryData.filter((reading) => reading.isViolation);
  const worst = violations.reduce(
    (max, reading) =>
      Math.abs(reading.temperature) > Math.abs(max.temperature || 0) ? reading : max,
    violations[0] || {},
  );
  const fallback = `INCIDENT REPORT - ${shipmentData.shipmentId}\n\nEvent: ${eventType}. ${shipmentData.product} experienced a temperature excursion with worst recorded temperature ${worst.temperature ?? shipmentData.currentTemp}°C against required range ${shipmentData.tempRange.min}°C to ${shipmentData.tempRange.max}°C. Cooling battery and route telemetry indicate this was likely caused by cooling unit degradation. Alert stakeholders, inspect product quality at delivery, and retain the blockchain audit trail for review.`;

  return callGemini(
    `Generate a formal incident report with what happened, root cause, impact, actions taken, and recommendation.\nEvent type: ${eventType}\nContext:\n${summarizeContext(
      shipmentData,
      telemetryData,
    )}`,
    fallback,
  );
}

export async function generateComplianceReport(shipmentData, telemetryData, blockchainData) {
  const total = telemetryData.length || 1;
  const compliant = telemetryData.filter((reading) => !reading.isViolation).length;
  const compliance = ((compliant / total) * 100).toFixed(1);
  const fallback = `COMPLIANCE REPORT - ${shipmentData.shipmentId}\n\nProduct: ${shipmentData.product} (${shipmentData.quantity} units). Temperature compliance was ${compliance}%. Delivery status: ${shipmentData.status}. Blockchain records available: ${blockchainData.length}. Overall assessment: conditionally compliant if quality inspection accepts the brief excursion.`;

  return callGemini(
    `Generate a compliance summary including temperature compliance percentage, excursions, delivery status, blockchain status, and overall assessment.\nContext:\n${summarizeContext(
      shipmentData,
      telemetryData,
      blockchainData,
    )}`,
    fallback,
  );
}

export async function simulateScenario(shipmentData, whatIf) {
  const fallback = `If "${whatIf}" occurs, estimated risk may change from ${shipmentData.riskScore || 0}/100 depending on temperature stability, cooling battery, and delay. Prioritize maintaining ${shipmentData.tempRange.min}°C to ${shipmentData.tempRange.max}°C and confirm route progress.`;

  return callGemini(
    `Simulate this what-if scenario and describe operational impact with a predicted risk direction.\nScenario: ${whatIf}\nShipment:\n${summarizeContext(
      shipmentData,
    )}`,
    fallback,
  );
}

export async function generateQRSummary(shipmentData, complianceScore, blockchainValid) {
  const fallback = `${shipmentData.product} batch ${shipmentData.batchNumber} was delivered with a compliance score of ${complianceScore}%. The blockchain audit trail is ${
    blockchainValid ? "verified" : "not verified"
  }. Patients should use this medicine only after the receiving facility completes standard quality checks.`;

  return callGemini(
    `Create a patient-friendly safety statement in plain English. Avoid jargon and mention verification status.\nShipment:\n${summarizeContext(
      shipmentData,
    )}\nCompliance score: ${complianceScore}\nBlockchain valid: ${blockchainValid}`,
    fallback,
  );
}
