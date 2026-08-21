/**
 * lib/server/turso-queries.ts
 * Helper functions to read/write directly to Turso LibSQL.
 * Falls back gracefully if client is unavailable.
 */

import { getTursoClient } from "./turso";
import type { User } from "./db";

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
    const args: unknown[] = [];
    if (fields.name !== undefined) { sets.push("name = ?"); args.push(fields.name); }
    if (fields.phone !== undefined) { sets.push("phone = ?"); args.push(fields.phone); }
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
      await client.batch([
        { sql: `DELETE FROM locations WHERE patient_id IN (${placeholders})`, args: patientIds },
        { sql: `DELETE FROM moods WHERE patient_id IN (${placeholders})`, args: patientIds },
        { sql: `DELETE FROM activities WHERE patient_id IN (${placeholders})`, args: patientIds },
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
