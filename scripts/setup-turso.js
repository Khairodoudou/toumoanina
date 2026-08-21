/**
 * Turso Database Setup & Seeding Script
 * Usage:
 *   node scripts/setup-turso.js
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

  console.log("🌱 2. Insertion des données initiales...");

  const hash = (pwd) => Buffer.from(`toumoanina_salt_${pwd}`).toString("base64");
  const now = new Date().toISOString();

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
      now,
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
      now,
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
      now,
    ],
  });

  // Activity Templates
  const templates = [
    {
      id: "tpl_1",
      titleFr: "Jeu des paires de mémoire",
      titleAr: "لعبة أزواج الذاكرة",
      descriptionFr: "Retrouvez les paires de cartes pour stimuler la mémoire visuelle et l'attention.",
      descriptionAr: "العثور على أزواج البطاقات المتطابقة لتحفيز الذاكرة البصرية والانتباه.",
      type: "memory_pairs",
      difficulty: "easy",
      durationMinutes: 5,
    },
    {
      id: "tpl_2",
      titleFr: "Reconnaissance de photos et souvenirs",
      titleAr: "التعرف على الصور والذكريات",
      descriptionFr: "Identifiez des objets, animaux et éléments familiers du quotidien.",
      descriptionAr: "التعرف على الأشياء والحيوانات والمشاهد اليومية لترسيخ الذاكرة.",
      type: "photo_memory",
      difficulty: "easy",
      durationMinutes: 5,
    },
    {
      id: "tpl_3",
      titleFr: "Suite de chiffres",
      titleAr: "تسلسل الأرقام",
      descriptionFr: "Mémorisez puis reproduisez une suite de chiffres simples.",
      descriptionAr: "احفظ تسلسل الأرقام وأعِد إدخالها بالترتيب الصحيح لتدريب التركيز.",
      type: "number_sequence",
      difficulty: "medium",
      durationMinutes: 8,
    },
    {
      id: "tpl_4",
      titleFr: "Quiz de couleurs et réflexes",
      titleAr: "اختبار الألوان والتركيز",
      descriptionFr: "Identifiez rapidement la couleur affichée pour stimuler les réflexes cognitifs.",
      descriptionAr: "تعرّف بسرعة على اللون المعروض لتحفيز الانتباه وسرعة الاستجابة.",
      type: "color_quiz",
      difficulty: "easy",
      durationMinutes: 5,
    },
    {
      id: "tpl_5",
      titleFr: "Calcul mental facile",
      titleAr: "الحساب الذهني البسيط",
      descriptionFr: "Résolvez des opérations simples de la vie quotidienne (+ et -).",
      descriptionAr: "حل عمليات جمع وطرح يومية بسيطة لتحفيز التفكير المنطقي.",
      type: "math_easy",
      difficulty: "easy",
      durationMinutes: 5,
    },
    {
      id: "tpl_6",
      titleFr: "Association d'objets du quotidien",
      titleAr: "مطابقة الأشياء المترابطة",
      descriptionFr: "Associez chaque objet à son usage ou son partenaire habituel.",
      descriptionAr: "اربط كل شيء بما يناسبه في الحياة اليومية (مثل: شاي 🫖 براد).",
      type: "word_match",
      difficulty: "easy",
      durationMinutes: 5,
    },
  ];

  for (const t of templates) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO activity_templates (id, title_fr, title_ar, description_fr, description_ar, type, difficulty, duration_minutes, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [t.id, t.titleFr, t.titleAr, t.descriptionFr, t.descriptionAr, t.type, t.difficulty, t.durationMinutes, 1, now, now],
    });
  }

  // Content Items
  const content = [
    {
      id: "cnt_1",
      titleFr: "Comprendre la maladie d'Alzheimer",
      titleAr: "فهم مرض الزهايمر",
      contentFr: "L'Alzheimer est une maladie neurodégénérative qui affecte la mémoire, le raisonnement et le comportement. Une prise en charge précoce améliore significativement la qualité de vie.",
      contentAr: "مرض الزهايمر هو مرض تنكسي عصبي يؤثر على الذاكرة والتفكير والسلوك. التدخل المبكر يحسّن بشكل ملحوظ من جودة الحياة.",
      category: "advice",
      isPublished: 1,
    },
    {
      id: "cnt_2",
      titleFr: "Exercices de stimulation cognitive",
      titleAr: "تمارين التحفيز المعرفي",
      contentFr: "Des exercices réguliers comme les jeux de mémoire, la lecture et les activités créatives aident à ralentir le déclin cognitif et maintenir l'autonomie.",
      contentAr: "التمارين المنتظمة كألعاب الذاكرة والقراءة والأنشطة الإبداعية تساعد في إبطاء التراجع المعرفي والحفاظ على الاستقلالية.",
      category: "exercise",
      isPublished: 1,
    },
    {
      id: "cnt_3",
      titleFr: "Alimentation et mémoire",
      titleAr: "التغذية والذاكرة",
      contentFr: "Un régime méditerranéen riche en oméga-3, antioxydants et légumes verts est associé à un meilleur maintien des fonctions cognitives chez les personnes âgées.",
      contentAr: "النظام الغذائي المتوسطي الغني بأوميغا-3 ومضادات الأكسدة والخضروات الورقية مرتبط بحفاظ أفضل على الوظائف المعرفية لدى كبار السن.",
      category: "nutrition",
      isPublished: 1,
    },
  ];

  for (const c of content) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO content_items (id, title_fr, title_ar, content_fr, content_ar, category, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.titleFr, c.titleAr, c.contentFr, c.contentAr, c.category, c.isPublished, now, now],
    });
  }

  console.log("✅ Base de données Turso initialisée avec succès !");
}

setup().catch((e) => {
  console.error("❌ Erreur lors de l'initialisation :", e);
  process.exit(1);
});
