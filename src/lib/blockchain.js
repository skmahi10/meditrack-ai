import crypto from "crypto";

const GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

function hashPayload(blockData) {
  return {
    blockNumber: blockData.blockNumber,
    eventType: blockData.eventType,
    shipmentId: blockData.shipmentId,
    data: blockData.data,
    prevHash: blockData.prevHash,
    timestamp: blockData.timestamp,
  };
}

export function generateHash(blockData) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(hashPayload(blockData)))
    .digest("hex");
}

export async function addBlock(db, { shipmentId, eventType, data, timestamp }) {
  const lastSnapshot = await db
    .collection("blockchain")
    .where("shipmentId", "==", shipmentId)
    .get();

  const blocks = lastSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => b.blockNumber - a.blockNumber);
  const lastBlock = blocks[0] || null;
  const blockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
  const prevHash = lastBlock ? lastBlock.hash : GENESIS_PREV_HASH;
  const blockTimestamp = timestamp || new Date().toISOString();

  const blockRef = db.collection("blockchain").doc();
  const block = {
    id: blockRef.id,
    blockNumber,
    eventType,
    shipmentId,
    data,
    prevHash,
    timestamp: blockTimestamp,
    verified: true,
  };

  block.hash = generateHash(block);

  await blockRef.set(block);
  return block;
}

export async function verifyChain(db, shipmentId) {
  const snapshot = await db
    .collection("blockchain")
    .where("shipmentId", "==", shipmentId)
    .get();

  const blocks = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.blockNumber - b.blockNumber);
  let previousHash = GENESIS_PREV_HASH;

  for (const block of blocks) {
    const expectedHash = generateHash(block);

    if (block.hash !== expectedHash) {
      return {
        valid: false,
        blocks,
        error: `Hash mismatch at block #${block.blockNumber}`,
        tamperedAt: block.blockNumber,
      };
    }

    if (block.prevHash !== previousHash) {
      return {
        valid: false,
        blocks,
        error: `Chain link mismatch at block #${block.blockNumber}`,
        tamperedAt: block.blockNumber,
      };
    }

    previousHash = block.hash;
  }

  return { valid: true, blocks };
}

export { GENESIS_PREV_HASH };
