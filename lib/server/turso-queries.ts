/**
 * lib/server/turso-queries.ts
 * Comprehensive Turso LibSQL persistence layer for ToumAnina
 */

import type { InValue } from "@libsql/client";
import { getTursoClient } from "./turso";
import type {
  User,
  Patient,
  LocationRecord,
  MoodRecord,
  ActivityRecord,
  SafetyAlert,
  AuditLog,
  ActivityTemplate,
  ContentItem,
} from "./db";

// ════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════

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

export async function tursoUpdateUserProfile(
  userId: string,
  fields: {
    name?: string;
    phone?: string;
    patientExitPin?: string;
    activePatientId?: string;
    passwordHash?: string;
  }
): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    const sets: string[] = [];
    const args: InValue[] = [];
    if (fields.name !== undefined) { sets.push("name = ?"); args.push(fields.name); }
    if (fields.phone !== undefined) { sets.push("phone = ?"); args.push(fields.phone ?? null); }
    if (fields.patientExitPin !== undefined) { sets.push("patient_exit_pin = ?"); args.push(fields.patientExitPin); }
    if (fields.activePatientId !== undefined) { sets.push("active_patient_id = ?"); args.push(fields.activePatientId ?? null); }
    if (fields.passwordHash !== undefined) { sets.push("password_hash = ?"); args.push(fields.passwordHash); }
    if (sets.length === 0) return true;
    args.push(userId);
    await client.execute({ sql: `UPDATE users SET ${sets.join(", ")} WHERE id = ?`, args });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to update user profile:", err);
    return false;
  }
}

export async function tursoDeleteUser(userId: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
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

// ════════════════════════════════════════════════════════════
// LOCATIONS
// ════════════════════════════════════════════════════════════

function rowToLocation(row: Record<string, unknown>): LocationRecord {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    accuracy: row.accuracy as number,
    isInsideSafeZone: row.is_inside_safe_zone === 1,
    distanceFromHomeMeters: row.distance_from_home_meters as number,
    recordedAt: row.recorded_at as string,
    source: row.source as "patient_device" | "simulation" | "manual",
  };
}

