import type { NextApiRequest, NextApiResponse } from "next";
import https from "https";
import fetch, { Headers } from "node-fetch";

// ─────────────────────────────────────────────────────────────
// 1) Backend origin with your self‑signed certificate
// ─────────────────────────────────────────────────────────────
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_API ;

// Reject‑unauthorised false **only** on the server side
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

// ─────────────────────────────────────────────────────────────
// 2) Universal proxy handler
// ─────────────────────────────────────────────────────────────
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract the rest of the path after /api/proxy/
  const { path = [] } = req.query;
  const targetPath = Array.isArray(path) ? path.join("/") : path;
  const targetURL = `${BACKEND_ORIGIN}/${targetPath}`;
  console.log(path)
  try {
    // Clone headers but drop host & connection (node-fetch adds its own)
    const headers = new Headers(req.headers as any);
    headers.delete("host");
    headers.delete("connection");

    const backendResp = await fetch(targetURL, {
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      agent: insecureAgent,
    });

    // Pipe status & headers back
    res.status(backendResp.status);
    backendResp.headers.forEach((value, key) => res.setHeader(key, value));

    // Stream body
    const data = await backendResp.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (err: any) {
    console.error("Proxy error:", err);
    res
      .status(502)
      .json({
        error: "Bad gateway – could not contact backend",
        detail: err.message,
      });
  }
}

// Disable Next.js bodyParser so raw bodies (e.g., file uploads) work
export const config = {
  api: {
    bodyParser: false,
  },
};
