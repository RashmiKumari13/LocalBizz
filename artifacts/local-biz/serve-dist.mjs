import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "dist", "public");
const port = 4173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function safePathname(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const resolved = path.resolve(root, clean || "index.html");
  return resolved.startsWith(root) ? resolved : path.join(root, "index.html");
}

const server = http.createServer((req, res) => {
  const filePath = safePathname(req.url || "/");
  const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  const targetPath = exists ? filePath : path.join(root, "index.html");
  const ext = path.extname(targetPath).toLowerCase();
  const mime = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(targetPath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static site served on http://localhost:${port}`);
});
