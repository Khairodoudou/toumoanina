/**
 * Turso Database Setup & Seeding Script
 * Usage:
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/setup-turso.js
 */

const { createClient } = require("@libsql/client/web");
const fs = require("fs");
const path = require("path");

// Load .env or .env.local if present
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Erreur : TURSO_DATABASE_URL et TURSO_AUTH_TOKEN doivent être définis.");
  console.log("👉 Exemple :");
  console.log("   TURSO_DATABASE_URL=\"libsql://toumoanina-db-kheireddine23.aws-eu-west-1.turso.io\"");
  console.log("   TURSO_AUTH_TOKEN=\"votre_token_ici\"");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function setup() {
  console.log("🚀 Connexion à Turso:", url);

  console.log("📦 1. Création des tables...");
  await client.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      patient_exit_pin TEXT DEFAULT '1234',
      active_patient_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      blood_type TEXT,
      emergency_phone TEXT NOT NULL,
      photo_url TEXT,
      daily_habits TEXT,
      diet_preferences TEXT,
      medical_notes TEXT,
      safe_latitude REAL NOT NULL,
      safe_longitude REAL NOT NULL,
      safe_radius_meters REAL NOT NULL,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL NOT NULL,
      is_inside_safe_zone INTEGER NOT NULL,
      distance_from_home_meters REAL NOT NULL,
      recorded_at TEXT NOT NULL,
      source TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS moods (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      mood TEXT NOT NULL,
      notes TEXT,
      recorded_by TEXT NOT NULL,
      recorded_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      score REAL NOT NULL,
      turns INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      family_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      severity TEXT NOT NULL,
      is_resolved INTEGER NOT NULL,
      resolved_at TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS activity_templates (
      id TEXT PRIMARY KEY,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_fr TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      content_fr TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      category TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
  ], "write");

  console.log("🌱 2. Insertion des données initiales (Comptes démo & Modèles)...");

  // Hash helper
  const hash = (pwd) => Buffer.from(`toumoanina_salt_${pwd}`).toString("base64");

  // Demo users
  await client.execute({
    sql: `INSERT OR REPLACE INTO users (id, name, email, phone, role, password_hash, patient_exit_pin, active_patient_id, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "usr_family_demo",
      "Famille Benali",
      "famille.demo@toumoanina.app",
      "+213 549 18 19 11",
      "family",
      hash("Famille123!"),
      "1234",
      "pat_mohammed_1",
      1,
      new Date().toISOString(),
    ],
  });

  await client.execute({
    sql: `INSERT OR REPLACE INTO users (id, name, email, phone, role, password_hash, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "usr_admin_demo",
      "Administrateur ToumAnina",
      "admin@gmail.com",
      "+213 550 00 00 00",
      "admin",
      hash("123456789"),
      1,
      new Date().toISOString(),
    ],
  });

  // Patient 1
  await client.execute({
    sql: `INSERT OR REPLACE INTO patients (id, family_id, name, birth_date, blood_type, emergency_phone, photo_url, daily_habits, diet_preferences, medical_notes, safe_latitude, safe_longitude, safe_radius_meters, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "pat_mohammed_1",
      "usr_family_demo",
      "Mohammed Benali",
      "1948-04-15",
      "O+",
      "+213 549 18 19 11",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      "Prend son thé à la menthe à 16h au jardin. Promenade habituelle le matin vers 10h.",
      "Régime peu salé. Aime les dattes et le thé léger. Allergique aux arachides.",
      "Stade modéré Alzheimer. Traitement quotidien à prendre à 8h et 20h. Très sensible aux bruits forts.",
      36.7538,
      3.0588,
      600,
      new Date().toISOString(),
    ],
  });

  console.log("✅ Base de données Turso initialisée avec succès !");
}

setup().catch((e) => {
  console.error("❌ Erreur lors de l'initialisation :", e);
  process.exit(1);
});
