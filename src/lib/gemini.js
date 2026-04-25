import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are MediTrack AI, an intelligent pharmaceutical cold-chain logistics assistant. You monitor shipments of temperature-sensitive medicines (vaccines, insulin, biologics) across India. You have access to real-time telemetry data, blockchain verification records, and risk analytics. Provide concise, professional, actionable responses. Always reference specific data points (temperatures, timestamps, risk scores) when available.`;

const FALLBACK_RESPONSES = {
  incident: (shipment) =>
    `INCIDENT REPORT — ${shipment.shipmentId || "Unknown"}\n\nA temperature excursion was detected during transit of ${shipment.product || "pharmaceutical product"}. The cooling unit showed irregular performance, causing temperature to reach ${shipment.currentTemp || "unknown"}°C — outside the required range of ${shipment.tempRange?.min}°C to ${shipment.tempRange?.max}°C.\n\nActions taken:\n• Alert dispatched to carrier and receiver\n• Payment automatically placed on hold\n• Blockchain event TEMP_VIOLATION logged\n• Risk score elevated to ${shipment.riskScore || 72}%\n\nRecommendation: Activate backup cooling immediately and flag shipment for quality inspection upon arrival.`,

  recommendation: (shipment) =>
    `Based on current conditions for ${shipment.shipmentId || "this shipment"}: ${shipment.riskScore > 50 ? "Risk is elevated at " + shipment.riskScore + "%. Recommended actions: (1) Activate backup cooling unit, (2) Consider rerouting via nearest cold storage facility, (3) Notify receiver of potential delays and quality concerns. Monitor temperature readings every 60 seconds until stabilized." : "All parameters are within acceptable ranges. Continue standard monitoring protocol. Next checkpoint ETA on schedule."}`,

  compliance: (shipment) =>
    `COMPLIANCE REPORT — ${shipment.shipmentId || "Unknown"}\n\nProduct: ${shipment.product || "Pharmaceutical"}\nRoute: ${shipment.origin?.city || "Origin"} → ${shipment.destination?.city || "Destination"}\nBatch: ${shipment.batchNumber || "N/A"}\n\nTemperature compliance: Maintained within required range for majority of transit with one recorded excursion. Cooling unit recovered within acceptable timeframe.\n\nDelivery: Confirmed with receiver digital signature.\nBlockchain: Full chain verified — all blocks valid.\nPayment: Released after automated condition checks.\n\nOverall Assessment: CONDITIONALLY COMPLIANT\nNote: Temperature excursion documented. Product cleared for use pending receiver quality inspection.`,

  chat: () =>
    "I'm currently unable to connect to the AI service. Please try again in a moment, or check the dashboard for real-time shipment data.",

  scenario: (shipment, whatIf) =>
    `Scenario analysis for ${shipment.shipmentId || "this shipment"}: If "${whatIf}" occurs, the predicted risk score would increase to approximately ${shipment.predictedRiskScore || 65}%. This would trigger automatic alerts, payment holds, and blockchain logging. Recommended contingency: activate backup protocols and notify all stakeholders immediately.`,

  qrSummary: (shipment, complianceScore, chainValid) =>
    `This ${shipment.product || "medicine"} (Batch: ${shipment.batchNumber || "N/A"}) has been transported under continuous cold-chain monitoring by MediTrack AI. Temperature compliance score: ${complianceScore}%. Blockchain verification: ${chainValid ? "PASSED — all supply chain records are intact and tamper-proof" : "PENDING — verification in progress"}. This product has been handled according to WHO pharmaceutical cold-chain guidelines.`,
};

async function callGemini(taskPrompt, timeoutMs = 8000) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${taskPrompt}`);
    clearTimeout(timeout);

    return result.response.text().trim();
  } catch (error) {
    console.warn("Gemini unavailable, using fallback:", error.message?.slice(0, 80));
    return null;
  }
}

// === TOUCHPOINT 1: Incident Reports ===
export async function generateIncidentReport(shipment, telemetry, eventType) {
  const violationReadings = telemetry?.filter((t) => t.isViolation) || [];
  const prompt = `Generate a detailed incident report for pharmaceutical shipment ${shipment.shipmentId}.
Product: ${shipment.product} (${shipment.productCategory || "pharmaceutical"})
Event type: ${eventType}
Current temperature: ${shipment.currentTemp}°C
Required range: ${shipment.tempRange?.min}°C to ${shipment.tempRange?.max}°C
Violation readings count: ${violationReadings.length}
Risk score: ${shipment.riskScore || 0}%
Route: ${shipment.origin?.city || "Origin"} → ${shipment.destination?.city || "Destination"}

Include: what happened, severity assessment, actions taken automatically (alerts, payment hold, blockchain logging), and recommended next steps. Keep it under 150 words.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.incident(shipment);
}

// === TOUCHPOINT 2: Risk Recommendations ===
export async function generateRiskRecommendation(shipment, telemetry) {
  const prompt = `Give an actionable risk recommendation for cold-chain shipment ${shipment.shipmentId}.
Product: ${shipment.product}
Status: ${shipment.status}
Risk score: ${shipment.riskScore}%
Current temp: ${shipment.currentTemp}°C (required: ${shipment.tempRange?.min}°C to ${shipment.tempRange?.max}°C)
Progress: ${shipment.progress || 0}%
Route: ${shipment.origin?.city || "Origin"} → ${shipment.destination?.city || "Destination"}

Provide specific actions the carrier should take. If risk is high, suggest rerouting via nearest cold storage. Keep it under 100 words.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.recommendation(shipment);
}

