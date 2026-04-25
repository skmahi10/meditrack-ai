const FROM = "MediTrack AI <onboarding@resend.dev>";

async function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

function dashboardLink(shipmentId) {
  return `/shipments/${shipmentId}`;
}

function htmlShell(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
      <h2 style="color:#075985;margin-bottom:8px">MediTrack AI</h2>
      <h3 style="margin-top:0">${title}</h3>
      ${body}
      <p style="font-size:12px;color:#64748b;margin-top:24px">Open intelligent cold-chain supply chain platform for pharmaceutical logistics.</p>
    </div>
  `;
}

async function sendEmail({ to, subject, html }) {
  try {
    const resend = await getResendClient();

    if (!resend || !to) {
      return { success: false, status: "pending", error: "Email client or recipient unavailable" };
    }

    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    return { success: true, status: "sent", id: result.data?.id || null };
  } catch (error) {
    console.error("Resend email failed:", error);
    return { success: false, status: "failed", error: error.message };
  }
}

export async function sendBreachAlert(toEmail, shipmentData, breachDetails) {
  return sendEmail({
    to: toEmail,
    subject: `Critical temperature breach: ${shipmentData.shipmentId}`,
    html: htmlShell(
      "Temperature Breach Alert",
      `
        <p><strong>${shipmentData.product}</strong> shipment ${shipmentData.shipmentId} has exceeded its required temperature range.</p>
        <p>Recorded temperature: <strong>${breachDetails.temperature}°C</strong><br/>
        Required range: ${shipmentData.tempRange.min}°C to ${shipmentData.tempRange.max}°C<br/>
        Cooling battery: ${breachDetails.batteryLevel}%</p>
        <p>Recommended action: inspect cooling unit immediately and keep the receiver informed.</p>
        <p><a href="${dashboardLink(shipmentData.shipmentId)}">Open dashboard</a></p>
      `,
    ),
  });
}

export async function sendDeliveryConfirmation(toEmail, shipmentData) {
  return sendEmail({
    to: toEmail,
    subject: `Delivery confirmed: ${shipmentData.shipmentId}`,
    html: htmlShell(
      "Delivery and Payment Confirmation",
      `
        <p>Shipment <strong>${shipmentData.shipmentId}</strong> for ${shipmentData.product} has been delivered.</p>
        <p>Receiver signature: ${shipmentData.receiverSignature ? "received" : "pending"}<br/>
        Payment status: released after verification.</p>
        <p><a href="${dashboardLink(shipmentData.shipmentId)}">Review shipment</a></p>
      `,
    ),
  });
}

export async function sendShipmentCreated(toEmail, shipmentData) {
  return sendEmail({
    to: toEmail,
    subject: `Shipment assigned: ${shipmentData.shipmentId}`,
    html: htmlShell(
      "New Cold-Chain Shipment",
      `
        <p>You have been assigned to shipment <strong>${shipmentData.shipmentId}</strong>.</p>
        <p>Product: ${shipmentData.product}<br/>
        Quantity: ${shipmentData.quantity}<br/>
        Route: ${shipmentData.origin.city} to ${shipmentData.destination.city}<br/>
        Temperature range: ${shipmentData.tempRange.min}°C to ${shipmentData.tempRange.max}°C</p>
        <p><a href="${dashboardLink(shipmentData.shipmentId)}">Open dashboard</a></p>
      `,
    ),
  });
}
