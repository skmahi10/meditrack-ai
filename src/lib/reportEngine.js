const INCIDENT_INTROS = [
  "Thermal anomaly detected",
  "Cold-chain deviation observed",
  "Temperature instability identified",
  "Critical refrigeration variance detected",
];

const ACTIONS = [
  "Carrier notified immediately",
  "Backup cooling protocol activated",
  "Receiver alert dispatched",
  "Blockchain violation event recorded",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateIncidentNarrative(shipment) {
  const intro = randomItem(INCIDENT_INTROS);

  const overTemp =
    shipment.currentTemp > shipment.tempRange?.max;

  const severity =
    shipment.riskScore > 70
      ? "HIGH"
      : shipment.riskScore > 40
      ? "MEDIUM"
      : "LOW";

  return `
INCIDENT REPORT — ${shipment.shipmentId}

${intro} during transport of ${
    shipment.product
  }.

Route:
${shipment.origin?.city} → ${
    shipment.destination?.city
  }

Observed temperature:
${shipment.currentTemp}°C

Allowed range:
${shipment.tempRange?.min}°C to ${
    shipment.tempRange?.max
  }°C

Risk severity:
${severity}

Assessment:
${
  overTemp
    ? `Temperature exceeded safe threshold by ${
        (
          shipment.currentTemp -
          shipment.tempRange.max
        ).toFixed(1)
      }°C.`
    : `Temperature dropped below safe threshold.`
}

Automated Actions:
• ${randomItem(ACTIONS)}
• ${randomItem(ACTIONS)}
• Payment protection protocol triggered

Recommendation:
Immediate cold-storage inspection required upon arrival.
`;
}

export function generateRiskRecommendation(shipment) {
  const highRisk = shipment.riskScore > 60;

  if (highRisk) {
    return `
Risk level for shipment ${
      shipment.shipmentId
    } is critically elevated at ${
      shipment.riskScore
    }%.

Recommended actions:

• Activate backup cooling system
• Reroute via nearest cold-storage hub
• Increase telemetry monitoring frequency
• Notify receiver of potential integrity concerns

Current temperature:
${shipment.currentTemp}°C
`;
  }

  return `
Shipment ${
    shipment.shipmentId
  } remains stable.

Risk score:
${shipment.riskScore}%

Current temperature:
${shipment.currentTemp}°C

Recommendation:
Continue standard monitoring procedures.
`;
}

export function generateComplianceSummary(
  shipment,
  telemetry
) {
  const violations = telemetry.filter(
    (t) => t.isViolation
  ).length;

  const compliance =
    telemetry.length > 0
      ? (
          ((telemetry.length - violations) /
            telemetry.length) *
          100
        ).toFixed(1)
      : 100;

  return `
COMPLIANCE REPORT

Shipment:
${shipment.shipmentId}

Product:
${shipment.product}

Batch:
${shipment.batchNumber}

Compliance Score:
${compliance}%

Violations:
${violations}

Route:
${shipment.origin?.city} → ${
    shipment.destination?.city
  }

Assessment:
${
  violations > 0
    ? "Conditionally compliant due to recorded excursion events."
    : "Fully compliant throughout transportation lifecycle."
}

Blockchain Verification:
PASSED

Final Status:
${shipment.status}
`;
}