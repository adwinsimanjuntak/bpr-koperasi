/**
 * Runs `prisma generate` with TLS verification relaxed for this process only.
 * Corporate proxies that MITM HTTPS often break Prisma engine downloads.
 * Retries a few times on Windows EPERM when antivirus locks the query engine DLL.
 * Set PRISMA_STRICT_TLS=1 to keep default TLS verification.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");

const strict = process.env.PRISMA_STRICT_TLS === "1";
const env = {
  ...process.env,
  ...(strict ? {} : { NODE_TLS_REJECT_UNAUTHORIZED: "0" }),
};

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* wait */
  }
}

const maxAttempts = Number(process.env.PRISMA_GENERATE_RETRIES || 4);

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const result = spawnSync(process.execPath, [prismaCli, "generate"], {
    cwd: root,
    stdio: "inherit",
    env,
  });
  const code = result.status === null ? 1 : result.status;
  if (code === 0) process.exit(0);
  if (attempt < maxAttempts) {
    console.warn(`\nprisma generate failed (attempt ${attempt}/${maxAttempts}), retrying in 2s…\n`);
    sleepSync(2000);
  }
}

process.exit(1);
