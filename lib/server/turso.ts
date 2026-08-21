import { createClient, type Client } from "@libsql/client/web";

let client: Client | null = null;

export function getTursoClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return null;
  }

  if (!client) {
    client = createClient({
      url,
      authToken,
    });
  }

  return client;
}

export async function initTursoSchema() {
  const turso = getTursoClient();
  if (!turso) return false;

  try {
    await turso.batch(
      [
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
      ],
      "write"
    );

    return true;
  } catch (error) {
    console.error("Error initializing Turso schema:", error);
    return false;
  }
}