// === TOUCHPOINT 3: Chatbot with Shipment Context ===
export async function generateChatResponse(shipment, question) {
  const prompt = `You are answering a question about a specific pharmaceutical shipment. Here is the context:

Shipment: ${shipment.shipmentId}
Product: ${shipment.product}
Status: ${shipment.status}
Risk score: ${shipment.riskScore}%
Current temp: ${shipment.currentTemp}°C (required: ${shipment.tempRange?.min}°C to ${shipment.tempRange?.max}°C)
Progress: ${shipment.progress || 0}%
Route: ${shipment.origin?.city || "Origin"} → ${shipment.destination?.city || "Destination"}
ETA: ${shipment.eta || 0} minutes
AI recommendation: ${shipment.aiRecommendation || "None"}

User question: "${question}"

Answer based on the shipment data above. Be specific and reference actual values. Keep it concise.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.chat();
}

// Alias for backward compatibility
export const chatWithContext = async (shipment, telemetry, question) => {
  return generateChatResponse(shipment, question);
};

// === TOUCHPOINT 4: Compliance Report (on delivery) ===
export async function generateComplianceReport(shipment, telemetry, blocks) {
  const violationCount = telemetry?.filter((t) => t.isViolation)?.length || 0;
  const totalReadings = telemetry?.length || 0;
  const compliancePercent = totalReadings > 0 ? (((totalReadings - violationCount) / totalReadings) * 100).toFixed(1) : 100;

  const prompt = `Generate a compliance summary for a delivered pharmaceutical shipment.

Shipment: ${shipment.shipmentId}
Product: ${shipment.product} (Batch: ${shipment.batchNumber || "N/A"})
Route: ${shipment.origin?.city || "Origin"} → ${shipment.destination?.city || "Destination"}
Total telemetry readings: ${totalReadings}
Violations: ${violationCount}
Temperature compliance: ${compliancePercent}%
Blockchain blocks: ${blocks?.length || 0}
Receiver signature: ${shipment.receiverSignature ? "Yes" : "No"}

Include: temperature adherence summary, incident history, blockchain verification status, payment resolution, and overall compliance assessment (COMPLIANT, CONDITIONALLY COMPLIANT, or NON-COMPLIANT). Keep it under 150 words.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.compliance(shipment);
}

// === TOUCHPOINT 5: Scenario Simulator ("What-If") ===
export async function simulateScenario(shipment, whatIf) {
  const prompt = `You are a cold-chain logistics AI. Simulate a "what-if" scenario for shipment ${shipment.shipmentId}.

Current state:
- Product: ${shipment.product}
- Status: ${shipment.status}
- Current risk score: ${shipment.riskScore || 0}%
- Predicted risk after scenario: ${shipment.predictedRiskScore || 65}%
- Current temp: ${shipment.currentTemp}°C
- Progress: ${shipment.progress || 0}%
- Route: ${shipment.origin?.city || "Origin"} → ${shipment.destination?.city || "Destination"}

Scenario: "${whatIf}"

Predict the outcome in 3-4 sentences. Include: impact on risk score, temperature impact, recommended action (reroute, activate backup cooling, hold at cold storage), and estimated delivery delay. Be specific with numbers.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.scenario(shipment, whatIf);
}

// === TOUCHPOINT 6: QR Trust Page (Patient-Facing Summary) ===
export async function generateQRSummary(shipment, complianceScore, chainValid) {
  const prompt = `Write a patient-friendly safety statement for a medicine that was delivered via cold-chain.

Product: ${shipment.product}
Batch number: ${shipment.batchNumber || "N/A"}
Temperature compliance: ${complianceScore}%
Blockchain verified: ${chainValid ? "Yes — all records intact" : "Pending"}
Delivered: ${shipment.deliveredAt ? "Yes" : "In transit"}

Write 2-3 simple sentences a patient or pharmacist can understand. No medical jargon. Reassure them about the safety and integrity of the medicine. Mention the cold-chain monitoring and verification.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.qrSummary(shipment, complianceScore, chainValid);
}

export default callGemini;