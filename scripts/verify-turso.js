/**
 * scripts/verify-turso.js
 * Verify Turso connection and list all tables + row counts
 */

const { createClient } = require("@libsql/client/web");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[match[1]]) process.env[match[1]] = val;
      }
    }
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN manquant dans .env.local");
  process.exit(1);
}

const EXPECTED_TABLES = [
  "users",
  "patients",
  "locations",
  "moods",
  "activities",
  "alerts",
  "audit_logs",
  "activity_templates",
  "content_items",
];

async function verify() {
  console.log("\n══════════════════════════════════════════════");
  console.log("   🔍 Vérification Turso — ToumAnina DB");
  console.log("══════════════════════════════════════════════\n");

  const client = createClient({ url, authToken });

  // 1. Test connection
  try {
    await client.execute("SELECT 1");
    console.log("✅ Connexion à Turso : OK");
    console.log(`   📡 URL : ${url}\n`);
  } catch (e) {
    console.error("❌ Connexion échouée :", e.message);
    process.exit(1);
  }

  // 2. Get existing tables
  const tablesResult = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  const existingTables = tablesResult.rows.map((r) => r.name);

  console.log("📦 Tables dans la base de données :\n");

  let allGood = true;
  for (const table of EXPECTED_TABLES) {
    const exists = existingTables.includes(table);
    if (!exists) {
      console.log(`   ❌  ${table.padEnd(22)} — MANQUANTE`);
      allGood = false;
    } else {
      // Count rows
      try {
        const countResult = await client.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
        const count = countResult.rows[0].cnt;
        const icon = count > 0 ? "✅" : "🟡";
        console.log(`   ${icon}  ${table.padEnd(22)} — ${count} enregistrement(s)`);
      } catch {
        console.log(`   ⚠️  ${table.padEnd(22)} — Erreur de lecture`);
      }
    }
  }

  // 3. Check for unexpected tables
  const unexpected = existingTables.filter((t) => !EXPECTED_TABLES.includes(t));
  if (unexpected.length > 0) {
    console.log(`\n   ℹ️  Tables supplémentaires : ${unexpected.join(", ")}`);
  }

  console.log("\n══════════════════════════════════════════════");
  if (allGood) {
    console.log("🎉 RÉSULTAT : Tout est en ordre ! La base Turso est complète.");
  } else {
    console.log("⚠️  RÉSULTAT : Certaines tables manquent. Lancez : npm run db:setup");
  }
  console.log("══════════════════════════════════════════════\n");

  // 4. Show users table preview
  try {
    const users = await client.execute("SELECT id, name, email, role, created_at FROM users");
    if (users.rows.length > 0) {
      console.log("👥 Utilisateurs enregistrés dans Turso :\n");
      for (const u of users.rows) {
        console.log(`   • [${u.role}] ${u.name} — ${u.email}`);
      }
      console.log("");
    }
  } catch {}
}

verify().catch((e) => {
  console.error("Erreur :", e);
  process.exit(1);
});
