import { Request, Response } from "express";

const streams = new Map<string, Response>();

export function openStream(reqId: string, res: Response) {
  streams.set(reqId, res);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders?.(); // ensures headers are actually sent

  res.write(`data: ✅ Stream opened for ${reqId}\n\n`);
}

export function pushEvent(reqId: string, message: string) {
  const res = streams.get(reqId);
  if (!res) return console.log(`[SSE] No open stream for ${reqId}`);
  res.write(`data: ${message}\n\n`);
}

export function closeStream(reqId: string) {
  const res = streams.get(reqId);
  if (res) {
    res.write(`data: 🔚 Stream closed\n\n`);
    res.end();
  }
  streams.delete(reqId);
}
