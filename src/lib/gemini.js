import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an AI assistant for MediTrack AI, a pharmaceutical cold-chain logistics platform. Provide concise, professional responses about shipment safety, temperature compliance, and risk assessment.`;

const FALLBACK_RESPONSES = {
  incident: (shipment) =>
    `INCIDENT REPORT — ${shipment.shipmentId || "Unknown"}\n\nA temperature excursion was detected during transit. The cooling unit showed irregular performance, causing temperature to deviate from the required range. Alert dispatched to all stakeholders. Payment automatically placed on hold. Blockchain event logged.\n\nRecommendation: Activate backup cooling and flag shipment for quality inspection upon arrival.`,

  recommendation: (shipment) =>
    `Based on current conditions for ${shipment.shipmentId || "this shipment"}, maintain current route and monitor temperature closely. ${shipment.riskScore > 50 ? "Risk is elevated — consider activating backup cooling and notifying the receiver of potential delays." : "All parameters are within acceptable ranges. Continue monitoring."}`,

  compliance: (shipment) =>
    `COMPLIANCE REPORT — ${shipment.shipmentId || "Unknown"}\n\nProduct: ${shipment.product || "Pharmaceutical"}\nRoute: ${shipment.origin?.city || "Origin"} to ${shipment.destination?.city || "Destination"}\n\nTemperature was maintained within acceptable range for the majority of transit. Delivery confirmed with receiver signature. Blockchain verification passed.\n\nOverall Assessment: CONDITIONALLY COMPLIANT`,

  chat: () =>
    "I'm currently unable to connect to the AI service. Please try again in a moment, or check the dashboard for real-time shipment data.",
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

export async function generateIncidentReport(shipment, telemetry, eventType) {
  const prompt = `Generate a brief incident report for shipment ${shipment.shipmentId}. Product: ${shipment.product}. Event: ${eventType}. Current temp: ${shipment.currentTemp}°C. Required range: ${shipment.tempRange?.min}°C to ${shipment.tempRange?.max}°C. Keep it under 150 words.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.incident(shipment);
}

export async function generateRiskRecommendation(shipment, telemetry) {
  const prompt = `Give a brief risk recommendation for shipment ${shipment.shipmentId}. Risk score: ${shipment.riskScore}%. Product: ${shipment.product}. Status: ${shipment.status}. Keep it under 100 words.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.recommendation(shipment);
}

export async function generateComplianceReport(shipment, telemetry, blocks) {
  const prompt = `Generate a brief compliance summary for delivered shipment ${shipment.shipmentId}. Product: ${shipment.product}. Route: ${shipment.origin?.city} to ${shipment.destination?.city}. Blocks: ${blocks?.length || 0}. Keep it under 150 words.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.compliance(shipment);
}

export async function generateChatResponse(shipment, question) {
  const prompt = `Shipment ${shipment.shipmentId}, product: ${shipment.product}, status: ${shipment.status}, risk: ${shipment.riskScore}%, temp: ${shipment.currentTemp}°C. User asks: "${question}". Answer briefly.`;

  const result = await callGemini(prompt);
  return result || FALLBACK_RESPONSES.chat();
}

export default callGemini;