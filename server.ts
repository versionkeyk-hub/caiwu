import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Local Finance API Store for development
  let localServerMemoryStore: Record<string, any> = {};

  app.get("/api/finance", (req, res) => {
    const email = ((req.query.email as string) || "version.keyk@gmail.com").toLowerCase();
    const stored = localServerMemoryStore[email];
    if (stored) {
      return res.json({ success: true, data: stored.data, updatedAt: stored.updatedAt });
    }
    return res.json({ success: false, data: null });
  });

  app.post("/api/finance", (req, res) => {
    const email = (req.body?.userProfile?.email || "version.keyk@gmail.com").toLowerCase();
    localServerMemoryStore[email] = {
      data: req.body,
      updatedAt: new Date().toISOString(),
    };
    return res.json({ success: true, message: "本地服务已记录保存" });
  });

  // Cloudflare D1 Proxy API (Optional for direct server-side sync)
  app.post("/api/d1-sync", async (req, res) => {
    try {
      const { payload } = req.body;
      const accountId = "427e05a6576690e561ef1009167be985";
      const databaseId = "8bf1090d-7bcb-4a80-b243-9f1968c84e37";
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;
      if (!apiToken) {
        return res.status(400).json({ error: "Missing CLOUDFLARE_API_TOKEN in environment" });
      }

      const jsonStr = typeof payload === "string" ? payload : JSON.stringify(payload);

      const d1Res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sql: `INSERT INTO finance_state (id, user_name, user_avatar, data_json, updated_at)
                  VALUES (?, ?, ?, ?, datetime('now'))
                  ON CONFLICT(id) DO UPDATE SET 
                    user_name=excluded.user_name,
                    user_avatar=excluded.user_avatar,
                    data_json=excluded.data_json,
                    updated_at=datetime('now');`,
            params: ["primary_state", "理财官", "", jsonStr],
          }),
        }
      );

      const data = await d1Res.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to sync to D1" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
