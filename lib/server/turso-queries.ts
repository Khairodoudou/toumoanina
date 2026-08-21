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
