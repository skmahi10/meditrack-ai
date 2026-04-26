
import {
  generateIncidentNarrative,
  generateRiskRecommendation as generateRuleRisk,
  generateComplianceSummary,
} from "./reportEngine";

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

async function callGemini(taskPrompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Missing Gemini API key");
      return null;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\n${taskPrompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini API Error:",
        data
      );
      return null;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error(
      "Gemini fetch failed:",
      error
    );

    return null;
  }
}

// === TOUCHPOINT 1: Incident Reports ===
export async function generateIncidentReport(
  shipment
) {
  return generateIncidentNarrative(shipment);
}

// === TOUCHPOINT 2: Risk Recommendations ===
export async function generateRiskRecommendation(
  shipment
) {
  return generateRuleRisk(shipment);
}

// === TOUCHPOINT 3: Chatbot with Shipment Context ===
export async function generateChatResponse(
  shipment,
  question
) {
    if (
    !shipment ||
    !shipment.shipmentId
  ) {
    const prompt = `
You are MediTrack AI.

The user has not provided a shipment ID yet.

Ask them politely to provide a shipment ID so you can help analyze shipment telemetry, risks, ETA, blockchain verification, and cold-chain status.

User message:
${question}
`;

    const result =
      await callGemini(prompt);

    return (
      result ||
      "Please provide a shipment ID so I can assist you."
    );
  }
  const lowerQ = question.toLowerCase();

  const isGreeting =
    lowerQ.includes("hi") ||
    lowerQ.includes("hello") ||
    lowerQ.includes("hey");

  const isGeneral =
    lowerQ.includes("who are you") ||
    lowerQ.includes("what can you do");

  let prompt = "";

  if (isGreeting) {
    prompt = `
You are MediTrack AI.

The user greeted you.

Respond naturally and briefly like a professional AI logistics assistant.
`;
  } else if (isGeneral) {
    prompt = `
You are MediTrack AI.

Briefly explain your capabilities as a pharmaceutical cold-chain logistics AI assistant.
`;
  } else {
    prompt = `
You are MediTrack AI.

You are helping monitor a pharmaceutical shipment.

IMPORTANT:
- Answer ONLY the user's question
- Do NOT generate full reports unless asked
- Keep answers concise
- Be conversational and operational

SHIPMENT DATA:

Shipment ID: ${shipment.shipmentId}
Product: ${shipment.product}
Status: ${shipment.status}

Temperature:
${shipment.currentTemp}°C

Allowed Range:
${shipment.tempRange?.min}°C to ${shipment.tempRange?.max}°C

Risk Score:
${shipment.riskScore}%

Humidity:
${shipment.currentHumidity || "N/A"}%

Route:
${shipment.origin?.city} → ${shipment.destination?.city}

ETA:
${shipment.eta || "Unknown"} minutes

USER QUESTION:
${question}

ANSWER:
`;
  }

  const result = await callGemini(prompt);

  return (
    result ||
    "AI assistant temporarily unavailable."
  );
}

// Alias for backward compatibility
export const chatWithContext = async (shipment, telemetry, question) => {
  return generateChatResponse(shipment, question);
 
};

// === TOUCHPOINT 4: Compliance Report (on delivery) ===
export async function generateComplianceReport(
  shipment,
  telemetry
) {
  return generateComplianceSummary(
    shipment,
    telemetry || []
  );
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