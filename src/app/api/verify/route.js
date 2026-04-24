import { db } from "../../../lib/firebase-admin.js";
import { verifyChain } from "../../../lib/blockchain.js";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request) {
  try {
    const { shipmentId } = await request.json();

    if (!shipmentId) {
      return jsonError("shipmentId is required", 400);
    }

    const result = await verifyChain(db, shipmentId);
    const totalBlocks = result.blocks.length;

    if (!result.valid) {
      return Response.json({
        valid: false,
        shipmentId,
        totalBlocks,
        blocks: result.blocks,
        message: `${result.error}. Blocks from #${result.tamperedAt} cannot be trusted.`,
        tamperedAt: result.tamperedAt,
      });
    }

    return Response.json({
      valid: true,
      shipmentId,
      totalBlocks,
      blocks: result.blocks,
      message: `All ${totalBlocks} blocks verified. Chain integrity: VALID.`,
    });
  } catch (error) {
    console.error("Verification failed:", error);
    return jsonError(error.message || "Verification failed", 500);
  }
}
