/**
 * lib/server/turso-queries.ts
 * Helper functions to read/write directly to Turso LibSQL.
 * Falls back gracefully if client is unavailable.
 */

import type { InValue } from "@libsql/client";
import { getTursoClient } from "./turso";
import type { User, Patient } from "./db";

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    role: row.role as "family" | "admin",
    passwordHash: row.password_hash as string,
    patientExitPin: (row.patient_exit_pin as string) ?? "1234",
    activePatientId: (row.active_patient_id as string) ?? undefined,
    isActive: row.is_active === 0 ? false : true,
    createdAt: row.created_at as string,
  };
}

// ── Find user by email ──────────────────────────────────────────────────────
export async function tursoFindUserByEmail(email: string): Promise<User | null> {
  const client = getTursoClient();
  if (!client) return null;
  try {
    const result = await client.execute({
      sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      args: [email],
    });
    if (result.rows.length === 0) return null;
    return rowToUser(result.rows[0] as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ── Find user by id ─────────────────────────────────────────────────────────
export async function tursoFindUserById(id: string): Promise<User | null> {
  const client = getTursoClient();
  if (!client) return null;
  try {
    const result = await client.execute({
      sql: "SELECT * FROM users WHERE id = ? LIMIT 1",
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return rowToUser(result.rows[0] as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ── Insert new user ─────────────────────────────────────────────────────────
export async function tursoInsertUser(user: User): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO users (id, name, email, phone, role, password_hash, patient_exit_pin, active_patient_id, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.id,
        user.name,
        user.email,
        user.phone ?? null,
        user.role,
        user.passwordHash,
        user.patientExitPin ?? "1234",
        user.activePatientId ?? null,
        user.isActive === false ? 0 : 1,
        user.createdAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert user:", err);
    return false;
  }
}

// ── Audit log ───────────────────────────────────────────────────────────────
export async function tursoInsertLog(entry: {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  createdAt: string;
}): Promise<void> {
  const client = getTursoClient();
  if (!client) return;
  try {
    await client.execute({
      sql: `INSERT INTO audit_logs (id, user_id, user_email, action, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        entry.id,
        entry.userId ?? null,
        entry.userEmail ?? null,
        entry.action,
        entry.details,
        entry.createdAt,
      ],
    });
  } catch (err) {
    console.error("[Turso] Failed to insert audit log:", err);
  }
}

// ── Get all users (admin) ───────────────────────────────────────────────────
export async function tursoGetAllUsers(): Promise<User[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const result = await client.execute("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows.map((r) => rowToUser(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

// ── Update user fields (admin PATCH) ────────────────────────────────────────
export async function tursoUpdateUser(
  userId: string,
  fields: { name?: string; phone?: string; isActive?: boolean; role?: string }
): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    const sets: string[] = [];
    const args: InValue[] = [];
    if (fields.name !== undefined) { sets.push("name = ?"); args.push(fields.name); }
    if (fields.phone !== undefined) { sets.push("phone = ?"); args.push(fields.phone ?? null); }
    if (fields.isActive !== undefined) { sets.push("is_active = ?"); args.push(fields.isActive ? 1 : 0); }
    if (fields.role !== undefined) { sets.push("role = ?"); args.push(fields.role); }
    if (sets.length === 0) return true;
    args.push(userId);
    await client.execute({ sql: `UPDATE users SET ${sets.join(", ")} WHERE id = ?`, args });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to update user:", err);
    return false;
  }
}

// ── Delete user and cascade (admin DELETE) ──────────────────────────────────
export async function tursoDeleteUser(userId: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    // Get patient IDs for this user
    const patientsRes = await client.execute({
      sql: "SELECT id FROM patients WHERE family_id = ?",
      args: [userId],
    });
    const patientIds = patientsRes.rows.map((r) => r.id as string);

    if (patientIds.length > 0) {
      const placeholders = patientIds.map(() => "?").join(",");
      const pids: InValue[] = patientIds;
      await client.batch([
        { sql: `DELETE FROM locations WHERE patient_id IN (${placeholders})`, args: pids },
        { sql: `DELETE FROM moods WHERE patient_id IN (${placeholders})`, args: pids },
        { sql: `DELETE FROM activities WHERE patient_id IN (${placeholders})`, args: pids },
      ], "write");
    }

    await client.batch([
      { sql: "DELETE FROM patients WHERE family_id = ?", args: [userId] },
      { sql: "DELETE FROM alerts WHERE family_id = ?", args: [userId] },
      { sql: "DELETE FROM users WHERE id = ?", args: [userId] },
    ], "write");

    return true;
  } catch (err) {
    console.error("[Turso] Failed to delete user:", err);
    return false;
  }
}

// ── Count patients for a user ───────────────────────────────────────────────
export async function tursoCountPatients(userId: string): Promise<number> {
  const client = getTursoClient();
  if (!client) return 0;
  try {
    const res = await client.execute({
      sql: "SELECT COUNT(*) as cnt FROM patients WHERE family_id = ?",
      args: [userId],
    });
    return (res.rows[0].cnt as number) ?? 0;
  } catch {
    return 0;
  }
}
// ════════════════════════════════════════════════════════════
// PATIENTS
// ════════════════════════════════════════════════════════════

function rowToPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    name: row.name as string,
    birthDate: row.birth_date as string,
    bloodType: (row.blood_type as string) ?? undefined,
    emergencyPhone: row.emergency_phone as string,
    photoUrl: (row.photo_url as string) ?? undefined,
    dailyHabits: (row.daily_habits as string) ?? undefined,
    dietPreferences: (row.diet_preferences as string) ?? undefined,
    medicalNotes: (row.medical_notes as string) ?? undefined,
    safeLatitude: row.safe_latitude as number,
    safeLongitude: row.safe_longitude as number,
    safeRadiusMeters: row.safe_radius_meters as number,
    createdAt: row.created_at as string,
  };
}

// ── Get all patients for a family ───────────────────────────────────────────
export async function tursoGetPatientsByFamily(familyId: string): Promise<Patient[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = await client.execute({
      sql: "SELECT * FROM patients WHERE family_id = ? ORDER BY created_at DESC",
      args: [familyId],
    });
    return res.rows.map((r) => rowToPatient(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

// ── Get all patients (admin) ─────────────────────────────────────────────────
export async function tursoGetAllPatients(): Promise<Patient[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = await client.execute("SELECT * FROM patients ORDER BY created_at DESC");
    return res.rows.map((r) => rowToPatient(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

// ── Find patient by id ───────────────────────────────────────────────────────
export async function tursoFindPatientById(id: string): Promise<Patient | null> {
  const client = getTursoClient();
  if (!client) return null;
  try {
    const res = await client.execute({
      sql: "SELECT * FROM patients WHERE id = ? LIMIT 1",
      args: [id],
    });
    if (res.rows.length === 0) return null;
    return rowToPatient(res.rows[0] as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ── Insert new patient ───────────────────────────────────────────────────────
export async function tursoInsertPatient(p: Patient): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO patients
        (id, family_id, name, birth_date, blood_type, emergency_phone, photo_url,
         daily_habits, diet_preferences, medical_notes,
         safe_latitude, safe_longitude, safe_radius_meters, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        p.id, p.familyId, p.name, p.birthDate,
        p.bloodType ?? null, p.emergencyPhone, p.photoUrl ?? null,
        p.dailyHabits ?? null, p.dietPreferences ?? null, p.medicalNotes ?? null,
        p.safeLatitude, p.safeLongitude, p.safeRadiusMeters, p.createdAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert patient:", err);
    return false;
  }
}

// ── Update patient ───────────────────────────────────────────────────────────
export async function tursoUpdatePatient(
  id: string,
  body: Partial<Patient>
): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    const fields: string[] = [];
    const args: InValue[] = [];
    const map: Record<string, InValue | null> = {
      name: body.name ?? null,
      birth_date: body.birthDate ?? null,
      blood_type: body.bloodType ?? null,
      emergency_phone: body.emergencyPhone ?? null,
      photo_url: body.photoUrl ?? null,
      daily_habits: body.dailyHabits ?? null,
      diet_preferences: body.dietPreferences ?? null,
      medical_notes: body.medicalNotes ?? null,
      safe_latitude: body.safeLatitude ?? null,
      safe_longitude: body.safeLongitude ?? null,
      safe_radius_meters: body.safeRadiusMeters ?? null,
    };
    for (const [col, val] of Object.entries(map)) {
      if (val !== null && val !== undefined) {
        fields.push(`${col} = ?`);
        args.push(val);
      }
    }
    if (fields.length === 0) return true;
    args.push(id);
    await client.execute({
      sql: `UPDATE patients SET ${fields.join(", ")} WHERE id = ?`,
      args,
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to update patient:", err);
    return false;
  }
}

// ── Delete patient (cascade locations/moods/activities) ──────────────────────
export async function tursoDeletePatient(id: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.batch([
      { sql: "DELETE FROM locations WHERE patient_id = ?", args: [id] },
      { sql: "DELETE FROM moods WHERE patient_id = ?", args: [id] },
      { sql: "DELETE FROM activities WHERE patient_id = ?", args: [id] },
      { sql: "DELETE FROM patients WHERE id = ?", args: [id] },
    ], "write");
    return true;
  } catch (err) {
    console.error("[Turso] Failed to delete patient:", err);
    return false;
  }
}

// ── Set active patient on user ───────────────────────────────────────────────
export async function tursoSetActivePatient(userId: string, patientId: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;
  try {
    await client.execute({
      sql: "UPDATE users SET active_patient_id = ? WHERE id = ?",
      args: [patientId, userId],
    });
  } catch (err) {
    console.error("[Turso] Failed to set active patient:", err);
  }
}