export async function tursoGetLocations(patientId?: string, limit = 50): Promise<LocationRecord[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = patientId
      ? await client.execute({
          sql: "SELECT * FROM locations WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT ?",
          args: [patientId, limit],
        })
      : await client.execute({
          sql: "SELECT * FROM locations ORDER BY recorded_at DESC LIMIT ?",
          args: [limit],
        });
    return res.rows.map((r) => rowToLocation(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function tursoInsertLocation(loc: LocationRecord): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO locations (id, patient_id, latitude, longitude, accuracy, is_inside_safe_zone, distance_from_home_meters, recorded_at, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        loc.id,
        loc.patientId,
        loc.latitude,
        loc.longitude,
        loc.accuracy,
        loc.isInsideSafeZone ? 1 : 0,
        loc.distanceFromHomeMeters,
        loc.recordedAt,
        loc.source,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert location:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// MOODS
// ════════════════════════════════════════════════════════════

function rowToMood(row: Record<string, unknown>): MoodRecord {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    mood: row.mood as "very_good" | "good" | "neutral" | "difficult",
    notes: (row.notes as string) ?? undefined,
    recordedBy: row.recorded_by as "patient" | "caregiver",
    recordedAt: row.recorded_at as string,
  };
}

export async function tursoGetMoods(patientId?: string, limit = 50): Promise<MoodRecord[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = patientId
      ? await client.execute({
          sql: "SELECT * FROM moods WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT ?",
          args: [patientId, limit],
        })
      : await client.execute({
          sql: "SELECT * FROM moods ORDER BY recorded_at DESC LIMIT ?",
          args: [limit],
        });
    return res.rows.map((r) => rowToMood(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function tursoInsertMood(m: MoodRecord): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO moods (id, patient_id, mood, notes, recorded_by, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        m.id,
        m.patientId,
        m.mood,
        m.notes ?? null,
        m.recordedBy,
        m.recordedAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert mood:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// ACTIVITIES
// ════════════════════════════════════════════════════════════

function rowToActivity(row: Record<string, unknown>): ActivityRecord {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    activityType: row.activity_type as ActivityRecord["activityType"],
    score: row.score as number,
    turns: row.turns as number,
    durationSeconds: row.duration_seconds as number,
    completedAt: row.completed_at as string,
  };
}

export async function tursoGetActivities(patientId?: string, limit = 50): Promise<ActivityRecord[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = patientId
      ? await client.execute({
          sql: "SELECT * FROM activities WHERE patient_id = ? ORDER BY completed_at DESC LIMIT ?",
          args: [patientId, limit],
        })
      : await client.execute({
          sql: "SELECT * FROM activities ORDER BY completed_at DESC LIMIT ?",
          args: [limit],
        });
    return res.rows.map((r) => rowToActivity(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function tursoInsertActivity(act: ActivityRecord): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO activities (id, patient_id, activity_type, score, turns, duration_seconds, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        act.id,
        act.patientId,
        act.activityType,
        act.score,
        act.turns,
        act.durationSeconds,
        act.completedAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert activity:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// ALERTS
// ════════════════════════════════════════════════════════════

function rowToAlert(row: Record<string, unknown>): SafetyAlert {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    patientId: row.patient_id as string,
    patientName: row.patient_name as string,
    type: row.type as SafetyAlert["type"],
    title: row.title as string,
    description: row.description as string,
    latitude: (row.latitude as number) ?? undefined,
    longitude: (row.longitude as number) ?? undefined,
    severity: row.severity as SafetyAlert["severity"],
    isResolved: row.is_resolved === 1,
    resolvedAt: (row.resolved_at as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function tursoGetAlerts(familyId?: string, limit = 50): Promise<SafetyAlert[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = familyId
      ? await client.execute({
          sql: "SELECT * FROM alerts WHERE family_id = ? ORDER BY created_at DESC LIMIT ?",
          args: [familyId, limit],
        })
      : await client.execute({
          sql: "SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?",
          args: [limit],
        });
    return res.rows.map((r) => rowToAlert(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function tursoInsertAlert(alt: SafetyAlert): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO alerts (id, family_id, patient_id, patient_name, type, title, description, latitude, longitude, severity, is_resolved, resolved_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        alt.id,
        alt.familyId,
        alt.patientId,
        alt.patientName,
        alt.type,
        alt.title,
        alt.description,
        alt.latitude ?? null,
        alt.longitude ?? null,
        alt.severity,
        alt.isResolved ? 1 : 0,
        alt.resolvedAt ?? null,
        alt.createdAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert alert:", err);
    return false;
  }
}

export async function tursoResolveAlert(id: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: "UPDATE alerts SET is_resolved = 1, resolved_at = ? WHERE id = ?",
      args: [new Date().toISOString(), id],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to resolve alert:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// ACTIVITY TEMPLATES
// ════════════════════════════════════════════════════════════

function rowToActivityTemplate(row: Record<string, unknown>): ActivityTemplate {
  return {
    id: row.id as string,
    titleFr: row.title_fr as string,
    titleAr: row.title_ar as string,
    descriptionFr: row.description_fr as string,
    descriptionAr: row.description_ar as string,
    type: row.type as ActivityTemplate["type"],
    difficulty: row.difficulty as ActivityTemplate["difficulty"],
    durationMinutes: row.duration_minutes as number,
    isActive: row.is_active === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function tursoGetActivityTemplates(): Promise<ActivityTemplate[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = await client.execute("SELECT * FROM activity_templates ORDER BY created_at ASC");
    return res.rows.map((r) => rowToActivityTemplate(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function tursoInsertActivityTemplate(tpl: ActivityTemplate): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO activity_templates (id, title_fr, title_ar, description_fr, description_ar, type, difficulty, duration_minutes, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        tpl.id,
        tpl.titleFr,
        tpl.titleAr,
        tpl.descriptionFr,
        tpl.descriptionAr,
        tpl.type,
        tpl.difficulty,
        tpl.durationMinutes,
        tpl.isActive ? 1 : 0,
        tpl.createdAt,
        tpl.updatedAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert activity template:", err);
    return false;
  }
}

export async function tursoUpdateActivityTemplate(
  id: string,
  tpl: Partial<ActivityTemplate>
): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    const fields: string[] = [];
    const args: InValue[] = [];
    if (tpl.titleFr !== undefined) { fields.push("title_fr = ?"); args.push(tpl.titleFr); }
    if (tpl.titleAr !== undefined) { fields.push("title_ar = ?"); args.push(tpl.titleAr); }
    if (tpl.descriptionFr !== undefined) { fields.push("description_fr = ?"); args.push(tpl.descriptionFr); }
    if (tpl.descriptionAr !== undefined) { fields.push("description_ar = ?"); args.push(tpl.descriptionAr); }
    if (tpl.type !== undefined) { fields.push("type = ?"); args.push(tpl.type); }
    if (tpl.difficulty !== undefined) { fields.push("difficulty = ?"); args.push(tpl.difficulty); }
    if (tpl.durationMinutes !== undefined) { fields.push("duration_minutes = ?"); args.push(tpl.durationMinutes); }
    if (tpl.isActive !== undefined) { fields.push("is_active = ?"); args.push(tpl.isActive ? 1 : 0); }
    fields.push("updated_at = ?");
    args.push(new Date().toISOString());

    args.push(id);
    await client.execute({
      sql: `UPDATE activity_templates SET ${fields.join(", ")} WHERE id = ?`,
      args,
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to update activity template:", err);
    return false;
  }
}

export async function tursoDeleteActivityTemplate(id: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: "DELETE FROM activity_templates WHERE id = ?",
      args: [id],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to delete activity template:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// CONTENT ITEMS
// ════════════════════════════════════════════════════════════

function rowToContentItem(row: Record<string, unknown>): ContentItem {
  return {
    id: row.id as string,
    titleFr: row.title_fr as string,
    titleAr: row.title_ar as string,
    contentFr: row.content_fr as string,
    contentAr: row.content_ar as string,
    category: row.category as ContentItem["category"],
    isPublished: row.is_published === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function tursoGetContentItems(publishedOnly = false): Promise<ContentItem[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = publishedOnly
      ? await client.execute("SELECT * FROM content_items WHERE is_published = 1 ORDER BY created_at DESC")
      : await client.execute("SELECT * FROM content_items ORDER BY created_at DESC");
    return res.rows.map((r) => rowToContentItem(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function tursoInsertContentItem(item: ContentItem): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: `INSERT INTO content_items (id, title_fr, title_ar, content_fr, content_ar, category, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.titleFr,
        item.titleAr,
        item.contentFr,
        item.contentAr,
        item.category,
        item.isPublished ? 1 : 0,
        item.createdAt,
        item.updatedAt,
      ],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to insert content item:", err);
    return false;
  }
}

export async function tursoUpdateContentItem(
  id: string,
  item: Partial<ContentItem>
): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    const fields: string[] = [];
    const args: InValue[] = [];
    if (item.titleFr !== undefined) { fields.push("title_fr = ?"); args.push(item.titleFr); }
    if (item.titleAr !== undefined) { fields.push("title_ar = ?"); args.push(item.titleAr); }
    if (item.contentFr !== undefined) { fields.push("content_fr = ?"); args.push(item.contentFr); }
    if (item.contentAr !== undefined) { fields.push("content_ar = ?"); args.push(item.contentAr); }
    if (item.category !== undefined) { fields.push("category = ?"); args.push(item.category); }
    if (item.isPublished !== undefined) { fields.push("is_published = ?"); args.push(item.isPublished ? 1 : 0); }
    fields.push("updated_at = ?");
    args.push(new Date().toISOString());

    args.push(id);
    await client.execute({
      sql: `UPDATE content_items SET ${fields.join(", ")} WHERE id = ?`,
      args,
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to update content item:", err);
    return false;
  }
}

export async function tursoDeleteContentItem(id: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;
  try {
    await client.execute({
      sql: "DELETE FROM content_items WHERE id = ?",
      args: [id],
    });
    return true;
  } catch (err) {
    console.error("[Turso] Failed to delete content item:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// AUDIT LOGS
// ════════════════════════════════════════════════════════════

function rowToAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? undefined,
    userEmail: (row.user_email as string) ?? undefined,
    action: row.action as string,
    details: row.details as string,
    ip: (row.ip as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function tursoGetAuditLogs(limit = 100): Promise<AuditLog[]> {
  const client = getTursoClient();
  if (!client) return [];
  try {
    const res = await client.execute({
      sql: "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?",
      args: [limit],
    });
    return res.rows.map((r) => rowToAuditLog(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

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
