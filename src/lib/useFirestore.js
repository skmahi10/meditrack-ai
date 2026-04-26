"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "shipments"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt,
          pickedUpAt: d.pickedUpAt?.toDate?.()?.toISOString() || d.pickedUpAt,
          deliveredAt: d.deliveredAt?.toDate?.()?.toISOString() || d.deliveredAt,
        };
      });
      setShipments(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore shipments error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { shipments, loading };
}

export function useTelemetry(shipmentId) {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) {
      setTelemetry([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "telemetry"),
      where("shipmentId", "==", shipmentId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        const ts = d.timestamp?.toDate?.() || new Date(d.timestamp);
        return {
          ...d,
          time: ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        };
      });
      setTelemetry(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore telemetry error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shipmentId]);

  return { telemetry, loading };
}

export function useBlockchain(shipmentId) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "blockchain"),
      where("shipmentId", "==", shipmentId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => a.blockNumber - b.blockNumber);
      setBlocks(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore blockchain error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shipmentId]);

  return { blocks, loading };
}

export function usePayments(userId) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (userId) {
      q = query(collection(db, "payments"), where("payerId", "==", userId));
    } else {
      q = query(collection(db, "payments"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        heldAt: doc.data().heldAt?.toDate?.()?.toISOString() || doc.data().heldAt,
        releasedAt: doc.data().releasedAt?.toDate?.()?.toISOString() || doc.data().releasedAt,
      }));
      setPayments(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore payments error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { payments, loading };
}

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (userId) {
      q = query(collection(db, "notifications"), where("userId", "==", userId));
    } else {
      q = query(collection(db, "notifications"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      }));
      // Sort client-side to avoid needing another composite index
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore notifications error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
}